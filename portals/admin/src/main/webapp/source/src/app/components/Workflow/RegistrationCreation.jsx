import React from 'react';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import WorkflowApprovalTasks from './WorkflowApprovalTasks';

function ListLabels() {
    const intl = useIntl();

    return (
        <WorkflowApprovalTasks
            workflowTypes={[
                'AM_APPLICATION_REGISTRATION_PRODUCTION',
                'AM_APPLICATION_REGISTRATION_SANDBOX',
            ]}
            title={intl.formatMessage({
                id: 'Workflow.RegistrationCreation.title.registrationcreation',
                defaultMessage: 'Application Registration - Approval Tasks',
            })}
            helpLink={
                Configurations.app.docUrl
                + 'consume/manage-application/advanced-topics/'
                + 'workflows/'
            }
            searchPlaceholder={intl.formatMessage({
                id: 'Workflow.RegistrationCreation.search.default',
                defaultMessage: 'Search by Application Name, Application Tier, Key Type etc',
            })}
            maxColumnsIncludingAction={5}
        />
    );
}

export default ListLabels;
