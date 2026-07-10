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
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
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
import CONSTANTS from 'AppData/Constants';
import Subscription from 'AppData/Subscription';
import Api from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { app } from 'Settings';
import { useAreApisAccessible, useAreMcpServersAccessible } from 'AppUtils/PortalModeUtils';
import SubscriptionSection from './SubscriptionSection';

const PREFIX = 'Subscriptions';
const SUBSCRIPTIONS_PER_PAGE = 10;
// Backend page size used while walking the subscriptions list in the background. Bigger than
// SUBSCRIPTIONS_PER_PAGE to reduce round-trips, far smaller than a bulk "fetch everything" call.
const FETCH_CHUNK_SIZE = 25;

/**
 * Parse a swagger-client response body, handling both string and pre-parsed payloads.
 * @param {*} response swagger-client response
 * @returns {*} parsed response data
 */
function parseResponseData(response) {
    if (response && response.data) {
        return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    }
    if (response && response.body) {
        return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    }
    return null;
}

/**
 * A subscription is "pseudo" when it was auto-created under the default subscriptionless plan.
 * @param {*} subscription subscription object
 * @returns {boolean} true if the subscription is a pseudo subscription
 */
function isPseudoSubscription(subscription) {
    const throttlingPolicies = subscription.apiInfo && subscription.apiInfo.throttlingPolicies;
    return Boolean(throttlingPolicies
        && throttlingPolicies.length === 1
        && throttlingPolicies[0].includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN));
}

function isApiSubscription(subscription) {
    return Boolean(subscription.apiInfo) && subscription.apiInfo.type !== 'MCP';
}

