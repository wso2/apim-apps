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
import Notification from 'AppData/Notifications';
import Slide from '@mui/material/Slide';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material/';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/**
* Notification delete pop-up
* @param {any} props Props for notification delete function.
* @returns {any} Returns the pop-up dialog for notification delete confirmation.
*/
const DeleteNotifications = ({ notificationId, isDeleteAll, fetchNotifications }) => {
    const [open, setOpen] = useState(false);

    const toggleDeleteConfirmation = () => {
        setOpen(!open);
    };

    const deleteNotificationById = () => {
        const promisedNotificationDelete = Notification.deleteNotificationById(notificationId);
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
        const promisedNotificationsDelete = Notification.deleteNotifications();
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

    const handleDelete = () => {
        if (isDeleteAll) {
            deleteAllNotifications();
        } else {
            deleteNotificationById();
        }
    };

    return (
        <>
            {isDeleteAll ? (
                <Button
                    onClick={toggleDeleteConfirmation}
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
                    <span>
                        <IconButton
                            onClick={toggleDeleteConfirmation}
                            color='default'
                            size='large'
                        >
                            <Icon>delete</Icon>
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            <Dialog open={open} transition={Slide} role='alertdialog'>
                <DialogTitle>
                    <FormattedMessage
                        id='Notifications.DeleteNotifications.DeleteConfirmation.dialog.title'
                        defaultMessage='Confirm Delete'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
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
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button dense color='grey' onClick={toggleDeleteConfirmation}>
                        <FormattedMessage
                            id='Notifications.DeleteNotifications.DeleteConfirmation.dialog.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={handleDelete}
                    >
                        <FormattedMessage
                            id='Notifications.DeleteNotifications.DeleteConfirmation.dialog,delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
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
