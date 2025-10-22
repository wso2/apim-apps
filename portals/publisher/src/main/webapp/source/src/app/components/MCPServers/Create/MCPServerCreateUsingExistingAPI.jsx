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

import React, { useReducer, useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import ExistingAPIToolSelection from 'AppComponents/MCPServers/Create/Steps/ExistingAPIToolSelection';
import API from 'AppData/api';
import AuthManager from 'AppData/AuthManager';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import MCPServer from 'AppData/MCPServer';

const PREFIX = 'MCPServerCreateUsingExistingAPI';

const classes = {
    Paper: `${PREFIX}-Paper`,
    saveButton: `${PREFIX}-saveButton`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    alternativeLabel: `${PREFIX}-alternativeLabel`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.Paper}`]: {
        height: '40px',
    },

    [`& .${classes.saveButton}`]: {
        padding: '0px 0px 0px 10px',
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.spacing(2),
    },

    [`& .${classes.buttonWrapper}`]: {
        marginTop: theme.spacing(4),
    },

    [`& .${classes.alternativeLabel}`]: {
        marginTop: theme.spacing(1),
    }
}));

const MCPServerCreateUsingExistingAPI = (props) => {
    const { history, location } = props;
    const intl = useIntl();
    const [wizardStep, setWizardStep] = useState(0);
    const [isCreating, setCreating] = useState();
    const [isPublishButtonClicked, setIsPublishButtonClicked] = useState(false);
    const [isRevisioning, setIsRevisioning] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [policies, setPolicies] = useState([]);
    const { data: settings } = usePublisherSettings();

    // Extract API ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const apiId = urlParams.get('apiId');

    // Create selectedAPI object if API ID is present - memoized to prevent unnecessary re-renders
    const selectedAPI = useMemo(() => {
        return apiId ? { id: apiId } : null;
    }, [apiId]);

    useEffect(() => {
        API.policies('subscription').then((response) => {
            const allPolicies = response.body.list;
            if (allPolicies.length === 0) {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.APIProduct.APIProductCreateWrapper.error.policies.not.available',
                    defaultMessage: 'Throttling policies not available. Contact your administrator',
                }));
            } else if (allPolicies.filter((p) => p.name === 'Unlimited').length > 0) {
                setPolicies(['Unlimited']);
            } else {
                setPolicies([allPolicies[0].name]);
            }
        });
    }, []);

    const pageTitle = (
        <Root>
            <Typography variant='h5'>
                <FormattedMessage
                    id='MCPServers.Create.MCPServerCreateUsingExistingAPI.heading'
                    defaultMessage='Create MCP Server from existing API'
                />
            </Typography>
            <Typography variant='caption'>
                <FormattedMessage
                    id='MCPServers.Create.MCPServerCreateUsingExistingAPI.sub.heading'
                    defaultMessage={
                        'Create an MCP Server from an existing API by providing a Name, '
                        + 'a Context, a Version, Tools, and Business Plans (optional).'
                    }
                />
            </Typography>
        </Root>
    );

    /**
     * Reduce the events triggered from API input fields to current state
     * @param {Object} currentState - The current state object
     * @param {Object} inputAction - The action object
     * @returns {Object} The new state object
     */
    function mcpServerInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'type':
            case 'name':
            case 'displayName':
            case 'context':
            case 'version':
            case 'isFormValid':
            case 'operations':
                return { ...currentState, [action]: value };
            default:
                return currentState;
        }
    }

    const [mcpServerInputs, inputsDispatcher] = useReducer(mcpServerInputsReducer, {
        type: 'MCPServerCreateUsingExistingAPI',
        name: '',
        context: '',
        version: '',
        operations: [],
        isFormValid: false,
    });

    /**
     * Handle input change events
     * @param {Object} event - The event triggered by the input change
     */
    const handleOnChange = (event) => {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     * Set the validity of the MCP Server Inputs form
     * @param {boolean} isFormValid - The validity state of the form
     */
    const handleOnValidate = (isFormValid) => {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    let newMCPServer;
    const createMCPServer = () => {
        setCreating(true);
        const {
            name, context, version, displayName, operations = [],
        } = mcpServerInputs;
        const mcpServerData = {
            name,
            displayName,
            context,
            version,
            policies,
            operations,
        };
        mcpServerData.transport = ['http', 'https'];

        // Operations are already in the correct format from ExistingAPIToolSelection
        // No transformation needed
        mcpServerData.operations = operations;

        newMCPServer = new MCPServer(mcpServerData);
        return newMCPServer
            .createMCPServerUsingExistingAPI()
            .then((mcpServer) => {
                Alert.info(intl.formatMessage({
                    id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.created.success',
                    defaultMessage: 'MCP Server created successfully',
                }));
                return mcpServer;
            })
            .catch((error) => {
                // Re-throw the error so it can be caught by the calling code
                throw error;
            })
            .finally(() => setCreating(false));
    }

    const createMCPServerOnly = () => {
        createMCPServer()
            .then((mcpServer) => {
                history.push(`/mcp-servers/${mcpServer.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.created.error',
                        defaultMessage: 'Failed to create MCP Server',
                    }));
                }
            });
    }

    const createAndPublishMCPServer = () => {
        setIsPublishButtonClicked(true);
        createMCPServer()
            .then((mcpServer) => {
                setIsRevisioning(true);
                Alert.info(intl.formatMessage({
                    id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.created.success',
                    defaultMessage: 'MCP Server created successfully',
                }));
                const body = {
                    description: 'Initial Revision',
                };
                MCPServer.createRevision(mcpServer.id, body)
                    .then((mcpServer1) => {
                        setIsRevisioning(false);
                        const revisionId = mcpServer1.body.id;
                        Alert.info(intl.formatMessage({
                            id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.revision.created.success',
                            defaultMessage: 'MCP Server revision created successfully',
                        }));
                        const envList = settings.environment.map((env) => env.name);
                        const body1 = [];
                        const getFirstVhost = (envName) => {
                            const env = settings.environment.find(
                                (e) => e.name === envName && e.mode !== 'READ_ONLY' && e.vhosts.length > 0,
                            );
                            return env && env.vhosts[0].host;
                        };
                        if (envList && envList.length > 0) {
                            if (envList.includes('Default') && getFirstVhost('Default')) {
                                body1.push({
                                    name: 'Default',
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost('Default'),
                                });
                            } else if (getFirstVhost(envList[0])) {
                                body1.push({
                                    name: envList[0],
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost(envList[0]),
                                });
                            }
                        }
                        setIsDeploying(true);
                        MCPServer.deployRevision(mcpServer.id, revisionId, body1)
                            .then(() => {
                                Alert.info(intl.formatMessage({
                                    id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.revision.deployed.success',
                                    defaultMessage: 'API Revision Deployed Successfully',
                                }));
                                setIsDeploying(false);
                                setIsPublishing(true);
                                MCPServer.updateLcState(mcpServer.id, 'Publish')
                                    .then((response) => {
                                        const { workflowStatus } = response.body;
                                        if (workflowStatus === 'CREATED') {
                                            Alert.info(intl.formatMessage({
                                                id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.publishStatus',
                                                defaultMessage: 'Lifecycle state change request has been sent',
                                            }));
                                        } else {
                                            Alert.info(intl.formatMessage({
                                                id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.otherStatus',
                                                defaultMessage: 'MCP Serverstatus updated successfully',
                                            }));
                                        }
                                        history.push(`/mcp-servers/${mcpServer.id}/overview`);
                                    });
                            })
                            .catch((error) => {
                                if (error.response) {
                                    Alert.error(error.response.body.description);
                                } else {
                                    Alert.error(intl.formatMessage({
                                        id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.error.'
                                            + 'errorMessage.deploy.revision',
                                        defaultMessage: 'Something went wrong while deploying the MCP Server Revision',
                                    }));
                                }
                                console.error(error);
                            })
                            .finally(() => {
                                setIsPublishButtonClicked(false);
                                setIsPublishing(false);
                                setIsDeploying(false);
                                setIsRevisioning(false);
                            });
                    })
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else {
                            Alert.error(intl.formatMessage({
                                id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.error.errorMessage.'
                                    + 'create.revision',
                                defaultMessage: 'Something went wrong while creating the MCP Server Revision',
                            }));
                        }
                        console.error(error);
                    });
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.error.errorMessage.create.mcpServer',
                        defaultMessage: 'Something went wrong while creating the MCP Server',
                    }));
                }
                console.error(error);
            })
            .finally(() => setCreating(false));
    };

    const getSteps = () => {
        return [
            {
                key: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.wizard.one',
                label: (
                    <FormattedMessage
                        variant='caption'
                        id='MCPServers.Create.MCPServerCreateUsingExistingAPI.wizard.one'
                        defaultMessage='Select API and Operations for Tool Generation'
                    />
                )
            },
            {
                key: 'MCPServers.Create.MCPServerCreateUsingExistingAPI.wizard.two',
                label: (
                    <FormattedMessage
                        variant='caption'
                        id='MCPServers.Create.MCPServerCreateUsingExistingAPI.wizard.two'
                        defaultMessage='Create MCP Server'
                    />
                )
            },
        ];
    }

    return (
        <APICreateBase
            title={pageTitle}
        >
            <Box sx={{ mb: 3 }}>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    {getSteps().map((step) => (
                        <Step key={step.key}>
                            <StepLabel className={classes.alternativeLabel}>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            <Grid container>
                <Grid item md={12}>
                    {wizardStep === 0 && (
                        <ExistingAPIToolSelection
                            onValidate={handleOnValidate}
                            inputsDispatcher={inputsDispatcher}
                            selectedAPI={selectedAPI}
                        />
                    )}
                    {wizardStep === 1 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            api={mcpServerInputs}
                            isAPIProduct={false}
                            isMCPServer
                            mcpServerType='EXISTING_API'
                            settings={settings}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/mcp-servers/'>
                                    <Button>
                                        <FormattedMessage
                                            id='MCPServers.Create.MCPServerCreateUsingExistingAPI.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {(wizardStep === 1) && (
                                <Button onClick={() => setWizardStep((step) => step - 1)}>
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateUsingExistingAPI.back'
                                        defaultMessage='Back'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {(wizardStep === 0) && (
                                <Button
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid}
                                    id='open-api-create-next-btn'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateUsingExistingAPI.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 1 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid || isCreating || isPublishButtonClicked}
                                    onClick={createMCPServerOnly}
                                    id='open-api-create-next-btn'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateUsingExistingAPI.create'
                                        defaultMessage='Create'
                                    />
                                    {isCreating && !isPublishButtonClicked && <CircularProgress size={24} />}
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 1 && !AuthManager.isNotPublisher() && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid || isCreating || isPublishButtonClicked}
                                    onClick={createAndPublishMCPServer}
                                    id='open-api-create-btn'
                                >
                                    {(!isPublishing && !isRevisioning && !isDeploying) &&
                                        <FormattedMessage
                                            id='MCPServers.Create.MCPServerCreateUsingExistingAPI.create.and.publish'
                                            defaultMessage='Create & Publish'
                                        />
                                    }
                                    {(isPublishing || isRevisioning || isDeploying)
                                    && <CircularProgress size={24} />}
                                    {isCreating && isPublishing &&
                                        <FormattedMessage
                                            id='MCPServers.Create.MCPServerCreateUsingExistingAPI.create.status'
                                            defaultMessage='Creating MCP Server. . .'
                                        />
                                    }
                                    {!isCreating && isRevisioning && !isDeploying &&
                                        <FormattedMessage
                                            id={'MCPServers.Create.MCPServerCreateUsingExistingAPI.create.'
                                                + 'revision.status'}
                                            defaultMessage='Creating Revision . . .'
                                        />
                                    }
                                    {!isCreating && isPublishing
                                    && !isRevisioning && !isDeploying &&
                                        <FormattedMessage
                                            id={'MCPServers.Create.MCPServerCreateUsingExistingAPI.create.'
                                                + 'publish.status'}
                                            defaultMessage='Publishing MCP Server. . .'
                                        />
                                    }
                                    {!isCreating && isPublishing
                                    && !isRevisioning && isDeploying &&
                                        <FormattedMessage
                                            id={'MCPServers.Create.MCPServerCreateUsingExistingAPI.create.'
                                                + 'deploy.revision.status'}
                                            defaultMessage='Deploying Revision . . .'
                                        />

                                    }
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </APICreateBase>
    );
}

MCPServerCreateUsingExistingAPI.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    location: PropTypes.shape({ search: PropTypes.string }).isRequired,
};

export default MCPServerCreateUsingExistingAPI;
