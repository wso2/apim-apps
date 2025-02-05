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

import React, { useEffect, useReducer, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { isRestricted } from 'AppData/AuthManager';
import {
    Icon,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
} from '@mui/material';
import API from 'AppData/api';
import CircularProgress from '@mui/material/CircularProgress';
import CONSTS from 'AppData/Constants';
import { green } from '@mui/material/colors';
import Alert from 'AppComponents/Shared/Alert';
import AIEndpointAuth from '../AIEndpointAuth';
import AdvanceEndpointConfig from '../AdvancedConfig/AdvanceEndpointConfig';

const PREFIX = 'EndpointCard';

const classes = {
    endpointCardWrapper: `${PREFIX}-endpointCardWrapper`,
    textField: `${PREFIX}-textField`,
    btn: `${PREFIX}-btn`,
    iconButton: `${PREFIX}-iconButton`,
    iconButtonValid: `${PREFIX}-iconButtonValid`,
    endpointValidChip: `${PREFIX}-endpointValidChip`,
    endpointInvalidChip: `${PREFIX}-endpointInvalidChip`,
    endpointErrorChip: `${PREFIX}-endpointErrorChip`,
};

const Root = styled(Grid)(({ theme }) => ({
    [`& .${classes.endpointCardWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.textField}`]: {
        width: '100%',
    },

    [`& .${classes.btn}`]: {
        marginRight: theme.spacing(0.5),
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
}));

/**
 * Reducer to manage endpoint state
 * @param {JSON} state state
 * @param {JSON} param1 field and value
 * @returns {Promise} promised State
 */
function endpointReducer(state, { field, value }) {
    switch (field) {
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
        case 'reset':
            return value;
        default:
            return state;
    }
}

const EndpointCard = ({
    apiObject,
    endpoint,
    apiKeyParamConfig,
    setProductionEndpoints,
    setSandboxEndpoints,
    showAddEndpoint,
    setShowAddEndpoint,
}) => {
    const [category, setCategory] = useState('');
    const [isEndpointValid, setIsEndpointValid] = useState();
    const [statusCode, setStatusCode] = useState('');
    const [isUpdating, setUpdating] = useState(false);
    const [isErrorCode, setIsErrorCode] = useState(false);
    const [endpointUrl, setEndpointUrl] = useState('');
    const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);
    const [isEndpointSaving, setEndpointSaving] = useState(false);
    const [isEndpointUpdating, setEndpointUpdating] = useState(false);
    const [isEndpointDeleting, setEndpointDeleting] = useState(false);
    const [advanceConfig, setAdvancedConfig] = useState({});
    const [state, dispatch] = useReducer(endpointReducer, endpoint || CONSTS.DEFAULT_ENDPOINT);
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    const intl = useIntl();

    useEffect(() => {
        try {
            if (state.environment === CONSTS.ENVIRONMENTS.production) {
                setCategory('production_endpoints');
                setEndpointUrl(state.endpointConfig.production_endpoints?.url);
                setAdvancedConfig(state.endpointConfig.production_endpoints?.config ?
                    state.endpointConfig.production_endpoints.config : {}
                );
            } else if (state.environment === CONSTS.ENVIRONMENTS.sandbox) {
                setCategory('sandbox_endpoints');
                setEndpointUrl(state.endpointConfig.sandbox_endpoints?.url);
                setAdvancedConfig(state.endpointConfig.sandbox_endpoints?.config ?
                    state.endpointConfig.sandbox_endpoints.config : {}
                );
            }
        } catch (error) {
            console.error('Failed to extract endpoint URL from the endpoint object', error);
        }
    }, [state]);

    const addEndpoint = (endpointBody) => {
        setEndpointSaving(true);
        const addEndpointPromise = API.addApiEndpoint(apiObject.id, endpointBody);
        addEndpointPromise
            .then((response) => {
                const newEndpoint = response.body;

                if (newEndpoint.environment === 'PRODUCTION') {
                    setProductionEndpoints(prev => [...prev, newEndpoint]);
                    dispatch({
                        field: 'reset',
                        value: {
                            ...CONSTS.DEFAULT_ENDPOINT,
                            environment: CONSTS.ENVIRONMENTS.production,
                        }
                    });
                } else if (newEndpoint.environment === 'SANDBOX') {
                    setSandboxEndpoints(prev => [...prev, newEndpoint]);
                    dispatch({
                        field: 'reset',
                        value: {
                            ...CONSTS.DEFAULT_ENDPOINT,
                            environment: CONSTS.ENVIRONMENTS.sandbox,
                        }
                    });
                }

                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.add.success',
                    defaultMessage: 'Endpoint added successfully!',
                }));
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.add.error',
                    defaultMessage: 'Something went wrong while adding the endpoint',
                }));
            }).finally(() => {
                setEndpointSaving(false);
            });
    };

    const updateEndpoint = (endpointId, endpointBody) => {
        setEndpointUpdating(true);
        // If primary default or sandbox default is edited, perform an API save and then send the endpoint update call

        const updateEndpointPromise = API.updateApiEndpoint(apiObject.id, endpointId, endpointBody);
        updateEndpointPromise
            .then((response) => {
                const updatedEndpoint = response.body;
                
                if (updatedEndpoint.environment === 'PRODUCTION') {
                    
                    setProductionEndpoints(prev =>
                        prev.map(endpointObj => (
                            endpointObj.id === endpointId 
                                ? { ...endpointObj, ...updatedEndpoint } 
                                : endpointObj
                        ))
                    );
                } else if (updatedEndpoint.environment === 'SANDBOX') {
                    setSandboxEndpoints(prev =>
                        prev.map(endpointObj => (
                            endpointObj.id === endpointId 
                                ? { ...endpointObj, ...updatedEndpoint } 
                                : endpointObj
                        ))
                    );
                }
                
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.update.success',
                    defaultMessage: 'Endpoint updated successfully!',
                }));
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.update.error',
                    defaultMessage: 'Something went wrong while updating the endpoint',
                }));
            }).finally(() => {
                setEndpointUpdating(false);
            });
    };

    const deleteEndpoint = (endpointId, environment) => {
        setEndpointDeleting(true);
        // if primary endpoint, show alert saying that this endpoint is treated as a primary endpoint 
        // and hence cannot be deleted.
        const deleteEndpointPromise = API.deleteApiEndpoint(apiObject.id, endpointId);
        deleteEndpointPromise
            .then(() => {
                if (environment === 'PRODUCTION') {
                    setProductionEndpoints(prev => prev.filter(endpointObj => endpointObj.id !== endpointId));
                } else if (environment === 'SANDBOX') {
                    setSandboxEndpoints(prev => prev.filter(endpointObj => endpointObj.id !== endpointId));
                }

                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.delete.success',
                    defaultMessage: 'Endpoint deleted successfully!',
                }));
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.delete.error',
                    defaultMessage: 'Something went wrong while deleting the endpoint',
                }));
            }).finally(() => {
                setEndpointDeleting(false);
            });
    };

    const saveEndpointSecurityConfig = (endpointSecurityObj, enType) => {
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

        dispatch({
            field: 'updateEndpointSecurity',
            value: {
                [enType]: newEndpointSecurityObj,
            },
        });
    };

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
        if (category === 'production_endpoints') {
            dispatch({ field: 'updateProductionEndpointUrl', value: endpointUrl.trim() });
        } else if (category === 'sandbox_endpoints') {
            dispatch({ field: 'updateSandboxEndpointUrl', value: endpointUrl.trim() });
        }
    };

    /**
     * Method to check whether the endpoint has errors.
     * @returns {boolean} Whether the endpoint has errors
     */
    const endpointHasErrors = () => {
        if (!state.name || !endpointUrl) {
            return true;
        } else {
            return false;
        }
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
        if (category === CONSTS.ENVIRONMENTS.production) {
            dispatch({
                field: 'updateProductionAdvancedConfiguration',
                value: {
                    config: advanceConfigObj,
                },
            });
        } else if (category === CONSTS.ENVIRONMENTS.sandbox) {
            dispatch({
                field: 'updateSandboxAdvancedConfiguration',
                value: {
                    config: advanceConfigObj,
                },
            });
        }
        handleAdvancedConfigClose();
    };

    return (
        <Root className={classes.endpointCardWrapper}>
            <Grid container rowSpacing={0} columnSpacing={2} className={classes.endpointCardWrapper}>
                <Grid item xs={6}>
                    <TextField
                        disabled={isRestricted(['apim:api_create'], apiObject)}
                        label='Endpoint Name'
                        id={state.id + '-name'}
                        className={classes.textField}
                        value={state.name}
                        onChange={(e) => dispatch({ field: 'name', value: e.target.value })}
                        variant='outlined'
                        margin='normal'
                        error={!state.name}
                        helperText={!state.name
                            ? (
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.endpoint.name.helper.text'
                                    defaultMessage='Endpoint name should not be empty'
                                />
                            ) : ' '
                        }
                        required
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        disabled={isRestricted(['apim:api_create'], apiObject)}
                        label='Endpoint URL'
                        id={state.id + '-url'}
                        className={classes.textField}
                        value={endpointUrl}
                        // placeholder={!endpointUrl ? 'https://ai.com/production' : ''}
                        onChange={(e) => setEndpointUrl(e.target.value)}
                        onBlur={handleEndpointBlur}
                        variant='outlined'
                        margin='normal'
                        error={!endpointUrl}
                        helperText={!endpointUrl
                            ? (
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.endpoint.url.helper.text'
                                    defaultMessage='Endpoint URL should not be empty'
                                />
                            ) : ' '
                        }
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    {statusCode && (
                                        <Chip
                                            id={state.id + '-endpoint-test-status'}
                                            label={statusCode}
                                            className={isEndpointValid ? classes.endpointValidChip : iff(
                                                isErrorCode,
                                                classes.endpointErrorChip, classes.endpointInvalidChip,
                                            )}
                                            variant='outlined'
                                        />
                                    )}
                                    <IconButton
                                        className={isEndpointValid ? classes.iconButtonValid : classes.iconButton}
                                        aria-label='TestEndpoint'
                                        onClick={() => testEndpoint(endpointUrl, apiObject.id)}
                                        disabled={(isRestricted(['apim:api_create'], apiObject)) || isUpdating}
                                        id={state.id + '-endpoint-test-icon-btn'}
                                        size='large'>
                                        {isUpdating
                                            ? <CircularProgress size={20} />
                                            : (
                                                <Tooltip
                                                    placement='top-start'
                                                    interactive
                                                    title={(
                                                        <FormattedMessage
                                                            id='Apis.Details.Endpoints.endpoint.check.status'
                                                            defaultMessage='Check endpoint status'
                                                        />
                                                    )}
                                                >
                                                    <Icon>
                                                        check_circle
                                                    </Icon>
                                                </Tooltip>

                                            )}
                                    </IconButton>
                                    <IconButton
                                        className={classes.iconButton}
                                        aria-label='Settings'
                                        onClick={handleAdvancedConfigOpen}
                                        disabled={(isRestricted(['apim:api_create'], apiObject))}
                                        id={state.id + '-endpoint-configuration-icon-btn'}
                                        size='large'>
                                        <Tooltip
                                            placement='top-start'
                                            interactive
                                            title={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.endpoint.configurations.tooltip'
                                                    defaultMessage='Endpoint configurations'
                                                />
                                            )}
                                        >
                                            <Icon>
                                                settings
                                            </Icon>
                                        </Tooltip>
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <AIEndpointAuth
                    api={apiObject}
                    endpoint={endpoint}
                    apiKeyParamConfig={apiKeyParamConfig}
                    isProduction={state.environment === CONSTS.ENVIRONMENTS.production}
                    saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                />
                <Grid item xs={12} justifyContent='flex-start' display='flex' pt={0}>
                    {showAddEndpoint
                        ? (
                            <>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    type='submit'
                                    onClick={() => addEndpoint(state)}
                                    className={classes.btn}
                                    disable={ endpointHasErrors() || isRestricted(['apim:api_create'], apiObject) }
                                >
                                    {isEndpointSaving
                                        ? <CircularProgress size='small' />
                                        :
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.endpoint.add'
                                            defaultMessage='Add'
                                        />
                                    }
                                </Button>
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    data-testid='policy-attached-details-save'
                                    onClick={() => setShowAddEndpoint(false)}
                                    disabled={ isRestricted(['apim:api_create'], apiObject) }
                                >
                                    {isEndpointDeleting
                                        ? <CircularProgress size='small' />
                                        :
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.endpoint.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    }
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    type='submit'
                                    onClick={() => updateEndpoint(state.id, state)}
                                    className={classes.btn}
                                    disable={ endpointHasErrors() || isRestricted(['apim:api_create'], apiObject) }
                                >
                                    {isEndpointUpdating
                                        ? <>
                                            <CircularProgress size='small' />
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.endpoint.updating'
                                                defaultMessage='Updating'
                                            />
                                        </>
                                        :
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.endpoint.update'
                                            defaultMessage='Update'
                                        />
                                    }
                                </Button>
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    data-testid='policy-attached-details-save'
                                    onClick={() => deleteEndpoint(state.id, state.environment)}
                                    disabled={ endpointHasErrors() || isRestricted(['apim:api_create'], apiObject) }
                                >
                                    {isEndpointDeleting
                                        ? <>
                                            <CircularProgress size='small' />
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.endpoint.deleting'
                                                defaultMessage='Deleting'
                                            />
                                        </>
                                        :
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.endpoint.delete'
                                            defaultMessage='Delete'
                                        />
                                    }
                                </Button>
                            </>
                        )}
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
                                id='Apis.Details.Endpoints.endpoint.advanced.configuration'
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
        </Root>
    );
};

export default EndpointCard; 