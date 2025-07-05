import React from 'react';
import { styled } from '@mui/material/styles';
import {
    TextField, Checkbox, FormControlLabel, Box, FormLabel, FormControl,
    FormGroup, Radio, RadioGroup, InputLabel, MenuItem, FormHelperText,
} from '@mui/material';
import Certificates from 'AppComponents/KeyManagers/Certificates';
import CustomInputField from 'AppComponents/KeyManagers/CustomInputField';
import { FormattedMessage } from 'react-intl';

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
        keymanagerConnectorConfigurations,
        additionalProperties,
        setAdditionalProperties,
        hasErrors,
        validating,
        dispatch,
        certificates,
    } = props;

    const onChange = (e) => {
        const {
            name, value, type, checked,
        } = e.target;
        if (type === 'checkbox') {
            const current = Array.isArray(additionalProperties[name]) ? [...additionalProperties[name]] : [];
            let finalValue;
            if (checked) {
                if (current.includes(value)) {
                    finalValue = current;
                } else {
                    finalValue = [...current, value];
                }
            } else {
                finalValue = current.filter((v) => v !== value);
            }
            setAdditionalProperties(name, finalValue);
        } else {
            setAdditionalProperties(name, value);
        }
    };

    const onChangeCheckBox = (e) => {
        setAdditionalProperties(e.target.name, e.target.checked);
    };

    const getComponent = (config) => {
        const {
            name, label, type, values = [], tooltip, required, mask, default: defaultVal,
        } = config;

        const value = additionalProperties[name] ?? '';
        const error = required && hasErrors('keyconfig', value, validating);

        const selectedObject = values.find((v) => v.name === value);
        const selectedRadioObject = values.find((v) => v.name === value);

        // Recursive rendering for children of selected option
        const renderSelectedChildren = (parent) => parent?.values?.map((child) => (
            <Box key={child.name} ml={2} mt={2}>
                {getComponent(child)}
            </Box>
        ));

        // Input fields
        if (type === 'input') {
            if (mask) {
                return (
                    <FormControl fullWidth>
                        <InputLabel shrink>
                            {label}
                            {required && <StyledSpan>*</StyledSpan>}
                        </InputLabel>
                        <CustomInputField
                            value={value}
                            onChange={onChange}
                            name={name}
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

        // Select fields
        if (type === 'select') {
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

        // Radio/Options fields
        if (type === 'options' || type === 'radio') {
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
                        {values.map((option) => (
                            <FormControlLabel
                                key={option.name}
                                value={option.name}
                                control={<Radio />}
                                label={option.label}
                            />
                        ))}
                    </RadioGroup>
                    <FormHelperText>{error || tooltip}</FormHelperText>
                    {selectedRadioObject?.values?.length > 0 && renderSelectedChildren(selectedRadioObject)}
                </FormControl>
            );
        }

        // Certificate field
        if (type === 'certificate') {
            return (
                <FormControl component='fieldset' error={Boolean(error)}>
                    <FormLabel component='legend'>
                        {label}
                        {required && <StyledSpan>*</StyledSpan>}
                    </FormLabel>
                    <Certificates certificates={certificates} dispatch={dispatch} />
                </FormControl>
            );
        }

        // Checkbox fields (single boolean)
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

        // Default fallback
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
