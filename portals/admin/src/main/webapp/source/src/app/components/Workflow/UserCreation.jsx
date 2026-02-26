import React from 'react';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from './WorkflowApprovalTasks';

function ListLabels() {
    const intl = useIntl();

    return (
        <WorkflowApprovalTasks
            workflowTypes={['AM_USER_SIGNUP']}
            title={intl.formatMessage({
                id: 'Workflow.ListUserCreation.title.usercreation',
                defaultMessage: 'User Creation - Approval Tasks',
            })}
            helpLink={Configurations.app.docUrl
                + 'consume/manage-application/advanced-topics/'
                + 'workflows/'}
            searchPlaceholder={intl.formatMessage({
                id: 'Workflow.ListUserCreation.search.default',
                defaultMessage: 'Search by Username, Domain, Email etc',
            })}
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
