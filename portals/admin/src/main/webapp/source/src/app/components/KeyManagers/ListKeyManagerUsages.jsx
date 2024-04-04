/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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
import PropTypes from 'prop-types';
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
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

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
};

const StyledDiv = styled('div')({});

/**
 * Render a list
 * @param {JSON} props props passed from parent
 * @returns {JSX} Header AppBar components.
 */
function ListKeyManagerUsages(props) {
    const intl = useIntl();
    const [data, setData] = useState(null);
    const [appData, setAppData] = useState(null);
    const restApi = new API();
    const [hasListPermission, setHasListPermission] = useState(true);
    const [errorMessage, setError] = useState(null);
    const { id } = props;
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    /**
     * API call to get Detected Data
     * @returns {Promise}.
     */
    function apiCall() {
        return restApi
            .getKeyManagerApiUsages(id)
            .then((result) => {
                return result.body;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'KeyManagers.ListKeyManagerAPIUsages.error',
                        defaultMessage: 'Unable to get Key Manager API usage details',
                    }));
                    throw (error);
                }
            });
    }

    /**
     * API call to get Application usage data
     * @returns {Promise}.
     */
    function applicationApiCall() {
        return restApi
            .getKeyManagerApplicationUsages(id)
            .then((result) => {
                return result.body;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'KeyManagers.ListKeyManagerApplicationUsages.error',
                        defaultMessage: 'Unable to get Key Manager application usage details',
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

        setAppData(null);
        const promiseApplicationAPICall = applicationApiCall();
        promiseApplicationAPICall.then((LocalData) => {
            setAppData(LocalData);
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
                                id='KeyManagers.ListKeyManagerUsages.empty.title'
                                defaultMessage='Key Manager Usages'
                            />
                        </Typography>
                        <Typography variant='body2' color='textSecondary' component='p'>
                            <FormattedMessage
                                id='KeyManagers.ListKeyManagerUsages.empty.content'
                                defaultMessage='There are no Key Manger usages.'
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
                        id='KeyManagers.ListKeyManagerUsages.permission.denied.title'
                        defaultMessage='Permission Denied'
                    />
                )}
                content={(
                    <FormattedMessage
                        id='KeyManagers.ListKeyManagerUsages.permission.denied.content'
                        defaultMessage={'You dont have enough permission to view Key Manager Usages'
                        + '. Please contact the site administrator.'}
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
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label='key manager usage tabs'>
                        <Tab label='API Usages' value='1' sx={{ fontSize: '0.9rem' }} />
                        <Tab label='Application Usages' value='2' sx={{ fontSize: '0.9rem' }} />
                    </TabList>
                </Box>
                <TabPanel value='1'>
                    <Grid
                        container
                        direction='row'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <Grid item xs={12}>
                            <Box position='relative'>
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
                                                        defaultMessage='No API usages for
                                                         this key manager specifically.'
                                                    />
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>
                <TabPanel value='2'>
                    <Grid
                        container
                        direction='row'
                        justifyContent='center'
                        alignItems='flex-start'
                    >
                        <Grid item xs={12}>
                            <Box position='relative'>
                                {appData?.applicationCount > 0
                                    ? (
                                        <>
                                            <Grid item xs={12}>
                                                <Box pl={2}>
                                                    <Typography variant='h8' gutterBottom>
                                                        {appData.applicationCount === 1 ? '1 Application is using this '
                                                + 'key manager specifically.'
                                                            : appData.applicationCount + ' Applications are using this '
                                                + 'key manager specifically.'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Box mt={4} backgroundColor='black' />
                                            <Box pl={2}>
                                                <Paper>
                                                    {appData && appData.applications.length > 0 && (
                                                        <MUIDataTable
                                                            title={null}
                                                            data={appData.applications}
                                                            columns={columnsApplications}
                                                            options={options}
                                                        />
                                                    )}
                                                    {appData && appData.applicationCount.length === 0 && (
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
                </TabPanel>
            </TabContext>
        </>
    );
}

ListKeyManagerUsages.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
};

export default ListKeyManagerUsages;
