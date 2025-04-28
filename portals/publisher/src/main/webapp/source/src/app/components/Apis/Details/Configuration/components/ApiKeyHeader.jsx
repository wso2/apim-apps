/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import APIValidation from 'AppData/APIValidation';

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */

export default function ApiKeyHeader(props) {
    const { api, configDispatcher, apiKeyEnabled } = props;
    const [apiFromContext] = useAPI();
    const loadAPIKeyHeader = apiFromContext.type==="HTTP" || apiFromContext.apiType===API.CONSTS.APIProduct;
    const [isHeaderNameValid, setIsHeaderNameValid] = useState(true);
    const apiKeyHeaderValue = api.apiKeyHeader;

    function validateHeader(value) {
        const headerValidity = APIValidation.apiKeyHeader.required()
            .validate(value, { abortEarly: false }).error;
        if (headerValidity === null) {
            setIsHeaderNameValid(true);
            configDispatcher({ action: 'saveButtonDisabled', value: false });
        } else {
            setIsHeaderNameValid(false);
            configDispatcher({ action: 'saveButtonDisabled', value: true });
        }
    }

    if(loadAPIKeyHeader){
        return (
            <Grid container spacing={1} alignItems='center'>
                <Grid item xs={11}>
                    <TextField
                        disabled={isRestricted(['apim:api_create'], apiFromContext) || !apiKeyEnabled}
                        id='outlined-name'
                        label={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.apiKey.header.label'
                                defaultMessage='ApiKey Header'
                            />
                        )}
                        value={apiKeyHeaderValue}
                        error={!isHeaderNameValid}
                        helperText={
                            (!isHeaderNameValid)
                            && (
                                <FormattedMessage
                                    id='Apis.Details.Configuration.ApiKeyHeader.helper.text'
                                    defaultMessage='ApiKey header name cannot contain spaces or special characters'
                                />
                            )
                        }
                        InputProps={{
                            id: 'itest-id-apiKeyHeaderName-input',
                            onBlur: ({ target: { value } }) => {
                                if (value.trim() === '') {
                                    configDispatcher({ action: 'apiKeyHeader', value: 'ApiKey' });
                                } else{
                                    validateHeader(value);
                                }
                            },
                        }}
                        margin='normal'
                        variant='outlined'
                        onChange={({ target: { value } }) => configDispatcher({
                            action: 'apiKeyHeader',
                            value
                        })}
                        style={{ display: 'flex' }}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.ApiKeyHeader.tooltip'
                                defaultMessage={
                                    ' The header name that is used to send the api key '
                                    + 'information. "ApiKey" is the default header.'
                                }
                            />
                        )}
                        aria-label='ApiKey Header'
                        placement='right-end'
                        interactive
                    >
                        <HelpOutline />
                    </Tooltip>
                </Grid>
            </Grid>
        );
    }
}

ApiKeyHeader.propTypes = {
    api: PropTypes.shape({
        apiKeyHeader: PropTypes.string,
    }).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    apiKeyEnabled: PropTypes.bool.isRequired,
};
