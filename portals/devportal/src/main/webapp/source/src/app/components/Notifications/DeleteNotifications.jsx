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

const DeleteNotifications = ({ notificationId, isDeleteAll, fetchNotifications }) => {
    const [open, setOpen] = useState(false);

    const toggleDeleteConfirmation = () => {
        setOpen(!open);
    };

    const deleteNotificationById = () => {
        const promisedNotificationDelete = Notification.deleteNotification(notificationId);
        promisedNotificationDelete
            .then(() => {
                Alert.info('Notification deleted successfully!');
                setOpen(!open);
                fetchNotifications();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error('Error occurred while deleting the notification', errorResponse);
                setOpen(!open);
            });
    };

    const deleteAllNotifications = () => {
        const promisedNotificationsDelete = Notification.deleteNotifications();
        promisedNotificationsDelete
            .then(() => {
                Alert.info('All Notifications deleted successfully!');
                setOpen(!open);
                fetchNotifications();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error('Error occurred while deleting notifications', errorResponse);
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
                <Button onClick={toggleDeleteConfirmation} style={{ backgroundColor: '#ffa911' }}>Clear All</Button>
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
                                    defaultMessage='Are you sure you want to delete all Notifications?'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Notifications.DeleteNotifications.deleteNotificationById.confirm.dialog.confirm.content'
                                    defaultMessage='Are you sure you want to delete this Notification?'
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
    notificationId: PropTypes.number,
    // eslint-disable-next-line react/require-default-props
    isDeleteAll: PropTypes.bool,
    fetchNotifications: PropTypes.func.isRequired,
};

export default DeleteNotifications;
