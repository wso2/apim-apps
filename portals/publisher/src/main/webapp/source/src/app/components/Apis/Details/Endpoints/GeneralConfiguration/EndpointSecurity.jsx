/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
    Grid, TextField, Typography, MenuItem,
    Icon,
    ListItem,
    ListItemAvatar,
    ListItemText,
    FormControlLabel,
    FormControl,
    RadioGroup, Radio,
    Box,
    IconButton,
    Checkbox,
} from '@mui/material';
import { FormattedMessage, injectIntl } from 'react-intl';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import AddCircle from '@mui/icons-material/AddCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import isEmpty from 'lodash.isempty';
import { isRestricted } from 'AppData/AuthManager';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import APIValidation from 'AppData/APIValidation';
import Alert from 'AppComponents/Shared/Alert';
import CONSTS from 'AppData/Constants';
import { useAppContext } from 'AppComponents/Shared/AppContext';

import EditableParameterRow from './EditableParameterRow';

const PREFIX = 'EndpointSecurity';

const classes = {
    FormControl: `${PREFIX}-FormControl`,
    radioWrapper: `${PREFIX}-radioWrapper`,
    marginRight: `${PREFIX}-marginRight`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    button: `${PREFIX}-button`,
    listItem: `${PREFIX}-listItem`,
    eye: `${PREFIX}-eye`,
    verticalAlignTop: `${PREFIX}-verticalAlignTop`,
    parameterActionCell: `${PREFIX}-parameterActionCell`,
};

