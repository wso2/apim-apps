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

import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import Progress from 'AppComponents/Shared/Progress';

import Listing from './Listing/Listing';

/* if needs to pre fetch use 'webpackPrefetch: true' */

const Details = lazy(() => import('./Details/index' /* webpackChunkName: "DeferredDetails" */));
const DeferredDetails = (props) => (
    <Suspense fallback={<Progress per={50} message='Loading Details component ...' />}>
        <Details {...props} />
    </Suspense>
);

/**
 * Have used key={Date.now()} for `Route` element in `/apis` and `/api-products`
 */
const Apis = () => {
    return (
        <Switch>
            <Route
                exact
                path='/apis'
                key={Date.now()}
                render={(props) => <Listing {...props} isAPIProduct={false} />}
            />
            <Route path='/apis/search' render={(props) => <Listing {...props} isAPIProduct={false} />} />
            <Route path='/apis/:apiUUID/' render={(props) => <DeferredDetails {...props} isAPIProduct={false} />} />
        </Switch>
    );
};

export default Apis;
