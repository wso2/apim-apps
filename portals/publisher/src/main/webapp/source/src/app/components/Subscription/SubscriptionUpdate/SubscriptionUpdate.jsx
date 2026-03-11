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
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from 'AppComponents/Workflow/WorkflowApprovalTasks';

function ListLabels() {
    const intl = useIntl();

    return (
        <WorkflowApprovalTasks
            workflowTypes={['AM_SUBSCRIPTION_UPDATE']}
            title={intl.formatMessage({
                id: 'Subscription.SubscriptionUpdate.SubscriptionUpdate.subscription.update.title',
                defaultMessage: 'Subscription Update - Approval Tasks',
            })}
            helpLink={Configurations.app.docUrl
                + 'consume/manage-application/advanced-topics/'
                + 'workflows/'}
            searchPlaceholder={intl.formatMessage({
                id: 'Subscription.SubscriptionUpdate.SubscriptionUpdate.subscription.update.search.default',
                defaultMessage: 'Search by API Name, Application Name, Subscriber etc',
            })}
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
