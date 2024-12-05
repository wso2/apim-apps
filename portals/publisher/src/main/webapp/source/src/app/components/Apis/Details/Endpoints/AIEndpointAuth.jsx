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
import { Icon, TextField, InputAdornment, IconButton } from '@mui/material';
import CONSTS from 'AppData/Constants';

export default function AIEndpointAuth(props) {
    const { api, saveEndpointSecurityConfig, apiKeyParamConfig, isProduction } = props;
    const intl = useIntl();

    const [apiKeyIdentifier] = useState(apiKeyParamConfig.authHeader || apiKeyParamConfig.authQueryParam);
    const [apiKeyIdentifierType] = useState(apiKeyParamConfig.authHeader ? 'HEADER' : 'QUERY_PARAMETER');

    const [apiKeyValue, setApiKeyValue] = useState(
        api.endpointConfig?.endpoint_security?.[isProduction ? 'production' : 'sandbox']?.apiKeyValue === ''
            ? '********'
            : null
    );
    const [isHeaderParameter] = useState(!!apiKeyParamConfig.authHeader);
    const [showApiKey, setShowApiKey] = useState(false);

    const subtypeConfig = api.subtypeConfiguration && JSON.parse(api.subtypeConfiguration.configuration);
    const llmProviderName = subtypeConfig ? subtypeConfig.llmProviderName : null;

    useEffect(() => {

        let newApiKeyValue = api.endpointConfig?.endpoint_security?.[isProduction ? 
            'production' : 'sandbox']?.apiKeyValue === '' ? '' : null;

        if ((llmProviderName === 'MistralAI' || llmProviderName === 'OpenAI') &&
            newApiKeyValue != null && newApiKeyValue !== '') {
            newApiKeyValue = `Bearer ${newApiKeyValue}`;
        }

        saveEndpointSecurityConfig({
            ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
            type: 'apikey',
            apiKeyIdentifier,
            apiKeyIdentifierType,
            apiKeyValue: newApiKeyValue,
            enabled: true,
        }, isProduction ? 'production' : 'sandbox');
    }, []);

    const handleApiKeyChange = (event) => {
        setApiKeyValue(event.target.value);
    };

    const handleApiKeyBlur = (event) => {

        let updatedApiKeyValue = event.target.value === '********' ? '' : event.target.value;

        if ((llmProviderName === 'MistralAI' || llmProviderName === 'OpenAI') &&
            updatedApiKeyValue !== null && updatedApiKeyValue !== '') {
            updatedApiKeyValue = `Bearer ${updatedApiKeyValue}`;
        }

        saveEndpointSecurityConfig({
            ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
            type: 'apikey',
            apiKeyIdentifier,
            apiKeyIdentifierType,
            apiKeyValue: updatedApiKeyValue,
            enabled: true,
        }, isProduction ? 'production' : 'sandbox');
    };

    const handleToggleApiKeyVisibility = () => {
        if (apiKeyValue !== '********') {
            setShowApiKey((prev) => !prev);
        }
    };

    return (
        <>
            <TextField
                disabled
                label={isHeaderParameter ? (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Security.api.key.header'
                        defaultMessage='Authorization Header'
                    />
                ) : (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Security.api.key.query.param'
                        defaultMessage='Authorization Query Param'
                    />
                )}
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
                onChange={handleApiKeyChange}
                onBlur={handleApiKeyBlur}
                error={!apiKeyValue}
                helperText={!apiKeyValue ? (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Security.no.api.key.value.error'
                        defaultMessage='API Key should not be empty'
                    />
                ) : ''}
                variant='outlined'
                margin='normal'
                required
                type={showApiKey ? 'text' : 'password'}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton onClick={handleToggleApiKeyVisibility} edge='end'>
                                <Icon>
                                    {showApiKey ? 'visibility' : 'visibility_off'}
                                </Icon>
                            </IconButton>
                        </InputAdornment>
                    ),
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
