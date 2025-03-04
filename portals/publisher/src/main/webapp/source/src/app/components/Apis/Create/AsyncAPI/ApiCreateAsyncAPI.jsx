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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
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

import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import Chip from '@mui/material/Chip';
import Joi from '@hapi/joi';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { upperCaseString } from 'AppData/stringFormatter';
import ExternalEndpoint from 'AppComponents/Apis/Create/AsyncAPI/ExternalEndpoint';
import ProvideAsyncAPI from './Steps/ProvideAsyncAPI';

const PREFIX = 'ApiCreateAsyncAPI';

const classes = {
    mandatoryStar: `${PREFIX}-mandatoryStar`,
    externalEndpointWarning: `${PREFIX}-externalEndpointWarning`,
    alertTitle: `${PREFIX}-alertTitle`
};

const StyledAPICreateBase = styled(APICreateBase)((
    {
        theme
    }
) => ({
    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },

    [`& .${classes.externalEndpointWarning}`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.alertTitle}`]: {
        fontWeight: theme.typography.fontWeightMedium,
        marginTop: -2,
    }
}));

/**
 * Handle API creation from OpenAPI Definition.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiCreateAsyncAPI(props) {
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

    // eslint-disable-next-line no-use-before-define

    const [hideEndpoint, setHideEndpoint] = useState(true);
    const [hideExternalEndpoint, setHideExternalEndpoint] = useState(true);
    const [isValidExternalEndpoint, setValidExternalEndpoint] = useState(true);

    const intl = useIntl();
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
            case 'gatewayVendor':
            case 'asyncTransportProtocols':
            case 'protocol':
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
                    gatewayVendor: value.gatewayVendor,
                    asyncTransportProtocols: value.asyncTransportProtocols,
                };
            case 'externalEndpoint':
                return { ...currentState, [action]: value };
            default:
                return currentState;
        }
    }

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'ApiCreateAsyncAPI',
        inputType: 'url',
        inputValue: '',
        formValidity: false,
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    if (assistantInfo && wizardStep === 0 && assistantInfo.source === 'DesignAssistant') {
        setWizardStep(1);
        inputsDispatcher({ action: 'preSetAPI', value: assistantInfo });
        inputsDispatcher({ action: 'protocol', value: assistantInfo.protocol });
        inputsDispatcher({ action: 'endpoint', value: assistantInfo.endpoint });
        inputsDispatcher({ action: 'inputType', value: 'file' });
        inputsDispatcher({ action: 'inputValue', value: assistantInfo.file });
    }

    const protocols = [
        {
            name: 'ws',
            displayName: 'WebSocket',
            description: 'WebSocket API',
        },
        {
            name: 'websub',
            displayName: 'WebSub',
            description: 'WebHook API based on WebSub specification',
        },
        {
            name: 'sse',
            displayName: 'SSE',
            description: 'Server-Sent Events',
        },
        {
            name: 'other',
            displayName: 'Other',
            description: 'Other Async APIs such as AMQP, MQTT etc.',
        },
    ];

    const protocolKeys = {
        WebSocket: 'WS',
        SSE: 'SSE',
        WebSub: 'WEBSUB',
        Other: 'ASYNC',
    };

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
     * Validate the external endpoint URL
     * @param value endpoint URL
     * @returns {boolean} validity of the URL
     */
    function validateEndpoint(value) {
        if (value) {
            const urlSchema = Joi.string().uri().empty();
            return !urlSchema.validate(value).error;
        }
        return false;
    }

    /**
     *
     *
     * @param {*} event
     */
    function handleOnChangeForProtocol(event) {
        const { name: action, value } = event.target;
        if (value === 'WebSub') {
            setHideEndpoint(true);
            setHideExternalEndpoint(true);
            setValidExternalEndpoint(true);
        } else if (value === 'Other') {
            setHideEndpoint(true);
            setHideExternalEndpoint(false);
            setValidExternalEndpoint(validateEndpoint(apiInputs.externalEndpoint));
        } else {
            setHideEndpoint(false);
            setHideExternalEndpoint(true);
            setValidExternalEndpoint(true);
        }
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
            name, version, context, endpoint, policies, inputValue, inputType, protocol, gatewayVendor,
            externalEndpoint,
        } = apiInputs;
        const additionalProperties = {
            name,
            version,
            context,
            policies,
            type: protocolKeys[protocol],
            gatewayVendor,
        };
        if (gatewayVendor === 'solace') {
            additionalProperties.type = protocolKeys.WebSub;
        }
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
        if (protocolKeys[protocol] === 'ASYNC') {
            additionalProperties.advertiseInfo = {
                advertised: true,
                apiExternalProductionEndpoint: externalEndpoint,
                apiExternalSandboxEndpoint: externalEndpoint,
                originalDevPortalUrl: '',
                apiOwner: 'admin',
                vendor: 'WSO2',
            };
        }
        const newAPI = new API(additionalProperties);
        const promisedResponse = inputType === 'file'
            ? newAPI.importAsyncAPIByFile(inputValue) : newAPI.importAsyncAPIByUrl(inputValue);
        promisedResponse
            .then((api) => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.AsyncAPI.ApiCreateAsyncAPI.created.success',
                    defaultMessage: 'API created successfully',
                }));
                history.push(`/apis/${api.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Create.AsyncAPI.ApiCreateAsyncAPI.created.error',
                        defaultMessage: 'Something went wrong while adding the API',
                    }));
                }
                console.error(error);
            })
            .finally(() => setCreating(false));
    }

    return (
        <StyledAPICreateBase
            title={(
                <>
                    <Typography variant='h5'>
                        <FormattedMessage
                            id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.heading'
                            defaultMessage='Create an API using an AsyncAPI definition.'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.sub.heading'
                            defaultMessage='Create an API using an existing AsyncAPI definition file or URL.'
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
                                id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.wizard.one'
                                defaultMessage='Provide AsyncAPI'
                            />
                        </StepLabel>
                    </Step>

                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.wizard.two'
                                defaultMessage='Create API'
                            />
                        </StepLabel>
                    </Step>
                </Stepper>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {wizardStep === 0 && (
                        <ProvideAsyncAPI
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
                            hideEndpoint={hideEndpoint}
                            endpointPlaceholderText='Streaming Provider'
                            appendChildrenBeforeEndpoint
                            multiGateway={multiGateway}
                            settings={settings}
                        >
                            <Grid container spacing={2}>
                                {apiInputs.gatewayVendor === 'solace'
                                    && apiInputs.asyncTransportProtocols.length !== 0 && (
                                    <>
                                        <Grid item xs={12} md={6} lg={3}>
                                            <Typography component='p' variant='subtitle2'>
                                                <FormattedMessage
                                                    id='Apis.Details.NewOverview.MetaData.solace.transports'
                                                    defaultMessage='Available Protocols'
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6} lg={9}>
                                            {apiInputs.asyncTransportProtocols.map((protocol) => (
                                                <Chip
                                                    data-testid={upperCaseString(protocol) + '-label'}
                                                    key={protocol}
                                                    label={upperCaseString(protocol)}
                                                    style={{
                                                        'font-size': 13,
                                                        height: 20,
                                                        marginRight: 5,
                                                    }}
                                                    color='primary'
                                                />
                                            ))}
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            {apiInputs.gatewayVendor === 'wso2' && (
                                <TextField
                                    fullWidth
                                    select
                                    label={(
                                        <>
                                            <FormattedMessage
                                                id='Apis.Create.asyncAPI.Components.SelectPolicies.business.plans'
                                                defaultMessage='Protocol'
                                            />
                                            <sup className={classes.mandatoryStar}>*</sup>
                                        </>
                                    )}
                                    value={apiInputs.protocol}
                                    name='protocol'
                                    SelectProps={{
                                        multiple: false,
                                        renderValue: (selected) => (selected),
                                    }}
                                    margin='normal'
                                    variant='outlined'
                                    InputProps={{
                                        id: 'itest-id-apipolicies-input',
                                    }}
                                    onChange={handleOnChangeForProtocol}
                                >
                                    {protocols.map((protocol) => (
                                        <MenuItem
                                            dense
                                            disableGutters={false}
                                            id={protocol.name}
                                            key={protocol.name}
                                            value={protocol.displayName}
                                        >
                                            <ListItemText
                                                primary={protocol.displayName}
                                                secondary={protocol.description}
                                            />
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                            {!hideExternalEndpoint && (
                                <ExternalEndpoint
                                    classes={classes}
                                    apiInputs={apiInputs}
                                    inputsDispatcher={inputsDispatcher}
                                    isValidExternalEndpoint={isValidExternalEndpoint}
                                    setValidExternalEndpoint={setValidExternalEndpoint}
                                    validateEndpoint={validateEndpoint}
                                />
                            )}
                        </DefaultAPIForm>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/apis/'>
                                    <Button>
                                        <FormattedMessage
                                            id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {wizardStep === 1 && (
                                (assistantInfo && assistantInfo.source ===  'DesignAssistant') ? (
                                    <Button onClick={handleBackButtonOnClick}>
                                        <FormattedMessage
                                            id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.designAssistant.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setWizardStep((step) => step - 1)}>
                                        <FormattedMessage
                                            id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                )
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Button
                                    data-testid='next-btn'
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid}
                                >
                                    <FormattedMessage
                                        id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 1 && (
                                <Button
                                    data-testid='asyncapi-create-btn'
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid || isCreating || !isValidExternalEndpoint}
                                    onClick={createAPI}
                                >
                                    <FormattedMessage
                                        id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.create'
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
        </StyledAPICreateBase>
    );
}

ApiCreateAsyncAPI.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};
