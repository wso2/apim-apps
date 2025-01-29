/* eslint-disable */
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
import { Route, Switch, withRouter } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListPolicies from './ListPolicies';
import AddEditPolicy from './AddEditPolicy';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function Policies() {
    return (
        <Switch>
            <Route exact path='/governance/policies' component={ListPolicies} />
            <Route exact path='/governance/policies/create' component={AddEditPolicy} />
            <Route exact path='/governance/policies/:id' component={AddEditPolicy} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(Policies);
