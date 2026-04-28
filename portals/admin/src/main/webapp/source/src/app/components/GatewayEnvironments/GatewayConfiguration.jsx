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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomGatewayInputField from 'AppComponents/GatewayEnvironments/CustomGatewayInputField';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));
const PLAN_MAPPING_PROPERTY_PREFIX = 'plan_mapping.';

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
        gatewayConfigurations, additionalProperties = {}, setAdditionalProperties = () => {}, gatewayId,
        hasErrors, validating, isReadOnly = false,
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
            if (
                !currentValidProperties.includes(propName)
                && !propName.startsWith(PLAN_MAPPING_PROPERTY_PREFIX)
            ) {
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

    const getMappingComponent = (gatewayConfiguration) => {
        const leftLabel = gatewayConfiguration?.labels?.left || 'Key';
        const rightLabel = gatewayConfiguration?.labels?.right || gatewayConfiguration.label || 'Value';
        const values = Array.isArray(gatewayConfiguration.values) ? gatewayConfiguration.values : [];
        const groupedValues = values.reduce((groups, mappingValue) => {
            if (!mappingValue || typeof mappingValue !== 'object' || !mappingValue.id) {
                return groups;
            }
            const apiType = mappingValue.apiType || 'other';
            return {
                ...groups,
                [apiType]: [...(groups[apiType] || []), mappingValue],
            };
        }, {});
        const apiTypeOrder = ['rest', 'async', 'ai-api', 'other'];
        const apiTypeLabels = {
            rest: (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.apiType.rest'
                    defaultMessage='REST APIs'
                />
            ),
            async: (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.apiType.async'
                    defaultMessage='Async APIs'
                />
            ),
            'ai-api': (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.apiType.ai'
                    defaultMessage='AI APIs'
                />
            ),
            other: (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.apiType.other'
                    defaultMessage='Other APIs'
                />
            ),
        };
        const orderedApiTypes = [
            ...apiTypeOrder.filter((apiType) => groupedValues[apiType]?.length > 0),
            ...Object.keys(groupedValues).filter((apiType) => !apiTypeOrder.includes(apiType)),
        ];
        const getPlanMappingValue = (localPolicyId) => {
            return additionalProperties[`${PLAN_MAPPING_PROPERTY_PREFIX}${localPolicyId}`] || '';
        };

        return (
            <Box mt={1}>
                <Box display='flex' alignItems='center' mb={1}>
                    {gatewayConfiguration.label && (
                        <FormLabel component='legend'>{gatewayConfiguration.label}</FormLabel>
                    )}
                    {gatewayConfiguration.tooltip && (
                        <Tooltip title={gatewayConfiguration.tooltip} placement='right-end' interactive>
                            <HelpOutline fontSize='small' sx={{ ml: 0.5 }} />
                        </Tooltip>
                    )}
                </Box>
                {orderedApiTypes.length === 0 ? (
                    <FormHelperText>
                        <FormattedMessage
                            id='GatewayEnvironments.PlanMapping.noCompatibleLocalPlans'
                            defaultMessage='No local subscription plans match the supported API types of this gateway.'
                        />
                    </FormHelperText>
                ) : orderedApiTypes.map((apiType) => (
                    <Box key={apiType} mb={2}>
                        <Box fontWeight={500} mb={1}>
                            {apiTypeLabels[apiType] || apiType}
                        </Box>
                        <Box
                            display='grid'
                            gridTemplateColumns='minmax(0, 1fr) minmax(0, 1fr)'
                            columnGap={2}
                            rowGap={1.5}
                        >
                            <Box fontWeight={500}>{leftLabel}</Box>
                            <Box fontWeight={500}>{rightLabel}</Box>
                            {groupedValues[apiType].map((mappingValue) => (
                                <React.Fragment key={mappingValue.id}>
                                    <Box display='flex' alignItems='center' minHeight={56}>
                                        {mappingValue.label || mappingValue.id}
                                    </Box>
                                    <TextField
                                        id={`${gatewayConfiguration.name}.${mappingValue.id}`}
                                        margin='dense'
                                        name={mappingValue.id}
                                        fullWidth
                                        variant='outlined'
                                        value={getPlanMappingValue(mappingValue.id)}
                                        onChange={(event) => setAdditionalProperties(
                                            `${PLAN_MAPPING_PROPERTY_PREFIX}${mappingValue.id}`,
                                            event.target.value || undefined,
                                        )}
                                        disabled={isReadOnly}
                                    />
                                </React.Fragment>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    };

    const getComponent = (gatewayConfiguration) => {
        let value = '';
        const disabled = isReadOnly || Boolean(gatewayConfiguration.updateDisabled && gatewayId);
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
        if (gatewayConfiguration.type === 'mapping') {
            return getMappingComponent(gatewayConfiguration);
        } else if (gatewayConfiguration.type === 'input') {
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

    const regularConfigurations = gatewayConfigurations.filter((config) => config.type !== 'mapping');
    const mappingConfigurations = gatewayConfigurations.filter((config) => config.type === 'mapping');

    return (
        <div>
            {renderConnectorConfigurations(regularConfigurations)}
            {mappingConfigurations.length > 0 && (
                <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <FormattedMessage
                            id='GatewayEnvironments.GatewayConfiguration.advancedSettings'
                            defaultMessage='Advanced Settings'
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderConnectorConfigurations(mappingConfigurations)}
                    </AccordionDetails>
                </Accordion>
            )}
        </div>
    );
}
GatewayConfiguration.defaultProps = {
    gatewayConfigurations: [],
    additionalProperties: {},
    setAdditionalProperties: () => {},
    required: false,
    helperText: <FormattedMessage
        id='Gateway.Configuration.Helper.text'
        defaultMessage='Add Gateway Connector Configurations'
    />,
    hasErrors: () => {},
    validating: false,
};
