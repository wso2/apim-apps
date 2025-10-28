/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api';
import AuthManager from 'AppData/AuthManager';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import TaskState from 'AppComponents/Apis/Listing/SampleAPI/components/TaskState';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { getSampleAPIData, getSampleOpenAPI } from 'AppData/SamplePizzaShack';

const PREFIX = 'SampleAPI';

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
    update: { inProgress: false, completed: false, pending: false, errors: false },
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
 * Handle deploying a sample API (Create, Deploy and Publish)
 *
 * @class SampleAPI
 * @extends {Component}
 */

const SampleAPI = (props) => {
    const { dense } = props;
    const [tasksStatus, tasksStatusDispatcher] = useReducer(tasksReducer, initialTaskStates);
    const [showStatus, setShowStatus] = useState(false);
    const [newSampleAPI, setNewSampleAPI] = useState();

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
     * Handle onClick event for `Deploy Sample API` Button
     * @memberof SampleAPI
     */
    const handleDeploySample = async () => {
        const { defaultAdvancePolicy, defaultSubscriptionPolicy } = publisherSettings;
        const internalGateways = publisherSettings && publisherSettings.environment.filter((p) => p.provider
        && p.provider.toLowerCase().includes('wso2'));

        setShowStatus(true);
        const restApi = new API();

        const sampleAPIObj = new API(getSampleAPIData(defaultAdvancePolicy || 'Unlimited',
            defaultSubscriptionPolicy || 'Unlimited'));
        
        // Check scopes for 1st API call (Create API)
        if (AuthManager.isRestricted(['apim:api_create', 'apim:api_manage'])) {
            // Mark all tasks as completed with permission error and skip the flow
            tasksStatusDispatcher({ 
                name: 'update', 
                status: { 
                    completed: true, 
                    errors: 'Insufficient permissions: apim:api_create and apim:api_manage scopes required' 
                } 
            });
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
        
        // Create the sample API -- 1st API call
        const sampleAPI = await taskManager(sampleAPIObj.save(), 'create');
        setNewSampleAPI(sampleAPI);
        if (!sampleAPI) {
            throw new Error('Error while creating sample API');
        }
        
        // Check scopes for 2nd API call (Update Swagger)
        if (AuthManager.isRestricted(['apim:api_create', 'apim:api_manage'])) {
            // Mark remaining tasks as completed with permission error and skip the flow
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
        
        // Update the sample API -- 2nd API call
        await taskManager(sampleAPI
            .updateSwagger(
                getSampleOpenAPI(defaultAdvancePolicy || 'Unlimited'),
            ), 'update');

        const revisionPayload = {
            description: 'Initial Revision',
        };

        // Check scopes for 3rd API call (Create Revision)
        if (AuthManager.isRestricted([
            'apim:api_create', 
            'apim:api_manage', 
            'apim:api_publish', 
            'apim:api_import_export'
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

        // Create a revision of sample API -- 3rd API call
        const sampleAPIRevision = await taskManager(
            restApi.createRevision(sampleAPI.id, revisionPayload),
            'revision',
        );
        const envList = internalGateways.map((env) => env.name);
        const deployRevisionPayload = [];
        const getFirstVhost = (envName) => {
            const env = internalGateways.find(
                (ev) => ev.name === envName && ev.mode !== 'READ_ONLY' && ev.vhosts.length > 0,
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
        const revisionId = sampleAPIRevision.body.id;

        // Check scopes for 4th API call (Deploy Revision)
        if (AuthManager.isRestricted([
            'apim:api_create', 
            'apim:api_manage', 
            'apim:api_publish'
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

        // Deploy a revision of sample API -- 4th API call
        await taskManager(restApi.deployRevision(sampleAPI.id,
            revisionId, deployRevisionPayload), 'deploy');

        // Check scopes for 5th API call (Publish API)
        if (AuthManager.isRestricted([
            'apim:api_publish', 
            'apim:api_manage', 
            'apim:api_import_export'
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

        // Publish the sample API -- 5th API call
        await taskManager(sampleAPI.publish(), 'publish');
    };

    const allDone = !AuthManager.isNotPublisher() ? Object.values(tasksStatus)
        .map((tasks) => tasks.completed)
        .reduce((done, current) => current && done) : (tasksStatus.create.completed && newSampleAPI);
    const anyErrors = Object.values(tasksStatus).map((tasks) => tasks.errors).find((error) => error !== false);
    if (allDone && !anyErrors) {
        const url = '/apis/' + newSampleAPI.id + '/overview';
        return <Redirect to={url} />;
    }
    return (
        <>
            <LandingMenuItem
                dense={dense}
                id='itest-id-deploy-sample'
                onClick={handleDeploySample}
                disabled={!publisherSettings || isLoading}
                component='button'
                helperText={(
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.rest.sample.content'
                        defaultMessage='Sample Pizza Shack API'
                    />
                )}
            >
                <FormattedMessage
                    id='Apis.Listing.SampleAPI.SampleAPI.rest.sample.title'
                    defaultMessage='Deploy Sample API'
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
                                completedMessage={(
                                    <FormattedMessage
                                        id='Apis.Listing.SampleAPI.popup.create.complete'
                                        defaultMessage='API created successfully!'
                                    />
                                )}
                                inProgressMessage={(
                                    <FormattedMessage
                                        id='Apis.Listing.SampleAPI.popup.create.inprogress'
                                        defaultMessage='Creating sample API ...'
                                    />
                                )}
                            >
                                Create API
                            </TaskState>
                            <TaskState
                                completed={tasksStatus.update.completed}
                                errors={tasksStatus.update.errors}
                                inProgress={tasksStatus.update.inProgress}
                                completedMessage={(
                                    <FormattedMessage
                                        id='Apis.Listing.SampleAPI.popup.update.complete'
                                        defaultMessage='API updated successfully!'
                                    />
                                )}
                                inProgressMessage={(
                                    <FormattedMessage
                                        id='Apis.Listing.SampleAPI.popup.update.inprogress'
                                        defaultMessage='Updating sample API ...'
                                    />
                                )}
                            >
                                Update API
                            </TaskState>
                            {!AuthManager.isNotPublisher() && (
                                <>
                                    <TaskState
                                        completed={tasksStatus.revision.completed}
                                        errors={tasksStatus.revision.errors}
                                        inProgress={tasksStatus.revision.inProgress}
                                        completedMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.revision.complete'
                                                defaultMessage='API revision created successfully!'
                                            />
                                        )}
                                        inProgressMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.revision.inprogress'
                                                defaultMessage='Creating a revision of sample API ...'
                                            />
                                        )}
                                    >
                                        Revision API
                                    </TaskState>
                                    <TaskState
                                        pending={tasksStatus.deploy.pending}
                                        completed={tasksStatus.deploy.completed}
                                        errors={tasksStatus.deploy.errors}
                                        inProgress={tasksStatus.deploy.inProgress}
                                        pendingMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.deploy.pending'
                                                defaultMessage='API revision deployment request sent'
                                            />
                                        )}
                                        completedMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.deploy.complete'
                                                defaultMessage='API deployed successfully!'
                                            />
                                        )}
                                        inProgressMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.deploy.inprogress'
                                                defaultMessage='Deploying sample API ...'
                                            />
                                        )}
                                    >
                                        Deploying API
                                    </TaskState>
                                    <TaskState
                                        completed={tasksStatus.publish.completed}
                                        errors={tasksStatus.publish.errors}
                                        inProgress={tasksStatus.publish.inProgress}
                                        completedMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.publish.complete'
                                                defaultMessage='API published successfully!'
                                            />
                                        )}
                                        inProgressMessage={(
                                            <FormattedMessage
                                                id='Apis.Listing.SampleAPI.popup.publish.inprogress'
                                                defaultMessage='Publishing sample API to developer portal ...'
                                            />
                                        )}
                                    >
                                        Publish API
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
                                                id='Apis.Listing.SampleAPI.continue.on.close'
                                                defaultMessage='Close'
                                            />
                                        </Button>
                                    </Grid>
                                    {newSampleAPI && (
                                        <Grid item>
                                            <Link
                                                variant='body2'
                                                underline='none'
                                                component={RouterLink}
                                                to={`/apis/${newSampleAPI.id}/overview`}
                                            >
                                                <FormattedMessage
                                                    id='Apis.Listing.SampleAPI.continue.on.error'
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

export default SampleAPI;
