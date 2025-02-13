/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import { Link } from 'react-router-dom';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import { API_SECURITY_API_KEY }
    from 'AppComponents/Apis/Details/Configuration/components/APISecurity/components/apiSecurityConstants';
import ProvideAIOpenAPI from './Steps/ProvideAIOpenAPI';


/**
     *
     * Reduce the events triggered from API input fields to current state
     * @param {*} currentState
     * @param {*} inputAction
     * @returns
     */
function apiInputsReducer(currentState, inputAction) {
    const { action, value } = inputAction;
    switch (action) {
        case 'type':
        case 'inputValue':
        case 'name':
        case 'version':
        case 'endpoint':
        case 'gatewayType':
        case 'context':
        case 'policies':
        case 'llmProviderId':
        case 'isFormValid':
            return { ...currentState, [action]: value };
        case 'preSetAPI':
            return {
                ...currentState,
                name: value.name.replace(/[&/\\#,+()$~%.'":*?<>{}\s]/g, ''),
                version: value.version,
                context: value.context,
                endpoint: value.endpoints && value.endpoints[0],
            };
        default:
            return currentState;
    }
}
/**
 * Handle API creation from AI/LLM Service Provider API Definition.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiCreateAIAPI(props) {
    const [wizardStep, setWizardStep] = useState(0);
    const { history, multiGateway } = props;
    const { data: settings } = usePublisherSettings();

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'ApiCreateAIAPI',
        inputValue: '',
        formValidity: false,
    });

    const intl = useIntl();

    /**
     *
     *
     * @param {*} event
     */
    function handleOnChange(event) {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     *
     * Set the validity of the API Inputs form
     * @param {*} isValidForm
     * @param {*} validationState
     */
    function handleOnValidate(isFormValid) {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    const [isCreating, setCreating] = useState();
    /**
     *
     *
     * @param {*} params
     */
    function createAPI() {
        setCreating(true);
        const {
            name, version, context, endpoint, gatewayType, policies = ["Unlimited"], inputValue, llmProviderId,
        } = apiInputs;
        let defaultGatewayType;
        if (settings && settings.gatewayTypes.length === 1 && settings.gatewayTypes.includes('Regular')) {
            defaultGatewayType = 'wso2/synapse';
        } else if (settings && settings.gatewayTypes.length === 1 && settings.gatewayTypes.includes('APK')) {
            defaultGatewayType = 'wso2/apk';
        } else {
            defaultGatewayType = 'default';
        }

        const additionalProperties = {
            name,
            version,
            context,
            gatewayType: defaultGatewayType === 'default' ? gatewayType : defaultGatewayType,
            policies,
            subtypeConfiguration: {
                subtype: 'AIAPI',
                configuration: {
                    llmProviderId,
                },
            },
            securityScheme: [API_SECURITY_API_KEY],
            egress : true
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
        const newAPI = new API(additionalProperties);
        const promisedResponse = newAPI.importOpenAPIByInlineDefinition(inputValue);
        promisedResponse
            .then((api) => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.OpenAPI.ApiCreateOpenAPI.created.success',
                    defaultMessage: 'API created successfully',
                }));
                history.push(`/apis/${api.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Create.OpenAPI.ApiCreateOpenAPI.created.error',
                        defaultMessage: 'Something went wrong while adding the API',
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
                            id='Apis.Create.AIAPI.ApiCreateAIAPI.heading'
                            defaultMessage='Create an API using an AI/LLM Service provider API definition.'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Create.AIAPI.ApiCreateAIAPI.sub.heading'
                            defaultMessage='Create an API using an existing AI/LLM Service provider API definition.'
                        />
                    </Typography>
                </>
            )}
        >
            <Box sx={{ mb: 2 }}>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.AIAPI.ApiCreateAIAPI.wizard.one'
                                defaultMessage='Provide AI/LLM Service provider API'
                            />
                        </StepLabel>
                    </Step>

                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.AIAPI.ApiCreateAIAPI.wizard.two'
                                defaultMessage='Create API'
                            />
                        </StepLabel>
                    </Step>
                </Stepper>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {wizardStep === 0 && (
                        <ProvideAIOpenAPI
                            onValidate={handleOnValidate}
                            inputsDispatcher={inputsDispatcher}
                        />
                    )}
                    {wizardStep === 1 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            multiGateway={multiGateway}
                            api={apiInputs}
                            isAPIProduct={false}
                            hideEndpoint
                        />
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/apis/'>
                                    <Button>
                                        <FormattedMessage
                                            id='Apis.Create.AIAPI.ApiCreateAIAPI.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {wizardStep === 1 && (
                                <Button onClick={() => setWizardStep((step) => step - 1)}>
                                    <FormattedMessage
                                        id='Apis.Create.AIAPI.ApiCreateAIAPI.back'
                                        defaultMessage='Back'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Button
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid}
                                    id='ai-api-create-next-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.AIAPI.ApiCreateAIAPI.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 1 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid || isCreating}
                                    onClick={createAPI}
                                    id='ai-api-create-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.AIAPI.ApiCreateAIAPI.create'
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

ApiCreateAIAPI.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    multiGateway: PropTypes.string.isRequired,
};
