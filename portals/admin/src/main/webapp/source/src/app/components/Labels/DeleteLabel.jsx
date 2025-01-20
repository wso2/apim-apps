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
import API from 'AppData/api';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import Alert from 'AppComponents/Shared/Alert';

/**
 * Render delete dialog box.
 * @param {JSON} props component props.
 * @returns {JSX} Loading animation.
 */
function Delete({ updateList, dataRow }) {
    const { id, noOfApis } = dataRow;
    const intl = useIntl();
    const getValidationErrors = () => {
        let errorText = '';
        if (noOfApis > 0) {
            errorText += 'Unable to delete the Label. It is attached to API(s)';
        }
        return errorText;
    };

    const formSaveCallback = () => {
        const validationErrors = getValidationErrors();
        if (validationErrors !== '') {
            Alert.error(validationErrors);
            return false;
        }

        const restApi = new API();
        return restApi
            .deleteLabel(id)
            .then(() => {
                return (
                    <FormattedMessage
                        id='AdminPages.Labels.Delete.form.delete.successful'
                        defaultMessage='Label deleted successfully'
                    />
                );
            })
            .catch((error) => {
                throw error.response.body.description;
            })
            .finally(() => {
                updateList();
            });
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'AdminPages.Labels.Delete.form.delete.title',
                defaultMessage: 'Delete Label?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.Labels.Delete.form.delete.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon />}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                <FormattedMessage
                    id='AdminPages.Labels.Delete.form.delete.content'
                    defaultMessage='Are you sure you want to delete this Label?'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}
Delete.propTypes = {
    updateList: PropTypes.number.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.number.isRequired,
        noOfApis: PropTypes.number,
    }).isRequired,
};
export default Delete;
