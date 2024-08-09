/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
function Delete({ updateList, dataRow }) {
    const { id } = dataRow;
    const intl = useIntl();

    const formSaveCallback = () => {
        const restApi = new API();
        return restApi
            .deleteGatewayEnvironment(id)
            .then(() => {
                return (
                    intl.formatMessage({
                        id: 'AdminPages.Gateways.Delete.form.delete.successful',
                        defaultMessage: 'Gateway Environment deleted successfully',
                    })
                );
            })
            .catch((error) => {
                throw (error.response.body.description);
            })
            .finally(() => {
                updateList();
            });
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'AdminPages.Gateways.Delete.form.delete.confirmation.message.title',
                defaultMessage: 'Delete Gateway Environment?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.Gateways.Delete.form.delete.confirmation.delete.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon />}
            triggerIconProps={{ disabled: dataRow && dataRow.isReadOnly }}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                <FormattedMessage
                    id='AdminPages.Gateways.Delete.form.delete.confirmation.message'
                    defaultMessage='Are you sure you want to delete this Gateway Environment?'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}
Delete.propTypes = {
    updateList: PropTypes.number.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }).isRequired,
};
export default Delete;
