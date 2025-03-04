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
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';

import ProvideOpenAPI from './Steps/ProvideOpenAPI';

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
        case 'isFormValid':
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
            };
        default:
            return currentState;
    }
}
/**
 * Handle API creation from OpenAPI Definition.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiCreateOpenAPI(props) {
    const [wizardStep, setWizardStep] = useState(0);
    const location = useLocation();
    const { data: assistantInfo, settings: assistantSettings,
        multiGateway: assistantMultiGateway } = location.state || {};
    const { history } = props;
    let { multiGateway } = props;
    let { data: settings } = usePublisherSettings();

    if (!settings) {
        settings = assistantSettings;
    }

    if (!multiGateway) {
        multiGateway = assistantMultiGateway;
    }

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'ApiCreateOpenAPI',
        inputType: 'url',
        inputValue: '',
        formValidity: false,
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    if (assistantInfo && wizardStep === 0 && assistantInfo.source === 'DesignAssistant') {
        setWizardStep(1);
        inputsDispatcher({ action: 'preSetAPI', value: assistantInfo });
        inputsDispatcher({ action: 'gatewayType', value: assistantInfo.gatewayType });
        inputsDispatcher({ action: 'endpoint', value: assistantInfo.endpoint });
        inputsDispatcher({ action: 'inputType', value: 'file' });
        inputsDispatcher({ action: 'inputValue', value: assistantInfo.file });
    }
    
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

    /**
     * Handles back button click for the API creation wizard for Design Asistant
     * @param 
     *  
     */
    const handleBackButtonOnClick = () => {
        const landingPage = '/apis';
        history.push(landingPage);
    };

    const [isCreating, setCreating] = useState();
    /**
     *
     *
     * @param {*} params
     */
    function createAPI() {
        setCreating(true);
        const {
            name, version, context, endpoint, gatewayType, policies = ["Unlimited"], inputValue, inputType,
        } = apiInputs;
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
            version,
            context,
            gatewayType: defaultGatewayType === 'default' ? gatewayType : defaultGatewayType,
            policies,
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
        const promisedResponse = inputType === 'file'
            ? newAPI.importOpenAPIByFile(inputValue) : newAPI.importOpenAPIByUrl(inputValue);
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
                console.error(error);
            })
            .finally(() => setCreating(false));
    }

    return (
        <APICreateBase
            title={(
                <>
                    <Typography variant='h5'>
                        <FormattedMessage
                            id='Apis.Create.OpenAPI.ApiCreateOpenAPI.heading'
                            defaultMessage='Create an API using an OpenAPI definition.'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Create.OpenAPI.ApiCreateOpenAPI.sub.heading'
                            defaultMessage='Create an API using an existing OpenAPI definition file or URL.'
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
                                id='Apis.Create.OpenAPI.ApiCreateOpenAPI.wizard.one'
                                defaultMessage='Provide OpenAPI'
                            />
                        </StepLabel>
                    </Step>

                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.OpenAPI.ApiCreateOpenAPI.wizard.two'
                                defaultMessage='Create API'
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
                            apiInputs={apiInputs}
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
                            settings={settings}
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
                                            id='Apis.Create.OpenAPI.ApiCreateOpenAPI.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {wizardStep === 1 && (
                                (assistantInfo && assistantInfo.source ===  'DesignAssistant') ? (
                                    <Button onClick={handleBackButtonOnClick}>
                                        <FormattedMessage
                                            id='Apis.Create.OpenAPI.ApiCreateOpenAPI.designAssistant.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setWizardStep((step) => step - 1)}>
                                        <FormattedMessage
                                            id='Apis.Create.OpenAPI.ApiCreateOpenAPI.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                )
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Button
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid}
                                    id='open-api-create-next-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.OpenAPI.ApiCreateOpenAPI.next'
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
                                    id='open-api-create-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.OpenAPI.ApiCreateOpenAPI.create'
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

ApiCreateOpenAPI.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    multiGateway: PropTypes.string.isRequired,
};
