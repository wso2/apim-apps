/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import GovernanceAPI from 'AppData/GovernanceAPI';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import Alert from 'AppComponents/Shared/Alert';

/**
 * Renders delete dialog box
 * @param {JSON} props component properties
 * @returns {JSX} Delete dialog box
 */
function DeleteRuleset({ updateList, dataRow }) {
    const { id } = dataRow;
    const intl = useIntl();

    const formSaveCallback = () => {
        return new GovernanceAPI()
            .deleteRuleset(id)
            .then(() => (
                <FormattedMessage
                    id='AdminPages.Governance.Ruleset.Delete.form.delete.successful'
                    defaultMessage='Ruleset deleted successfully'
                />
            ))
            .catch((error) => {
                const { response, message } = error;
                if (response && response.body) {
                    Alert.error(response.body.message);
                } else if (message) {
                    Alert.error(message);
                } else {
                    Alert.error(
                        intl.formatMessage({
                            id: 'AdminPages.Governance.Ruleset.Delete.form.delete.error',
                            defaultMessage: 'Something went wrong while deleting the Ruleset',
                        }),
                    );
                }
            })
            .finally(() => {
                updateList();
            });
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'AdminPages.Governance.Ruleset.Delete.form.delete.dialog.title',
                defaultMessage: 'Delete Ruleset?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.Governance.Ruleset.Delete.form.delete.dialog.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon />}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                <FormattedMessage
                    id='AdminPages.Governance.Ruleset.Delete.form.delete.confirmation.message'
                    defaultMessage='Are you sure you want to delete this Ruleset?'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}

DeleteRuleset.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};

export default DeleteRuleset;
