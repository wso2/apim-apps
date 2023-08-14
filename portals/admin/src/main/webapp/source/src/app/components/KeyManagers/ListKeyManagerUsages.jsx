/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import MUIDataTable from 'mui-datatables';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import InlineProgress from 'AppComponents/AdminPages/Addons/InlineProgress';
import Alert from 'AppComponents/Shared/Alert';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import DescriptionIcon from '@material-ui/icons/Description';
import Link from '@material-ui/core/Link';
import Configurations from 'Config';
import API from 'AppData/api';
import WarningBase from 'AppComponents/AdminPages/Addons/WarningBase';
import { Alert as MUIAlert } from '@material-ui/lab';
import { useParams } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';
import Toolbar from '@material-ui/core/Toolbar';

const useStyles = makeStyles((theme) => ({
    searchInput: {
        fontSize: theme.typography.fontSize,
    },
    block: {
        display: 'block',
    },
    contentWrapper: {
        margin: theme.spacing(2),
    },
    approveButton: {
        textDecoration: 'none',
        backgroundColor: theme.palette.success.light,
    },
    rejectButton: {
        textDecoration: 'none',
        backgroundColor: theme.palette.error.light,
    },
    pageTitle: {
        minHeight: 43,
        backgroundColor: '#f6f6f6',
    },
    root: {
        flexGrow: 1,
        minHeight: 'calc(100vh - (100px))',
        backgroundColor: '#eaeff1',
    },
}));

/**
 * Render a list
 * @param {JSON} props props passed from parent
 * @returns {JSX} Header AppBar components.
 */
