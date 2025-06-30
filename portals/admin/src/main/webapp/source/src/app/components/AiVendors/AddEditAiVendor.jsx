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
import { MuiChipsInput } from 'mui-chips-input';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import AIAPIDefinition from './AIAPIDefinition';
import ModelFamily from './ModelFamily';

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
        case 'multipleVendorSupport':
        case 'apiDefinition':
        case 'models': // New case for handling model vendor entries
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
 * AddEditAiVendor component
 * @param {*} props props passed from parents.
 * @returns {JSX} AddEditAiVendor component.
 */
export default function AddEditAiVendor(props) {
    const intl = useIntl();
    const [saving, setSaving] = useState(false);
    const { match: { params: { id: vendorId } }, history } = props;
    const inputSources = ['payload', 'header', 'queryParams'];
    const [authSource, setAuthSource] = useState('authHeader');
    const authSources = ['unsecured', 'authHeader', 'authQueryParameter'];
    const [validating, setValidating] = useState(false);
    const [file, setFile] = useState(null);
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
        multipleVendorSupport: false,
        apiDefinition: '',
        modelList: [],
        models: [],
    });

    const [state, dispatch] = useReducer(reducer, initialState);

    const pageTitle = vendorId ? `${intl.formatMessage({
        id: 'AiVendors.AddEditAiVendor.title.edit',
        defaultMessage: 'AI/LLM Vendor - Edit ',
    })} ${state.name}` : intl.formatMessage({
        id: 'AiVendors.AddEditAiVendor.title.new',
        defaultMessage: 'AI/LLM Vendor - Create new',
    });

    useEffect(() => {
        const fetchData = async () => {
            if (vendorId) {
                const aiVendorResult = await new API().aiVendorGet(vendorId);
                const aiVendorBody = aiVendorResult.body;
                if (aiVendorBody) {
                    let models = [];
                    let modelList = [];
                    if (aiVendorBody.models) {
                        models = JSON.parse(aiVendorBody.models);
                        modelList = models.find((item) => item.vendor === aiVendorBody.name);
                        modelList = modelList ? modelList.values : [];
                        models = models.map((model) => ({
                            ...model, id: uuidv4(),
                        }));
                    }
                    const newState = {
                        name: aiVendorBody.name || '',
                        apiVersion: aiVendorBody.apiVersion || '',
                        description: aiVendorBody.description || '',
                        configurations: JSON.parse(aiVendorBody.configurations),
                        apiDefinition: aiVendorBody.apiDefinition || '',
                        modelList,
                        models,
                        multipleVendorSupport: aiVendorBody.multipleVendorSupport || false,
                    };
                    if (newState.configurations.authQueryParameter) {
                        setAuthSource('authQueryParameter');
                    } else if (newState.configurations.authHeader) {
                        setAuthSource('authHeader');
                    } else {
                        setAuthSource('unsecured');
                    }

                    dispatch({ field: 'all', value: newState });

                    setFile(new Blob([aiVendorBody.apiDefinition || ''], { type: 'text/plain;charset=utf-8' }));
                }
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
                field: 'multipleVendorSupport',
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
                    error = `AI/LLM Vendor name ${intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error',
                        defaultMessage: ' is empty',
                    })}`;
                }
                break;
            case 'apiVersion':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.apiVersion',
                        defaultMessage: 'Required field is empty.',
                    });
                }
                break;
            case 'inputSource':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.inputSource',
                        defaultMessage: 'Input source is required.',
                    });
                }
                break;
            case 'attributeIdentifier':
                if (fieldValue.required && fieldValue.attributeIdentifier.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.attributeIdentifier',
                        defaultMessage: 'Attribute identifier is required.',
                    });
                }
                break;
            case 'connectorType':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.connectorType',
                        defaultMessage: 'Connector type is required.',
                    });
                }
                break;
            case 'providerName':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.providerName',
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
        const modelProviderEntriesErrors = state.models.some((entry) => entry.vendor.trim() === '');

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
                id: 'AiVendors.AddEditAiVendor.form.has.errors',
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
            if (state.configurations[authSource]) {
                updatedConfigurations = {
                    ...updatedConfigurations,
                    [authSource]: state.configurations[authSource],
                };
            }
            let models;
            if (state.multipleVendorSupport) {
                models = state.models.map(({ id, ...rest }) => rest);
            } else {
                models = [{ vendor: state.name, values: state.modelList }];
            }
            const newState = {
                ...state,
                configurations: updatedConfigurations,
                // modelList: JSON.stringify(state.modelList),
                // Stringify modelVendorEntries before sending to API
                models: JSON.stringify(models),
            };

            if (vendorId) { // <-- Use vendorId instead of id
                await new API().updateAiVendor(vendorId, { ...newState, apiDefinition: file });
                Alert.success(`${state.name} ${intl.formatMessage({
                    id: 'AiVendor.edit.success',
                    defaultMessage: ' - AI/LLM Vendor edited successfully.',
                })}`);
            } else {
                await new API().addAiVendor({ ...newState, apiDefinition: file });
                Alert.success(`${state.name} ${intl.formatMessage({
                    id: 'AiVendor.add.success.msg',
                    defaultMessage: ' - AI/LLM Vendor added successfully.',
                })}`);
            }

            setSaving(false);
            history.push('/settings/ai-vendors/');
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
        dispatch({
            field: 'authHeader',
            value: '',
        });
    };

    const clearAuthQueryParameter = () => {
        dispatch({
            field: 'authQueryParameter',
            value: '',
        });
    };

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
                            id='AiVendors.AddEditAiVendor.general.details.div'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.general.details'
                                defaultMessage='General Details'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.general.details.description.div'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.general.details.description'
                                defaultMessage='Provide name and description of the AI/LLM Vendor'
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
                                                    id='AiVendors.AddEditAiVendor.form.name'
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
                                            id: 'AiVendors.AddEditAiVendor.form.name.help',
                                            defaultMessage: 'Name of the AI/LLM Vendor.',
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
                                            helperText={hasErrors('apiVersion', state.apiVersion, validating)
                                                || intl.formatMessage({
                                                    id: 'AiVendors.AddEditAiVendor.form.displayName.help',
                                                    defaultMessage: 'API Version of the AI/LLM Vendor.',
                                                })}
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
                                        id='AiVendors.AddEditAiVendor.form.description'
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
                                    id: 'AiVendors.AddEditAiVendor.form.description.help',
                                    defaultMessage: 'Description of the AI/LLM Vendor.',
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
                            id='AiVendors.AddEditAiVendor.provider.configurations.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.provider.configurations'
                                defaultMessage='Provider Configurations'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.provider.configurations.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.AiVendor.provider.configurations.description'
                                defaultMessage='Define provider configurations of the AI/LLM Vendor'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        {state.multipleVendorSupport ? (
                            <ModelFamily
                                models={state.models}
                                onModelsChange={(newModels) => dispatch({
                                    field: 'models',
                                    value: newModels,
                                })}
                                hasErrors={hasErrors}
                                validating={validating}
                            />
                        ) : (
                            <Box component='div' m={1}>
                                <Grid container>
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
                                        placeholder={intl.formatMessage({
                                            id: 'AiVendors.AddEditAiVendor.modelList.placeholder',
                                            defaultMessage: 'Type Model name and press Enter',
                                        })}
                                        data-testid='ai-vendor-llm-model-list'
                                    />
                                </Grid>
                            </Box>
                        )}
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
                                    id='AiVendors.AddEditAiVendor.AiVendor.configurations.llm'
                                    defaultMessage='LLM Configurations'
                                />
                            </Typography>
                            <Typography
                                color='inherit'
                                variant='caption'
                                component='p'
                                id='AddEditAiVendor.External.AiVendor.configurations.llm.container'
                            >
                                <FormattedMessage
                                    id={'AiVendors.AddEditAiVendor.AiVendor'
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
                                                'AiVendors.AddEditAiVendor.llm.configuration.'
                                                + `${metadata.attributeName}.div`
                                            }
                                        >
                                            <FormattedMessage
                                                id={
                                                    'AiVendors.AddEditAiVendor.llm.configuration.'
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

                                                        <StyledSpan>*</StyledSpan>
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
                            id='AiVendors.AddEditAiVendor.apiDefinition.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.apiDefinition'
                                defaultMessage='API Definition'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.apiDefinition.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.apiDefinition.description'
                                defaultMessage='Upload API Definition of the AI/LLM Vendor'
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
                                    id='AiVendors.AddEditAiVendor.AiVendor.configurations.llm.auth'
                                    defaultMessage='LLM Provider Auth Configurations'
                                />
                            </Typography>
                            <Typography
                                color='inherit'
                                variant='caption'
                                component='p'
                                id='AddEditAiVendor.External.AiVendor.configurations.llm.auth.container'
                            >
                                <FormattedMessage
                                    id={'AiVendors.AddEditAiVendor.AiVendor'
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
                                            value={authSource}
                                            onChange={(e) => {
                                                clearAuthHeader();
                                                clearAuthQueryParameter();
                                                setAuthSource(e.target.value);
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
                                        {authSource !== 'unsecured' && (
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
                                                                `${camelCaseToSentence(authSource)} identifier`
                                                            }
                                                        />
                                                    </span>
                                                )}
                                                fullWidth
                                                variant='outlined'
                                                value={authSource === 'authHeader'
                                                    ? state.configurations.authHeader ?? ''
                                                    : state.configurations.authQueryParameter ?? ''}
                                                onChange={(e) => dispatch({
                                                    field: authSource,
                                                    value: e.target.value,
                                                })}
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
                            id='AiVendors.AddEditAiVendor.connectorType.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.connectorType'
                                defaultMessage='Connector Type for AI/LLM Vendor'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.connectorType.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.connectorType.description'
                                defaultMessage='Reference to the connector model for the AI/LLM vendor'
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
                                            id='AiVendors.AddEditAiVendor.form.connectorType'
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
                                    id: 'AiVendors.AddEditAiVendor.form.connectorType.help',
                                    defaultMessage: 'Connector Type for AI/LLM Vendor',
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
                                                id='AiVendors.AddEditAiVendor.form.update.btn'
                                                defaultMessage='Update'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='AiVendors.AddEditAiVendor.form.add'
                                                defaultMessage='Add'
                                            />
                                        )}
                                    </>
                                )}
                            </Button>
                        </Box>
                        <RouterLink to='/settings/ai-vendors'>
                            <Button variant='outlined'>
                                <FormattedMessage
                                    id='AiVendors.AddEditAiVendor.form.cancel'
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
