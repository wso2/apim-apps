// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.

// WSO2 Inc. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import Listing from './Listing/Listing';
import GlobalPoliciesCreate from './Create/CreateGlobalPolicy';
import GlobalPoliciesEdit from './Edit/EditGlobalPolicy';

/**
 * `Route` elements for shared Global Policies UI.
 * @returns {TSX} Shared Global Policies routes.
 */
const GlobalPolicies = () => {
    return (
        <Switch>
            <Route
                exact
                path='/global-policies'
                component={Listing}
            />
            <Route
                exact
                path='/global-policies/create'
                component={GlobalPoliciesCreate}
            />
            <Route
                exact
                path='/global-policies/:policyId/edit'
                component={GlobalPoliciesEdit}
            />
            <Route component={ResourceNotFound} />
        </Switch>
    );
};

export default GlobalPolicies;