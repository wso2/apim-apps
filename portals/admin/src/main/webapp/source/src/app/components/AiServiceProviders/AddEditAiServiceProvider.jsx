/*
 *
 * Copyright (c) 2024 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useReducer, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import the v4 UUID generator
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    MenuItem,
    Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MuiChipsInput } from 'mui-chips-input';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import AIAPIDefinition from './AiApiDefinition';
import ModelProviders from './ModelProviders';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

const StyledHr = styled('hr')({ border: 'solid 1px #efefef' });

const StyledContentBase = styled(ContentBase)({
    '@global': {
        '.MuiFormControl-root': {
            marginTop: '20px',
        },
        '.MuiFormControl-root:first-of-type': {
            marginTop: '0',
        },
    },
});

/**
 * Reducer
 * @param {JSON} state The current state.
 * @param {Object} newValue The action object containing field and value.
 * @returns {Promise} The new state.
 */
function reducer(state, newValue) {
    const { field, value } = newValue;
    switch (field) {
        case 'name':
        case 'apiVersion':
        case 'description':
        case 'modelList':
        case 'multipleModelProviderSupport':
        case 'apiDefinition':
        case 'models':
            return { ...state, [field]: value };
        case 'requestModel':
        case 'responseModel':
        case 'promptTokenCount':
        case 'completionTokenCount':
        case 'totalTokenCount':
        case 'remainingTokenCount':
            return {
                ...state,
                configurations: {
                    ...state.configurations,
                    metadata: state.configurations.metadata.map((item) => (
                        item.attributeName === field
                            ? { ...item, ...value }
                            : item
                    )),
                },
            };
        case 'authHeader':
        case 'authQueryParameter':
        case 'connectorType':
            return {
                ...state,
                configurations: {
                    ...state.configurations,
                    [field]: value,
                },
            };
        case 'all':
            return value;
        default:
            return state;
    }
}

/**
 * AddEditAiServiceProvider component
 * @param {*} props props passed from parents.
 * @returns {JSX} AddEditAiServiceProvider component.
 */
