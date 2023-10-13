import React from 'react';
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
import makeStyles from '@mui/styles/makeStyles';
import CustomInputField from 'AppComponents/KeyManagers/CustomInputField';

const useStyles = makeStyles((theme) => ({
    inputLabel: {
        transform: 'translate(14px, 11px) scale(1)',
    },
    error: {
        color: theme.palette.error.dark,
    },
}));

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
        setAdditionalProperties, hasErrors, validating,
    } = props;
    const classes = useStyles();
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
                const newValue = value.filter((v) => v !== e.target.value);
                finalValue = newValue;
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
        if (keymanagerConnectorConfiguration.type === 'input') {
            if (keymanagerConnectorConfiguration.mask) {
                return (
                    <FormControl variant='outlined' fullWidth>
                        <InputLabel className={classes.inputLabel}>
                            {keymanagerConnectorConfiguration.label}
                            {keymanagerConnectorConfiguration.required && (<span className={classes.error}>*</span>)}
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
                            {keymanagerConnectorConfiguration.required && (<span className={classes.error}>*</span>)}
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
            return (
                <FormControl component='fieldset'>
                    <FormLabel component='legend'>{keymanagerConnectorConfiguration.label}</FormLabel>
                    <FormGroup>
                        {keymanagerConnectorConfiguration.values.map((selection) => (
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
        } else if (keymanagerConnectorConfiguration.type === 'checkbox') {
            return (
                <FormControl component='fieldset'>
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
                <FormControl component='fieldset'>
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
