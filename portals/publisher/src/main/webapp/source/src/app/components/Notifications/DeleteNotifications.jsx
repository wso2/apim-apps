import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Alert from 'AppComponents/Shared/Alert';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';
import API from 'AppData/api';

const DeleteNotifications = ({ notificationId, fetchNotifications, isDeleteAll }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const deleteNotificationById = () => {
        const promisedNotificationDelete = API.deleteNotification(notificationId);
        promisedNotificationDelete
            .then(() => {
                Alert.info('Notification deleted successfully!');
                setOpen(!open);
                fetchNotifications(); 
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error('Error occurred while deleting the notification');
                setOpen(!open);
            });
       
    };

    const deleteAllNotifications = () => {
        const promisedNotificationsDelete = API.deleteNotifications();
        promisedNotificationsDelete
            .then(() => {
                Alert.info('All Notifications deleted successfully!');
                setOpen(!open);
                fetchNotifications(); 
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error('Error occurred while deleting notifications');
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
                <Button onClick={toggleOpen} aria-label='Delete Notification'>
                    <Icon>delete_forever</Icon>
                </Button>
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
                            defaultMessage='Are you sure you want to delete all Notifications?'
                        />
                    ) : (
                        <FormattedMessage
                            id='Notifications.DeleteNotifications.deleteNotificationById.confirm.dialog.confirm.content'
                            defaultMessage='Are you sure you want to delete this Notification?'
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
