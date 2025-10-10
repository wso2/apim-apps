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

import React, { useContext, useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { isRestricted } from 'AppData/AuthManager';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';

const PREFIX = 'KeyManager';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 300,
        },
    },
};

/**
 * Get styles for menu items based on selection state
 * @param {string} name - Key manager name
 * @param {Array} selectedKeyManagers - Array of selected key managers
 * @param {Object} theme - MUI theme object
 * @returns {Object} Style object
 */
function getStyles(name, selectedKeyManagers, theme) {
    return {
        fontWeight:
            selectedKeyManagers.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    actionSpace: `${PREFIX}-actionSpace`,
    subHeading: `${PREFIX}-subHeading`,
    keyManagerSelect: `${PREFIX}-keyManagerSelect`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.actionSpace}`]: {
        margin: '-7px auto',
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    },

    [`& .${classes.keyManagerSelect}`]: {
        minWidth: 180,
    }
}));

/**
 * KeyManager configuration component
 * @param {Object} props - Component props
 * @param {Object} props.api - API object
 * @param {Function} props.configDispatcher - Configuration dispatcher function
 * @returns {JSX.Element} KeyManager component
 */
export default function KeyManager(props) {
    const theme = useTheme();
    const [keyManagersConfigured, setKeyManagersConfigured] = useState([]);
    const {
        configDispatcher,
        api: { keyManagers, securityScheme },
    } = props;

    const { api } = useContext(APIContext);
    const isMCPAPI = api.apiType === MCPServer.CONSTS.MCP;

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        let newKeyManagers;
        
        if (isMCPAPI) {
            // For MCP APIs, only allow single selection
            newKeyManagers = typeof value === 'string' ? [value] : [value[value.length - 1]];
        } else {
            // For other APIs, allow multiple selection
            newKeyManagers = typeof value === 'string' ? value.split(',') : value;
        }
        
        configDispatcher({
            action: 'keymanagers',
            value: newKeyManagers,
        });
    };

    const getCreateScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === MCPServer.CONSTS.MCP) {
            return ['apim:mcp_server_create'];
        } else {
            return ['apim:api_create'];
        }
    };
    const isCreateRestricted = () => isRestricted(getCreateScopes(), api);

    useEffect(() => {
        if (!isCreateRestricted()) {
            API.keyManagers().then((response) => {
                setKeyManagersConfigured(response.body.list);
                
                // For MCP APIs, set Resident Key Manager as default if no key manager is selected
                if (isMCPAPI && (!keyManagers || keyManagers.length === 0 || 
                    (keyManagers.length === 1 && keyManagers[0] === 'all'))) {
                    
                    // Find the Resident Key Manager
                    const residentKM = response.body.list.find(km => 
                        km.name === 'Resident Key Manager' || 
                        km.displayName === 'Resident Key Manager' ||
                        km.name.toLowerCase().includes('resident')
                    );
                    
                    if (residentKM && residentKM.enabled) {
                        configDispatcher({
                            action: 'keymanagers',
                            value: [residentKM.name],
                        });
                    } else {
                        // Fallback to first enabled key manager if Resident not found
                        const firstEnabled = response.body.list.find(km => km.enabled);
                        if (firstEnabled) {
                            configDispatcher({
                                action: 'keymanagers',
                                value: [firstEnabled.name],
                            });
                        }
                    }
                }
            });
        }
    }, [isMCPAPI, keyManagers, configDispatcher, api]);
    if (!securityScheme.includes('oauth2')) {
        return (
            (<Root>
                <Typography className={classes.subHeading} variant='subtitle2' component='h5'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.KeyManager.configuration'
                        defaultMessage='Key Manager Configuration'
                    />
                </Typography>
                <Box ml={1} mb={2}>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.oauth.disabled'
                            defaultMessage='Key Manager configuration only valid when OAuth2 security is enabled.'
                        />
                    </Typography>
                </Box>
            </Root>)
        );
    }
    return (
        <>
            <Typography className={classes.subHeading} variant='subtitle2' component='h5'>
                <FormattedMessage
                    id='Apis.Details.Configuration.components.KeyManager.configuration'
                    defaultMessage='Key Manager Configuration'
                />
            </Typography>
            <Box ml={1}>
                {!isMCPAPI && (
                    <RadioGroup
                        value={keyManagers.includes('all') ? 'all' : 'selected'}
                        onChange={({ target: { value } }) => configDispatcher({
                            action: 'allKeyManagersEnabled',
                            value: value === 'all',
                        })}
                        style={{ flexDirection: 'row' }}
                    >
                        <FormControlLabel
                            value='all'
                            control={<Radio disabled={isCreateRestricted()} />}
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.KeyManager.allow.all'
                                    defaultMessage='Allow all'
                                />
                            )}
                        />
                        <FormControlLabel
                            value='selected'
                            control={<Radio disabled={isCreateRestricted()} />}
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.KeyManager.allow.selected'
                                    defaultMessage='Allow selected'
                                />
                            )}
                        />
                    </RadioGroup>
                )}
                {(isMCPAPI || !keyManagers.includes('all')) && (
                    <Box display='flex' flexDirection='column' m={2} pr={5}>
                        <FormControl 
                            required
                            error={(() => {
                                const filteredKeyManagers = keyManagers.filter(km => km !== 'all');
                                if (isMCPAPI) {
                                    return !filteredKeyManagers.length || !filteredKeyManagers[0];
                                }
                                return !keyManagers || keyManagers.length === 0 || filteredKeyManagers.length === 0;
                            })()}
                            sx={{ minWidth: 300 }}
                        >
                            <InputLabel id='key-managers-select-label'>
                                {isMCPAPI ? (
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.KeyManager.single.selection.info'
                                        defaultMessage='Select a Key Manager'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.KeyManager.more.than.one.info'
                                        defaultMessage='Select one or more Key Managers'
                                    />
                                )}
                            </InputLabel>
                            <Select
                                labelId='key-managers-select-label'
                                id='key-managers-select'
                                multiple={!isMCPAPI}
                                value={isMCPAPI 
                                    ? keyManagers.filter(km => km !== 'all')[0] || '' 
                                    : keyManagers.filter(km => km !== 'all')
                                }
                                onChange={handleChange}
                                input={
                                    <OutlinedInput 
                                        id='select-multiple-key-managers' 
                                        label={isMCPAPI 
                                            ? 'Select a Key Manager' 
                                            : 'Select one or more Key Managers'
                                        } 
                                    />
                                }
                                renderValue={(selected) => {
                                    if (isMCPAPI) {
                                        // Single selection for MCP - render as single chip
                                        const keyManager = keyManagersConfigured.find(km => km.name === selected);
                                        return (
                                            <Chip 
                                                label={keyManager?.displayName || selected}
                                                size='small'
                                            />
                                        );
                                    } else {
                                        // Multiple selection for other APIs - render as multiple chips
                                        return (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const keyManager = keyManagersConfigured.find(
                                                        km => km.name === value
                                                    );
                                                    return (
                                                        <Chip 
                                                            key={value} 
                                                            label={keyManager?.displayName || value}
                                                            size='small'
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        );
                                    }
                                }}
                                MenuProps={MenuProps}
                                disabled={isCreateRestricted()}
                            >
                                {keyManagersConfigured.map((keyManager) => (
                                    <MenuItem
                                        key={keyManager.name}
                                        value={keyManager.name}
                                        disabled={!keyManager.enabled}
                                        style={getStyles(keyManager.name, keyManagers, theme)}
                                    >
                                        {keyManager.displayName || keyManager.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                {isMCPAPI ? (
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.KeyManager.single.selection.error'
                                        defaultMessage='Select a Key Manager'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.KeyManager.more.than.one.error'
                                        defaultMessage='Select at least one Key Manager'
                                    />
                                )}
                            </FormHelperText>
                        </FormControl>
                    </Box>
                )}
            </Box>
        </>
    );
}

KeyManager.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
