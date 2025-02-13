/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import API from 'AppData/api';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';

/**
 * Render delete dialog box.
 * @param {JSON} props component props.
 * @returns {JSX} Loading animation.
 */
function DeleteAiVendor({ updateList, dataRow }) {
    const { id, builtInSupport } = dataRow;
    const intl = useIntl();
    const formSaveCallback = () => {
        return new API()
            .deleteAiVendor(id)
            .then(() => (
                <FormattedMessage
                    id='AdminPages.AiVendor.Delete.form.delete.successful'
                    defaultMessage='AI/LLM Vendor deleted successfully'
                />
            ))
            .catch((error) => {
                throw new Error(error.response.body.description);
            })
            .finally(() => {
                updateList();
            });
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'AdminPages.AiVendor.Delete.form.delete.dialog.title',
                defaultMessage: 'Delete AI/LLM Vendor ?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.AiVendor.Delete.form.delete.dialog.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon aria-label='ai-vendor-delete-icon' />}
            formSaveCallback={formSaveCallback}
            triggerIconProps={{
                color: 'primary',
                component: 'span',
                disabled: builtInSupport,
            }}
        >
            <DialogContentText>
                <FormattedMessage
                    id='AdminPages.AiVendor.Delete.form.delete.confirmation.message'
                    defaultMessage='Are you sure you want to delete this AI/LLM Vendor ?'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}
DeleteAiVendor.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};
export default DeleteAiVendor;
