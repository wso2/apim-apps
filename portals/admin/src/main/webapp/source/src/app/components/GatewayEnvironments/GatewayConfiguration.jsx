import React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
// import FormLabel from '@mui/material/FormLabel';
// import FormControl from '@mui/material/FormControl';
// import FormGroup from '@mui/material/FormGroup';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
import { FormattedMessage } from 'react-intl';
// import InputLabel from '@mui/material/InputLabel';
// import FormHelperText from '@mui/material/FormHelperText';
// import CustomInputField from 'AppComponents/KeyManagers/CustomInputField';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

/**
 * @export
 * @param {*} props sksk
 * @returns {React.Component}
 */
/**
 * Gateway Agent configuration
 * @param {JSON} props props passed from parents.
 * @returns {JSX} gateway agent connection configuration form.
 */
export default function GatewayConfiguration(props) {
    const {
        gatewayConfigurations, additionalProperties, setAdditionalProperties,
    } = props;

    const onChange = (e) => {
        const { name, value } = e.target;
        setAdditionalProperties(name, value);
    };

    const getComponent = (gatewayConfiguration) => {
        let value = '';
        if (additionalProperties[gatewayConfiguration.name]) {
            value = additionalProperties[gatewayConfiguration.name];
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
                helperText={gatewayConfiguration.tooltip}
                variant='outlined'
                value={value}
                defaultValue={gatewayConfiguration.default}
                onChange={onChange}
            />
        );
    };

    return (
        (gatewayConfigurations && gatewayConfigurations.length > 0) && (
            <Paper
                variant='outlined'
                sx={(theme) => ({ padding: theme.spacing(1), marginBottom: theme.spacing(1) })}
            >
                {gatewayConfigurations.map((gatewayConfiguration) => (
                    <Box mb={3}>
                        {getComponent(gatewayConfiguration)}
                    </Box>
                ))}
            </Paper>
        )
    );
}
GatewayConfiguration.defaultProps = {
    gatewayConfigurations: [],
    required: false,
    helperText: <FormattedMessage
        id='Gateway.Configuration.Helper.text'
        defaultMessage='Add Gateway Agent Configurations'
    />,
    hasErrors: () => {},
    validating: false,
};
