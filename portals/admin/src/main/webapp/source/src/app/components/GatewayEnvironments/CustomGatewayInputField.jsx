import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * @export
 * @param {*} props sksk
 * @returns {React.Component}
 */
/**
 * Input Field
 * @param {JSON} props props passed from parents.
 * @returns {JSX} gateway connector form.
*/
export default function CustomGatewayInputField(props) {
    const {
        value, onChange, name, required, validating, hasErrors,
    } = props;
    const [showPasswordField, setShowPasswordField] = useState(false);
    return (
        <OutlinedInput
            name={name}
            value={value}
            type={showPasswordField ? 'text' : 'password'}
            onChange={onChange}
            labelWidth={70}
            margin='dense'
            error={required && hasErrors('gatewayConfig', value, validating)}
            endAdornment={(
                <InputAdornment position='end'>
                    <IconButton
                        aria-label='toggle password visibility'
                        onClick={() => setShowPasswordField(!showPasswordField)}
                        onMouseDown={() => setShowPasswordField(!showPasswordField)}
                        edge='end'
                        size='large'
                    >
                        {showPasswordField ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                </InputAdornment>
            )}
        />
    );
}