export default function AddEditAiServiceProvider(props) {
    const intl = useIntl();
    const [saving, setSaving] = useState(false);
    const { match: { params: { id: vendorId } }, history } = props;
    const inputSources = ['payload', 'header', 'queryParams', 'pathParams'];
    const [authConfig, setAuthenticationConfiguration] = useState({
        enabled: 'false',
        type: 'none',
        parameters: {},
    });
    const authSources = ['none', 'apikey', 'aws'];
    const [validating, setValidating] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(!!vendorId); // Set to true if editing (vendorId exists)
    const location = useLocation();

    const [initialState] = useState({
        name: '',
        apiVersion: '',
        description: '',
        configurations: {
            metadata: [
                {
                    attributeName: 'requestModel',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                    required: false,
                },
                {
                    attributeName: 'responseModel',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                    required: true,
                },
                {
                    attributeName: 'promptTokenCount',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                    required: true,
                },
                {
                    attributeName: 'completionTokenCount',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                    required: true,
                },
                {
                    attributeName: 'totalTokenCount',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                    required: true,
                },
                {
                    attributeName: 'remainingTokenCount',
                    inputSource: 'header',
                    attributeIdentifier: '',
                    required: false,
                },
            ],
            connectorType: '',
            authQueryParameter: '',
            authHeader: '',
        },
        multipleModelProviderSupport: false,
        apiDefinition: '',
        modelList: [],
        models: [],
    });

    const [state, dispatch] = useReducer(reducer, initialState);

    const pageTitle = vendorId ? `${intl.formatMessage({
        id: 'AiServiceProviders.AddEditAiServiceProvider.title.edit',
        defaultMessage: 'AI Service Provider - Edit ',
    })} ${state.name}` : intl.formatMessage({
        id: 'AiServiceProviders.AddEditAiServiceProvider.title.new',
        defaultMessage: 'AI Service Provider - Create new',
    });

    useEffect(() => {
        const fetchData = async () => {
            if (vendorId) {
                try {
                    const aiVendorResult = await new API().getAiServiceProvider(vendorId);
                    const aiVendorBody = aiVendorResult.body;
                    if (aiVendorBody) {
                        let models = [];
                        let modelList = [];
                        if (aiVendorBody.modelProviders) {
                            models = aiVendorBody.modelProviders;
                            modelList = models.find((item) => item.name === aiVendorBody.name);
                            modelList = modelList ? modelList.models : [];
                            models = models.map((model) => ({
                                ...model, id: uuidv4(),
                            }));
                        }
                        if (aiVendorBody.configurations) {
                            const config = JSON.parse(aiVendorBody.configurations);
                            if (config.authenticationConfiguration) {
                                setAuthenticationConfiguration({
                                    enabled: config.authenticationConfiguration.enabled,
                                    type: config.authenticationConfiguration.type,
                                    parameters: config.authenticationConfiguration.parameters ?? {},
                                });
                            } else {
                                const hasAuthHeader = config.authHeader && config.authHeader.trim() !== '';
                                const hasAuthQueryParameter = config.authQueryParameter
                                    && config.authQueryParameter.trim() !== '';
                                if (hasAuthHeader || hasAuthQueryParameter) {
                                    setAuthenticationConfiguration({
                                        enabled: 'true',
                                        type: 'apikey',
                                        parameters: {
                                            headersEnabled: !!hasAuthHeader,
                                            headerName: config.authHeader || '',
                                            queryParameterEnabled: !!hasAuthQueryParameter,
                                            queryParameterName: config.authQueryParameter || '',
                                        },
                                    });
                                } else {
                                    setAuthenticationConfiguration({
                                        enabled: 'false',
                                        type: 'none',
                                    });
                                }
                            }
                        }
                        const newState = {
                            name: aiVendorBody.name || '',
                            apiVersion: aiVendorBody.apiVersion || '',
                            description: aiVendorBody.description || '',
                            configurations: JSON.parse(aiVendorBody.configurations),
                            apiDefinition: aiVendorBody.apiDefinition || '',
                            modelList,
                            models,
                            multipleModelProviderSupport: aiVendorBody.multipleModelProviderSupport || false,
                        };
                        dispatch({ field: 'all', value: newState });

                        setFile(new Blob([aiVendorBody.apiDefinition || ''], { type: 'text/plain;charset=utf-8' }));
                    }
                } catch (error) {
                    console.error('Error fetching AI Service Provider data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // No vendorId means create mode, no loading needed
            }
        };

        fetchData();
    }, [vendorId]);

    /**
     * Effect to update the state when isSingleProvider changes.
     */
    useEffect(() => {
        if (location.state?.isSingleProvider !== undefined) {
            dispatch({
                field: 'multipleModelProviderSupport',
                value: !location.state.isSingleProvider,
            });
        }
    }, []);

    const camelCaseToTitleCase = (camelCaseStr) => {
        return camelCaseStr
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const camelCaseToSentence = (camelCaseStr) => {
        return camelCaseStr
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .replace(/\b(?!^)\w+/g, (str) => str.toLowerCase());
    };

    const hasErrors = (fieldName, fieldValue, validatingActive) => {
        let error = false;
        if (!validatingActive) {
            return false;
        }
        switch (fieldName) {
            case 'name':
                if (fieldValue.trim() === '') {
                    error = `AI Service Provider name ${intl.formatMessage({
                        id: 'AiServiceProviders.AddEditAiServiceProvider.is.empty.error',
                        defaultMessage: ' is empty',
                    })}`;
                }
                break;
            case 'apiVersion':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiServiceProviders.AddEditAiServiceProvider.is.empty.error.apiVersion',
                        defaultMessage: 'Required field is empty.',
                    });
                }
                break;
            case 'inputSource':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiServiceProviders.AddEditAiServiceProvider.is.empty.error.inputSource',
                        defaultMessage: 'Input source is required.',
                    });
                }
                break;
            case 'attributeIdentifier':
                if (fieldValue.required && fieldValue.attributeIdentifier.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiServiceProviders.AddEditAiServiceProvider.is.empty.error.attributeIdentifier',
                        defaultMessage: 'Attribute identifier is required.',
                    });
                }
                break;
            case 'connectorType':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiServiceProviders.AddEditAiServiceProvider.is.empty.error.connectorType',
                        defaultMessage: 'Connector type is required.',
                    });
                }
                break;
            case 'providerName':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiServiceProviders.AddEditAiServiceProvider.is.empty.error.providerName',
                        defaultMessage: 'Provider name is required.',
                    });
                }
                break;
            default:
                break;
        }
        return error;
    };

    const formHasErrors = (validatingActive = false) => {
        const metadataErrors = state.configurations.metadata.map((meta) => {
            return hasErrors('attributeIdentifier', meta, validatingActive)
                || hasErrors('inputSource', meta.inputSource, validatingActive);
        });

        // Check for errors in model provider entries
        const modelProviderEntriesErrors = state.models.some((entry) => entry.name.trim() === '');

        return hasErrors('name', state.name, validatingActive)
            || hasErrors('apiVersion', state.apiVersion, validatingActive)
            || hasErrors('connectorType', state.configurations.connectorType, validatingActive)
            || metadataErrors.some((error) => error)
            || modelProviderEntriesErrors;
    };

    const formSaveCallback = async () => {
        setValidating(true);
        if (formHasErrors(true)) {
            Alert.error(intl.formatMessage({
                id: 'AiServiceProviders.AddEditAiServiceProvider.form.has.errors',
                defaultMessage: 'One or more fields contain errors.',
            }));
            return false;
        }

        setSaving(true);

        try {
            let updatedConfigurations = {
                metadata: state.configurations.metadata,
                connectorType: state.configurations.connectorType,
            };
            updatedConfigurations = {
                ...updatedConfigurations,
                authenticationConfiguration: authConfig,
            };
            let models;
            if (state.multipleModelProviderSupport) {
                models = state.models.map(({ id, ...rest }) => rest);
            } else {
                models = [{ name: state.name, models: state.modelList }];
            }

            const requestPayload = {
                name: state.name,
                apiVersion: state.apiVersion,
                description: state.description,
                multipleModelProviderSupport: state.multipleModelProviderSupport,
                configurations: JSON.stringify(updatedConfigurations),
                modelList: models,
                apiDefinition: file,
            };

            if (vendorId) {
                await new API().updateAIServiceProvider(vendorId, requestPayload);
                Alert.success(`${state.name} ${intl.formatMessage({
                    id: 'AiVendor.edit.success',
                    defaultMessage: ' - AI Service Provider edited successfully.',
                })}`);
            } else {
                await new API().addAIServiceProvider(requestPayload);
                Alert.success(`${state.name} ${intl.formatMessage({
                    id: 'AiVendor.add.success.msg',
                    defaultMessage: ' - AI Service Provider added successfully.',
                })}`);
            }

            setSaving(false);
            history.push('/settings/ai-service-providers/');
        } catch (e) {
            if (e.message) {
                Alert.error(e.message);
            }
            setSaving(false);
        }

        setSaving(false);

        return true;
    };

    const clearAuthHeader = () => {
        setAuthenticationConfiguration((prev) => ({
            ...prev,
            parameters: {},
        }));
    };

    function setAuthType(type) {
        if (type === 'none') {
            authConfig.enabled = false;
            authConfig.type = 'none';
        } else {
            authConfig.enabled = true;
            authConfig.type = type;
        }
    }

    // Add this helper function above your component
    function getApiKeyLocation(authConfiguration) {
        if (authConfiguration?.parameters?.headerEnabled) {
            return 'header';
        }
        if (authConfiguration?.parameters?.queryParameterEnabled) {
            return 'queryParameter';
        }
        return '';
    }

    // Add this function inside your component, above the return statement
    const handleApiKeyLocationChange = (e) => {
        const { value } = e.target;
        setAuthenticationConfiguration((prev) => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                headerEnabled: value === 'header',
                queryParameterEnabled: value === 'queryParameter',
            },
        }));
    };

    /**
     * Gets the appropriate placeholder text based on provider name
     * @param {string} providerName - The name of the AI service provider
     * @returns {object} Object with id and defaultMessage for intl.formatMessage
     */
    const getModelPlaceholder = (providerName) => {
        if (providerName === 'AzureOpenAI') {
            return {
                id: 'AiServiceProviders.AddEditAiServiceProvider.modelList.placeholder.deploymentId',
                defaultMessage: 'Type deployment ID and press Enter',
            };
        }
        return {
            id: 'AiServiceProviders.AddEditAiServiceProvider.modelList.placeholder',
            defaultMessage: 'Type model name and press Enter',
        };
    };

    /**
     * Handles changes to the API key identifier input.
     * Updates headerName or queryParameterName in authConfig.parameters.
     * @param {Event} e - The input change event
     */
    const handleApiKeyIdentifierChange = (e) => {
        const { value } = e.target;
        setAuthenticationConfiguration((prev) => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                ...(prev.parameters.headerEnabled
                    ? { headerName: value }
                    : {}),
                ...(prev.parameters.queryParameterEnabled
                    ? { queryParameterName: value }
                    : {}),
            },
        }));
    };

    // Show loading spinner while fetching data in edit mode
    if (loading) {
        return (
            <StyledContentBase
                pageStyle='half'
                title={pageTitle}
                help={<div />}
            >
                <Box
                    component='div'
                    m={2}
                    display='flex'
                    justifyContent='center'
                    alignItems='center'
                    minHeight='400px'
                >
                    <CircularProgress size={48} />
                </Box>
            </StyledContentBase>
        );
    }

    return (
        <StyledContentBase
            pageStyle='half'
            title={pageTitle}
            help={<div />}
        >
            <Box component='div' m={2} sx={(theme) => ({ mb: theme.spacing(10) })}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiServiceProviders.AddEditAiServiceProvider.general.details.div'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.general.details'
                                defaultMessage='General Details'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiServiceProviders.AddEditAiServiceProvider.general.details.description.div'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.general.details.description'
                                defaultMessage='Provide name and description of the AI Service Provider'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <Grid container>
                                <Grid item xs={6}>
                                    <TextField
                                        id='name'
                                        autoFocus
                                        margin='dense'
                                        name='name'
                                        label={(
                                            <span>
                                                <FormattedMessage
                                                    id='AiServiceProviders.AddEditAiServiceProvider.form.name'
                                                    defaultMessage='Name'
                                                />

                                                <StyledSpan>*</StyledSpan>
                                            </span>
                                        )}
                                        fullWidth
                                        variant='outlined'
                                        value={state.name}
                                        disabled={!!vendorId}
                                        onChange={(e) => dispatch({
                                            field: 'name',
                                            value: e.target.value,
                                        })}
                                        error={hasErrors('name', state.name, validating)}
                                        helperText={hasErrors('name', state.name, validating) || intl.formatMessage({
                                            id: 'AiServiceProviders.AddEditAiServiceProvider.form.name.help',
                                            defaultMessage: 'Name of the AI Service Provider.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Box ml={1}>
                                        <TextField
                                            id='api-version'
                                            margin='dense'
                                            name='apiVersion'
                                            fullWidth
                                            variant='outlined'
                                            value={state.apiVersion}
                                            disabled={!!vendorId}
                                            onChange={(e) => dispatch({
                                                field: 'apiVersion',
                                                value: e.target.value,
                                            })}
                                            label={(
                                                <span>
                                                    <FormattedMessage
                                                        id='Admin.AiVendor.label.apiVersion'
                                                        defaultMessage='API Version'
                                                    />
                                                    <StyledSpan>*</StyledSpan>
                                                </span>
                                            )}
                                            error={hasErrors('apiVersion', state.apiVersion, validating)}
                                            helperText={
                                                hasErrors('apiVersion', state.apiVersion, validating)
                                                || intl.formatMessage({
                                                    id: 'AiServiceProviders.AddEditAiServiceProvider.'
                                                        + 'form.apiVersion.help',
                                                    defaultMessage: 'API Version of the AI Service Provider.',
                                                })
                                            }
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <TextField
                                id='description'
                                multiline
                                minRows={4}
                                maxRows={10}
                                margin='dense'
                                name='description'
                                label={(
                                    <FormattedMessage
                                        id='AiServiceProviders.AddEditAiServiceProvider.form.description'
                                        defaultMessage='Description'
                                    />
                                )}
                                fullWidth
                                variant='outlined'
                                value={state.description}
                                onChange={(e) => dispatch({
                                    field: 'description',
                                    value: e.target.value,
                                })}
                                helperText={intl.formatMessage({
                                    id: 'AiServiceProviders.AddEditAiServiceProvider.form.description.help',
                                    defaultMessage: 'Description of the AI Service Provider.',
                                })}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiServiceProviders.AddEditAiServiceProvider.model.providers.header'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.model.providers'
                                defaultMessage='Model Provider(s)'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiServiceProviders.AddEditAiServiceProvider.model.providers.body'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.model.providers.description'
                                defaultMessage='Configure model provider(s) for the AI Service Provider'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <RadioGroup
                                        aria-label='multipleModelProviderSupport'
                                        name='multipleModelProviderSupport'
                                        value={state.multipleModelProviderSupport ? 'true' : 'false'}
                                        onChange={(e) => {
                                            const isMultiple = e.target.value === 'true';
                                            dispatch({
                                                field: 'multipleModelProviderSupport',
                                                value: isMultiple,
                                            });
                                            // Clear the state when switching modes (only if not in edit mode)
                                            if (!vendorId) {
                                                if (isMultiple) {
                                                    // Switching to multiple provider mode - clear single provider state
                                                    dispatch({ field: 'modelList', value: [] });
                                                } else {
                                                    // Switching to single provider mode - clear multiple provider state
                                                    dispatch({ field: 'models', value: [] });
                                                }
                                            }
                                        }}
                                        sx={{ display: 'flex', flexDirection: 'row' }}
                                    >
                                        <FormControlLabel
                                            value='false'
                                            control={<Radio disabled={!!vendorId} />}
                                            label={intl.formatMessage({
                                                id: 'AiServiceProviders.AddEditAiServiceProvider.single.model.provider',
                                                defaultMessage: 'Single Model Provider',
                                            })}
                                            disabled={!!vendorId}
                                        />
                                        <FormControlLabel
                                            value='true'
                                            control={<Radio disabled={!!vendorId} />}
                                            label={intl.formatMessage({
                                                id: 'AiServiceProviders.AddEditAiServiceProvider.multi.model.provider',
                                                defaultMessage: 'Multi Model Provider',
                                            })}
                                            disabled={!!vendorId}
                                        />
                                    </RadioGroup>
                                </Grid>
                                <Grid item xs={12} mt={1}>
                                    {state.multipleModelProviderSupport ? (
                                        <ModelProviders
                                            models={state.models}
                                            onModelsChange={(newModels) => dispatch({
                                                field: 'models',
                                                value: newModels,
                                            })}
                                            hasErrors={hasErrors}
                                            validating={validating}
                                            providerName={state.name}
                                        />
                                    ) : (
                                        <MuiChipsInput
                                            variant='outlined'
                                            fullWidth
                                            value={state.modelList}
                                            onAddChip={(model) => {
                                                const updatedList = [...state.modelList, model];
                                                dispatch({ field: 'modelList', value: updatedList });
                                            }}
                                            onDeleteChip={(model) => {
                                                const filteredModelList = state.modelList.filter(
                                                    (modelItem) => modelItem !== model,
                                                );
                                                dispatch({ field: 'modelList', value: filteredModelList });
                                            }}
                                            placeholder={intl.formatMessage(getModelPlaceholder(state.name))}
                                            data-testid='ai-vendor-llm-model-list'
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <>
                        <Grid item xs={12}>
                            <Box marginTop={2} marginBottom={2}>
                                <StyledHr />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={12} lg={3}>
                            <Typography
                                color='inherit'
                                variant='subtitle2'
                                component='div'
                                id='llm-configurations'
                            >
                                <FormattedMessage
                                    id='AiServiceProviders.AddEditAiServiceProvider.AiVendor.configurations.llm'
                                    defaultMessage='LLM Configurations'
                                />
                            </Typography>
                            <Typography
                                color='inherit'
                                variant='caption'
                                component='p'
                                id='AddEditAiServiceProvider.External.AiVendor.configurations.llm.container'
                            >
                                <FormattedMessage
                                    id={'AiServiceProviders.AddEditAiServiceProvider.AiVendor'
                                        + '.general.details.description.llm'}
                                    defaultMessage='Configure to extract LLM related metadata'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={12} lg={9}>
                            {state.configurations.metadata.map((metadata) => (
                                <>
                                    <Box display='flex' marginBottom={2}>
                                        <Typography
                                            color='inherit'
                                            variant='subtitle2'
                                            component='div'
                                            id={
                                                'AiServiceProviders.AddEditAiServiceProvider.llm.configuration.'
                                                + `${metadata.attributeName}.div`
                                            }
                                        >
                                            <FormattedMessage
                                                id={
                                                    'AiServiceProviders.AddEditAiServiceProvider.llm.configuration.'
                                                    + `${metadata.attributeName}`
                                                }
                                                defaultMessage={camelCaseToTitleCase(metadata.attributeName)}
                                            />
                                        </Typography>
                                    </Box>
                                    <Box component='div' m={1}>
                                        <FormControl
                                            variant='outlined'
                                            fullWidth
                                            error={!!hasErrors('inputSource', metadata.inputSource, validating)}
                                        >
                                            <Select
                                                variant='outlined'
                                                id={`Admin.AiVendor.form.llm.${metadata.attributeName}.select`}
                                                name='inputSource'
                                                value={metadata.inputSource || inputSources[0]}
                                                onChange={(e) => dispatch({
                                                    field: `${metadata.attributeName}`,
                                                    value: {
                                                        inputSource: e.target.value,
                                                    },
                                                })}
                                                data-testid={`ai-vendor-llm-${metadata.attributeName}-select`}
                                            >
                                                {inputSources
                                                    .map((modelSource) => (
                                                        <MenuItem key={modelSource} value={modelSource}>
                                                            {modelSource}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            <TextField
                                                id={`Admin.AiVendor.form.llm.${metadata.attributeName}.select.input`}
                                                margin='dense'
                                                name='model.attributeIdentifier'
                                                label={(
                                                    <span>
                                                        <FormattedMessage
                                                            id={
                                                                'Admin.AiVendor.form.llm.'
                                                                + `${metadata.attributeName}.select.input.message`
                                                            }
                                                            defaultMessage={
                                                                `${camelCaseToSentence(metadata.attributeName)}`
                                                                + ' identifier'
                                                            }
                                                        />
                                                        {metadata.required && <StyledSpan>*</StyledSpan>}
                                                    </span>
                                                )}
                                                fullWidth
                                                variant='outlined'
                                                value={metadata.attributeIdentifier}
                                                onChange={(e) => dispatch({
                                                    field: `${metadata.attributeName}`,
                                                    value: {
                                                        attributeIdentifier: e.target.value,
                                                    },
                                                })}
                                                error={hasErrors(
                                                    'attributeIdentifier',
                                                    metadata,
                                                    validating,
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </>
                            ))}
                        </Grid>
                    </>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiServiceProviders.AddEditAiServiceProvider.apiDefinition.header'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.apiDefinition'
                                defaultMessage='API Definition'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiServiceProviders.AddEditAiServiceProvider.apiDefinition.body'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.apiDefinition.description'
                                defaultMessage='Upload API Definition of the AI Service Provider'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div'>
                            <AIAPIDefinition
                                apiDefinition={state.apiDefinition}
                                vendorName={state.name}
                                file={file}
                                setFile={setFile}
                                dispatch={dispatch}
                            />
                        </Box>
                    </Grid>
                    <>
                        <Grid item xs={12}>
                            <Box marginTop={2} marginBottom={2}>
                                <StyledHr />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={12} lg={3}>
                            <Typography
                                color='inherit'
                                variant='subtitle2'
                                component='div'
                                id='llm-auth-configurations'
                            >
                                <FormattedMessage
                                    id='AiServiceProviders.AddEditAiServiceProvider.AiVendor.configurations.llm.auth'
                                    defaultMessage='LLM Provider Auth Configurations'
                                />
                            </Typography>
                            <Typography
                                color='inherit'
                                variant='caption'
                                component='p'
                                id='AddEditAiServiceProvider.External.AiVendor.configurations.llm.auth.container'
                            >
                                <FormattedMessage
                                    id={'AiServiceProviders.AddEditAiServiceProvider.AiVendor'
                                        + '.general.details.description.llm.auth'}
                                    defaultMessage='Configure to add LLM provider authorization'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={12} lg={9}>
                            <>
                                <Box component='div' m={1}>
                                    <FormControl
                                        variant='outlined'
                                        fullWidth
                                    >
                                        <Select
                                            variant='outlined'
                                            id='Admin.AiVendor.form.llm.auth.select'
                                            name='authSource'
                                            value={authConfig.type}
                                            onChange={(e) => {
                                                setAuthType(e.target.value);
                                                clearAuthHeader();
                                            }}
                                            data-testid='ai-vendor-llm-auth-select'
                                        >
                                            {authSources
                                                .map((modelAuth) => (
                                                    <MenuItem key={modelAuth} value={modelAuth}>
                                                        {modelAuth}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                        {(authConfig.type === 'apikey') && (
                                            <>
                                                <Box mb={2} mt={2}>
                                                    <FormControl component='fieldset' fullWidth>
                                                        <RadioGroup
                                                            row
                                                            aria-label='API Key Location'
                                                            name='apikeyLocation'
                                                            value={getApiKeyLocation(authConfig)}
                                                            onChange={handleApiKeyLocationChange}
                                                            data-testid='ai-vendor-llm-auth-apikey-location'
                                                        >
                                                            <FormControlLabel
                                                                value='header'
                                                                control={<Radio />}
                                                                label='Header'
                                                            />
                                                            <FormControlLabel
                                                                value='queryParameter'
                                                                control={<Radio />}
                                                                label='Query Parameter'
                                                            />
                                                        </RadioGroup>
                                                    </FormControl>
                                                </Box>
                                                <TextField
                                                    id='Admin.AiVendor.form.llm.auth.select.input'
                                                    margin='dense'
                                                    name='model.auth.attributeIdentifier'
                                                    label={(
                                                        <span>
                                                            <FormattedMessage
                                                                id={
                                                                    'Admin.AiVendor.form.llm.'
                                                                    + 'auth.select.input.message'
                                                                }
                                                                defaultMessage={
                                                                    `${camelCaseToSentence(authConfig.type)} identifier`
                                                                }
                                                            />
                                                        </span>
                                                    )}
                                                    fullWidth
                                                    variant='outlined'
                                                    value={
                                                        (() => {
                                                            if (authConfig?.parameters?.headerEnabled) {
                                                                return authConfig.parameters.headerName ?? '';
                                                            }
                                                            if (authConfig?.parameters?.queryParameterEnabled) {
                                                                return authConfig.parameters.queryParameterName ?? '';
                                                            }
                                                            return '';
                                                        })()
                                                    }
                                                    onChange={handleApiKeyIdentifierChange}
                                                />
                                            </>
                                        )}
                                        {(authConfig.type === 'aws') && (
                                            <TextField
                                                id='Admin.AiVendor.form.llm.auth.aws.service'
                                                margin='dense'
                                                name='awsServiceName'
                                                label={(
                                                    <span>
                                                        <FormattedMessage
                                                            id='Admin.AiVendor.form.llm.auth.aws.service.label'
                                                            defaultMessage='AWS Service Name'
                                                        />
                                                    </span>
                                                )}
                                                fullWidth
                                                variant='outlined'
                                                value={authConfig.parameters?.awsServiceName || ''}
                                                onChange={(e) => setAuthenticationConfiguration((prev) => ({
                                                    ...prev,
                                                    parameters: {
                                                        ...prev.parameters,
                                                        awsServiceName: e.target.value,
                                                    },
                                                }))}
                                                required
                                            />
                                        )}
                                    </FormControl>
                                </Box>
                            </>
                        </Grid>
                    </>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiServiceProviders.AddEditAiServiceProvider.connectorType.header'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.connectorType'
                                defaultMessage='Connector Type for AI Service Provider'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiServiceProviders.AddEditAiServiceProvider.connectorType.body'
                        >
                            <FormattedMessage
                                id='AiServiceProviders.AddEditAiServiceProvider.connectorType.description'
                                defaultMessage='Reference to the connector model for the AI Service Provider'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <TextField
                                id='connectorType'
                                margin='dense'
                                name='connectorType'
                                label={(
                                    <span>
                                        <FormattedMessage
                                            id='AiServiceProviders.AddEditAiServiceProvider.form.connectorType'
                                            defaultMessage='Connector Type'
                                        />

                                        <StyledSpan>*</StyledSpan>
                                    </span>
                                )}
                                fullWidth
                                variant='outlined'
                                value={state.configurations.connectorType}
                                disabled={!!vendorId}
                                onChange={(e) => dispatch({
                                    field: 'connectorType',
                                    value: e.target.value,
                                })}
                                error={hasErrors('connectorType', state.configurations.connectorType, validating)}
                                helperText={hasErrors(
                                    'connectorType',
                                    state.configurations.connectorType,
                                    validating,
                                ) || intl.formatMessage({
                                    id: 'AiServiceProviders.AddEditAiServiceProvider.form.connectorType.help',
                                    defaultMessage: 'Connector Type for AI Service Provider',
                                })}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} mb={2}>
                        <Box component='span' m={1}>
                            <Button
                                id='aivendor-add'
                                variant='contained'
                                color='primary'
                                onClick={formSaveCallback}
                                disabled={!state.apiDefinition}
                            >
                                {saving ? (<CircularProgress size={16} />) : (
                                    <>
                                        {vendorId ? (
                                            <FormattedMessage
                                                id='AiServiceProviders.AddEditAiServiceProvider.form.update.btn'
                                                defaultMessage='Update'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='AiServiceProviders.AddEditAiServiceProvider.form.add'
                                                defaultMessage='Add'
                                            />
                                        )}
                                    </>
                                )}
                            </Button>
                        </Box>
                        <RouterLink to='/settings/ai-service-providers'>
                            <Button variant='outlined'>
                                <FormattedMessage
                                    id='AiServiceProviders.AddEditAiServiceProvider.form.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </RouterLink>
                    </Grid>
                </Grid>
            </Box>
        </StyledContentBase>
    );
}
