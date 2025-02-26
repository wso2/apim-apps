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

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import { isRestricted } from 'AppData/AuthManager';
import Endpoints from './Endpoints';
import AddEditAIEndpoint from './AIEndpoints/AddEditAIEndpoint';

const Endpoint = () => {
    const [api] = useAPI();
    const urlPrefix = api.isAPIProduct() ? 'api-products' : 'apis';
    return (
        <Switch>
            <Route
                exact
                path={'/' + urlPrefix + '/:api_uuid/endpoints/'}
                component={() => <Endpoints api={api} />}
            />
            {!isRestricted(['apim:api_create']) && (
                <Route
                    exact
                    path={'/' + urlPrefix + '/:api_uuid/endpoints/create'}
                    component={(props) => <AddEditAIEndpoint apiObject={api} {...props} />}
                />
            )}
            {!isRestricted(['apim:api_view', 'apim:api_create']) && (
                <Route
                    exact
                    path={'/' + urlPrefix + '/:api_uuid/endpoints/:id'}
                    component={(props) => <AddEditAIEndpoint apiObject={api} {...props} />}
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
