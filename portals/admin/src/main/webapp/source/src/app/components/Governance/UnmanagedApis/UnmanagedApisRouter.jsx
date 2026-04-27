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
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';

/**
 * Round 9 placeholder for the Unmanaged APIs tab. Renders a single card
 * confirming the tab is registered. Round 10 replaces this with the
 * UnmanagedApisList (summary cards + filters + findings table); Round 11
 * adds the detail page; Round 12 adds polish.
 *
 * @returns {JSX} placeholder body for Governance / Unmanaged APIs
 */
function UnmanagedApisPlaceholder() {
    return (
        <Box p={3}>
            <Card>
                <CardContent>
                    <Typography variant='h5' gutterBottom>
                        <FormattedMessage
                            id='Governance.UnmanagedApis.placeholder.title'
                            defaultMessage='Unmanaged APIs'
                        />
                    </Typography>
                    <Typography variant='body1' color='textSecondary'>
                        <FormattedMessage
                            id='Governance.UnmanagedApis.placeholder.body'
                            defaultMessage={
                                'This tab is the entry point for the API '
                                + 'Discovery Governance feature. The list view '
                                + 'and detail page land in subsequent rounds.'
                            }
                        />
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

/**
 * Routes the /governance/unmanaged-apis URL space. Round 9 only declares
 * the index route; Round 10 + 11 add /:id and any sub-paths.
 *
 * @returns {JSX} react-router Switch for the Unmanaged APIs sub-tree
 */
function UnmanagedApisRouter() {
    return (
        <Switch>
            <Route
                exact
                path='/governance/unmanaged-apis'
                component={UnmanagedApisPlaceholder}
            />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(UnmanagedApisRouter);
