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

import React, { useState, useEffect, useReducer, useContext } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Grid,
    Paper,
    Typography,
    FormControl,
    TextField,
    Button,
    CircularProgress,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import CONSTS from 'AppData/Constants';
import { Link, useHistory } from 'react-router-dom';
import API from 'AppData/api';
import { green } from '@mui/material/colors';
import Alert from 'AppComponents/Shared/Alert';
import { isRestricted } from 'AppData/AuthManager';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import { getBasePath } from 'AppComponents/Shared/Utils';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdvanceEndpointConfig from '../AdvancedConfig/AdvanceEndpointConfig';

const PREFIX = 'AddEditAIEndpoint';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
    saveButton: `${PREFIX}-saveButton`,
    helpText: `${PREFIX}-helpText`,
    extraPadding: `${PREFIX}-extraPadding`,
    actionButtonSection: `${PREFIX}-actionButtonSection`,
    progress: `${PREFIX}-progress`,
    textField: `${PREFIX}-textField`,
    iconButton: `${PREFIX}-iconButton`,
    iconButtonValid: `${PREFIX}-iconButtonValid`,
    endpointValidChip: `${PREFIX}-endpointValidChip`,
    endpointInvalidChip: `${PREFIX}-endpointInvalidChip`,
    endpointErrorChip: `${PREFIX}-endpointErrorChip`,
    deploymentStageSelect: `${PREFIX}-deploymentStageSelect`,
    deploymentTypeText: `${PREFIX}-deploymentTypeText`,
}

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        padding: 20,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.titleLink}`]: {
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1),
    },

    [`& .${classes.saveButton}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.helpText}`]: {
        color: theme.palette.text.hint,
        marginTop: theme.spacing(1),
    },

    [`& .${classes.extraPadding}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.actionButtonSection}`]: {
        paddingTop: 20,
    },

    [`& .${classes.progress}`]: {
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.textField}`]: {
        width: '100%',
    },

    [`& .${classes.iconButton}`]: {
        padding: theme.spacing(1),
    },

    [`& .${classes.iconButtonValid}`]: {
        padding: theme.spacing(1),
        color: green[500],
    },

    [`& .${classes.endpointValidChip}`]: {
        color: 'green',
        border: '1px solid green',
    },

    [`& .${classes.endpointInvalidChip}`]: {
        color: '#ffd53a',
        border: '1px solid #ffd53a',
    },

    [`& .${classes.endpointErrorChip}`]: {
        color: 'red',
        border: '1px solid red',
    },

    [`& .${classes.deploymentStageSelect}`]: {
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.deploymentTypeText}`]: {
        marginBottom: theme.spacing(1),
        color: theme.palette.text.secondary,
    },
}));

const isValidUrl = (string) => {
    try {
        return !!new URL(string);
    } catch (_) {
        return false;
    }
};

/**
 * Reducer to manage endpoint state
 * @param {JSON} state state
 * @param {JSON} param1 field and value
 * @returns {Promise} promised State
 */
function endpointReducer(state, { field, value }) {
    switch (field) {
        case 'all':
            return { ...value };
        case 'name':
            return { ...state, [field]: value };
        case 'updateProductionEndpointUrl':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    production_endpoints: { url: value },
                },
            }
        case 'updateSandboxEndpointUrl':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    sandbox_endpoints: { url: value },
                },
            }
        case 'updateEndpointSecurity':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    endpoint_security: {
                        ...state.endpointConfig.endpoint_security,
                        ...value
                    },
                },
            }
        case 'updateProductionAdvancedConfiguration':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    production_endpoints: {
                        ...state.endpointConfig.production_endpoints,
                        ...value
                    },
                },
            }
        case 'updateSandboxAdvancedConfiguration':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    sandbox_endpoints: {
                        ...state.endpointConfig.sandbox_endpoints,
                        ...value
                    },
                },
            }
        default:
            return state;
    }
}

const AddEditAIEndpoint = ({
    apiObject,
    llmProviderEndpointConfiguration,
    match: { params: { id: endpointId } },
}) => {
    const [isEndpointValid, setIsEndpointValid] = useState();
    const [statusCode, setStatusCode] = useState('');
    const [isUpdating, setUpdating] = useState(false);
    const [isErrorCode, setIsErrorCode] = useState(false);
    const [endpointUrl, setEndpointUrl] = useState('');
    const [advanceConfig, setAdvancedConfig] = useState({});
    const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);
    const [state, dispatch] = useReducer(endpointReducer, {
        ...CONSTS.DEFAULT_ENDPOINT,
        // Default to production if not editing
        deploymentStage: CONSTS.DEPLOYMENT_STAGE.production,
        endpointConfig: {
            ...CONSTS.DEFAULT_ENDPOINT.endpointConfig,
            endpoint_type: 'http',
            endpoint_security: {},
        }
    });
    const [isEndpointSaving, setEndpointSaving] = useState(false);
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    const intl = useIntl();
    const [validating, setValidating] = useState(false);

    const { updateAPI } = useContext(APIContext);

    const [apiKeyValue, setApiKeyValue] = useState(null);
    const [accessKey, setAccessKey] = useState(null);
    const [secretKey, setSecretKey] = useState(null);
    const [region, setRegion] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);

    const subtypeConfig = apiObject.subtypeConfiguration && JSON.parse(apiObject.subtypeConfiguration.configuration);
    const llmProviderName = subtypeConfig ? subtypeConfig.llmProviderName : null;

    const [isEditing, setIsEditing] = useState(false);

    const history = useHistory();

    const [endpoints, setEndpoints] = useState([]);

    const isDuplicateEndpointName = (name) => {
        // Check for default endpoint names
        const defaultNames = [
            'default production endpoint',
            'default sandbox endpoint',
        ];

        if (defaultNames.includes(name.trim().toLowerCase())) {
            return true;
        }

        const isDuplicate = Array.isArray(endpoints) && endpoints.length > 0
            ? endpoints.some(endpoint =>
                endpoint.name === name && (!isEditing || endpoint.id !== endpointId)
            ) : false;

        return isDuplicate;
    };
    useEffect(() => {
        if (endpointId) {
            setIsEditing(true);
            // Check if this is a default endpoint
            const isDefaultEndpoint = endpointId === CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION ||
                endpointId === CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX;

            if (isDefaultEndpoint) {
                // Load from API object's endpointConfig
                const { endpointConfig } = apiObject;
                const isProd = endpointId === CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION;

                const endpoint = {
                    id: endpointId,
                    name: isProd ? 'Default Production Endpoint' : 'Default Sandbox Endpoint',
                    deploymentStage: isProd ? 'PRODUCTION' : 'SANDBOX',
                    endpointConfig: {
                        endpoint_type: endpointConfig.endpoint_type || 'http',
                        endpoint_security: endpointConfig.endpoint_security || {},
                        [isProd ? 'production_endpoints' : 'sandbox_endpoints']:
                            isProd ? endpointConfig.production_endpoints : endpointConfig.sandbox_endpoints
                    }
                };

                dispatch({ field: 'all', value: endpoint });

                // Set endpoint URL
                if (isProd && endpointConfig.production_endpoints?.url) {
                    setEndpointUrl(endpointConfig.production_endpoints.url);
                } else if (!isProd && endpointConfig.sandbox_endpoints?.url) {
                    setEndpointUrl(endpointConfig.sandbox_endpoints.url);
                }

                // Set API key value
                const envType = isProd ? 'production' : 'sandbox';
                const securityConfig = endpointConfig.endpoint_security?.[envType];
                if (securityConfig?.apiKeyValue === '') {
                    setApiKeyValue('********');
                }
                // Set AWS related values
                if (securityConfig?.accessKey) {
                    setAccessKey(securityConfig?.accessKey);
                }
                if (securityConfig?.secretKey === '') {
                    setSecretKey('********');
                }
                if (securityConfig?.region) {
                    setRegion(securityConfig?.region);
                }
            } else {
                // Load custom endpoint data from API
                API.getApiEndpoint(apiObject.id, endpointId)
                    .then((response) => {
                        const { body } = response;
                        dispatch({ field: 'all', value: body });

                        // Set endpoint URL
                        if (body.endpointConfig.production_endpoints?.url) {
                            setEndpointUrl(body.endpointConfig.production_endpoints.url);
                        } else if (body.endpointConfig.sandbox_endpoints?.url) {
                            setEndpointUrl(body.endpointConfig.sandbox_endpoints.url);
                        }

                        // Set API key value
                        const envType = body.deploymentStage === "PRODUCTION" ? 'production' : 'sandbox';
                        const securityConfig = body.endpointConfig.endpoint_security?.[envType];
                        if (securityConfig?.apiKeyValue === '') {
                            setApiKeyValue('********');
                        }
                        // Set AWS related values
                        if (securityConfig?.accessKey) {
                            setAccessKey(securityConfig?.accessKey);
                        }
                        if (securityConfig?.secretKey === '') {
                            setSecretKey('********');
                        }
                        if (securityConfig?.region) {
                            setRegion(securityConfig?.region);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading endpoint:', error);
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.loading',
                            defaultMessage: 'Error loading endpoint',
                        }));
                    });
            }
        }
    }, [endpointId]);

    useEffect(() => {
        // Skip if editing (no need to load all endpoints when editing)
        if (!isEditing) {
            API.getApiEndpoints(apiObject.id)
                .then((response) => {
                    setEndpoints(response.body);
                })
                .catch((error) => {
                    console.error('Error loading endpoints:', error);
                });
            console.log('Endpoints:', endpoints);
        }
    }, [apiObject.id, isEditing]);

    const saveEndpointSecurityConfig = (endpointSecurityObj, enType) => {
        const newEndpointSecurityObj = endpointSecurityObj;
        const secretPlaceholder = '******';
        newEndpointSecurityObj.clientSecret = newEndpointSecurityObj.clientSecret
            === secretPlaceholder ? '' : newEndpointSecurityObj.clientSecret;
        newEndpointSecurityObj.password = newEndpointSecurityObj.password
            === secretPlaceholder ? '' : newEndpointSecurityObj.password;
        newEndpointSecurityObj.enabled = true;

        dispatch({
            field: 'updateEndpointSecurity',
            value: {
                [enType]: newEndpointSecurityObj,
            },
        });
    };

    const handleApiKeyChange = (event) => {
        let apiKeyVal = event.target.value;
        if (apiKeyVal === '********') {
            apiKeyVal = '';
        } else if (apiKeyVal === '') {
            apiKeyVal = null;
        } else if (apiKeyVal.includes('********')) {
            apiKeyVal = apiKeyVal.replace('********', '');
        }
        setApiKeyValue(apiKeyVal);
    };

    const handleApiKeyBlur = () => {
        // Skip if apiKeyValue is null, empty, or ********
        if (!apiKeyValue || apiKeyValue === '********') {
            return;
        }

        let updatedApiKeyValue = apiKeyValue;
        if ((llmProviderName === 'MistralAI' || llmProviderName === 'OpenAI') &&
            apiKeyValue !== null && apiKeyValue !== '') {
            updatedApiKeyValue = `Bearer ${updatedApiKeyValue}`;
        }

        const isProduction = state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production;
        let apiKeyIdentifier;
        let apiKeyIdentifierType;
        if (llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled
            && llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'apikey') {
            if (llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.headerEnabled) {
                apiKeyIdentifier =
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.headerName;
                apiKeyIdentifierType = "HEADER";
            }
            if (llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.queryParameterEnabled) {
                apiKeyIdentifier =
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.queryParameterName;
                apiKeyIdentifierType = "QUERY_PARAMETER";
            }
        }
        saveEndpointSecurityConfig({
            ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
            type: llmProviderEndpointConfiguration.authenticationConfiguration.type,
            apiKeyIdentifier,
            apiKeyIdentifierType,
            apiKeyValue: updatedApiKeyValue,
            enabled: true,
        }, isProduction ? 'production' : 'sandbox');
    };

    const handleToggleApiKeyVisibility = () => {
        if (apiKeyValue !== '********') {
            setShowApiKey((prev) => !prev);
        }
    };

    const url = getBasePath(apiObject.apiType) + apiObject.id + '/endpoints';

    useEffect(() => {
        try {
            if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production) {
                setEndpointUrl(state.endpointConfig.production_endpoints?.url);
                setAdvancedConfig(state.endpointConfig.production_endpoints?.config || {});
            } else if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.sandbox) {
                setEndpointUrl(state.endpointConfig.sandbox_endpoints?.url);
                setAdvancedConfig(state.endpointConfig.sandbox_endpoints?.config || {});
            }
        } catch (error) {
            console.error('Failed to extract endpoint URL from the endpoint object', error);
        }
    }, [state]);

    /**
     * Method to test the endpoint.
     * @param {String} endpointURL Endpoint URL 
     * @param {String} apiID API ID 
     */
    function testEndpoint(endpointURL, apiID) {
        setUpdating(true);
        const restApi = new API();
        restApi.testEndpoint(endpointURL, apiID)
            .then((result) => {
                if (result.body.error !== null) {
                    setStatusCode(result.body.error);
                    setIsErrorCode(true);
                } else {
                    setStatusCode(result.body.statusCode + ' ' + result.body.statusMessage);
                    setIsErrorCode(false);
                }
                if (result.body.statusCode >= 200 && result.body.statusCode < 300) {
                    setIsEndpointValid(true);
                    setIsErrorCode(false);
                } else {
                    setIsEndpointValid(false);
                }
            }).finally(() => {
                setUpdating(false);
            });
    }

    const handleEndpointBlur = () => {
        const trimmedUrl = endpointUrl?.trim() || '';
        if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production) {
            dispatch({ field: 'updateProductionEndpointUrl', value: trimmedUrl });
        } else {
            dispatch({ field: 'updateSandboxEndpointUrl', value: trimmedUrl });
        }
    };

    /**
     * Method to check whether the endpoint has errors.
     * @param {boolean} validateActive Whether validation is active
     * @returns {boolean} Whether the endpoint has errors
     */
    const hasErrors = (fieldName, fieldValue, validateActive = false) => {
        if (!validateActive) {
            return false;
        }
        switch (fieldName) {
            case 'name':
                if (!fieldValue) {
                    return intl.formatMessage({
                        id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.empty.name',
                        defaultMessage: 'Endpoint name cannot be empty',
                    });
                } else if (!isEditing && isDuplicateEndpointName(fieldValue)) {
                    return intl.formatMessage({
                        id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.duplicate.name',
                        defaultMessage: 'This endpoint name already exists',
                    });
                }
                return false;
            case 'url':
                if (!fieldValue) {
                    return intl.formatMessage({
                        id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.empty.url',
                        defaultMessage: 'Endpoint URL cannot be empty',
                    });
                } else if (!isValidUrl(fieldValue)) {
                    return intl.formatMessage({
                        id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.invalid.url',
                        defaultMessage: 'Please enter a valid endpoint URL',
                    });
                }
                return false;
            case 'apiKey':
                if (
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled === true &&
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'apikey'
                ) {
                    if (!fieldValue) {
                        return intl.formatMessage({
                            id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.empty.apiKey',
                            defaultMessage: 'API Key cannot be empty',
                        });
                    }
                }
                return false;
            case 'accessKey':
                if (
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled === true &&
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'aws'
                ) {
                    if (!fieldValue) {
                        return intl.formatMessage({
                            id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.empty.accessKey',
                            defaultMessage: 'AWS AccessKey cannot be empty',
                        });
                    }
                }
                return false;
            case 'secretKey':
                if (
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled === true &&
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'aws'
                ) {
                    if (!fieldValue) {
                        return intl.formatMessage({
                            id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.empty.secretKey',
                            defaultMessage: 'AWS SecretKey cannot be empty',
                        });
                    }
                }
                return false;
            case 'region':
                if (
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled === true &&
                    llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'aws'
                ) {
                    if (!fieldValue) {
                        return intl.formatMessage({
                            id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.empty.region',
                            defaultMessage: 'AWS region cannot be empty',
                        });
                    }
                }
                return false;
            default:
                return false;
        }
    };

    const formHasErrors = (validateActive = false) => {
        if (hasErrors('name', state.name, validateActive) ||
            hasErrors('url', endpointUrl, validateActive) ||
            hasErrors('apiKey', apiKeyValue, validateActive) ||
            hasErrors('secretKey', secretKey, validateActive) ||
            hasErrors('region', region, validateActive) ||
            hasErrors('accessKey', accessKey, validateActive)) {
            return true;
        }
        return false;
    };

    /**
     * Method to open the advanced configuration dialog box.
     */
    const handleAdvancedConfigOpen = () => {
        setAdvancedConfigOpen(true);
    };

    /**
     * Method to close the advanced configurations dialog box.
     */
    const handleAdvancedConfigClose = () => {
        setAdvancedConfigOpen(false);
    };

    /**
     * Method to save the advance configurations.
     *
     * @param {object} advanceConfigObj The advance configuration object
     * */
    const saveAdvanceConfig = (advanceConfigObj) => {
        setAdvancedConfig(advanceConfigObj);
        if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production) {
            dispatch({
                field: 'updateProductionAdvancedConfiguration',
                value: {
                    config: advanceConfigObj,
                },
            });
        } else {
            dispatch({
                field: 'updateSandboxAdvancedConfiguration',
                value: {
                    config: advanceConfigObj,
                },
            });
        }
        handleAdvancedConfigClose();
    };

    const handleDeploymentStageChange = (event) => {
        const newStage = event.target.value;
        const currentStage = state.deploymentStage;

        // Only handle switching if actually changing stages
        if (newStage !== currentStage) {
            const endpointConfig = { ...state.endpointConfig };

            // If switching from production to sandbox
            if (newStage === CONSTS.DEPLOYMENT_STAGE.sandbox) {
                // Move production config to sandbox
                endpointConfig.sandbox_endpoints = { ...endpointConfig.production_endpoints };
                endpointConfig.production_endpoints = undefined;
                setEndpointUrl(endpointConfig.sandbox_endpoints?.url || '');

                // Move endpoint security config from production to sandbox
                if (endpointConfig.endpoint_security?.production) {
                    endpointConfig.endpoint_security = {
                        sandbox: { ...endpointConfig.endpoint_security.production },
                    };
                }
            }
            // If switching from sandbox to production
            else if (newStage === CONSTS.DEPLOYMENT_STAGE.production) {
                // Move sandbox config to production
                endpointConfig.production_endpoints = { ...endpointConfig.sandbox_endpoints };
                endpointConfig.sandbox_endpoints = undefined;
                setEndpointUrl(endpointConfig.production_endpoints?.url || '');

                // Move endpoint security config from sandbox to production
                if (endpointConfig.endpoint_security?.sandbox) {
                    endpointConfig.endpoint_security = {
                        production: { ...endpointConfig.endpoint_security.sandbox },
                    };
                }
            }

            // Update state with new configuration
            dispatch({
                field: 'all',
                value: {
                    ...state,
                    deploymentStage: newStage,
                    endpointConfig,
                }
            });
        }
    };
    const handleAWSCredentials = (e, field) => {
        if (field === "accessKey") {
            setAccessKey(e.target.value)
        } else if (field === "secretKey") {
            let seretKeyValue = e.target.value;
            if (seretKeyValue === '********') {
                seretKeyValue = '';
            } else if (seretKeyValue === '') {
                seretKeyValue = null;
            } else if (seretKeyValue.includes('********')) {
                seretKeyValue = seretKeyValue.replace('********', '');
            }
            setSecretKey(seretKeyValue)
        } else if (field === "region") {
            setRegion(e.target.value)
        }
    }
    const handleOnBlurOnAWSCredentials = () => {
        const isProduction = state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production;

        // Skip if apiKeyValue is null, empty, or ********
        if (!secretKey || secretKey === '********') {
            return;
        }
        saveEndpointSecurityConfig({
            ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
            type: llmProviderEndpointConfiguration.authenticationConfiguration.type,
            service: llmProviderEndpointConfiguration.authenticationConfiguration.parameters.awsServiceName,
            accessKey,
            secretKey,
            region,
            enabled: true,
        }, isProduction ? 'production' : 'sandbox');
    }
    const formSave = () => {
        setValidating(true);
        if (formHasErrors(true)) {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.form.has.errors',
                defaultMessage: 'One or more fields contain errors',
            }));
            return false;
        }

        setEndpointSaving(true);

        let savePromise;

        if (isEditing) {
            // Check if this is a default endpoint
            const isDefaultEndpoint = endpointId === CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION
                || endpointId === CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX;

            if (isDefaultEndpoint) {
                // For default endpoints, use updateAPI to update the API's endpointConfig
                const updatedEndpointConfig = { ...apiObject.endpointConfig };

                if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production) {
                    updatedEndpointConfig.production_endpoints = {
                        ...state.endpointConfig.production_endpoints,
                    };
                } else {
                    updatedEndpointConfig.sandbox_endpoints = {
                        ...state.endpointConfig.sandbox_endpoints,
                    };
                }

                // Copy endpoint security if present
                if (state.endpointConfig.endpoint_security) {
                    updatedEndpointConfig.endpoint_security = {
                        ...state.endpointConfig.endpoint_security,
                    };
                }

                savePromise = updateAPI({ endpointConfig: updatedEndpointConfig });
            } else {
                // For custom endpoints, use updateApiEndpoint
                savePromise = API.updateApiEndpoint(apiObject.id, endpointId, state);
            }
        } else {
            // Adding new endpoint
            savePromise = API.addApiEndpoint(apiObject.id, state);
        }

        savePromise
            .then(() => {
                if (isEditing) {
                    Alert.success(intl.formatMessage({
                        id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.edit.success',
                        defaultMessage: 'Endpoint Updated Successfully',
                    }));
                } else {
                    Alert.success(intl.formatMessage({
                        id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.add.success',
                        defaultMessage: 'Endpoint Added Successfully',
                    }));
                }
                const redirectURL = getBasePath(apiObject.apiType) + apiObject.id + '/endpoints';
                history.push(redirectURL);
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.error.saving',
                    defaultMessage: 'Error occurred while saving the endpoint. Please try again.',
                }));
            })
            .finally(() => {
                setEndpointSaving(false);
            });
        return true;
    };

    // Add this before the return statement, after all hooks and state
    const apiKeyParamConfig = {
        authHeader:
            llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled &&
            llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'apikey' &&
            llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.headerEnabled
                ? llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.headerName
                : null,
        authQueryParam:
            llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled &&
                llmProviderEndpointConfiguration?.authenticationConfiguration?.type === 'apikey' &&
                llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.queryParameterEnabled
                ? llmProviderEndpointConfiguration?.authenticationConfiguration?.parameters?.queryParameterName
                : null,
    };

    const IS_APIKEY_AUTH_ENABLED = (config) =>
        config?.authenticationConfiguration?.enabled === true &&
        config?.authenticationConfiguration?.type === 'apikey';
    const IS_AWS_SIGV4_AUTH_ENABLED = (config) =>
        config?.authenticationConfiguration?.enabled === true &&
        config?.authenticationConfiguration?.type === 'aws';
    return (
        <StyledGrid container justifyContent='center'>
            <Grid item sm={12} md={12} lg={8}>
                <Grid item md={12}>
                    <div className={classes.titleWrapper}>
                        <Link to={url} className={classes.titleLink}>
                            <Typography variant='h4' component='h2'>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.heading'
                                    defaultMessage='Endpoints'
                                />
                            </Typography>
                        </Link>
                        <KeyboardArrowRightIcon />
                        <Typography variant='h4' component='h3'>
                            {
                                isEditing ?
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.edit.endpoint'
                                        defaultMessage='Edit Endpoint'
                                    /> :
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.create.new.endpoint'
                                        defaultMessage='Add New Endpoint'
                                    />
                            }
                        </Typography>
                    </div>
                </Grid>
                <Grid item md={12}>
                    <Paper elevation={0} className={classes.root}>
                        {/* Deployment Stage Selection */}
                        <FormControl component='fieldset' className={classes.deploymentStageSelect}>
                            <Typography className={classes.deploymentTypeText}>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.select.endpoint.type'
                                    defaultMessage='Select Endpoint Type'
                                />
                            </Typography>
                            <RadioGroup
                                row
                                aria-label='deployment-stage'
                                name='deployment-stage'
                                value={state.deploymentStage}
                                onChange={handleDeploymentStageChange}
                                disabled={isEditing || isRestricted(['apim:api_create'], apiObject)}
                            >
                                <FormControlLabel
                                    value={CONSTS.DEPLOYMENT_STAGE.production}
                                    control={<Radio disabled={isEditing} />}
                                    label={
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.production'
                                            defaultMessage='Production'
                                        />
                                    }
                                />
                                <FormControlLabel
                                    value={CONSTS.DEPLOYMENT_STAGE.sandbox}
                                    control={<Radio disabled={isEditing} />}
                                    label={
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.sandbox'
                                            defaultMessage='Sandbox'
                                        />
                                    }
                                />
                            </RadioGroup>
                        </FormControl>

                        {/* Main Form Grid */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        disabled={isEditing || isRestricted(['apim:api_create'], apiObject)}
                                        label='Endpoint Name'
                                        id='name'
                                        fullWidth
                                        value={state.name}
                                        onChange={(e) => dispatch({ field: 'name', value: e.target.value })}
                                        error={hasErrors('name', state.name, validating)}
                                        helperText={hasErrors('name', state.name, validating)}
                                        required
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        disabled={isRestricted(['apim:api_create'], apiObject)}
                                        label='Endpoint URL'
                                        id='url'
                                        fullWidth
                                        className={classes.textField}
                                        value={endpointUrl}
                                        onChange={(e) => setEndpointUrl(e.target.value)}
                                        onBlur={handleEndpointBlur}
                                        error={hasErrors('url', endpointUrl, validating)}
                                        helperText={hasErrors('url', endpointUrl, validating)}
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    {statusCode && (
                                                        <Chip
                                                            id={state.id + '-endpoint-test-status'}
                                                            label={statusCode}
                                                            className={
                                                                isEndpointValid ?
                                                                    classes.endpointValidChip : iff(
                                                                        isErrorCode,
                                                                        classes.endpointErrorChip,
                                                                        classes.endpointInvalidChip,
                                                                    )}
                                                            variant='outlined'
                                                        />
                                                    )}
                                                    <IconButton
                                                        className={
                                                            isEndpointValid ?
                                                                classes.iconButtonValid : classes.iconButton
                                                        }
                                                        aria-label='TestEndpoint'
                                                        onClick={() => testEndpoint(endpointUrl, apiObject.id)}
                                                        disabled={
                                                            (isRestricted(['apim:api_create'], apiObject)) || isUpdating
                                                        }
                                                        id='endpoint-test-icon-btn'
                                                        size='large'>
                                                        {isUpdating
                                                            ? <CircularProgress size={20} />
                                                            : (
                                                                <Tooltip
                                                                    placement='top-start'
                                                                    interactive
                                                                    title={(
                                                                        <FormattedMessage
                                                                            id={'Apis.Details.Endpoints.AIEndpoints.' +
                                                                                'AddEditAIEndpoint.test.endpoint'}
                                                                            defaultMessage='Check endpoint status'
                                                                        />
                                                                    )}
                                                                >
                                                                    <CheckCircleIcon />
                                                                </Tooltip>

                                                            )}
                                                    </IconButton>
                                                    <IconButton
                                                        className={classes.iconButton}
                                                        aria-label='Settings'
                                                        onClick={handleAdvancedConfigOpen}
                                                        disabled={(isRestricted(['apim:api_create'], apiObject))}
                                                        id='endpoint-configuration-icon-btn'
                                                        size='large'>
                                                        <Tooltip
                                                            placement='top-start'
                                                            interactive
                                                            title={(
                                                                <FormattedMessage
                                                                    id={'Apis.Details.Endpoints.AIEndpoints.' +
                                                                        'AddEditAIEndpoint.endpoint.configuration'}
                                                                    defaultMessage='Endpoint configurations'
                                                                />
                                                            )}
                                                        >
                                                            <SettingsIcon />
                                                        </Tooltip>
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            {/* AI Endpoint Auth Fields */}
                            {IS_APIKEY_AUTH_ENABLED(llmProviderEndpointConfiguration) && (
                                <>
                                    <Grid item xs={6}>
                                        <TextField
                                            disabled
                                            label={apiKeyParamConfig.authHeader ? (
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.AIEndpoints.Edit.api.key.header'
                                                    defaultMessage='Authorization Header'
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.AIEndpoints.Edit.api.key.query.param'
                                                    defaultMessage='Authorization Query Param'
                                                />
                                            )}
                                            fullWidth
                                            id='api-key-id'
                                            value={apiKeyParamConfig.authHeader ||
                                                apiKeyParamConfig.authQueryParam}
                                            placeholder={apiKeyParamConfig.authHeader ||
                                                apiKeyParamConfig.authQueryParam}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            helperText=' '
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            disabled={isRestricted(['apim:api_create'], apiObject)}
                                            label={
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.AIEndpoints.Edit.api.key.value'
                                                    defaultMessage='API Key'
                                                />
                                            }
                                            id='api-key-value'
                                            value={apiKeyValue}
                                            placeholder={intl.formatMessage({
                                                id: 'Apis.Details.Endpoints.AIEndpoints.Edit.api.key.placeholder',
                                                defaultMessage: 'Enter API Key',
                                            })}
                                            fullWidth
                                            onChange={handleApiKeyChange}
                                            onBlur={handleApiKeyBlur}
                                            error={hasErrors('apiKey', apiKeyValue, validating)}
                                            helperText={hasErrors('apiKey', apiKeyValue, validating)}
                                            required
                                            type={showApiKey ? 'text' : 'password'}
                                            InputLabelProps={{
                                                shrink: Boolean(apiKeyValue),
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <IconButton
                                                            onClick={handleToggleApiKeyVisibility}
                                                            edge='end'
                                                        >
                                                            {showApiKey ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* AWS SigV4 Auth Fields */}
                            {IS_AWS_SIGV4_AUTH_ENABLED(llmProviderEndpointConfiguration) && (
                                <>
                                    <Grid item xs={4}>
                                        <TextField
                                            disabled={isRestricted(
                                                ['apim:api_create'],
                                                apiObject
                                            )}
                                            label={
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.AIEndpoints.Edit.acessKey'
                                                    defaultMessage='AWS Access Key'
                                                />
                                            }
                                            id='aws-access-key'
                                            value={accessKey}
                                            placeholder={intl.formatMessage({
                                                id: 'Apis.Details.Endpoints.AIEndpoints.Edit.acessKey.placeholder',
                                                defaultMessage: 'Enter AWS Access Key',
                                            })}
                                            fullWidth
                                            onChange={(e) => handleAWSCredentials(e, 'accessKey')}
                                            onBlur={handleOnBlurOnAWSCredentials}
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            disabled={isRestricted(
                                                ['apim:api_create'],
                                                apiObject
                                            )}
                                            label={
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.AIEndpoints.Edit.secretKey'
                                                    defaultMessage='AWS Secret Key'
                                                />
                                            }
                                            id='aws-secret-key'
                                            type='password'
                                            value={secretKey}
                                            placeholder={intl.formatMessage({
                                                id: 'Apis.Details.Endpoints.AIEndpoints.Edit.secretKey.placeholder',
                                                defaultMessage: 'Enter AWS Secret Key',
                                            })}
                                            fullWidth
                                            onChange={(e) => handleAWSCredentials(e, 'secretKey')}
                                            onBlur={handleOnBlurOnAWSCredentials}
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            disabled={isRestricted(
                                                ['apim:api_create'],
                                                apiObject
                                            )}
                                            label={
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.AIEndpoints.Edit.aws.region'
                                                    defaultMessage='AWS Region'
                                                />
                                            }
                                            id='aws-region'
                                            value={region}
                                            placeholder={intl.formatMessage({
                                                id: 'Apis.Details.Endpoints.AIEndpoints.Edit.aws.region.placeholder',
                                                defaultMessage: 'Enter AWS Region',
                                            })}
                                            fullWidth
                                            onChange={(e) => handleAWSCredentials(e, 'region')}
                                            onBlur={handleOnBlurOnAWSCredentials}
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}

                        </Grid>

                        {/* Action Buttons */}
                        <div className={classes.actionButtonSection}>
                            <Button
                                id='endpoint-save-btn'
                                variant='contained'
                                color='primary'
                                type='submit'
                                onClick={formSave}
                                disabled={
                                    isRestricted(['apim:api_create'], apiObject)
                                    || formHasErrors(validating || isEditing)
                                    || apiObject.isRevision
                                }
                                className={classes.saveButton}
                            >
                                {isEndpointSaving ? (
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.saving'
                                            defaultMessage='Saving'
                                        />
                                        <CircularProgress size={16} classes={{ root: classes.progress }} />
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? (
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.update.btn'
                                                defaultMessage='Update'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.create.btn'
                                                defaultMessage='Create'
                                            />
                                        )}
                                    </>
                                )}
                            </Button>
                            <Button
                                component={Link}
                                to={url}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
            {apiObject.gatewayType !== 'wso2/apk' && (
                <Dialog
                    open={advancedConfigOpen}
                    aria-labelledby='advanced-configurations-dialog-title'
                    onClose={handleAdvancedConfigClose}
                >
                    <DialogTitle>
                        <Typography className={classes.configDialogHeader}>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.AddEditAIEndpoint.advanced.configurations'
                                defaultMessage='Advanced Configurations'
                            />
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <AdvanceEndpointConfig
                            isSOAPEndpoint={false}
                            advanceConfig={advanceConfig}
                            onSaveAdvanceConfig={saveAdvanceConfig}
                            onCancel={handleAdvancedConfigClose}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </StyledGrid>
    );
}

AddEditAIEndpoint.propTypes = {
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        additionalProperties: PropTypes.shape({
            key: PropTypes.string,
            value: PropTypes.string,
        }).isRequired,
    }).isRequired,
    llmProviderEndpointConfiguration: PropTypes.shape({
        authenticationConfiguration: PropTypes.shape({
            enabled: PropTypes.bool,
            type: PropTypes.string,
            parameters: PropTypes.shape({
                headerEnabled: PropTypes.bool,
                headerName: PropTypes.string,
                queryParameterEnabled: PropTypes.bool,
                queryParameterName: PropTypes.string,
                awsServiceName: PropTypes.string,
            }),
        }),
    }).isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string,
        }),
    }).isRequired,
};

export default AddEditAIEndpoint;
