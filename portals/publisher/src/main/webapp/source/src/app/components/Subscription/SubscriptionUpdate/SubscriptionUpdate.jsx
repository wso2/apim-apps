/* eslint-disable react/jsx-props-no-spreading */
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import MUIDataTable from 'mui-datatables';
import ContentBase from 'AppComponents/Addons/Addons/ContentBase';
import InlineProgress from 'AppComponents/Addons/Addons/InlineProgress';
import Alert from 'AppComponents/Shared/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HelpBase from 'AppComponents/Addons/Addons/HelpBase';
import DescriptionIcon from '@mui/icons-material/Description';
import Link from '@mui/material/Link';
import Configurations from 'Config';
import API from 'AppData/api';
import Button from '@mui/material/Button';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import WarningBase from 'AppComponents/Addons/Addons/WarningBase';
import EastIcon from '@mui/icons-material/EastRounded';
import { Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Alert as MUIAlert } from '@mui/material';

const PREFIX = 'subscriptionupdate';

const classes = {
    LeftMenu: `${PREFIX}-LeftMenu`,
    leftLInkMain: `${PREFIX}-leftLInkMain`,
    content: `${PREFIX}-content`,
    contentInside: `${PREFIX}-contentInside`,
    footeremaillink: `${PREFIX}-footeremaillink`,
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    expanded: `${PREFIX}-expanded`,
    leftLInkText: `${PREFIX}-leftLInkText`,
    expandIconColor: `${PREFIX}-expandIconColor`,
    headingText: `${PREFIX}-headingText`,
    customIcon: `${PREFIX}-customIcon`
};

const StyledBox = styled(Box)((
    {
        theme
    }
) => ({

    [`& .${classes.content}`]: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        paddingBottom: theme.spacing(3),
        overflow: 'auto',
    },

}));

/**
 * Render a list
 * @param {JSON} props props passed from parent
 * @returns {JSX} Header AppBar components.
 */
