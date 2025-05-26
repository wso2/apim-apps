/* eslint-disable */
/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
    Box,
    Button,
    Grid,
    InputBase,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Progress from 'AppComponents/Shared/Progress';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import Subscription from 'AppData/Subscription';
import { app } from 'Settings';
import SdkTableData from './SdkTableData';
import SdkLanguages from './SdkLanguages';

const PREFIX = 'SDKGeneration';

const classes = {
    searchRoot: `${PREFIX}-searchRoot`,
    input: `${PREFIX}-input`,
    iconButton: `${PREFIX}-iconButton`,
    divider: `${PREFIX}-divider`,
    root: `${PREFIX}-root`,
    subscribePop: `${PREFIX}-subscribePop`,
    firstCell: `${PREFIX}-firstCell`,
    cardTitle: `${PREFIX}-cardTitle`,
    cardContent: `${PREFIX}-cardContent`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    dialogTitle: `${PREFIX}-dialogTitle`,
    genericMessageWrapper: `${PREFIX}-genericMessageWrapper`,
    searchWrapper: `${PREFIX}-searchWrapper`,
    searchResults: `${PREFIX}-searchResults`,
    clearSearchIcon: `${PREFIX}-clearSearchIcon`,
    subsTable: `${PREFIX}-subsTable`,
};

