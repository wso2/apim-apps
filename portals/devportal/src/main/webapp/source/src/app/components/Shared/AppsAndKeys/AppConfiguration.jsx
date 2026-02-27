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

import React, { useEffect, useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import ChipInput from 'AppComponents/Shared/ChipInput';
import Autocomplete from '@mui/material/Autocomplete';
import Settings from 'AppComponents/Shared/SettingsContext';
import validateConstraint, { getConstraintHint } from './constraintValidator';


const PREFIX = 'AppConfiguration';

const classes = {
    FormControl: `${PREFIX}-FormControl`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    button: `${PREFIX}-button`,
    quotaHelp: `${PREFIX}-quotaHelp`,
    checkboxWrapper: `${PREFIX}-checkboxWrapper`,
    checkboxWrapperColumn: `${PREFIX}-checkboxWrapperColumn`,
    group: `${PREFIX}-group`,
    removeHelperPadding: `${PREFIX}-removeHelperPadding`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(
    ({ theme }) => ({
        display: 'contents',
        [`& .${classes.FormControl}`]: {
            paddingTop: theme.spacing(2),
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
            flexDirection: 'row',
        },

        [`& .${classes.group}`]: {
            flexDirection: 'row',
        },

        [`& .${classes.removeHelperPadding}`]: {
            '& p': {
                margin: '8px 0px',
            },
        }
    })
);

/**
 *
 *
 * @class AppConfiguration
 * @extends {React.Component}
 */
const AppConfiguration = (props) => {

    const {
        config, isUserOwner, previousValue, handleChange, subscriptionScopes, onValidationError,
    } = props;

    const [selectedValue, setSelectedValue] = useState(previousValue);
    const [constraintError, setConstraintError] = useState('');
    const [isOrgWideAppUpdateEnabled, setIsOrgWideAppUpdateEnabled] = useState(false);
    const settingsContext = useContext(Settings);

    const AppConfigLabels = defineMessages({
        application_access_token_expiry_time: {
          id: 'Shared.AppsAndKeys.AppConfiguration.application.access.token.expiry.time',
          defaultMessage: 'Application Access Token Expiry Time',
        },
        user_access_token_expiry_time: {
          id: 'Shared.AppsAndKeys.AppConfiguration.user.access.token.expiry.time',
          defaultMessage: 'User Access Token Expiry Time',
        },
        refresh_token_expiry_time: {
           id: 'Shared.AppsAndKeys.AppConfiguration.refresh.token.expiry.time',
           defaultMessage: 'Refresh Token Expiry Time',
        },
        id_token_expiry_time: {
           id: 'Shared.AppsAndKeys.AppConfiguration.id.token.expiry.time',
           defaultMessage: 'Id Token Expiry Time',
        },
        pkceMandatory: {
            id: 'Shared.AppsAndKeys.AppConfiguration.pkce.mandatory',
            defaultMessage: 'Enable PKCE',
          },
        pkceSupportPlain: {
            id: 'Shared.AppsAndKeys.AppConfiguration.pkce.support.plain',
            defaultMessage: 'Support PKCE Plain text',
        },
        bypassClientCredentials: {
            id: 'Shared.AppsAndKeys.AppConfiguration.bypass.client.credentials',
            defaultMessage: 'Public client',
        }
    });

    const AppConfigToolTips = defineMessages({
        application_access_token_expiry_time: {
          id: 'Shared.AppsAndKeys.AppConfiguration.application.access.token.expiry.time.tooltip',
          defaultMessage: 'Type Application Access Token Expiry Time',
        },
        user_access_token_expiry_time: {
          id: 'Shared.AppsAndKeys.AppConfiguration.user.access.token.expiry.time.tooltip',
          defaultMessage: 'Type User Access Token Expiry Time',
        },
        refresh_token_expiry_time: {
           id: 'Shared.AppsAndKeys.AppConfiguration.refresh.token.expiry.time.tooltip',
           defaultMessage: 'Type Refresh Token Expiry Time',
        },
        id_token_expiry_time: {
           id: 'Shared.AppsAndKeys.AppConfiguration.id.token.expiry.time.tooltip',
           defaultMessage: 'Type ID Token Expiry Time',
        },
        pkceMandatory: {
            id: 'Shared.AppsAndKeys.AppConfiguration.pkce.mandatory.tooltip',
            defaultMessage: 'Enable PKCE',
          },
        pkceSupportPlain: {
            id: 'Shared.AppsAndKeys.AppConfiguration.pkce.support.plain.tooltip',
            defaultMessage: 'S256 is recommended, plain text too can be used.',
        },
        bypassClientCredentials: {
            id: 'Shared.AppsAndKeys.AppConfiguration.bypass.client.credentials.tooltip',
            defaultMessage: 'Allow authentication without the client secret.',
        }
    });

    const constraintMessages = defineMessages({
        rangeMin: {
            id: 'Shared.AppsAndKeys.AppConfiguration.constraint.error.range.min',
            defaultMessage: 'Value must be at least {min}',
        },
        rangeMax: {
            id: 'Shared.AppsAndKeys.AppConfiguration.constraint.error.range.max',
            defaultMessage: 'Value must be at most {max}',
        },
        rangeInvalid: {
            id: 'Shared.AppsAndKeys.AppConfiguration.constraint.error.range.invalid',
            defaultMessage: 'Value must be a number between {min} and {max}',
        },
        regexInvalid: {
            id: 'Shared.AppsAndKeys.AppConfiguration.constraint.error.regexInvalid',
            defaultMessage: 'Value must match the required pattern: {pattern}',
        },
    });
    
    /**
     * This method is used to handle the updating of key generation
     * request object.
     * @param {*} event event fired
     */
    const handleAppRequestChange = (event) => {
        const { target: currentTarget } = event;
        const newValue = currentTarget.type === 'checkbox' ? currentTarget.checked : currentTarget.value;
        setSelectedValue(newValue);

        // Validate against constraint if present
        const { constraint } = config;
        const result = validateConstraint(newValue, constraint, props.intl, constraintMessages);
        setConstraintError(result.valid ? '' : result.message);
        if (onValidationError) {
            onValidationError(config.name, !result.valid);
        }

        handleChange('additionalProperties', event);
    }

    const getAppConfigLabel = () => {
        return AppConfigLabels[config.name]
            ? props.intl.formatMessage(AppConfigLabels[config.name])
            : config.label
    }
    const getAppConfigToolTip = () => {
        let tooltip = AppConfigToolTips[config.name]
            ? props.intl.formatMessage(AppConfigToolTips[config.name])
            : config.tooltip;

        const { constraint } = config;
        const constraintText = getConstraintHint(constraint, props.intl, constraintMessages);
        if (constraintText) {
            tooltip = tooltip ? `${tooltip} (${constraintText})` : constraintText;
        }
        return tooltip;
    }

    /**
     * Update the state when new props are available
     */
    useEffect(() => {
        setSelectedValue(previousValue);
        const orgWideAppUpdateEnabled = settingsContext.settings.orgWideAppUpdateEnabled;
        setIsOrgWideAppUpdateEnabled(orgWideAppUpdateEnabled);
    }, [previousValue, settingsContext]);

    const setCheckboxValue = () => {
        return ( typeof selectedValue === 'string' && selectedValue === 'true' )
            || ( typeof selectedValue !== 'string' && selectedValue === true );
    }

    return (
        <Root>
            <TableRow>
                <TableCell component='th' scope='row' className={classes.leftCol}>
                    {getAppConfigLabel()}
                </TableCell>
                <TableCell>
                    <Box maxWidth={600}>

                        {config.type === 'select' && config.multiple === false ? (
                            <TextField
                                classes={{
                                    root: classes.removeHelperPadding,
                                }}
                                fullWidth
                                id={config.name}
                                select
                                label={getAppConfigLabel()}
                                value={selectedValue}
                                name={config.name}
                                onChange={e => handleAppRequestChange(e)}
                                helperText={getAppConfigToolTip()}
                                margin='dense'
                                variant='outlined'
                                size='small'
                                disabled={!isOrgWideAppUpdateEnabled && !isUserOwner}
                            >
                                {
                                (config.constraint && config.constraint.value && config.constraint.value.allowed)
                                ? config.constraint.value.allowed.map(key => (
                                    <MenuItem key={key} value={key}>
                                        {key}
                                    </MenuItem>
                                ))
                                : config.values.map(key => (
                                    <MenuItem key={key} value={key}>
                                        {key}
                                    </MenuItem>
                                ))}
                            </TextField>
                    ) : (config.type === 'select' && config.multiple === true && Array.isArray(selectedValue)) ? 
                        (config.name === 'application_scopes') ? (
                            <>
                                <Autocomplete
                                    multiple
                                    disabled={subscriptionScopes.length === 0}
                                    options={subscriptionScopes} // Available subscription scopes
                                    value={selectedValue} // Selected values
                                    onChange={(event, newValue) => {
                                        const e = { target: { name: config.name, value: newValue } };
                                        handleAppRequestChange(e); // Update the selected values
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            classes={{
                                                root: classes.removeHelperPadding,
                                            }}
                                            fullWidth
                                            disabled={subscriptionScopes.length === 0}
                                            margin='dense'
                                            size='small'
                                            variant='outlined'
                                            label={config.label}
                                            placeholder="Select scopes"
                                            error={config.required && hasMandatoryError(selectedValue)}
                                            helperText={(config.required && hasMandatoryError(selectedValue)) || getAppConfigToolTip()}
                                        />
                                    )}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => (
                                            <Chip
                                                key={option}
                                                label={option}
                                                {...getTagProps({ index })}
                                                size="small"
                                            />
                                        ))
                                    }
                                />
                            </>
                        ) : (
                            <>
                                <FormControl variant="outlined" className={classes.formControl} fullWidth error={!!constraintError}>
                                    <InputLabel id="multi-select-label">{config.label}</InputLabel>
                                    <Select
                                        variant="standard"
                                        labelId="multi-select-label"
                                        id="multi-select-outlined"
                                        margin='dense'
                                        displayEmpty
                                        name={config.name}
                                        multiple
                                        value={selectedValue}
                                        onChange={e => handleAppRequestChange(e)}
                                        input={<Input id='multi-select-outlined'/>}
                                        renderValue={selected => (
                                            <div className={classes.chips}>
                                                {selected.map(value => (
                                                    <Chip key={value} label={value} className={classes.chip}/>
                                                ))}
                                            </div>
                                        )}
                                        label={getAppConfigLabel()}
                                    >
                                        {(config.constraint && config.constraint.value && config.constraint.value.allowed)
                                            ? config.constraint.value.allowed.map(key => (
                                                <MenuItem key={key} value={key}>
                                                    <Checkbox checked={selectedValue.indexOf(key) > -1}/>
                                                    <ListItemText primary={key}/>
                                                </MenuItem>
                                            ))
                                            : config.values.map(key => (
                                                <MenuItem key={key} value={key}>
                                                    <Checkbox checked={selectedValue.indexOf(key) > -1}/>
                                                    <ListItemText primary={key}/>
                                                </MenuItem>
                                            ))}
                                    </Select>
                                    <FormHelperText>{getAppConfigToolTip()}</FormHelperText>
                                </FormControl>
                            </>
                        ) : (config.type === 'input' && config.multiple === true) ? (
                            <>
                            <ChipInput
                                value={selectedValue}
                                fullWidth
                                variant='outlined'
                                id="multi-input-outlined"
                                label={config.label}
                                onAdd={(tag) => {
                                    const e = { target: { name:config.name, value: [...selectedValue, tag] } }
                                    handleAppRequestChange(e)
                                }
                                }
                                chipRenderer={({ value }, key) => (
                                    <Chip
                                        key={key}
                                        size='small'
                                        label={value}
                                        onDelete={() => {
                                            const e = { target: { name:config.name, value:selectedValue.filter (
                                            (oldScope)=> oldScope !== value) } }
                                            handleAppRequestChange(e);
                                        }}
                                        style={{
                                            marginRight: '8px',
                                            float: 'left',
                                        }}
                                    />
                                )}
                                style={{ display: 'flex' }}
                            />
                            <Typography variant='caption'>
                                    {config.tooltip}
                                </Typography>
                            </>
                        ) : (config.type === 'input') ? (
                            <TextField
                                classes={{
                                    root: classes.removeHelperPadding,
                                }}
                                fullWidth
                                id={config.name}
                                label={getAppConfigLabel()}
                                value={selectedValue}
                                name={config.name}
                                onChange={e => handleAppRequestChange(e)}
                                error={!!constraintError}
                                helperText={constraintError || getAppConfigToolTip()}
                                FormHelperTextProps={constraintError ? { error: true } : {}}
                                margin='dense'
                                size='small'
                                variant='outlined'
                                disabled={!isOrgWideAppUpdateEnabled && !isUserOwner}
                            />
                        ) : (config.type === 'checkbox') ? (
                            <Checkbox
                                classes={{
                                    root: classes.removeHelperPadding,
                                }}
                                fullWidth
                                id={config.name}
                                label={getAppConfigLabel()}
                                checked={setCheckboxValue()}
                                name={config.name}
                                onChange={e => handleAppRequestChange(e)}
                                helperText={
                                    <Typography variant='caption'>
                                        {getAppConfigToolTip()}
                                    </Typography>
                                }
                                margin='dense'
                                variant='outlined'
                                disabled={!isOrgWideAppUpdateEnabled && !isUserOwner}
                            />
                        ) : (
                            <TextField
                                classes={{
                                    root: classes.removeHelperPadding,
                                }}
                                fullWidth
                                id={config.name}
                                label={getAppConfigLabel()}
                                value={selectedValue}
                                name={config.name}
                                onChange={e => handleAppRequestChange(e)}
                                error={!!constraintError}
                                helperText={constraintError || getAppConfigToolTip()}
                                FormHelperTextProps={constraintError ? { error: true } : {}}
                                margin='dense'
                                variant='outlined'
                                disabled={!isOrgWideAppUpdateEnabled && !isUserOwner}
                            />
                        )}
                    </Box>
                </TableCell>
            </TableRow>
        </Root>
    );
};

AppConfiguration.contextType = Settings;

AppConfiguration.defaultProps = {
    notFound: false,
    subscriptionScopes: [],
};

AppConfiguration.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    previousValue: PropTypes.any.isRequired,
    isUserOwner: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    config: PropTypes.any.isRequired,
    subscriptionScopes: PropTypes.arrayOf(PropTypes.string),
    onValidationError: PropTypes.func,
    notFound: PropTypes.bool,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};

export default injectIntl((AppConfiguration));
