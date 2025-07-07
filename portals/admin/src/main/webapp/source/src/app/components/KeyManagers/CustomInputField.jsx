import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));
/**
 * @export
 * @param {*} props sksk
 * @returns {React.Component}
 */
/**
 * Input Field
 * @param {JSON} props props passed from parents.
 * @returns {JSX} key manager connector form.
*/
export default function CustomInputField(props) {
    const {
        value, onChange, name, label, required, validating, hasErrors,
    } = props;
    const [showPassword, setShowPassword] = useState(false);
    return (
        <FormControl
            fullWidth
            variant='outlined'
            margin='dense'
            error={required && hasErrors('keyconfig', value, validating)}
        >
            <InputLabel htmlFor={name}>
                {label}
                {required && <StyledSpan>*</StyledSpan>}
            </InputLabel>
            <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                endAdornment={(
                    <InputAdornment position='end'>
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={() => setShowPassword(!showPassword)}
                            edge='end'
                            size='large'
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                )}
                name={name}
                label={label} // IMPORTANT: this makes the outline label behave correctly
            />
        </FormControl>
    );
}
