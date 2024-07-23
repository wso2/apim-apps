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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Notification from 'AppData/Notifications';
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

/**
* Notification icon
* @returns {any} Returns the notification icon with the count of unread notifications.
*/
const NotificationIcon = () => {
    const [notificationCount, setNotificationCount] = useState(0);

    const getUnreadNotificationCount = () => {
        const promisedNotifications = Notification.getNotifications('desc', 5, 0);
        promisedNotifications
            .then((res) => {
                const { unreadCount } = res.body;
                setNotificationCount(unreadCount);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        getUnreadNotificationCount();
        const notificationPollingInterval = setInterval(getUnreadNotificationCount, 5000);

        return () => {
            clearInterval(notificationPollingInterval);
        };
    }, []);

    return (
        <Box display='flex' alignItems='center' mr={2.5}>
            <Link to='/notifications' aria-label='Go to notification page'>
                {notificationCount > 0 ? (
                    <Badge
                        badgeContent={(
                            <span style={{
                                backgroundColor: 'orange',
                                borderRadius: '50%',
                                padding: '3px 6px',
                                fontSize: '0.8rem',
                                color: '#000000',
                            }}
                            >
                                {notificationCount}
                            </span>
                        )}
                    >
                        <NotificationsNoneIcon style={{ color: 'white', fontSize: 25 }} />
                    </Badge>
                ) : (
                    <NotificationsNoneIcon style={{ color: 'white', fontSize: 25 }} />
                )}
            </Link>
        </Box>
    );
};

export default NotificationIcon;
