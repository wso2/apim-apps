/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import makeStyles from '@mui/styles/makeStyles';
import API from 'AppData/api';
import { useIntl, FormattedMessage } from 'react-intl';
import EditApplication from 'AppComponents/ApplicationSettings/EditApplication';
import AppsTableContent from 'AppComponents/ApplicationSettings/AppsTableContent';
import ApplicationTableHead from 'AppComponents/ApplicationSettings/ApplicationTableHead';
import EditIcon from '@mui/icons-material/Edit';
import Table from '@mui/material/Table';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */

const useStyles = makeStyles((theme) => ({
    searchBar: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
    block: {
        display: 'block',
    },
    clearSearch: {
        position: 'absolute',
        right: 111,
        top: 13,
    },
    addUser: {
        marginRight: theme.spacing(1),
    },
}));

export default function ListApplications() {
    const intl = useIntl();
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [applicationList, setApplicationList] = useState(null);
    const [totalApps, setTotalApps] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [owner, setOwner] = useState('');

    /**
    * API call to get application list
    * @returns {Promise}.
    */
    function apiCall(pageNo, user = owner) {
        setLoading(true);
        const restApi = new API();
        return restApi
            .getApplicationList({ limit: rowsPerPage, offset: pageNo * rowsPerPage, user })
            .then((result) => {
                setApplicationList(result.body.list);
                const { pagination: { total } } = result.body;
                setTotalApps(total);
                return result.body.list;
            })
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }, [page]);

    useEffect(() => {
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }, [rowsPerPage]);

    function handleChangePage(event, pageNo) {
        setPage(pageNo);
        apiCall(pageNo).then((result) => {
            setApplicationList(result);
        });
    }

    function handleChangeRowsPerPage(event) {
        const nextRowsPerPage = event.target.value;
        const rowsPerPageRatio = rowsPerPage / nextRowsPerPage;
        const nextPage = Math.floor(page * rowsPerPageRatio);
        setPage(nextPage);
        setRowsPerPage(nextRowsPerPage);
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }

    function clearSearch() {
        setPage(0);
        setOwner('');
        apiCall(page, '').then((result) => {
            setApplicationList(result);
        });
    }

    function setQuery(event) {
        const newQuery = event.target.value;
        if (newQuery === '') {
            clearSearch();
        } else {
            setOwner(newQuery);
        }
    }

    function filterApps(e) {
        e.preventDefault();
        setPage(0);
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }

    return (
        <ContentBase>
            <AppBar className={classes.searchBar} position='static' color='default' elevation={0}>
                <Toolbar>
                    <form onSubmit={filterApps} style={{ width: '100%' }} disabled={loading}>
                        <Grid container spacing={2} alignItems='center'>
                            <Grid item>
                                <SearchIcon className={classes.block} color='inherit' />
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    fullWidth
                                    id='search-label'
                                    label={intl.formatMessage({
                                        defaultMessage: 'Search Application by Application Owner',
                                        id: 'Applications.Listing.Listing.applications.search.label',
                                    })}
                                    placeholder={intl.formatMessage({
                                        defaultMessage: 'Application Owner',
                                        id: 'Applications.Listing.Listing.search.placeholder',
                                    })}
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.searchInput,
                                    }}
                                    value={owner}
                                    onChange={setQuery}
                                // onKeyPress={this.handleSearchKeyPress}
                                />
                                { owner.length > 0
                                && (
                                    <Tooltip
                                        title={
                                            intl.formatMessage({
                                                defaultMessage: 'Clear Search',
                                                id: 'Applications.Listing.Listing.clear.search',
                                            })
                                        }
                                    >
                                        <IconButton
                                            aria-label='delete'
                                            className={classes.clearSearch}
                                            onClick={clearSearch}
                                        >
                                            <HighlightOffRoundedIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Grid>
                            <Grid item>
                                <Button
                                    variant='contained'
                                    className={classes.addUser}
                                    type='submit'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <FormattedMessage
                                            id='Applications.Listing.Listing.applications.searching'
                                            defaultMessage='Searching'
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id='Applications.Listing.Listing.applications.search'
                                            defaultMessage='Search'
                                        />
                                    )}

                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Toolbar>
            </AppBar>
            {applicationList && applicationList.length > 0
                && (
                    <Table id='itest-application-list-table'>
                        <ApplicationTableHead />
                        <AppsTableContent
                            apps={applicationList}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            editComponentProps={{
                                icon: <EditIcon aria-label='edit-application-settings' />,
                                title: 'Change Application Owner',
                                applicationList,
                            }}
                            EditComponent={EditApplication}
                            apiCall={apiCall}
                        />
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    component='td'
                                    count={totalApps}
                                    rowsPerPage={rowsPerPage}
                                    rowsPerPageOptions={[5, 10, 15]}
                                    labelRowsPerPage='Show'
                                    page={page}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    onChangePage={handleChangePage}
                                    onChangeRowsPerPage={handleChangeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                )}
            {applicationList && applicationList.length === 0 && !loading && (
                <Box>
                    <Alert severity='info'>
                        <Typography variant='subtitle2'>
                            <FormattedMessage
                                id='Applications.Listing.Listing.empty.message'
                                defaultMessage='No Data to Display'
                            />
                        </Typography>
                    </Alert>
                </Box>
            )}
        </ContentBase>
    );
}
