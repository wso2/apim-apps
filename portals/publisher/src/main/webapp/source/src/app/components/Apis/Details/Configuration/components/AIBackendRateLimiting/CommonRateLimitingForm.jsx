/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import APIValidation from 'AppData/APIValidation';

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */

export default function CommonRateLimitingForm(props) {
    const { api, configDispatcher, commonFormProps } = props;
    const [apiFromContext] = useAPI();
    const [isValueValid, setIsValueValid] = useState(true);

    const [inputValue, setInputValue] = useState(
        api && api.maxTps && api.maxTps.tokenBasedThrottlingConfiguration
            ? api.maxTps.tokenBasedThrottlingConfiguration[commonFormProps.key] 
            : ''
    );

    function validateValue(value) {
        const validity = commonFormProps.validator ?
            commonFormProps.validator.validate(value, { abortEarly: false }).error
            : APIValidation.isNumber.validate(value, { abortEarly: false }).error;
        if (validity === null || !value) {
            setIsValueValid(true);
            configDispatcher({ action: 'saveButtonDisabled', value: false });
        } else {
            setIsValueValid(false);
            configDispatcher({ action: 'saveButtonDisabled', value: true });
        }
    }

    function handleOnChange({ target: { value } }) {
        validateValue(value);
        let tokenBasedThrottlingConfiguration = {};
        if (api.maxTps && api.maxTps.tokenBasedThrottlingConfiguration) {
            tokenBasedThrottlingConfiguration = api.maxTps.tokenBasedThrottlingConfiguration;
        }
        const dispatchValue = {
            ...api.maxTps,
            tokenBasedThrottlingConfiguration: {
                ...tokenBasedThrottlingConfiguration,
                [commonFormProps.key]: value
            }
        }
        configDispatcher({
            action: 'maxTps',
            value: dispatchValue
        })
    }

    return (
        <Grid container spacing={1} alignItems='center'>
            <Grid item xs={11}>
                <TextField
                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                    id='outlined-name'
                    label={commonFormProps.label}
                    value={inputValue}
                    error={!isValueValid}
                    helperText={commonFormProps.helperText}
                    placeholder={commonFormProps.placeholder}
                    InputProps={{
                        id: `itest-id-rate-limit-label-${commonFormProps.key}`,
                        // onBlur: handleOnChange,
                    }}
                    margin='normal'
                    variant='outlined'
                    type='number'
                    onChange={(event) => { setInputValue(event.target.value); }}
                    onBlur={handleOnChange}
                    sx={{ my: 1 }}
                    style={{ display: 'flex' }}
                />
            </Grid>
            {commonFormProps.tooltip && (<Grid item xs={1}>
                <Tooltip
                    title={commonFormProps.tooltip}
                    aria-label={commonFormProps.label}
                    placement='right-end'
                    interactive
                >
                    <HelpOutline />
                </Tooltip>
            </Grid>)}
        </Grid>
    );
}

CommonRateLimitingForm.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    commonFormProps: PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
        helperText: PropTypes.string,
        placeholder: PropTypes.string,
        tooltip: PropTypes.string,
        validator: PropTypes.func,
    }).isRequired,
};
