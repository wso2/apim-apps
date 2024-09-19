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
import Grid from '@mui/material/Grid';

import { Switch, Typography } from '@mui/material';

import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import BackendRateLimitingForm from './BackendRateLimitingForm';

// import { useIntl } from 'react-intl';

/**
 * Backend Rate Limiting for AI APIs
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function BackendRateLimiting(props) {
    const { api, configDispatcher } = props;
    const [apiFromContext] = useAPI();
    // const intl = useIntl();

    function handleOnChangeTokenBasedSwitch({ target: { checked } }) {
        let throttlingConfiguration = {};
        if (api.aiConfiguration && api.aiConfiguration.throttlingConfiguration) {
            throttlingConfiguration = api.aiConfiguration.throttlingConfiguration;
        }
        const dispatchValue = {
            ...api.aiConfiguration,
            throttlingConfiguration: {
                ...throttlingConfiguration,
                isTokenBasedThrottlingEnabled: checked
            }
        }
        configDispatcher({
            action: 'aiConfiguration',
            value: dispatchValue,
        })
    }

    return (
        <>
            <Grid item xs={12} sx={{ mb: 2, ml:1 }}>
                <Typography variant='h6' component='h4'>
                    Token Based Throttling
                    <Switch
                        disabled={isRestricted(['apim:api_create'], apiFromContext)}
                        checked={api.aiConfiguration.throttlingConfiguration.isTokenBasedThrottlingEnabled}
                        onChange={handleOnChangeTokenBasedSwitch}
                        color='primary'
                        inputProps={{
                            'aria-label': 'is Token Based Throttling Enabled',
                        }}
                    />
                </Typography>
            </Grid>
            <Grid item xs={12} sx={{mb:2}}>
                <BackendRateLimitingForm
                    api={api}
                    configDispatcher={configDispatcher}
                    isProduction
                />
            </Grid>
            <Grid item xs={12} sx={{mb:2}}>
                <BackendRateLimitingForm
                    api={api}
                    configDispatcher={configDispatcher}
                />
            </Grid>
        </>
    );
}

BackendRateLimiting.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
