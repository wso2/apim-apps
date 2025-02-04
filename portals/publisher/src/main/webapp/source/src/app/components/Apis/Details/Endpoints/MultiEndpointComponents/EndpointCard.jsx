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
// import EndpointTextField from './EndpointTextField';
import CONSTS from 'AppData/Constants';
import { green } from '@mui/material/colors';
import Alert from 'AppComponents/Shared/Alert';
import AIEndpointAuth from '../AIEndpointAuth';
// import GenericEndpoint from '../GenericEndpoint';

const PREFIX = 'EndpointCard';

const classes = {
    endpointCardWrapper: `${PREFIX}-endpointCardWrapper`,
    textField: `${PREFIX}-textField`,
    urlTextField: `${PREFIX}-urlTextField`,
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
        minHeight: '80px',
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
        default:
            return state;
    }
}

const EndpointCard = ({
    api,
    endpoint,
    name,
    apiKeyParamConfig,
    category,
    setProductionEndpoints,
    setSandboxEndpoints,
}) => {
    const [isEndpointValid, setIsEndpointValid] = useState();
    const [statusCode, setStatusCode] = useState('');
    const [isUpdating, setUpdating] = useState(false);
    const [isErrorCode, setIsErrorCode] = useState(false);
    const [endpointUrl, setEndpointUrl] = useState('');
    const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);
    const [isEndpointUpdating, setEndpointUpdating] = useState(false);
    const [isEndpointDeleting, setEndpointDeleting] = useState(false);
    const [state, dispatch] = useReducer(endpointReducer, endpoint || CONSTS.DEFAULT_ENDPOINT);
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    const intl = useIntl();

    useEffect(() => {
        try {
            if (state.environment === CONSTS.ENVIRONMENTS.production) {
                setEndpointUrl(state.endpointConfig.production_endpoints?.url);
            } else if (state.environment === CONSTS.ENVIRONMENTS.sandbox) {
                setEndpointUrl(state.endpointConfig.sandbox_endpoints?.url);
            }
        } catch (error) {
            console.error('Failed to extract endpoint URL from the endpoint object', error);
        }
    }, [state]);

    const updateEndpoint = (endpointId, endpointBody) => {
        setEndpointUpdating(true);
        const updateEndpointPromise = API.updateEndpoint(api.id, endpointId, endpointBody);
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
        const deleteEndpointPromise = API.deleteEndpoint(api.id, endpointId);
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

    // /**
    //  * Method to get the advance configuration from the selected endpoint.
    //  *
    //  * @param {number} index The selected endpoint index
    //  * @param {string} epType The type of the endpoint. (loadbalance/ failover)
    //  * @param {string} category The endpoint category (Production/ sandbox)
    //  * @return {object} The advance config object of the endpoint.
    //  * */
    // const getAdvanceConfig = (index, epType, category) => {
    //     const endpointTypeProperty = getEndpointTypeProperty(epType, category);
    //     let advanceConfig = {};
    //     if (index > 0) {
    //         if (epConfig.endpoint_type === 'failover') {
    //             advanceConfig = epConfig[endpointTypeProperty][index - 1].config;
    //         } else {
    //             advanceConfig = epConfig[endpointTypeProperty][index].config;
    //         }
    //     } else {
    //         const endpointInfo = epConfig[endpointTypeProperty];
    //         if (Array.isArray(endpointInfo)) {
    //             advanceConfig = endpointInfo[0].config;
    //         } else {
    //             advanceConfig = endpointInfo.config;
    //         }
    //     }
    //     return advanceConfig;
    // };

    // /**
    //  * Method to open/ close the advance configuration dialog. This method also sets some information about the
    //  * seleted endpoint type/ category and index.
    //  *
    //  * @param {number} index The index of the selected endpoint.
    //  * @param {string} type The endpoint type
    //  * @param {string} category The endpoint category.
    //  * */
    // const toggleAdvanceConfig = (index, type, category) => {
    //     const advanceEPConfig = getAdvanceConfig(index, type, category);
    //     setAdvancedConfigOptions(() => {
    //         return ({
    //             open: !advanceConfigOptions.open,
    //             index,
    //             type,
    //             category,
    //             config: advanceEPConfig === undefined ? {} : advanceEPConfig,
    //         });
    //     });
    // };

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

    const handleAdvancedConfigOpen = () => {
        setAdvancedConfigOpen(true);
    };
    
    const handleAdvancedConfigClose = () => {
        setAdvancedConfigOpen(false);
    };

    return (
        <Root>
            {/* <EndpointTextField /> */}
            <Grid container spacing={2} className={classes.endpointCardWrapper}>
                <Grid item xs={6}>
                    <TextField
                        disabled={isRestricted(['apim:api_create'], api)}
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
                            ) : ''
                        }
                        required
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        disabled={isRestricted(['apim:api_create'], api)}
                        label={name}
                        id={state.id + '-url'}
                        className={classes.textField}
                        value={endpointUrl}
                        placeholder={!endpointUrl ? 'https://ai.com/production' : ''}
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
                            ) : ''
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
                                        onClick={() => testEndpoint(endpointUrl, api.id)}
                                        disabled={(isRestricted(['apim:api_create'], api)) || isUpdating}
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
                                        disabled={(isRestricted(['apim:api_create'], api))}
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
                    api={api}
                    endpoint={endpoint}
                    apiKeyParamConfig={apiKeyParamConfig}
                    isProduction={state.environment === CONSTS.ENVIRONMENTS.production}
                    saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                />
                <Grid item xs={12} justifyContent='flex-end' display='flex'>
                    <Button
                        variant='outlined'
                        color='primary'
                        type='submit'
                        onClick={() => updateEndpoint(state.id, state)}
                        className={classes.btn}
                        disable={ endpointHasErrors() || isRestricted(['apim:api_create'], api) }
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
                        disabled={ endpointHasErrors() || isRestricted(['apim:api_create'], api) }
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
                </Grid>
            </Grid>
            <Dialog
                open={advancedConfigOpen}
                aria-labelledby='advanced-configurations-dialog-title'
                onClose={handleAdvancedConfigClose}
            >
                <DialogTitle>
                    <Typography className={classes.configDialogHeader}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.EndpointOverview.endpoint.security.configuration'
                            defaultMessage='Endpoint Security Configurations'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {/* {endpointSecurityConfig.category === 'production' ? (
                        <EndpointSecurity
                            securityInfo={endpointSecurityInfo
                                && (endpointSecurityInfo.production
                                    ? endpointSecurityInfo.production : endpointSecurityInfo)}
                            onChangeEndpointAuth={handleEndpointSecurityChange}
                            saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                            closeEndpointSecurityConfig={closeEndpointSecurityConfig}
                            isProduction
                        />
                    ) : (
                        <EndpointSecurity
                            securityInfo={endpointSecurityInfo
                                && (endpointSecurityInfo.sandbox
                                    ? endpointSecurityInfo.sandbox : endpointSecurityInfo)}
                            onChangeEndpointAuth={handleEndpointSecurityChange}
                            saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                            closeEndpointSecurityConfig={closeEndpointSecurityConfig}
                        />
                    )} */}
                </DialogContent>
            </Dialog>
        </Root>
    );
};

export default EndpointCard; 