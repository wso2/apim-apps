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
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MCPServer from 'AppData/MCPServer';
import { green } from '@mui/material/colors';
import Alert from 'AppComponents/Shared/Alert';
import { isRestricted } from 'AppData/AuthManager';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { getBasePath } from 'AppComponents/Shared/Utils';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import AdvanceEndpointConfig from 'AppComponents/Apis/Details/Endpoints/AdvancedConfig/AdvanceEndpointConfig';
import EndpointSecurity from 'AppComponents/Apis/Details/Endpoints/GeneralConfiguration/EndpointSecurity';

const PREFIX = 'AddEditEndpoint';

// Permission arrays for MCP Server operations
const MCP_SERVER_BACKEND_VIEW_PERMISSIONS = [
    'apim:mcp_server_view',
    'apim:mcp_server_create',
    'apim:mcp_server_manage',
    'apim:mcp_server_publish',
    'apim:mcp_server_import_export',
];

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
                        ...(state.endpointConfig.endpoint_security || {}),
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
                        ...(state.endpointConfig.production_endpoints || {}),
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
                        ...(state.endpointConfig.sandbox_endpoints || {}),
                        ...value
                    },
                },
            }
        case 'updateProductionEndpointSecurity':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    endpoint_security: {
                        ...state.endpointConfig.endpoint_security,
                        production: {
                            ...(state.endpointConfig.endpoint_security?.production || {}),
                            ...value
                        },
                    },
                },
            }
        case 'updateSandboxEndpointSecurity':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    endpoint_security: {
                        ...state.endpointConfig.endpoint_security,
                        sandbox: {
                            ...(state.endpointConfig.endpoint_security?.sandbox || {}),
                            ...value
                        },
                    },
                },
            }
        default:
            return state;
    }
}

