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

const gatewayDetsils = {
    'wso2/synapse': { 
        value: 'wso2/synapse',
        name: 'Regular Gateway', 
        description: 'API gateway embedded in APIM runtime. Connect directly APIManager.', 
        isNew: false 
    },
    'wso2/apk': { 
        value: 'wso2/apk',
        name: 'APK Gateway', 
        description: 'Fast API gateway running on kubernetes designed to manage and secure APIs.', 
        isNew: true 
    },
    'AWS': { 
        value: 'AWS',
        name: 'AWS Gateway', 
        description: 'A secure and scalable API gateway from AWS.', 
        isNew: true 
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

    useEffect(() => {
        if (!isLoading) {
            setApiTypes(JSON.parse(publisherSettings.gatewayFeatureCatalog).apiTypes);
        }
    }, [isLoading]);

    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }
    
    return (
        <Root className={classes.content}>
            <Switch>
                <Route path='/apis/create/rest' component={WithSomeValue(APICreateDefault, 
                    { multiGateway: apiTypes?.rest.map(type => gatewayDetsils[type]) })}
                />
                <Route path='/api-products/create' component={APIProductCreateWrapper} />
                <Route path='/apis/create/graphQL' component={WithSomeValue(ApiCreateGraphQL,
                    { multiGateway: apiTypes?.graphql.map(type => gatewayDetsils[type]) })}
                />
                <Route path='/apis/create/openapi' component={WithSomeValue(ApiCreateSwagger,
                    { multiGateway: apiTypes?.rest.map(type => gatewayDetsils[type]) })}
                />
                <Route path='/apis/create/wsdl' component={WithSomeValue(ApiCreateWSDL,
                    { multiGateway: apiTypes?.soap.map(type => gatewayDetsils[type]) })}
                />
                {/* TODO: Remove ApiCreateWebSocket components and associated routes */}
                <Route path='/apis/create/ws' component={WithSomeValue(ApiCreateWebSocket,
                    { multiGateway: apiTypes?.ws.map(type => gatewayDetsils[type]) })}
                />
                <Route path='/apis/create/streamingapi/:apiType' component={WithSomeValue(APICreateStreamingAPI,
                    { multiGateway: apiTypes?.ws.map(type => gatewayDetsils[type]) })}
                />
                <Route path='/apis/create/asyncapi' component={WithSomeValue(APICreateAsyncAPI,
                    { multiGateway: apiTypes?.ws.map(type => gatewayDetsils[type]) })}
                />
                <Route path='/apis/create/ai-api' component={WithSomeValue(ApiCreateAIAPI,
                    { multiGateway: apiTypes?.ai.map(type => gatewayDetsils[type]) })}
                />
                <Route component={ResourceNotFound} />
            </Switch>
        </Root>
    );
}

export default (APICreateRoutes);
