/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import MUIDataTable from 'mui-datatables';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import InlineProgress from 'AppComponents/AdminPages/Addons/InlineProgress';
import Alert from 'AppComponents/Shared/Alert';
import Paper from '@mui/material/Paper';
import API from 'AppData/api';
import WarningBase from 'AppComponents/AdminPages/Addons/WarningBase';
import Box from '@mui/material/Box';

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
function ListLabelUsages(props) {
    const intl = useIntl();
    const restApi = new API();
    const [data, setData] = useState(null);
    const [hasListPermission, setHasListPermission] = useState(true);
    const [errorMessage, setError] = useState(null);
    const { id } = props;

    /**
     * API call to get Detected Data
     * @returns {Promise}.
     */
    async function apiCall() {
        return restApi
            .getLabelApiUsages(id)
            .then((result) => {
                return result.body;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Labels.ListLabelsAPIUsages.error',
                        defaultMessage: 'Unable to get Label API usage details',
                    }));
                    throw (error);
                }
            });
    }

    const fetchData = async () => {
        const apiUsageData = await apiCall();
        if (apiUsageData) {
            setData(apiUsageData.apis);
        } else {
            setError('Unable to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const pageProps = {

        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'Labels.AddEditLabel.usages',
            defaultMessage: 'Label Usage',
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

    const noDataMessage = (
        <FormattedMessage
            id='AdminPages.Addons.ListBase.nodata.message'
            defaultMessage='No items yet'
        />
    );

    const columnsApis = [
        ...columApiProps,
    ];

    const options = {
        selectableRows: 'none',
        filter: false,
        search: true,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        responsive: 'stacked',
        textLabels: {
            toolbar: {
                search: intl.formatMessage({
                    id: 'Mui.data.table.search.icon.label',
                    defaultMessage: 'Search',
                }),
            },
            body: {
                noMatch: intl.formatMessage({
                    id: 'Mui.data.table.search.no.records.found',
                    defaultMessage: 'Sorry, no matching records found',
                }),
            },
            pagination: {
                rowsPerPage: intl.formatMessage({
                    id: 'Mui.data.table.pagination.rows.per.page',
                    defaultMessage: 'Rows per page:',
                }),
                displayRows: intl.formatMessage({
                    id: 'Mui.data.table.pagination.display.rows',
                    defaultMessage: 'of',
                }),
            },
        },
    };

    if (!hasListPermission) {
        return (
            <WarningBase
                pageProps={pageProps}
                title={(
                    <FormattedMessage
                        id='Labels.ListLabelUsages.permission.denied.title'
                        defaultMessage='Permission Denied'
                    />
                )}
                content={(
                    <FormattedMessage
                        id='Labels.ListLabelUsages.permission.denied.content'
                        defaultMessage={'You dont have enough permission to view Label Usages'
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
            <Grid
                container
                direction='row'
                justifyContent='center'
                alignItems='center'
            >
                <Grid item xs={12}>
                    <Box position='relative'>
                        {data.count > 0
                            ? (
                                <>
                                    <Grid item xs={12}>
                                        <Box pl={2}>
                                            <Typography variant='h8' gutterBottom>
                                                {data.count === 1
                                                    ? intl.formatMessage({
                                                        id: 'Labels.ListLabelUsages.API.usages'
                                                            + '.count.one',
                                                        defaultMessage: '1 API is using this Label'
                                                            + ' specifically.',
                                                    })
                                                    : intl.formatMessage({
                                                        id: 'Labels.ListLabelUsages.API.usages'
                                                            + '.count.multiple',
                                                        defaultMessage: '{count} APIs are using this label'
                                                            + ' specifically',
                                                    },
                                                    { count: data.count })}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Box mt={4} backgroundColor='black' />
                                    <Box pl={2}>
                                        <Paper>
                                            {data && data.list.length > 0 && (
                                                <MUIDataTable
                                                    title={null}
                                                    data={data.list}
                                                    columns={columnsApis}
                                                    options={options}
                                                />
                                            )}
                                            {data && data.list.length === 0 && (
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
                                                id='Labels.AddEditLabel.api.no.usages'
                                                defaultMessage='No API usages for
                                                    this Label specifically.'
                                            />
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}

ListLabelUsages.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
};

export default ListLabelUsages;
