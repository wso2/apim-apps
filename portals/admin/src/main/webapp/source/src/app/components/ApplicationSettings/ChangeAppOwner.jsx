/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import EditApplication from 'AppComponents/ApplicationSettings/EditApplication';
import AppsTableContent from 'AppComponents/ApplicationSettings/AppsTableContent';
import ApplicationTableHead from 'AppComponents/ApplicationSettings/ApplicationTableHead';
import EditIcon from '@mui/icons-material/Edit';
import Table from '@mui/material/Table';
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
 * Renders a searchable, paginated table of applications with the ability to change application owners.
 *
 * @param {object} props - Component properties including application data, loading state, search and
 * pagination handlers.
 * @returns {JSX.Element} The rendered application table with search, pagination, and edit functionality.
 */
export default function ChangeAppOwner(props) {
    const intl = useIntl();
    const {
        loading,
        applicationList,
        page,
        rowsPerPage,
        totalApps,
        searchQuery,
        handleChangePage,
        handleChangeRowsPerPage,
        setQuery,
        clearSearch,
        filterApps,
        apiCall,
    } = props;

    const columnData = [
        {
            id: 'name',
            numeric: false,
            disablePadding: true,
            label: (<FormattedMessage
                id='ApplicationSettings.ChangeAppOwner.column.name'
                defaultMessage='Name'
            />),
            sorting: true,
        },
        {
            id: 'owner',
            numeric: false,
            disablePadding: false,
            label: (<FormattedMessage
                id='ApplicationSettings.ChangeAppOwner.column.owner'
                defaultMessage='Owner'
            />),
            sorting: true,
        },
        {
            id: 'actions',
            numeric: false,
            disablePadding: false,
            label: (<FormattedMessage
                id='ApplicationSettings.ChangeAppOwner.column.actions'
                defaultMessage='Actions'
            />),
            sorting: false,
        },
    ];

    const columns = [
        {
            id: 'name',
            render: (app) => app.name,
        },
        {
            id: 'owner',
            render: (app) => app.owner,
        },
        {
            id: 'actions',
            render: (app, columnProps) => (
                <EditApplication
                    dataRow={app}
                    updateList={columnProps.apiCall}
                    {...columnProps.editComponentProps}
                />
            ),
        },
    ];

    return (
        <>
            <AppBar
                sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
                position='static'
                color='default'
                elevation={0}
            >
                <Toolbar>
                    <form onSubmit={filterApps} style={{ width: '100%' }} disabled={loading}>
                        <Grid container spacing={2} alignItems='center'>
                            <Grid item>
                                <SearchIcon sx={{ display: 'block' }} color='inherit' />
                            </Grid>
                            <Grid item xs sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    hiddenLabel
                                    variant='standard'
                                    fullWidth
                                    id='search-label'
                                    placeholder={intl.formatMessage({
                                        defaultMessage: 'Search Application by Name/Owner',
                                        id: 'ApplicationSettings.ChangeAppOwner.search.placeholder',
                                    })}
                                    sx={(theme) => ({
                                        '& .search-input': {
                                            fontSize: theme.typography.fontSize,
                                        },
                                    })}
                                    InputProps={{
                                        disableUnderline: true,
                                        className: 'search-input',
                                    }}
                                    value={searchQuery}
                                    onChange={setQuery}
                                />
                                { searchQuery.length > 0
                                && (
                                    <Tooltip
                                        title={
                                            intl.formatMessage({
                                                defaultMessage: 'Clear Search',
                                                id: 'ApplicationSettings.ChangeAppOwner.clear.search',
                                            })
                                        }
                                    >
                                        <IconButton
                                            aria-label='clear-search'
                                            onClick={clearSearch}
                                            size='large'
                                        >
                                            <HighlightOffRoundedIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Grid>
                            <Grid item>
                                <Button
                                    variant='outlined'
                                    sx={{ mr: 1 }}
                                    type='submit'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <FormattedMessage
                                            id='ApplicationSettings.ChangeAppOwner.applications.searching'
                                            defaultMessage='Searching'
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id='ApplicationSettings.ChangeAppOwner.applications.search'
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
                        <ApplicationTableHead columnData={columnData} />
                        <AppsTableContent
                            apps={applicationList}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            editComponentProps={{
                                icon: <EditIcon aria-label='edit-application-settings' />,
                                title: intl.formatMessage({
                                    id: 'ApplicationSettings.ChangeAppOwner.applications.list.title',
                                    defaultMessage: 'Change Application Owner',
                                }),
                                applicationList,
                            }}
                            EditComponent={EditApplication}
                            apiCall={apiCall}
                            columns={columns}
                        />
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    component='td'
                                    count={totalApps}
                                    rowsPerPage={rowsPerPage}
                                    rowsPerPageOptions={[5, 10, 15]}
                                    labelDisplayedRows={({ from, to, count }) => {
                                        if (count !== -1) {
                                            return intl.formatMessage({
                                                id: 'ApplicationSettings.ChangeAppOwner.applications.'
                                                    + 'list.rows.range.label',
                                                defaultMessage: '{from}-{to} of {count}',
                                            },
                                            {
                                                from, to, count,
                                            });
                                        }
                                        return intl.formatMessage({
                                            id: 'ApplicationSettings.ChangeAppOwner.applications.'
                                                + 'list.rows.more.than.label',
                                            defaultMessage: 'more than {to}',
                                        },
                                        { to });
                                    }}
                                    labelRowsPerPage={intl.formatMessage({
                                        id: 'ApplicationSettings.ChangeAppOwner.applications.list.rows.show.label',
                                        defaultMessage: 'Show',
                                    })}
                                    page={page}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
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
                                id='ApplicationSettings.ChangeAppOwner.empty.message'
                                defaultMessage='No Data to Display'
                            />
                        </Typography>
                    </Alert>
                </Box>
            )}
        </>
    );
}

ChangeAppOwner.propTypes = {
    loading: PropTypes.bool.isRequired,
    applicationList: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        owner: PropTypes.string.isRequired,
    })),
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    totalApps: PropTypes.number.isRequired,
    searchQuery: PropTypes.string.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    setQuery: PropTypes.func.isRequired,
    clearSearch: PropTypes.func.isRequired,
    filterApps: PropTypes.func.isRequired,
    apiCall: PropTypes.func.isRequired,
};

ChangeAppOwner.defaultProps = {
    applicationList: [],
};
