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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { isRestricted } from 'AppData/AuthManager';
import { FormattedMessage, useIntl } from 'react-intl';
import { Icon, TextField, Tooltip, InputAdornment, } from '@mui/material';

import CONSTS from 'AppData/Constants';

export default function AIEndpointAuth(props) {
    const { api, saveEndpointSecurityConfig, apiKeyParamConfig, isProduction } = props;

    const intl = useIntl();

    const [apiKeyIdentifier] = useState(apiKeyParamConfig.authHeader || apiKeyParamConfig.authQueryParam);
    const [apiKeyIdentifierType] = useState(apiKeyParamConfig.authHeader ? 'HEADER' : 'QUERY_PARAMETER');

    const [apiKeyValue, setApiKeyValue] =
        useState(api.endpointConfig?.endpoint_security?.[isProduction ? 'production' : 'sandbox']?.apiKeyValue === '' ?
            '********' : null);

    const [isHeaderParameter] = useState(!!apiKeyParamConfig.authHeader);

    useEffect(() => {
        saveEndpointSecurityConfig({
            ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
            type: 'apikey',
            apiKeyIdentifier,
            apiKeyIdentifierType,
            apiKeyValue: api.endpointConfig?.endpoint_security?.[isProduction ? 'production' : 'sandbox']?.apiKeyValue
                === '' ? '' : null,
            enabled: true,
        }, isProduction ? 'production' : 'sandbox');
    }, []);

    return (
        <>
            <TextField
                disabled
                label={isHeaderParameter ? <FormattedMessage
                    id='Apis.Details.Endpoints.Security.api.key.header'
                    defaultMessage='Authorization Header'
                /> : <FormattedMessage
                    id='Apis.Details.Endpoints.Security.api.key.query.param'
                    defaultMessage='Authorization Query Param'
                />}
                id={'api-key-id-' + (isProduction ? '-production' : '-sandbox')}
                sx={{ width: '49%', mr: 2 }}
                value={apiKeyIdentifier}
                placeholder={apiKeyIdentifier}
                variant='outlined'
                margin='normal'
                required
            />
            <TextField
                disabled={isRestricted(['apim:api_create'], api)}
                label={<FormattedMessage
                    id='Apis.Details.Endpoints.Security.api.key.value.value'
                    defaultMessage='API Key'
                />}
                id={'api-key-value' + (isProduction ? '-production' : '-sandbox')}
                sx={{ width: '49%' }}
                value={apiKeyValue}
                placeholder={intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Security.api.key.value.placeholder',
                    defaultMessage: 'Enter API Key',
                })}
                onChange={(event) => setApiKeyValue(event.target.value)}
                onBlur={(event) => {
                    saveEndpointSecurityConfig({
                        ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
                        type: 'apikey',
                        apiKeyIdentifier,
                        apiKeyIdentifierType,
                        apiKeyValue: event.target.value === '********' ? '' : event.target.value,
                        enabled: true,
                    }, isProduction ? 'production' : 'sandbox');
                }}
                error={!apiKeyValue}
                helperText={!apiKeyValue
                    ? (
                        <FormattedMessage
                            id='Apis.Details.Endpoints.Security.no.api.key.value.error'
                            defaultMessage='API Key should not be empty'
                        />
                    ) : ''}
                variant='outlined'
                margin='normal'
                required
                type='password'
                InputProps={{
                    endAdornment: <InputAdornment position='end'>
                        <Tooltip
                            placement='top-start'
                            interactive
                            title={(
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.Security.api.key.value.tooltip'
                                    defaultMessage='API Key for the AI API'
                                />
                            )}
                        >
                            <Icon>
                                security
                            </Icon>
                        </Tooltip>
                    </InputAdornment>
                }}
            />
        </>
    );
}

AIEndpointAuth.propTypes = {
    api: PropTypes.shape({}).isRequired,
    saveEndpointSecurityConfig: PropTypes.func.isRequired,
    isProduction: PropTypes.bool.isRequired,
};