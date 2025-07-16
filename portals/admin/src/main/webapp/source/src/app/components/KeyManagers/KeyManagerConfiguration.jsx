import React, { useEffect, useReducer } from 'react';
import { styled } from '@mui/material/styles';
import {
    TextField, Checkbox, FormControlLabel, Box, FormLabel, FormControl,
    FormGroup, Radio, RadioGroup, MenuItem, FormHelperText,
} from '@mui/material';
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

    const onChange = (e) => {
        const {
            name, value, type, checked,
        } = e.target;
        if (type === 'checkbox') {
            const current = Array.isArray(additionalProperties[name]) ? [...additionalProperties[name]] : [];
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
            setAdditionalProperties(name, finalValue);
        } else {
            setAdditionalProperties(name, value);
        }
    };

    useEffect(() => {
        keymanagerConnectorConfigurations.forEach((config) => {
            const { name, default: defaultVal } = config;
            if (
                defaultVal !== undefined
                && (additionalProperties[name] === undefined || additionalProperties[name] === '')
            ) {
                setAdditionalProperties(name, defaultVal);
            }
        });
    }, [keymanagerConnectorConfigurations, additionalProperties, setAdditionalProperties]);

    const onChangeCheckBox = (e) => {
        setAdditionalProperties(e.target.name, e.target.checked);
    };

    const getComponent = (config) => {
        const {
            name, label, type, values = [], tooltip, required, mask, default: defaultVal,
        } = config;

        const value = type === 'certificate' ? (additionalProperties?.certificates
            || { type: 'PEM', value: '' }) : (additionalProperties[name] ?? '');
        const error = required && hasErrors('keyconfig', value, validating);

        const selectedObject = values.find((v) => v.name === value);

        const renderSelectedChildren = (parent) => parent?.values?.map((child) => (
            <Box key={child.name} ml={2} mt={2}>
                {getComponent(child)}
            </Box>
        ));

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
                                                    setAdditionalProperties(name, updated);
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
                    {selectedObject?.values?.length > 0 && renderSelectedChildren(selectedObject)}
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
                <FormControl component='fieldset' error={Boolean(error)}>
                    <FormLabel component='legend'>
                        {label}
                        {required && <StyledSpan>*</StyledSpan>}
                    </FormLabel>
                    <Certificates
                        fieldName='tenantWideCertificates'
                        tenantWideCertificates={tenantWideCertificates}
                        dispatch={dispatch}
                        isJwksNeeded={false}
                    />
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
    };

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
