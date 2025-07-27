import React, { useEffect, useReducer } from 'react';
import { styled } from '@mui/material/styles';
import {
    TextField, Checkbox, FormControlLabel, Box, FormLabel, FormControl,
    FormGroup, Radio, RadioGroup, MenuItem, FormHelperText,
} from '@mui/material';
import { cloneDeep } from 'lodash';
import Certificates from 'AppComponents/KeyManagers/Certificates';
import CustomInputField from 'AppComponents/KeyManagers/CustomInputField';
import { FormattedMessage } from 'react-intl';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

/**
 * Reducer
 * @param {JSON} state The second number.
 * @returns {Promise}
 */
function certificateReducer(state, action) {
    // If we receive a direct certificate update
    if (action.type === undefined && action.value !== undefined) {
        return {
            type: action.value.type || 'PEM',
            value: action.value.value || '',
        };
    }
    // If we receive a field update
    const { field, value } = action;
    if (field === 'tenantWideCertificates') {
        return {
            type: value.type || state.type,
            value: value.value || '',
        };
    }
    return state;
}

export default function KeyManagerConfiguration(props) {
    const {
        keymanagerConnectorConfigurations,
        additionalProperties,
        setAdditionalProperties,
        hasErrors,
        validating,
    } = props;

    // Change from constant to state
    const [tenantWideCertificates, dispatch] = useReducer(certificateReducer,
        additionalProperties?.certificates || {
            type: 'PEM',
            value: '',
        });
    // Add effect to watch for changes and sync with additionalProperties
    useEffect(() => {
        if (tenantWideCertificates) {
            // Ensure we only pass the correct structure
            const certificateData = {
                type: tenantWideCertificates.type || 'PEM',
                value: tenantWideCertificates.value || '',
            };
            setAdditionalProperties('certificates', certificateData);
        }
    }, [tenantWideCertificates, setAdditionalProperties]);

    // Helper function to get nested value from additionalProperties
    const getNestedValue = (path, defaultValue = '') => {
        if (!path) return defaultValue;

        // First try to get the value using the flattened key
        if (additionalProperties && path in additionalProperties) {
            return additionalProperties[path];
        }

        // Fallback to nested object traversal for backward compatibility
        const pathArray = Array.isArray(path) ? path : path.split('.');
        let current = additionalProperties;

        for (const segment of pathArray) {
            if (current && typeof current === 'object' && segment in current) {
                current = current[segment];
            } else {
                return defaultValue;
            }
        }

        return current !== undefined ? current : defaultValue;
    };

    // Helper function to remove all keys with a given prefix from additionalProperties
    const removeKeysWithPrefix = (prefix) => {
        const clonedAdditionalProperties = cloneDeep(additionalProperties);
        const keysToRemove = Object.keys(clonedAdditionalProperties).filter((key) => key.startsWith(`${prefix}.`));

        keysToRemove.forEach((key) => {
            delete clonedAdditionalProperties[key];
        });

        if (keysToRemove.length > 0) {
            console.log(`Removed keys with prefix "${prefix}":`, keysToRemove);
            console.log('Before cleanup:', additionalProperties);
            console.log('After cleanup:', clonedAdditionalProperties);
            // Use a special flag to set entire object
            setAdditionalProperties('', clonedAdditionalProperties, null, false, true);
        } else {
            console.log(`No keys found to remove with prefix "${prefix}"`);
            console.log('Current additionalProperties keys:', Object.keys(additionalProperties));
        }
    };

    // Helper function to cleanup all other option fields when a dropdown/option changes
    const cleanupAllOtherOptions = (configPath, currentValue, configValues) => {
        if (!configValues || !Array.isArray(configValues)) {
            console.log(`No config values found for cleanup at path: ${configPath}`);
            return;
        }

        console.log(`Cleaning up all options except "${currentValue}" for path "${configPath}"`);

        // Clean up all options except the current one
        configValues.forEach((option) => {
            if (option.name !== currentValue && option.values && Array.isArray(option.values)) {
                const optionPath = `${configPath}.${option.name}`;
                const existingKeysForOption = Object.keys(additionalProperties)
                    .filter((key) => key.startsWith(`${optionPath}.`));
                if (existingKeysForOption.length > 0) {
                    console.log(`Removing orphaned keys for option "${option.name}":`, existingKeysForOption);
                    removeKeysWithPrefix(optionPath);
                }
            }
        });
    };

    // Helper function to set nested value in additionalProperties
    const setNestedValue = (path, value) => {
        if (!path) {
            return;
        }

        // If value is empty (null, undefined, empty string, or empty array), remove the key
        const isEmptyString = value === null || value === undefined || value === ''
            || (Array.isArray(value) && value.length === 0);

        if (isEmptyString) {
            if (typeof path === 'string' && path.includes('.')) {
                // For nested paths, parse the path to get the key and parentPath
                const pathParts = path.split('.');
                const key = pathParts.pop();
                const parentPath = pathParts.join('.');
                setAdditionalProperties(key, '', parentPath, true); // Pass empty string and true to indicate removal
            } else {
                setAdditionalProperties(path, '', null, true); // Pass empty string and true to indicate removal
            }
        } else if (typeof path === 'string' && path.includes('.')) {
            // For nested paths, parse the path to get the key and parentPath
            const pathParts = path.split('.');
            const key = pathParts.pop();
            const parentPath = pathParts.join('.');
            setAdditionalProperties(key, value, parentPath);
        } else {
            // For simple paths, store directly
            setAdditionalProperties(path, value);
        }
    };

    const onChange = (e, configPath = null) => {
        const {
            name, value, type, checked,
        } = e.target;

        const fullPath = configPath ? `${configPath}.${name}` : name;

        if (type === 'checkbox') {
            const current = Array.isArray(getNestedValue(fullPath)) ? [...getNestedValue(fullPath)] : [];
            let finalValue;
            if (checked) {
                if (!current.includes(value)) {
                    finalValue = [...current, value];
                } else {
                    finalValue = current;
                }
            } else {
                finalValue = current.filter((v) => v !== value);
            }
            setNestedValue(fullPath, finalValue);
        } else {
            // For dropdown and options changes, cleanup all other option fields
            const previousValue = getNestedValue(fullPath);

            // First set the new value
            setNestedValue(fullPath, value);

            // Then cleanup other options if this is a dropdown/options field with nested values
            if (previousValue !== value) {
                console.log(`Field "${fullPath}" changed from "${previousValue}" to "${value}"`);

                // Find the configuration for this field to get its values
                const findConfigForPath = (configs, targetPath, currentPath = '') => {
                    for (const config of configs) {
                        const currentConfigPath = currentPath ? `${currentPath}.${config.name}` : config.name;
                        if (currentConfigPath === targetPath) {
                            return config;
                        }
                        if (config.values && Array.isArray(config.values)) {
                            for (const val of config.values) {
                                if (val.values && Array.isArray(val.values)) {
                                    const nestedPath = `${currentConfigPath}.${val.name}`;
                                    const found = findConfigForPath(val.values, targetPath, nestedPath);
                                    if (found) return found;
                                }
                            }
                        }
                    }
                    return null;
                };

                const config = findConfigForPath(keymanagerConnectorConfigurations, fullPath);
                if (config && config.values) {
                    console.log(`Found config for "${fullPath}", cleaning up all other options except "${value}"`);
                    cleanupAllOtherOptions(fullPath, value, config.values);
                } else {
                    console.log(`No config found for path "${fullPath}"`);
                }
            }
        }
    };

    useEffect(() => {
        const initializeDefaults = (configs, parentPath = '') => {
            configs.forEach((config) => {
                const { name, default: defaultVal, values = [] } = config;
                const configPath = parentPath ? `${parentPath}.${name}` : name;

                if (defaultVal !== undefined && getNestedValue(configPath) === '') {
                    setNestedValue(configPath, defaultVal);
                }

                // Recursively initialize nested configs
                if (Array.isArray(values) && values.length > 0) {
                    values.forEach((value) => {
                        if (value.values && Array.isArray(value.values)) {
                            initializeDefaults(value.values, configPath);
                        }
                    });
                }
            });
        };

        initializeDefaults(keymanagerConnectorConfigurations);
    }, [keymanagerConnectorConfigurations, additionalProperties, setAdditionalProperties]);

    const onChangeCheckBox = (e, configPath = null) => {
        const fullPath = configPath ? `${configPath}.${e.target.name}` : e.target.name;
        setNestedValue(fullPath, e.target.checked);
    };

    // Helper function to check if a specific field has validation errors
    const hasFieldError = (configPath, value, required, isValidating) => {
        if (!isValidating || !required) {
            return false;
        }

        // Check if value is empty
        const isValueEmpty = value === null || value === undefined || value === ''
            || (Array.isArray(value) && value.length === 0);

        if (isValueEmpty) {
            return 'Required field is empty.';
        }

        return false;
    };

    const getComponent = (config, parentPath = '') => {
        const {
            name, label, type, values = [], tooltip, required, mask, default: defaultVal,
        } = config;

        const configPath = parentPath ? `${parentPath}.${name}` : name;
        const value = type === 'certificate' ? (additionalProperties?.certificates
            || { type: 'PEM', value: '' }) : getNestedValue(configPath, defaultVal || '');
        const error = hasFieldError(configPath, value, required, validating);

        const selectedObject = values.find((v) => v.name === value);

        const renderSelectedChildren = (parent, currentPath) => parent?.values?.map((child) => (
            <Box key={child.name} ml={2} mt={2}>
                {getComponent(child, currentPath)}
            </Box>
        ));

        if (type === 'input') {
            if (mask) {
                return (
                    <FormControl fullWidth>
                        <CustomInputField
                            value={value}
                            onChange={(e) => onChange(e, parentPath)}
                            name={name}
                            label={label}
                            required={required}
                            hasErrors={hasErrors}
                            validating={validating}
                        />
                        <FormHelperText>
                            {error || tooltip}
                        </FormHelperText>
                    </FormControl>
                );
            }
            return (
                <TextField
                    id={name}
                    margin='dense'
                    name={name}
                    label={(
                        <span>
                            {label}
                            {required && <StyledSpan>*</StyledSpan>}
                        </span>
                    )}
                    fullWidth
                    variant='outlined'
                    value={value}
                    defaultValue={defaultVal}
                    error={Boolean(error)}
                    helperText={error || tooltip}
                    onChange={(e) => onChange(e, parentPath)}
                />
            );
        }

        if (type === 'select') {
            return (
                <FormControl component='fieldset' error={Boolean(error)} sx={{ width: '100%' }}>
                    <FormLabel component='legend'>
                        <span>
                            {label}
                            {required && <StyledSpan>*</StyledSpan>}
                        </span>
                    </FormLabel>
                    <FormGroup>
                        {values.map((selection) => {
                            const selectionName = typeof selection === 'string' ? selection : selection.name;
                            const selectionLabel = typeof selection === 'string' ? selection : selection.label;
                            const isChecked = Array.isArray(value) ? value.includes(selectionName) : false;
                            const hasChildren = typeof selection === 'object' && Array.isArray(selection.values)
                                && selection.values.length > 0;

                            return (
                                <Box key={selectionName} ml={1} mt={1}>
                                    <FormControlLabel
                                        control={(
                                            <Checkbox
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const current = Array.isArray(value) ? [...value] : [];
                                                    let updated;
                                                    if (e.target.checked) {
                                                        updated = current.includes(selectionName)
                                                            ? current
                                                            : [...current, selectionName];
                                                    } else {
                                                        updated = current.filter((v) => v !== selectionName);
                                                    }
                                                    setNestedValue(configPath, updated);
                                                }}
                                                value={selectionName}
                                                color='primary'
                                                name={name}
                                            />
                                        )}
                                        label={selectionLabel}
                                    />
                                    {hasChildren && isChecked && (
                                        <Box ml={3}>
                                            {selection.values.map((child) => (
                                                <Box key={child.name} mt={1}>
                                                    {getComponent(child, `${configPath}.${selectionName}`)}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </FormGroup>
                    <FormHelperText>{error || tooltip}</FormHelperText>
                </FormControl>
            );
        }

        if (type === 'dropdown') {
            return (
                <Box>
                    <FormLabel>
                        {label}
                        {required && <StyledSpan>*</StyledSpan>}
                    </FormLabel>
                    <TextField
                        select
                        fullWidth
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e, parentPath)}
                        variant='outlined'
                        error={Boolean(error)}
                        helperText={error || tooltip}
                        margin='dense'
                    >
                        {values.map((option) => (
                            <MenuItem key={option.name} value={option.name}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    {selectedObject?.values?.length > 0
                        && renderSelectedChildren(selectedObject, `${configPath}.${value}`)}
                </Box>
            );
        }

        if (type === 'options') {
            return (
                <FormControl component='fieldset' error={Boolean(error)}>
                    <FormLabel component='legend'>
                        {label}
                        {required && <StyledSpan>*</StyledSpan>}
                    </FormLabel>
                    <RadioGroup
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e, parentPath)}
                    >
                        {values.map((option) => {
                            const hasChildren = Array.isArray(option.values) && option.values.length > 0;
                            return (
                                <Box key={option.name} ml={1} mt={1}>
                                    {option.tooltip && (
                                        <FormHelperText>
                                            {option.tooltip}
                                        </FormHelperText>
                                    )}
                                    <FormControlLabel
                                        value={option.name}
                                        control={<Radio />}
                                        label={option.label}
                                    />
                                    {hasChildren && value === option.name && (
                                        <Box ml={3}>
                                            {option.values.map((child) => (
                                                <Box key={child.name} mt={1}>
                                                    {getComponent(child, `${configPath}.${value}`)}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </RadioGroup>
                    <FormHelperText>{error || tooltip}</FormHelperText>
                </FormControl>
            );
        }

        if (type === 'certificate') {
            return (
                <FormControl component='fieldset' error={Boolean(error)} fullWidth sx={{ width: '100%' }}>
                    <FormLabel component='legend'>
                        {label}
                        {required && <StyledSpan>*</StyledSpan>}
                    </FormLabel>
                    <Box sx={{ width: '100%' }}>
                        <Certificates
                            fieldName='tenantWideCertificates'
                            tenantWideCertificates={tenantWideCertificates}
                            dispatch={dispatch}
                            isJwksNeeded={false}
                        />
                    </Box>
                </FormControl>
            );
        }

        if (type === 'checkbox') {
            return (
                <FormControl component='fieldset'>
                    <FormLabel component='legend'>{label}</FormLabel>
                    <FormGroup>
                        {values.length > 0 ? (
                            values.map((selection) => (
                                <FormControlLabel
                                    key={selection}
                                    control={(
                                        <Checkbox
                                            checked={value === true}
                                            onChange={(e) => onChangeCheckBox(e, parentPath)}
                                            name={name}
                                        />
                                    )}
                                    label={selection}
                                />
                            ))
                        ) : (
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={value === true}
                                        onChange={(e) => onChangeCheckBox(e, parentPath)}
                                        name={name}
                                    />
                                )}
                                label={label}
                            />
                        )}
                    </FormGroup>
                </FormControl>
            );
        }
        if (type === 'labelOnly') {
            return null; // Don't render a text field
        }

        return (
            <TextField
                id={name}
                margin='dense'
                name={name}
                label={label}
                fullWidth
                variant='outlined'
                value={value}
                defaultValue={defaultVal}
                onChange={(e) => onChange(e, parentPath)}
            />
        );
    };

    // Manual cleanup utility function (useful for debugging)
    const manualCleanupOrphanedKeys = () => {
        console.log('Starting manual cleanup of orphaned keys...');
        console.log('Current additionalProperties:', additionalProperties);

        const clonedAdditionalProperties = cloneDeep(additionalProperties);
        let hasChanges = false;

        // Get all keys that have dot notation (nested keys)
        const nestedKeys = Object.keys(clonedAdditionalProperties).filter((key) => key.includes('.'));

        // Group by parent path
        const groupedKeys = {};
        nestedKeys.forEach((key) => {
            const parts = key.split('.');
            if (parts.length >= 2) {
                const parentPath = parts.slice(0, -1).join('.');
                if (!groupedKeys[parentPath]) {
                    groupedKeys[parentPath] = [];
                }
                groupedKeys[parentPath].push(key);
            }
        });

        // For each group, check if the parent value still matches
        Object.keys(groupedKeys).forEach((parentPath) => {
            const parentValue = getNestedValue(parentPath);
            if (parentValue) {
                // Check if any keys don't match the current parent value
                const keysToCheck = groupedKeys[parentPath];
                keysToCheck.forEach((key) => {
                    const keyParts = key.split('.');
                    if (keyParts.length >= 2) {
                        const expectedParentValue = keyParts[keyParts.length - 2];
                        if (expectedParentValue !== parentValue) {
                            console.log(`Orphaned key found: ${key} (parent: ${parentPath},
                                expected: ${expectedParentValue}, actual: ${parentValue})`);
                            delete clonedAdditionalProperties[key];
                            hasChanges = true;
                        }
                    }
                });
            }
        });

        if (hasChanges) {
            console.log('Cleaned up additionalProperties:', clonedAdditionalProperties);
            setAdditionalProperties('', clonedAdditionalProperties, null, false, true);
        } else {
            console.log('No orphaned keys found');
        }
    };

    // Expose the cleanup function globally for debugging (remove in production)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.manualCleanupKeyManager = manualCleanupOrphanedKeys;
        }
    }, [manualCleanupOrphanedKeys]);

    return keymanagerConnectorConfigurations.map((config) => (
        <Box mb={3} key={config.name}>
            {getComponent(config)}
        </Box>
    ));
}

KeyManagerConfiguration.defaultProps = {
    keymanagerConnectorConfigurations: [],
    required: false,
    helperText: (
        <FormattedMessage
            id='KeyManager.Connector.Configuration.Helper.text'
            defaultMessage='Add Key Manager Connector Configurations'
        />
    ),
    hasErrors: () => {},
    validating: false,
};
