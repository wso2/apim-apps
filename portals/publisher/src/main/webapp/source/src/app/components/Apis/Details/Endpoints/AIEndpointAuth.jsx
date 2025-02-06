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
import { Icon, TextField, InputAdornment, IconButton, Grid } from '@mui/material';
import CONSTS from 'AppData/Constants';

/**
 * AI Endpoint Auth component
 * @param {*} props properties
 * @returns {JSX} AI Endpoint Auth component
 */
export default function AIEndpointAuth(props) {
    const { api, endpoint, apiKeyParamConfig, isProduction, saveEndpointSecurityConfig } = props;
    const intl = useIntl();

    const [apiKeyIdentifier] = useState(apiKeyParamConfig.authHeader || apiKeyParamConfig.authQueryParam);
    const [apiKeyIdentifierType] = useState(apiKeyParamConfig.authHeader ? 'HEADER' : 'QUERY_PARAMETER');

    const [apiKeyValue, setApiKeyValue] = useState(null);
    const [isHeaderParameter] = useState(!!apiKeyParamConfig.authHeader);
    const [showApiKey, setShowApiKey] = useState(false);

    const subtypeConfig = api.subtypeConfiguration && JSON.parse(api.subtypeConfiguration.configuration);
    const llmProviderName = subtypeConfig ? subtypeConfig.llmProviderName : null;

    useEffect(() => {
        setApiKeyValue(
            endpoint.endpointConfig?.endpoint_security?.[isProduction ? 'production' : 'sandbox']?.apiKeyValue === ''
                ? '********'
                : null
        );
    }, []);

    // useEffect(() => {
    //     let newApiKeyValue = endpoint.endpointConfig?.endpoint_security?.[isProduction ?
    //         'production' : 'sandbox']?.apiKeyValue === '' ? '' : null;

    //     if ((llmProviderName === 'MistralAI' || llmProviderName === 'OpenAI') &&
    //         newApiKeyValue != null && newApiKeyValue !== '') {
    //         newApiKeyValue = `Bearer ${newApiKeyValue}`;
    //     }

    //     saveEndpointSecurityConfig({
    //         ...CONSTS.DEFAULT_ENDPOINT_SECURITY,
    //         type: 'apikey',
    //         apiKeyIdentifier,
    //         apiKeyIdentifierType,
    //         apiKeyValue: newApiKeyValue,
    //         enabled: true,
    //     }, isProduction ? 'production' : 'sandbox');
    // }, []);

    const handleApiKeyChange = (event) => {
        let apiKeyVal = event.target.value;
        if (apiKeyVal === '********') {
            apiKeyVal = '';
        } else if (apiKeyVal === '') {
            apiKeyVal = null;
        } else if (apiKeyVal.includes('********')) {
            apiKeyVal = apiKeyVal.replace('********', '');
        }
        setApiKeyValue(apiKeyVal);
    };

    const handleApiKeyBlur = () => {
        let updatedApiKeyValue = apiKeyValue;
        if ((llmProviderName === 'MistralAI' || llmProviderName === 'OpenAI') &&
            apiKeyValue !== null && apiKeyValue !== '') {
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
            <Grid item xs={6}>
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
                    id={'api-key-id-' + endpoint.id}
                    value={apiKeyIdentifier}
                    placeholder={apiKeyIdentifier}
                    helperText=' '
                    sx={{ width: '100%' }}
                    variant='outlined'
                    margin='normal'
                    required
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    disabled={isRestricted(['apim:api_create'], api)}
                    label={<FormattedMessage
                        id='Apis.Details.Endpoints.Security.api.key.value.value'
                        defaultMessage='API Key'
                    />}
                    id={'api-key-value' + endpoint.id}
                    value={apiKeyValue}
                    placeholder={intl.formatMessage({
                        id: 'Apis.Details.Endpoints.Security.api.key.value.placeholder',
                        defaultMessage: 'Enter API Key',
                    })}
                    sx={{ width: '100%' }}
                    onChange={handleApiKeyChange}
                    onBlur={handleApiKeyBlur}
                    error={!apiKeyValue}
                    helperText={!apiKeyValue ? (
                        <FormattedMessage
                            id='Apis.Details.Endpoints.Security.no.api.key.value.error'
                            defaultMessage='API Key should not be empty'
                        />
                    ) : ' '}
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
            </Grid>
        </>
    );
}

AIEndpointAuth.propTypes = {
    api: PropTypes.shape({}).isRequired,
    saveEndpointSecurityConfig: PropTypes.func.isRequired,
    isProduction: PropTypes.bool.isRequired,
};
