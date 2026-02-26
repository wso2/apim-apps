import React from 'react';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from './WorkflowApprovalTasks';

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
                        id: 'Workflow.APIProductStateChange.title.apistatechange',
                        defaultMessage: 'API Product State Change - Approval Tasks',
                    })
                    : intl.formatMessage({
                        id: 'Workflow.APIStateChange.title.apistatechange',
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
                        id: 'Workflow.apiProduct.statechange.search.default',
                        defaultMessage: 'Search by API Product Name, Requested State, Current State etc',
                    })
                    : intl.formatMessage({
                        id: 'Workflow.APIStateChange.search.default',
                        defaultMessage: 'Search by API Name, Requested State, Current State etc',
                    })
            }
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
