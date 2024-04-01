/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, {
    useEffect, useState, useRef,
} from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import {
    Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress, Tooltip,
} from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Icon from '@mui/material/Icon';
import AuthManager from 'AppData/AuthManager';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import WarningIcon from '@mui/icons-material/Warning';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AdvertiseDetailsPanel from 'AppComponents/Shared/ApiTryOut/AdvertiseDetailsPanel';
import Progress from '../Progress';
import Api from '../../../data/api';
import Application from '../../../data/Application';
import SelectAppPanel from './SelectAppPanel';

const PREFIX = 'TryOutController';

const classes = {
    centerItems: `${PREFIX}-centerItems`,
    tokenType: `${PREFIX}-tokenType`,
    paper: `${PREFIX}-paper`,
    grid: `${PREFIX}-grid`,
    tryoutHeading: `${PREFIX}-tryoutHeading`,
    genKeyButton: `${PREFIX}-genKeyButton`,
    gatewayEnvironment: `${PREFIX}-gatewayEnvironment`,
    categoryHeading: `${PREFIX}-categoryHeading`,
    tooltip: `${PREFIX}-tooltip`,
    menuItem: `${PREFIX}-menuItem`,
    warningIcon: `${PREFIX}-warningIcon`,
    loadMoreLink: `${PREFIX}-loadMoreLink`,
    link: `${PREFIX}-link`,
    authHeader: `${PREFIX}-authHeader`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    width: '100%',
    [`& .${classes.centerItems}`]: {
        margin: 'auto',
    },

    [`& .${classes.tokenType}`]: {
        margin: 'auto',
        display: 'flex',
        '& .MuiButton-contained.Mui-disabled span.MuiButton-label': {
            color: '#6d6d6d',
        },
    },

    [`& .${classes.paper}`]: {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },

    [`& .${classes.grid}`]: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
        paddingRight: theme.spacing(2),
        justifyContent: 'center',
    },

    [`& .${classes.tryoutHeading}`]: {
        fontWeight: 400,
        display: 'block',
    },

    [`& .${classes.genKeyButton}`]: {
        background: theme.palette.grey[300],
        width: theme.spacing(20),
        height: theme.spacing(5),
        marginTop: theme.spacing(2.5),
        marginLeft: theme.spacing(2),
        '&:disabled': {
            cursor: 'not-allowed',
            background: theme.palette.grey[50],
        },
    },

    [`& .${classes.gatewayEnvironment}`]: {
        marginTop: theme.spacing(4),
    },

    [`& .${classes.categoryHeading}`]: {
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(-5),
    },

    [`& .${classes.tooltip}`]: {
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.menuItem}`]: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },

    [`& .${classes.warningIcon}`]: {
        color: '#ff9a00',
        fontSize: 25,
        marginRight: 10,
    },

    [`& .${classes.loadMoreLink}`]: {
        textDecoration: 'none',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
    },

    [`& .${classes.link}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        cursor: 'pointer',
    },

    [`& .${classes.authHeader}`]: {
        marginBottom: '20px',
    },
}));

/**
 * TryOut component
 *
 * @class TryOutController
 * @extends {Component}
 */