const StyledGrid = styled(Grid)(() => ({
    [`& .${classes.FormControl}`]: {
        padding: 0,
        width: '100%',
    },

    [`& .${classes.radioWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
    },

    [`& .${classes.marginRight}`]: {
        marginRight: '8px',
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: '16px',
    },

    [`& .${classes.button}`]: {
        marginTop: '5px',
    },

    [`& .${classes.listItem}`]: {
        marginTop: '25px',
    },

    [`& .${classes.eye}`]: {
        cursor: 'pointer',
    },

    [`& .${classes.verticalAlignTop}`]: {
        verticalAlign: 'top',
    },

    [`& .${classes.parameterActionCell}`]: {
        paddingRight: 0,
        paddingLeft: 0,
        verticalAlign: 'top',
        paddingTop: '28px', // Aligns with first row of text fields
    },
}));

/**
 * The base component for advanced endpoint configurations.
 * @param {any} props The props that are being passed
 * @returns {any} The html representation of the component.
 */
function EndpointSecurity(props) {
    const { api } = useContext(APIContext);
    const { settings } = useAppContext();
    const {
        intl, securityInfo, isProduction, saveEndpointSecurityConfig, closeEndpointSecurityConfig,
        endpointSecurityTypes,
    } = props;

    const getCreateScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create'];
        } else {
            return ['apim:api_create'];
        }
    };
    const isCreateRestricted = () => isRestricted(getCreateScopes(), api);

    const getCreateOrPublishScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isCreateOrPublishRestricted = () => isRestricted(getCreateOrPublishScopes(), api);
    const [endpointSecurityInfo, setEndpointSecurityInfo] = useState(CONSTS.DEFAULT_ENDPOINT_SECURITY);
    const [securityValidity, setSecurityValidity] = useState();

    const [showAddParameter, setShowAddParameter] = useState(false);
    const [clientSecretIsMasked] = useState(true);
    // Implementation of useState variables for parameter name and value
    const [parameterName, setParameterName] = useState(null);
    const [parameterValue, setParameterValue] = useState(null);
    const [isParameterSecret, setIsParameterSecret] = useState(false);
    const [showParameterValue, setShowParameterValue] = useState(false);
    const endpointType = isProduction ? 'production' : 'sandbox';

    const authTypes = () => {
        const types = [
            {
                id: 'none',
                key: 'NONE',
                value: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.none',
                    defaultMessage: 'None',
                }),
            },
            {
                id: 'basicAuth',
                key: 'BASIC',
                value: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.basic',
                    defaultMessage: 'Basic Auth',
                }),
            },
            {
                id: 'digest',
                key: 'DIGEST',
                value: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.digest.auth',
                    defaultMessage: 'Digest Auth',
                }),
            },
            {
                id: 'oauth2',
                key: 'OAUTH',
                value: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.oauth',
                    defaultMessage: 'OAuth 2.0',
                }),
            },
        ];

        const selectedTypes = [types[0]];

        return selectedTypes.concat(types.filter((type) => endpointSecurityTypes?.includes(type.id)));
    };

    const grantTypes = [
        {
            key: 'CLIENT_CREDENTIALS',
            value: intl.formatMessage({
                id: 'Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.oauth.grant.type.client',
                defaultMessage: 'Client Credentials',
            }),
        },
        {
            key: 'PASSWORD',
            value: intl.formatMessage({
                id: 'Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.oauth.grant.type.password',
                defaultMessage: 'Resource Owner Password',
            }),
        },
    ];
    useEffect(() => {
        let tmpSecurity = {};
        if (securityInfo) {
            tmpSecurity = { ...securityInfo };
            const {
                type, username, password, grantType, tokenUrl, clientId, clientSecret, customParameters,
                connectionTimeoutDuration, connectionRequestTimeoutDuration, socketTimeoutDuration, proxyConfigs,
                connectionTimeoutConfigType, proxyConfigType,
            } = securityInfo;
            const secretPlaceholder = '******';
            tmpSecurity.type = type == null ? 'NONE' : type;
            tmpSecurity.username = username;
            tmpSecurity.password = password === '' ? secretPlaceholder : password;
            tmpSecurity.grantType = grantType;
            tmpSecurity.tokenUrl = tokenUrl;
            tmpSecurity.clientId = clientId === '' ? secretPlaceholder : clientId;
            tmpSecurity.clientSecret = clientSecret === '' ? secretPlaceholder : clientSecret;
            tmpSecurity.customParameters = customParameters;
            tmpSecurity.connectionTimeoutDuration = connectionTimeoutDuration;
            tmpSecurity.connectionRequestTimeoutDuration = connectionRequestTimeoutDuration;
            tmpSecurity.socketTimeoutDuration = socketTimeoutDuration;
            tmpSecurity.proxyConfigs = proxyConfigs || {
                proxyEnabled: false,
                proxyHost: '',
                proxyPort: '',
                proxyUsername: '',
                proxyPassword: '',
                proxyProtocol: '',
            };
            tmpSecurity.connectionTimeoutConfigType = connectionTimeoutConfigType;
            tmpSecurity.proxyConfigType = proxyConfigType;
        }
        setEndpointSecurityInfo(tmpSecurity);
    }, [securityInfo]);

    /**
     * Validating whether token url is in a proper format
     * @param {*} value value of the field
     * @returns {*} boolean value
     */
    const validateTokenUrl = (value) => {
        const state = APIValidation.url.required().validate(value).error;
        if (state === null) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Validate Security Info properties
     * @param {*} field value of the field
     */
    const validateAndUpdateSecurityInfo = (field) => {
        if (!endpointSecurityInfo[field]) {
            setSecurityValidity({ ...securityValidity, [field]: false });
        } else {
            let validity = true;
            if (field === 'tokenUrl') {
                validity = validateTokenUrl(endpointSecurityInfo[field]);
            }
            setSecurityValidity({ ...securityValidity, [field]: validity });
        }
    };

    /**
     * Show or hide the Add Parameter component
     */
    const toggleAddParameter = () => {
        setShowAddParameter(!showAddParameter);
        // Clear parameter values when cancelling
        if (showAddParameter) {
            setParameterName(null);
            setParameterValue(null);
            setIsParameterSecret(false);
            setShowParameterValue(false);
        }
    };


    /**
     * Set the custom parameter name or value property
     * @param {*} name name of the field edited
     * @returns {*} fills the parameter name or parameter value states
     */
    const handleParameterChange = (name) => (event) => {
        const { value } = event.target;
        if (name === 'parameterName') {
            setParameterName(value);
        } else if (name === 'parameterValue') {
            setParameterValue(value);
        }
    };

    /**
     * Check if the field is empty or not
     * @param {*} itemValue value of the field
     * @returns {*} boolean value
     */
    const validateEmpty = (itemValue) => {
        if (itemValue === null) {
            return false;
        } else if (itemValue === '') {
            return true;
        } else {
            return false;
        }
    };

    const getParameterValue = (param) => {
        if (typeof param === 'object' && param !== null) {
            return param.value;
        }
        return param;
    };

    const checkIfParameterIsSecret = (param) => {
        return typeof param === 'object' && param !== null && param.secured === true;
    };

    /**
     * Add new custom parameter
     */
    const handleAddToList = () => {
        const customParametersCopy = endpointSecurityInfo.customParameters ?
            { ...endpointSecurityInfo.customParameters } : {};

        if (customParametersCopy != null
            && Object.prototype.hasOwnProperty.call(customParametersCopy, parameterName)) {
            Alert.warning('Parameter name: ' + parameterName + ' already exists');
        } else {
            if (isParameterSecret) {
                customParametersCopy[parameterName] = {
                    value: parameterValue,
                    secured: true
                };
            } else {
                customParametersCopy[parameterName] = parameterValue;
            }
            setParameterName(null);
            setParameterValue(null);
            setIsParameterSecret(false);
        }
        setEndpointSecurityInfo({ ...endpointSecurityInfo, customParameters: customParametersCopy });
    };

    /**
     * Update existing custom parameter name-value pair
     * @param {*} oldRow previous name-value pair
     * @param {*} newRow new name-value pair
     */
    const handleUpdateList = (oldRow, newRow, isSecret) => {
        const customParametersCopy = endpointSecurityInfo.customParameters ?
            { ...endpointSecurityInfo.customParameters } : {};
        const { oldName, oldValue } = oldRow;
        const { newName, newValue } = newRow;
        if (customParametersCopy != null
            && Object.prototype.hasOwnProperty.call(customParametersCopy, newName) && oldName === newName) {
            // Only the value is updated
            if (newValue && oldValue !== newValue) {
                if (isSecret) {
                    customParametersCopy[oldName] = {
                        value: newValue,
                        secured: true
                    };
                } else {
                    customParametersCopy[oldName] = newValue;
                }
            }
        } else {
            delete customParametersCopy[oldName];
            if (isSecret) {
                customParametersCopy[newName] = {
                    value: newValue,
                    secured: true
                };
            } else {
                customParametersCopy[newName] = newValue;
            }
        }
        setEndpointSecurityInfo({ ...endpointSecurityInfo, customParameters: customParametersCopy });
    };

    /**
     * Delete existing custom parameter name-value pair
     * @param {*} oldName name property of the name-value pair to be removed
     */
    const handleDelete = (oldName) => {
        const customParametersCopy = endpointSecurityInfo.customParameters ?
            { ...endpointSecurityInfo.customParameters } : {};
        if (customParametersCopy != null && Object.prototype.hasOwnProperty.call(customParametersCopy, oldName)) {
            delete customParametersCopy[oldName];
        }
        setEndpointSecurityInfo({ ...endpointSecurityInfo, customParameters: customParametersCopy });
    };

    /**
     * Keyboard shortcut to execute adding custom parameters when pressing the Enter key
     * @param {*} event event containing the key that was pressed
     */
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddToList();
        }
    };

    /**
     * Render the custom parameters component
     * @returns {*} list of items added
     */
    const renderCustomParameters = () => {
        const items = [];
        for (const name in endpointSecurityInfo.customParameters) {
            if (Object.prototype.hasOwnProperty.call(endpointSecurityInfo.customParameters, name)) {
                const param = endpointSecurityInfo.customParameters[name];
                items.push(<EditableParameterRow
                    oldName={name}
                    oldValue={getParameterValue(param)}
                    isSecret={checkIfParameterIsSecret(param)}
                    handleUpdateList={handleUpdateList}
                    handleDelete={handleDelete}
                    customParameters={endpointSecurityInfo.customParameters}
                    {...props}
                    isRestricted={isRestricted}
                    api={api}
                />);
            }
        }
        return items;
    };

    return (
        <StyledGrid container direction='row' spacing={2}>
            <Grid item xs={6}>
                <TextField
                    disabled={isCreateRestricted()}
                    fullWidth
                    select
                    value={endpointSecurityInfo && endpointSecurityInfo.type}
                    variant='outlined'
                    onChange={(event) => {
                        setEndpointSecurityInfo({
                            ...endpointSecurityInfo,
                            type: event.target.value,
                        });
                    }}
                    inputProps={{
                        name: 'key',
                        id: 'auth-type-select',
                    }}
                    onBlur={() => validateAndUpdateSecurityInfo(isProduction)}
                >
                    {authTypes().map((type) => (
                        <MenuItem value={type.key} id={'auth-type-' + type.key}>{type.value}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={6} />

            {(endpointSecurityInfo.type === 'OAUTH')
                && (
                    <>
                        <Grid item xs={6}>
                            <TextField
                                disabled={isCreateRestricted()}
                                required
                                fullWidth
                                select
                                label={(
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration'
                                        + '.EndpointSecurity.grant.type.input'}
                                        defaultMessage='Grant Type'
                                    />
                                )}
                                variant='outlined'
                                onChange={(event) => setEndpointSecurityInfo(
                                    { ...endpointSecurityInfo, grantType: event.target.value },
                                )}
                                value={endpointSecurityInfo.grantType}
                                inputProps={{
                                    name: 'key',
                                    id: 'grant-type-select',
                                }}
                                onBlur={() => validateAndUpdateSecurityInfo('grantType')}
                            >
                                {grantTypes.map((type) => (
                                    <MenuItem value={type.key}>{type.value}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {(endpointSecurityInfo.grantType === 'CLIENT_CREDENTIALS'
                        || endpointSecurityInfo.grantType === 'PASSWORD') && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        disabled={isCreateRestricted()}
                                        required
                                        fullWidth
                                        error={securityValidity && securityValidity.tokenUrl === false}
                                        helperText={
                                            securityValidity && securityValidity.tokenUrl === false ? (
                                                <FormattedMessage
                                                    id={'Apis.Details.Endpoints.GeneralConfiguration'
                                            + '.EndpointSecurity.no.tokenUrl.error'}
                                                    defaultMessage={'Token URL should not be empty'
                                                    + ' or formatted incorrectly'}
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                            + 'EndpointSecurity.tokenUrl.message'}
                                                    defaultMessage='Enter Token URL'
                                                />
                                            )
                                        }
                                        variant='outlined'
                                        id='auth-tokenUrl'
                                        label={(
                                            <FormattedMessage
                                                id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                                + 'EndpointSecurity.token.url.input'}
                                                defaultMessage='Token URL'
                                            />
                                        )}
                                        onChange={(event) => setEndpointSecurityInfo(
                                            { ...endpointSecurityInfo, tokenUrl: event.target.value },
                                        )}
                                        value={endpointSecurityInfo.tokenUrl}
                                        onBlur={() => validateAndUpdateSecurityInfo('tokenUrl')}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        disabled={isCreateRestricted()}
                                        required
                                        fullWidth
                                        error={securityValidity && securityValidity.clientId === false}
                                        helperText={
                                            securityValidity && securityValidity.clientId === false ? (
                                                <FormattedMessage
                                                    id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                            + 'EndpointSecurity.no.clientId.error'}
                                                    defaultMessage='Client ID should not be empty'
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                                    + 'EndpointSecurity.clientId.message'}
                                                    defaultMessage='Enter Client ID'
                                                />
                                            )
                                        }
                                        variant='outlined'
                                        id='auth-clientId'
                                        label={(
                                            <FormattedMessage
                                                id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                                + 'EndpointSecurity.clientId.input'}
                                                defaultMessage='Client ID'
                                            />
                                        )}
                                        onChange={(event) => setEndpointSecurityInfo(
                                            { ...endpointSecurityInfo, clientId: event.target.value },
                                        )}
                                        value={endpointSecurityInfo.clientId}
                                        onBlur={() => validateAndUpdateSecurityInfo('clientId')}
                                        InputProps={{
                                            autoComplete: 'new-password',
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        disabled={isCreateRestricted()}
                                        required
                                        fullWidth
                                        error={securityValidity && securityValidity.clientSecret === false}
                                        helperText={
                                            securityValidity && securityValidity.clientSecret === false ? (
                                                <FormattedMessage
                                                    id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                            + 'EndpointSecurity.no.clientSecret.error'}
                                                    defaultMessage='Client Secret should not be empty'
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                            + 'EndpointSecurity.clientSecret.message'}
                                                    defaultMessage='Enter Client Secret'
                                                />
                                            )
                                        }
                                        variant='outlined'
                                        id='auth-clientSecret'
                                        type={clientSecretIsMasked ? 'password' : 'text'}
                                        label={(
                                            <FormattedMessage
                                                id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                                + 'EndpointSecurity.clientSecret.input'}
                                                defaultMessage='Client Secret'
                                            />
                                        )}
                                        onChange={(event) => setEndpointSecurityInfo(
                                            { ...endpointSecurityInfo, clientSecret: event.target.value },
                                        )}
                                        value={endpointSecurityInfo.clientSecret}
                                        onBlur={() => validateAndUpdateSecurityInfo('clientSecret')}
                                        InputProps={{
                                            autoComplete: 'new-password',
                                        }}
                                    />
                                </Grid>
                            </>
                        )}
                    </>
                )}

            {(endpointSecurityInfo.type === 'BASIC'
                || endpointSecurityInfo.type === 'DIGEST'
                || endpointSecurityInfo.grantType === 'PASSWORD') && (
                <>
                    <Grid item xs={6}>
                        <TextField
                            disabled={isCreateRestricted()}
                            required
                            fullWidth
                            error={securityValidity && securityValidity.username === false}
                            helperText={
                                securityValidity && securityValidity.username === false ? (
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                        + 'EndpointSecurity.no.username.error'}
                                        defaultMessage='Username should not be empty'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                        + 'EndpointSecurity.username.message'}
                                        defaultMessage='Enter Username'
                                    />
                                )
                            }
                            variant='outlined'
                            id='auth-userName'
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.user.name.input'
                                    defaultMessage='Username'
                                />
                            )}
                            onChange={(event) => setEndpointSecurityInfo(
                                { ...endpointSecurityInfo, username: event.target.value },
                            )}
                            value={endpointSecurityInfo.username}
                            onBlur={() => validateAndUpdateSecurityInfo('username')}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            disabled={isCreateRestricted()}
                            required
                            fullWidth
                            error={securityValidity && securityValidity.password === false}
                            helperText={
                                securityValidity && securityValidity.password === false ? (
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                        + 'EndpointSecurity.no.password.error'}
                                        defaultMessage='Password should not be empty'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                        + 'EndpointSecurity.password.message'}
                                        defaultMessage='Enter Password'
                                    />
                                )
                            }
                            variant='outlined'
                            type='password'
                            id='auth-password'
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.password.input'
                                    defaultMessage='Password'
                                />
                            )}
                            value={endpointSecurityInfo.password}
                            onChange={(event) => setEndpointSecurityInfo(
                                { ...endpointSecurityInfo, password: event.target.value },
                            )}
                            onBlur={() => validateAndUpdateSecurityInfo('password')}
                            InputProps={{
                                autoComplete: 'new-password',
                            }}
                        />
                    </Grid>
                </>
            )}

            {endpointSecurityInfo.type === 'OAUTH' && (endpointSecurityInfo.grantType === 'CLIENT_CREDENTIALS'
            || endpointSecurityInfo.grantType === 'PASSWORD')
            && (
                <>
                    {settings && settings.retryCallWithNewOAuthTokenEnabled && (
                        <>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    paddingTop: '10px',
                                    borderTop: '1px solid Gainsboro',
                                }}
                            >
                                <Typography>
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.token.endpoint.
                                            connection.configurations'
                                        defaultMessage='Token Endpoint Connection Configurations'
                                    />
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography className={classes.subTitle}>
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.token.endpoint.
                                            connection.configurations.timeout.configurations'
                                        defaultMessage='Timeout Configurations'
                                    />
                                </Typography>
                                <FormControl>
                                    <RadioGroup
                                        row
                                        name='connectionTimeoutConfigType'
                                        value={endpointSecurityInfo.connectionTimeoutConfigType}
                                        defaultValue={endpointSecurityInfo.proxyConfigType}
                                        onChange={(event) => setEndpointSecurityInfo({
                                            ...endpointSecurityInfo,
                                            connectionTimeoutConfigType: event.target.value,
                                        })}
                                        onBlur={() => validateAndUpdateSecurityInfo('connectionTimeoutConfigType')}
                                    >
                                        <FormControlLabel
                                            value='GLOBAL'
                                            control={<Radio />}
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .token.endpoint.connection.configurations.global'
                                                    defaultMessage='Global'
                                                />
                                            )}
                                        />
                                        <FormControlLabel
                                            value='ENDPOINT_SPECIFIC'
                                            control={<Radio />}
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .token.endpoint.connection.configurations.endpoint.specific'
                                                    defaultMessage='Endpoint Specific'
                                                />
                                            )}
                                        />
                                        <FormControlLabel
                                            value='NONE'
                                            control={<Radio />}
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .token.endpoint.connection.configurations.none'
                                                    defaultMessage='None'
                                                />
                                            )}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            {endpointSecurityInfo.connectionTimeoutConfigType === 'ENDPOINT_SPECIFIC' && (
                                <>
                                    <Grid item xs={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            className={classes.textField}
                                            id='auth-connectionTimeoutDuration'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .connection.timeout.duration'
                                                    defaultMessage='Connection Timeout Duration (ms)'
                                                />
                                            )}
                                            type='number'
                                            margin='normal'
                                            onChange={(event) => setEndpointSecurityInfo(
                                                {
                                                    ...endpointSecurityInfo,
                                                    connectionTimeoutDuration: event.target
                                                        .value,
                                                },
                                            )}
                                            value={endpointSecurityInfo.connectionTimeoutDuration}
                                            onBlur={() => validateAndUpdateSecurityInfo('connectionTimeoutDuration')}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            className={classes.textField}
                                            id='duration-connectionRequestTimeoutDuration'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .connection.request.timeout.duration'
                                                    defaultMessage='Connection Request Timeout Duration (ms)'
                                                />
                                            )}
                                            type='number'
                                            margin='normal'
                                            onChange={(event) => setEndpointSecurityInfo(
                                                {
                                                    ...endpointSecurityInfo,
                                                    connectionRequestTimeoutDuration: event
                                                        .target.value,
                                                },
                                            )}
                                            value={endpointSecurityInfo.connectionRequestTimeoutDuration}
                                            onBlur={() => validateAndUpdateSecurityInfo(
                                                'connectionRequestTimeoutDuration',
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            className={classes.textField}
                                            id='duration-socketTimeoutDuration'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .socket.timeout.duration'
                                                    defaultMessage='Socket Timeout Duration (ms)'
                                                />
                                            )}
                                            type='number'
                                            margin='normal'
                                            onChange={(event) => setEndpointSecurityInfo(
                                                { ...endpointSecurityInfo, socketTimeoutDuration: event.target.value },
                                            )}
                                            value={endpointSecurityInfo.socketTimeoutDuration}
                                            onBlur={() => validateAndUpdateSecurityInfo('socketTimeoutDuration')}
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid
                                item
                                xs={12}
                                style={{
                                    paddingTop: '10px',
                                }}
                            >
                                <Typography className={classes.subTitle}>
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.token.endpoint
                                        .connection.configurations.proxy.configurations'
                                        defaultMessage='Proxy Configurations'
                                    />
                                </Typography>
                                <FormControl>
                                    <RadioGroup
                                        row
                                        name='proxyConfigType'
                                        value={endpointSecurityInfo.proxyConfigType}
                                        defaultValue={endpointSecurityInfo.proxyConfigType}
                                        onChange={(event) => {
                                            setEndpointSecurityInfo({
                                                ...endpointSecurityInfo,
                                                proxyConfigType: event.target.value,
                                                proxyConfigs: {
                                                    ...endpointSecurityInfo.proxyConfigs,
                                                    proxyEnabled: event.target.value === 'ENDPOINT_SPECIFIC'
                                                }
                                            });
                                        }}
                                        onBlur={() => validateAndUpdateSecurityInfo('proxyConfigType')}
                                    >
                                        <FormControlLabel
                                            value='GLOBAL'
                                            control={<Radio />}
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .token.endpoint.proxy.configurations.global'
                                                    defaultMessage='Global'
                                                />
                                            )}
                                        />
                                        <FormControlLabel
                                            value='ENDPOINT_SPECIFIC'
                                            control={<Radio />}
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .token.endpoint.proxy.configurations.endpoint.specific'
                                                    defaultMessage='Endpoint Specific'
                                                />
                                            )}
                                        />
                                        <FormControlLabel
                                            value='NONE'
                                            control={<Radio />}
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .token.endpoint.proxy.configurations.none'
                                                    defaultMessage='None'
                                                />
                                            )}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            {endpointSecurityInfo.proxyConfigType === 'ENDPOINT_SPECIFIC' && (
                                <>
                                    <Grid
                                        item
                                        xs={6}
                                        style={{}}
                                    >
                                        <TextField
                                            disabled={isCreateRestricted()}
                                            required
                                            fullWidth
                                            variant='outlined'
                                            id='proxy-host'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .proxyHost.input'
                                                    defaultMessage='Proxy Hostname'
                                                />
                                            )}
                                            onChange={(event) => {
                                                setEndpointSecurityInfo({
                                                    ...endpointSecurityInfo,
                                                    proxyConfigs: {
                                                        ...endpointSecurityInfo.proxyConfigs,
                                                        proxyHost: event.target.value,
                                                    }
                                                });
                                                validateAndUpdateSecurityInfo('proxyConfigs');
                                            }}
                                            value={endpointSecurityInfo.proxyConfigs?.proxyHost || ''}
                                            onBlur={() => validateAndUpdateSecurityInfo('proxyConfigs')}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        style={{}}
                                    >
                                        <TextField
                                            disabled={isCreateRestricted()}
                                            required
                                            fullWidth
                                            variant='outlined'
                                            id='proxy-port'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .proxyPort.input'
                                                    defaultMessage='Proxy Port'
                                                />
                                            )}
                                            onChange={(event) => {
                                                setEndpointSecurityInfo({
                                                    ...endpointSecurityInfo,
                                                    proxyConfigs: {
                                                        ...endpointSecurityInfo.proxyConfigs,
                                                        proxyPort: event.target.value,
                                                    }
                                                });
                                                validateAndUpdateSecurityInfo('proxyConfigs');
                                            }}
                                            value={endpointSecurityInfo.proxyConfigs?.proxyPort || ''}
                                            onBlur={() => validateAndUpdateSecurityInfo('proxyConfigs')}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        style={{}}
                                    >
                                        <TextField
                                            disabled={isCreateRestricted()}
                                            fullWidth
                                            variant='outlined'
                                            id='proxy-username'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .proxyUsername.input'
                                                    defaultMessage='Proxy Username'
                                                />
                                            )}
                                            onChange={(event) => {
                                                setEndpointSecurityInfo({
                                                    ...endpointSecurityInfo,
                                                    proxyConfigs: {
                                                        ...endpointSecurityInfo.proxyConfigs,
                                                        proxyUsername: event.target.value,
                                                    }
                                                });
                                                validateAndUpdateSecurityInfo('proxyConfigs');
                                            }}
                                            value={endpointSecurityInfo.proxyConfigs?.proxyUsername || ''}
                                            onBlur={() => validateAndUpdateSecurityInfo('proxyConfigs')}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        style={{}}
                                    >
                                        <TextField
                                            disabled={isCreateRestricted()}
                                            fullWidth
                                            variant='outlined'
                                            id='proxy-password'
                                            type='password'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .proxyPassword.input'
                                                    defaultMessage='Proxy Password'
                                                />
                                            )}
                                            onChange={(event) => {
                                                setEndpointSecurityInfo({
                                                    ...endpointSecurityInfo,
                                                    proxyConfigs: {
                                                        ...endpointSecurityInfo.proxyConfigs,
                                                        proxyPassword: event.target.value,
                                                    }
                                                });
                                                validateAndUpdateSecurityInfo('proxyConfigs');
                                            }}
                                            value={endpointSecurityInfo.proxyConfigs?.proxyPassword || ''}
                                            onBlur={() => validateAndUpdateSecurityInfo('proxyConfigs')}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        style={{}}
                                    >
                                        <TextField
                                            disabled={isCreateRestricted()}
                                            required
                                            fullWidth
                                            variant='outlined'
                                            id='proxy-protocol'
                                            label={(
                                                <FormattedMessage
                                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity
                                                    .proxyProtocol.input'
                                                    defaultMessage='Proxy Protocol'
                                                />
                                            )}
                                            onChange={(event) => {
                                                setEndpointSecurityInfo({
                                                    ...endpointSecurityInfo,
                                                    proxyConfigs: {
                                                        ...endpointSecurityInfo.proxyConfigs,
                                                        proxyProtocol: event.target.value,
                                                    }
                                                });
                                                validateAndUpdateSecurityInfo('proxyConfigs');
                                            }}
                                            value={endpointSecurityInfo.proxyConfigs?.proxyProtocol || ''}
                                            onBlur={() => validateAndUpdateSecurityInfo('proxyConfigs')}
                                        />
                                    </Grid>
                                </>
                            )}
                        </>
                    )}
                    <Grid item xs={12}>
                        <ListItem
                            className={classes.listItem}
                        >
                            <ListItemAvatar>
                                <Icon color='primary'>info</Icon>
                            </ListItemAvatar>
                            <ListItemText>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.add.new.parameter.
                                    info'
                                    defaultMessage={'You can add any additional payload parameters'
                                    + ' required for the endpoint below'}
                                />
                            </ListItemText>
                        </ListItem>
                        <Button
                            size='medium'
                            className={classes.button}
                            onClick={toggleAddParameter}
                            disabled={isCreateOrPublishRestricted()}
                        >
                            <AddCircle className={classes.buttonIcon} />
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurity.add.new.parameter'
                                defaultMessage='Add New Parameter'
                            />
                        </Button>
                    </Grid>
                </>
            )}

            <Grid item xs={12} />

            {(endpointSecurityInfo.type === 'OAUTH')
            && (!isEmpty(endpointSecurityInfo.customParameters) || showAddParameter) && (
                <Grid item xs={12}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width='35%'>
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration'
                                            + '.EndpointSecurity.label.parameter.name'}
                                        defaultMessage='Parameter Name'
                                    />
                                </TableCell>
                                <TableCell width='35%'>
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration'
                                            + '.EndpointSecurity.label.parameter.value'}
                                        defaultMessage='Parameter Value'
                                    />
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {showAddParameter
                            && (
                                <>
                                    <TableRow>
                                        <TableCell className={classes.verticalAlignTop}>
                                            <TextField
                                                fullWidth
                                                required
                                                id='outlined-required'
                                                label={intl.formatMessage({
                                                    id: 'Apis.Details.Endpoints.GeneralConfiguration'
                                                    + '.EndpointSecurity.input.parameter.name',
                                                    defaultMessage: 'Parameter Name',
                                                })}
                                                margin='none'
                                                variant='outlined'
                                                value={parameterName === null ? '' : parameterName}
                                                onChange={handleParameterChange('parameterName')}
                                                onKeyDown={handleKeyDown('parameterName')}
                                                helperText={validateEmpty(parameterName)
                                                    ? 'Invalid parameter name' : ''}
                                                error={validateEmpty(parameterName)}
                                                disabled={isCreateOrPublishRestricted()}
                                            />
                                        </TableCell>
                                        <TableCell className={classes.verticalAlignTop}>
                                            <Box display='flex' flexDirection='column'>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    id='outlined-required'
                                                    label={intl.formatMessage({
                                                        id: 'Apis.Details.Endpoints.GeneralConfiguration'
                                                            + '.EndpointSecurity.input.parameter.value',
                                                        defaultMessage: 'Parameter Value',
                                                    })}
                                                    margin='none'
                                                    variant='outlined'
                                                    type={isParameterSecret
                                                        && !showParameterValue ? 'password' : 'text'}
                                                    value={parameterValue === null ? '' : parameterValue}
                                                    onChange={handleParameterChange('parameterValue')}
                                                    onKeyDown={handleKeyDown('parameterValue')}
                                                    error={validateEmpty(parameterValue)}
                                                    disabled={isCreateOrPublishRestricted()}
                                                    InputProps={isParameterSecret ? {
                                                        endAdornment: (
                                                            <IconButton
                                                                aria-label='toggle password visibility'
                                                                onClick={() =>
                                                                    setShowParameterValue(!showParameterValue)}
                                                                edge='end'
                                                            >
                                                                {showParameterValue ?
                                                                    <Visibility /> : <VisibilityOff />}
                                                            </IconButton>
                                                        ),
                                                    } : undefined}
                                                />
                                                <FormControlLabel
                                                    control={(
                                                        <Checkbox
                                                            checked={isParameterSecret}
                                                            onChange={(e) => {
                                                                const isSecret = e.target.checked;
                                                                setIsParameterSecret(isSecret);
                                                                setShowParameterValue(!isSecret);
                                                            }}
                                                            disabled={isCreateOrPublishRestricted()}
                                                            color='primary'
                                                        />
                                                    )}
                                                    label={intl.formatMessage({
                                                        id: 'Apis.Details.Endpoints.GeneralConfiguration.'
                                                            + 'EndpointSecurity.mark.as.secret',
                                                        defaultMessage: 'Mark as Secret',
                                                    })}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align='right' className={classes.parameterActionCell}>
                                            <Box display='flex' style={{ gap: '8px' }} justifyContent='flex-end'>
                                                <Button
                                                    variant='contained'
                                                    color='primary'
                                                    disabled={
                                                        !parameterValue
                                                        || !parameterName
                                                        || isCreateOrPublishRestricted()
                                                    }
                                                    onClick={handleAddToList}
                                                >
                                                    <FormattedMessage
                                                        id='Apis.Details.Properties.Properties.add'
                                                        defaultMessage='Add'
                                                    />
                                                </Button>

                                                <Button onClick={toggleAddParameter}>
                                                    <FormattedMessage
                                                        id='Apis.Details.Properties.Properties.cancel'
                                                        defaultMessage='Cancel'
                                                    />
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </>
                            )}
                            {((endpointType === 'production') || (endpointType === 'sandbox')) && (
                                renderCustomParameters()
                            )}
                        </TableBody>
                    </Table>
                </Grid>
            )}
            <Grid className={classes.advanceDialogActions}>
                <Button
                    onClick={() => saveEndpointSecurityConfig(endpointSecurityInfo, endpointType)}
                    color='primary'
                    autoFocus
                    variant='contained'
                    style={{ marginTop: '10px', marginRight: '10px', marginBottom: '10px' }}
                    id='endpoint-security-submit-btn'
                >
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurityConfig.config.save.button'
                        defaultMessage='Submit'
                    />
                </Button>
                <Button
                    onClick={closeEndpointSecurityConfig}
                    style={{ marginTop: '10px', marginBottom: '10px' }}
                >
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.EndpointSecurityConfig.cancel.button'
                        defaultMessage='Close'
                    />
                </Button>
            </Grid>
        </StyledGrid>
    );
}

EndpointSecurity.propTypes = {
    intl: PropTypes.shape({}).isRequired,
    securityInfo: PropTypes.shape({}).isRequired,
};

export default (injectIntl(EndpointSecurity));
