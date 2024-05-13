/*
* Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Alert from 'AppComponents/Shared/Alert';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';
import API from 'AppData/api';
import Tooltip from '@mui/material/Tooltip';

/**
* Notification delete pop-up
* @param {any} props Props for notification delete function.
* @returns {any} Returns the pop-up dialog for notification delete confirmation.
*/
const DeleteNotifications = ({ notificationId, fetchNotifications, isDeleteAll }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const deleteNotificationById = () => {
        const promisedNotificationDelete = API.deleteNotificationById(notificationId);
        promisedNotificationDelete
            .then(() => {
                Alert.info(
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.deleteNotificationById.success'
                        defaultMessage='Notification deleted successfully!'
                    />,
                );
                setOpen(!open);
                fetchNotifications(); 
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error(
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.deleteNotificationById.error'
                        defaultMessage='Error occurred while deleting the notification'
                    />,
                    errorResponse,
                );
                setOpen(!open);
            });
       
    };

    const deleteAllNotifications = () => {
        const promisedNotificationsDelete = API.deleteNotifications();
        promisedNotificationsDelete
            .then(() => {
                Alert.info(
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.deleteAllNotifications.success'
                        defaultMessage='All notifications are deleted successfully!'
                    />,
                );
                setOpen(!open);
                fetchNotifications(); 
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error(
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.deleteAllNotifications.error'
                        defaultMessage='Error occurred while deleting notifications'
                    />,
                    errorResponse,
                );
                setOpen(!open);
            });
       
    };

    const runAction = (confirm) => {
        if (confirm) {
            if (isDeleteAll) {
                deleteAllNotifications();
            } else {
                deleteNotificationById();
            }
        } else {
            setOpen(!open);
        }
    };

    return (
        <>
            {isDeleteAll ? (
                <Button 
                    onClick={toggleOpen} 
                    variant='contained'
                    style={{ backgroundColor: 'orange' }}
                >
                    Clear All
                </Button>
            ) : (
                <Tooltip title={(
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.delete.tooltip'
                        defaultMessage='Delete'
                    />
                )}
                >
                    <Button onClick={toggleOpen} aria-label='Delete Notification'>
                        <Icon>delete_forever</Icon>
                    </Button>
                </Tooltip>
                
            )}
            
            <ConfirmDialog
                key='key-dialog'
                labelCancel={
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.confirm.dialog.cancel.delete'
                        defaultMessage='Cancel'
                    />
                }
                title={
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.confirm.dialog.confirm.title'
                        defaultMessage='Confirm Delete'
                    />
                }
                message={
                    isDeleteAll ? (
                        <FormattedMessage
                            id='Notifications.DeleteNotifications.deleteAll.confirm.dialog.confirm.content'
                            defaultMessage='Are you sure you want to delete all notifications?'
                        />
                    ) : (
                        <FormattedMessage
                            id='Notifications.DeleteNotifications.deleteNotificationById.confirm.dialog.confirm.content'
                            defaultMessage='Are you sure you want to delete this notification?'
                        />
                    )
                }
                labelOk={
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.confirm.dialog.confirm.delete'
                        defaultMessage='Yes'
                    />
                }
                callback={runAction}
                open={open}
            />
        </>
    );
};

DeleteNotifications.propTypes = {
    // eslint-disable-next-line react/require-default-props
    notificationId: PropTypes.string,
    // eslint-disable-next-line react/require-default-props
    isDeleteAll: PropTypes.bool, 
    fetchNotifications: PropTypes.func.isRequired,
};

export default DeleteNotifications;
