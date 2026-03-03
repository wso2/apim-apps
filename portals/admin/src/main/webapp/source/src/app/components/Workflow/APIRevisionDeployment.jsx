import React from 'react';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from './WorkflowApprovalTasks';

function ListLabels() {
    const intl = useIntl();

    return (
        <WorkflowApprovalTasks
            workflowTypes={['AM_REVISION_DEPLOYMENT']}
            title={intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.title.revisiondeployment',
                defaultMessage: 'Revision Deployment - Approval Tasks',
            })}
            helpLink={Configurations.app.docUrl
                + 'consume/manage-application/advanced-topics/'
                + 'workflows/'}
            searchPlaceholder={intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.search.default',
                defaultMessage: 'Search by Revision Id, API Name, Environment etc',
            })}
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