const StyledProgress = styled(Progress)((
    {
        theme,
    },
) => ({
    [`& .${classes.searchRoot}`]: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
        flex: 1,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },

    [`& .${classes.input}`]: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },

    [`& .${classes.iconButton}`]: {
        padding: 10,
    },

    [`& .${classes.divider}`]: {
        height: 28,
        margin: 4,
    },

    [`& .${classes.root}`]: {
        padding: theme.spacing(3),
        '& h5': {
            color: theme.palette.getContrastText(theme.palette.background.default),
        },
    },

    [`& .${classes.subscribePop}`]: {
        '& span, & h5, & label, & input, & td, & li': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
    },

    [`& .${classes.firstCell}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.cardTitle}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.cardContent}`]: {
        '& table tr td': {
            paddingLeft: theme.spacing(1),
        },
        '& table tr:nth-child(even)': {
            backgroundColor: theme.custom.listView.tableBodyEvenBackgrund,
            '& td, & a': {
                color: theme.palette.getContrastText(theme.custom.listView.tableBodyEvenBackgrund),
            },
        },
        '& table tr:nth-child(odd)': {
            backgroundColor: theme.custom.listView.tableBodyOddBackgrund,
            '& td, & a': {
                color: theme.palette.getContrastText(theme.custom.listView.tableBodyOddBackgrund),
            },
        },
        '& table th': {
            backgroundColor: theme.custom.listView.tableHeadBackground,
            color: theme.palette.getContrastText(theme.custom.listView.tableHeadBackground),
            paddingLeft: theme.spacing(1),
        },

    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        alignItems: 'center',
        paddingBottom: theme.spacing(2),
        '& h5': {
            marginRight: theme.spacing(1),
        },
    },

    [`& .${classes.dialogTitle}`]: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: theme.spacing(1),
    },

    [`& .${classes.genericMessageWrapper}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.searchWrapper}`]: {
        flex: 1,
    },

    [`& .${classes.searchResults}`]: {
        height: 30,
        display: 'flex',
        paddingTop: theme.spacing(1),
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.clearSearchIcon}`]: {
        cursor: 'pointer',
    },

    [`& .${classes.subsTable}`]: {
        '& td': {
            padding: '4px 8px',
        },
    },
}));

const SearchContainer = styled('div')({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
});

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(0.5, 0, 0, 0),
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

const styles = {
    stepContainer: {
        width: '100%',
        maxWidth: '1200px',
        marginBottom: '20px',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'flex-start',
    },
    numberCircle: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#1C6584',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '18px',
        mr: 2,
        flexShrink: 0,
    },
};

const StyledTableContainer = styled(TableContainer)({
    flex: 1,
});

class Sdks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subscriptions: null,
            subscriptionsNotFound: false,
            isAuthorize: true,
            searchQuery: '',
            selectedLanguage: null,
            selectedAPIs: [],
            page: 0,
            rowsPerPage: 5,
            selectedPage: 0,
            selectedRowsPerPage: 6,
        };

        this.updateSubscriptions = this.updateSubscriptions.bind(this);
        this.handleLanguageSelect = this.handleLanguageSelect.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleSelectedPageChange = this.handleSelectedPageChange.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleApiSelect = this.handleApiSelect.bind(this);
        this.handleRemoveSelectedApi = this.handleRemoveSelectedApi.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleDeselectAll = this.handleDeselectAll.bind(this);
        this.handleToggleSelectAll = this.handleToggleSelectAll.bind(this);
    }

    componentDidMount() {
        const { applicationId } = this.props.application;
        this.updateSubscriptions(applicationId);
    }

    updateSubscriptions(applicationId) {
        const client = new Subscription();
        const subscriptionLimit = app.subscriptionLimit || 1000;
        const promisedSubscriptions = client.getSubscriptions(null, applicationId, subscriptionLimit);
        promisedSubscriptions
            .then((response) => {
                this.setState({ subscriptions: response.body.list });
            })
            .catch((error) => {
                const { status } = error;
                if (status === 404) {
                    this.setState({ subscriptionsNotFound: true });
                } else if (status === 401) {
                    this.setState({ isAuthorize: false });
                }
            });
    }

    handleChangePage(event, newPage) {
        this.setState({
            page: newPage,
        });
    }

    handleSelectedPageChange(event, newPage) {
        this.setState({
            selectedPage: newPage,
        });
    }

    handleSearchChange(event) {
        this.setState({
            searchQuery: event.target.value.toLowerCase(),
            page: 0,
        });
    }

    handleLanguageSelect(language) {
        this.setState({
            selectedLanguage: language,
        });
    }

    handleApiSelect(selectedSubscription) {
        this.setState(prevState => ({
            selectedAPIs: [...prevState.selectedAPIs, selectedSubscription]
        }));
    }

    handleRemoveSelectedApi(apiToRemove) {
        this.setState(prevState => ({
            selectedAPIs: prevState.selectedAPIs.filter(
                api => api.apiId !== apiToRemove.apiId,
            ),
        }));
    }

    handleSelectAll() {
        const { subscriptions, selectedAPIs, searchQuery } = this.state;
        const availableSubscriptions = subscriptions
            ? subscriptions
                .filter((subscription) =>
                    !selectedAPIs.some(selectedApi => selectedApi.apiId === subscription.apiId)
                )
                .filter((subscription) =>
                    subscription.apiInfo?.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            : [];
        this.setState({
            selectedAPIs: [...selectedAPIs, ...availableSubscriptions]
        });
    }

    handleDeselectAll() {
        this.setState({
            selectedAPIs: []
        });
    }

    handleToggleSelectAll() {
        const { selectedAPIs } = this.state;
        if (selectedAPIs.length > 0) {
            this.handleDeselectAll();
        } else {
            this.handleSelectAll();
        }
    }

    render() {
        const { isAuthorize, page, rowsPerPage, searchQuery, selectedAPIs, selectedLanguage, selectedPage, selectedRowsPerPage, subscriptions, subscriptionsNotFound,  } = this.state;

        const { applicationId } = this.props.application;
        const { intl } = this.props;

        if (!isAuthorize) {
            window.location = app.context + '/services/configs';
        }

        const availableSubscriptions = subscriptions
            ? subscriptions
                .filter((subscription) => 
                    !selectedAPIs.some(selectedApi => selectedApi.apiId === subscription.apiId)
                )
                .filter((subscription) =>
                    subscription.apiInfo?.name.toLowerCase().includes(searchQuery)
                )
            : [];

        const paginatedAvailableAPIs = availableSubscriptions.slice(
            page * rowsPerPage, 
            page * rowsPerPage + rowsPerPage
        );

        const paginatedSelectedAPIs = selectedAPIs.slice(
            selectedPage * selectedRowsPerPage,
            selectedPage * selectedRowsPerPage + selectedRowsPerPage
        );

        if (subscriptions) {
            return (
                <Box sx={(theme) => ({
                    padding: theme.spacing(3),
                    '& h5': {
                        color: theme.palette.getContrastText(theme.palette.background.default),
                    },
                })}
                >
                    <Box sx={(theme) => ({
                        display: 'flex',
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        paddingLeft: '50px',

                        paddingBottom: theme.spacing(2),
                        '& h5': {
                            marginRight: theme.spacing(1),
                        },
                    })}
                    >
                        <Typography
                            variant='h5'
                            sx={{
                                textTransform: 'capitalize',
                            }}
                        >
                            <FormattedMessage
                                id='Applications.Details.Sdk.generation'
                                defaultMessage='SDK Generation'
                            />
                        </Typography>
                    </Box>
                    <Grid container sx='tab-grid' spacing={2}>
                        <Grid item xs={12} xl={11}>
                            {(subscriptions && subscriptions.length === 0)
                                ? (
                                    <Box sx={(theme) => ({
                                        margin: theme.spacing(2),
                                    })}
                                    >
                                        <InlineMessage
                                            type='info'
                                            sx={(theme) => ({
                                                width: 1000,
                                                padding: theme.spacing(2),
                                            })}
                                        >
                                            <Typography variant='h5' component='h3'>
                                                <FormattedMessage
                                                    id='Applications.Details.Subscriptions.no.subscriptions'
                                                    defaultMessage='No APIs Available'
                                                />
                                            </Typography>
                                            <Typography component='p'>
                                                <FormattedMessage
                                                    id='Applications.Details.Subscriptions.no.subscriptions.content'
                                                    defaultMessage='No APIs are subscribed to this Application'
                                                />
                                            </Typography>
                                        </InlineMessage>
                                    </Box>
                                )
                                : (
                                    <Box sx={(theme) => ({
                                        '& table tr td': {
                                            paddingLeft: theme.spacing(1),
                                        },
                                        '& table tr:nth-child(even)': {
                                            backgroundColor: theme.custom.listView.tableBodyEvenBackgrund,
                                            '& td, & a': {
                                                color: theme.palette.getContrastText(theme.custom.listView.tableBodyEvenBackgrund),
                                            },
                                        },
                                        '& table tr:nth-child(odd)': {
                                            backgroundColor: theme.custom.listView.tableBodyOddBackgrund,
                                            '& td, & a': {
                                                color: theme.palette.getContrastText(theme.custom.listView.tableBodyOddBackgrund),
                                            },
                                        },
                                        '& table th': {
                                            backgroundColor: theme.custom.listView.tableHeadBackground,
                                            color: theme.palette.getContrastText(theme.custom.listView.tableHeadBackground),
                                            paddingLeft: theme.spacing(1),
                                        },

                                    })}
                                    >
                                        {subscriptionsNotFound ? (
                                            <ResourceNotFound />
                                        ) : (

                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '100%',
                                                paddingLeft: '50px',
                                            }}>
                                                <Box sx={styles.stepContainer}>
                                                    <Box sx={styles.numberCircle}>
                                                        55
                                                    </Box>
                                                    <Box sx={{ 
                                                    
                                                    marginBottom: '20px'}} >
                                                        <Typography variant="h5" component="h2" sx={styles.stepTitle}>
                                                            Select APIs
                                                        </Typography>
                                                        <Typography variant="body1" sx={styles.stepDescription}>
                                                            Choose the APIs you want to include in your SDK from the table below.
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        maxWidth: '1200px',
                                                        backgroundColor: '#ffffff',
                                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                                        borderRadius: '8px',
                                                        padding: '16px',
                                                    }}
                                                >
                                                    <Grid container spacing={0}>
                                                        <Grid item xs={6}>
                                                            <Box sx={{
                                                                width: '100%',
                                                                height: 520,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                borderRight: '1px solid rgba(224, 224, 224, 1)',
                                                            }}>
                                                                <Table stickyHeader>
                                                                    <TableHead>
                                                                    <TableRow>
                                                                            <TableCell align="center" style={{ fontSize: '16px', width: '70%' }}>
                                                                                Available APIs
                                                                            </TableCell>
                                                                            <TableCell align="right" colSpan={2} style={{ width: '30%', paddingRight: '16px' }}>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="primary"
                                                                                    onClick={this.handleToggleSelectAll}
                                                                                    disabled={
                                                                                        (!paginatedAvailableAPIs || paginatedAvailableAPIs.length === 0) && 
                                                                                        selectedAPIs.length === 0
                                                                                    }
                                                                                    sx={{ 
                                                                                        height: 32, 
                                                                                        textTransform: 'none',
                                                                                        fontSize: '0.875rem'
                                                                                    }}
                                                                                >
                                                                                    {selectedAPIs.length > 0 ? 'Deselect All' : 'Select All'}
                                                                                </Button>
                                                                            </TableCell>
                                                                            </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ paddingLeft: '16px' }}>Name</TableCell>
                                                                            <TableCell>Version</TableCell>  
                                                                            <TableCell></TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell colSpan={3} style={{ paddingLeft: '16px' }}>
                                                                                <SearchContainer>
                                                                                    <SearchIcon 
                                                                                        style={{ 
                                                                                            marginRight: '5px', 
                                                                                            marginLeft: '0px', 
                                                                                            color: '#aaa' 
                                                                                        }} 
                                                                                    />
                                                                                    <StyledInputBase
                                                                                        placeholder="Search by API Name"
                                                                                        inputProps={{ 'aria-label': 'search' }}
                                                                                        value={searchQuery}
                                                                                        onChange={this.handleSearchChange} />
                                                                                </SearchContainer>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                </Table>
                                                                <StyledTableContainer>
                                                                    <Table>
                                                                        <TableBody>
                                                                            {subscriptions && paginatedAvailableAPIs.map((subscription) => (
                                                                                <SdkTableData
                                                                                    key={subscription.subscriptionId}
                                                                                    subscription={subscription}
                                                                                    onApiSelect={this.handleApiSelect}
                                                                                    isSelectable={true} />
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </StyledTableContainer>
                                                                <TablePagination
                                                                    rowsPerPageOptions={[5]}
                                                                    component="div"
                                                                    count={subscriptions ? subscriptions.length : 0}
                                                                    rowsPerPage={rowsPerPage}
                                                                    page={page}
                                                                    onPageChange={this.handleChangePage}
                                                                 />   
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Box sx={{
                                                                width: '100%',
                                                                height: 520,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                borderLeft: '1px solid rgba(224, 224, 224, 1)',
                                                            }}>
                                                                <Table stickyHeader>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell colSpan={3} align="center" style={{ fontSize: '16px', height: '32px' }}  >
                                                                                Selected APIs
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ paddingLeft: '32px' }}></TableCell>
                                                                            <TableCell>Name</TableCell>
                                                                            <TableCell>Version</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                </Table>
                                                                <StyledTableContainer>
                                                                    <Table>
                                                                        <TableBody>
                                                                            {paginatedSelectedAPIs.map((selectedApi) => (
                                                                                <SdkTableData
                                                                                    key={selectedApi.apiId}
                                                                                    subscription={selectedApi}
                                                                                    onApiRemove={this.handleRemoveSelectedApi}
                                                                                    isSelectable={false} 
                                                                                />
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </StyledTableContainer>
                                                                <TablePagination
                                                                    rowsPerPageOptions={[5]}
                                                                    component="div"
                                                                    count={selectedAPIs.length}
                                                                    rowsPerPage={selectedRowsPerPage}
                                                                    page={selectedPage}
                                                                    onPageChange={this.handleSelectedPageChange}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>                                           
                                                <Box sx={{ 
                                                ...styles.stepContainer, 
                                                marginTop: '80px' 
                                                }}>
                                                    <Box sx={styles.numberCircle}>
                                                        2
                                                    </Box>
                                                    <Box sx={{ marginBottom: '20px'}} >
                                                        <Typography variant="h5" component="h2" sx={styles.stepTitle}>
                                                            Select Language and Download SDK
                                                        </Typography>
                                                        <Typography variant="body1" sx={styles.stepDescription}>
                                                            Choose your preferred programming language and download your customized SDK.
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    border: 'red'
                                                }}>
                                                    <SdkLanguages 
                                                        selectedSubscriptions={selectedAPIs}
                                                        selectedLanguage={selectedLanguage}
                                                        applicationId={applicationId}
                                                        intl={intl}
                                                        onLanguageSelect={this.handleLanguageSelect}
                                                    />
                                                </Box>                                         
                                         </Box>
                                        )}
                                    </Box>
                                )}
                        </Grid>
                    </Grid>
                </Box>
            );
        } else {
            return <StyledProgress />;
        }
    }
}
Sdks.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default withRouter(injectIntl(Sdks));