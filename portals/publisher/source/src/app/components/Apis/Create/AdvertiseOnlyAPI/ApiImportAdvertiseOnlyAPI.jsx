/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import API from 'AppData/api';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { FormattedMessage } from 'react-intl';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import Wsdl from 'AppData/Wsdl';
import ProvideAdvertiseOnlyAPI from './Steps/ProvideAdvertiseOnlyAPI';

/**
 * Handle API creation from WSDL.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiImportAdvertiseOnlyAPI(props) {
    const [isCreating, setCreating] = useState();
    const [wizardStep, setWizardStep] = useState(0);
    const { history } = props;

    /**
     *
     * Reduce the events triggered from API input fields to current state
     */
    function apiInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'type':
            case 'inputValue':
            case 'name':
            case 'version':
            case 'context':
            case 'originalDevPortalUrl':
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
                };
            default:
                return currentState;
        }
    }

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'REST',
        inputType: 'url',
        inputValue: '',
        formValidity: false,
    });

    const apiTypeKeys = {
        REST: 'HTTP',
        SOAP: 'SOAP',
        GraphQL: 'GRAPHQL',
        Async: 'ASYNC',
        Other: 'OTHER',
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
     * @param {*} isFormValid
     */
    function handleOnValidate(isFormValid) {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    /**
     *
     */
    function createAPI() {
        setCreating(true);
        const {
            name, version, context, inputValue, inputType, type, implementationType, originalDevPortalUrl,
        } = apiInputs;
        const additionalProperties = {
            name,
            version,
            context,
            implementationType,
            type: apiTypeKeys[type],
        };

        additionalProperties.advertiseInfo = {
            advertised: true,
            originalDevPortalUrl,
            apiOwner: 'admin',
            vendor: 'WSO2',
        };

        const newAPI = new API(additionalProperties);
        if (type === 'HTTP' || type === 'REST') {
            const promisedResponse = inputType === 'file'
                ? newAPI.importOpenAPIByFile(inputValue) : newAPI.importOpenAPIByUrl(inputValue);
            promisedResponse
                .then((api) => {
                    Alert.info('API created successfully');
                    history.push(`/apis/${api.id}/overview`);
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while adding the API');
                    }
                    console.error(error);
                })
                .finally(() => setCreating(false));
        } else if (type === 'SOAP') {
            let promisedWSDLImport;
            if (apiInputs.inputType === 'url') {
                promisedWSDLImport = Wsdl.importByUrl(apiInputs.inputValue, additionalProperties);
            } else {
                promisedWSDLImport = Wsdl.importByFileOrArchive(apiInputs.inputValue, additionalProperties);
            }
            promisedWSDLImport
                .then((api) => {
                    Alert.info('API created successfully');
                    history.push(`/apis/${api.id}/overview`);
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while adding the API');
                    }
                    console.error(error);
                })
                .finally(() => setCreating(false));
        } else if (type === 'GraphQL') {
            const apiData = {
                additionalProperties: JSON.stringify(additionalProperties),
                implementationType,
                file: inputValue,
            };
            newAPI
                .importGraphQL(apiData)
                .then((response) => {
                    const uuid = response.obj.id;
                    Alert.info(`${name} API created successfully`);
                    history.push(`/apis/${uuid}/overview`);
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while adding the API');
                    }
                    console.error(error);
                })
                .finally(() => setCreating(false));
        } else if (type === 'Async') {
            const promisedResponse = inputType === 'file'
                ? newAPI.importAsyncAPIByFile(inputValue) : newAPI.importAsyncAPIByUrl(inputValue);
            promisedResponse
                .then((api) => {
                    Alert.info('API created successfully');
                    history.push(`/apis/${api.id}/overview`);
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while adding the API');
                    }
                    console.error(error);
                })
                .finally(() => setCreating(false));
        }
    }

    return (
        <APICreateBase
            title={(
                <>
                    <Typography variant='h5'>
                        <FormattedMessage
                            id='Apis.Create.AdvertiseOnlyAPI.ApiImportAdvertiseOnlyAPI.heading'
                            defaultMessage='Create an Advertise Only API using an API definition'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Create.AdvertiseOnlyAPI.ApiImportAdvertiseOnlyAPI.sub.heading'
                            defaultMessage={
                                'Create an Advertise Only API using an existing OpenAPI/WSDL/GraphQL SDL/Async API '
                                + 'definition file or URL.'
                            }
                        />
                    </Typography>
                </>
            )}
        >
            <Box>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    <Step>
                        <StepLabel>Provide API Definition</StepLabel>
                    </Step>

                    <Step>
                        <StepLabel>Create API</StepLabel>
                    </Step>
                </Stepper>
            </Box>

            <Grid container spacing={3}>
                <Grid item md={1} />
                <Grid item md={11}>
                    {wizardStep === 0 && (
                        <ProvideAdvertiseOnlyAPI
                            onValidate={handleOnValidate}
                            apiInputs={apiInputs}
                            inputsDispatcher={inputsDispatcher}
                        />
                    )}
                    {wizardStep === 1 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            api={apiInputs}
                            isAPIProduct={false}
                            hideEndpoint
                            externalStoreURL
                        />
                    )}
                </Grid>
                <Grid item md={1} />
                <Grid item md={9}>
                    <Grid container direction='row' justify='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/apis/'>
                                    <Button>
                                        <FormattedMessage
                                            id='Apis.Create.AdvertiseOnlyAPI.ApiImportAdvertiseOnlyAPI.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {wizardStep === 1 && (
                                <Button onClick={
                                    () => setWizardStep((step) => step - 1)
                                }
                                >
                                    Back
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
                                >
                                    Next
                                </Button>
                            )}
                            {wizardStep === 1 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid || isCreating}
                                    onClick={createAPI}
                                >
                                    Create
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

ApiImportAdvertiseOnlyAPI.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};