const AddEditEndpoint = ({
    apiObject,
    match: { params: { id: endpointId, endpointType } },
}) => {
    const { data: publisherSettings, isLoading } = usePublisherSettings();
    const { api } = useContext(APIContext);
    const path = useLocation().pathname;
    const [isEndpointValid, setIsEndpointValid] = useState();
    const [statusCode, setStatusCode] = useState('');
    const [isUpdating, setUpdating] = useState(false);
    const [isErrorCode, setIsErrorCode] = useState(false);
    const [endpointUrl, setEndpointUrl] = useState('');
    const [componentValidator, setComponentValidator] = useState([]);
    const [advanceConfig, setAdvancedConfig] = useState({});
    const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);
    const [endpointSecurityConfig, setEndpointSecurityConfig] = useState({});
    const [endpointSecurityTypes, setEndpointSecurityTypes] = useState([]);
    const [endpointSecurityConfigOpen, setEndpointSecurityConfigOpen] = useState(false);
    const [isEndpointSaving, setEndpointSaving] = useState(false);
    const [isEditing] = useState(!path.includes('/endpoints/create'));
    const [validating, setValidating] = useState(false);

    const [state, dispatch] = useReducer(endpointReducer, {
        ...CONSTS.DEFAULT_ENDPOINT,
        // Set deployment stage based on endpointType parameter or default to production
        deploymentStage: endpointType && endpointType === 'SANDBOX' 
            ? CONSTS.DEPLOYMENT_STAGE.sandbox 
            : CONSTS.DEPLOYMENT_STAGE.production,
        endpointConfig: {
            ...CONSTS.DEFAULT_ENDPOINT.endpointConfig,
            endpoint_type: 'http',
            endpoint_security: {},
        }
    });

    const intl = useIntl();
    const history = useHistory();
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    const endpointsUrl = getBasePath(apiObject.apiType) + apiObject.id + '/endpoints';

    useEffect(() => {
        if (!isLoading) {
            setComponentValidator(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].endpoints);
            setEndpointSecurityTypes(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].endpointSecurity);
        }
    }, [isLoading]);


    useEffect(() => {
        if (endpointId) {
            MCPServer.getMCPServerEndpoint(apiObject.id, endpointId)
                .then((response) => {
                    const { body } = response;
                    
                    // Parse endpoint configuration
                    let endpointConfig;
                    if (typeof body.endpointConfig === 'string') {
                        endpointConfig = JSON.parse(body.endpointConfig);
                    } else {
                        endpointConfig = body.endpointConfig;
                    }

                    // Dispatch the body with parsed endpointConfig
                    dispatch({ 
                        field: 'all', 
                        value: {
                            ...body,
                            endpointConfig
                        }
                    });

                    // Set endpoint URL and advanced configuration
                    if (endpointType === CONSTS.DEPLOYMENT_STAGE.production) {
                        setEndpointUrl(endpointConfig.production_endpoints?.url || '');
                        setAdvancedConfig(endpointConfig.production_endpoints?.config || {});
                        setEndpointSecurityConfig(endpointConfig.endpoint_security?.production || {});
                    } else if (endpointType === CONSTS.DEPLOYMENT_STAGE.sandbox) {
                        setEndpointUrl(endpointConfig.sandbox_endpoints?.url || '');
                        setAdvancedConfig(endpointConfig.sandbox_endpoints?.config || {});
                        setEndpointSecurityConfig(endpointConfig.endpoint_security?.sandbox || {});
                    }

                })
                .catch((error) => {
                    console.error('Error loading endpoint:', error);
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.AddEditEndpoint.error.loading',
                        defaultMessage: 'Error loading endpoint',
                    }));
                });
        }
    }, [endpointId, endpointType]);

    /**
     * Method to test the endpoint.
     * @param {String} endpointURL Endpoint URL 
     * @param {String} apiID API ID 
     */
    function testEndpoint(endpointURL, apiID) {
        setUpdating(true);
        MCPServer.testEndpoint(endpointURL, apiID)
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
        if (endpointType === CONSTS.DEPLOYMENT_STAGE.production) {
            dispatch({ field: 'updateProductionEndpointUrl', value: trimmedUrl });
        } else {
            dispatch({ field: 'updateSandboxEndpointUrl', value: trimmedUrl });
        }
    };

    /**
     * Method to check whether the endpoint has errors.
     * @param {string} fieldName The field name
     * @param {any} fieldValue The field value
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
                        id: 'MCPServers.Details.Endpoints.AddEditEndpoint.error.empty.name',
                        defaultMessage: 'Endpoint name cannot be empty',
                    });
                }
                return false;
            case 'url':
                if (!fieldValue) {
                    return intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.AddEditEndpoint.error.empty.url',
                        defaultMessage: 'Endpoint URL cannot be empty',
                    });
                } else if (!isValidUrl(fieldValue)) {
                    return intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.AddEditEndpoint.error.invalid.url',
                        defaultMessage: 'Please enter a valid endpoint URL',
                    });
                }
                return false;
            default:
                return false;
        }
    };

    const formHasErrors = (validateActive = false) => {
        if (hasErrors('name', state.name, validateActive) ||
            hasErrors('url', endpointUrl, validateActive)) {
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
     * Method to open the endpoint security configuration dialog box.
     */
    const handleEndpointSecurityConfigOpen = () => {
        setEndpointSecurityConfigOpen(true);
    };

    /**
     * Method to close the endpoint security configuration dialog box.
     */
    const handleEndpointSecurityConfigClose = () => {
        setEndpointSecurityConfigOpen(false);
    };

    /**
     * Method to save the advance configurations.
     *
     * @param {object} advanceConfigObj The advance configuration object
     * */
    const saveAdvanceConfig = (advanceConfigObj) => {
        setAdvancedConfig(advanceConfigObj);
        if (endpointType === CONSTS.DEPLOYMENT_STAGE.production) {
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

    const saveEndpointSecurityConfig = (endpointSecurityObj) => {
        const { type } = endpointSecurityObj;
        let newEndpointSecurityObj = endpointSecurityObj;
        const secretPlaceholder = '******';
        newEndpointSecurityObj.clientSecret = newEndpointSecurityObj.clientSecret
            === secretPlaceholder ? '' : newEndpointSecurityObj.clientSecret;
        newEndpointSecurityObj.password = newEndpointSecurityObj.password
            === secretPlaceholder ? '' : newEndpointSecurityObj.password;
        if (type === 'NONE') {
            newEndpointSecurityObj = { ...CONSTS.DEFAULT_ENDPOINT_SECURITY, type };
        } else {
            newEndpointSecurityObj.enabled = true;
        }

        setEndpointSecurityConfig(newEndpointSecurityObj);
        if (endpointType === CONSTS.DEPLOYMENT_STAGE.production) {
            dispatch({
                field: 'updateProductionEndpointSecurity',
                value: newEndpointSecurityObj,
            });
        } else {
            dispatch({
                field: 'updateSandboxEndpointSecurity',
                value: newEndpointSecurityObj,
            });
        }
        setEndpointSecurityConfigOpen(false);
    };

    /**
     * Method to render the endpoint URL input adornment with test, settings, and security buttons.
     * @returns {JSX.Element} InputAdornment component
     */
    const renderEndpointUrlAdornment = () => (
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
                    (isRestricted(['apim:mcp_server_create', 'apim:mcp_server_manage'], apiObject)) || isUpdating
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
                                    id='MCPServers.Details.Endpoints.AddEditEndpoint.test.endpoint'
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
                disabled={isRestricted(MCP_SERVER_BACKEND_VIEW_PERMISSIONS, apiObject)}
                id='endpoint-configuration-icon-btn'
                size='large'>
                <Tooltip
                    placement='top-start'
                    interactive
                    title={(
                        <FormattedMessage
                            id='MCPServers.Details.Endpoints.AddEditEndpoint.endpoint.configuration'
                            defaultMessage='Endpoint configurations'
                        />
                    )}
                >
                    <SettingsIcon />
                </Tooltip>
            </IconButton>
            <IconButton
                className={classes.iconButton}
                aria-label='Security'
                onClick={handleEndpointSecurityConfigOpen}
                disabled={isRestricted(MCP_SERVER_BACKEND_VIEW_PERMISSIONS, apiObject)}
                id='endpoint-security-icon-btn'
                size='large'>
                <Tooltip
                    placement='top-start'
                    interactive
                    title={(
                        <FormattedMessage
                            id='MCPServers.Details.Endpoints.AddEditEndpoint.endpoint.security.button'
                            defaultMessage='Endpoint security'
                        />
                    )}
                >
                    <SecurityIcon />
                </Tooltip>
            </IconButton>
        </InputAdornment>
    );

    const handleDeploymentStageChange = (event) => {
        const newStage = event.target.value;

        // Only handle switching if actually changing stages
        if (newStage !== endpointType) {
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

    const formSave = () => {
        setValidating(true);
        if (formHasErrors(true)) {
            Alert.error(intl.formatMessage({
                id: 'MCPServers.Details.Endpoints.AddEditEndpoint.form.has.errors',
                defaultMessage: 'One or more fields contain errors',
            }));
            return false;
        }

        setEndpointSaving(true);

        const payload = {
            ...state,
            endpointConfig: JSON.stringify(state.endpointConfig)
        };

        const savePromise = MCPServer.updateMCPServerBackend(apiObject.id, endpointId, payload);
        savePromise
            .then(() => {
                if (isEditing) {
                    Alert.success(intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.AddEditEndpoint.edit.success',
                        defaultMessage: 'Endpoint updated successfully',
                    }));
                } else {
                    Alert.success(intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.AddEditEndpoint.add.success',
                        defaultMessage: 'Endpoint added successfully',
                    }));
                }
                history.push(endpointsUrl);
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'MCPServers.Details.Endpoints.AddEditEndpoint.error.saving',
                    defaultMessage: 'Error occurred while saving the endpoint',
                }));
            })
            .finally(() => {
                setEndpointSaving(false);
            });
        return true;
    };

    return (
        <StyledGrid container justifyContent='center'>
            <Grid item sm={12} md={12} lg={8}>
                <Grid item md={12}>
                    <div className={classes.titleWrapper}>
                        <Link to={endpointsUrl} className={classes.titleLink}>
                            <Typography variant='h4' component='h2'>
                                <FormattedMessage
                                    id='MCPServers.Details.Endpoints.AddEditEndpoint.heading'
                                    defaultMessage='Endpoints'
                                />
                            </Typography>
                        </Link>
                        <KeyboardArrowRightIcon />
                        <Typography variant='h4' component='h3'>
                            {
                                isEditing ?
                                    <FormattedMessage
                                        id='MCPServers.Details.Endpoints.AddEditEndpoint.edit.endpoint'
                                        defaultMessage='Edit Endpoint'
                                    /> :
                                    <FormattedMessage
                                        id='MCPServers.Details.Endpoints.AddEditEndpoint.create.new.endpoint'
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
                                    id='MCPServers.Details.Endpoints.AddEditEndpoint.select.endpoint.type'
                                    defaultMessage='Select Endpoint Type'
                                />
                            </Typography>
                            <RadioGroup
                                row
                                aria-label='deployment-stage'
                                name='deployment-stage'
                                value={endpointType}
                                onChange={handleDeploymentStageChange}
                                disabled
                            >
                                <FormControlLabel
                                    value={CONSTS.DEPLOYMENT_STAGE.production}
                                    control={<Radio disabled />}
                                    label={
                                        <FormattedMessage
                                            id='MCPServers.Details.Endpoints.AddEditEndpoint.production'
                                            defaultMessage='Production'
                                        />
                                    }
                                />
                                <FormControlLabel
                                    value={CONSTS.DEPLOYMENT_STAGE.sandbox}
                                    control={<Radio disabled />}
                                    label={
                                        <FormattedMessage
                                            id='MCPServers.Details.Endpoints.AddEditEndpoint.sandbox'
                                            defaultMessage='Sandbox'
                                        />
                                    }
                                />
                            </RadioGroup>
                        </FormControl>

                        {/* Main Form Grid */}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        disabled
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
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        disabled={isRestricted(MCP_SERVER_BACKEND_VIEW_PERMISSIONS, apiObject)}
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
                                            endAdornment: renderEndpointUrlAdornment(),
                                        }}
                                    />
                                </FormControl>
                            </Grid>
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
                                    isRestricted([
                                        'apim:mcp_server_create',
                                        'apim:mcp_server_manage',
                                        'apim:mcp_server_publish',
                                        'apim:mcp_server_import_export',
                                    ], apiObject)
                                    || formHasErrors(validating || isEditing)
                                    || apiObject.isRevision
                                }
                                className={classes.saveButton}
                            >
                                {isEndpointSaving ? (
                                    <>
                                        <FormattedMessage
                                            id='MCPServers.Details.Endpoints.AddEditEndpoint.saving'
                                            defaultMessage='Saving'
                                        />
                                        <CircularProgress size={16} classes={{ root: classes.progress }} />
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? (
                                            <FormattedMessage
                                                id='MCPServers.Details.Endpoints.AddEditEndpoint.update.btn'
                                                defaultMessage='Update'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='MCPServers.Details.Endpoints.AddEditEndpoint.create.btn'
                                                defaultMessage='Create'
                                            />
                                        )}
                                    </>
                                )}
                            </Button>
                            <Button
                                component={Link}
                                to={endpointsUrl}
                            >
                                <FormattedMessage
                                    id='MCPServers.Details.Endpoints.AddEditEndpoint.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
            {componentValidator.includes('advancedConfigurations') && (
                <Dialog
                    open={advancedConfigOpen}
                    aria-labelledby='advanced-configurations-dialog-title'
                    onClose={handleAdvancedConfigClose}
                >
                    <DialogTitle>
                        <Typography className={classes.configDialogHeader}>
                            <FormattedMessage
                                id='MCPServers.Details.Endpoints.AddEditEndpoint.advanced.configurations'
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
            {endpointSecurityTypes && endpointSecurityTypes.length > 0 &&
                <>
                    <Dialog
                        open={endpointSecurityConfigOpen}
                        aria-labelledby='endpoint-security-dialog-title'
                        onClose={handleEndpointSecurityConfigClose}
                    >
                        <DialogTitle>
                            <Typography className={classes.configDialogHeader}>
                                <FormattedMessage
                                    id='MCPServers.Details.Endpoints.AddEditEndpoint.security.configuration'
                                    defaultMessage='Endpoint Security Configurations'
                                />
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            {endpointType === CONSTS.DEPLOYMENT_STAGE.production ? (
                                <EndpointSecurity
                                    securityInfo={endpointSecurityConfig}
                                    saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                                    closeEndpointSecurityConfig={handleEndpointSecurityConfigClose}
                                    isProduction
                                    endpointSecurityTypes={endpointSecurityTypes}
                                />
                            ) : (
                                <EndpointSecurity
                                    securityInfo={endpointSecurityConfig}
                                    saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                                    closeEndpointSecurityConfig={handleEndpointSecurityConfigClose}
                                    endpointSecurityTypes={endpointSecurityTypes}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            }
        </StyledGrid>
    );
}

AddEditEndpoint.propTypes = {
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        additionalProperties: PropTypes.shape({
            key: PropTypes.string,
            value: PropTypes.string,
        }).isRequired,
        apiType: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string,
            endpointType: PropTypes.string,
        }),
    }).isRequired,
};

export default AddEditEndpoint;
