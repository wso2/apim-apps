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
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled, Alert as MUIAlert } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import MUIDataTable from 'mui-datatables';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import InlineProgress from 'AppComponents/AdminPages/Addons/InlineProgress';
import Alert from 'AppComponents/Shared/Alert';
import Paper from '@mui/material/Paper';
import API from 'AppData/api';
import WarningBase from 'AppComponents/AdminPages/Addons/WarningBase';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

const styles = {
    searchInput: (theme) => ({
        fontSize: theme.typography.fontSize,
    }),
    block: {
        display: 'block',
    },
    contentWrapper: (theme) => ({
        margin: theme.spacing(2),
    }),
    approveButton: (theme) => ({
        textDecoration: 'none',
        backgroundColor: theme.palette.success.light,
    }),
    rejectButton: (theme) => ({
        textDecoration: 'none',
        backgroundColor: theme.palette.error.light,
    }),
    pageTitle: {
        minHeight: 43,
        backgroundColor: '#f6f6f6',
    },
    root: {
        flexGrow: 1,
        minHeight: 'calc(100vh - (100px))',
        backgroundColor: '#eaeff1',
    },
};

const StyledDiv = styled('div')({});

/**
 * Render a list
 * @param {JSON} props props passed from parent
 * @returns {JSX} Header AppBar components.
 */
function ListKeyManagerUsages() {
    const intl = useIntl();
    const [data, setData] = useState(null);
    const restApi = new API();
    const [hasListPermission, setHasListPermission] = useState(true);
    const [kmName, setKmName] = useState('');
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
        restApi.keyManagerGet(id).then((result) => {
            setKmName(result.body.name);
        });
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
                id: 'Application.Name',
                defaultMessage: 'Application Name',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'owner',
            label: intl.formatMessage({
                id: 'Application.Owner',
                defaultMessage: 'Application Owner',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'organization',
            label: intl.formatMessage({
                id: 'Application.organization',
                defaultMessage: 'Application Organization',
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
                <Card sx={styles.root}>
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
            <StyledDiv sx={styles.root}>
                <Grid
                    container
                    direction='row'
                    justify='center'
                    alignItems='flex-start'
                >
                    <Grid item xs={12}>
                        <Toolbar sx={styles.pageTitle}>
                            <Grid container alignItems='center' spacing={1}>
                                <Grid item xs>
                                    <Typography color='inherit' variant='h5' component='h1'>
                                        <FormattedMessage
                                            id='KeyManagers.AddEditKeyManager.usages.text'
                                            defaultMessage='Key Manager Usages - '
                                        />
                                        {kmName}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </Grid>
                    <Grid item xs={8}>
                        <Box pt={6} position='relative'>
                            <Grid item xs={12}>
                                <Box pl={2}>
                                    <Typography variant='h6' gutterBottom>
                                        <FormattedMessage
                                            id='KeyManagers.AddEditKeyManager.api.usages'
                                            defaultMessage='API Usages'
                                        />
                                    </Typography>
                                </Box>
                            </Grid>
                            {data.apiCount > 0
                                ? (
                                    <>
                                        <Grid item xs={12}>
                                            <Box pl={2}>
                                                <Typography variant='h8' gutterBottom>
                                                    {data.apiCount === 1
                                                        ? '1 API is using this key manager specifically.'
                                                        : data.apiCount
                                                        + ' APIs are using this key manager specifically.'}
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
                                                    <StyledDiv sx={styles.contentWrapper}>
                                                        <Typography color='textSecondary' align='center'>
                                                            {noDataMessage}
                                                        </Typography>
                                                    </StyledDiv>
                                                )}
                                            </Paper>
                                        </Box>
                                    </>
                                )
                                : (
                                    <Grid item xs={12}>
                                        <Box pl={2}>
                                            <Typography variant='h8' gutterBottom>
                                                <FormattedMessage
                                                    id='KeyManagers.AddEditKeyManager.api.no.usages'
                                                    defaultMessage='No API usages for this key manager specifically.'
                                                />
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            <Box mt={4} backgroundColor='black' />
                            <Grid item xs={12}>
                                <Box pl={2}>
                                    <Typography variant='h6' gutterBottom>
                                        <FormattedMessage
                                            id='KeyManagers.AddEditKeyManager.application.usages'
                                            defaultMessage='Application Usages'
                                        />
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
                                            + 'key manager specifically.'
                                                        : data.applicationCount + ' Applications are using this '
                                            + 'key manager specifically.'}
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
                                                    <StyledDiv sx={styles.contentWrapper}>
                                                        <Typography color='textSecondary' align='center'>
                                                            {noDataMessage}
                                                        </Typography>
                                                    </StyledDiv>
                                                )}
                                            </Paper>
                                        </Box>
                                    </>
                                )
                                : (
                                    <Grid item xs={12}>
                                        <Box pl={2}>
                                            <Typography variant='h8' gutterBottom>
                                                <FormattedMessage
                                                    id='KeyManagers.AddEditKeyManager.application.no.usages'
                                                    defaultMessage='No Application usages
                                                     for this key manager specifically.'
                                                />
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                        </Box>
                    </Grid>
                </Grid>
            </StyledDiv>
        </>
    );
}

export default ListKeyManagerUsages;
