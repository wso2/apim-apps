/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import MCPServer from 'AppData/MCPServer';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import { getSampleMCPServerData, getSampleOpenAPI } from 'AppData/SamplePizzaShack';
import AuthManager from 'AppData/AuthManager';
import { 
    MCP_SERVER_SCOPES, 
    isRestrictedForScopes, 
    markTasksAsCompletedWithError, 
    getInternalGateways, 
    buildDeploymentPayload, 
    convertOpenAPIToFile 
} from './components/MCPServerUtils';
import MCPServerDeploymentModal from './components/MCPServerDeploymentModal';

const initialTaskStates = {
    create: { inProgress: true, completed: false, pending: false, errors: false },
    revision: { inProgress: false, completed: false, pending: false, errors: false },
    deploy: { inProgress: false, completed: false, pending: false, errors: false },
    publish: { inProgress: false, completed: false, pending: false, errors: false },
};

const tasksReducer = (state, action) => {
    const { name, status } = action;
    if (name === 'reset') {
        return initialTaskStates;
    }
    // In the case of a key collision, the right-most (last) object's value wins out
    return { ...state, [name]: { ...state[name], ...status } };
};

/**
 * Handle deploying a sample MCP Server (Create, Deploy and Publish)
 *
 * @class SampleMCPServer
 * @extends {Component}
 */

const SampleMCPServer = (props) => {
    const { dense } = props;
    const [tasksStatus, tasksStatusDispatcher] = useReducer(tasksReducer, initialTaskStates);
    const [showStatus, setShowStatus] = useState(false);
    const [newSampleMCPServer, setNewSampleMCPServer] = useState();

    const { data: publisherSettings, isLoading } = usePublisherSettings();
    
    const taskManager = async (promisedTask, name) => {
        tasksStatusDispatcher({ name, status: { inProgress: true } });
        let taskResult;
        try {
            taskResult = await promisedTask;
        } catch (errors) {
            console.error(errors);
            tasksStatusDispatcher({ name, status: { errors } });
            throw errors;
        }
        tasksStatusDispatcher({ name, status: { inProgress: false, completed: true } });
        if (taskResult.body?.[0]?.status === 'CREATED') {
            tasksStatusDispatcher({ name, status: { pending: true} });
        }

        return taskResult;
    };

    /**
     * Handle onClick event for `Deploy Sample MCP Server` Button
     * @memberof SampleMCPServer
     */
    const handleDeploySample = async () => {
        const { defaultAdvancePolicy, defaultSubscriptionPolicy } = publisherSettings;
        const internalGateways = getInternalGateways(publisherSettings);

        setShowStatus(true);

        // Get sample MCP Server data and OpenAPI definition
        const sampleMCPServerData = getSampleMCPServerData(defaultAdvancePolicy || 'Unlimited',
            defaultSubscriptionPolicy || 'Unlimited');
        const sampleOpenAPIDefinition = getSampleOpenAPI(defaultSubscriptionPolicy || 'Unlimited');
        
        // Convert OpenAPI definition to File object for binary upload
        const openAPIFile = convertOpenAPIToFile(sampleOpenAPIDefinition);
        
        // Check scopes for MCP Server creation
        if (isRestrictedForScopes(MCP_SERVER_SCOPES.CREATE_MANAGE)) {
            // Mark all tasks as completed with permission error and skip the flow
            markTasksAsCompletedWithError(
                tasksStatusDispatcher, 
                ['revision', 'deploy', 'publish'], 
                'Skipped due to insufficient permissions'
            );
            return;
        }
        
        // Create the sample MCP Server with OpenAPI definition -- Single API call
        const sampleMCPServerObj = new MCPServer(sampleMCPServerData);
        const sampleMCPServer = await taskManager(
            sampleMCPServerObj.createMCPServerUsingOpenAPIFile(openAPIFile), 
            'create'
        );
        setNewSampleMCPServer(sampleMCPServer);
        if (!sampleMCPServer) {
            throw new Error('Error while creating sample MCP Server');
        }

        const revisionPayload = {
            description: 'Initial Revision',
        };

        // Check scopes for 2nd API call (Create Revision)
        if (isRestrictedForScopes(MCP_SERVER_SCOPES.CREATE_MANAGE_PUBLISH_IMPORT)) {
            // Mark remaining tasks as completed with permission error and skip the flow
            markTasksAsCompletedWithError(
                tasksStatusDispatcher, 
                ['deploy', 'publish'], 
                'Skipped due to insufficient permissions'
            );
            return;
        }

        // Create a revision of sample MCP Server -- 2nd API call
        const sampleMCPServerRevision = await taskManager(
            MCPServer.createRevision(sampleMCPServer.id, revisionPayload),
            'revision',
        );
        const deployRevisionPayload = buildDeploymentPayload(internalGateways);
        const revisionId = sampleMCPServerRevision.body.id;

        // Check scopes for 3rd API call (Deploy Revision)
        if (isRestrictedForScopes(MCP_SERVER_SCOPES.CREATE_MANAGE_PUBLISH)) {
            // Mark remaining task as completed with permission error and skip the flow
            markTasksAsCompletedWithError(
                tasksStatusDispatcher, 
                ['publish'], 
                'Skipped due to insufficient permissions'
            );
            return;
        }

        // Deploy a revision of sample MCP Server -- 3rd API call
        await taskManager(MCPServer.deployRevision(sampleMCPServer.id,
            revisionId, deployRevisionPayload), 'deploy');

        // Check scopes for 4th API call (Publish MCP Server)
        if (isRestrictedForScopes(MCP_SERVER_SCOPES.PUBLISH_MANAGE_IMPORT)) {
            // Mark the last task as completed with permission error
            markTasksAsCompletedWithError(
                tasksStatusDispatcher, 
                ['publish'], 
                'Skipped due to insufficient permissions'
            );
            return;
        }

        // Publish the sample MCP Server -- 4th API call
        await taskManager(MCPServer.updateLcState(sampleMCPServer.id, 'Publish'), 'publish');
    };

    const allDone = !AuthManager.isNotPublisher() ? Object.values(tasksStatus)
        .map((tasks) => tasks.completed)
        .reduce((done, current) => current && done) : (tasksStatus.create.completed && newSampleMCPServer);
    const anyErrors = Object.values(tasksStatus).map((tasks) => tasks.errors).find((error) => error !== false);
    if (allDone && !anyErrors) {
        const url = '/mcp-servers/' + newSampleMCPServer.id + '/overview';
        return <Redirect to={url} />;
    }
    return (
        <>
            <LandingMenuItem
                dense={dense}
                id='itest-id-deploy-sample-mcp'
                onClick={handleDeploySample}
                disabled={!publisherSettings || isLoading}
                component='button'
                helperText={
                    <FormattedMessage
                        id='MCPServers.Listing.SampleMCPServer.SampleMCPServer.sample.content'
                        defaultMessage='Sample MCP Server'
                    />
                }
            >
                <FormattedMessage
                    id='MCPServers.Listing.SampleMCPServer.SampleMCPServer.sample.title'
                    defaultMessage='Deploy Sample MCP Server'
                />
            </LandingMenuItem>
            <MCPServerDeploymentModal
                open={showStatus}
                tasksStatus={tasksStatus}
                onClose={() => {
                    setShowStatus(false);
                    tasksStatusDispatcher({ name: 'reset' });
                }}
                newMCPServer={newSampleMCPServer}
            />
        </>
    );
};

SampleMCPServer.propTypes = {
    dense: PropTypes.bool.isRequired,
};

export default SampleMCPServer;
