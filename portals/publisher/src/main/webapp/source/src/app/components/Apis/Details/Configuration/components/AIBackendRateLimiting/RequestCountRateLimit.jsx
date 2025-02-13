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
import { Grid, TextField, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { useIntl } from 'react-intl';

import { isRestricted } from 'AppData/AuthManager';
import APIValidation from 'AppData/APIValidation';


export default function RequestCountRateLimit(props) {

    const { api, configDispatcher, isProduction } = props;
    const intl = useIntl();

    let maxTpsValue;
    if (api.maxTps) {
        maxTpsValue = isProduction ? api.maxTps.production : api.maxTps.sandbox;
    } else {
        maxTpsValue = '';
    }
    const [inputValue, setInputValue] = useState(maxTpsValue);
    const [isValueValid, setIsValueValid] = useState(true);

    function validateValue(value) {
        const validity = APIValidation.isNumber.validate(value, { abortEarly: false }).error;
        if (validity === null || !value) {
            setIsValueValid(true);
            configDispatcher({ action: 'saveButtonDisabled', value: false });
        } else {
            setIsValueValid(false);
            configDispatcher({ action: 'saveButtonDisabled', value: true });
        }
    }

    return (
        <Grid container spacing={1} alignItems='center'>
            <Grid item xs={11} style={{ marginBottom: 10, position: 'relative' }}>
                <TextField
                    label={intl.formatMessage({
                        id: 'Apis.Details.Configuration.components.MaxBackendTps.max.'
                            + 'throughput.specify.max.request.count',
                        defaultMessage: 'Max Request Count',
                    })}
                    margin='normal'
                    variant='outlined'
                    type='number'
                    error={!isValueValid}
                    onChange={(event) => {
                        setInputValue(event.target.value);
                    }}
                    onBlur={(event) => {
                        validateValue(event.target.value);
                        const value = isProduction ?
                            { ...api.maxTps, production: event.target.value } :
                            { ...api.maxTps, sandbox: event.target.value };
                        configDispatcher({
                            action: 'maxTps',
                            value,
                        });
                    }}
                    value={inputValue}
                    disabled={isRestricted(['apim:api_create'], api)}
                    sx={{ my: 1 }}
                    style={{ display: 'flex' }}
                />
            </Grid>
            <Grid item xs={1}>
                <Tooltip
                    title='Max Request Count'
                    aria-label='Max Request Count as an integer value'
                    placement='right-end'
                    interactive
                >
                    <HelpOutline />
                </Tooltip>
            </Grid>
        </Grid>
    );
}

RequestCountRateLimit.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    isProduction: PropTypes.bool.isRequired,
};