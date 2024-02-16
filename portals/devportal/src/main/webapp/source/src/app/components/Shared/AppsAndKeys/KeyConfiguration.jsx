/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import cloneDeep from 'lodash.clonedeep';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { FormattedMessage, useIntl } from 'react-intl';
import Settings from 'Settings';
import PropTypes from 'prop-types';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import Validation from 'AppData/Validation';
import AppConfiguration from './AppConfiguration';

const PREFIX = 'KeyConfiguration';

const classes = {
    FormControl: `${PREFIX}-FormControl`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    button: `${PREFIX}-button`,
    quotaHelp: `${PREFIX}-quotaHelp`,
    checkboxWrapper: `${PREFIX}-checkboxWrapper`,
    checkboxWrapperColumn: `${PREFIX}-checkboxWrapperColumn`,
    group: `${PREFIX}-group`,
    removeHelperPadding: `${PREFIX}-removeHelperPadding`,
    iconStyle: `${PREFIX}-iconStyle`,
    iconButton: `${PREFIX}-iconButton`,
    titleColumn: `${PREFIX}-titleColumn`,
    keyInfoTable: `${PREFIX}-keyInfoTable`,
    leftCol: `${PREFIX}-leftCol`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.FormControl}`]: {
        paddingTop: 0,
        paddingBottom: theme.spacing(2),
        paddingLeft: 0,
        width: '100%',
    },

    [`& .${classes.FormControlOdd}`]: {
        padding: theme.spacing(2),
        width: '100%',
    },

    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.quotaHelp}`]: {
        position: 'relative',
    },

    [`& .${classes.checkboxWrapper}`]: {
        display: 'flex',
    },

    [`& .${classes.checkboxWrapperColumn}`]: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        whiteSpace: 'nowrap',
    },

    [`& .${classes.group}`]: {
        flexDirection: 'row',
    },

    [`& .${classes.removeHelperPadding}`]: {
        '& p': {
            margin: '8px 0px',
        },
    },

    [`& .${classes.iconStyle}`]: {
        cursor: 'pointer',
        padding: '0 0 0 10px',
    },

    [`& .${classes.iconButton}`]: {
        padding: '0 0 0 10px',
        '& .material-icons': {
            fontSize: 16,
        },
    },

    [`& .${classes.titleColumn}`]: {
        width: 150,
        fontWeight: 500,
    },

    [`& .${classes.keyInfoTable}`]: {
        marginBottom: 20,
        borderCollapse: 'collapse',
        '& td': {
            paddingBottom: 5,
            borderBottom: 'solid 1px #cccc',
        },
    },

    [`& .${classes.leftCol}`]: {
        width: 180,
    }
}));

/**
 *
 *
 * @class KeyConfiguration
 * @extends {React.Component}
 */
