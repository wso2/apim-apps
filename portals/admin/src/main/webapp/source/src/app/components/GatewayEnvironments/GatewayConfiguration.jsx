import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import CustomInputField from 'AppComponents/GatewayEnvironments/CustomInputField';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

// Styled wrapper to mimic TextField's outlined style
const StyledFormControl = styled(FormControl)(({ theme }) => ({
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '100%',
    '&:hover': {
        borderColor: theme.palette.text.primary,
    },
    '&.Mui-focused': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
    },
}));

/**
 * @export
 * @param {*} props
 * @returns {React.Component}
 */
/**
 * Gateway Connector configuration
 * @param {JSON} props props passed from parents.
 * @returns {JSX} gateway agent connection configuration form.
 */
export default function GatewayConfiguration(props) {
    const {
        gatewayConfigurations, additionalProperties, setAdditionalProperties, gatewayId,
        hasErrors, validating,
    } = props;

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

        const currentConfig = findConfigRecursively(gatewayConfigurations);

        // Clear unused nested properties if this is a dropdown/options/select field
        if (currentConfig && (
            currentConfig.type === 'dropdown'
            || currentConfig.type === 'options'
            || currentConfig.type === 'select')) {
            clearUnusedProperties(currentConfig, finalValue);
        }

        setAdditionalProperties(name, finalValue);
    };

    // Clear properties that are no longer valid when configuration structure changes
    useEffect(() => {
        if (!gatewayConfigurations || gatewayConfigurations.length === 0) {
            return;
        }

        // Get all valid property names from current configuration structure
        const currentValidProperties = getAllNestedPropertyNames(gatewayConfigurations);

        // Clear any properties in additionalProperties that are not in the current valid set
        Object.keys(additionalProperties).forEach((propName) => {
            if (!currentValidProperties.includes(propName)) {
                setAdditionalProperties(propName, undefined);
            }
        });

        // Clear nested properties that don't match current selections
        gatewayConfigurations.forEach((config) => {
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
    }, [gatewayConfigurations, additionalProperties]);

    const getComponent = (gatewayConfiguration) => {
        let value = '';
        const disabled = Boolean(gatewayConfiguration.updateDisabled && gatewayId);
        if (additionalProperties[gatewayConfiguration.name]) {
            value = additionalProperties[gatewayConfiguration.name];
        } else if (!gatewayId && (gatewayConfiguration.default
                || gatewayConfiguration.defaultValue)) {
            const defaultVal = gatewayConfiguration.default
                || gatewayConfiguration.defaultValue;
            if (typeof defaultVal === 'string'
                && ['input', 'select', 'options', 'dropdown'].includes(gatewayConfiguration.type)
            ) {
                onChange({
                    target: {
                        name: gatewayConfiguration.name,
                        value: defaultVal,
                        type: gatewayConfiguration.type,
                    },
                });
            }
        }
        if (gatewayConfiguration.type === 'input') {
            if (gatewayConfiguration.mask) {
                return (
                    <FormControl variant='outlined' fullWidth disabled={disabled}>
                        <InputLabel sx={{ bgcolor: 'white' }}>
                            {gatewayConfiguration.label}
                            {gatewayConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </InputLabel>
                        <CustomInputField
                            value={value}
                            onChange={onChange}
                            name={gatewayConfiguration.name}
                            required={gatewayConfiguration.required}
                            hasErrors={hasErrors}
                            validating={validating}
                        />
                        <FormHelperText>
                            {hasErrors('gatewayConfig', value, validating) || gatewayConfiguration.tooltip}
                        </FormHelperText>
                    </FormControl>
                );
            }
            return (
                <TextField
                    id={gatewayConfiguration.name}
                    margin='dense'
                    name={gatewayConfiguration.name}
                    label={(
                        <span>
                            {gatewayConfiguration.label}
                            {gatewayConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    )}
                    fullWidth
                    error={gatewayConfiguration.required && hasErrors('gatewayConfig', value, validating)}
                    helperText={hasErrors('gatewayConfig', value, validating) || gatewayConfiguration.tooltip}
                    variant='outlined'
                    value={value}
                    defaultValue={
                        gatewayConfiguration.default
                        || gatewayConfiguration.defaultValue
                    }
                    onChange={onChange}
                    disabled={disabled}
                />
            );
        } else if (gatewayConfiguration.type === 'options') {
            return (
                <StyledFormControl component='fieldset'>
                    <FormControl variant='standard' component='fieldset' disabled={disabled}>
                        <FormLabel component='legend'>
                            <span>
                                {gatewayConfiguration.label}
                                {gatewayConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                            </span>
                        </FormLabel>
                        <RadioGroup
                            row
                            aria-label={gatewayConfiguration.label}
                            name={gatewayConfiguration.name}
                            value={value}
                            onChange={onChange}
                            sx={{ width: '100%' }}
                        >
                            {gatewayConfiguration.values.map((selection) => {
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
                </StyledFormControl>
            );
        } else {
            return (
                <TextField
                    id={gatewayConfiguration.name}
                    margin='dense'
                    name={gatewayConfiguration.name}
                    label={gatewayConfiguration.label}
                    fullWidth
                    required
                    helperText={gatewayConfiguration.tooltip}
                    variant='outlined'
                    value={value}
                    defaultValue={gatewayConfiguration.default || gatewayConfiguration.defaultValue}
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
            {renderConfigurations(gatewayConfigurations)}
        </div>
    );
}
GatewayConfiguration.defaultProps = {
    gatewayConfigurations: [],
    required: false,
    helperText: <FormattedMessage
        id='Gateway.Configuration.Helper.text'
        defaultMessage='Add Gateway Connector Configurations'
    />,
    hasErrors: () => {},
    validating: false,
};
