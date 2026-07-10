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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import Alert from 'AppComponents/Shared/Alert';

/**
 * Renders delete dialog or a disabled icon for read-only (global) templates.
 * @param {Object} props component properties
 * @returns {JSX} Delete control
 */
function DeleteTemplate({ updateList, dataRow }) {
    const { id, isReadOnly } = dataRow;
    const intl = useIntl();

    if (isReadOnly) {
        return (
            <Tooltip
                title={intl.formatMessage({
                    id: 'Governance.Templates.Delete.readOnly.tooltip',
                    defaultMessage: 'Global templates can only be deleted by Super Tenant admins',
                })}
            >
                <span>
                    <IconButton size='large' disabled>
                        <DeleteForeverIcon />
                    </IconButton>
                </span>
            </Tooltip>
        );
    }

    const formSaveCallback = () => {
        return new GovernanceAPI()
            .deleteDevportalGovernanceTemplate(id)
            .then(() => (
                <FormattedMessage
                    id='Governance.Templates.Delete.success'
                    defaultMessage='Template deleted successfully'
                />
            ))
            .catch((error) => {
                const { response, message } = error;
                if (response && response.body) {
                    Alert.error(response.body.message);
                } else if (message) {
                    Alert.error(message);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Governance.Templates.Delete.error',
                        defaultMessage: 'Something went wrong while deleting the Template',
                    }));
                }
            })
            .finally(() => {
                updateList();
            });
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'Governance.Templates.Delete.dialog.title',
                defaultMessage: 'Delete Template?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'Governance.Templates.Delete.dialog.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon />}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                <FormattedMessage
                    id='Governance.Templates.Delete.confirmation'
                    defaultMessage='Are you sure you want to delete this Template? This action cannot be undone.'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}

DeleteTemplate.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
        isReadOnly: PropTypes.bool,
    }).isRequired,
};

export default DeleteTemplate;
