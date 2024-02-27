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


const Notifications = () => {
    const intl = useIntl();
    const [notifications, setNotifications] = useState(null);
    const [sortOption, setSortOption] = useState('all'); 
    const [loading, setLoading] = useState(false);
    const [notFound, setnotFound] = useState(false);

    const handleSortChange = (event) => {
        setSortOption(event.target.value); 
    };
    
    const fetchNotifications = () => {
        setLoading(true);
        const promisedNotifications = API.getNotifications();
        promisedNotifications
            .then((response) => {
                setNotifications(response.body.list);

            })
            .catch((error) => {
                console.error(error);
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
        const notificationList = notifications?.map(notification => {
            return {
                notificationId: notification.notificationId,
                notificationType: notification.notificationType,
                sentDate: notification.createdTime,
                notification: notification.comments,
                isRead: notification.isRead,
            };
        });
       
        return notificationList;
    }

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
                fetchNotifications();
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
                fetchNotifications();
            });
    };

    const notificationList = getNotificationList();

    const notificationTypeColors = {
        'API_STATE_CHANGE': '#a2e8ff',
        'API_PRODUCT_STATE_CHANGE': '#ffa966',
        'API_REVISION_DEPLOYMENT': '#ff5d5d',
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
                defaultMessage: 'Mark As Read',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = notificationList[tableMeta.rowIndex];
                    return (
                        <div>
                            <Box component='span' m={1}>
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
                                    fetchNotifications={fetchNotifications}
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
    };

    if (notifications && notifications.length === 0) {
        return (
            <Onboarding
                title={
                    <FormattedMessage
                        id='Notification.onboarding.display.message'
                        defaultMessage='You do not have any notification!'
                    />
                }  
            />

        );
    }


    if (loading) {
        return <Progress per={90} message='Loading Notifications ...' />;
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
                                    >
                                        <MenuItem value='newest'>Newest</MenuItem>
                                        <MenuItem value='oldest'>Oldest</MenuItem>
                                        <MenuItem value='all'>All</MenuItem>
                                    </Select>
                                </FormControl>
                                <Box className={classes.buttonContainer}>
                                    <DeleteNotifications 
                                        isDeleteAll
                                        fetchNotifications={fetchNotifications}
                                    />
                                    <Button 
                                        style={{ backgroundColor: '#072e6e', color: '#ffffff'}} 
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
