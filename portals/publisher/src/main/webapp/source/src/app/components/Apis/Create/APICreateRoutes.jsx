/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Route, Switch } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { Progress } from 'AppComponents/Shared';
import MCPRouteGuard from 'AppComponents/Shared/MCPRouteGuard';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import MCPServerCreateDefault from 'AppComponents/MCPServers/Create/MCPServerCreateDefault';
import MCPServerCreateUsingExistingAPI from 'AppComponents/MCPServers/Create/MCPServerCreateUsingExistingAPI';
import MCPServerCreateProxy from 'AppComponents/MCPServers/Create/MCPServerCreateProxy';
import APICreateDefault from './Default/APICreateDefault';
import APIProductCreateWrapper from './APIProduct/APIProductCreateWrapper';
import ApiCreateSwagger from './OpenAPI/ApiCreateOpenAPI';
import ApiCreateWSDL from './WSDL/ApiCreateWSDL';
import ApiCreateGraphQL from './GraphQL/ApiCreateGraphQL';
import ApiCreateWebSocket from './WebSocket/ApiCreateWebSocket';
import APICreateStreamingAPI from './StreamingAPI/APICreateStreamingAPI';
import APICreateAsyncAPI from './AsyncAPI/ApiCreateAsyncAPI';
import ApiCreateAIAPI from './AIAPI/APICreateAIAPI';

const PREFIX = 'APICreateRoutes';

const classes = {
    content: `${PREFIX}-content`
};

const Root = styled('div')({
    [`&.${classes.content}`]: {
        flexGrow: 1,
    },
});

let gatewayDetails = {
    'wso2/synapse': { 
        value: 'wso2/synapse',
        name: 'Universal Gateway',
        description: 'API gateway embedded in APIM runtime.', 
        isNew: false 
    },
    'wso2/apk': { 
        value: 'wso2/apk',
        name: 'Kubernetes Gateway',
        description: 'API gateway running on Kubernetes.', 
        isNew: false 
    },
    'AWS': { 
        value: 'AWS',
        name: 'AWS Gateway', 
        description: 'API gateway offered by AWS cloud.', 
        isNew: false 
    },
    'Azure': { 
        value: 'Azure',
        name: 'Azure Gateway', 
        description: 'API gateway offered by Azure cloud.', 
        isNew: false 
    }
};

// Wrapper component to pass additional props
const WithSomeValue = (Component, additionalProps) => (routeProps) => (
    <Component {...routeProps} {...additionalProps} />
);
/**
 *
 * Handle routing for all types of API create creations, If you want to add new API type create page,
 * Please use `APICreateBase` and `DefaultAPIForm` components to do so , Don't wrap `APICreateDefault` component
 * @param {*} props
 * @returns @inheritdoc
 */
function APICreateRoutes() {
    const { data: publisherSettings, isLoading } = usePublisherSettings();
    const [apiTypes, setApiTypes] = useState(null);
    const [gatewayTypes, setGatewayTypes] = useState(null);

    useEffect(() => {
        if (!isLoading) {
            setApiTypes(publisherSettings.gatewayFeatureCatalog.apiTypes);
            const data = publisherSettings.gatewayTypes;
            const settingsEnvList = publisherSettings.environment;
            const filteredEnvironments = settingsEnvList ? settingsEnvList
                .filter(env => env?.mode !== 'READ_ONLY') : [];
            const distinctGatewayTypes = [...new Set(filteredEnvironments.map(env => env.gatewayType))];
            const commonGatewayTypes = distinctGatewayTypes.filter(type => data.includes(type));
            const updatedData = commonGatewayTypes.map(item => {
                if (item === "Regular") return "wso2/synapse";
                if (item === "APK") return "wso2/apk";
                return item;
            });
            setGatewayTypes(updatedData);

            const customGateways = {};
            updatedData.forEach((gw) => {
                if (!gatewayDetails[gw]) {
                    const customGateway = {
                        value: gw,
                        name: gw + " Gateway",
                        description: "Custom API Gateway for " + gw,
                        isNew: false
                    };
                    customGateways[gw] = customGateway;
                }
            });

            gatewayDetails = {...gatewayDetails, ...customGateways};
        }
    }, [isLoading]);

    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }
    
    return (
        <Root className={classes.content}>
            <Switch>
                <Route
                    exact
                    path='/apis/create'
                    component={APILanding}
                />
                <Route path='/apis/create/rest' component={WithSomeValue(APICreateDefault, 
                    { multiGateway: apiTypes?.rest
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                <Route path='/api-products/create' component={APIProductCreateWrapper} />
                <Route path='/apis/create/graphQL' component={WithSomeValue(ApiCreateGraphQL,
                    { multiGateway: apiTypes?.graphql
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                <Route path='/apis/create/openapi' component={WithSomeValue(ApiCreateSwagger,
                    { multiGateway: apiTypes?.rest
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                <Route path='/apis/create/wsdl' component={WithSomeValue(ApiCreateWSDL,
                    { multiGateway: apiTypes?.soap
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                {/* TODO: Remove ApiCreateWebSocket components and associated routes */}
                <Route path='/apis/create/ws' component={WithSomeValue(ApiCreateWebSocket,
                    { multiGateway: apiTypes?.ws
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                <Route path='/apis/create/streamingapi/:apiType' component={WithSomeValue(APICreateStreamingAPI,
                    { multiGateway: apiTypes?.ws
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                <Route path='/apis/create/asyncapi' component={WithSomeValue(APICreateAsyncAPI,
                    { multiGateway: apiTypes?.ws
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />
                <Route path='/apis/create/ai-api' component={WithSomeValue(ApiCreateAIAPI,
                    { multiGateway: apiTypes?.ai
                        .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })}
                />

                {/* Routes for MCP Server creation */}
                <Route
                    exact
                    path='/mcp-servers/create'
                    render={(props) => (
                        <MCPRouteGuard>
                            <MCPServerLanding {...props} />
                        </MCPRouteGuard>
                    )}
                />
                <Route
                    path='/mcp-servers/create/import-api-definition'
                    render={(props) => (
                        <MCPRouteGuard>
                            {WithSomeValue(MCPServerCreateDefault, { multiGateway: apiTypes?.ws
                                .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })(props)}
                        </MCPRouteGuard>
                    )}
                />
                <Route
                    path='/mcp-servers/create/mcp-from-existing-api'
                    render={(props) => (
                        <MCPRouteGuard>
                            {WithSomeValue(MCPServerCreateUsingExistingAPI, { multiGateway: apiTypes?.ws
                                .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })(props)}
                        </MCPRouteGuard>
                    )}
                />
                <Route
                    path='/mcp-servers/create/mcp-proxy-from-endpoint'
                    render={(props) => (
                        <MCPRouteGuard>
                            {WithSomeValue(MCPServerCreateProxy, { multiGateway: apiTypes?.ws
                                .filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]) })(props)}
                        </MCPRouteGuard>
                    )}
                />
                <Route component={ResourceNotFound} />
            </Switch>
        </Root>
    );
}

export default (APICreateRoutes);