function ListKeyManagerUsages() {
    const intl = useIntl();
    const [data, setData] = useState(null);
    const restApi = new API();
    const classes = useStyles();
    const [hasListPermission, setHasListPermission] = useState(true);
    const [errorMessage, setError] = useState(null);
    const { id } = useParams();

    /**
     * API call to get Detected Data
     * @returns {Promise}.
     */
    function apiCall() {
        return restApi
            .getKeyManagerUsages(id)
            .then((result) => {
                return result.body;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'KeyManagers.ListKeyManagerUsages.error',
                        defaultMessage: 'Unable to get Key Manager usage details',
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
        })
            .catch((e) => {
                console.error('Unable to fetch data. ', e.message);
                setError(e.message);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const pageProps = {

        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'KeyManagers.AddEditKeyManager.usages',
            defaultMessage: 'Key Manager Usage',
        }),
    };

    const columApiProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Api.Name',
                defaultMessage: 'API Name',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'version',
            label: intl.formatMessage({
                id: 'Api.Version',
                defaultMessage: 'Version',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'provider',
            label: intl.formatMessage({
                id: 'Api.Provider',
                defaultMessage: 'Provider',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
    ];

    const columApplicationProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Aplication.Name',
                defaultMessage: 'Aplication Name',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'owner',
            label: intl.formatMessage({
                id: 'Aplication.Owner',
                defaultMessage: 'Aplication Owner',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'organization',
            label: intl.formatMessage({
                id: 'Aplication.organization',
                defaultMessage: 'Aplication organization',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
    ];

    const addButtonProps = {};
    const addButtonOverride = null;
    const noDataMessage = (
        <FormattedMessage
            id='AdminPages.Addons.ListBase.nodata.message'
            defaultMessage='No items yet'
        />
    );

    const columnsApis = [
        ...columApiProps,
    ];

    const columnsApplications = [
        ...columApplicationProps,
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        filter: true,
        search: true,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        responsive: 'stacked',
    };
    if (data && data.length === 0) {
        return (
            <ContentBase
                {...pageProps}
                pageStyle='small'
            >
                <Card className={classes.root}>
                    <CardContent>
                        <Typography gutterBottom variant='h5' component='h2'>
                            <FormattedMessage
                                id='Workflow.SubscriptionUpdate.List.empty.title.subscriptionUpdate'
                                defaultMessage='Subscription Update'
                            />
                        </Typography>
                        <Typography variant='body2' color='textSecondary' component='p'>
                            <FormattedMessage
                                id='Workflow.SubscriptionUpdate.List.empty.content.subscriptionUpdates'
                                defaultMessage='There are no pending workflow requests for subscription updates.'
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
                        defaultMessage={'You dont have enough permission to view Subscription Tier Update - '
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
        <>
            <div className={clsx(classes.root)}>
                <Grid
                    container
                    direction='row'
                    justify='center'
                    alignItems='flex-start'
                >
                    <Grid item xs={12}>
                        <Toolbar className={classes.pageTitle}>
                            <Grid container alignItems='center' spacing={1}>
                                <Grid item xs>
                                    <Typography color='inherit' variant='h5' component='h1'>
                                        <FormattedMessage
                                            id='KeyManagers.AddEditKeyManager.usages'
                                            defaultMessage='Key Manager Usage'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <HelpBase>
                                        <List component='nav' aria-label='main mailbox folders'>
                                            <ListItem button>
                                                <ListItemIcon>
                                                    <DescriptionIcon />
                                                </ListItemIcon>
                                                <Link
                                                    target='_blank'
                                                    href={Configurations.app.docUrl
                        + 'learn/consume-api/manage-subscription/advanced-topics/adding'
                        + '-an-api-subscription-workflow/#adding-an-api-subscription-update-workflow'}
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
                                    </HelpBase>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </Grid>
                    <Grid item xs={8}>
                        <Box pt={6} position='relative'>
                            <Grid item xs={12}>
                                <Box pl={2}>
                                    <Typography variant='h6' gutterBottom>
                                        API Usages
                                    </Typography>
                                </Box>
                            </Grid>
                            {data.apiCount > 0
                                ? (
                                    <>
                                        <Grid item xs={12}>
                                            <Box pl={2}>
                                                <Typography variant='h8' gutterBottom>
                                                    {data.apiCount === 1 ? '1 API is using this keymanager specifically.'
                                                        : data.apiCount + ' APIs are using this keymanager specifically.'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Box mt={4} backgroundColor='black' />
                                        <Box pl={2}>
                                            <Paper>
                                                {data && data.apis.length > 0 && (
                                                    <MUIDataTable
                                                        title={null}
                                                        data={data.apis}
                                                        columns={columnsApis}
                                                        options={options}
                                                    />
                                                )}
                                                {data && data.apis.length === 0 && (
                                                    <div className={classes.contentWrapper}>
                                                        <Typography color='textSecondary' align='center'>
                                                            {noDataMessage}
                                                        </Typography>
                                                    </div>
                                                )}
                                            </Paper>
                                        </Box>
                                    </>
                                )
                                : (
                                    <Grid item xs={12}>
                                        <Box pl={2}>
                                            <Typography variant='h8' gutterBottom>
                                                No API usages for this keymanager specifically.
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            <Box mt={4} backgroundColor='black' />
                            <Grid item xs={12}>
                                <Box pl={2}>
                                    <Typography variant='h6' gutterBottom>
                                        Application Usages
                                    </Typography>
                                </Box>
                            </Grid>
                            {data.applicationCount > 0
                                ? (
                                    <>
                                        <Grid item xs={12}>
                                            <Box pl={2}>
                                                <Typography variant='h8' gutterBottom>
                                                    {data.applicationCount === 1 ? '1 Application is using this '
                                            + 'keymanager specifically.'
                                                        : data.applicationCount + ' Applications are using this '
                                            + 'keymanager specifically.'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Box mt={4} backgroundColor='black' />
                                        <Box pl={2}>
                                            <Paper>
                                                {data && data.applications.length > 0 && (
                                                    <MUIDataTable
                                                        title={null}
                                                        data={data.applications}
                                                        columns={columnsApplications}
                                                        options={options}
                                                    />
                                                )}
                                                {data && data.applicationCount.length === 0 && (
                                                    <div className={classes.contentWrapper}>
                                                        <Typography color='textSecondary' align='center'>
                                                            {noDataMessage}
                                                        </Typography>
                                                    </div>
                                                )}
                                            </Paper>
                                        </Box>
                                    </>
                                )
                                : (
                                    <Grid item xs={12}>
                                        <Box pl={2}>
                                            <Typography variant='h8' gutterBottom>
                                                No Application usages for this keymanager specifically.
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                        </Box>
                    </Grid>
                </Grid>
            </div>
        </>
    );
}

export default ListKeyManagerUsages;
