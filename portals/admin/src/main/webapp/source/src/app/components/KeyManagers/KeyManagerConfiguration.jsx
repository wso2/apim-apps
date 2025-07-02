import React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Certificates from 'AppComponents/KeyManagers/Certificates';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import CustomInputField from 'AppComponents/KeyManagers/CustomInputField';

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
        setAdditionalProperties, hasErrors, validating, dispatch, certificates,
    } = props;

    const onChange = (e) => {
        let finalValue;
        const {
            name, value, type, checked,
        } = e.target;
        if (type === 'checkbox') {
            const current = Array.isArray(additionalProperties[name]) ? [...additionalProperties[name]] : [];
            if (checked) {
                // Add only if not already included
                if (!current.includes(value)) {
                    finalValue = [...current, value];
                } else {
                    finalValue = current;
                }
            } else {
                // Remove unchecked value
                finalValue = current.filter((v) => v !== value);
            }
        } else {
            finalValue = value;
        }
        setAdditionalProperties(name, finalValue);
    };
    const onChangeCheckBox = (e) => {
        setAdditionalProperties(e.target.name, e.target.checked);
    };
    const getComponent = (keymanagerConnectorConfiguration) => {
        let value = '';
        if (additionalProperties[keymanagerConnectorConfiguration.name]) {
            value = additionalProperties[keymanagerConnectorConfiguration.name];
        }
        const renderNestedConfigs = (configs, parentType, parentName) => {
            return configs.map((config, index) => {
                const {
                    name, label, type, values = [],
                } = config;
                const isObjectArray = Array.isArray(values) && typeof values[0] === 'object';

                return (
                    <Box ml={3} key={name || index} mb={2}>
                        {/* Render checkbox only if type is 'select', else just the label */}
                        {parentType === 'select' ? (
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={Array.isArray(additionalProperties[parentName])
                                            ? additionalProperties[parentName].includes(name)
                                            : false}
                                        onChange={(e) => {
                                            const current = Array.isArray(additionalProperties[parentName])
                                                ? [...additionalProperties[parentName]]
                                                : [];
                                            const { checked } = e.target;
                                            let finalValue;
                                            if (checked && !current.includes(name)) {
                                                finalValue = [...current, name];
                                            } else if (!checked) {
                                                finalValue = current.filter((v) => v !== name);
                                            } else {
                                                finalValue = current;
                                            }
                                            setAdditionalProperties(parentName, finalValue);
                                        }}
                                        value={name}
                                        color='primary'
                                        name={name}
                                    />
                                )}
                                label={label}
                            />
                        ) : (
                            <Box>{label}</Box>
                        )}
                        {/* DFS: Render children recursively if object array */}
                        {isObjectArray && renderNestedConfigs(values, type)}
                        {!isObjectArray && values.length === 0 && getComponent(config)}
                    </Box>
                );
            });
        };

        if (keymanagerConnectorConfiguration.type === 'input') {
            if (keymanagerConnectorConfiguration.mask) {
                return (
                    <FormControl variant='outlined' fullWidth>
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
                    defaultValue={keymanagerConnectorConfiguration.default}
                    onChange={onChange}
                />
            );
        } else if (keymanagerConnectorConfiguration.type === 'select') {
            const { values = [] } = keymanagerConnectorConfiguration;
            const isObjectArray = values.length > 0 && typeof values[0] === 'object';

            return (
                <FormControl variant='standard' component='div' sx={{ width: '100%' }}>
                    <FormLabel sx={{ mb: 1, display: 'block' }}>
                        <span>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<StyledSpan>*</StyledSpan>)}
                        </span>
                    </FormLabel>
                    <FormGroup>
                        {isObjectArray ? renderNestedConfigs(values, 'select', keymanagerConnectorConfiguration.name)
                            : values.map((selection) => (
                                <FormControlLabel
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
        } else if (keymanagerConnectorConfiguration.type === 'certificate') {
            return (
                <Box>
                    <Certificates
                        certificates={certificates}
                        dispatch={dispatch}
                    />
                </Box>
            );
        } else if (keymanagerConnectorConfiguration.type === 'checkbox') {
            return (
                <FormControl variant='standard' component='fieldset'>
                    <FormLabel component='legend'>{keymanagerConnectorConfiguration.label}</FormLabel>
                    <FormGroup>
                        {keymanagerConnectorConfiguration.values.map((selection) => (
                            <FormControlLabel
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
                <FormControl variant='standard' component='fieldset'>
                    <FormLabel component='legend'>{keymanagerConnectorConfiguration.label}</FormLabel>
                    <RadioGroup
                        aria-label={keymanagerConnectorConfiguration.label}
                        name={keymanagerConnectorConfiguration.name}
                        value={value}
                        onChange={onChange}
                    >
                        {keymanagerConnectorConfiguration.values.map((selection) => (
                            <FormControlLabel value={selection} control={<Radio />} label={selection} />
                        ))}
                    </RadioGroup>
                </FormControl>
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
                    defaultValue={keymanagerConnectorConfiguration.default}
                    onChange={onChange}
                />
            );
        }
    };
    return (
        keymanagerConnectorConfigurations.map((keymanagerConnectorConfiguration) => (
            <Box mb={3}>
                {getComponent(keymanagerConnectorConfiguration, hasErrors, validating)}
            </Box>
        )));
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