function isMcpSubscription(subscription) {
    return Boolean(subscription.apiInfo) && subscription.apiInfo.type === 'MCP';
}

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
        // Ensure consistent table styling across all subscription sections
        tableLayout: 'fixed',
        width: '100%',
        '& th, & td': {
            borderRight: `1px solid ${theme.palette.divider}`,
            '&:last-child': {
                borderRight: 'none',
            },
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
 * @class SubscriptionsBase
 * @extends {React.Component}
 */
class SubscriptionsBase extends React.Component {
    /**
     *Creates an instance of Subscriptions.
     * @param {*} props properties
     * @memberof Subscriptions
     */
    constructor(props) {
        super(props);
        this.state = {
            subscriptionsLoaded: false,
            apiSubscriptions: [],
            mcpSubscriptions: [],
            apiCount: -1,
            mcpCount: -1,
            apiPage: 0,
            mcpPage: 0,
            apisNotFound: false,
            subscriptionsNotFound: false,
            isAuthorize: true,
            openDialog: false,
            openMcpDialog: false,
            searchText: '',
            pseudoSubscriptions: false,
            pseudoMcpSubscriptions: false,
            dialogSubscriptions: null,
            dialogMcpSubscriptions: null,
        };
        this.checkSubValidationDisabled = this.checkSubValidationDisabled.bind(this);
        this.checkMcpSubValidationDisabled = this.checkMcpSubValidationDisabled.bind(this);
        this.checkTypeValidationDisabled = this.checkTypeValidationDisabled.bind(this);
        this.handleSubscriptionDelete = this.handleSubscriptionDelete.bind(this);
        this.handleSubscriptionUpdate = this.handleSubscriptionUpdate.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleOpenMcpDialog = this.handleOpenMcpDialog.bind(this);
        this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
        this.handleSearchTextTmpChange = this.handleSearchTextTmpChange.bind(this);
        this.handleClearSearch = this.handleClearSearch.bind(this);
        this.handleEnterPress = this.handleEnterPress.bind(this);
        this.handleApiPageChange = this.handleApiPageChange.bind(this);
        this.handleMcpPageChange = this.handleMcpPageChange.bind(this);
        this.updateDialogSubscriptions = this.updateDialogSubscriptions.bind(this);
        this.getAPIById = this.getAPIById.bind(this);
        this.getMCPServerById = this.getMCPServerById.bind(this);
        this.getSubscriptionPolicyByName = this.getSubscriptionPolicyByName.bind(this);
        this.resetAPIDetailsCache = this.resetAPIDetailsCache.bind(this);
        this.resetAccumulation = this.resetAccumulation.bind(this);
        this.ensureLoaded = this.ensureLoaded.bind(this);
        this.refreshDerivedState = this.refreshDerivedState.bind(this);
        this.refetchAfterMutation = this.refetchAfterMutation.bind(this);

        this.apiDetailsById = {};
        this.mcpDetailsById = {};
        this.subscriptionPoliciesByName = {};
        this.searchTextTmp = '';
        this.mounted = false;
        this.subscriptionsRequestId = 0;
        this.dialogLoadRequestId = 0;
        this.mcpDialogLoadRequestId = 0;

        this.resetAccumulation();
    }

    /**
     *
     *
     * @memberof Subscriptions
     */
    componentDidMount() {
        this.mounted = true;
        this.ensureLoaded(SUBSCRIPTIONS_PER_PAGE, SUBSCRIPTIONS_PER_PAGE)
            .then(() => this.refreshDerivedState());
    }

    componentWillUnmount() {
        this.mounted = false;
        this.subscriptionsRequestId += 1;
        this.dialogLoadRequestId += 1;
        this.mcpDialogLoadRequestId += 1;
    }

    handleOpenDialog() {
        this.searchTextTmp = '';
        this.setState((prevState) => ({
            openDialog: !prevState.openDialog,
            searchText: '',
            dialogSubscriptions: null,
        }), () => {
            if (this.state.openDialog) {
                this.updateDialogSubscriptions(false);
            }
        });
    }

    handleOpenMcpDialog() {
        this.searchTextTmp = '';
        this.setState((prevState) => ({
            openMcpDialog: !prevState.openMcpDialog,
            searchText: '',
            dialogMcpSubscriptions: null,
        }), () => {
            if (this.state.openMcpDialog) {
                this.updateDialogSubscriptions(true);
            }
        });
    }

    /**
     * Cache API/MCP Server and subscription-policy detail fetches so re-rendering a page
     * of subscriptions doesn't refetch data for entities already looked up this session.
     */
    resetAPIDetailsCache() {
        this.apiDetailsById = {};
        this.mcpDetailsById = {};
        this.subscriptionPoliciesByName = {};
    }

    getAPIById(apiUUID) {
        if (!this.apiDetailsById[apiUUID]) {
            const apiClient = new Api();
            this.apiDetailsById[apiUUID] = apiClient.getAPIById(apiUUID).then(parseResponseData);
        }
        return this.apiDetailsById[apiUUID];
    }

    getMCPServerById(apiUUID) {
        if (!this.mcpDetailsById[apiUUID]) {
            const mcpClient = new MCPServer();
            this.mcpDetailsById[apiUUID] = mcpClient.getMCPServerById(apiUUID).then(parseResponseData);
        }
        return this.mcpDetailsById[apiUUID];
    }

    getSubscriptionPolicyByName(policyName) {
        if (!this.subscriptionPoliciesByName[policyName]) {
            const apiClient = new Api();
            this.subscriptionPoliciesByName[policyName] = apiClient
                .getTierByName(policyName, 'subscription')
                .then(parseResponseData);
        }
        return this.subscriptionPoliciesByName[policyName];
    }

    /**
     * Reset the background subscription accumulator. Called on mount and after any mutation
     * (delete/update/subscribe), since those can shift backend offsets in ways that are not
     * safe to patch incrementally.
     */
    resetAccumulation() {
        this.combinedSubscriptions = [];
        this.backendOffset = 0;
        this.combinedTotal = null;
        this.fullyLoaded = false;
        this.loadChain = null;
        this.resetAPIDetailsCache();
    }

    /**
     * Walk the subscriptions list in the background (small chunks, not a bulk fetch) until
     * at least `requiredApiCount` API-type and `requiredMcpCount` MCP-type subscriptions have
     * been accumulated, or the full list has been exhausted. Pass Infinity for either count to
     * force a complete walk (needed for the "all pseudo" check and the subscribe dialogs, which
     * both need the definitive full per-type list).
     * @param {number} requiredApiCount minimum accumulated API-type subscriptions needed
     * @param {number} requiredMcpCount minimum accumulated MCP-type subscriptions needed
     * @returns {Promise<void>}
     */
    ensureLoaded(requiredApiCount, requiredMcpCount) {
        const { applicationId } = this.props.application;
        const requestId = this.subscriptionsRequestId;

        const step = () => {
            if (!this.mounted || requestId !== this.subscriptionsRequestId) {
                return Promise.resolve();
            }
            const apiSoFar = this.combinedSubscriptions.filter(isApiSubscription).length;
            const mcpSoFar = this.combinedSubscriptions.filter(isMcpSubscription).length;
            if (this.fullyLoaded || (apiSoFar >= requiredApiCount && mcpSoFar >= requiredMcpCount)) {
                return Promise.resolve();
            }
            const client = new Subscription();
            return client.getSubscriptions(null, applicationId, FETCH_CHUNK_SIZE, this.backendOffset)
                .then((response) => {
                    if (!this.mounted || requestId !== this.subscriptionsRequestId) {
                        return undefined;
                    }
                    const { body } = response;
                    const pagination = body.pagination || {};
                    const list = body.list || [];
                    this.combinedSubscriptions = this.combinedSubscriptions.concat(list);
                    this.combinedTotal = pagination.total ?? this.combinedTotal ?? this.combinedSubscriptions.length;
                    this.backendOffset = (pagination.offset ?? this.backendOffset) + (pagination.limit ?? list.length);
                    if (list.length === 0 || this.combinedSubscriptions.length >= this.combinedTotal) {
                        this.fullyLoaded = true;
                    }
                    return step();
                })
                .catch((error) => {
                    if (!this.mounted || requestId !== this.subscriptionsRequestId) {
                        return;
                    }
                    this.fullyLoaded = true;
                    const { status } = error;
                    if (status === 404) {
                        this.setState({ subscriptionsNotFound: true, subscriptionsLoaded: true });
                    } else if (status === 401) {
                        this.setState({ isAuthorize: false });
                    }
                });
        };

        this.loadChain = (this.loadChain || Promise.resolve()).then(step);
        return this.loadChain;
    }

    /**
     * Recompute the visible page slices, per-type counts and pseudo-subscription flags from the
     * background accumulator, then re-render. Called after every ensureLoaded resolution.
     */
    refreshDerivedState() {
        if (!this.mounted) {
            return;
        }
        const apiAccum = this.combinedSubscriptions.filter(isApiSubscription);
        const mcpAccum = this.combinedSubscriptions.filter(isMcpSubscription);

        this.setState((prevState) => {
            let { apiPage, mcpPage } = prevState;
            if (this.fullyLoaded) {
                const maxApiPage = Math.max(0, Math.ceil(apiAccum.length / SUBSCRIPTIONS_PER_PAGE) - 1);
                const maxMcpPage = Math.max(0, Math.ceil(mcpAccum.length / SUBSCRIPTIONS_PER_PAGE) - 1);
                apiPage = Math.min(apiPage, maxApiPage);
                mcpPage = Math.min(mcpPage, maxMcpPage);
            }
            const apiStart = apiPage * SUBSCRIPTIONS_PER_PAGE;
            const mcpStart = mcpPage * SUBSCRIPTIONS_PER_PAGE;
            return {
                apiPage,
                mcpPage,
                apiSubscriptions: apiAccum.slice(apiStart, apiStart + SUBSCRIPTIONS_PER_PAGE),
                mcpSubscriptions: mcpAccum.slice(mcpStart, mcpStart + SUBSCRIPTIONS_PER_PAGE),
                apiCount: this.fullyLoaded ? apiAccum.length : -1,
                mcpCount: this.fullyLoaded ? mcpAccum.length : -1,
                subscriptionsLoaded: true,
            };
        }, () => {
            this.checkSubValidationDisabled();
            this.checkMcpSubValidationDisabled();
        });
    }

    /**
     * Shared implementation backing checkSubValidationDisabled / checkMcpSubValidationDisabled.
     * Accumulated-so-far data may not represent every subscription of a type, so when what has
     * been seen looks fully pseudo but the walk isn't complete, force a full walk to confirm.
     * @param {Function} filterFn predicate selecting subscriptions of one type
     * @param {string} stateKey state field to update
     */
    checkTypeValidationDisabled(filterFn, stateKey) {
        const typeAccum = this.combinedSubscriptions.filter(filterFn);
        if (typeAccum.length === 0 || !typeAccum.every(isPseudoSubscription)) {
            this.setState({ [stateKey]: false });
            return;
        }
        if (this.fullyLoaded) {
            this.setState({ [stateKey]: true });
            return;
        }
        const requestId = this.subscriptionsRequestId;
        this.ensureLoaded(Infinity, Infinity).then(() => {
            if (!this.mounted || requestId !== this.subscriptionsRequestId) {
                return;
            }
            this.refreshDerivedState();
        });
    }

    checkSubValidationDisabled() {
        this.checkTypeValidationDisabled(isApiSubscription, 'pseudoSubscriptions');
    }

    checkMcpSubValidationDisabled() {
        this.checkTypeValidationDisabled(isMcpSubscription, 'pseudoMcpSubscriptions');
    }

    /**
     * Update the full, unpaginated list backing a subscribe dialog (API or MCP).
     * @param {boolean} isMcp whether this is refreshing the MCP Server dialog
     * @returns {Promise<void>}
     * @memberof Subscriptions
     */
    updateDialogSubscriptions(isMcp) {
        const requestId = isMcp ? ++this.mcpDialogLoadRequestId : ++this.dialogLoadRequestId;
        return this.ensureLoaded(Infinity, Infinity).then(() => {
            const currentRequestId = isMcp ? this.mcpDialogLoadRequestId : this.dialogLoadRequestId;
            const dialogOpen = isMcp ? this.state.openMcpDialog : this.state.openDialog;
            if (!this.mounted || requestId !== currentRequestId || !dialogOpen) {
                return;
            }
            const filtered = this.combinedSubscriptions.filter(isMcp ? isMcpSubscription : isApiSubscription);
            this.setState(isMcp ? { dialogMcpSubscriptions: filtered } : { dialogSubscriptions: filtered });
            this.refreshDerivedState();
        });
    }

    /**
     * Re-walk the subscriptions list from scratch after a mutation (delete/update/subscribe),
     * refilling only up to whichever pages are currently visible in each section.
     */
    refetchAfterMutation() {
        this.subscriptionsRequestId += 1;
        this.resetAccumulation();
        const { apiPage, mcpPage } = this.state;
        const requiredApi = (apiPage + 1) * SUBSCRIPTIONS_PER_PAGE;
        const requiredMcp = (mcpPage + 1) * SUBSCRIPTIONS_PER_PAGE;
        this.ensureLoaded(requiredApi, requiredMcp).then(() => this.refreshDerivedState());
    }

    /**
     * Handle a page change on the API subscriptions pagination control.
     * @param {*} event unused MUI event
     * @param {number} page requested page
     */
    handleApiPageChange(event, page) {
        const required = (page + 1) * SUBSCRIPTIONS_PER_PAGE;
        this.setState({ apiPage: page });
        this.ensureLoaded(required, 0).then(() => this.refreshDerivedState());
    }

    /**
     * Handle a page change on the MCP Server subscriptions pagination control.
     * @param {*} event unused MUI event
     * @param {number} page requested page
     */
    handleMcpPageChange(event, page) {
        const required = (page + 1) * SUBSCRIPTIONS_PER_PAGE;
        this.setState({ mcpPage: page });
        this.ensureLoaded(0, required).then(() => this.refreshDerivedState());
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
                if (response.status === 200) {
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Subscription deleted successfully!',
                        id: 'Applications.Details.Subscriptions.delete.success',
                    }));
                }
                if (response.status === 201) {
                    console.log(response);
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Subscription Deletion Request Created!',
                        id: 'Applications.Details.Subscriptions.request.created',
                    }));
                    this.refetchAfterMutation();
                    return;
                }
                if (response.status !== 200 && response.status !== 201) {
                    console.log(response);
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Something went wrong while deleting the Subscription!',
                        id: 'Applications.Details.Subscriptions.something.went.wrong',
                    }));
                    return;
                }
                this.refetchAfterMutation();
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
                this.refetchAfterMutation();
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
                    const { openDialog, openMcpDialog } = this.state;
                    this.refetchAfterMutation();
                    if (openDialog) {
                        this.updateDialogSubscriptions(false);
                    }
                    if (openMcpDialog) {
                        this.updateDialogSubscriptions(true);
                    }
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
        const {
            isAuthorize,
            openDialog,
            openMcpDialog,
            searchText,
            subscriptionsLoaded,
            apiSubscriptions,
            mcpSubscriptions,
            apiCount,
            mcpCount,
            apiPage,
            mcpPage,
            apisNotFound,
            subscriptionsNotFound,
            pseudoSubscriptions,
            pseudoMcpSubscriptions,
            dialogSubscriptions,
            dialogMcpSubscriptions,
        } = this.state;

        if (!isAuthorize) {
            window.location = app.context + '/services/configs';
        }

        const {
            application, intl, apisAccessible, mcpServersAccessible,
        } = this.props;
        const { applicationId } = application;

        if (subscriptionsLoaded) {
            return (
                <Root>
                    <Box className={classes.root}>
                        <Typography
                            variant='h4'
                            sx={{
                                textTransform: 'capitalize',
                                marginBottom: 3,
                            }}
                        >
                            <FormattedMessage
                                id='Applications.Details.Subscriptions.subscriptions'
                                defaultMessage='Subscriptions'
                            />
                        </Typography>

                        {apisAccessible && (
                            <SubscriptionSection
                                title={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.subscribed.apis'
                                        defaultMessage='Subscribed APIs'
                                    />
                                )}
                                buttonText={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.apis.add.subscription.button'
                                        defaultMessage='Subscribe'
                                    />
                                )}
                                subscriptions={apiSubscriptions}
                                subscriptionsNotFound={subscriptionsNotFound}
                                pseudoSubscriptions={pseudoSubscriptions}
                                onAddClick={this.handleOpenDialog}
                                handleSubscriptionDelete={this.handleSubscriptionDelete}
                                handleSubscriptionUpdate={this.handleSubscriptionUpdate}
                                getAPIById={this.getAPIById}
                                getMCPServerById={this.getMCPServerById}
                                getSubscriptionPolicyByName={this.getSubscriptionPolicyByName}
                                paginationCount={apiCount}
                                paginationPage={apiPage}
                                rowsPerPage={SUBSCRIPTIONS_PER_PAGE}
                                onPaginationPageChange={this.handleApiPageChange}
                                noSubscriptionsMessage={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.no.api.subscriptions'
                                        defaultMessage='No API Subscriptions Available'
                                    />
                                )}
                                noSubscriptionsContent={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.no.api.subscriptions.content'
                                        defaultMessage='No API subscriptions are available for this Application'
                                    />
                                )}
                                entityNameColumn={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.api.name'
                                        defaultMessage='API'
                                    />
                                )}
                                data-testid='api-subscriptions-section'
                            />
                        )}

                        {mcpServersAccessible && (
                            <SubscriptionSection
                                title={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.subscribed.mcp.servers'
                                        defaultMessage='Subscribed MCP Servers'
                                    />
                                )}
                                buttonText={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.mcp.servers.add.subscription.button'
                                        defaultMessage='Subscribe'
                                    />
                                )}
                                subscriptions={mcpSubscriptions}
                                subscriptionsNotFound={subscriptionsNotFound}
                                pseudoSubscriptions={pseudoMcpSubscriptions}
                                onAddClick={this.handleOpenMcpDialog}
                                handleSubscriptionDelete={this.handleSubscriptionDelete}
                                handleSubscriptionUpdate={this.handleSubscriptionUpdate}
                                getAPIById={this.getAPIById}
                                getMCPServerById={this.getMCPServerById}
                                getSubscriptionPolicyByName={this.getSubscriptionPolicyByName}
                                paginationCount={mcpCount}
                                paginationPage={mcpPage}
                                rowsPerPage={SUBSCRIPTIONS_PER_PAGE}
                                onPaginationPageChange={this.handleMcpPageChange}
                                noSubscriptionsMessage={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.no.mcp.subscriptions'
                                        defaultMessage='No MCP Server Subscriptions Available'
                                    />
                                )}
                                noSubscriptionsContent={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.no.mcp.subscriptions.content'
                                        defaultMessage='No MCP server subscriptions are available for this Application'
                                    />
                                )}
                                entityNameColumn={(
                                    <FormattedMessage
                                        id='Applications.Details.Subscriptions.mcp.server.name'
                                        defaultMessage='MCP Server'
                                    />
                                )}
                                data-testid='mcp-subscriptions-section'
                            />
                        )}

                        {apisAccessible && (
                            <StyledDialog
                                onClose={this.handleOpenDialog}
                                aria-labelledby='simple-dialog-title'
                                open={openDialog}
                                maxWidth='false'
                                className={classes.subscribePop}
                            >
                                <Box className={classes.dialogHeader}>
                                    <MuiDialogTitle className={classes.dialogTitle} disableTypography>
                                        <Typography variant='h6'>
                                            <FormattedMessage
                                                id='Applications.Details.Subscriptions.subscription.subscribe.apis'
                                                defaultMessage='Subscribe to API(s)'
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
                                    {dialogSubscriptions ? (
                                        <APIList
                                            apisNotFound={apisNotFound}
                                            subscriptions={dialogSubscriptions}
                                            applicationId={applicationId}
                                            handleSubscribe={(appInner, api, policy) => this.handleSubscribe(appInner, api, policy)}
                                            searchText={searchText}
                                            entityType='API'
                                        />
                                    ) : (
                                        <Progress />
                                    )}
                                </Box>
                            </StyledDialog>
                        )}

                        {mcpServersAccessible && (
                            <StyledDialog
                                onClose={this.handleOpenMcpDialog}
                                aria-labelledby='mcp-dialog-title'
                                open={openMcpDialog}
                                maxWidth='false'
                                className={classes.subscribePop}
                            >
                                <Box className={classes.dialogHeader}>
                                    <MuiDialogTitle className={classes.dialogTitle} disableTypography>
                                        <Typography variant='h6'>
                                            <FormattedMessage
                                                id='Applications.Details.Subscriptions.subscription.subscribe.mcp.servers'
                                                defaultMessage='Subscribe to MCP Server(s)'
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
                                                    defaultMessage: 'Search MCP Servers',
                                                    id: 'Applications.Details.Subscriptions.search.mcp',
                                                })}
                                                inputProps={{
                                                    'aria-label': intl.formatMessage({
                                                        defaultMessage: 'Search MCP Servers',
                                                        id: 'Applications.Details.Subscriptions.search.mcp',
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
                                                            id='Applications.Details.Subscriptions.filter.mcp.msg'
                                                            defaultMessage='Filtered MCP Servers for'
                                                        />
                                                        {` ${searchText}`}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant='caption'>
                                                    <FormattedMessage
                                                        id='Applications.Details.Subscriptions.filter.msg.all.mcp'
                                                        defaultMessage='Displaying all MCP Servers'
                                                    />
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <IconButton
                                        aria-label='close'
                                        className={classes.closeButton}
                                        onClick={this.handleOpenMcpDialog}
                                        size='large'
                                    >
                                        <Icon>cancel</Icon>
                                    </IconButton>
                                </Box>
                                <Box padding={2}>
                                    {dialogMcpSubscriptions ? (
                                        <APIList
                                            apisNotFound={apisNotFound}
                                            subscriptions={dialogMcpSubscriptions}
                                            applicationId={applicationId}
                                            handleSubscribe={(appInner, api, policy) => this.handleSubscribe(appInner, api, policy)}
                                            searchText={searchText}
                                            entityType='MCP'
                                        />
                                    ) : (
                                        <Progress />
                                    )}
                                </Box>
                            </StyledDialog>
                        )}
                    </Box>
                </Root>
            );
        } else {
            return <Progress />;
        }
    }
}

SubscriptionsBase.propTypes = {
    application: PropTypes.shape({
        applicationId: PropTypes.string.isRequired,
    }).isRequired,
    getApplication: PropTypes.func.isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    apisAccessible: PropTypes.bool.isRequired,
    mcpServersAccessible: PropTypes.bool.isRequired,
};

/**
 * Wrapper component that provides portal mode accessibility to SubscriptionsBase
 * @param {Object} props - Component props
 * @returns {React.ReactElement} SubscriptionsBase with portal mode props
 */
const Subscriptions = (props) => {
    const apisAccessible = useAreApisAccessible();
    const mcpServersAccessible = useAreMcpServersAccessible();

    return (
        <SubscriptionsBase
            {...props}
            apisAccessible={apisAccessible}
            mcpServersAccessible={mcpServersAccessible}
        />
    );
};

Subscriptions.propTypes = {
    application: PropTypes.shape({
        applicationId: PropTypes.string.isRequired,
    }).isRequired,
    getApplication: PropTypes.func.isRequired,
};

export default injectIntl(Subscriptions);
