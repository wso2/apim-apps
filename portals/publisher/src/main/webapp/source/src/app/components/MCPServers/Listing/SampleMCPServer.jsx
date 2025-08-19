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
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { FormattedMessage } from 'react-intl';
import MCPServer from 'AppData/MCPServer';
import AuthManager from 'AppData/AuthManager';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import TaskState from 'AppComponents/Apis/Listing/SampleAPI/components/TaskState';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { getSampleMCPServerData, getSampleOpenAPI } from 'AppData/SamplePizzaShack';

const PREFIX = 'SampleMCPServer';

const classes = {
    wrapper: `${PREFIX}-wrapper`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
    '&': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    [`& .${classes.wrapper}`]: {
        width: theme.spacing(35),
        borderRadius: theme.spacing(1),
        outline: 'none',
        padding: theme.spacing(1),
    },
}));

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
        const internalGateways = publisherSettings && publisherSettings.environment.filter((p) => p.provider
        && p.provider.toLowerCase().includes('wso2'));

        setShowStatus(true);

        // Get sample MCP Server data and OpenAPI definition
        const sampleMCPServerData = getSampleMCPServerData(defaultAdvancePolicy || 'Unlimited',
            defaultSubscriptionPolicy || 'Unlimited');
        const sampleOpenAPIDefinition = getSampleOpenAPI(defaultSubscriptionPolicy || 'Unlimited');
        
        // Convert OpenAPI definition to File object for binary upload
        const openAPIContent = JSON.stringify(sampleOpenAPIDefinition, null, 2);
        const openAPIFile = new File([openAPIContent], 'sample-mcp-server.yaml', {
            type: 'application/x-yaml',
        });
        
        // Check scopes for MCP Server creation
        if (AuthManager.isRestricted(['apim:mcp_server_create', 'apim:mcp_server_manage'])) {
            // Mark all tasks as completed with permission error and skip the flow
            tasksStatusDispatcher({ 
                name: 'revision', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
            tasksStatusDispatcher({ 
                name: 'deploy', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
            tasksStatusDispatcher({ 
                name: 'publish', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
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
        if (AuthManager.isRestricted([
            'apim:mcp_server_create',
            'apim:mcp_server_manage',
            'apim:mcp_server_publish',
            'apim:mcp_server_import_export'
        ])) {
            // Mark remaining tasks as completed with permission error and skip the flow
            tasksStatusDispatcher({ 
                name: 'deploy', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
            tasksStatusDispatcher({ 
                name: 'publish', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
            return;
        }

        // Create a revision of sample MCP Server -- 2nd API call
        const sampleMCPServerRevision = await taskManager(
            MCPServer.createRevision(sampleMCPServer.id, revisionPayload),
            'revision',
        );
        const envList = internalGateways.map((env) => env.name);
        const deployRevisionPayload = [];
        const getFirstVhost = (envName) => {
            const env = internalGateways.find(
                (ev) => ev.name === envName && ev.vhosts.length > 0,
            );
            return env && env.vhosts[0].host;
        };
        if (envList && envList.length > 0) {
            if (envList.includes('Default') && getFirstVhost('Default')) {
                deployRevisionPayload.push({
                    name: 'Default',
                    displayOnDevportal: true,
                    vhost: getFirstVhost('Default'),
                });
            } else if (getFirstVhost(envList[0])) {
                deployRevisionPayload.push({
                    name: envList[0],
                    displayOnDevportal: true,
                    vhost: getFirstVhost(envList[0]),
                });
            }
        }
        const revisionId = sampleMCPServerRevision.body.id;

        // Check scopes for 3rd API call (Deploy Revision)
        if (AuthManager.isRestricted([
            'apim:mcp_server_create',
            'apim:mcp_server_manage',
            'apim:mcp_server_publish',
        ])) {
            // Mark remaining task as completed with permission error and skip the flow
            tasksStatusDispatcher({ 
                name: 'publish', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
            return;
        }

        // Deploy a revision of sample MCP Server -- 3rd API call
        await taskManager(MCPServer.deployRevision(sampleMCPServer.id,
            revisionId, deployRevisionPayload), 'deploy');

        // Check scopes for 4th API call (Publish MCP Server)
        if (AuthManager.isRestricted([
            'apim:mcp_server_publish',
            'apim:mcp_server_manage',
            'apim:mcp_server_import_export'
        ])) {
            // Mark the last task as completed with permission error
            tasksStatusDispatcher({ 
                name: 'publish', 
                status: { 
                    completed: true, 
                    errors: 'Skipped due to insufficient permissions' 
                } 
            });
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
                        id='MCPServers.Listing.SampleMCPServer.SampleMCPServer.rest.d.sample.content'
                        defaultMessage='Sample MCP Server'
                    />
                }
            >
                <FormattedMessage
                    id={'MCPServers.Listing.SampleMCPServer.SampleMCPServer.'
                        + 'rest.d.sample.title'}
                    defaultMessage='Deploy Sample MCP Server'
                />
            </LandingMenuItem>
            <StyledModal
                aria-labelledby='transition-modal-title'
                aria-describedby='transition-modal-description'
                open={showStatus}
                closeAfterTransition
            >
                <Fade in={showStatus}>
                    <Box
                        bgcolor='background.paper'
                        className={classes.wrapper}
                    >
                        <Grid
                            container
                            direction='row'
                            justifyContent='center'
                            alignItems='center'
                        >
                            <TaskState
                                completed={tasksStatus.create.completed}
                                errors={tasksStatus.create.errors}
                                inProgress={tasksStatus.create.inProgress}
                                completedMessage={
                                    <FormattedMessage
                                        id='MCPServers.Listing.SampleMCPServer.popup.create.complete'
                                        defaultMessage='MCP Server created successfully!'
                                    />
                                }
                                inProgressMessage={
                                    <FormattedMessage
                                        id='MCPServers.Listing.SampleMCPServer.popup.create.inprogress'
                                        defaultMessage='Creating sample MCP Server with OpenAPI definition...'
                                    />
                                }
                            >
                                Create MCP Server
                            </TaskState>
                            {!AuthManager.isNotPublisher() && (
                                <>
                                    <TaskState
                                        completed={tasksStatus.revision.completed}
                                        errors={tasksStatus.revision.errors}
                                        inProgress={tasksStatus.revision.inProgress}
                                        completedMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.revision.complete'
                                                defaultMessage='MCP Server revision created successfully!'
                                            />
                                        }
                                        inProgressMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.revision.inprogress'
                                                defaultMessage='Creating a revision of sample MCP Server ...'
                                            />
                                        }
                                    >
                                        Revision MCP Server
                                    </TaskState>
                                    <TaskState
                                        pending={tasksStatus.deploy.pending}
                                        completed={tasksStatus.deploy.completed}
                                        errors={tasksStatus.deploy.errors}
                                        inProgress={tasksStatus.deploy.inProgress}
                                        pendingMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.deploy.pending'
                                                defaultMessage='MCP Server revision deployment request sent'
                                            />
                                        }
                                        completedMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.deploy.complete'
                                                defaultMessage='MCP Server deployed successfully!'
                                            />
                                        }
                                        inProgressMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.deploy.inprogress'
                                                defaultMessage='Deploying sample MCP Server ...'
                                            />
                                        }
                                    >
                                        Deploying MCP Server
                                    </TaskState>
                                    <TaskState
                                        completed={tasksStatus.publish.completed}
                                        errors={tasksStatus.publish.errors}
                                        inProgress={tasksStatus.publish.inProgress}
                                        completedMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.publish.complete'
                                                defaultMessage='MCP Server published successfully!'
                                            />
                                        }
                                        inProgressMessage={
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.popup.publish.inprogress'
                                                defaultMessage='Publishing MCP Server to developer portal ...'
                                            />
                                        }
                                    >
                                        Publish MCP Server
                                    </TaskState>
                                </>
                            )}
                            {anyErrors && (
                                <Grid container justifyContent='flex-end' gap={2}
                                    paddingRight={1} paddingBottom={1} alignItems='center'>
                                    <Grid item>
                                        <Button
                                            onClick={() => {
                                                setShowStatus(false);
                                                tasksStatusDispatcher({ name: 'reset' });
                                            }}
                                            variant='outlined'
                                        >
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.continue.on.close'
                                                defaultMessage='Close'
                                            />
                                        </Button>
                                    </Grid>
                                    {newSampleMCPServer && (
                                        <Grid item>
                                            <Link
                                                variant='body2'
                                                underline='none'
                                                component={RouterLink}
                                                to={`/mcp-servers/${newSampleMCPServer.id}/overview`}
                                            >
                                                <FormattedMessage
                                                    id='MCPServers.Listing.SampleMCPServer.continue.on.error'
                                                    defaultMessage='Continue'
                                                />
                                            </Link>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Fade>
            </StyledModal>
        </>
    );
};

SampleMCPServer.propTypes = {
    dense: PropTypes.bool.isRequired,
};

export default SampleMCPServer;
