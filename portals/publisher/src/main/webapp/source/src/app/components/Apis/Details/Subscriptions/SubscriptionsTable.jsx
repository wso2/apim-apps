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

import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';
import Configurations from 'Config';
import InfoIcon from '@mui/icons-material/Info';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';
import { ScopeValidation, resourceMethod, resourcePath } from 'AppData/ScopeValidation';
import AuthManager from 'AppData/AuthManager';
import { Autocomplete } from '@mui/lab';
import { TextField } from '@mui/material';
import Invoice from './Invoice';

const PREFIX = 'SubscriptionsTable';

const classes = {
    heading: `${PREFIX}-heading`,
    button: `${PREFIX}-button`,
    headline: `${PREFIX}-headline`,
    popupHeadline: `${PREFIX}-popupHeadline`,
    table: `${PREFIX}-table`,
    searchDiv: `${PREFIX}-searchDiv`,
    searchRoot: `${PREFIX}-searchRoot`,
    searchInput: `${PREFIX}-searchInput`,
    searchIconButton: `${PREFIX}-searchIconButton`,
    noDataMessage: `${PREFIX}-noDataMessage`,
    tableColumnSize: `${PREFIX}-tableColumnSize`,
    tableColumnSize2: `${PREFIX}-tableColumnSize2`,
    dialogColumnSize: `${PREFIX}-dialogColumnSize`,
    dialog: `${PREFIX}-dialog`,
    invoiceTable: `${PREFIX}-invoiceTable`,
    uniqueCell: `${PREFIX}-uniqueCell`,
    mainTitle: `${PREFIX}-mainTitle`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    typography: `${PREFIX}-typography`,
    root: `${PREFIX}-root`,
    subscriberHeader: `${PREFIX}-subscriberHeader`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.heading}`]: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.button}`]: {
        margin: theme.spacing(1),
    },

    [`& .${classes.headline}`]: { paddingTop: theme.spacing(1.25), paddingLeft: theme.spacing(2.5) },

    [`& .${classes.popupHeadline}`]: {
        alignItems: 'center',
        borderBottom: '2px solid #40E0D0',
        textAlign: 'center',
    },

    [`& .${classes.searchDiv}`]: {
        float: 'right',
        paddingTop: theme.spacing(1.25),
        paddingRight: theme.spacing(1.25),
    },

    [`& .${classes.searchRoot}`]: {
        paddingTop: theme.spacing(0.25),
        paddingBottom: theme.spacing(0.25),
        paddingRight: theme.spacing(0.5),
        paddingLeft: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'right',
        width: theme.spacing(50),
        borderBottom: '1px solid #E8E8E8',
    },

    [`& .${classes.searchInput}`]: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },

    [`& .${classes.searchIconButton}`]: {
        padding: theme.spacing(1.25),
    },

    [`& .${classes.noDataMessage}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888888',
        width: '100%',
        fontFamily: theme.typography.fontFamily,
    },

    [`& .${classes.tableColumnSize}`]: {
        width: '14%',
    },

    [`& .${classes.tableColumnSize2}`]: {
        width: '30%',
    },

    [`& .${classes.dialogColumnSize}`]: {
        width: '50%',
    },

    [`& .${classes.dialog}`]: {
        float: 'center',
        alignItems: 'center',
    },

    [`& .${classes.invoiceTable}`]: {
        '& td': {
            fontSize: theme.typography.fontSize * 1.5,
        },
    },

    [`& .${classes.uniqueCell}`]: {
        borderTop: '1px solid #000000',
        fontWeight: 'bold',
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
        marginTop: theme.spacing(3),
    },

    [`& .${classes.titleWrapper}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.typography}`]: {
        padding: theme.spacing(2),
    },

    [`& .${classes.root}`]: {
        flexGrow: 1,
    },

    [`& .${classes.subscriberHeader}`]: {
        fontSize: theme.typography.h6.fontSize,
        color: theme.typography.h6.color,
        fontWeight: theme.typography.h6.fontWeight,
    }
}));

const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 200,
    },
});

const subscriptionStatus = {
    BLOCKED: 'BLOCKED',
    PROD_BLOCKED: 'PROD_ONLY_BLOCKED',
};

/**
 * Table pagination for subscriptions table
 *
 * @param props props used for SubscriptionTablePagination
 * @returns {*}
 */
function SubscriptionTablePagination(props) {
    const {
        count, page, rowsPerPage, onChangePage,
    } = props;

    /**
     * handleFirstPageButtonClick loads data of the first page
     * */
    function handleFirstPageButtonClick() {
        if (onChangePage) {
            onChangePage(0);
        }
    }

    /**
     * handleBackButtonClick load data of the prev page
     * */
    function handleBackButtonClick() {
        if (onChangePage) {
            onChangePage(page - 1);
        }
    }

    /**
     * handleNextButtonClick load data of the next page
     * */
    function handleNextButtonClick() {
        if (onChangePage) {
            onChangePage(page + 1);
        }
    }

    /**
     * handleLastPageButtonClick load data of the last page
     * */
    function handleLastPageButtonClick() {
        if (onChangePage) {
            onChangePage(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
        }
    }

    return (
        <div
            style={{ display: 'flex' }}
        >
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} size='large'>
                <FirstPageIcon />
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} size='large'>
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                size='large'>
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                size='large'>
                <LastPageIcon />
            </IconButton>
        </div>
    );
}

SubscriptionTablePagination.propTypes = {
    count: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
};

/**
 * Lists all subscriptions.
 *
 * @class SubscriptionsTable
 * @extends {React.Component}
 */
class SubscriptionsTable extends Component {
    constructor(props) {
        super(props);
        this.api = props.api;
        this.apiClient = new API();
        this.state = {
            subscriptions: null,
            page: 0,
            rowsPerPage: 5,
            searchQuery: null,
            emptyColumnHeight: 60,
            policies: [],
            subscriberClaims: {},
            loadingClaims: {},
            loadingContactInfo: false,
        };
        this.formatSubscriptionStateString = this.formatSubscriptionStateString.bind(this);
        this.blockSubscription = this.blockSubscription.bind(this);
        this.blockProductionOnly = this.blockProductionOnly.bind(this);
        this.unblockSubscription = this.unblockSubscription.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
        this.filterSubscriptions = this.filterSubscriptions.bind(this);
        this.isMonetizedPolicy = this.isMonetizedPolicy.bind(this);
        this.renderClaims = this.renderClaims.bind(this);
        this.fetchSubscriberClaims = this.fetchSubscriberClaims.bind(this);
        this.fetchAllSubscriberClaims = this.fetchAllSubscriberClaims.bind(this);
        this.isNotCreator = AuthManager.isNotCreator();
        this.isNotPublisher = AuthManager.isNotPublisher();
    }

    componentDidMount() {
        this.fetchSubscriptionData();
    }

    // TODO: This is a React anti-pattern, have to move this to a component ~tmkb
    /**
     * Returns the set of action buttons based on the current subscription state
     *
     * @param {*} state State of the subscription (PROD_ONLY_BLOCKED/BLOCKED/ACTIVE)
     * @param {*} subscriptionId Subscription ID
     * @returns {JSX} Action buttons in JSX
     * @memberof SubscriptionsTable
     */
    getSubscriptionBlockingButtons(state, subscriptionId) {
        if (state === subscriptionStatus.PROD_BLOCKED) {
            return (
                <dev>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.blockProductionOnly(subscriptionId)}
                        className={classes.button}
                        disabled='true'
                    >
                        <FormattedMessage
                            id='block.production.only'
                            defaultMessage='Block Production Only'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.blockSubscription(subscriptionId)}
                        className={classes.button}
                        disabled={this.api.isRevision}
                    >
                        <FormattedMessage
                            id='block.all'
                            defaultMessage='Block All'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.unblockSubscription(subscriptionId)}
                        className={classes.button}
                        disabled={this.api.isRevision}
                    >
                        <FormattedMessage
                            id='unblock'
                            defaultMessage='Unblock'
                        />
                    </Button>
                </dev>
            );
        } else if (state === subscriptionStatus.BLOCKED) {
            return (
                <dev>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.blockProductionOnly(subscriptionId)}
                        className={classes.button}
                        disabled={this.api.isRevision}
                    >
                        <FormattedMessage
                            id='block.production.only'
                            defaultMessage='Block Production Only'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.blockSubscription(subscriptionId)}
                        className={classes.button}
                        disabled='true'
                    >
                        <FormattedMessage
                            id='block.all'
                            defaultMessage='Block All'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.unblockSubscription(subscriptionId)}
                        className={classes.button}
                        disabled={this.api.isRevision}
                    >
                        <FormattedMessage
                            id='unblock'
                            defaultMessage='Unblock'
                        />
                    </Button>
                </dev>
            );
        } else {
            return (
                <dev>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.blockProductionOnly(subscriptionId)}
                        className={classes.button}
                        disabled={this.api.isRevision}
                    >
                        <FormattedMessage
                            id='block.production.only'
                            defaultMessage='Block Production Only'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.blockSubscription(subscriptionId)}
                        className={classes.button}
                        disabled={this.api.isRevision}
                    >
                        <FormattedMessage
                            id='block.all'
                            defaultMessage='Block All'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => this.unblockSubscription(subscriptionId)}
                        className={classes.button}
                        disabled='true'
                    >
                        <FormattedMessage
                            id='unblock'
                            defaultMessage='Unblock'
                        />
                    </Button>
                </dev>
            );
        }
    }

    /**
     * handleChangePage handle change in selected page
     *
     * @param page selected page
     * */
    handleChangePage(page) {
        this.setState({ page }, this.fetchSubscriptionData);
    }

    /**
     * handleChangeRowsPerPage handle change in rows per page
     *
     * @param event rows per page change event
     * */
    handleChangeRowsPerPage(event, changeRowsPerPage) {
        changeRowsPerPage(event.target.value);
        this.setState({ rowsPerPage: event.target.value, page: 0 }, this.fetchSubscriptionData);
    }

    /**
     * Returns subscription state string based on te current subscription state
     *
     * @param {*} state The current state of subscription
     * @returns {JSX} Subscription state string
     * @memberof SubscriptionsTable
     */
    formatSubscriptionStateString(state) {
        if (state === subscriptionStatus.PROD_BLOCKED) {
            return (
                <FormattedMessage
                    id='Apis.Details.Subscriptions.SubscriptionsTable.blocked.production.only.subs.state'
                    defaultMessage='Blocked Production Only'
                />
            );
        } else if (state === subscriptionStatus.BLOCKED) {
            return (
                <FormattedMessage
                    id='Apis.Details.Subscriptions.SubscriptionsTable.blocked.subs.state'
                    defaultMessage='Blocked'
                />
            );
        } else {
            return (
                <FormattedMessage
                    id='Apis.Details.Subscriptions.SubscriptionsTable.active.subs.state'
                    defaultMessage='Active'
                />
            );
        }
    }

    /**
     * Blocks the given subscription
     *
     * @param {*} subscriptionId Subscription ID
     * @memberof SubscriptionsTable
     */
    blockSubscription(subscriptionId) {
        const api = this.apiClient;
        const { intl } = this.props;
        const promisedSubscriptionUpdate = api.blockSubscriptions(subscriptionId, subscriptionStatus.BLOCKED);
        promisedSubscriptionUpdate
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Subscriptions.SubscriptionsTable.subscription.blocked',
                    defaultMessage: 'Subscription was blocked.',
                }));
                this.fetchSubscriptionData();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                const { message } = errorResponse.response.body;
                const messages = defineMessages({
                    errorMessage: {
                        id: 'Apis.Details.Subscriptions.SubscriptionsTable.error.subscription.block',
                        defaultMessage: 'Error: Unable to block subscription. (Reason: {message})',
                    },
                });
                Alert.error(intl.formatMessage(messages.errorMessage, { message }));
            });
    }

    /**
     * Blocks production only for the given subscription
     *
     * @param {*} subscriptionId Subscription ID
     * @memberof SubscriptionsTable
     */
    blockProductionOnly(subscriptionId) {
        const api = this.apiClient;
        const { intl } = this.props;
        const promisedSubscriptionUpdate = api.blockSubscriptions(subscriptionId, subscriptionStatus.PROD_BLOCKED);
        promisedSubscriptionUpdate
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Subscriptions.SubscriptionsTable.subscription.blocked.prod.only',
                    defaultMessage: 'Subscription was blocked for production only.',
                }));
                this.fetchSubscriptionData();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                const { message } = errorResponse.response.body;
                const messages = defineMessages({
                    errorMessage: {
                        id: 'Apis.Details.Subscriptions.SubscriptionsTable.error.subscription.block.prod.only',
                        defaultMessage: 'Error: Unable to block subscription. (Reason: {message})',
                    },
                });
                Alert.error(intl.formatMessage(messages.errorMessage, { message }));
            });
    }

    /**
     * Unblocks the given subscription
     *
     * @param {*} subscriptionId Subscription ID
     * @memberof SubscriptionsTable
     */
    unblockSubscription(subscriptionId) {
        const api = this.apiClient;
        const { intl } = this.props;
        const promisedSubscriptionUpdate = api.unblockSubscriptions(subscriptionId);
        promisedSubscriptionUpdate
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Subscriptions.SubscriptionsTable.subscription.unblocked',
                    defaultMessage: 'Subscription was unblocked.',
                }));
                this.fetchSubscriptionData();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                const { message } = errorResponse.response.body;
                const messages = defineMessages({
                    errorMessage: {
                        id: 'Apis.Details.Subscriptions.SubscriptionsTable.error.subscription.unblock',
                        defaultMessage: 'Error: Unable to unblock subscription. (Reason: {message})',
                    },
                });
                Alert.error(intl.formatMessage(messages.errorMessage, { message }));
            });
    }

    /**
     * Fetches subscription data
     *
     * @memberof SubscriptionsTable
     */
    fetchSubscriptionData() {
        const api = this.apiClient;
        const { page, rowsPerPage, searchQuery } = this.state;
        const { intl } = this.props;
        const { maxSubscriptionLimit } = Configurations.apis;
        const promisedSubscriptions = api.subscriptions(
            this.api.id, 
            page * rowsPerPage, 
            maxSubscriptionLimit, 
            searchQuery
        );
        promisedSubscriptions
            .then((response) => {
                for (let i = 0; i < response.body.list.length; i++) {
                    response.body.list[i].name = response.body.list[i].applicationInfo.name;
                    response.body.list[i].subscriber = response.body.list[i].applicationInfo.subscriber;
                }
                this.setState({
                    subscriptions: response.body.list,
                });
            })
            .catch((errorMessage) => {
                console.error(errorMessage);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Subscriptions.SubscriptionsTable.subscriptions.error',
                    defaultMessage: 'Error while retrieving the subscriptions',
                }));
            });
        let policyPromise;
        if (!this.api.isMCPServer()) {
            api.getMonetization(this.props.api.id).then((status) => {
                this.setState({ monetizationStatus: status.enabled });
            });
            const isAiApi = this.api.subtypeConfiguration?.subtype?.toLowerCase().includes('aiapi') ?? false;
            policyPromise = api.getSubscriptionPolicies(this.api.id, isAiApi);
        } else {
            policyPromise = MCPServer.getSubscriptionPolicies(this.api.id);
        }
        policyPromise
            .then((policies) => {
                const filteredPolicies = policies ? policies.filter((policy) => policy.tierPlan === 'COMMERCIAL') : [];
                this.setState({ policies: filteredPolicies });
            });
    }

    /**
     * Fetches all subscriber claims for all subscriptions
     *
     * @memberof SubscriptionsTable
     */
    fetchAllSubscriberClaims() {
        const api = this.apiClient;
        const { subscriptions, subscriberClaims } = this.state;
        const { intl } = this.props;

        this.setState({ loadingContactInfo: true });

        // Get all subscription IDs that don't have claims yet
        const subscriptionsToFetch = subscriptions.filter(
            (sub) => !subscriberClaims[sub.subscriptionId],
        );

        const promises = subscriptionsToFetch.map((sub) =>
            api
                .getSubscriberInfo(sub.subscriptionId)
                .then((resp) => ({
                    subscriptionId: sub.subscriptionId,
                    data: resp.body,
                }))
                .catch((error) => {
                    console.error(
                        `Error fetching claims for ${sub.subscriptionId}:`,
                        error,
                    );
                    return null;
                }),
        );

        Promise.all(promises)
            .then((results) => {
                const newClaims = {};
                results.forEach((result) => {
                    if (result) {
                        newClaims[result.subscriptionId] = result.data;
                    }
                });

                this.setState(
                    (prevState) => ({
                        subscriberClaims: {
                            ...prevState.subscriberClaims,
                            ...newClaims,
                        },
                        loadingContactInfo: false,
                    }),
                    () => {
                        // After all claims are loaded, open the mailto link
                        this.openContactSubscribersLink();
                    },
                );
            })
            .catch((error) => {
                console.error('Error fetching subscriber claims:', error);
                Alert.error(
                    intl.formatMessage({
                        id: 'Apis.Details.Subscriptions.SubscriptionsTable.subscriber.info.error.bulk',
                        defaultMessage:
                            'Error while retrieving subscriber information',
                    }),
                );
                this.setState({ loadingContactInfo: false });
            });
    }

    /**
     * Opens the mailto link with all subscriber emails
     *
     * @memberof SubscriptionsTable
     */
    openContactSubscribersLink() {
        const { subscriberClaims } = this.state;
        const subMails = {};

        Object.values(subscriberClaims || {}).forEach((v) => {
            if (!v || !v.name || !v.claims || !v.claims.length || subMails[v.name]) {
                return;
            }
            const emailClaim = v.claims.find(
                (claim) => claim.uri === 'http://wso2.org/claims/emailaddress',
            );
            if (emailClaim && emailClaim.value) {
                subMails[v.name] = emailClaim.value;
            }
        });

        const emails = Object.values(subMails).join(',');
        const names = Object.keys(subMails).join(', ');

        if (emails) {
            window.location.href = `mailto:?subject=Message from the API Publisher&cc=${emails}&body=Hi ${
                names || ''
            },`;
        }
    }

    /**
     * Fetches subscriber claims for a specific subscription
     *
     * @param {string} subscriptionId Subscription ID
     * @memberof SubscriptionsTable
     */
    fetchSubscriberClaims(subscriptionId) {
        const api = this.apiClient;
        const { subscriberClaims, loadingClaims } = this.state;
        const { intl } = this.props;

        // Don't fetch if already loaded or currently loading
        if (subscriberClaims[subscriptionId] || loadingClaims[subscriptionId]) {
            return;
        }

        // Mark as loading
        this.setState((prevState) => ({
            loadingClaims: {
                ...prevState.loadingClaims,
                [subscriptionId]: true,
            },
        }));

        const promisedInfo = api.getSubscriberInfo(subscriptionId);
        promisedInfo
            .then((resp) => {
                this.setState((prevState) => ({
                    subscriberClaims: {
                        ...prevState.subscriberClaims,
                        [subscriptionId]: resp.body,
                    },
                    loadingClaims: {
                        ...prevState.loadingClaims,
                        [subscriptionId]: false,
                    },
                }));
            })
            .catch((errorMessage) => {
                console.error(errorMessage);
                Alert.error(
                    intl.formatMessage({
                        id: 'Apis.Details.Subscriptions.SubscriptionsTable.subscriber.info.error',
                        defaultMessage:
                            'Error while retrieving the subscriber information',
                    }),
                );
                this.setState((prevState) => ({
                    loadingClaims: {
                        ...prevState.loadingClaims,
                        [subscriptionId]: false,
                    },
                }));
            });
    }

    /**
     * Checks whether the policy is a usage based monetization plan
     *
     * @param {string} policyName - The name of the policy
     * @returns {boolean} True if the policy is a usage based monetization plan, false otherwise
     * @memberof SubscriptionsTable
     * */
    isMonetizedPolicy(policyName) {
        const { policies, monetizationStatus } = this.state;
        if (policies.length > 0) {
            const filteredPolicies = policies.filter(
                (policy) => policy.name === policyName && policy.monetizationAttributes.pricePerRequest != null,
            );
            return (filteredPolicies.length > 0 && monetizationStatus);
        } else {
            return false;
        }
    }

    /**
     * Filter subscriptions based on user search value
     *
     * @param event onChange event of user search
     */
    filterSubscriptions(event) {
        this.setState({ searchQuery: event.target.value }, this.fetchSubscriptionData);
    }

    /**
     * Render claims based on the claim object
     */
    renderClaims(claimsObject, subscriptionId) {
        const { loadingClaims } = this.state;
        
        if (loadingClaims[subscriptionId]) {
            return (
                <Grid container direction='row' justifyContent='center' alignItems='center'>
                    <Grid item>
                        <CircularProgress size={20} />
                    </Grid>
                    <Grid item>
                        <Typography className={classes.typography}>
                            <FormattedMessage
                                id='Apis.Details.Subscriptions.Subscriber.loading.claims'
                                defaultMessage='Loading subscriber information...'
                            />
                        </Typography>
                    </Grid>
                </Grid>
            );
        }

        if (claimsObject) {
            return (
                <div className={classes.root}>
                    {claimsObject.claims && (
                        <Box m={0.5}>
                            {claimsObject.claims.map((claim) => (
                                <Box display='flex' gap={4}>
                                    <Box flexShrink={0}>
                                        <Typography variant='caption' noWrap>{claim.name}</Typography>
                                    </Box>
                                    <Box flexGrow={1} textAlign='right'>
                                        <Typography variant='caption' style={{ wordBreak: 'break-all' }}>
                                            {claim.value || 'Not Available'}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </div>
            );
        }
        return (
            <div>
                <Typography className={classes.typography}>
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Subscriber.no.claims'
                        defaultMessage='No subscriber claims data available'
                    />
                </Typography>
            </div>
        );
    }

    /**
     *
     */
    render() {
        const {
            subscriptions, rowsPerPage, emptyColumnHeight, subscriberClaims, loadingContactInfo,
        } = this.state;
        const {  api, intl } = this.props;
        if (!subscriptions) {
            return (
                <Grid container direction='row' justifyContent='center' alignItems='center'>
                    <Grid item>
                        <CircularProgress />
                    </Grid>
                </Grid>
            );
        }
        const columns = [
            {
                name: 'subscriptionId',
                options: {
                    display: 'excluded',
                    filter: false,
                },
            },
            {
                name: 'applicationInfo.applicationId',
                options: {
                    display: 'excluded',
                    filter: false,
                },
            },
            {
                name: 'subscriber',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Listing.column.header.subscriber'
                        defaultMessage='Subscriber'
                    />
                ),
                options: {
                    sort: false,
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const subscriptionId = tableMeta.rowData[0];
                            const subscriberName = tableMeta.rowData[2];
                            let claimsObject;
                            if (subscriberClaims) {
                                claimsObject = subscriberClaims[subscriptionId];
                            }
                            return (
                                <Box display='flex'>
                                    <Box pr={1}>
                                        {subscriberName}
                                    </Box>
                                    <CustomTooltip
                                        interactive
                                        placement='top'
                                        onOpen={() => this.fetchSubscriberClaims(subscriptionId)}
                                        title={(
                                            (<Root>
                                                {this.renderClaims(claimsObject, subscriptionId)}
                                            </Root>)
                                        )}
                                    >
                                        <Grid container direction='row' alignItems='center' spacing={1}>
                                            <Grid item>
                                                <Typography>
                                                    <InfoIcon color='action' />
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CustomTooltip>
                                </Box>
                            );
                        }
                        return null;
                    },
                    filter: true,
                    display: true,
                    filterType: 'custom',
                    filterOptions: {
                        logic: (sub, filters) => {
                            if (filters.length) return !filters.includes(sub);
                            return false;
                        },
                        display: (filterList, onChange, index, column) => {
                            return (<Autocomplete
                                id={`autocomplete-filter-${column.name}`}
                                options={Array.from(new Set(subscriptions.map((sub) => sub.subscriber)))}
                                value={filterList[index][0] ? filterList[index][0] : null}
                                onChange={(event, newValue) => {
                                    const updatedFilterList = [...filterList];
                                    updatedFilterList[index] = newValue ? [newValue] : [];
                                    onChange(updatedFilterList[index], index, column);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        margin='dense'
                                        {...params}
                                        label={column.name}
                                    />
                                )}
                            />);
                        },
                    },
                },
            },
            {
                name: 'name',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Listing.column.header.application'
                        defaultMessage='Application'
                    />
                ),
                options: {
                    sort: false,
                    filter: true,
                    display: true,
                    filterType: 'custom',
                    filterOptions: {
                        logic: (app, filters) => {
                            if (filters.length) return !filters.includes(app);
                            return false;
                        },
                        display: (filterList, onChange, index, column) => {
                            return (<Autocomplete
                                id={`autocomplete-filter-${column.name}`}
                                options={Array.from(new Set(subscriptions.map((sub) => sub.name)))}
                                value={filterList[index][0] ? filterList[index][0] : null}
                                onChange={(event, newValue) => {
                                    const updatedFilterList = [...filterList];
                                    updatedFilterList[index] = newValue ? [newValue] : [];
                                    onChange(updatedFilterList[index], index, column);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        margin='dense'
                                        {...params}
                                        label='Application'
                                    />
                                )}
                            />);
                        },
                    },
                },
            },
            {
                name: 'applicationInfo.description',
                options: {
                    display: 'excluded',
                    filter: false,
                },
            },
            {
                name: 'applicationInfo.subscriptionCount',
                options: {
                    display: 'excluded',
                    filter: false,
                },
            },
            {
                name: 'throttlingPolicy',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Listing.column.header.throttling.tier'
                        defaultMessage='Tier'
                    />
                ),
                options: {
                    sort: false,
                    filter: true,
                    display: true,
                    filterType: 'custom',
                    filterOptions: {
                        logic: (tier, filters) => {
                            if (filters.length) return !filters.includes(tier);
                            return false;
                        },
                        display: (filterList, onChange, index, column) => {
                            return (<Autocomplete
                                id={`autocomplete-filter-${column.name}`}
                                options={Array.from(new Set(subscriptions.map((sub) => sub.throttlingPolicy)))}
                                value={filterList[index][0] ? filterList[index][0] : null}
                                onChange={(event, newValue) => {
                                    const updatedFilterList = [...filterList];
                                    updatedFilterList[index] = newValue ? [newValue] : [];
                                    onChange(updatedFilterList[index], index, column);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        margin='dense'
                                        {...params}
                                        label='Tier'
                                    />
                                )}
                            />);
                        },
                    },
                },
            },
            {
                name: 'subscriptionStatus',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Listing.column.header.subscription.status'
                        defaultMessage='Status'
                    />
                ),
                options: {
                    sort: false,
                },
            },
            {
                name: 'actions',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Listing.column.header.subscription.actions'
                        defaultMessage='Actions'
                    />
                ),
                options: {
                    sort: false,
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const status = tableMeta.rowData[7];
                            const subscriptionId = tableMeta.rowData[0];
                            return (
                                <ScopeValidation
                                    resourceMethod={resourceMethod.POST}
                                    resourcePath={resourcePath.BLOCK_SUBSCRIPTION}
                                >
                                    {
                                        this.getSubscriptionBlockingButtons(
                                            status,
                                            subscriptionId,
                                        )
                                    }
                                </ScopeValidation>
                            );
                        }
                        return null;
                    },
                },
            },
            {
                name: 'invoice',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Listing.column.header.subscription.invoice'
                        defaultMessage='Invoice'
                    />
                ),
                options: {
                    sort: false,
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const throttlingPolicy = tableMeta.rowData[6];
                            const subscriptionId = tableMeta.rowData[0];
                            return (
                                <Invoice
                                    subscriptionId={subscriptionId}
                                    isNotAuthorized={this.isNotCreator && this.isNotPublisher}
                                    isMonetizedUsagePolicy={
                                        this.isMonetizedPolicy(throttlingPolicy)
                                    }
                                    api={api}
                                />
                            );
                        }
                        return null;
                    },
                },
            },
        ];

        const options = {
            title: false,
            print: false,
            download: false,
            viewColumns: false,
            elevation: 1,
            customToolbar: false,
            search: false,
            selectableRows: 'none',
            rowsPerPageOptions: [5, 10, 25, 50, 100],
            rowsPerPage,
            onChangeRowsPerPage: (numberOfRows) => {
                this.setState({ rowsPerPage: numberOfRows });
            },
            textLabels: {
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
        return (
            <Root>
                <div className={classes.heading}>
                    <Typography variant='h4'>
                        <FormattedMessage
                            id='Apis.Details.Subscriptions.SubscriptionsTable.manage.subscriptions'
                            defaultMessage='Manage Subscriptions'
                        />
                        {'   '}
                        {subscriptions.length > 0 && (
                            <Button
                                onClick={this.fetchAllSubscriberClaims}
                                size='small'
                                disabled={loadingContactInfo}
                                variant='outlined'
                            >
                                {loadingContactInfo ? (
                                    <>
                                        <CircularProgress size={16} style={{ marginRight: 8 }} />
                                        <FormattedMessage
                                            id='Apis.Details.Subscriptions.SubscriptionsTable.loading.contact.info'
                                            defaultMessage='Loading...'
                                        />
                                    </>
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Subscriptions.SubscriptionsTable.contact.subscribers'
                                        defaultMessage='Contact Subscribers'
                                    />
                                )}
                            </Button>
                        )}
                    </Typography>
                    <Typography variant='caption' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Subscriptions.SubscriptionsTable.sub.heading'
                            defaultMessage='Manage subscriptions of the {type}'
                            values={{
                                type: getTypeToDisplay(api.apiType)
                            }}
                        />
                    </Typography>
                </div>
                <Paper elevation={0}>
                    {subscriptions.length > 0 ? (
                        <div>
                            <MUIDataTable title='' data={subscriptions} columns={columns} options={options} />
                        </div>
                    )
                        : (
                            <div className={classes.noDataMessage} style={{ height: rowsPerPage * emptyColumnHeight }}>
                                <FormattedMessage
                                    id='Apis.Details.Subscriptions.SubscriptionsTable.no.subscriptions'
                                    defaultMessage='No subscriptions data available'
                                />
                            </div>
                        )}
                </Paper>
            </Root>
        );
    }
}

SubscriptionsTable.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,
};

export default injectIntl((SubscriptionsTable));
