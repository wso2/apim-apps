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
import CustomGatewayInputField from 'AppComponents/GatewayEnvironments/CustomGatewayInputField';

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

    const getAllNestedGatewayConfigPropertyNames = (connectorConfigurations, parentKey = '') => {
        const gatewayConfigPropertyNames = [];

        connectorConfigurations.forEach((connectorConfig) => {
            const connectorConfigKey = parentKey ? `${parentKey}.${connectorConfig.name}` : connectorConfig.name;
            gatewayConfigPropertyNames.push(connectorConfig.name);

            if (connectorConfig.values && connectorConfig.values.length > 0) {
                connectorConfig.values.forEach((value) => {
                    if (typeof value === 'object' && value.values) {
                        gatewayConfigPropertyNames.push(...getAllNestedGatewayConfigPropertyNames(
                            value.values, connectorConfigKey,
                        ));
                    }
                });
            }
        });

        return gatewayConfigPropertyNames;
    };

    const getNestedConnectorConfigurations = (parentConnectorConfig, selectedConfigValue) => {
        if (!parentConnectorConfig.values || !selectedConfigValue) return [];

        const selectedConfigOption = parentConnectorConfig.values.find((option) => {
            if (typeof option === 'string') {
                return option === selectedConfigValue;
            }
            return option.name === selectedConfigValue;
        });

        if (!selectedConfigOption || !selectedConfigOption.values) return [];

        return selectedConfigOption.values;
    };

    const clearUnusedGatewayConfigProperties = (parentConnectorConfig, newConfigValue) => {
        if (!parentConnectorConfig.values || !parentConnectorConfig.values.length) return;

        const allPossibleConfigProperties = [];
        parentConnectorConfig.values.forEach((option) => {
            if (typeof option === 'object' && option.values) {
                allPossibleConfigProperties.push(...getAllNestedGatewayConfigPropertyNames(option.values));
            }
        });

        const currentlyVisibleConfigProperties = [];
        const currentNestedGatewayConfigs = getNestedConnectorConfigurations(parentConnectorConfig, newConfigValue);
        if (currentNestedGatewayConfigs.length > 0) {
            currentlyVisibleConfigProperties.push(...getAllNestedGatewayConfigPropertyNames(
                currentNestedGatewayConfigs,
            ));
        }

        const configPropertiesToClear = allPossibleConfigProperties.filter(
            (prop) => !currentlyVisibleConfigProperties.includes(prop),
        );

        configPropertiesToClear.forEach((propName) => {
            if (additionalProperties[propName] !== undefined) {
                setAdditionalProperties(propName, undefined);
            }
        });
    };

    const onChange = (e) => {
        let finalConfigValue;
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            if (additionalProperties[name]) {
                finalConfigValue = additionalProperties[name];
            } else {
                finalConfigValue = [];
            }
            if (e.target.checked) {
                finalConfigValue.push(value);
            } else {
                const newValue = finalConfigValue.filter((v) => v !== e.target.value);
                finalConfigValue = newValue;
            }
        } else {
            finalConfigValue = value;
        }

        const findConnectorConfigRecursively = (connectorConfigs) => {
            for (const connectorConfig of connectorConfigs) {
                if (connectorConfig.name === name) return connectorConfig;
                if (connectorConfig.values && connectorConfig.values.length > 0) {
                    for (const val of connectorConfig.values) {
                        if (typeof val === 'object' && val.values) {
                            const found = findConnectorConfigRecursively(val.values);
                            if (found) return found;
                        }
                    }
                }
            }
            return null;
        };

        const currentConnectorConfig = findConnectorConfigRecursively(gatewayConfigurations);

        if (currentConnectorConfig && (
            currentConnectorConfig.type === 'dropdown'
            || currentConnectorConfig.type === 'options'
            || currentConnectorConfig.type === 'select')) {
            clearUnusedGatewayConfigProperties(currentConnectorConfig, finalConfigValue);
        }

        setAdditionalProperties(name, finalConfigValue);
    };

    // Clear properties that are no longer valid when configuration structure changes
    useEffect(() => {
        if (!gatewayConfigurations || gatewayConfigurations.length === 0) {
            return;
        }

        // Get all valid property names from current configuration structure
        const currentValidProperties = getAllNestedGatewayConfigPropertyNames(gatewayConfigurations);

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
                    clearUnusedGatewayConfigProperties(config, currentValue);
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
                        <CustomGatewayInputField
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

    const renderConnectorConfigurations = (connectorConfigurations, parentKey = '') => {
        return connectorConfigurations.map((connectorConfig) => {
            const connectorConfigKey = parentKey ? `${parentKey}.${connectorConfig.name}` : connectorConfig.name;

            const hasNestedConnectorConfigurations = connectorConfig.values && connectorConfig.values.length > 0
                && connectorConfig.values.some((value) => typeof value === 'object' && value.values);

            return (
                <Box key={`${connectorConfigKey}`} mb={3}>
                    {getComponent(connectorConfig)}
                    {hasNestedConnectorConfigurations && additionalProperties[connectorConfig.name] && (
                        <Box ml={2} mt={2}>
                            {renderConnectorConfigurations(
                                getNestedConnectorConfigurations(
                                    connectorConfig,
                                    additionalProperties[connectorConfig.name],
                                ),
                                connectorConfigKey,
                            )}
                        </Box>
                    )}
                </Box>
            );
        });
    };

    return (
        <div>
            {renderConnectorConfigurations(gatewayConfigurations)}
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
