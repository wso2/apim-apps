/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com).
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
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';

/**
 * DisplayName component
 * @param {Object} props - The props for the component
 * @param {Object} props.api - The api object
 * @param {Function} props.configDispatcher - The config dispatcher function
 * @returns {React.Component} @inheritdoc
 */
function DisplayName(props) {
    const { api, configDispatcher } = props;
    const [apiFromContext] = useAPI();

    const getCreateOrPublishScopes = () => {
        if (apiFromContext.apiType && apiFromContext.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isCreateOrPublishRestricted = () => isRestricted(getCreateOrPublishScopes(), apiFromContext);

    return (
        <TextField
            label={(
                <FormattedMessage
                    id='Apis.Details.Configuration.components.DisplayName'
                    defaultMessage='Display Name'
                />
            )}
            id='displayName'
            variant='outlined'
            value={api.displayName ? api.displayName : api.name}
            fullWidth
            margin='normal'
            onChange={(e) => configDispatcher({ action: 'displayName', value: e.target.value })}
            disabled={isCreateOrPublishRestricted()}
            helperText={(
                <FormattedMessage
                    id='Apis.Details.Configuration.components.DisplayName.help'
                    defaultMessage='This will be the display name of the {type}'
                    values={{
                        type: getTypeToDisplay(api.apiType)
                    }}
                />
            )}
            style={{ marginTop: 0 }}
        />
    );
}

DisplayName.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};

export default DisplayName;