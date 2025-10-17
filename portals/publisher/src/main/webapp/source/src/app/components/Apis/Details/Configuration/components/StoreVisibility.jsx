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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { FormattedMessage, useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ChipInput from 'AppComponents/Shared/ChipInput'; // DEPRECATED: Do not COPY and use this component.
import APIValidation from 'AppData/APIValidation';
import base64url from 'base64url';
import Error from '@mui/icons-material/Error';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import { red } from '@mui/material/colors/';
import Alert from 'AppComponents/Shared/Alert';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import CONSTS from 'AppData/Constants';
import API from 'AppData/api';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';

const PREFIX = 'StoreVisibility';

const classes = {
    tooltip: `${PREFIX}-tooltip`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.tooltip}`]: {
        position: 'absolute',
        right: theme.spacing(-4),
        top: theme.spacing(1),
    }
}));

/**
 *
 * api.accessControl possible values are `NONE` and `RESTRICTED`
 * @export StoreVisibility
 * @param {*} props - The component props
 * @returns {JSX.Element} The StoreVisibility component
 */
export default function StoreVisibility(props) {
    const [roleValidity, setRoleValidity] = useState(true);
    const [roleExists, setRoleExists] = useState(true);
    const { api, configDispatcher, setIsDisabled } = props;
    const [invalidRoles, setInvalidRoles] = useState([]);
    const isRestrictedByRoles = api.visibility === 'RESTRICTED';
    const [apiFromContext] = useAPI();

    const getCreateOrPublishScopes = () => {
        if (apiFromContext.apiType && apiFromContext.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isCreateOrPublishRestricted = () => isRestricted(getCreateOrPublishScopes(), apiFromContext);

    const restApi = new API();
    const intl = useIntl();
    const [tenants, setTenants] = useState([]);
    useEffect(() => {
        restApi.getTenantsByState(CONSTS.TENANT_STATE_ACTIVE)
            .then((result) => {
                setTenants(result.body.count);
            });
    }, []);

    useEffect(() => {
        if (invalidRoles.length === 0) {
            setRoleValidity(true);
        }
        if (api.visibility === 'RESTRICTED' && api.visibleRoles.length !== 0) {
            setRoleExists(true);
        }
    }, [invalidRoles]);
    useEffect(() => {
        setIsDisabled(!roleValidity || !roleExists);
    }, [roleValidity, roleExists])
    const handleRoleAddition = (role) => {
        const promise = APIValidation.role.validate(base64url.encode(role));
        promise.then(() => {
            setRoleExists(true);
            setRoleValidity(true);
            configDispatcher({
                action: 'visibleRoles',
                value: [...api.visibleRoles, role],
            });
        }).catch((error) => {
            if (error.status === 404) {
                setRoleValidity(false);
                setInvalidRoles([...invalidRoles, role]);
            } else {
                Alert.error(intl.formatMessage(
                    {
                        id: 'Apis.Details.Configuration.Components.validate.role.error',
                        defaultMessage: 'Error when validating role: {role}',
                    },
                    {
                        role,
                    },
                ));
                console.error('Error when validating roles ' + error);
            }
        });
    };

    const handleRoleDeletion = (role) => {
        if (invalidRoles.includes(role)) {
            setInvalidRoles(invalidRoles.filter((existingRole) => existingRole !== role));
        }
        if (api.visibility === 'RESTRICTED' && api.visibleRoles.length > 1) {
            setRoleExists(true);
        } else {
            setRoleExists(false);
        }
        configDispatcher({
            action: 'visibleRoles',
            value: api.visibleRoles.filter((existingRole) => existingRole !== role),
        });
    };

    const handleChangeVisibility = (event) => {
        if (event.target.value === 'PUBLIC') {
            setRoleValidity(true);
            // set role exist to true to avoid SAVE button getting frozen.
            setRoleExists(true);
        }
        if (event.target.value === 'RESTRICTED' && api.visibleRoles.length === 0) {
            setRoleValidity(false);
        }
        configDispatcher({ action: 'visibility', value: event.target.value });
    }

    return (
        (<Root>
            <Box style={{ position: 'relative' }}>
                <TextField
                    fullWidth
                    id='storeVisibility-selector'
                    select
                    label={(
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.storeVisibility.head.topic'
                            defaultMessage='Developer Portal Visibility'
                        />
                    )}
                    value={api.visibility}
                    name='storeVisibility'
                    onChange={handleChangeVisibility}
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu,
                        },
                    }}
                    helperText={(
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.storeVisibility.form.helper.text'
                            defaultMessage='By default {type} is visible to all developer portal users'
                            values={{
                                type: getTypeToDisplay(api.apiType)
                            }}
                        />
                    )}
                    margin='normal'
                    variant='outlined'
                    disabled={isCreateOrPublishRestricted()}
                >
                    <MenuItem value='PUBLIC'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.StoreVisibility.dropdown.public'
                            defaultMessage='Public'
                        />
                    </MenuItem>
                    <MenuItem value='RESTRICTED' id='visibility-restricted-by-roles'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.storeVisibility.dropdown.restrict'
                            defaultMessage='Restrict by role(s)'
                        />
                    </MenuItem>
                    {tenants !== 0
                        && (
                            <MenuItem value='PRIVATE'>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.storeVisibility.dropdown.private'
                                    defaultMessage='Visible to my domain'
                                />
                            </MenuItem>
                        )}
                </TextField>
                <Tooltip
                    title={(
                        <>
                            <p>
                                <strong>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.storeVisibility.tooltip.public'
                                        defaultMessage='Public :'
                                    />
                                </strong>
                                {'  '}
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.storeVisibility.tooltip.public.desc'
                                    defaultMessage={
                                        'The {type} is accessible to everyone and can be advertised '
                                        + 'in multiple developer portals - a central developer portal '
                                        + 'and/or non-WSO2 developer portals.'
                                    }
                                    values={{
                                        type: getTypeToDisplay(api.apiType)
                                    }}
                                />
                                <br />
                                <br />
                                <strong>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.storeVisibility.tooltip.restrict'
                                        defaultMessage='Restricted by roles(s) :'
                                    />
                                </strong>
                                {'  '}
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.storeVisibility.tooltip.restrict.desc'
                                    defaultMessage={
                                        'The {type} is visible only to specific user'
                                        + ' roles in the tenant developer portal that you specify.'
                                    }
                                    values={{
                                        type: getTypeToDisplay(api.apiType)
                                    }}
                                />
                                {tenants !== 0 && (
                                    <>
                                        <br />
                                        <br />
                                        <strong>
                                            <FormattedMessage
                                                id='Apis.Details.Configuration.components.StoreVisibility.tooltip.private'
                                                defaultMessage='Visible to my domain :'
                                            />
                                        </strong>
                                        {'  '}
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.components.StoreVisibility.tooltip.private.desc'
                                            defaultMessage={
                                                'The {type} is visible to all users who are registered to the {type}\'s tenant domain.'
                                            }
                                            values={{
                                                type: getTypeToDisplay(api.apiType),
                                            }}
                                        />
                                    </>
                                )}
                            </p>
                        </>
                    )}
                    aria-label='Store Visibility'
                    placement='right-end'
                    className={classes.tooltip}
                    interactive
                >
                    <HelpOutline />
                </Tooltip>
            </Box>
            {isRestrictedByRoles && (
                <Box py={2} style={{ marginTop: -10, marginBottom: 10 }}>
                    <ChipInput
                        data-testid='visibility-select-role'
                        fullWidth
                        variant='outlined'
                        label={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.storeVisibility.roles'
                                defaultMessage='Roles'
                            />
                        )}
                        disabled={isCreateOrPublishRestricted()}
                        value={api.visibleRoles.concat(invalidRoles)}
                        alwaysShowPlaceholder={false}
                        placeholder={intl.formatMessage({
                            id: 'Apis.Details.Scopes.visibility.CreateScope.roles.placeholder',
                            defaultMessage: 'Enter roles and press Enter',
                        })}
                        blurBehavior='clear'
                        InputProps={{
                            endAdornment: !roleValidity && (
                                <InputAdornment position='end'>
                                    <Error color='error' />
                                </InputAdornment>
                            ),
                        }}
                        onAdd={handleRoleAddition}
                        error={!roleValidity || !roleExists}
                        helperText={
                            roleValidity ? (
                                <FormattedMessage
                                    id='Apis.Details.Scopes.visibility.CreateScope.roles.help'
                                    defaultMessage='Enter valid role and press enter'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Scopes.Roles.Invalid'
                                    defaultMessage='Role is invalid'
                                />
                            )
                        }
                        chipRenderer={({ value }, key) => (
                            <Chip
                                key={key}
                                size='small'
                                label={value}
                                onDelete={() => {
                                    handleRoleDeletion(value);
                                }}
                                style={{
                                    backgroundColor: invalidRoles.includes(value) ? red[300] : null,
                                    marginRight: '8px',
                                    float: 'left',
                                }}
                            />
                        )}
                    />
                </Box>
            )}
        </Root>)
    );
}

StoreVisibility.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
