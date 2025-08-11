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

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        const newKeyManagers = typeof value === 'string' ? value.split(',') : value;
        configDispatcher({
            action: 'keymanagers',
            value: newKeyManagers,
        });
    };
    const { api } = useContext(APIContext);
    useEffect(() => {
        if (!isRestricted(['apim:api_create'], api)) {
            API.keyManagers().then((response) => setKeyManagersConfigured(response.body.list));
        }
    }, []);
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
                        control={<Radio disabled={isRestricted(['apim:api_create'], api)} />}
                        label={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.KeyManager.allow.all'
                                defaultMessage='Allow all'
                            />
                        )}
                    />
                    <FormControlLabel
                        value='selected'
                        control={<Radio disabled={isRestricted(['apim:api_create'], api)} />}
                        label={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.KeyManager.allow.selected'
                                defaultMessage='Allow selected'
                            />
                        )}
                    />
                </RadioGroup>
                {!keyManagers.includes('all') && (
                    <Box display='flex' flexDirection='column' m={2} pr={5}>
                        <FormControl 
                            required
                            error={!keyManagers || (keyManagers && keyManagers.length === 0)}
                            sx={{ minWidth: 300 }}
                        >
                            <InputLabel id='key-managers-select-label'>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.KeyManager.more.than.one.info'
                                    defaultMessage='Select one or more Key Managers'
                                />
                            </InputLabel>
                            <Select
                                labelId='key-managers-select-label'
                                id='key-managers-select'
                                multiple
                                value={keyManagers.filter(km => km !== 'all')}
                                onChange={handleChange}
                                input={
                                    <OutlinedInput 
                                        id='select-multiple-key-managers' 
                                        label='Select one or more Key Managers' 
                                    />
                                }
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const keyManager = keyManagersConfigured.find(km => km.name === value);
                                            return (
                                                <Chip 
                                                    key={value} 
                                                    label={keyManager?.displayName || value}
                                                    size='small'
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                                disabled={isRestricted(['apim:api_create'], api)}
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
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.KeyManager.more.than.one.error'
                                    defaultMessage='Select at least one Key Manager'
                                />
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
