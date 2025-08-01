import React, {
    useEffect, useReducer, useCallback, useMemo,
} from 'react';
import { styled } from '@mui/material/styles';
import {
    TextField,
    Checkbox,
    FormControlLabel,
    Box,
    FormLabel,
    FormControl,
    FormGroup,
    Radio,
    RadioGroup,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import PropTypes from 'prop-types';
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
        onValidationFunctionReady, // New prop to expose validation function
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

    // Helper function to get value from flat additionalProperties using field name as key
    const getValue = useCallback((fieldName, defaultValue = '') => {
        if (!fieldName || !additionalProperties) return defaultValue;
        return additionalProperties[fieldName] !== undefined ? additionalProperties[fieldName] : defaultValue;
    }, [additionalProperties]);

    // Helper function to set value in flat additionalProperties using field name as key
    const setValue = useCallback((fieldName, value) => {
        if (!fieldName) return;

        // If value is empty (null, undefined, empty string, or empty array), remove the key
        const isEmptyValue = value === null || value === undefined || value === ''
            || (Array.isArray(value) && value.length === 0);

        if (isEmptyValue) {
            setAdditionalProperties(fieldName, '', null, true); // Pass true to indicate removal
        } else {
            setAdditionalProperties(fieldName, value);
        }
    }, [setAdditionalProperties]);

    // Helper function to collect all currently rendered/visible field names
    const collectVisibleFields = useCallback((configs, visibleFields = new Set()) => {
        if (!configs || !Array.isArray(configs)) return visibleFields;

        configs.forEach((config) => {
            if (!config || typeof config !== 'object') return;

            const {
                name, type, values = [],
            } = config;

            if (!name) return; // Skip if no name

            // Always add the current field
            visibleFields.add(name);

            // For dropdown/options/select types, check which child fields are visible
            if (type === 'dropdown' || type === 'options') {
                const selectedValue = getValue(name);
                if (selectedValue) {
                    const selectedOption = values.find((option) => option && option.name === selectedValue);
                    if (selectedOption?.values && Array.isArray(selectedOption.values)) {
                        collectVisibleFields(selectedOption.values, visibleFields);
                    }
                }
            } else if (type === 'select') {
                const selectedValues = getValue(name);
                if (Array.isArray(selectedValues)) {
                    selectedValues.forEach((selectedValue) => {
                        if (!selectedValue) return;
                        const selectedOption = values.find((option) => (
                            typeof option === 'string' ? option : option?.name
                        ) === selectedValue);
                        if (selectedOption?.values && Array.isArray(selectedOption.values)) {
                            collectVisibleFields(selectedOption.values, visibleFields);
                        }
                    });
                }
            }
        });

        return visibleFields;
    }, [getValue]);

    // Helper function to clean up fields that are no longer visible
    const cleanupInvisibleFields = useCallback((previousVisibleFields, currentVisibleFields) => {
        if (!previousVisibleFields || !currentVisibleFields) return;

        const fieldsToRemove = [];

        // Find fields that were visible before but are not visible now
        previousVisibleFields.forEach((fieldName) => {
            if (fieldName && !currentVisibleFields.has(fieldName)) {
                fieldsToRemove.push(fieldName);
            }
        });

        // Remove invisible fields from additionalProperties
        if (fieldsToRemove.length > 0) {
            console.log('Cleaning up invisible fields:', fieldsToRemove);
            const updatedProperties = {
                ...additionalProperties,
            };
            fieldsToRemove.forEach((fieldName) => {
                delete updatedProperties[fieldName];
            });
            setAdditionalProperties('', updatedProperties, null, false, true);
        }
    }, [additionalProperties, setAdditionalProperties]);

    const onChange = useCallback((e) => {
        const {
            name, value, type, checked,
        } = e.target;

        if (type === 'checkbox') {
            const current = Array.isArray(getValue(name)) ? [...getValue(name)] : [];
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
            setValue(name, finalValue);
        } else {
            const previousValue = getValue(name);

            // Set the new value
            setValue(name, value);

            // If this is a field that can have children (dropdown/options), clean up invisible fields
            if (previousValue !== value) {
                // Get current visible fields before the change
                const previousVisibleFields = collectVisibleFields(keymanagerConnectorConfigurations);

                // Update the value first, then get new visible fields
                setTimeout(() => {
                    const currentVisibleFields = collectVisibleFields(keymanagerConnectorConfigurations);
                    cleanupInvisibleFields(previousVisibleFields, currentVisibleFields);
                }, 0);
            }
        }
    }, [
        getValue,
        setValue,
        collectVisibleFields,
        cleanupInvisibleFields,
        keymanagerConnectorConfigurations,
    ]);
    useEffect(() => {
        const initializeDefaults = (configs) => {
            if (!configs || !Array.isArray(configs)) return;

            configs.forEach((config) => {
                if (!config || !config.name) return;

                const {
                    name, default: defaultVal, values = [],
                } = config;

                if (defaultVal !== undefined && getValue(name) === '') {
                    setValue(name, defaultVal);
                }

                // Recursively initialize nested configs for selected values
                if (Array.isArray(values) && values.length > 0) {
                    const currentValue = getValue(name);

                    if (config.type === 'dropdown' || config.type === 'options') {
                        // For dropdown/options, only initialize children of selected option
                        if (currentValue) {
                            const selectedOption = values.find((option) => option && option.name === currentValue);
                            if (selectedOption?.values && Array.isArray(selectedOption.values)) {
                                initializeDefaults(selectedOption.values);
                            }
                        }
                    } else if (config.type === 'select') {
                        // For multi-select, initialize children of all selected options
                        if (Array.isArray(currentValue)) {
                            currentValue.forEach((selectedValue) => {
                                if (!selectedValue) return;
                                const selectedOption = values.find((option) => (
                                    typeof option === 'string' ? option : option?.name
                                ) === selectedValue);
                                if (selectedOption?.values && Array.isArray(selectedOption.values)) {
                                    initializeDefaults(selectedOption.values);
                                }
                            });
                        }
                    }
                }
            });
        };

        initializeDefaults(keymanagerConnectorConfigurations);
    }, [keymanagerConnectorConfigurations, getValue, setValue]);

    const onChangeCheckBox = useCallback((e) => {
        setValue(e.target.name, e.target.checked);
    }, [setValue]);

    // Helper function to check if a specific field has validation errors
    // Only validates fields that are currently visible/rendered
    const hasFieldError = useCallback((fieldName, value, required, isValidating) => {
        if (!isValidating || !required || !fieldName) {
            return false;
        }

        // Check if this field is currently visible
        const visibleFields = collectVisibleFields(keymanagerConnectorConfigurations);
        if (!visibleFields.has(fieldName)) {
            return false; // Don't validate invisible fields
        }

        // Check if value is empty
        const isValueEmpty = value === null || value === undefined || value === ''
            || (Array.isArray(value) && value.length === 0);

        if (isValueEmpty) {
            return 'Required field is empty.';
        }

        return false;
    }, [collectVisibleFields, keymanagerConnectorConfigurations]);

    // Function to validate all currently visible required fields
    const validateVisibleFields = useCallback(() => {
        const visibleFields = collectVisibleFields(keymanagerConnectorConfigurations);
        const errors = [];

        const validateConfigFields = (configs) => {
            if (!configs || !Array.isArray(configs)) return;

            configs.forEach((config) => {
                if (!config || typeof config !== 'object') return;

                const {
                    name, required, values = [], type,
                } = config;

                if (!name) return; // Skip if no name

                if (visibleFields.has(name) && required) {
                    const value = getValue(name);
                    const error = hasFieldError(name, value, required, true);
                    if (error) {
                        errors.push({
                            field: name, error,
                        });
                    }
                }

                // Recursively validate visible child fields
                if (type === 'dropdown' || type === 'options') {
                    const selectedValue = getValue(name);
                    if (selectedValue) {
                        const selectedOption = values.find((option) => option && option.name === selectedValue);
                        if (selectedOption?.values && Array.isArray(selectedOption.values)) {
                            validateConfigFields(selectedOption.values);
                        }
                    }
                } else if (type === 'select') {
                    const selectedValues = getValue(name);
                    if (Array.isArray(selectedValues)) {
                        selectedValues.forEach((selectedValue) => {
                            if (!selectedValue) return;
                            const selectedOption = values.find((option) => (
                                typeof option === 'string' ? option : option?.name
                            ) === selectedValue);
                            if (selectedOption?.values && Array.isArray(selectedOption.values)) {
                                validateConfigFields(selectedOption.values);
                            }
                        });
                    }
                }
            });
        };

        validateConfigFields(keymanagerConnectorConfigurations);
        return errors;
    }, [collectVisibleFields, keymanagerConnectorConfigurations, getValue, hasFieldError]);

    const getComponent = useCallback((config) => {
        if (!config || typeof config !== 'object') {
            return null;
        }

        const {
            name, label, type, values = [], tooltip, required, mask, default: defaultVal,
        } = config;

        if (!name) return null; // Skip if no name

        const value = type === 'certificate' ? (additionalProperties?.certificates
            || { type: 'PEM', value: '' }) : getValue(name, defaultVal || '');
        const error = hasFieldError(name, value, required, validating);

        const selectedObject = values.find((v) => v && v.name === value);

        const renderSelectedChildren = (parent) => {
            if (!parent?.values || !Array.isArray(parent.values)) return null;
            return parent.values.map((child) => (
                <Box key={child.name || Math.random()} ml={2} mt={2}>
                    {getComponent(child)}
                </Box>
            ));
        };

        if (type === 'input') {
            if (mask) {
                return (
                    <FormControl fullWidth>
                        <CustomInputField
                            value={value}
                            onChange={onChange}
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
                    onChange={onChange}
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
                                                    setValue(name, updated);
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
                                                    {getComponent(child)}
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
                        onChange={onChange}
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
                        && renderSelectedChildren(selectedObject)}
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
                        onChange={onChange}
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
                                                    {getComponent(child)}
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
                                            onChange={onChangeCheckBox}
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
                                        onChange={onChangeCheckBox}
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
                onChange={onChange}
            />
        );
    }, [
        getValue,
        hasFieldError,
        validating,
        onChange,
        onChangeCheckBox,
        setValue,
        additionalProperties,
        tenantWideCertificates,
        dispatch,
    ]);

    // Expose validation function to parent component
    useEffect(() => {
        if (onValidationFunctionReady) {
            onValidationFunctionReady(validateVisibleFields);
        }
        // Also expose globally for debugging (can be removed in production)
        if (typeof window !== 'undefined') {
            window.validateKeyManagerFields = validateVisibleFields;
            window.getVisibleKeyManagerFields = () => collectVisibleFields(keymanagerConnectorConfigurations);
        }
    }, [
        validateVisibleFields,
        onValidationFunctionReady,
        collectVisibleFields,
        keymanagerConnectorConfigurations,
    ]);

    const renderedComponents = useMemo(() => {
        if (!keymanagerConnectorConfigurations || !Array.isArray(keymanagerConnectorConfigurations)) {
            return null;
        }
        return keymanagerConnectorConfigurations.map((config) => {
            if (!config || !config.name) return null;
            return (
                <Box mb={3} key={config.name}>
                    {getComponent(config)}
                </Box>
            );
        }).filter(Boolean);
    }, [keymanagerConnectorConfigurations, getComponent]);

    return renderedComponents;
}

KeyManagerConfiguration.propTypes = {
    keymanagerConnectorConfigurations: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
            label: PropTypes.string,
            required: PropTypes.bool,
            values: PropTypes.arrayOf(PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    name: PropTypes.string,
                    label: PropTypes.string,
                    values: PropTypes.arrayOf(PropTypes.oneOfType([
                        PropTypes.string,
                        PropTypes.number,
                        PropTypes.bool,
                        PropTypes.shape({}),
                    ])),
                }),
            ])),
        }),
    ),
    additionalProperties: PropTypes.shape({}),
    setAdditionalProperties: PropTypes.func.isRequired,
    hasErrors: PropTypes.func,
    validating: PropTypes.bool,
    onValidationFunctionReady: PropTypes.func,
};

KeyManagerConfiguration.defaultProps = {
    keymanagerConnectorConfigurations: [],
    additionalProperties: {},
    required: false,
    helperText: (
        <FormattedMessage
            id='KeyManager.Connector.Configuration.Helper.text'
            defaultMessage='Add Key Manager Connector Configurations'
        />
    ),
    hasErrors: () => {},
    validating: false,
    onValidationFunctionReady: null,
};
