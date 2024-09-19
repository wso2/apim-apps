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

import React from 'react';
import PropTypes from 'prop-types';
import { Grid, InputAdornment, TextField } from '@mui/material';
import { useIntl } from 'react-intl';

import { isRestricted } from 'AppData/AuthManager';
import RequestCountRateLimitUnit from './RequestCountRateLimitUnit';


export default function RequestCountRateLimit(props) {

    const { api, configDispatcher, isProduction } = props;
    const intl = useIntl();
    let maxTpsValue;
    if (api.maxTps) {
        maxTpsValue = isProduction ? api.maxTps.production : api.maxTps.sandbox;
    } else {
        maxTpsValue = '';
    }

    return (<>
        <Grid item xs={12} style={{ marginBottom: 10, position: 'relative' }}>
            <TextField
                label={isProduction ? intl.formatMessage({
                    id: 'Apis.Details.Configuration.components.MaxBackendTps.max.'
                        + 'throughput.specify.max.prod.tps',
                    defaultMessage: 'Max Production TPS',
                }) : intl.formatMessage({
                    id: 'Apis.Details.Configuration.components.MaxBackendTps.max.'
                        + 'throughput.specify.max.sandbox.tps',
                    defaultMessage: 'Max Sandbox TPS',
                })}
                margin='normal'
                variant='outlined'
                onChange={(event) => {
                    const value = isProduction ?
                        { ...api.maxTps, production: event.target.value } :
                        { ...api.maxTps, sandbox: event.target.value };
                    configDispatcher({
                        action: 'maxTps',
                        value,
                    });
                }}
                value={api.maxTps !== null ? maxTpsValue : ''}
                disabled={isRestricted(['apim:api_create'], api)}
                InputProps={{
                    endAdornment: <InputAdornment position='end'>
                        <RequestCountRateLimitUnit
                            api={api}
                            configDispatcher={configDispatcher}
                            isProduction={isProduction}
                        />
                    </InputAdornment>,
                }}
            />
        </Grid>
    </>);
}

RequestCountRateLimit.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    isProduction: PropTypes.bool.isRequired,
};