/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import Grid from '@mui/material/Grid';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import APICategoriesCard from 'AppComponents/AdminPages/Dashboard/APICategoriesCard';
import RateLimitingCard from 'AppComponents/AdminPages/Dashboard/RateLimitingCard';
import TasksWorkflowCard from 'AppComponents/AdminPages/Dashboard/TasksWorkflowCard';
import { useAppContext } from 'AppComponents/Shared/AppContext';

/**
 * Render progress inside a container centering in the container.
 * @returns {JSX} Loading animation.
 */
export default function Dashboard() {
    const { user: { _scopes } } = useAppContext();
    const hasWorkflowViewPermission = _scopes.includes('apim:api_workflow_view');
    const hasPolicyViewPermission = _scopes.includes('apim:admin_tier_view');
    const hasAPICategoryViewPermission = _scopes.includes('apim:api_category');
    return (
        <ContentBase width='full' title='Dashboard' pageStyle='paperLess'>
            <Grid container spacing={3} justifyContent='center'>
                {hasPolicyViewPermission && (
                    <Grid item xs={11} md={6}>
                        <RateLimitingCard />
                    </Grid>
                )}
                {hasAPICategoryViewPermission && (
                    <Grid item xs={11} md={6}>
                        <APICategoriesCard />
                    </Grid>
                )}
                {hasWorkflowViewPermission && (
                    <Grid item xs={11} md={6}>
                        <TasksWorkflowCard />
                    </Grid>
                )}
            </Grid>
        </ContentBase>
    );
}
