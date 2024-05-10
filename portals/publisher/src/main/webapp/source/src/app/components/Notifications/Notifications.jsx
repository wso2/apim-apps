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
import { styled } from '@mui/material/styles';
import {
    Button,
    Grid,
    Tooltip,
    Typography,
    Card,
    CardContent,
    Box,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import Configurations from 'Config';
import { FormattedMessage, useIntl } from 'react-intl';
import MUIDataTable from 'mui-datatables';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import API from 'AppData/api';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import { Progress } from 'AppComponents/Shared';
import Alert from 'AppComponents/Shared/Alert';
import Onboarding from 'AppComponents/Shared/Onboarding/Onboarding';
import DeleteNotifications from './DeleteNotifications';

const PREFIX = 'Notifications';

const classes = {
    table: `${PREFIX}-table`,
    heading: `${PREFIX}-heading`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    icon: `${PREFIX}-icon`,
    select: `${PREFIX}-select`, 
    buttonContainer: `${PREFIX}-buttonContainer`, 
    cardBox: `${PREFIX}-cardBox` 
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.table}`]: {
        margin: '0 auto',
        maxWidth: '90%',
        '& > td[class^=MUIDataTableBodyCell-cellHide-]': {
            display: 'none',
        },
        '& .MUIDataTableBodyCell-cellHide-793': {
            display: 'none',
        },
        '& td': {
            wordBreak: 'break-word',
        },
        '& th': {
            minWidth: '150px',
        },
    },
    [`& .${classes.heading}`]: {
        flexGrow: 1,
        marginTop: 0,
    },
    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    [`& .${classes.mainTitle}`]: {
        paddingLeft: 10,
        marginLeft: '3.6%',
        [theme.breakpoints.down('sm')]: {
            marginLeft: '2.5%', 
        },
    },
    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },
    [`& .${classes.icon}`]: {
        marginRight: theme.spacing(0.5),
    },
    [`& .${classes.select}`]: { 
        
        border: '1px solid #ccc',
        borderRadius: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    [`& .${classes.buttonContainer}`]: { 
        '& > *': {
            marginRight: theme.spacing(0.5),
            marginLeft: theme.spacing(0.5),
        },
    },
    [`& .${classes.cardBox}`]: { 
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            marginTop: theme.spacing(1),
        },
    },
}));

/**
* Notification page
* @returns {any} render the notification page
*/
const Notifications = () => {
    const intl = useIntl();
    const [notifications, setNotifications] = useState(null);
    const [sortOption, setSortOption] = useState('newest'); 
    const [loading, setLoading] = useState(false);
    const [notFound, setnotFound] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [count, setCount] = useState(0);
    
    const fetchNotifications = (sortOrder, limit, offset) => {
        setLoading(true);
        const promisedNotifications = API.getNotifications(sortOrder, limit, offset);
        promisedNotifications
            .then((response) => {
                const { list, pagination } = response.body;
                setNotifications(list);
                setCount(pagination.total);
            })
            .catch((error) => {
                console.error(error);
                setnotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getNotificationTypeDisplayName = (notificationType) => {
        return Configurations.notificationTypes[notificationType] || notificationType;
    };

    const getNotificationList = () => {
        const notificationList = notifications?.map(notification => {
            return {
                notificationId: notification.notificationId,
                notificationType: getNotificationTypeDisplayName(notification.notificationType),
                sentDate: notification.createdTime,
                notification: notification.comments,
                isRead: notification.isRead,
            };
        });
       
        return notificationList;
    }

    useEffect(() => {
        fetchNotifications(sortOption === 'newest' ? 'desc' : 'asc', rowsPerPage, page * rowsPerPage);
    }, [page, rowsPerPage]);

    const notificationList = getNotificationList();

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage) => {
        if (page * rowsPerPage > count) {
            setPage(0);
        }
        setRowsPerPage(newRowsPerPage);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
        fetchNotifications(event.target.value === 'newest' ? 'desc' : 'asc', rowsPerPage, page * rowsPerPage);
    };

    const markAsRead = (notificationId) => {
        const body = {
            read: true
        };

        const promisedMarkAsRead = API.markNotificationAsReadById(notificationId, body);
        promisedMarkAsRead
            .then((response) => {
                console.log(response);
                Alert.info('Marked the notification as read successfully!');

            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error while marking the notification as read!');
                setnotFound(true);
            })
            .finally(() => {
                fetchNotifications(sortOption === 'newest' ? 'desc' : 'asc', rowsPerPage, page * rowsPerPage);
            });
    };


    const markAllAsRead = () => {
        const body = {
            read: true
        };

        const promisedMarkAsRead = API.markAllNotificationsAsRead(body);
        promisedMarkAsRead
            .then((response) => {
                console.log(response);
                Alert.info('Marked all notifications as read successfully!');

            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error while marking all notifications as read!');
                setnotFound(true);
            })
            .finally(() => {
                fetchNotifications(sortOption === 'newest' ? 'desc' : 'asc', rowsPerPage, page * rowsPerPage);
            });
    };

    const notificationTypeColors = {
        'API State Change': '#a2e8ff',
        'API Product State Change': '#ffa966',
        'API Revision Deployment': '#ff5d5d',
    };

    const columns = [
        {
            name: 'notificationId',
            label: intl.formatMessage({
                id: 'Notification.table.header.notificationId',
                defaultMessage: 'Notification ID',
            }),
            options: {
                sort: false,
                display: false,
            },
        },
        {
            name: 'notificationType',
            label: intl.formatMessage({
                id: 'Notification.table.header.notificationType',
                defaultMessage: 'Notification Type',
            }),
            options: {
                sort: false,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = notificationList[tableMeta.rowIndex];
                    const backgroundColor = notificationTypeColors[dataRow.notificationType] || '#ffffff'; 
                    if (dataRow.isRead){
                        return (
                            <Chip 
                                label={dataRow.notificationType} 
                                style={{ backgroundColor: '#dcd7d3', color: '#000000', opacity:0.5 }} />
                        );
                    }else{
                        return (
                            <Chip label={dataRow.notificationType} style={{ backgroundColor, color: '#000000' }} />
                        );  
                    }
                   
                },
            },
        },
        {
            name: 'notification',
            label: intl.formatMessage({
                id: 'Notification.table.header.notification',
                defaultMessage: 'Notification',
            }),
            options: {
                sort: false,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = notificationList[tableMeta.rowIndex];
                   
                    return (
                        <div style={{ opacity: dataRow.isRead ? 0.5 : 1, 
                            pointerEvents: dataRow.isRead ? 'none' : 'auto' }}>
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: 'receivedDate',
            label: intl.formatMessage({
                id: 'Notification.table.header.receivedDate',
                defaultMessage: 'Received Date',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = notificationList[tableMeta.rowIndex];
                    if (dataRow) {
                        const { sentDate } = dataRow;
                        dayjs.extend(relativeTime);
                        const time = dayjs(sentDate).fromNow();
                        dayjs.extend(localizedFormat);
                        const format = dayjs(sentDate).format('LLL');
                        return (
                            <div>
                                <Tooltip title={format}>
                                    <Typography color='textSecondary' variant='caption'>
                                        {time}
                                    </Typography>
                                </Tooltip>
                            </div>
                        );
                    }
                    return null; 
                },
            },
        },
        {
            name: 'markAsRead',
            label: intl.formatMessage({
                id: 'Notification.table.header.markAsRead',
                defaultMessage: 'Mark as Read',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = notificationList[tableMeta.rowIndex];
                    return (
                        <div>
                            <Box component='span' m={1}>
                                <Tooltip title={dataRow.isRead ? null : (
                                    <FormattedMessage
                                        id='Notification.table.header.markAsRead.tooltip'
                                        defaultMessage='Mark as Read'
                                    />
                                )}
                                >
                                    <IconButton
                                        color='primary'
                                        aria-label='make mark as read'
                                        onClick={() => markAsRead(dataRow.notificationId)}
                                        disabled={dataRow.isRead}
                                    >
                                        {dataRow.isRead ? (
                                            <DoneAllIcon />
                                        ) : (
                                            <MarkunreadIcon />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Actions',
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (tableMeta.rowData) {
                        const notificationId = tableMeta.rowData[0];
                        return (
                            <Box component='span' m={1}>
                                <DeleteNotifications 
                                    notificationId={notificationId} 
                                    fetchNotifications={() => fetchNotifications(
                                        sortOption === 'newest' ? 'desc' : 'asc',
                                        rowsPerPage,
                                        page * rowsPerPage,
                                    )}
                                />
                            </Box>
                        );
                    }
                    return false;
                },
                filter: false,
                sort: false,
                label: (
                    <FormattedMessage
                        id='Notification.table.header.actions.title'
                        defaultMessage='Action'
                    />
                ),
            },
        },
    ];

    const options = {
        filterType: 'multiselect',
        selectableRows: 'none',
        title: false,
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        rowsPerPageOptions: [5, 10, 25, 50, 100],
        pagination: true,
        count,
        page,
        rowsPerPage,
        onChangePage: handlePageChange,
        onChangeRowsPerPage: handleRowsPerPageChange,
        onTableChange: (action, tableState) => {
            switch (action) {
                case 'changePage':
                    handlePageChange(tableState.page);
                    break;
                default:
                    break;
            }
        },
        serverSide: true,
    };

    if (loading) {
        return <Progress per={90} message='Loading Notifications ...' />;
    }

    if (notifications && notifications.length === 0) {
        return (
            <Onboarding
                title={
                    <FormattedMessage
                        id='Notification.onboarding.display.message'
                        defaultMessage='You do not have any notifications!'
                    />
                }  
            />

        );
    }

    if (notFound || !notifications) {
        return <ResourceNotFoundError />;
    }

    return (
        <Root>
            <div className={classes.heading}>
                <Card style={{ marginBottom: '20px' }} 
                    display='flex' 
                    flexDirection='row'>
                    <CardContent>
                        <Box
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                            className={classes.cardBox}
                        >
                            <Typography
                                variant='h4'
                                align='left'
                                component='h1'
                                className={classes.mainTitle}
                            >
                                <FormattedMessage
                                    id='Notification.page.title'
                                    defaultMessage='Notifications'
                                />
                            </Typography>
                            <Box display='flex' alignItems='center'>
                                <FormControl className={classes.select}>
                                    <Select
                                        value={sortOption}
                                        onChange={handleSortChange}
                                        sx={{
                                            '& .MuiSelect-select': {
                                                paddingTop: 1,
                                                paddingBottom: 1,
                                            },
                                        }}
                                    >
                                        <MenuItem value='newest'>Newest</MenuItem>
                                        <MenuItem value='oldest'>Oldest</MenuItem>
                                    </Select>
                                </FormControl>
                                <Box className={classes.buttonContainer}>
                                    <DeleteNotifications 
                                        isDeleteAll
                                        fetchNotifications={() => fetchNotifications(
                                            sortOption === 'newest' ? 'desc' : 'asc',
                                            rowsPerPage,
                                            page * rowsPerPage,
                                        )}
                                    />
                                    <Button
                                        variant='contained'
                                        color='primary' 
                                        onClick={markAllAsRead}
                                    >
                                        Mark All As Read
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card> 
                <Grid
                    container
                    justify='center'
                    spacing={2}
                >
                    <Grid item xs={12} className={classes.tableContainer}>
                        <MUIDataTable
                            className={classes.table}
                            title={false}
                            data={notificationList}
                            columns={columns}
                            options={options}
                        />
                    </Grid>
                </Grid>
            </div>
        </Root>    
    );
};

export default Notifications;