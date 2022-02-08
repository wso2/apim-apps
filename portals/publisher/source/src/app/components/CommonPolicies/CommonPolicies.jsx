/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Listing from './Listing';
import CreatePolicy from './CreatePolicy';
import ViewPolicy from './ViewPolicy';

/**
 * Have used key={Date.now()} for `Route` element in `/policies`
 * @returns {JSX} Route components related to globally maintained policy template list.
 */
const CommonPolicies = () => {
    return (
        <Switch>
            <Route
                exact
                path='/policies'
                key={Date.now()}
                component={Listing}
            />
            <Route exact path='/policies/create' component={CreatePolicy} />
            <Route exact path='/policies/:policyId/view' component={ViewPolicy} />
        </Switch>
    );
};

export default CommonPolicies;