const KeyConfiguration = (props) => {
    const [urlCopied, setUrlCopied] = useState(false);
    const [callbackHelper, setCallbackHelper] = useState(false);
    const intl = useIntl();
    const {
        notFound, isUserOwner, keyManagerConfig, updateKeyRequest, keyRequest, updateHasError, callbackError,mode,
    } = props;
    const {
        selectedGrantTypes, callbackUrl,
    } = keyRequest;
    const {
        applicationConfiguration, availableGrantTypes, description, additionalProperties,
        enableMapOAuthConsumerApps, enableOAuthAppCreation, enableTokenEncryption, enableTokenGeneration,
        id, name, revokeEndpoint, tokenEndpoint, type, userInfoEndpoint,
    } = keyManagerConfig;

    /**
     * Get the display names for the supported grant types
     * @param grantTypes
     * @param grantTypeDisplayNameMap
     */
    const getGrantTypeDisplayList = (grantTypes, grantTypeDisplayNameMap) => {
        const modifiedGrantTypes = {};
        grantTypes.forEach((grantType) => {
            modifiedGrantTypes[grantType] = grantTypeDisplayNameMap[grantType];
            if (!grantTypeDisplayNameMap[grantType]) {
                modifiedGrantTypes[grantType] = grantType;
            }
        });
        return modifiedGrantTypes;
    };
    const callBackHasErrors = (callbackUrlLocal) => {
        if (callbackUrlLocal === '') {
            updateHasError(true);
            setCallbackHelper(intl.formatMessage({
                defaultMessage: 'Call back URL can not be empty when Implicit or Authorization Code grants are selected.',
                id: 'Shared.AppsAndKeys.KeyConfCiguration.Invalid.callback.empty.error.text',
            }));
        } else if (Validation.url.validate(callbackUrl).error) {
            updateHasError(true);
            setCallbackHelper(intl.formatMessage({
                defaultMessage: 'Invalid URL. Please enter a valid URL.',
                id: 'Shared.AppsAndKeys.KeyConfCiguration.Invalid.callback.url.error.text',
            }));
        }else {
            setCallbackHelper(false);
            updateHasError(false);
        }
    };
    /**
     * This method is used to handle the updating of key generation
     * request object.
     * @param {*} field field that should be updated in key request
     * @param {*} event event fired
     */
    const handleChange = (field, event) => {
        const newRequest = cloneDeep(keyRequest);
        const { target: currentTarget } = event;
        let newGrantTypes = [...newRequest.selectedGrantTypes];
        newRequest.keyManager = name;

        switch (field) {
            case 'callbackUrl':
                if (newGrantTypes.includes('implicit') || newGrantTypes.includes('authorization_code')) {
                    callBackHasErrors(currentTarget.value);
                }
                newRequest.callbackUrl = currentTarget.value;
                break;
            case 'grantType':
                if (currentTarget.checked) {
                    newGrantTypes = [...newGrantTypes, currentTarget.id];
                } else {
                    newGrantTypes = newRequest.selectedGrantTypes.filter((item) => item !== currentTarget.id);
                    if (currentTarget.id === 'implicit' || currentTarget.id === 'authorization_code') {
                        newRequest.callbackUrl = '';
                        setCallbackHelper(false);
                        updateHasError(false);
                    }
                }
                newRequest.selectedGrantTypes = newGrantTypes;
                break;
            case 'additionalProperties':
                const clonedAdditionalProperties = newRequest.additionalProperties;
                if(currentTarget.type === 'checkbox') {
                    clonedAdditionalProperties[currentTarget.name] = currentTarget.checked + "";
                } else {
                    clonedAdditionalProperties[currentTarget.name] = currentTarget.value;
                }
                newRequest.additionalProperties = clonedAdditionalProperties;
                break;
            default:
                break;
        }
        updateKeyRequest(newRequest);
    };

    const onCopy = () => {
        setUrlCopied(true);

        const caller = function () {
            setUrlCopied(false);
        };
        setTimeout(caller, 2000);
    };

    const getPreviousValue = (config) => {
        const { additionalProperties } = keyRequest;
        let isPreviousValueSet;
        if (config.type == 'input' && !config.multiple) {
            isPreviousValueSet = !!(additionalProperties && (additionalProperties[config.name]
                || additionalProperties[config.name] === ''));
        } else {
            isPreviousValueSet = !!(additionalProperties && (additionalProperties[config.name]));
        }
        let defaultValue = config.default;
        if (config.multiple && typeof defaultValue === 'string' && defaultValue === '') {
            defaultValue = [];
        }
        return isPreviousValueSet ? additionalProperties[config.name] : defaultValue;
    };
    /**
     *
     *
     * @returns {Component}
     * @memberof KeyConfiguration
     */

    if (notFound) {
        return <ResourceNotFound />;
    }
    const grantTypeDisplayListMap = getGrantTypeDisplayList(
        availableGrantTypes,
        Settings.grantTypes,
    );

    // Check for additional properties for token endpoint and revoke endpoints.
    return (
        <Root>
            <Box display='flex' alignItems='center'>
                <Table className={classes.table}>
                    <TableBody>
                        {(tokenEndpoint && tokenEndpoint !== '') && (
                            <TableRow>
                                <TableCell component='th' scope='row' className={classes.leftCol}>
                                    <FormattedMessage
                                        defaultMessage='Token Endpoint'
                                        id='Shared.AppsAndKeys.KeyConfiguration.token.endpoint.label'
                                    />
                                </TableCell>
                                <TableCell>
                                    {tokenEndpoint}
                                    <Tooltip
                                        title={
                                            urlCopied
                                                ? intl.formatMessage({
                                                    defaultMessage: 'Copied',
                                                    id: 'Shared.AppsAndKeys.KeyConfiguration.copied',
                                                })
                                                : intl.formatMessage({
                                                    defaultMessage: 'Copy to clipboard',
                                                    id: 'Shared.AppsAndKeys.KeyConfiguration.copy.to.clipboard',
                                                })
                                        }
                                        placement='right'
                                        className={classes.iconStyle}
                                    >
                                        <IconButton
                                            aria-label='Copy to clipboard'
                                            classes={{ root: classes.iconButton }}
                                            size="large"
                                            onClick={() => {navigator.clipboard.writeText(tokenEndpoint).then(onCopy())}}
                                        >
                                            <Icon color='secondary'>file_copy</Icon>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )}
                        {(revokeEndpoint && revokeEndpoint !== '') && (
                            <TableRow>
                                <TableCell component='th' scope='row' className={classes.leftCol}>
                                    <FormattedMessage
                                        defaultMessage='Revoke Endpoint'
                                        id='Shared.AppsAndKeys.KeyConfiguration.revoke.endpoint.label'
                                    />
                                </TableCell>
                                <TableCell>
                                    {revokeEndpoint}
                                    <Tooltip
                                        title={
                                            urlCopied
                                                ? intl.formatMessage({
                                                    defaultMessage: 'Copied',
                                                    id: 'Shared.AppsAndKeys.KeyConfiguration.copied',
                                                })
                                                : intl.formatMessage({
                                                    defaultMessage: 'Copy to clipboard',
                                                    id: 'Shared.AppsAndKeys.KeyConfiguration.copy.to.clipboard',
                                                })
                                        }
                                        placement='right'
                                        className={classes.iconStyle}
                                    >
                                        <IconButton
                                            aria-label='Copy to clipboard'
                                            classes={{ root: classes.iconButton }}
                                            size="large"
                                            onClick={() => {navigator.clipboard.writeText(revokeEndpoint).then(onCopy())}}
                                        >
                                            <Icon color='secondary'>file_copy</Icon>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )}
                        {(userInfoEndpoint && userInfoEndpoint !== '') && (
                            <TableRow>
                                <TableCell component='th' scope='row' className={classes.leftCol}>
                                    <FormattedMessage
                                        defaultMessage='User Info Endpoint'
                                        id='Shared.AppsAndKeys.KeyConfiguration.userinfo.endpoint.label'
                                    />
                                </TableCell>
                                <TableCell>
                                    {userInfoEndpoint}
                                    <Tooltip
                                        title={
                                            urlCopied
                                                ? intl.formatMessage({
                                                    defaultMessage: 'Copied',
                                                    id: 'Shared.AppsAndKeys.KeyConfiguration.copied',
                                                })
                                                : intl.formatMessage({
                                                    defaultMessage: 'Copy to clipboard',
                                                    id: 'Shared.AppsAndKeys.KeyConfiguration.copy.to.clipboard',
                                                })
                                        }
                                        placement='right'
                                        className={classes.iconStyle}
                                    >
                                        <IconButton
                                            aria-label='Copy to clipboard'
                                            classes={{ root: classes.iconButton }}
                                            size="large"
                                            onClick={() => {navigator.clipboard.writeText(userInfoEndpoint).then(onCopy())}}
                                        >
                                            <Icon color='secondary'>file_copy</Icon>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )}
                        {mode !== 'MAPPED' && (<><TableRow>
                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                <FormattedMessage
                                    id='Shared.AppsAndKeys.KeyConfiguration.grant.types'
                                    defaultMessage='Grant Types'
                                />

                            </TableCell>
                            <TableCell>
                                <div className={classes.checkboxWrapperColumn} id='grant-types'>
                                    {Object.keys(grantTypeDisplayListMap).map((key) => {
                                        const value = grantTypeDisplayListMap[key];
                                        return (
                                            <FormControlLabel
                                                control={(
                                                    <Checkbox
                                                        id={key}
                                                        checked={!!(selectedGrantTypes
                                                                && selectedGrantTypes.includes(key))}
                                                        onChange={(e) => handleChange('grantType', e)}
                                                        value={value}
                                                        disabled={!isUserOwner}
                                                        color='grey'
                                                        data-testid={key}
                                                    />
                                                )}
                                                label={value}
                                                key={key}
                                            />
                                        );
                                    })}
                                </div>
                                <FormHelperText>
                                    <FormattedMessage
                                        defaultMessage={`The application can use the following grant types to generate 
                            Access Tokens. Based on the application requirement,you can enable or disable 
                            grant types for this application.`}
                                        id='Shared.AppsAndKeys.KeyConfiguration.the.application.can'
                                    />
                                </FormHelperText>

                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                <FormattedMessage
                                    defaultMessage='Callback URL'
                                    id='Shared.AppsAndKeys.KeyConfiguration.callback.url.label'
                                />

                            </TableCell>
                            <TableCell>
                                <Box maxWidth={600}>
                                    <TextField
                                        margin='dense'
                                        id='callbackURL'
                                        size='small'
                                        label={(
                                            <FormattedMessage
                                                defaultMessage='Callback URL'
                                                id='Shared.AppsAndKeys.KeyConfiguration.callback.url.label'
                                            />
                                        )}
                                        value={callbackUrl}
                                        name='callbackURL'
                                        onChange={(e) => handleChange('callbackUrl', e)}
                                        helperText={callbackHelper || (
                                            <FormattedMessage
                                                defaultMessage={`Callback URL is a redirection URI in the client
                            application which is used by the authorization server to send the
                            client's user-agent (usually web browser) back after granting access.`}
                                                id='Shared.AppsAndKeys.KeyConfCiguration.callback.url.helper.text'
                                            />
                                        )}
                                        variant='outlined'
                                        disabled={!isUserOwner
                                            || (selectedGrantTypes && !selectedGrantTypes.includes('authorization_code')
                                                && !selectedGrantTypes.includes('implicit'))}
                                        error={callbackError}
                                        placeholder={intl.formatMessage({
                                            defaultMessage: 'http://url-to-webapp',
                                            id: 'Shared.AppsAndKeys.KeyConfiguration.url.to.webapp',
                                        })}
                                        fullWidth
                                    />
                                </Box>
                            </TableCell>
                        </TableRow>
                        {applicationConfiguration.length > 0 && applicationConfiguration.map((config) => (
                            <AppConfiguration
                                config={config}
                                previousValue={getPreviousValue(config)}
                                isUserOwner={isUserOwner}
                                handleChange={handleChange}
                            />
                        ))}
                        </>)}
                    </TableBody>
                </Table>
            </Box>
        </Root>
    );
};
KeyConfiguration.defaultProps = {
    notFound: false,
    validating: false,
    mode: null,
};
KeyConfiguration.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    keyRequest: PropTypes.shape({
        callbackUrl: PropTypes.string,
        selectedGrantTypes: PropTypes.array,
    }).isRequired,
    isUserOwner: PropTypes.bool.isRequired,
    isKeysAvailable: PropTypes.bool.isRequired,
    keyManagerConfig: PropTypes.any.isRequired,
    notFound: PropTypes.bool,
    setGenerateEnabled: PropTypes.func.isRequired,
    updateKeyRequest: PropTypes.func.isRequired,
    validating: PropTypes.bool,
    mode: PropTypes.string,
};


export default (KeyConfiguration);
