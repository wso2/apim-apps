import React from 'react';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from './WorkflowApprovalTasks';

function ListLabels() {
    const intl = useIntl();

    return (
        <WorkflowApprovalTasks
            workflowTypes={['AM_SUBSCRIPTION_UPDATE']}
            title={intl.formatMessage({
                id: 'Workflow.SubscriptionUpdate.title.subscriptionupdate',
                defaultMessage: 'Subscription Tier Update - Approval Tasks',
            })}
            helpLink={Configurations.app.docUrl
                + 'consume/manage-application/advanced-topics/'
                + 'workflows/'}
            searchPlaceholder={intl.formatMessage({
                id: 'Workflow.SubscriptionUpdate.search.default',
                defaultMessage: 'Search by API Name, Application Name, Subscriber etc',
            })}
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
