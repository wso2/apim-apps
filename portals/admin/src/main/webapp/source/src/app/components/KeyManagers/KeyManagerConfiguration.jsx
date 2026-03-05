import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CustomInputField from 'AppComponents/KeyManagers/CustomInputField';
import Certificates from 'AppComponents/KeyManagers/Certificates';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

/**
 * @export
 * @param {*} props sksk
 * @returns {React.Component}
 */
/**
 * Keymanager Connector configuration
 * @param {JSON} props props passed from parents.
 * @returns {JSX} key manager connector form.
 */
export default function KeyManagerConfiguration(props) {
    const {
        keymanagerConnectorConfigurations, additionalProperties,
        setAdditionalProperties, hasErrors, validating, keyManagerId,
    } = props;

    // Function to get all nested property names recursively
    const getAllNestedPropertyNames = (configurations, parentKey = '') => {
        const propertyNames = [];

        configurations.forEach((config) => {
            // configKey will have the full path of the property (Ex: "parent.child.property")
            const configKey = parentKey ? `${parentKey}.${config.name}` : config.name;
            propertyNames.push(config.name);

            // If the configuration has nested values, recursively get their property names
            if (config.values && config.values.length > 0) {
                config.values.forEach((value) => {
                    if (typeof value === 'object' && value.values) {
                        propertyNames.push(...getAllNestedPropertyNames(value.values, configKey));
                    }
                });
            }
        });

        return propertyNames;
    };

    // Function to get nested configurations based on selected dropdown/options value
    const getNestedConfigurations = (parentConfig, selectedValue) => {
        if (!parentConfig.values || !selectedValue) return [];

        // Values can be either strings or objects
        const selectedOption = parentConfig.values.find((option) => {
            if (typeof option === 'string') {
                return option === selectedValue;
            }
            return option.name === selectedValue;
        });

        if (!selectedOption || !selectedOption.values) return [];

        return selectedOption.values;
    };

    // Function to clear unused nested properties when parent value changes
    const clearUnusedProperties = (parentConfig, newValue) => {
        if (!parentConfig.values || !parentConfig.values.length) return;

        // Get all possible nested property names from all options
        const allPossibleProperties = [];
        parentConfig.values.forEach((option) => {
            if (typeof option === 'object' && option.values) {
                allPossibleProperties.push(...getAllNestedPropertyNames(option.values));
            }
        });

        // Get currently visible property names
        const currentlyVisibleProperties = [];
        const currentNestedConfigs = getNestedConfigurations(parentConfig, newValue);
        if (currentNestedConfigs.length > 0) {
            currentlyVisibleProperties.push(...getAllNestedPropertyNames(currentNestedConfigs));
        }

        // Clear properties that are no longer visible
        const propertiesToClear = allPossibleProperties.filter(
            (prop) => !currentlyVisibleProperties.includes(prop),
        );

        // Remove properties that are no longer relevant
        propertiesToClear.forEach((propName) => {
            if (additionalProperties[propName] !== undefined) {
                setAdditionalProperties(propName, undefined);
            }
        });
    };

    // Function to clear all nested properties recursively from a configuration
    const clearAllNestedProperties = (config) => {
        if (!config.values || !config.values.length) return;

        config.values.forEach((option) => {
            if (typeof option === 'object' && option.values) {
                const nestedPropertyNames = getAllNestedPropertyNames(option.values);
                nestedPropertyNames.forEach((propName) => {
                    if (additionalProperties[propName] !== undefined) {
                        setAdditionalProperties(propName, undefined);
                    }
                });
            }
        });
    };

    const onChange = (e) => {
        let finalValue;
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            if (additionalProperties[name]) {
                finalValue = additionalProperties[name];
            } else {
                finalValue = [];
            }
            if (e.target.checked) {
                finalValue.push(value);
            } else {
                const newValue = finalValue.filter((v) => v !== e.target.value);
                finalValue = newValue;
            }
        } else {
            finalValue = value;
        }

        // Find the configuration for this field to check if it has nested configs
        const findConfigRecursively = (configs) => {
            for (const config of configs) {
                if (config.name === name) return config;
                if (config.values && config.values.length > 0) {
                    for (const val of config.values) {
                        if (typeof val === 'object' && val.values) {
                            const found = findConfigRecursively(val.values);
                            if (found) return found;
                        }
                    }
                }
            }
            return null;
        };

        const currentConfig = findConfigRecursively(keymanagerConnectorConfigurations);

        // Clear unused nested properties if this is a dropdown/options/select field
        if (currentConfig && (
            currentConfig.type === 'dropdown'
            || currentConfig.type === 'options'
            || currentConfig.type === 'select')) {
            clearUnusedProperties(currentConfig, finalValue);
        }

        setAdditionalProperties(name, finalValue);
    };
    const onChangeCheckBox = (e) => {
        const { name, checked } = e.target;

        // Find the configuration for this field to check if it has nested configs
        const findConfigRecursively = (configs) => {
            for (const config of configs) {
                if (config.name === name) return config;
                if (config.values && config.values.length > 0) {
                    for (const val of config.values) {
                        if (typeof val === 'object' && val.values) {
                            const found = findConfigRecursively(val.values);
                            if (found) return found;
                        }
                    }
                }
            }
            return null;
        };

        const currentConfig = findConfigRecursively(keymanagerConnectorConfigurations);

        // Clear unused nested properties if this checkbox field has nested configs
        if (currentConfig && currentConfig.type === 'checkbox' && !checked) {
            clearAllNestedProperties(currentConfig);
        }

        setAdditionalProperties(name, checked);
    };

    // Clear properties that are no longer valid when configuration structure changes
    useEffect(() => {
        if (!keymanagerConnectorConfigurations || keymanagerConnectorConfigurations.length === 0) {
            return;
        }

        // Get all valid property names from current configuration structure
        const currentValidProperties = getAllNestedPropertyNames(keymanagerConnectorConfigurations);

        // Clear any properties in additionalProperties that are not in the current valid set
        Object.keys(additionalProperties).forEach((propName) => {
            if (!currentValidProperties.includes(propName)) {
                setAdditionalProperties(propName, undefined);
            }
        });

        // Clear nested properties that don't match current selections
        keymanagerConnectorConfigurations.forEach((config) => {
            if ((config.type === 'dropdown' || config.type === 'options' || config.type === 'select')
                && config.values && config.values.length > 0
                && config.values.some((value) => typeof value === 'object' && value.values)) {
                const currentValue = additionalProperties[config.name];
                if (currentValue) {
                    // Clear properties from non-selected nested configurations
                    clearUnusedProperties(config, currentValue);
                }
            }
        });
    }, [keymanagerConnectorConfigurations, additionalProperties]);

    const getComponent = (keymanagerConnectorConfiguration) => {
        let value = '';
        const disabled = Boolean(keymanagerConnectorConfiguration.updateDisabled && keyManagerId);
        if (additionalProperties[keymanagerConnectorConfiguration.name]) {
            value = additionalProperties[keymanagerConnectorConfiguration.name];
        } else if (!keyManagerId && (keymanagerConnectorConfiguration.default
                || keymanagerConnectorConfiguration.defaultValue)) {
            const defaultVal = keymanagerConnectorConfiguration.default
                || keymanagerConnectorConfiguration.defaultValue;
            if (typeof defaultVal === 'string'
                && ['input', 'select', 'options', 'dropdown'].includes(keymanagerConnectorConfiguration.type)
            ) {
                onChange({
                    target: {
                        name: keymanagerConnectorConfiguration.name,
                        value: defaultVal,
                        type: keymanagerConnectorConfiguration.type,
                    },
                });
            } else if (typeof defaultVal === 'boolean'
                && keymanagerConnectorConfiguration.type === 'checkbox'
            ) {
                onChangeCheckBox({
                    target: {
                        name: keymanagerConnectorConfiguration.name,
                        checked: defaultVal,
                    },
                });
            } else if (keymanagerConnectorConfiguration.type === 'certificate'
                && defaultVal
            ) {
                setAdditionalProperties(keymanagerConnectorConfiguration.name, {
                    type: 'PEM',
                    value: defaultVal,
                });
            }
        }
        if (keymanagerConnectorConfiguration.type === 'input') {
            if (keymanagerConnectorConfiguration.mask) {
                return (
                    <FormControl variant='outlined' fullWidth disabled={disabled}>
                        <InputLabel sx={{ bgcolor: 'white' }}>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </InputLabel>
                        <CustomInputField
                            value={value}
                            onChange={onChange}
                            name={keymanagerConnectorConfiguration.name}
                            required={keymanagerConnectorConfiguration.required}
                            hasErrors={hasErrors}
                            validating={validating}
                        />
                        <FormHelperText>
                            {hasErrors('keyconfig', value, validating) || keymanagerConnectorConfiguration.tooltip}
                        </FormHelperText>
                    </FormControl>
                );
            }
            return (
                <TextField
                    id={keymanagerConnectorConfiguration.name}
                    margin='dense'
                    name={keymanagerConnectorConfiguration.name}
                    label={(
                        <span>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    )}
                    fullWidth
                    error={keymanagerConnectorConfiguration.required && hasErrors('keyconfig', value, validating)}
                    helperText={hasErrors('keyconfig', value, validating) || keymanagerConnectorConfiguration.tooltip}
                    variant='outlined'
                    value={value}
                    defaultValue={
                        keymanagerConnectorConfiguration.default
                        || keymanagerConnectorConfiguration.defaultValue
                    }
                    onChange={onChange}
                    disabled={disabled}
                />
            );
        } else if (keymanagerConnectorConfiguration.type === 'select') {
            return (
                <FormControl variant='standard' component='fieldset' disabled={disabled}>
                    <FormLabel component='legend'>
                        <span>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    </FormLabel>
                    <FormGroup>
                        {keymanagerConnectorConfiguration.values.map((selection) => (
                            <FormControlLabel
                                key={selection}
                                control={(
                                    <Checkbox
                                        checked={value.includes(selection)}
                                        onChange={onChange}
                                        value={selection}
                                        color='primary'
                                        name={keymanagerConnectorConfiguration.name}
                                    />
                                )}
                                label={selection}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            );
        } else if (keymanagerConnectorConfiguration.type === 'checkbox') {
            return (
                <FormControl variant='standard' component='fieldset' disabled={disabled}>
                    <FormLabel component='legend'>
                        <span>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    </FormLabel>
                    <FormGroup>
                        {keymanagerConnectorConfiguration.values.map((selection) => (
                            <FormControlLabel
                                key={selection}
                                control={(
                                    <Checkbox
                                        checked={value === '' ? false : value}
                                        onChange={onChangeCheckBox}
                                        value={selection}
                                        color='primary'
                                        name={keymanagerConnectorConfiguration.name}
                                    />
                                )}
                                label={selection}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            );
        } else if (keymanagerConnectorConfiguration.type === 'options') {
            return (
                <FormControl variant='standard' component='fieldset' disabled={disabled}>
                    <FormLabel component='legend'>
                        <span>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    </FormLabel>
                    <RadioGroup
                        aria-label={keymanagerConnectorConfiguration.label}
                        name={keymanagerConnectorConfiguration.name}
                        value={value}
                        onChange={onChange}
                    >
                        {keymanagerConnectorConfiguration.values.map((selection) => {
                            // Handle both string values and object values
                            const optionValue = typeof selection === 'string' ? selection : selection.name;
                            const optionLabel = typeof selection === 'string' ? selection : selection.label;

                            return (
                                <FormControlLabel
                                    key={optionValue}
                                    value={optionValue}
                                    control={<Radio />}
                                    label={optionLabel}
                                />
                            );
                        })}
                    </RadioGroup>
                </FormControl>
            );
        } else if (keymanagerConnectorConfiguration.type === 'dropdown') {
            return (
                <FormControl variant='outlined' fullWidth disabled={disabled}>
                    <InputLabel sx={{ bgcolor: 'white' }}>
                        {keymanagerConnectorConfiguration.label}
                        {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                    </InputLabel>
                    <Select
                        name={keymanagerConnectorConfiguration.name}
                        value={value}
                        onChange={onChange}
                        label={keymanagerConnectorConfiguration.label}
                    >
                        {keymanagerConnectorConfiguration.values.map((option) => {
                            // Handle both string values (legacy) and object values (new format)
                            const optionValue = typeof option === 'string' ? option : option.name;
                            const optionLabel = typeof option === 'string' ? option : option.label;

                            return (
                                <MenuItem key={optionValue} value={optionValue}>
                                    {optionLabel}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    <FormHelperText>
                        {hasErrors('keyconfig', value, validating) || keymanagerConnectorConfiguration.tooltip}
                    </FormHelperText>
                </FormControl>
            );
        } else if (keymanagerConnectorConfiguration.type === 'certificate') {
            return (
                <Box>
                    <FormLabel component='legend'>
                        <span>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    </FormLabel>
                    <Certificates
                        certificates={{
                            type: value?.type || 'PEM',
                            value: value?.value || '',
                        }}
                        dispatch={(action) => {
                            if (action.field === 'certificates') {
                                setAdditionalProperties(keymanagerConnectorConfiguration.name, action.value);
                            }
                        }}
                        showJwks={false}
                    />
                </Box>
            );
        } else {
            return (
                <TextField
                    id={keymanagerConnectorConfiguration.name}
                    margin='dense'
                    name={keymanagerConnectorConfiguration.name}
                    label={keymanagerConnectorConfiguration.label}
                    fullWidth
                    required
                    variant='outlined'
                    value={value}
                    defaultValue={
                        keymanagerConnectorConfiguration.default
                        || keymanagerConnectorConfiguration.defaultValue
                    }
                    onChange={onChange}
                    disabled={disabled}
                />
            );
        }
    };

    // Recursive function to render configurations with nested approach
    const renderConfigurations = (configurations, parentKey = '') => {
        return configurations.map((config) => {
            const configKey = parentKey ? `${parentKey}.${config.name}` : config.name;

            // Check if this config has nested configurations
            const hasNestedConfigurations = config.values && config.values.length > 0
                && config.values.some((value) => typeof value === 'object' && value.values);

            return (
                <Box key={`${configKey}`} mb={3}>
                    {getComponent(config)}
                    {hasNestedConfigurations && additionalProperties[config.name] && (
                        <Box ml={2} mt={2}>
                            {renderConfigurations(
                                getNestedConfigurations(config, additionalProperties[config.name]),
                                configKey,
                            )}
                        </Box>
                    )}
                </Box>
            );
        });
    };

    return (
        <div>
            {renderConfigurations(keymanagerConnectorConfigurations)}
        </div>
    );
}
KeyManagerConfiguration.defaultProps = {
    keymanagerConnectorConfigurations: [],
    required: false,
    helperText: <FormattedMessage
        id='KeyManager.Connector.Configuration.Helper.text'
        defaultMessage='Add Key Manager Connector Configurations'
    />,
    hasErrors: () => {},
    validating: false,
};
