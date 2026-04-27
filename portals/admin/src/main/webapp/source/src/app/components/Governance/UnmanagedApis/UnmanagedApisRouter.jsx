/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import UnmanagedApisList from './List/UnmanagedApisList';
import UnmanagedApiDetail from './Detail/UnmanagedApiDetail';

/**
 * Routes the /governance/unmanaged-apis URL space. Round 10 wired the
 * list; Round 11 adds /:id for the detail page. Round 12 may add more
 * sub-paths (e.g., raw evidence drill-down).
 *
 * @returns {JSX} react-router Switch for the Unmanaged APIs sub-tree
 */
function UnmanagedApisRouter() {
    return (
        <Switch>
            <Route
                exact
                path='/governance/unmanaged-apis'
                component={UnmanagedApisList}
            />
            <Route
                exact
                path='/governance/unmanaged-apis/:discoveredApiId'
                component={UnmanagedApiDetail}
            />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(UnmanagedApisRouter);
