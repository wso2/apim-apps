/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { Link, useLocation } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import ProvideOpenAPI from 'AppComponents/Apis/Create/OpenAPI/Steps/ProvideOpenAPI';
import ToolSelection from 'AppComponents/MCPServers/Create/Steps/ToolSelection';
import MCPServer from 'AppData/MCPServer';

/**
 * Reduce the events triggered from API input fields to current state
 * @param {*} currentState - The current state of the API inputs
 * @param {*} inputAction - The action to be performed on the current state
 * @returns {Object} - The new state of the API inputs
 */
function mcpServerInputsReducer(currentState, inputAction) {
    const { action, value } = inputAction;
    switch (action) {
        case 'type':
        case 'inputValue':
        case 'name':
        case 'displayName':
        case 'version':
        case 'endpoint':
        case 'gatewayType':
        case 'context':
        case 'policies':
        case 'isFormValid':
        case 'operations':
            return { ...currentState, [action]: value };
        case 'inputType':
            return { ...currentState, [action]: value, inputValue: value === 'url' ? '' : null };
        case 'preSetAPI':
            return {
                ...currentState,
                name: value.name.replace(/[&/\\#,+()$~%.'":*?<>{}\s]/g, ''),
                version: value.version,
                context: value.context,
                endpoint: value.endpoints && value.endpoints[0],
                operations: value.operations || [],
            };
        default:
            return currentState;
    }
}

/**
 * Handle MCP server creation from OpenAPI Definition.
 * @param {*} props - The props passed to the component
 * @returns {JSX.Element} - The rendered component
 */
const MCPServerCreateDefault = (props) => {
    const [wizardStep, setWizardStep] = useState(0);
    const [isCreating, setCreating] = useState();
    const location = useLocation();
    const { history } = props;
    const intl = useIntl();
    let { multiGateway } = props;
    const { multiGateway: assistantMultiGateway } = location.state || {};
    const { data: settings } = usePublisherSettings();

    if (!multiGateway) {
        multiGateway = assistantMultiGateway;
    }

    const [mcpServerInputs, inputsDispatcher] = useReducer(mcpServerInputsReducer, {
        type: 'MCPCreateOpenAPI',
        inputType: 'url',
        inputValue: '',
        formValidity: false,
        operations: [],
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    /**
     * Handle input change events
     * @param {*} event - The event triggered by the input change
     */
    const handleOnChange = (event) => {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     * Set the validity of the MCP Server Inputs form
     * @param {*} isFormValid - The validity state of the form
     */
    const handleOnValidate = (isFormValid) => {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    /**
     * Create the MCP Server using the provided OpenAPI definition
     * @throws {Error} - If the API creation fails
     */
    const createMCPServer = () => {
        setCreating(true);
        const {
            name,
            displayName,
            version,
            context,
            endpoint,
            gatewayType,
            policies = ["Unlimited"],
            inputValue,
            inputType,
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

        // Transform operations from step 0 format to the required format for MCP Server creation
        const transformedOperations = operations.map(operation => ({
            feature: 'TOOL',
            backendOperationMapping: {
                backendId: '',
                backendOperation: {
                    target: operation.target,
                    verb: operation.verb
                }
            }
        }));

        const additionalProperties = {
            name,
            displayName,
            version,
            context,
            gatewayType: defaultGatewayType === 'default' ? gatewayType : defaultGatewayType,
            policies,
            operations: transformedOperations,
        };
        if (endpoint) {
            additionalProperties.endpointConfig = {
                endpoint_type: 'http',
                sandbox_endpoints: {
                    url: endpoint,
                },
                production_endpoints: {
                    url: endpoint,
                },
            };
        }
        const newMCPServer = new MCPServer(additionalProperties);
        const promisedResponse = inputType === 'file'
            ? newMCPServer.createMCPServerUsingOpenAPIFile(inputValue)
            : newMCPServer.createMCPServerUsingOpenAPIUrl(inputValue);
        promisedResponse
            .then((mcpServer) => {
                Alert.info(intl.formatMessage({
                    id: 'MCPServers.Create.MCPServerCreateDefault.created.success',
                    defaultMessage: 'MCP Server created successfully',
                }));
                history.push(`/mcp-servers/${mcpServer.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Create.MCPServerCreateDefault.created.error',
                        defaultMessage: 'Something went wrong while creating the MCP Server',
                    }));
                }
            })
            .finally(() => setCreating(false));
    }

    return (
        <APICreateBase
            title={(
                <>
                    <Typography variant='h5'>
                        <FormattedMessage
                            id='MCPServers.Create.MCPServerCreateDefault.heading'
                            defaultMessage='Create MCP Server from API Definition'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='MCPServers.Create.MCPServerCreateDefault.sub.heading'
                            defaultMessage='Create an MCP Server using an OpenAPI definition file or URL'
                        />
                    </Typography>
                </>
            )}
        >
            <Box sx={{ mb: 2 }}>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    <Step key='MCPServers.Create.MCPServerCreateDefault.wizard.one'>
                        <StepLabel>
                            <FormattedMessage
                                id='MCPServers.Create.MCPServerCreateDefault.wizard.one'
                                defaultMessage='Provide OpenAPI'
                            />
                        </StepLabel>
                    </Step>
                    <Step key='MCPServers.Create.MCPServerCreateDefault.wizard.two'>
                        <StepLabel>
                            <FormattedMessage
                                id='MCPServers.Create.MCPServerCreateDefault.wizard.two'
                                defaultMessage='Select Operations for Tool Generation'
                            />
                        </StepLabel>
                    </Step>
                    <Step key='MCPServers.Create.MCPServerCreateDefault.wizard.three'>
                        <StepLabel>
                            <FormattedMessage
                                id='MCPServers.Create.MCPServerCreateDefault.wizard.three'
                                defaultMessage='Create MCP Server'
                            />
                        </StepLabel>
                    </Step>
                </Stepper>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {wizardStep === 0 && (
                        <ProvideOpenAPI
                            onValidate={handleOnValidate}
                            apiInputs={mcpServerInputs}
                            inputsDispatcher={inputsDispatcher}
                            isMCPServer
                        />
                    )}
                    {wizardStep === 1 && (
                        <ToolSelection
                            onValidate={handleOnValidate}
                            inputsDispatcher={inputsDispatcher}
                            operations={mcpServerInputs.operations}
                        />
                    )}
                    {wizardStep === 2 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            multiGateway={multiGateway}
                            api={mcpServerInputs}
                            isAPIProduct={false}
                            isMCPServer
                            mcpServerType='DIRECT_BACKEND'
                            settings={settings}
                        />
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/mcp-servers/'>
                                    <Button>
                                        <FormattedMessage
                                            id='MCPServers.Create.MCPServerCreateDefault.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {(wizardStep === 1 || wizardStep === 2) && (
                                <Button onClick={() => setWizardStep((step) => step - 1)}>
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateDefault.back'
                                        defaultMessage='Back'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {(wizardStep === 0 || wizardStep === 1) && (
                                <Button
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid}
                                    id='open-api-create-next-btn'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateDefault.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 2 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid || isCreating}
                                    onClick={createMCPServer}
                                    id='open-api-create-btn'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateDefault.create'
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
}

MCPServerCreateDefault.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    multiGateway: PropTypes.string.isRequired,
};

export default MCPServerCreateDefault;
