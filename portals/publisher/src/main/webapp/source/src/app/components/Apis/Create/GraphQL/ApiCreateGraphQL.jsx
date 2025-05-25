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
import React, { useReducer, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { Link, useHistory, useLocation } from 'react-router-dom';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';

import ProvideGraphQL from './Steps/ProvideGraphQL';

/**
 * Handle API creation from GraphQL Definition.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiCreateGraphQL(props) {
    const intl = useIntl();
    let { multiGateway } = props;
    const [wizardStep, setWizardStep] = useState(0);
    const location = useLocation();
    const { data: assistantInfo, settings: assistantSettings,
        multiGateway: assistantMultiGateway } = location.state || {};
    const history = useHistory();
    const [policies, setPolicies] = useState([]);
    let { data: settings } = usePublisherSettings();

    if (!settings) {
        settings = assistantSettings;
    }

    if (!multiGateway) {
        multiGateway = assistantMultiGateway;
    }

    useEffect(() => {
        API.policies('subscription').then((response) => {
            const allPolicies = response.body.list;
            if (allPolicies.length === 0) {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.GraphQL.ApiCreateGraphQL.error.policies.not.available',
                    defaultMessage: 'Throttling policies not available. Contact your administrator',
                }));
            } else if (allPolicies.filter((p) => p.name === 'Unlimited').length > 0) {
                setPolicies(['Unlimited']);
            } else {
                setPolicies([allPolicies[0].name]);
            }
        });
    }, []);
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
            case 'gatewayType':
            case 'endpoint':
            case 'context':
            case 'isFormValid':
                return { ...currentState, [action]: value };
            case 'inputType':
                return { ...currentState, [action]: value,
                    inputValue: value === 'url' || value === 'endpoint' ? '' : null
                };
            case 'graphQLInfo':
                return { ...currentState, [action]: value };
            case 'preSetAPI':
                return {
                    ...currentState,
                    name: value.name.replace(/[&/\\#,+()$~%.'":*?<>{}\s]/g, ''),
                    version: value.version,
                    context: value.context,
                };
            default:
                return currentState;
        }
    }

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'ApiCreateGraphQL',
        inputType: 'file',
        inputValue: '',
        formValidity: false,
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    if (assistantInfo && wizardStep === 0 && assistantInfo.source === 'DesignAssistant') {
        setWizardStep(1);
        inputsDispatcher({ action: 'preSetAPI', value: assistantInfo });
        inputsDispatcher({ action: 'gatewayType', value: assistantInfo.gatewayType });
        inputsDispatcher({ action: 'graphQLInfo', value: assistantInfo.graphQLInfo });
        inputsDispatcher({ action: 'endpoint', value: assistantInfo.endpoint });
        inputsDispatcher({ action: 'inputType', value: 'file' });
        inputsDispatcher({ action: 'inputValue', value: assistantInfo.file });
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
            name,
            version,
            context,
            endpoint,
            gatewayType,
            implementationType,
            inputType,
            inputValue,
            graphQLInfo: { operations },
        } = apiInputs;

        const additionalProperties = {
            name,
            version,
            context,
            gatewayType,
            policies,
            operations,
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
        const newApi = new API(additionalProperties);
        const apiData = {
            additionalProperties: JSON.stringify(additionalProperties),
            implementationType,
        };

        if (inputType === 'file') {
            apiData.file = inputValue;
        } else if (inputType === 'url' || inputType === 'endpoint') {
            apiData.schema = apiInputs.graphQLInfo.graphQLSchema.schemaDefinition;
        }

        newApi
            .importGraphQL(apiData)
            .then((response) => {
                const uuid = response.obj.id;
                Alert.info(intl.formatMessage(
                    {
                        id: 'Apis.Create.GraphQL.ApiCreateGraphQL.created.success',
                        defaultMessage: '{name} API created successfully',
                    },
                    {
                        name,
                    },
                ));
                history.push(`/apis/${uuid}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Create.GraphQL.ApiCreateGraphQL.created.error',
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
                            id='Apis.Create.GraphQL.ApiCreateGraphQL.heading'
                            defaultMessage='Create a GraphQL API'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Create.GraphQL.ApiCreateGraphQL.sub.heading'
                            defaultMessage={'Create a GraphQL API by importing a SDL definition'
                                + ' using a file, SDL hosted URL, or by using a GraphQL endpoint.'
                            }
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
                                id='Apis.Create.GraphQL.ApiCreateGraphQL.wizard.one'
                                defaultMessage='Provide GraphQL'
                            />
                        </StepLabel>
                    </Step>

                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.GraphQL.ApiCreateGraphQL.wizard.two'
                                defaultMessage='Create API'
                            />
                        </StepLabel>
                    </Step>
                </Stepper>
            </Box>

            <Grid container spacing={2}>
                <Grid item md={12}>
                    {wizardStep === 0 && (
                        <ProvideGraphQL
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
                            readOnlyAPIEndpoint={apiInputs.inputType === 'endpoint' ? apiInputs.endpoint : null}
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
                                            id='Apis.Create.GraphQL.ApiCreateGraphQL.designAssistant.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setWizardStep((step) => step - 1)}>
                                        <FormattedMessage
                                            id='Apis.Create.GraphQL.ApiCreateGraphQL.back'
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
                                    data-testid='create-graphql-next-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.GraphQL.ApiCreateGraphQL.next'
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
                                    data-testid='itest-create-graphql-api-button'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.GraphQL.ApiCreateGraphQL.create'
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

ApiCreateGraphQL.propTypes = {
    multiGateway: PropTypes.shape({ content: PropTypes.string }).isRequired,
};
