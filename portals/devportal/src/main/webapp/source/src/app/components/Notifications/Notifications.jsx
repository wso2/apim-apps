import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
    FormControl,
    Select,
    MenuItem,
    Paper,
} from '@mui/material';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Notification from 'AppData/Notifications';
import MUIDataTable from 'mui-datatables';
import Loading from 'AppComponents/Base/Loading/Loading';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Chip from '@mui/material/Chip';
import Alert from 'AppComponents/Shared/Alert';
import DeleteNotifications from 'AppComponents/Notifications/DeleteNotifications';
import ResourceNotFound from '../Base/Errors/ResourceNotFound';

const PREFIX = 'Notifications';

const classes = {
    table: `${PREFIX}-table`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.table}`]: {
        margin: '0 auto',
        maxWidth: '100%',
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
            backgroundColor: theme.custom.listView.tableHeadBackground,
            color: theme.palette.getContrastText(theme.custom.listView.tableHeadBackground),
        },
        '& table tr:nth-child(even)': {
            backgroundColor: theme.custom.listView.tableBodyEvenBackgrund,
            '& td, & a, & .material-icons': {
                color: theme.palette.getContrastText(theme.custom.listView.tableBodyEvenBackgrund),
            },
        },
        '& table tr:nth-child(odd)': {
            backgroundColor: theme.custom.listView.tableBodyOddBackgrund,
            '& td, & a, & .material-icons': {
                color: theme.palette.getContrastText(theme.custom.listView.tableBodyOddBackgrund),
            },
        },
    },
}));

const Notifications = () => {
    const intl = useIntl();
    const [notifications, setNotifications] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortOption, setSortOption] = useState('newest');
    const [notFound, setnotFound] = useState(false);

    const fetchNotifications = () => {
        setLoading(true);
        const promisedNotifications = Notification.getNotifications();
        promisedNotifications
            .then((response) => {
                setNotifications(response.body.list);
            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error occurred while fetching notifications', error);
                setnotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getNotificationList = () => {
        const notificationList = notifications?.map((notification) => {
            return {
                notificationId: notification.notificationId,
                notificationType: notification.notificationType,
                sentDate: notification.createdTime,
                notification: notification.comments,
                isRead: notification.isRead,
            };
        });

        return notificationList;
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const markAsRead = (notificationId) => {
        const body = {
            read: true,
        };

        const promisedMarkAsRead = Notification.markNotificationAsReadById(notificationId, body);
        promisedMarkAsRead
            .then((response) => {
                console.log(response);
                Alert.info('Marked the notification as read successfully!');
            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error while marking the notification as read!', error);
                setnotFound(true);
            })
            .finally(() => {
                fetchNotifications();
            });
    };

    const markAllAsRead = () => {
        const body = {
            read: true,
        };

        const promisedMarkAsRead = Notification.markAllNotificationsAsRead(body);
        promisedMarkAsRead
            .then((response) => {
                console.log(response);
                Alert.info('Marked all notifications as read successfully!');
            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error while marking all notifications as read!', error);
                setnotFound(true);
            })
            .finally(() => {
                fetchNotifications();
            });
    };

    const notificationList = getNotificationList();

    const notificationTypeColors = {
        API_STATE_CHANGE: '#a2e8ff',
        APPLICATION_CREATION: '#ffa966',
        SUBSCRIPTION_CREATION: '#eff589',
        SUBSCRIPTION_UPDATE: '#f7bef4',
        SUBSCRIPTION_DELETION: '#ab93fc',
        APPLICATION_REGISTRATION_PRODUCTION: '#93fcb8',
        APPLICATION_REGISTRATION_SANDBOX: '#fcd693',
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
                    if (dataRow.isRead) {
                        return (
                            <Chip
                                label={dataRow.notificationType}
                                style={{ backgroundColor: '#dcd7d3', color: '#000000', opacity: 0.5 }}
                            />
                        );
                    } else {
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
                        <div style={{
                            opacity: dataRow.isRead ? 0.5 : 1,
                            pointerEvents: dataRow.isRead ? 'none' : 'auto',
                        }}
                        >
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
                defaultMessage: 'Mark As Read',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = notificationList[tableMeta.rowIndex];
                    return (
                        <div>
                            <Tooltip title={dataRow.isRead ? null : (
                                <FormattedMessage
                                    id='Notification.table.header.markAsRead.tooltip'
                                    defaultMessage='Mark As Read'
                                />
                            )}
                            >
                                <span>
                                    <IconButton
                                        color='primary'
                                        size='large'
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
                                </span>
                            </Tooltip>
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
                                <DeleteNotifications notificationId={notificationId} fetchNotifications={fetchNotifications} />
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
    };

    if (loading) {
        return <Loading />;
    }

    if (notifications && notifications.length === 0) {
        return (
            <Box sx={{ flexGrow: 1 }}>
                <Box
                    display='flex'
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent='space-between'
                    alignItems='center'
                    sx={(theme) => ({
                        minHeight: 80,
                        background: theme.custom.infoBar.background,
                        color: theme.palette.getContrastText(theme.custom.infoBar.background),
                        borderBottom: `solid 1px ${theme.palette.grey.A200}`,
                        padding: { xs: theme.spacing(2, 0), sm: theme.spacing(0, 4) },
                    })}
                >
                    <Typography
                        variant='h4'
                        align='left'
                        component='h1'
                    >
                        <FormattedMessage
                            id='Notifications.Onboarding.page.title'
                            defaultMessage='Notifications'
                        />
                    </Typography>
                </Box>
                <div style={{ alignItems: 'center', margin: '2rem' }}>
                    <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Typography
                            variant='h4'
                            align='center'
                            component='h1'
                        >
                            <FormattedMessage
                                id='Notifications.Onboarding.display.message'
                                defaultMessage='You do not have any notification!'
                            />
                        </Typography>
                    </Box>
                </div>
            </Box>
        );
    }

    if (notFound || !notifications) {
        return <ResourceNotFound />;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box
                display='flex'
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                sx={(theme) => ({
                    minHeight: 80,
                    background: theme.custom.infoBar.background,
                    color: theme.palette.getContrastText(theme.custom.infoBar.background),
                    borderBottom: `solid 1px ${theme.palette.grey.A200}`,
                    padding: { xs: theme.spacing(2, 0), sm: theme.spacing(0, 4) },
                })}
            >
                <Typography
                    variant='h4'
                    align='left'
                    component='h1'
                >
                    <FormattedMessage
                        id='Notifications.Notifications.page.title'
                        defaultMessage='Notifications'
                    />
                </Typography>
                <Box display='flex' alignItems='center'>
                    <FormControl sx={(theme) => ({
                        border: '1px solid #ccc',
                        borderRadius: theme.spacing(1),
                        margin: theme.spacing(0, 1),
                    })}
                    >
                        <Select
                            value={sortOption}
                            onChange={handleSortChange}
                        >
                            <MenuItem value='newest'>Newest</MenuItem>
                            <MenuItem value='oldest'>Oldest</MenuItem>
                        </Select>
                    </FormControl>
                    <DeleteNotifications isDeleteAll fetchNotifications={fetchNotifications} />
                    <Button
                        style={{ backgroundColor: '#072e6e', color: '#ffffff' }}
                        onClick={markAllAsRead}
                        sx={(theme) => ({
                            margin: theme.spacing(0, 0.5),
                        })}
                    >
                        Mark All As Read
                    </Button>
                </Box>
            </Box>
            <Paper sx={(theme) => ({ margin: theme.spacing(0, 4) })}>
                <Root>
                    <Grid
                        container
                        justify='center'
                        sx={(theme) => ({
                            padding: theme.spacing(4, 2),
                            [theme.breakpoints.down('sm')]: {
                                padding: theme.spacing(2, 1),
                            },
                        })}
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
                </Root>
            </Paper>
        </Box>
    );
};

export default Notifications;
