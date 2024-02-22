/* eslint-disable no-nested-ternary */
/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { Component } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { ScopeValidation, resourceMethods, resourcePaths } from 'AppComponents/Shared/ScopeValidation';
import Alert from 'AppComponents/Shared/Alert';
import Loading from 'AppComponents/Base/Loading/Loading';
import Application from 'AppData/Application';
import Settings from 'AppComponents/Shared/SettingsContext';
import { appSettings } from 'Settings';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import AppsTableContent from './AppsTableContent';
import ApplicationTableHead from './ApplicationTableHead';
import DeleteConfirmation from './DeleteConfirmation';

/**
 * @inheritdoc
 * @class Listing
 * @extends {Component}
 */
class Listing extends Component {
    /**
     *
     * @param {any} props properties
     */
    constructor(props) {
        super(props);
        this.state = {
            order: 'asc',
            orderBy: 'name',
            data: null,
            page: 0,
            rowsPerPage: Listing.rowsPerPage,
            isApplicationSharingEnabled: true,
            isDeleteOpen: false,
            totalApps: 0,
            query: '',
        };
        this.handleAppDelete = this.handleAppDelete.bind(this);
        this.setQuery = this.setQuery.bind(this);
        this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this);
        this.filterApps = this.filterApps.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
    }

    /**
     * @memberof Listing
     */
    componentDidMount() {
        this.updateApps();
        this.isApplicationGroupSharingEnabled();
    }

    /**
     * @memberof Listing
     */
     constfilterApps = () => {
         this.setState({ page: 0 });
         this.updateApps(undefined, 0);
         this.isApplicationGroupSharingEnabled();
     }

    clearSearch = () => {
        this.setState({ query: '', data: null, page: 0 });
        this.updateApps('', 0);
        this.isApplicationGroupSharingEnabled();
    }

    /**
     * retrieve Settings from the context and check the application sharing enabled
     * @param {*} settingsData required data
     */
    isApplicationGroupSharingEnabled = () => {
        const settingsContext = this.context;
        const enabled = settingsContext.settings.applicationSharingEnabled;
        this.setState({ isApplicationSharingEnabled: enabled });
    }

    /**
     * @memberof Listing
     */
    setQuery = (event) => {
        const newQuery = event.target.value;
        if (newQuery === '') {
            this.clearSearch();
        } else {
            this.setState({ query: newQuery });
        }
    };

    /**
     * @memberof Listing
     */
    updateApps = (newQuery, newPage) => {
        const {
            page, rowsPerPage, order, orderBy, query,
        } = this.state;
        const queryToSearch = newQuery !== undefined ? newQuery : query;
        const pageToSearch = newPage !== undefined ? newPage : page;
        const promisedApplications = Application.all(rowsPerPage, pageToSearch * rowsPerPage, order, orderBy, queryToSearch);
        promisedApplications
            .then((applications) => {
                const { pagination: { total } } = applications;
                // Applications list put into map, to make it efficient when deleting apps (referring back to an App)
                const apps = new Map();
                applications.list.map((app) => apps.set(app.applicationId, app)); // Store application against its UUID
                this.setState({ data: apps, totalApps: total });
            })
            .catch((error) => {
                console.log(error);
                const { status } = error;
                if (status === 404) {
                    // eslint-disable-next-line react/no-unused-state
                    this.setState({ notFound: true });
                } else if (status === 401) {
                    window.location = appSettings.context + '/services/configs';
                }
            });
    }

    /**
     * @param{*} event event
     * @param{*} property sorting method
     */
    handleRequestSort = (event, property) => {
        const { orderBy, order } = this.state;
        let currentOrder = 'desc';
        if (orderBy === property) {
            currentOrder = order === 'desc' ? 'asc' : 'desc';
            this.setState({ order: currentOrder }, this.updateApps);
        } else {
            this.setState({ order: currentOrder, orderBy: property }, this.updateApps);
        }
    };

    /**
     *
     * @param {*} event event
     * @param {*} page page
     * @memberof Listing
     */
    handleChangePage = (event, page) => {
        this.setState({ page }, this.updateApps);
    }

    /**
     *
     * @inheritdoc
     * @memberof Listing
     */
    handleChangeRowsPerPage = (event) => {
        const nextRowsPerPage = event.target.value;
        const { rowsPerPage, page } = this.state;
        const rowsPerPageRatio = rowsPerPage / nextRowsPerPage;
        const nextPage = Math.floor(page * rowsPerPageRatio);
        this.setState({ rowsPerPage: nextRowsPerPage, page: nextPage }, this.updateApps);
    };

    /**
     * @memberof Listing
     */
    handleClickOpen = () => {
        const { history } = this.props;
        history.push('/applications/create');
    };

    /**
     * @memberof Listing
     */
     filterApps = () => {
         this.setState({ page: 0 });
         this.updateApps(undefined, 0);
         this.isApplicationGroupSharingEnabled();
     }

    toggleDeleteConfirmation = (event) => {
        let id = '';
        if (event) {
            id = event.currentTarget.getAttribute('data-appid');
        }
        this.setState(({ isDeleteOpen }) => ({ isDeleteOpen: !isDeleteOpen, deletingId: id }));
    }

    /**
     * @memberof Listing
     * @param {Event} event click event
     */
    handleSearchKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.setState({ page: 0 });
            this.updateApps(undefined, 0);
            this.isApplicationGroupSharingEnabled();
        }
    }

    /**
     * @param {*} event event
     * @memberof Listing
     */
    handleAppDelete() {
        const { data, deletingId, page } = this.state;
        const { intl } = this.props;
        const newData = new Map([...data]);
        const app = newData.get(deletingId);
        app.deleting = true;

        let message = intl.formatMessage({
            defaultMessage: 'Application {name} deleted successfully!',
            id: 'Applications.Listing.Listing.application.deleted.successfully',
        }, { name: app.name });
        const promisedDelete = Application.deleteApp(deletingId);
        promisedDelete.then((status) => {
            if (status === 201) {
                newData.delete(deletingId);
                Alert.info(intl.formatMessage({
                    defaultMessage: 'Delete request created for application {name}',
                    id: 'Applications.Listing.Listing.application.deleting.requested',
                }, { name: app.name }));
                this.toggleDeleteConfirmation();
                // Page is reduced by 1, when there is only one application in a
                // particular page and it is deleted (except when in first page)
                if (newData.size === 0 && page !== 0) {
                    this.setState((state) => ({ page: state.page - 1 }));
                }
                this.updateApps();
            } else if (status === 200) {
                newData.delete(deletingId);
                Alert.info(message);
                this.toggleDeleteConfirmation();
                // Page is reduced by 1, when there is only one application in a
                // particular page and it is deleted (except when in first page)
                if (newData.size === 0 && page !== 0) {
                    this.setState((state) => ({ page: state.page - 1 }));
                }
                this.updateApps();
            }
        }).catch((error) => {
            console.log(error);
            message = intl.formatMessage({
                defaultMessage: 'Error while deleting application {name}',
                id: 'Applications.Listing.Listing.application.deleting.error',
            }, { name: app.name });
            Alert.error(message);
        });
    }

    static rowsPerPage = 10;

    /**
    * @inheritdoc
    */
    render() {
        const {
            data, order, orderBy, rowsPerPage, page, isApplicationSharingEnabled,
            isDeleteOpen, totalApps, query,
        } = this.state;
        const { intl } = this.props;
        const paginationEnabled = totalApps > Listing.rowsPerPage;
        return (
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={(theme) => ({
                    minHeight: 80,
                    background: theme.custom.infoBar.background,
                    color: theme.palette.getContrastText(theme.custom.infoBar.background),
                    borderBottom: `solid 1px ${theme.palette.grey.A200}`,
                    display: 'block',
                })}
                >
                    <Box display='flex' flexDirection='row' justifyContent='flex-start' alignItems='center'>
                        <Box sx={(theme) => ({
                            paddingTop: theme.spacing(1.5),
                            paddingLeft: theme.spacing(3),
                            paddingRight: theme.spacing(2.5),
                        })}
                        >
                            <CustomIcon
                                strokeColor='#1a1f2f'
                                width={42}
                                height={42}
                                icon='applications'
                            />
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                            <Typography
                                variant='h4'
                                component='h1'
                                sx={{
                                    paddingTop: 1,
                                }}
                            >
                                <FormattedMessage
                                    id='Applications.Listing.Listing.applications'
                                    defaultMessage='Applications'
                                />
                            </Typography>
                            <Box sx={(theme) => ({
                                paddingLeft: theme.spacing(2),
                            })}
                            >
                                <ScopeValidation
                                    resourcePath={resourcePaths.APPLICATIONS}
                                    resourceMethod={resourceMethods.POST}
                                >
                                    <Link id='itest-application-create-link' to='/applications/create'>
                                        <Button
                                            variant='contained'
                                            color='primary'
                                        >
                                            <FormattedMessage
                                                id='Applications.Create.Listing.add.new.application'
                                                defaultMessage='Add New Application'
                                            />
                                        </Button>
                                    </Link>
                                </ScopeValidation>
                            </Box>
                        </Box>
                    </Box>
                    <Box display='flex' pl={4}>
                        <Typography variant='caption' gutterBottom align='left'>
                            <FormattedMessage
                                id='Applications.Listing.Listing.logical.description'
                                defaultMessage={`An application is a logical collection of APIs. 
                                        Applications allow you to use a single access token to invoke a
                                         collection of APIs and to subscribe to one API multiple times
                                          and allows unlimited access by default.`}
                            />
                        </Typography>
                    </Box>
                </Box>
                <Paper sx={{ margin: 4 }}>
                    <AppBar sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }} position='static' color='default' elevation={0}>
                        <Toolbar>
                            <Grid container spacing={2} alignItems='center'>
                                <Grid item>
                                    <SearchIcon sx={{ display: 'block' }} color='inherit' />
                                </Grid>
                                <Grid item xs>
                                    <TextField
                                        variant='standard'
                                        fullWidth
                                        id='search-label'
                                        label={intl.formatMessage({
                                            defaultMessage: 'Search',
                                            id: 'Applications.Listing.Listing.applications.search.label',
                                        })}
                                        placeholder={intl.formatMessage({
                                            defaultMessage: 'Search application by name',
                                            id: 'Applications.Listing.Listing.applications.search.placeholder',
                                        })}
                                        InputProps={{
                                            disableUnderline: true,
                                            className: (theme) => ({
                                                fontSize: theme.typography.fontSize,
                                                height: 50,
                                            }),
                                        }}
                                        value={query}
                                        onChange={this.setQuery}
                                        onKeyPress={this.handleSearchKeyPress}
                                    />
                                    {query.length > 0 && (
                                        <Tooltip title={intl.formatMessage({
                                            defaultMessage: 'Clear Search',
                                            id: 'Applications.Listing.Listing.clear.search',
                                        })}
                                        >
                                            <IconButton
                                                aria-label='delete'
                                                sx={{
                                                    position: 'absolute',
                                                    right: 111,
                                                    top: 13,
                                                }}
                                                onClick={this.clearSearch}
                                                size='large'
                                            >
                                                <HighlightOffRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant='contained'
                                        color='grey'
                                        sx={(theme) => ({
                                            marginRight: theme.spacing(1),
                                            background: theme.palette.grey[300],
                                        })}
                                        onClick={this.filterApps}
                                    >
                                        <FormattedMessage
                                            id='Applications.Listing.Listing.applications.search'
                                            defaultMessage='Search'
                                        />

                                    </Button>

                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    {!data && (
                        <Box sx={{ margin: 0 }}>
                            <Loading />
                        </Box>
                    )}
                    {data && (
                        <Box sx={{ margin: 0 }}>
                            {data.size > 0 ? (
                                <Box sx={(theme) => ({
                                    marginTop: 0,
                                    margin: 'auto',
                                    maxHeight: theme.spacing(90),
                                    height: theme.spacing(90),
                                    overflow: 'scroll',
                                })}
                                >
                                    <Paper sx={(theme) => ({
                                        '& table tr td': {
                                            paddingLeft: theme.spacing(1),
                                        },
                                        '& table tr td:first-child, & table tr th:first-child': {
                                            paddingLeft: theme.spacing(2),
                                        },
                                        '& table tr:nth-child(even)': {
                                            backgroundColor: theme.custom.listView.tableBodyEvenBackgrund,
                                            '& td, & a, & .material-icons': {
                                                color: theme
                                                    .palette.getContrastText(theme.custom.listView.tableBodyEvenBackgrund),
                                            },
                                        },
                                        '& table tr:nth-child(odd)': {
                                            backgroundColor: theme.custom.listView.tableBodyOddBackgrund,
                                            '& td, & a, & .material-icons': {
                                                color: theme.palette.getContrastText(theme.custom.listView.tableBodyOddBackgrund),
                                            },
                                        },
                                        '& table th': {
                                            backgroundColor: theme.custom.listView.tableHeadBackground,
                                            color: theme.palette.getContrastText(theme.custom.listView.tableHeadBackground),
                                            paddingLeft: theme.spacing(1),
                                        },
                                        '& table tr td button.Mui-disabled span.material-icons': {
                                            color: theme.palette.action.disabled,
                                        },
                                    })}
                                    >
                                        <Table id='itest-application-list-table'>
                                            <ApplicationTableHead
                                                order={order}
                                                orderBy={orderBy}
                                                onRequestSort={this.handleRequestSort}
                                            />
                                            <AppsTableContent
                                                handleAppDelete={this.handleAppDelete}
                                                apps={data}
                                                page={page}
                                                rowsPerPage={rowsPerPage}
                                                order={order}
                                                orderBy={orderBy}
                                                isApplicationSharingEnabled={isApplicationSharingEnabled}
                                                toggleDeleteConfirmation={this.toggleDeleteConfirmation}
                                            />
                                            {paginationEnabled
                                                && (
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
                                                                onPageChange={this.handleChangePage}
                                                                onRowsPerPageChange={this.handleChangeRowsPerPage}
                                                            />
                                                        </TableRow>
                                                    </TableFooter>
                                                )}
                                        </Table>
                                    </Paper>
                                </Box>
                            ) : (
                                query === '' ? (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        padding: 40,
                                    }}
                                    >
                                        <Typography variant='h6' gutterBottom>
                                            <FormattedMessage
                                                id='Applications.Listing.Listing.noapps.display.title'
                                                defaultMessage='No Applications Available'
                                            />
                                        </Typography>

                                        <Typography variant='body2' gutterBottom>
                                            <a
                                                onClick={this.handleClickOpen}
                                                onKeyDown={this.handleClickOpen}
                                                className={(theme) => ({
                                                    color: theme.palette.primary.light,
                                                    cursor: 'pointer',
                                                })}
                                            >
                                                <FormattedMessage
                                                    id='Applications.Listing.Listing.noapps.display.link.text'
                                                    defaultMessage='Add New Application'
                                                />
                                            </a>
                                        </Typography>
                                    </Box>
                                )
                                    : (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            padding: 40,
                                        }}
                                        >
                                            <Typography variant='h6' gutterBottom>
                                                <FormattedMessage
                                                    id='Applications.Listing.Listing.applications.no.search.results.title'
                                                    defaultMessage='No Matching Applications'
                                                />
                                            </Typography>
                                            <Typography variant='body2' gutterBottom>
                                                <FormattedMessage
                                                    id='Applications.Listing.Listing.applications.no.search.results.body.prefix'
                                                    defaultMessage='Check the spelling or try to '
                                                />
                                                <a
                                                    onClick={this.clearSearch}
                                                    onKeyDown={this.clearSearch}
                                                    className={(theme) => ({
                                                        color: theme.palette.primary.light,
                                                        cursor: 'pointer',
                                                    })}
                                                >
                                                    <FormattedMessage
                                                        id='Applications.Listing.Listing.applications.no.search.results.body.sufix'
                                                        defaultMessage='clear the search'
                                                    />
                                                </a>
                                            </Typography>
                                        </Box>
                                    )
                            )}
                            <DeleteConfirmation
                                handleAppDelete={this.handleAppDelete}
                                isDeleteOpen={isDeleteOpen}
                                toggleDeleteConfirmation={this.toggleDeleteConfirmation}
                            />
                        </Box>
                    )}

                </Paper>
            </Box>
        );
    }
}
Listing.contextType = Settings;
Listing.propTypes = {
    classes: PropTypes.shape({
        root: PropTypes.string,
        flex: PropTypes.string,
        content: PropTypes.string,
        mainIconWrapper: PropTypes.string,
        mainTitle: PropTypes.string,
        mainTitleWrapper: PropTypes.string,
        createLinkWrapper: PropTypes.string,
        appContent: PropTypes.string,
    }).isRequired,
    theme: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
};

export default injectIntl((Listing));