function TryOutController(props) {
    const {
        securitySchemeType, selectedEnvironment, environments,
        productionAccessToken, sandboxAccessToken, selectedKeyType, setKeys, setSelectedKeyType, setSelectedKeyManager,
        setSelectedEnvironment, setProductionAccessToken, setSandboxAccessToken, scopes, setSecurityScheme, setUsername,
        setPassword, username, password, updateSwagger, setProductionApiKey, setSandboxApiKey, productionApiKey,
        sandboxApiKey, environmentObject, setURLs, setAdvAuthHeader, setAdvAuthHeaderValue, advAuthHeader,
        advAuthHeaderValue, setSelectedEndpoint, selectedEndpoint, api, URLs, onConfigChange,
    } = props;
    let { selectedKeyManager } = props;
    selectedKeyManager = selectedKeyManager || 'Resident Key Manager';

    const [showToken, setShowToken] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState([]);
    const [keyManagers, setKeyManagers] = useState([]);
    const [selectedKMObject, setSelectedKMObject] = useState(null);
    const [ksGenerated, setKSGenerated] = useState(false);
    const [showMoreGWUrls, setShowMoreGWUrls] = useState(false);
    const [tokenValue, setTokenValue] = useState('');
    const apiID = api.id;
    const restApi = new Api();
    const user = AuthManager.getUser();

    const handleAccessTokenChange = ({ newAccessToken }) => {
        if (onConfigChange) {
            onConfigChange({
                newAccessToken,
                newSecurityScheme: securitySchemeType,
                newUsername: username,
                newPassword: password,
                newSelectedEnvironment: selectedEnvironment,
            });
        }
    };

    useEffect(() => {
        let subscriptionsList;
        let newSelectedApplication;
        let keys;
        let selectedKeyTypes = 'PRODUCTION';
        let accessToken;
        if (api.lifeCycleStatus) {
            const promiseSubscriptions = restApi.getSubscriptions(apiID);
            promiseSubscriptions.then((subscriptionsResponse) => {
                if (subscriptionsResponse !== null) {
                    subscriptionsList = subscriptionsResponse.obj.list.filter((item) => item.status === 'UNBLOCKED'
                        || item.status === 'PROD_ONLY_BLOCKED' || item.status === 'TIER_UPDATE_PENDING');

                    if (subscriptionsList && subscriptionsList.length > 0) {
                        newSelectedApplication = subscriptionsList[0].applicationId;
                        Application.get(newSelectedApplication)
                            .then((application) => {
                                return application.getKeys();
                            })
                            .then((appKeys) => {
                                if (appKeys.get(selectedKeyManager)
                                    && appKeys.get(selectedKeyManager).keyType === 'SANDBOX') {
                                    selectedKeyTypes = 'SANDBOX';
                                    ({ accessToken } = appKeys.get(selectedKeyManager).token);
                                } else if (appKeys.get(selectedKeyManager)
                                    && appKeys.get(selectedKeyManager).keyType === 'PRODUCTION') {
                                    selectedKeyTypes = 'PRODUCTION';
                                    ({ accessToken } = appKeys.get(selectedKeyManager).token);
                                }
                                setSelectedApplication(newSelectedApplication);
                                setSubscriptions(subscriptionsList);
                                setKeys(appKeys);
                                setSelectedEnvironment(selectedEnvironment, false);
                                setSelectedKeyType(selectedKeyTypes, false);
                                if (selectedKeyType === 'PRODUCTION') {
                                    setProductionAccessToken(accessToken);
                                } else {
                                    setSandboxAccessToken(accessToken);
                                }
                            });
                    } else {
                        setSelectedApplication(newSelectedApplication);
                        setSubscriptions(subscriptionsList);
                        setKeys(keys);
                        setSelectedEnvironment(selectedEnvironment, false);
                        if (selectedKeyType === 'PRODUCTION') {
                            setProductionAccessToken(accessToken);
                        } else {
                            setSandboxAccessToken(accessToken);
                        }
                        setSelectedKeyType(selectedKeyType, false);
                    }
                } else {
                    setSelectedApplication(newSelectedApplication);
                    setSubscriptions(subscriptionsList);
                    setKeys(keys);
                    setSelectedEnvironment(selectedEnvironment, false);
                    if (selectedKeyType === 'PRODUCTION') {
                        setProductionAccessToken(accessToken);
                    } else {
                        setSandboxAccessToken(accessToken);
                    }
                    setSelectedKeyType(selectedKeyType, false);
                }
            }).catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const { status } = error;
                if (status === 404) {
                    setNotFound(true);
                }
            });
            const promisedKeyManagers = restApi.getKeyManagers();
            promisedKeyManagers
                .then((response) => {
                    const responseKeyManagerList = [];
                    response.body.list.map((item) => responseKeyManagerList.push(item));
                    setKeyManagers(responseKeyManagerList);
                    const filteredKMs = (responseKeyManagerList.filter((km) => km.name === selectedKeyManager));
                    if (filteredKMs && filteredKMs.length > 0) {
                        setSelectedKMObject(filteredKMs[0]);
                    }
                })
                .catch((error) => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(error);
                    }
                    const { status } = error;
                    if (status === 404) {
                        setNotFound(true);
                    }
                });
        }
    }, []);

    /**
     * Generate access token
     * */
    function generateAccessToken() {
        if (api.lifeCycleStatus) {
            setIsUpdating(true);
            const applicationPromise = Application.get(selectedApplication);
            applicationPromise
                .then((application) => application.generateToken(
                    selectedKeyManager,
                    selectedKeyType,
                    3600,
                    scopes,
                ))
                .then((response) => {
                    console.log('token generated successfully ' + response);
                    setShowToken(false);
                    if (selectedKeyType === 'PRODUCTION') {
                        setProductionAccessToken(response.accessToken);
                    } else {
                        setSandboxAccessToken(response.accessToken);
                    }
                    handleAccessTokenChange({ newAccessToken: response.accessToken });
                    setIsUpdating(false);
                })
                .catch((error) => {
                    console.error(error);
                    const { status } = error;
                    if (status === 404) {
                        setNotFound(true);
                    }
                    setIsUpdating(false);
                });
        }
    }

    /**
     * Generate api key
     * */
    function generateApiKey() {
        if (api.lifeCycleStatus) {
            setIsUpdating(true);
            const promisedKey = restApi.generateApiKey(selectedApplication, selectedKeyType, -1);
            promisedKey
                .then((response) => {
                    console.log('Non empty response received', response);
                    setShowToken(false);
                    if (selectedKeyType === 'PRODUCTION') {
                        setProductionApiKey(response.body.apikey);
                    } else {
                        setSandboxApiKey(response.body.apikey);
                    }
                    handleAccessTokenChange({ newAccessToken: response.body.apikey });
                    setIsUpdating(false);
                })
                .catch((error) => {
                    console.log(error);
                    const { status } = error;
                    if (status === 404) {
                        setNotFound(true);
                    }
                    setIsUpdating(false);
                });
        }
    }

    /**
     *
     * Handle onClick of shown access token
     * @memberof TryOutController
     */
    function handleClickShowToken() {
        setShowToken(!showToken);
    }

    /**
     * Load the selected application information
     * @memberof TryOutController
     */
    function updateApplication() {
        if (api.lifeCycleStatus) {
            let accessToken;
            let keyType;
            if (subscriptions !== null && subscriptions.length !== 0 && selectedApplication.length !== 0) {
                if (subscriptions.find((sub) => sub.applicationId
                    === selectedApplication).status === 'PROD_ONLY_BLOCKED') {
                    setSelectedKeyType(selectedKeyType, false);
                    keyType = 'SANDBOX';
                } else {
                    keyType = selectedKeyType;
                }
            }
            Application.get(selectedApplication)
                .then((application) => {
                    return application.getKeys(keyType || 'PRODUCTION');
                })
                .then((appKeys) => {
                    const selectedKeys = appKeys.get(selectedKeyManager);
                    if (selectedKeys && selectedKeys.keyType === selectedKeyType) {
                        ({ accessToken } = selectedKeys.token);
                    }
                    if (selectedKeys && selectedKeys.keyType === 'PRODUCTION') {
                        setProductionAccessToken(accessToken);
                    } else if (selectedKeys && selectedKeys.keyType === 'SANDBOX') {
                        setSandboxAccessToken(accessToken);
                    }
                    if (selectedKeys && selectedKeys.consumerKey && selectedKeys.consumerKey !== '') {
                        setKSGenerated(true);
                    } else {
                        setKSGenerated(false);
                    }
                    setKeys(appKeys);
                });
        }
    }

    useEffect(() => {
        updateApplication();
    }, [selectedApplication, selectedKeyType, selectedEnvironment, securitySchemeType]);

    useEffect(() => {
        if (onConfigChange) {
            onConfigChange({
                newAccessToken: null,
                newSecurityScheme: securitySchemeType,
                newUsername: username,
                newPassword: password,
                newSelectedEnvironment: selectedEnvironment
            });
        }
    }, [username, password, selectedEnvironment, securitySchemeType]); 

    /**
     * Handle onChange of inputs
     * @param {*} event event
     * @memberof TryOutController
     */
    function handleChanges(event) {
        const { target } = event;
        const { name, value } = target;
        switch (name) {
            case 'selectedEnvironment':
                setSelectedEnvironment(value, true);
                if (api.type !== 'GRAPHQL') {
                    updateSwagger(value);
                }
                if (environmentObject) {
                    const urls = environmentObject.find((elm) => value === elm.environmentName).URLs;
                    setURLs(urls);
                }
                break;
            case 'selectedApplication':
                setProductionAccessToken('');
                setSandboxAccessToken('');
                setProductionApiKey('');
                setSandboxApiKey('');
                setSelectedApplication(value);
                break;
            case 'selectedKeyManager':
                setSelectedKeyManager(value, true, selectedApplication);
                break;
            case 'selectedKeyType':
                if (!productionAccessToken || !sandboxAccessToken) {
                    setSelectedKeyType(value, true, selectedApplication);
                } else {
                    setSelectedKeyType(value, false, selectedApplication);
                }
                break;
            case 'securityScheme':
                setSecurityScheme(value);
                break;
            case 'username':
                setUsername(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'accessToken':
                handleAccessTokenChange({ newAccessToken: value });
                if (securitySchemeType === 'API-KEY' && selectedKeyType === 'PRODUCTION') {
                    setProductionApiKey(value);
                } else if (securitySchemeType === 'API-KEY' && selectedKeyType === 'SANDBOX') {
                    setSandboxApiKey(value);
                } else if (selectedKeyType === 'PRODUCTION') {
                    setProductionAccessToken(value);
                } else {
                    setSandboxAccessToken(value);
                }
                break;
            case 'advAuthHeader':
                setAdvAuthHeader(value);
                break;
            case 'advAuthHeaderValue':
                setAdvAuthHeaderValue(value);
                break;
            case 'selectedEndpoint':
                setSelectedEndpoint(value);
                break;
            default:
        }
    }

    if (api == null) {
        return <Progress />;
    }
    if (notFound) {
        return 'API Not found !';
    }
    let isApiKeyEnabled = false;
    let isBasicAuthEnabled = false;
    let isOAuthEnabled = false;
    let isTestKeyEnabled = false;
    let authorizationHeader = api.authorizationHeader ? api.authorizationHeader : 'Authorization';
    let prefix = 'Bearer';
    if (api && api.securityScheme) {
        isApiKeyEnabled = api.securityScheme.includes('api_key');
        isBasicAuthEnabled = api.securityScheme.includes('basic_auth');
        isOAuthEnabled = api.securityScheme.includes('oauth2');
        isTestKeyEnabled = api.securityScheme.includes('test_auth');
        if (isApiKeyEnabled && securitySchemeType === 'API-KEY') {
            authorizationHeader = api.apiKeyHeader ? api.apiKeyHeader : 'ApiKey';
            prefix = '';
        }
        if (isTestKeyEnabled && securitySchemeType === 'TEST') {
            authorizationHeader = 'testKey';
            prefix = '';
        }
    }
    const isPrototypedAPI = api.lifeCycleStatus && api.lifeCycleStatus.toLowerCase() === 'prototyped';
    const isPublished = api.lifeCycleStatus.toLowerCase() === 'published';
    const showSecurityType = isPublished || isPrototypedAPI;

    const authHeader = `${authorizationHeader}: ${prefix}`;

    useEffect(() => {
        if (securitySchemeType === 'API-KEY') {
            setTokenValue(selectedKeyType === 'PRODUCTION' ? productionApiKey : sandboxApiKey);
        } else {
            setTokenValue(selectedKeyType === 'PRODUCTION' ? productionAccessToken : sandboxAccessToken);
        }
    }, [securitySchemeType, selectedKeyType, productionAccessToken, sandboxAccessToken, productionApiKey, sandboxApiKey]);

    return (
        <Root>
            <Grid x={12} md={6} className={classes.centerItems}>
                <Box>
                    {securitySchemeType !== 'TEST' && (!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                        <>
                            <Box mb={1}>
                                <Typography variant='body1'>
                                    <Box display='flex' alignItems='center'>
                                        {(keyManagers.length > 1 && selectedKMObject && selectedKMObject.enabled) && (
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.TryOutController.default.km.msg.one'
                                                defaultMessage='The Resident Key Manager is selected for try out console.'
                                            />
                                        )}
                                        {(selectedKMObject && !selectedKMObject.enabled) && (
                                            <>
                                                <WarningIcon className={classes.warningIcon} />
                                                <div>
                                                    <FormattedMessage
                                                        id='Apis.Details.ApiConsole.TryOutController.default.km.msg.two'
                                                        defaultMessage={'Try it console is only accessible via the default key manager.'
                                        + 'But the default key manager is disabled at the moment.'}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {(selectedKMObject && selectedKMObject.length === 0) && (
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.TryOutController.default.km.msg.three'
                                                defaultMessage={'Try it console is only accessible via the default key manager.'
                                        + 'Something went wrong while selecting the default Key manager.'}
                                            />
                                        )}
                                    </Box>
                                </Typography>
                            </Box>
                        </>
                    )}
                    {((isApiKeyEnabled || isBasicAuthEnabled || isOAuthEnabled) && showSecurityType)
                        && (!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                        <>
                            <Typography variant='h5' component='h2' color='textPrimary' className={classes.categoryHeading}>
                                <FormattedMessage
                                    id='api.console.security.heading'
                                    defaultMessage='Security'
                                />
                            </Typography>
                            <Typography
                                variant='h6'
                                component='label'
                                id='security-type'
                                color='textSecondary'
                                className={classes.tryoutHeading}
                            >
                                <FormattedMessage
                                    id='api.console.security.type.heading'
                                    defaultMessage='Security Type'
                                />
                            </Typography>
                            <FormControl variant='standard' component='fieldset'>
                                <RadioGroup
                                    name='securityScheme'
                                    value={securitySchemeType}
                                    onChange={handleChanges}
                                    aria-labelledby='security-type'
                                    row
                                >
                                    <FormControlLabel
                                        value='OAUTH'
                                        disabled={!isOAuthEnabled}
                                        control={<Radio />}
                                        label={(
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.security.scheme.oauth'
                                                defaultMessage='OAuth'
                                            />
                                        )}
                                    />
                                    <FormControlLabel
                                        value='API-KEY'
                                        disabled={!isApiKeyEnabled}
                                        control={<Radio />}
                                        id='api-key-select-radio-button'
                                        label={(
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.security.scheme.apikey'
                                                defaultMessage='API Key'
                                            />
                                        )}
                                    />
                                    <FormControlLabel
                                        value='BASIC'
                                        disabled={!isBasicAuthEnabled}
                                        control={<Radio />}
                                        label={(
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.security.scheme.basic'
                                                defaultMessage='Basic'
                                            />
                                        )}
                                    />
                                </RadioGroup>
                            </FormControl>
                        </>
                    )}
                </Box>
            </Grid>

            <Grid xs={12} md={12} item>
                <Box display='block'>
                    {user && subscriptions
                        && subscriptions.length > 0 && securitySchemeType !== 'BASIC' && securitySchemeType !== 'TEST'
                        && (!api.advertiseInfo || !api.advertiseInfo.advertised)
                        && (
                            <SelectAppPanel
                                subscriptions={subscriptions}
                                handleChanges={handleChanges}
                                selectedApplication={selectedApplication}
                                selectedKeyManager={selectedKeyManager}
                                selectedKeyType={selectedKeyType}
                                keyManagers={keyManagers}
                            />
                        )}
                    {subscriptions && subscriptions.length === 0 && securitySchemeType !== 'TEST'
                        && (!api.advertiseInfo || !api.advertiseInfo.advertised) ? (
                            <Grid x={8} md={6} className={classes.tokenType} item>
                                <Box mb={1} alignItems='center'>
                                    <Typography variant='body1'>
                                        <Box display='flex'>
                                            <WarningIcon className={classes.warningIcon} />
                                            <div>
                                                <FormattedMessage
                                                    id='Apis.Details.ApiConsole.ApiConsole.subscribe.to.application'
                                                    defaultMessage='Please subscribe to an application'
                                                />
                                            </div>
                                        </Box>
                                    </Typography>
                                </Box>
                            </Grid>
                        ) : (
                            (!ksGenerated && securitySchemeType === 'OAUTH') && (!api.advertiseInfo
                                || !api.advertiseInfo.advertised) && (
                                <Grid x={8} md={6} className={classes.tokenType} item>
                                    <Box mb={1} alignItems='center'>
                                        <Typography variant='body1'>
                                            <Box display='flex'>
                                                <WarningIcon className={classes.warningIcon} />
                                                <div>
                                                    <FormattedMessage
                                                        id='Apis.Details.ApiConsole.ApiConsole.keys.not.generated'
                                                        defaultMessage={'Consumer key and secret not generated for the selected'
                                                                + ' application on the {what} environment. '}
                                                        values={{ what: selectedKeyType }}
                                                    />
                                                </div>
                                            </Box>
                                        </Typography>
                                    </Box>
                                </Grid>
                            )
                        )}
                    {(!api.advertiseInfo || !api.advertiseInfo.advertised) ? (
                        <Box display='block' justifyContent='center'>
                            <Grid x={8} md={6} className={classes.tokenType} item>
                                {securitySchemeType === 'BASIC' && (
                                    <>
                                        <Grid x={12} md={12} item>
                                            <TextField
                                                margin='normal'
                                                variant='outlined'
                                                id='username'
                                                label={(
                                                    <FormattedMessage
                                                        id='username'
                                                        defaultMessage='Username'
                                                    />
                                                )}
                                                name='username'
                                                onChange={handleChanges}
                                                value={username || ''}
                                                fullWidth
                                            />
                                            <TextField
                                                margin='normal'
                                                variant='outlined'
                                                id='input-password'
                                                label={(
                                                    <FormattedMessage
                                                        id='password'
                                                        defaultMessage='Password'
                                                    />
                                                )}
                                                name='password'
                                                onChange={handleChanges}
                                                type={showPassword ? 'text' : 'password'}
                                                value={password || ''}
                                                fullWidth
                                                InputProps={{
                                                    autoComplete: 'new-password',
                                                    endAdornment: (
                                                        <InputAdornment position='end'>
                                                            <IconButton
                                                                edge='end'
                                                                aria-label='toggle password visibility'
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                size='large'
                                                            >
                                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    </>
                                )}

                                {securitySchemeType !== 'BASIC' && securitySchemeType !== 'TEST' && (
                                    <TextField
                                        fullWidth
                                        margin='normal'
                                        variant='outlined'
                                        label={(
                                            <FormattedMessage
                                                id='access.token'
                                                defaultMessage='Access Token'
                                            />
                                        )}
                                        name='accessToken'
                                        onChange={handleChanges}
                                        type={showToken ? 'text' : 'password'}
                                        value={tokenValue || ''}
                                        helperText={(
                                            <FormattedMessage
                                                id='enter.access.token'
                                                defaultMessage='Enter access Token'
                                            />
                                        )}
                                        id='accessTokenInput'
                                        InputProps={{
                                            autoComplete: 'new-password',
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <IconButton
                                                        edge='end'
                                                        aria-label='Toggle token visibility'
                                                        onClick={handleClickShowToken}
                                                        size='large'
                                                    >
                                                        {showToken ? <Icon>visibility_off</Icon>
                                                            : <Icon>visibility</Icon>}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            startAdornment: (
                                                <InputAdornment
                                                    style={{
                                                        minWidth: (authHeader.length * 7),
                                                    }}
                                                    position='start'
                                                >
                                                    {`${authorizationHeader}: ${prefix}`}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                                {securitySchemeType !== 'BASIC' && securitySchemeType !== 'TEST'
                                && selectedKMObject && !selectedKMObject.enableTokenHashing && (
                                    <>
                                        <Button
                                            onClick={securitySchemeType === 'API-KEY' ? generateApiKey
                                                : generateAccessToken}
                                            variant='contained'
                                            color='grey'
                                            className={classes.genKeyButton}
                                            disabled={!user || (subscriptions && subscriptions.length === 0)
                                                        || (!ksGenerated && securitySchemeType === 'OAUTH')}
                                            id='gen-test-key'
                                        >
                                            {isUpdating && (
                                                <CircularProgress size={15} />
                                            )}
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.generate.test.key'
                                                defaultMessage='GET TEST KEY'
                                            />
                                        </Button>
                                        <Tooltip
                                            placement='right'
                                            interactive
                                            title={(
                                                <FormattedMessage
                                                    id='Apis.Details.TryOutConsole.access.token.tooltip'
                                                    defaultMessage={
                                                        'You can use your existing Access Token or '
                                                                + 'you can generate a new Test Key.'
                                                    }
                                                />
                                            )}
                                        >
                                            <Box m={1} mt={2}>
                                                <IconButton
                                                    aria-label='Use existing Access Token or generate a new Test Key'
                                                    size='large'
                                                >
                                                    <HelpOutline />
                                                </IconButton>
                                            </Box>
                                        </Tooltip>
                                    </>
                                )}
                            </Grid>
                        </Box>
                    ) : (
                        <AdvertiseDetailsPanel
                            classes={classes}
                            advAuthHeader={advAuthHeader}
                            advAuthHeaderValue={advAuthHeaderValue}
                            handleChanges={handleChanges}
                            selectedEndpoint={selectedEndpoint}
                            api={api}
                        />
                    )}
                    {(!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                        <Box display='flex' justifyContent='center' className={classes.gatewayEnvironment}>
                            <Grid xs={12} md={6} item>
                                {(environments && environments.length > 0) && (
                                    <>
                                        <Typography
                                            variant='h5'
                                            component='h3'
                                            color='textPrimary'
                                            className={classes.categoryHeading}
                                        >
                                            <FormattedMessage
                                                id='api.console.gateway.heading'
                                                defaultMessage='Gateway'
                                            />
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            select
                                            id='environment'
                                            label={(
                                                <FormattedMessage
                                                    defaultMessage='Environment'
                                                    id='Apis.Details.ApiConsole.environment'
                                                />
                                            )}
                                            value={selectedEnvironment || (environments && environments[0].name)}
                                            name='selectedEnvironment'
                                            onChange={handleChanges}
                                            helperText={(
                                                <FormattedMessage
                                                    defaultMessage='Please select an environment'
                                                    id='Apis.Details.ApiConsole.SelectAppPanel.environment'
                                                />
                                            )}
                                            margin='normal'
                                            variant='outlined'
                                        >
                                            {environments && environments.length > 0 && (
                                                <MenuItem value='' disabled className={classes.menuItem}>
                                                    <em>
                                                        <FormattedMessage
                                                            id='api.gateways'
                                                            defaultMessage='API Gateways'
                                                        />
                                                    </em>
                                                </MenuItem>
                                            )}
                                            {environments && (
                                                environments.map((env) => (
                                                    <MenuItem
                                                        value={env.name}
                                                        key={env.name}
                                                        className={classes.menuItem}
                                                    >
                                                        {env.displayName}
                                                    </MenuItem>
                                                )))}
                                        </TextField>
                                        {api && api.type === 'GRAPHQL' && (
                                            <>
                                                <Typography className={classes.verticalSpace} variant='body1'>
                                                    <a
                                                        className={classes.link + ' ' + classes.loadMoreLink}
                                                        onClick={() => setShowMoreGWUrls(!showMoreGWUrls)}
                                                        onKeyDown={() => setShowMoreGWUrls(!showMoreGWUrls)}
                                                    >
                                                        {!showMoreGWUrls ? (
                                                            <>
                                                                <FormattedMessage
                                                                    id={'Apis.Details.ApiConsole.SelectAppPanel'
                                                                    + '.environment.show.more'}
                                                                    defaultMessage='Show More'
                                                                />
                                                                <ExpandMoreIcon />

                                                            </>
                                                        ) : (
                                                            <>
                                                                <FormattedMessage
                                                                    id={'Apis.Details.ApiConsole.SelectAppPanel'
                                                                    + '.environment.show.less'}
                                                                    defaultMessage='Show Less'
                                                                />
                                                                <ExpandLessIcon />
                                                            </>
                                                        )}
                                                    </a>
                                                </Typography>
                                                {showMoreGWUrls && (
                                                    <>
                                                        <TextField
                                                            label={(
                                                                <FormattedMessage
                                                                    defaultMessage='Gateway URLs'
                                                                    id={'Apis.Details.ApiConsole.SelectAppPanel'
                                                                    + '.environment.show.more.http.URLs'}
                                                                />
                                                            )}
                                                            value={URLs && URLs.https}
                                                            name='selectedHTTPURL'
                                                            fullWidth
                                                            margin='normal'
                                                            variant='outlined'
                                                            InputProps={URLs && URLs.https}
                                                        />
                                                        {URLs && URLs.wss
                                                        && (
                                                            <TextField
                                                                label={(
                                                                    <FormattedMessage
                                                                        defaultMessage='Subscription Gateway URLs'
                                                                        id={'Apis.Details.ApiConsole.SelectAppPanel'
                                                                        + '.environment.show.more.subscription.URLs'}
                                                                    />
                                                                )}
                                                                value={URLs && URLs.wss}
                                                                name='selectedWSURL'
                                                                fullWidth
                                                                margin='normal'
                                                                variant='outlined'
                                                                InputProps={URLs && URLs.wss}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Grid>
        </Root>
    );
}

TryOutController.propTypes = {
    classes: PropTypes.shape({
        paper: PropTypes.string.isRequired,
        grid: PropTypes.string.isRequired,
        inputAdornmentStart: PropTypes.string.isRequired,
        centerItems: PropTypes.string.isRequired,
    }).isRequired,
};

export default (TryOutController);
