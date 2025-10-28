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
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import MCPProxyToolSelection from 'AppComponents/MCPServers/Create/Steps/MCPProxyToolSelection';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import MCPServer from 'AppData/MCPServer';

const PREFIX = 'MCPServerCreateProxy';

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

const MCPServerCreateProxy = (props) => {
    const { history } = props;
    const intl = useIntl();
    const [wizardStep, setWizardStep] = useState(0);
    const [isCreating, setCreating] = useState();
    const { data: settings } = usePublisherSettings();

    const pageTitle = (
        <Root>
            <Typography variant='h5'>
                <FormattedMessage
                    id='MCPServers.Create.MCPServerCreateProxy.heading'
                    defaultMessage='Create MCP Server using MCP Server URL'
                />
            </Typography>
            <Typography variant='caption'>
                <FormattedMessage
                    id='MCPServers.Create.MCPServerCreateProxy.sub.heading'
                    defaultMessage='Create an MCP Server by providing MCP Server URL'
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
            case 'mcpServerUrl':
            case 'isFormValid':
            case 'operations':
                return { ...currentState, [action]: value };
            default:
                return currentState;
        }
    }

    const [mcpServerInputs, inputsDispatcher] = useReducer(mcpServerInputsReducer, {
        type: 'MCPServerCreateProxy',
        name: '',
        context: '',
        version: '',
        operations: [],
        isFormValid: false,
        mcpServerUrl: '',
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

    const createMCPServer = () => {
        setCreating(true);
        const {
            name,
            displayName,
            version,
            context,
            mcpServerUrl,
            gatewayType,
            policies = ["Unlimited"],
            operations = [],
        } = mcpServerInputs;
        
        let defaultGatewayType;
        if (settings && settings.gatewayTypes.length === 1 && settings.gatewayTypes.includes('Regular')) {
            defaultGatewayType = 'wso2/synapse';
        } else if (settings && settings.gatewayTypes.length === 1 && settings.gatewayTypes.includes('APK')){
            defaultGatewayType = 'wso2/apk';
        } else {
            defaultGatewayType = 'default';
        }

        const additionalProperties = {
            name,
            displayName,
            version,
            context,
            gatewayType: defaultGatewayType === 'default' ? gatewayType : defaultGatewayType,
            policies,
            operations,
        };
        if (mcpServerUrl) {
            additionalProperties.endpointConfig = {
                endpoint_type: 'http',
                sandbox_endpoints: {
                    url: mcpServerUrl,
                },
                production_endpoints: {
                    url: mcpServerUrl,
                },
            };
        }

        const newMCPServer = new MCPServer(additionalProperties);
        const promisedCreatedMCPServer = newMCPServer.createMCPServerUsingMCPServerURL(mcpServerUrl);
        promisedCreatedMCPServer
            .then((mcpServer) => {
                Alert.info(intl.formatMessage({
                    id: 'MCPServers.Create.MCPServerCreateProxy.created.success',
                    defaultMessage: 'MCP Server created successfully',
                }));
                history.push(`/mcp-servers/${mcpServer.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Create.MCPServerCreateProxy.created.error',
                        defaultMessage: 'Something went wrong while creating the MCP Server',
                    }));
                }
            })
            .finally(() => setCreating(false));
    }

    const getSteps = () => {
        return [
            {
                key: 'MCPServers.Create.MCPServerCreateProxy.wizard.one',
                label: <FormattedMessage
                    variant='caption'
                    id='MCPServers.Create.MCPServerCreateProxy.wizard.one'
                    defaultMessage='Provide MCP Server URL'
                />
            },
            {
                key: 'MCPServers.Create.MCPServerCreateProxy.wizard.two',
                label: <FormattedMessage
                    variant='caption'
                    id='MCPServers.Create.MCPServerCreateProxy.wizard.two'
                    defaultMessage='Create MCP Server'
                />
            },
        ];
    }

    return (
        <APICreateBase
            title={pageTitle}
            isCreating={isCreating}
        >
            <Box sx={{ mb: 2 }}>
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
                        <MCPProxyToolSelection
                            onValidate={handleOnValidate}
                            apiInputs={mcpServerInputs}
                            inputsDispatcher={inputsDispatcher}
                        />
                    )}
                    {wizardStep === 1 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            api={mcpServerInputs}
                            isAPIProduct={false}
                            isMCPServer
                            mcpServerType='SERVER_PROXY'
                            settings={settings}
                            readOnlyAPIEndpoint
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
                                            id='MCPServers.Create.MCPServerCreateProxy.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {(wizardStep === 1) && (
                                <Button onClick={() => setWizardStep((step) => step - 1)}>
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.back'
                                        defaultMessage='Back'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {(wizardStep === 0) && (
                                <Button 
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid}
                                    onClick={() => setWizardStep((step) => step + 1)}
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 1 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid || isCreating}
                                    onClick={createMCPServer}
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.create'
                                        defaultMessage='Create'
                                    />
                                    {' '}
                                    {isCreating && <CircularProgress size={24} />}
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </APICreateBase>
    );
};

MCPServerCreateProxy.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default MCPServerCreateProxy;
