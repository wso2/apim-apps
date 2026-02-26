import React from 'react';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from './WorkflowApprovalTasks';

function ListLabels() {
    const intl = useIntl();

    return (
        <WorkflowApprovalTasks
            workflowTypes={['AM_APPLICATION_DELETION']}
            title={intl.formatMessage({
                id: 'Workflow.ApplicationDeletion.title.applicationdeletion',
                defaultMessage: 'Application Deletion - Approval Tasks',
            })}
            helpLink={Configurations.app.docUrl
                + 'consume/manage-application/advanced-topics/'
                + 'workflows/'}
            searchPlaceholder={intl.formatMessage({
                id: 'Workflow.applicationdeletion.search.default',
                defaultMessage: 'Search by Application Name, Application Tier, Application Owner etc',
            })}
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
