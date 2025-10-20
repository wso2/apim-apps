/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