function ListLabels() {
    const intl = useIntl();
    const [data, setData] = useState(null);
    const restApi = new API();

    const [searchText, setSearchText] = useState('');
    const [isUpdating, setIsUpdating] = useState(null);
    const [buttonValue, setButtonValue] = useState();
    const [hasListPermission, setHasListPermission] = useState(true);
    const [openMenuForId, setOpenMenuForId] = useState(null);
    const [errorMessage, setError] = useState(null);

    /**
     * API call to get Detected Data
     * @returns {Promise}.
     */
    function apiCall() {
        return restApi.workflowsGet('AM_SUBSCRIPTION_UPDATE')
            .then((result) => {
                const workflowlist = result.body.list.map((obj) => {
                    return {
                        description: obj.description,
                        api: obj.properties.apiName + '-' + obj.properties.apiVersion,
                        applicationName: obj.properties.applicationName,
                        subscriber: obj.properties.subscriber,
                        currentTier: obj.properties.currentTier,
                        requestedTier: obj.properties.requestedTier,
                        referenceId: obj.referenceId,
                        createdTime: obj.createdTime,
                        properties: obj.properties,
                    };
                });
                return workflowlist;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Workflow.SubscriptionUpdate.apicall.has.errors',
                        defaultMessage: 'Unable to get workflow pending requests for Subscription Update',
                    }));
                    throw (error);
                }
            });
    }

    const fetchData = () => {
    // Fetch data from backend
        setData(null);
        const promiseAPICall = apiCall();
        promiseAPICall.then((LocalData) => {
            setData(LocalData);
        }).catch((e) => {
            console.error('Unable to fetch data. ', e.message);
            setError(e.message);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestOpen = (referenceId) => {
        setOpenMenuForId(referenceId);
    };

    const handleRequestClose = () => {
        setOpenMenuForId(null);
    };

    const updateStatus = (referenceId, value) => {
        setButtonValue(value);
        const body = { status: value, attributes: {}, description: '' };
        setIsUpdating(true);
        if (value === 'APPROVED') {
            body.description = 'Approve workflow request.';
        }
        if (value === 'REJECTED') {
            body.description = 'Reject workflow request.';
        }
        const promisedupdateWorkflow = restApi.updateWorkflow(referenceId, body);
        return promisedupdateWorkflow
            .then(() => {
                setIsUpdating(false);
                setOpenMenuForId(null);
                Alert.success(intl.formatMessage({
                    id: 'Workflow.SubscriptionCreation.update.success',
                    defaultMessage: 'Workflow status is updated successfully',
                }));
            })
            .catch((error) => {
                console.log(error);
                const { response, status } = error;
                const { body: { description } } = response;
                if (status === 401) {
                    Alert.error(description);
                } else if (response.body) {
                    Alert.error(intl.formatMessage({
                        id: 'Workflow.subscriptionupdate.updateStatus.has.errors',
                        defaultMessage: 'Unable to complete subscription update approve/reject process. ',
                    }));
                    throw (response.body.description);
                }
                setIsUpdating(false);
                return null;
            })
            .then(() => {
                fetchData();
            });
    };

    const pageProps = {
        help: (
            <HelpBase>
                <List component='nav' aria-label='main mailbox folders'>
                    <ListItem button>
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            href={Configurations.app.docUrl
                                + 'consume/manage-subscription/advanced-topics/'
                                + 'adding-an-api-subscription-tier-update-workflow'}
                            underline='hover'
                        >
                            <ListItemText primary={(
                                <FormattedMessage
                                    id='Workflow.SubscriptionUpdate.help.link.one'
                                    defaultMessage='Create a subscription update request'
                                />
                            )}
                            />
                        </Link>
                    </ListItem>
                </List>
            </HelpBase>),

        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'Workflow.SubscriptionCreation.title.subscriptionupdate',
            defaultMessage: 'Subscription Update - Approval Tasks',
        }),
    };

    const columProps = [
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'Workflow.SubscriptionCreation.table.header.Description',
                defaultMessage: 'Description',
            }),
            options: {
                sort: false,
                display: false,
            },
        },
        {
            name: 'api',
            label: intl.formatMessage({
                id: 'Workflow.SubscriptionCreation.table.header.API',
                defaultMessage: 'API',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'applicationName',
            label: intl.formatMessage({
                id: 'Workflow.SubscriptionCreation.table.header.Application',
                defaultMessage: 'Application',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'requestedTier',
            label: intl.formatMessage({
                id: 'Workflow.SubscriptionCreation.table.header.Tier',
                defaultMessage: 'Tier Transition',
            }),
            options: {
                sort: false,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = data[tableMeta.rowIndex];
                    const { properties } = dataRow;
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {properties.currentTier} 
                            <EastIcon 
                                sx={{ mx: 1, fontSize: '1rem' }}
                            />
                            {properties.requestedTier}
                        </div>
                    );
                },
            },
        },
        {
            name: 'subscriber',             
            label: intl.formatMessage({
                id: 'Workflow.SubscriptionCreation.table.header.Subscriber',
                defaultMessage: 'Subscriber',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = data[tableMeta.rowIndex];
                    const { properties } = dataRow;
                    const { createdTime } = dataRow;
                    dayjs.extend(relativeTime);
                    const time = dayjs(createdTime).fromNow();
                    dayjs.extend(localizedFormat);
                    const format = dayjs(createdTime).format('LLL');
                    return (
                        <div>
                            {properties.subscriber}
                            <br />
                            <Tooltip title={format}>
                                <Typography color='textSecondary' variant='caption'>
                                    {time}
                                </Typography>
                            </Tooltip>
                        </div>
                    );
                },
            },
        },
        {
            name: 'action',
            label: intl.formatMessage({
                id: 'Workflow.SubscriptionCreation.table.header.Action',
                defaultMessage: 'Action',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = data[tableMeta.rowIndex];
                    const { referenceId } = dataRow;
                    return (
                        <div>
                            <Box component='span' m={1}>
                                <Button
                                    color='success'
                                    variant='contained'
                                    size='small'
                                    onClick={() => updateStatus(referenceId, 'APPROVED')}
                                    disabled={isUpdating}
                                >
                                    <CheckIcon />
                                    <FormattedMessage
                                        id='Workflow.SubscriptionUpdate.table.button.approve'
                                        defaultMessage='Approve'
                                    />
                                    {(isUpdating && buttonValue === 'APPROVED') && <CircularProgress size={15} /> }
                                </Button>
                                &nbsp;&nbsp;
                                <Button
                                    color='error'
                                    variant='contained'
                                    size='small'
                                    onClick={() => handleRequestOpen(referenceId)}
                                    disabled={isUpdating}
                                >
                                    <ClearIcon />
                                    <FormattedMessage
                                        id='Task.SubscriptionUpdate.table.button.reject'
                                        defaultMessage='Reject'
                                    />
                                </Button>
                                <Dialog open={openMenuForId === referenceId}>
                                    <DialogTitle>
                                        <FormattedMessage
                                            id='Workflow.SubscriptionUpdate.Reject.Title'
                                            defaultMessage='Reject Subscription Update'
                                        />
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            <FormattedMessage
                                                id='Workflow.SubscriptionUpdate.Reject.text.description'
                                                defaultMessage={'Are you sure you want to reject this ' +
                                                    'subscription update?'}
                                            />
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button dense onClick={() => handleRequestClose()}>
                                            <FormattedMessage
                                                id='Workflow.SubscriptionUpdate.Reject.button.cancel'
                                                defaultMessage='Cancel'
                                            />
                                        </Button>
                                        <Button
                                            id='itest-id-deleteconf'
                                            onClick={() => updateStatus(referenceId, 'REJECTED')}
                                        >
                                            <FormattedMessage
                                                id='Workflow.SubscriptionUpdate.Reject.button.delete'
                                                defaultMessage='Reject'
                                            />
                                            {(isUpdating && buttonValue === 'REJECTED') && 
                                            <CircularProgress size={15} />}
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Box>
                        </div>
                    );
                },
            },
        },
    ];

    const addButtonProps = {};
    const addButtonOverride = null;
    const noDataMessage = (
        <FormattedMessage
            id='SubscriptionAproval.Addons.ListBase.nodata.message'
            defaultMessage='No items yet'
        />
    );

    const searchActive = true;
    const searchPlaceholder = intl.formatMessage({
        id: 'Workflow.SubscriptionCreation.search.default',
        defaultMessage: 'Search by API, Application or Subscriber',
    });

    const filterData = (event) => {
        setSearchText(event.target.value);
    };

    const columns = [
        ...columProps,
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: null,
        responsive: 'vertical',
        searchText,
    };
    if (data && data.length === 0) {
        return (
            <StyledBox display='flex' alignItems='stretch' flexDirection='row' className={classes.main}>
                <Box className={classes.content}>
                    <ContentBase
                        {...pageProps}
                        pageStyle='small'
                    >
                        <Card>
                            <CardContent>
                                <Typography gutterBottom variant='h5' component='h2'>
                                    <FormattedMessage
                                        id='Workflow.SubscriptionUpdate.List.empty.title.subscriptionupdate'
                                        defaultMessage='Subscription Update'
                                    />
                                </Typography>
                                <Typography variant='body2' color='textSecondary' component='p'>
                                    <FormattedMessage
                                        id='Workflow.SubscriptionUpdate.List.empty.content.subscriptionupdate'
                                        defaultMessage='There are no pending workflow requests for subscription update.'
                                    />
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {addButtonOverride || (
                                // eslint-disable-next-line react/no-unknown-property
                                    <span updateList={fetchData} {...addButtonProps} />
                                )}
                            </CardActions>
                        </Card>
                    </ContentBase>
                </Box>
            </StyledBox>
        );
    }
    if (!hasListPermission) {
        return (
            <WarningBase
                pageProps={pageProps}
                title={(
                    <FormattedMessage
                        id='Workflow.SubscriptionUpdate.permission.denied.title'
                        defaultMessage='Permission Denied'
                    />
                )}
                content={(
                    <FormattedMessage
                        id='Workflow.SubscriptionUpdate.permission.denied.content'
                        defaultMessage={'You dont have enough permission to view Subscription Update - '
                        + 'Approval Tasks. Please contact the site administrator.'}
                    />
                )}
            />
        );
    }
    if (!errorMessage && !data) {
        return (
            <ContentBase pageStyle='paperLess'>
                <InlineProgress />
            </ContentBase>

        );
    }
    if (errorMessage) {
        return (
            <ContentBase {...pageProps}>
                <MUIAlert severity='error'>{errorMessage}</MUIAlert>
            </ContentBase>

        );
    }
    return (
        <StyledBox display='flex' alignItems='stretch' flexDirection='row'>
            <Box className={classes.content}>
                <ContentBase {...pageProps}>
                    {(searchActive || addButtonProps) && (
                        <AppBar position='static' color='default' elevation={0}>
                            <Toolbar>
                                <Grid container spacing={2} alignItems='center'>
                                    <Grid item>
                                        {searchActive && (<SearchIcon color='inherit' />)}
                                    </Grid>
                                    <Grid item xs>
                                        {searchActive && (
                                            <TextField
                                                variant='standard'
                                                fullWidth
                                                placeholder={searchPlaceholder}
                                                sx={(theme) => ({
                                                    '& .search-input': {
                                                        fontSize: theme.typography.fontSize,
                                                    },
                                                })}
                                                InputProps={{
                                                    disableUnderline: true,
                                                    className: 'search-input',
                                                }}
                                                onChange={filterData}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item>
                                        {addButtonOverride || (
                                            <span
                                                // eslint-disable-next-line react/no-unknown-property
                                                updateList={fetchData}
                                                {...addButtonProps}
                                            />

                                        )}
                                        <Tooltip title={(
                                            <FormattedMessage
                                                id='SubscriptionApproval.Addons.ListBase.reload'
                                                defaultMessage='Reload'
                                            />
                                        )}
                                        >
                                            <IconButton onClick={fetchData} size='large'>
                                                <RefreshIcon color='inherit' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Toolbar>
                        </AppBar>
                    )}
                    {data && data.length > 0 && (
                        <MUIDataTable
                            title={null}
                            data={data}
                            columns={columns}
                            options={options}
                        />
                    )}
                    {data && data.length === 0 && (
                        <div>
                            <Typography color='textSecondary' align='center'>
                                {noDataMessage}
                            </Typography>
                        </div>
                    )}
                </ContentBase>
            </Box>
        </StyledBox>
    );
}

export default ListLabels;
