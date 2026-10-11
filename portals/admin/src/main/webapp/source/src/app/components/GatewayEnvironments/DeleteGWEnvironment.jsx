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
    const { id, isPlatformGateway, platformGatewayId } = dataRow;
    const intl = useIntl();

    const formSaveCallback = () => {
        const restApi = new API();
        const isPlatformGw = Boolean(isPlatformGateway && platformGatewayId);
        const promise = isPlatformGw
            ? restApi.deletePlatformGateway(platformGatewayId)
            : restApi.deleteGatewayEnvironment(id);

        return promise
            .then(() => {
                const msg = intl.formatMessage({
                    id: 'AdminPages.Gateways.Delete.form.delete.successful',
                    defaultMessage: 'Gateway Environment deleted successfully',
                });
                setTimeout(() => updateList(), 150);
                return msg;
            })
            .catch((error) => {
                const body = error.response && error.response.body;
                const message = (body && (body.description || body.message))
                    || error.message
                    || intl.formatMessage({
                        id: 'AdminPages.Gateways.Delete.form.delete.error.generic',
                        defaultMessage: 'Failed to delete gateway.',
                    });
                throw message;
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
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
        isReadOnly: PropTypes.bool,
        isPlatformGateway: PropTypes.bool,
        platformGatewayId: PropTypes.string,
    }).isRequired,
};
export default Delete;
