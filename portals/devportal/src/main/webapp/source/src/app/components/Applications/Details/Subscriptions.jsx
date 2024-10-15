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
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MuiDialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SearchIcon from '@mui/icons-material/Search';
import { FormattedMessage, injectIntl } from 'react-intl';
import Progress from 'AppComponents/Shared/Progress';
import Alert from 'AppComponents/Shared/Alert';
import APIList from 'AppComponents/Apis/Listing/APICardView';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import CONSTANTS from 'AppData/Constants';
import Subscription from 'AppData/Subscription';
import Api from 'AppData/api';
import { app } from 'Settings';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import SubscriptionTableData from './SubscriptionTableData';

const PREFIX = 'Subscriptions';

const classes = {
    searchRoot: `${PREFIX}-searchRoot`,
    searchBar: `${PREFIX}-searchBar`,
    input: `${PREFIX}-input`,
    iconButton: `${PREFIX}-iconButton`,
    divider: `${PREFIX}-divider`,
    root: `${PREFIX}-root`,
    subscribePop: `${PREFIX}-subscribePop`,
    firstCell: `${PREFIX}-firstCell`,
    cardTitle: `${PREFIX}-cardTitle`,
    cardContent: `${PREFIX}-cardContent`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    dialogHeader: `${PREFIX}-dialogHeader`,
    dialogTitle: `${PREFIX}-dialogTitle`,
    genericMessageWrapper: `${PREFIX}-genericMessageWrapper`,
    searchResults: `${PREFIX}-searchResults`,
    clearSearchIcon: `${PREFIX}-clearSearchIcon`,
    subsTable: `${PREFIX}-subsTable`,
    closeButton: `${PREFIX}-closeButton`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(3),
        '& h5': {
            color: theme.palette.getContrastText(theme.palette.background.default),
        },
    },

    [`& .${classes.firstCell}`]: {
        paddingLeft: 0,
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

    [`& .${classes.genericMessageWrapper}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.subsTable}`]: {
        '& td': {
            padding: '4px 8px',
        },
    },

}));

