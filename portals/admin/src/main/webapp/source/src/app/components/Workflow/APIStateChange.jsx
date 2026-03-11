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

function ListLabels({ isAPIProduct }) {
    const intl = useIntl();

    const workflowTypes = isAPIProduct
        ? ['AM_API_PRODUCT_STATE']
        : ['AM_API_STATE'];

    return (
        <WorkflowApprovalTasks
            workflowTypes={workflowTypes}
            title={
                isAPIProduct
                    ? intl.formatMessage({
                        id: 'Workflow.APIStateChange.api.product.state.change.title',
                        defaultMessage: 'API Product State Change - Approval Tasks',
                    })
                    : intl.formatMessage({
                        id: 'Workflow.APIStateChange.api.state.change.title',
                        defaultMessage: 'API State Change - Approval Tasks',
                    })
            }
            helpLink={
                Configurations.app.docUrl
                + 'design/advanced-topics/adding-an-api-state-change-workflow/'
                + '#adding-an-api-state-change-workflow'
            }
            searchPlaceholder={
                isAPIProduct
                    ? intl.formatMessage({
                        id: 'Workflow.APIStateChange.api.product.state.change.search.default',
                        defaultMessage: 'Search by API Product Name, Requested State, Current State etc',
                    })
                    : intl.formatMessage({
                        id: 'Workflow.APIStateChange.api.state.change.search.default',
                        defaultMessage: 'Search by API Name, Requested State, Current State etc',
                    })
            }
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
