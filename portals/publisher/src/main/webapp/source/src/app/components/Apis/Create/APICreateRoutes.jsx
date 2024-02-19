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
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Route, Switch } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import APICreateDefault from './Default/APICreateDefault';
import APIProductCreateWrapper from './APIProduct/APIProductCreateWrapper';
import ApiCreateSwagger from './OpenAPI/ApiCreateOpenAPI';
import ApiCreateWSDL from './WSDL/ApiCreateWSDL';
import ApiCreateGraphQL from './GraphQL/ApiCreateGraphQL';
import ApiCreateWebSocket from './WebSocket/ApiCreateWebSocket';
import APICreateStreamingAPI from './StreamingAPI/APICreateStreamingAPI';
import APICreateAsyncAPI from './AsyncAPI/ApiCreateAsyncAPI';

const PREFIX = 'APICreateRoutes';

const classes = {
    content: `${PREFIX}-content`
};

const Root = styled('div')({
    [`&.${classes.content}`]: {
        flexGrow: 1,
    },
});

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
    const { data: settings } = usePublisherSettings();
    const [gateway, setGatewayType] = useState(false);
    
    const getGatewayType = () => {
        if (settings != null) {
            if (settings.gatewayTypes && settings.gatewayTypes.length === 2 ) {
                setGatewayType(true);
            } else {
                setGatewayType(false);
            }
        }
    };

    useEffect(() => {
        getGatewayType();
    }, [settings]);
    
    return (
        <Root className={classes.content}>
            <Switch>
                <Route path='/apis/create/rest' component={WithSomeValue(APICreateDefault, { multiGateway: gateway })}/>
                <Route path='/api-products/create' component={APIProductCreateWrapper} />
                <Route path='/apis/create/graphQL' component={WithSomeValue(ApiCreateGraphQL,
                    { multiGateway: gateway })}
                />
                <Route path='/apis/create/openapi' component={WithSomeValue(ApiCreateSwagger,
                    { multiGateway: gateway })}
                />
                <Route path='/apis/create/wsdl' component={ApiCreateWSDL} />
                {/* TODO: Remove ApiCreateWebSocket components and associated routes */}
                <Route path='/apis/create/ws' component={ApiCreateWebSocket} />
                <Route path='/apis/create/streamingapi/:apiType' component={APICreateStreamingAPI} />
                <Route path='/apis/create/asyncapi' component={APICreateAsyncAPI} />
                <Route component={ResourceNotFound} />
            </Switch>
        </Root>
    );
}

export default (APICreateRoutes);