const StyledDialog = styled(Dialog)((
    {
        theme,
    },
) => ({
    [`& .${classes.subscribePop}`]: {
        '& span, & h5, & label, & input, & td, & li': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
    },

    [`& .${classes.dialogHeader}`]: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${classes.dialogTitle}`]: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(2),
    },

    [`& .${classes.searchRoot}`]: {
        marginLeft: 'auto',
        width: '50%',
        marginTop: theme.spacing(2),
    },

    [`& .${classes.searchBar}`]: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
    },

    [`& .${classes.clearSearchIcon}`]: {
        cursor: 'pointer',
    },

    [`& .${classes.input}`]: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },

    [`& .${classes.iconButton}`]: {
        padding: 10,
    },

    [`& .${classes.searchResults}`]: {
        height: 30,
        display: 'flex',
        paddingTop: theme.spacing(1),
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: theme.spacing(3),
    },

    [`& .${classes.closeButton}`]: {
        height: '100%',
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(1),
    },
}));

/**
 *
 *
 * @class Subscriptions
 * @extends {React.Component}
 */
class Subscriptions extends React.Component {
    /**
     *Creates an instance of Subscriptions.
     * @param {*} props properties
     * @memberof Subscriptions
     */
    constructor(props) {
        super(props);
        this.state = {
            subscriptions: null,
            apisNotFound: false,
            subscriptionsNotFound: false,
            isAuthorize: true,
            openDialog: false,
            searchText: '',
            pseudoSubscriptions: false,
        };
        this.checkSubValidationDisabled = this.checkSubValidationDisabled.bind(this);
        this.handleSubscriptionDelete = this.handleSubscriptionDelete.bind(this);
        this.handleSubscriptionUpdate = this.handleSubscriptionUpdate.bind(this);
        this.updateSubscriptions = this.updateSubscriptions.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
        this.handleSearchTextTmpChange = this.handleSearchTextTmpChange.bind(this);
        this.handleClearSearch = this.handleClearSearch.bind(this);
        this.handleEnterPress = this.handleEnterPress.bind(this);
        this.searchTextTmp = '';
    }

    /**
     *
     *
     * @memberof Subscriptions
     */
    componentDidMount() {
        const { applicationId } = this.props.application;
        this.updateSubscriptions(applicationId);
    }

    handleOpenDialog() {
        this.setState((prevState) => ({ openDialog: !prevState.openDialog, searchText: '' }));
    }

    /**
     *
     * Check if the subscription validation is disabled
     * @param {*} subList Subscriptions list reponse object
     * @returns
     */
    checkSubValidationDisabled(subList) {
        if (subList !== null && subList.length > 0) {
            const pseudoList = subList.filter((sub) => (sub.apiInfo.throttlingPolicies
                && sub.apiInfo.throttlingPolicies.length === 1
                && sub.apiInfo.throttlingPolicies[0].includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)));
            if (pseudoList.length === subList.length) {
                this.setState({ pseudoSubscriptions: true });
            } else {
                this.setState({ pseudoSubscriptions: false });
            }
            return;
        }
        this.setState({ pseudoSubscriptions: false });
    }

    /**
     *
     * Update subscriptions list of Application
     * @param {*} applicationId application id
     * @memberof Subscriptions
     */
    updateSubscriptions(applicationId) {
        const client = new Subscription();
        const subscriptionLimit = app.subscriptionLimit || 1000;
        const promisedSubscriptions = client.getSubscriptions(null, applicationId, subscriptionLimit);
        promisedSubscriptions
            .then((response) => {
                this.setState({ subscriptions: response.body.list });
                this.checkSubValidationDisabled(response.body.list);
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

    /**
     *
     * Handle subscription deletion of application
     * @param {*} subscriptionId subscription id
     * @memberof Subscriptions
     */
    handleSubscriptionDelete(subscriptionId) {
        const { intl } = this.props;
        const client = new Subscription();
        const promisedDelete = client.deleteSubscription(subscriptionId);

        promisedDelete
            .then((response) => {
                if (response.status === 201) {
                    console.log(response);
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Subscription Deletion Request Created!',
                        id: 'Applications.Details.Subscriptions.request.created',
                    }));
                    const { applicationId } = this.props.application;
                    this.updateSubscriptions(applicationId);
                    return;
                }
                if (response.status !== 200) {
                    console.log(response);
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Something went wrong while deleting the Subscription!',
                        id: 'Applications.Details.Subscriptions.something.went.wrong',
                    }));
                    return;
                }
                Alert.info(intl.formatMessage({
                    defaultMessage: 'Subscription deleted successfully!',
                    id: 'Applications.Details.Subscriptions.delete.success',
                }));
                const { subscriptions } = this.state;
                for (const endpointIndex in subscriptions) {
                    if (
                        Object.prototype.hasOwnProperty.call(subscriptions, endpointIndex)
                        && subscriptions[endpointIndex].subscriptionId === subscriptionId
                    ) {
                        subscriptions.splice(endpointIndex, 1);
                        break;
                    }
                }
                this.setState({ subscriptions });
                this.checkSubValidationDisabled(subscriptions);
                this.props.getApplication();
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    this.setState({ isAuthorize: false });
                }
                Alert.error(intl.formatMessage({
                    defaultMessage: 'Error occurred when deleting subscription',
                    id: 'Applications.Details.Subscriptions.error.while.deleting',
                }));
            });
    }

    /**
     *
     * Handle subscription update of application
     *
     * @param {*} apiId API id
     * @param {*} subscriptionId subscription id
     * @param {*} throttlingPolicy throttling tier
     * @param {*} status subscription status
     * @memberof Subscriptions
     */
    handleSubscriptionUpdate(apiId, subscriptionId, currentThrottlingPolicy, status, requestedThrottlingPolicy) {
        const { intl } = this.props;
        const { applicationId } = this.props.application;
        const client = new Subscription();
        const promisedUpdate = client.updateSubscription(
            applicationId,
            apiId,
            subscriptionId,
            currentThrottlingPolicy,
            status,
            requestedThrottlingPolicy,
        );

        promisedUpdate
            .then((response) => {
                if (response.status !== 200 && response.status !== 201) {
                    console.log(response);
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Something went wrong while updating the Subscription!',
                        id: 'Applications.Details.Subscriptions.wrong.with.subscription',
                    }));
                    return;
                }
                if (response.body.status === 'TIER_UPDATE_PENDING') {
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Your subscription update request has been submitted and is now awaiting '
                            + 'approval.',
                        id: 'subscription.tierPending',
                    }));
                } else {
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Business Plan updated successfully!',
                        id: 'Applications.Details.Subscriptions.business.plan.updated',
                    }));
                }
                this.updateSubscriptions(applicationId);
                this.props.getApplication();
            })
            .catch((error) => {
                const { status: statusInner } = error;
                if (statusInner === 401) {
                    this.setState({ isAuthorize: false });
                }
                Alert.error(intl.formatMessage({
                    defaultMessage: 'Error occurred when updating subscription',
                    id: 'Applications.Details.Subscriptions.error.when.updating',
                }));
            });
    }

    /**
     * Handle onClick of subscribing to an API
     * @param {*} applicationId application id
     * @param {*} apiId api id
     * @param {*} policy policy
     * @memberof Subscriptions
     */
    handleSubscribe(applicationId, apiId, policy) {
        const api = new Api();
        const { intl } = this.props;
        if (!policy) {
            Alert.error(intl.formatMessage({
                id: 'Applications.Details.Subscriptions.select.a.subscription.policy',
                defaultMessage: 'Select a subscription policy',
            }));
            return;
        }

        const promisedSubscribe = api.subscribe(apiId, applicationId, policy);
        promisedSubscribe
            .then((response) => {
                if (response.status !== 201) {
                    Alert.error(intl.formatMessage({
                        id: 'Applications.Details.Subscriptions.error.occurred.during.subscription.not.201',
                        defaultMessage: 'Error occurred during subscription',
                    }));
                } else {
                    if (response.body.status === 'ON_HOLD') {
                        Alert.info(intl.formatMessage({
                            defaultMessage: 'Your subscription request has been submitted and is now awaiting '
                                + 'approval.',
                            id: 'subscription.pending',
                        }));
                    } else if (response.body.status === 'TIER_UPDATE_PENDING') {
                        Alert.info(intl.formatMessage({
                            defaultMessage: 'Your subscription update request has been submitted and is now awaiting '
                                + 'approval.',
                            id: 'subscription.tierPending',
                        }));
                    } else {
                        Alert.info(intl.formatMessage({
                            id: 'Applications.Details.Subscriptions.subscription.successful',
                            defaultMessage: 'Subscription successful',
                        }));
                    }
                    this.updateSubscriptions(applicationId);
                    this.props.getApplication();
                }
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    this.setState({ isAuthorize: false });
                }
                if (status === 403 && error.response.body) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Applications.Details.Subscriptions.error.occurred.during.subscription',
                        defaultMessage: 'Error occurred during subscription',
                    }));
                }
            });
    }

    handleSearchTextChange() {
        this.setState({ searchText: this.searchTextTmp });
    }

    handleSearchTextTmpChange(event) {
        this.searchTextTmp = event.target.value;
    }

    handleClearSearch() {
        this.setState({ searchText: '' });
        this.searchInputElem.value = '';
    }

    handleEnterPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSearchTextChange();
        }
    }

    /**
     * @inheritdoc
     * @memberof Subscriptions
     */
    render() {
        const { isAuthorize, openDialog, searchText } = this.state;

        if (!isAuthorize) {
            window.location = app.context + '/services/configs';
        }

        const {
            subscriptions, apisNotFound, subscriptionsNotFound,
        } = this.state;
        const { applicationId } = this.props.application;
        const { intl } = this.props;

        if (subscriptions) {
            return (
                <Root>
                    <Box className={classes.root}>
                        <Box className={classes.titleWrapper}>
                            <Typography
                                variant='h5'
                                sx={{
                                    textTransform: 'capitalize',
                                }}
                            >
                                <FormattedMessage
                                    id='Applications.Details.Subscriptions.subscription.management'
                                    defaultMessage='Subscription Management'
                                />
                            </Typography>
                            <Button
                                color='secondary'
                                className={classes.buttonElm}
                                size='small'
                                onClick={this.handleOpenDialog}
                            >
                                <Icon>add_circle_outline</Icon>
                                <FormattedMessage
                                    id='Applications.Details.Subscriptions.subscription.management.add'
                                    defaultMessage='Subscribe APIs'
                                />
                            </Button>
                        </Box>
                        <Grid container sx='tab-grid' spacing={2}>
                            <Grid item xs={12} xl={11}>
                                {((subscriptions && subscriptions.length === 0) || this.state.pseudoSubscriptions)
                                    ? (
                                        <Box className={classes.genericMessageWrapper}>
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
                                                        defaultMessage='No Subscriptions Available'
                                                    />
                                                </Typography>
                                                <Typography component='p'>
                                                    <FormattedMessage
                                                        id='Applications.Details.Subscriptions.no.subscriptions.content'
                                                        defaultMessage='No subscriptions are available for this Application'
                                                    />
                                                </Typography>
                                            </InlineMessage>
                                        </Box>
                                    )
                                    : (
                                        <Box className={classes.cardContent}>
                                            {subscriptionsNotFound ? (
                                                <ResourceNotFound />
                                            ) : (
                                                <Table className={classes.subsTable}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell className={classes.firstCell}>
                                                                <FormattedMessage
                                                                    id='Applications.Details.Subscriptions.api.name'
                                                                    defaultMessage='API'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id={`Applications.Details.Subscriptions
                                                                            .subscription.state`}
                                                                    defaultMessage='Lifecycle State'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id={`Applications.Details.Subscriptions
                                                                            .business.plan`}
                                                                    defaultMessage='Business Plan'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id='Applications.Details.Subscriptions.Status'
                                                                    defaultMessage='Subscription Status'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id='Applications.Details.Subscriptions.action'
                                                                    defaultMessage='Action'
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {subscriptions
                                                                    && subscriptions.map((subscription) => {
                                                                        return (
                                                                            <SubscriptionTableData
                                                                                key={subscription.subscriptionId}
                                                                                subscription={subscription}
                                                                                handleSubscriptionDelete={
                                                                                    this.handleSubscriptionDelete
                                                                                }
                                                                                handleSubscriptionUpdate={
                                                                                    this.handleSubscriptionUpdate
                                                                                }
                                                                            />
                                                                        );
                                                                    })}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </Box>
                                    )}
                            </Grid>
                        </Grid>
                        <StyledDialog
                            onClose={this.handleOpenDialog}
                            aria-labelledby='simple-dialog-title'
                            open={openDialog}
                            fullWidth='true'
                            maxWidth='sm'
                            className={classes.subscribePop}
                        >
                            <Box className={classes.dialogHeader}>
                                <MuiDialogTitle className={classes.dialogTitle} disableTypography>
                                    <Typography variant='h6'>
                                        <FormattedMessage
                                            id='Applications.Details.Subscriptions.subscription.management.add'
                                            defaultMessage='Subscribe APIs'
                                        />
                                    </Typography>
                                </MuiDialogTitle>
                                <Box className={classes.searchRoot}>
                                    <Paper
                                        component='form'
                                        className={classes.searchBar}
                                    >
                                        {searchText && (
                                            <HighlightOffIcon
                                                className={classes.clearSearchIcon}
                                                onClick={this.handleClearSearch}
                                            />
                                        )}
                                        <InputBase
                                            className={classes.input}
                                            placeholder={intl.formatMessage({
                                                defaultMessage: 'Search APIs',
                                                id: 'Applications.Details.Subscriptions.search',
                                            })}
                                            inputProps={{
                                                'aria-label': intl.formatMessage({
                                                    defaultMessage: 'Search APIs',
                                                    id: 'Applications.Details.Subscriptions.search',
                                                }),
                                            }}
                                            inputRef={(el) => { this.searchInputElem = el; }}
                                            onChange={this.handleSearchTextTmpChange}
                                            onKeyDown={this.handleEnterPress}
                                        />
                                        <IconButton
                                            className={classes.iconButton}
                                            aria-label='search'
                                            onClick={this.handleSearchTextChange}
                                            size='large'
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    </Paper>
                                    <Box className={classes.searchResults}>
                                        {(searchText && searchText !== '') ? (
                                            <>
                                                <Typography variant='caption'>
                                                    <FormattedMessage
                                                        id='Applications.Details.Subscriptions.filter.msg'
                                                        defaultMessage='Filtered APIs for'
                                                    />
                                                    {` ${searchText}`}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant='caption'>
                                                <FormattedMessage
                                                    id='Applications.Details.Subscriptions.filter.msg.all.apis'
                                                    defaultMessage='Displaying all APIs'
                                                />
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <IconButton
                                    aria-label='close'
                                    className={classes.closeButton}
                                    onClick={this.handleOpenDialog}
                                    size='large'
                                >
                                    <Icon>cancel</Icon>
                                </IconButton>
                            </Box>
                            <Box padding={2}>
                                <APIList
                                    apisNotFound={apisNotFound}
                                    subscriptions={subscriptions}
                                    applicationId={applicationId}
                                    handleSubscribe={(appInner, api, policy) => this.handleSubscribe(appInner, api, policy)}
                                    searchText={searchText}
                                />
                            </Box>
                        </StyledDialog>
                    </Box>
                </Root>
            );
        } else {
            return <Progress />;
        }
    }
}
Subscriptions.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default injectIntl((Subscriptions));
