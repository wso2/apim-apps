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

import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import { isRestricted } from 'AppData/AuthManager';
import { getBasePath } from 'AppComponents/Shared/Utils';
import MCPServer from 'AppData/MCPServer';
import API from 'AppData/api';
import AddEditEndpoint from 'AppComponents/MCPServers/Details/Endpoints/AddEditEndpoint';
import Endpoints from './Endpoints';
import AddEditAIEndpoint from './AIEndpoints/AddEditAIEndpoint';

const Endpoint = () => {
    const [api] = useAPI();
    const urlPrefix = getBasePath(api.apiType);
    const isMCPServer = api.type === MCPServer.CONSTS.MCP;
    const [llmProviderEndpointConfiguration, setLlmProviderEndpointConfiguration] = useState(null);

    useEffect(() => {
        if (api.subtypeConfiguration?.subtype === 'AIAPI') {
            API.getLLMProviderEndpointConfiguration(
                JSON.parse(api.subtypeConfiguration.configuration).llmProviderId)
                .then((response) => {
                    if (response.body) {
                        const config = response.body;
                        setLlmProviderEndpointConfiguration(config);
                    }
                });
        }
    }, [api]);
    
    return (
        <Switch>
            <Route
                exact
                path={ urlPrefix + ':api_uuid/endpoints/'}
                render={(props) => (
                    <Endpoints
                        api={api}
                        llmProviderEndpointConfiguration={llmProviderEndpointConfiguration}
                        {...props}
                    />
                )}
            />
            {!isRestricted(['apim:api_create']) && !isMCPServer && (
                <Route
                    exact
                    path={urlPrefix + ':api_uuid/endpoints/create'}
                    render={(props) => (
                        <AddEditAIEndpoint
                            apiObject={api}
                            llmProviderEndpointConfiguration={llmProviderEndpointConfiguration}
                            {...props}
                        />
                    )}
                />
            )}
            {!isRestricted(['apim:api_view', 'apim:api_create']) && !isMCPServer && (
                <Route
                    exact
                    path={urlPrefix + ':api_uuid/endpoints/:id'}
                    render={(props) => (
                        <AddEditAIEndpoint
                            apiObject={api}
                            llmProviderEndpointConfiguration={llmProviderEndpointConfiguration}
                            {...props}
                        />
                    )}
                />
            )}

            {/* MCP Server Endpoints */}
            {!isRestricted([
                'apim:mcp_server_view', 'apim:mcp_server_create', 'apim:mcp_server_manage',
                'apim:mcp_server_publish', 'apim:mcp_server_import_export',
            ]) && isMCPServer && (
                <Route
                    exact
                    path={urlPrefix + ':mcpserver_uuid/endpoints/create/:id/:endpointType'}
                    render={(props) => (
                        <AddEditEndpoint
                            apiObject={api}
                            {...props}
                        />
                    )}
                />
            )}

            {!isRestricted(['apim:mcp_server_view', 'apim:mcp_server_create', 'apim:mcp_server_manage',
                'apim:mcp_server_publish', 'apim:mcp_server_import_export',
            ]) && isMCPServer && (
                <Route
                    exact
                    path={urlPrefix + ':mcpserver_uuid/endpoints/:id/:endpointType'}
                    render={(props) => (
                        <AddEditEndpoint
                            apiObject={api}
                            {...props}
                        />
                    )}
                />
            )}

            <Route component={ResourceNotFound} />
        </Switch>
    );
};

Endpoint.propTypes = {
    api: PropTypes.shape({
        id: PropTypes.string,
        additionalProperties: PropTypes.shape({
            key: PropTypes.string,
            value: PropTypes.string,
        }).isRequired,
    }).isRequired,
};

export default Endpoint;
