/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-props-no-spreading */
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

import React, { lazy, Suspense } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    Route, Switch, Redirect, Link, withRouter,
} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Api from 'AppData/api';
import AuthManager from 'AppData/AuthManager';
import withSettings from 'AppComponents/Shared/withSettingsContext';
import SolaceTopicsInfo from 'AppComponents/Apis/Details/SolaceApi/SolaceTopicsInfo';
import Alert from 'AppComponents/Shared/Alert';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { app } from 'Settings';
import CONSTANTS from 'AppData/Constants';
import { useTheme } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CustomIcon from '../../Shared/CustomIcon';
import LeftMenuItem from '../../Shared/LeftMenuItem';
import { ResourceNotFound } from '../../Base/Errors/index';
import Breadcrumb from './Breadcrumb';
import { ApiContext } from './ApiContext';
import Progress from '../../Shared/Progress';
import Wizard from './Credentials/Wizard/Wizard';
import User from '../../../data/User';

const ApiConsole = lazy(() => import('./ApiConsole/ApiConsole' /* webpackChunkName: "APIConsole" */));
const GraphQLConsole = lazy(() => import('./GraphQLConsole/GraphQLConsole' /* webpackChunkName: "GraphQLConsole" */));
const AsyncApiConsole = lazy(() => import('./AsyncApiConsole/AsyncApiConsole'));
const Overview = lazy(() => import('./Overview' /* webpackChunkName: "APIOverview" */));
const Documents = lazy(() => import('./Documents/Documents' /* webpackChunkName: "APIDocuments" */));
const Credentials = lazy(() => import('./Credentials/Credentials' /* webpackChunkName: "APICredentials" */));
const Comments = lazy(() => import('./Comments/Comments' /* webpackChunkName: "APIComments" */));
const Sdk = lazy(() => import('./Sdk' /* webpackChunkName: "APISdk" */));
const AsyncApiDefinition = lazy(() => import('./Definitions/AsyncApi/AsyncApiDefinitionUI'));
const ApiChat = lazy(() => import('./ApiChat/ApiChat' /* webpackChunkName: "ApiChat" */));

const LoadableSwitch = withRouter((props) => {
    const {
        match,
        api,
        setbreadcrumbDocument,
        apiChatEnabled,
    } = props;
    const { apiUuid } = match.params;
    const path = '/apis/';
    const redirectURL = path + apiUuid + '/overview';

    let tryoutRoute;
    if (api.type === CONSTANTS.API_TYPES.GRAPHQL) {
        tryoutRoute = <Route path='/apis/:apiUuid/api-console' component={GraphQLConsole} />;
    } else if (api.type === CONSTANTS.API_TYPES.WS || api.type === CONSTANTS.API_TYPES.WEBSUB
        || api.type === CONSTANTS.API_TYPES.SSE || api.type === CONSTANTS.API_TYPES.ASYNC) {
        tryoutRoute = <Route path='/apis/:apiUuid/api-console' component={AsyncApiConsole} />;
    } else {
        tryoutRoute = <Route path='/apis/:apiUuid/api-console' component={ApiConsole} />;
    }

    return (
        <Suspense fallback={<Progress />}>
            <Switch>
                <Redirect exact from='/apis/:apiUuid' to={redirectURL} />
                <Route path='/apis/:apiUuid/overview' render={() => <Overview {...props} />} />
                <Route
                    path='/apis/:apiUuid/documents'
                    render={() => <Documents {...props} setbreadcrumbDocument={setbreadcrumbDocument} />}
                />
                <Route path='/apis/:apiUuid/definition' component={AsyncApiDefinition} />
                <Route path='/apis/:apiUuid/solaceTopicsInfo' component={SolaceTopicsInfo} />
                <Route exact path='/apis/:apiUuid/credentials/wizard' component={Wizard} />
                <Route path='/apis/:apiUuid/comments' component={Comments} />
                <Route path='/apis/:apiUuid/credentials' component={Credentials} />
                {tryoutRoute}
                {apiChatEnabled && (
                    <Route path='/apis/:apiUuid/api-chat' component={ApiChat} />
                )}
                <Route path='/apis/:apiUuid/sdk' component={Sdk} />
                <Route component={ResourceNotFound} />
            </Switch>
        </Suspense>
    );
});

const PREFIX = 'index';

const classes = {
    leftMenu: `${PREFIX}-leftMenu`,
    leftMenuHorizontal: `${PREFIX}-leftMenuHorizontal`,
    leftMenuVerticalLeft: `${PREFIX}-leftMenuVerticalLeft`,
    leftMenuVerticalLeftMinView: `${PREFIX}-leftMenuVerticalLeftMinView`,
    leftMenuVerticalRight: `${PREFIX}-leftMenuVerticalRight`,
    leftLInkMain: `${PREFIX}-leftLInkMain`,
    leftLInkMainText: `${PREFIX}-leftLInkMainText`,
    detailsContent: `${PREFIX}-detailsContent`,
    content: `${PREFIX}-content`,
    contentExpandView: `${PREFIX}-contentExpandView`,
    shiftLeft: `${PREFIX}-shiftLeft`,
    contentLoader: `${PREFIX}-contentLoader`,
    contentLoaderRightMenu: `${PREFIX}-contentLoaderRightMenu`,
    expandIconColor: `${PREFIX}-expandIconColor`,
};

const Root = styled('div')((
    {
        theme,
    },
) => {
    const {
        custom: {
            leftMenu: { width, position },
        },
    } = theme;
    const shiftToLeft = position === 'vertical-left' ? width : 0;
    const shiftToRight = position === 'vertical-right' ? width : 0;
    const shiftToLeftMinView = position === 'vertical-left' ? 45 : 0;
    const shiftToRightMinView = position === 'vertical-right' ? 45 : 0;
    const leftMenuPaddingLeft = position === 'horizontal' ? theme.spacing(3) : 0;

    return {
        width: '100%',
        [`& .${classes.leftMenu}`]: {
            backgroundColor: theme.custom.leftMenu.background,
            backgroundImage: `url(${app.context}${theme.custom.leftMenu.backgroundImage})`,
            textAlign: 'left',
            fontFamily: theme.typography.fontFamily,
            position: 'absolute',
            bottom: 0,
            paddingLeft: leftMenuPaddingLeft,
        },
        [`& .${classes.leftMenuHorizontal}`]: {
            top: theme.custom.infoBar.height,
            overflowX: 'auto',
            height: 60,
            display: 'flex',
            left: 0,
        },
        [`& .${classes.leftMenuVerticalLeft}`]: {
            width: theme.custom.leftMenu.width,
            [theme.breakpoints.down('md')]: {
                width: 50,
            },
            top: 0,
            left: 0,
            overflowY: 'auto',
        },
        [`& .${classes.leftMenuVerticalLeftMinView}`]: {
            width: 45,
            top: 0,
            left: 0,
            overflowY: 'auto',
        },
        [`& .${classes.leftMenuVerticalRight}`]: {
            width: theme.custom.leftMenu.width,
            top: 0,
            right: 0,
            overflowY: 'auto',
        },
        [`& .${classes.leftLInkMain}`]: {
            borderRight: 'solid 1px ' + theme.custom.leftMenu.background,
            cursor: 'pointer',
            background: theme.custom.leftMenu.rootBackground,
            color: theme.palette.getContrastText(theme.custom.leftMenu.rootBackground),
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            height: theme.custom.infoBar.height,
            textDecoration: 'none',
        },
        [`& .${classes.leftLInkMainText}`]: {
            fontSize: 18,
            color: theme.palette.grey[500],
            textDecoration: 'none',
            paddingLeft: theme.spacing(2),
        },
        [`& .${classes.detailsContent}`]: {
            display: 'flex',
            flex: 1,
        },
        [`& .${classes.content}`]: {
            display: 'flex',
            flex: 1,
            flexGrow: 1,
            flexDirection: 'column',
            marginLeft: shiftToLeft,
            marginRight: shiftToRight,
            [theme.breakpoints.down('md')]: {
                marginLeft: shiftToLeft !== 0 && 50,
                marginRight: shiftToRight !== 0 && 50,
            },
            paddingBottom: theme.spacing(3),
            overflowX: 'hidden',
        },
        [`& .${classes.contentExpandView}`]: {
            display: 'flex',
            flex: 1,
            flexGrow: 1,
            flexDirection: 'column',
            marginLeft: shiftToLeftMinView,
            marginRight: shiftToRightMinView,
            paddingBottom: theme.spacing(3),
            overflowX: 'hidden',
            minHeight: 'calc(100vh - 114px)',
        },
        [`& .${classes.shiftLeft}`]: {
            marginLeft: 0,
        },
        [`& .${classes.contentLoader}`]: {
            paddingTop: theme.spacing(3),
        },
        [`& .${classes.contentLoaderRightMenu}`]: {
            paddingRight: theme.custom.leftMenu.width,
        },
        [`& .${classes.expandIconColor}`]: {
            color: '#ffffff',
        },
    };
});

/**
 *
 *
 * @class DetailsLegacy
 * @extends {React.Component}
 */
class DetailsLegacy extends React.Component {
    /**
     *Creates an instance of DetailsLegacy.
     * @param {*} props
     * @memberof DetailsLegacy
     */
    constructor(props) {
        super(props);
        /**
         *
         *
         * @memberof DetailsLegacy
         */
        this.updateSubscriptionData = (callback) => {
            let existingSubscriptions = null;
            let promisedApplications = null;

            const restApi = new Api();

            // const subscriptionClient = new Subscription();
            const promisedAPI = restApi.getAPIById(this.api_uuid);

            promisedAPI
                .then((api) => {
                    this.setState({ api: api.body });
                })
                .catch((error) => {
                    const { status, response } = error;
                    const { setTenantDomain, intl } = this.props;

                    const message = intl.formatMessage({
                        defaultMessage: 'Invalid tenant domain',
                        id: 'Apis.Details.index.invalid.tenant.domain',
                    });
                    if (response && response.body.code === 901300) {
                        setTenantDomain('INVALID');
                        Alert.error(message);
                    }
                    console.error('Error when getting apis', error);
                    if (status === 404 || status === 403) {
                        this.setState({ notFound: true });
                    }
                });
            const user = AuthManager.getUser();
            if (user === null) {
                const user1 = new User();
                this.setState({ open: user1.isSideBarOpen });
            }
            if (user != null) {
                this.setState({ open: user.isSideBarOpen });
                existingSubscriptions = restApi.getSubscriptions(this.api_uuid, null);
                const subscriptionLimit = app.subscribeApplicationLimit || 5000;
                existingSubscriptions = restApi.getSubscriptions(this.api_uuid, null, subscriptionLimit);
                promisedApplications = restApi.getAllApplications(null, subscriptionLimit);

                Promise.all([existingSubscriptions, promisedApplications])
                    .then((response) => {
                        const [subscriptions, applications] = response.map((data) => data.obj);

                        // get the application IDs of existing subscriptions
                        const subscribedApplications = subscriptions.list.map((element) => {
                            return {
                                value: element.applicationId,
                                policy: element.throttlingPolicy,
                                status: element.status,
                                subscriptionId: element.subscriptionId,
                                label: element.applicationInfo.name,
                            };
                        });

                        // Removing subscribed applications from all the applications and get
                        // the available applications to subscribe
                        const subscribedAppIds = subscribedApplications.map((sub) => sub.value);
                        const applicationsAvailable = applications.list
                            .filter((appInner) => !subscribedAppIds.includes(appInner.applicationId) && appInner.status === 'APPROVED')
                            .map((filteredApp) => {
                                return {
                                    value: filteredApp.applicationId,
                                    label: filteredApp.name,
                                };
                            });
                        this.setState({ subscribedApplications, applicationsAvailable }, () => {
                            if (callback) {
                                callback();
                            }
                        });
                    })
                    .catch((error) => {
                        if (process.env.NODE_ENV !== 'production') {
                            console.log(error);
                        }
                        const { status } = error;
                        if (status === 404) {
                            this.setState({ notFound: true });
                        }
                    });
            }
        };

        this.state = {
            active: 'overview',
            overviewHiden: false,
            updateSubscriptionData: this.updateSubscriptionData,
            api: null,
            applications: null,
            subscribedApplications: [],
            applicationsAvailable: [],
            item: 1,
            xo: null,
            breadcrumbDocument: '',
            tryOutExpanded: true,
            apiChatEnabled: false,
        };
        this.setDetailsAPI = this.setDetailsAPI.bind(this);
        this.api_uuid = this.props.match.params.apiUuid;
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.setbreadcrumbDocument = this.setbreadcrumbDocument.bind(this);
    }

    /**
     * @memberof DetailsLegacy
     */
    componentDidMount() {
        this.updateSubscriptionData();
        const api = new Api();
        const promisedSettings = api.getSettings();
        promisedSettings
            .then((response) => {
                this.setState({ apiChatEnabled: response.body.apiChatEnabled });
            }).catch((error) => {
                console.error(
                    'Error while receiving settings : ',
                    error,
                );
            });
    }

    /**
     * handle component did update
     * @param {JSON} prevProps previous props
     */
    componentDidUpdate(prevProps) {
        const { match: { params: { apiUuid: prevApiUuid } } } = prevProps;
        const { match: { params: { apiUuid: newApiUuid } } } = this.props;
        if (prevApiUuid !== newApiUuid) {
            this.api_uuid = newApiUuid;
            this.updateSubscriptionData();
        }
    }

    /**
     * @param {string} breadcrumbDocument
     * @memberof DetailsLegacy
     */
    setbreadcrumbDocument(breadcrumbDocument) {
        this.setState({ breadcrumbDocument });
    }

    /**
     * @param {JSON} api api object
     * @memberof DetailsLegacy
     */
    setDetailsAPI(api) {
        this.setState({ api });
    }

    /**
     * @memberof DetailsLegacy
     */
    handleDrawerClose() {
        this.setState({ open: false });
        const user = AuthManager.getUser();
        if (user != null) {
            user.isSideBarOpen = false;
            AuthManager.setUser(user);
        }
    }

    /**
     * handle left side drawer open
     */
    handleDrawerOpen() {
        this.setState({ open: true });
        const user = AuthManager.getUser();
        if (user !== null) {
            user.isSideBarOpen = true;
            AuthManager.setUser(user);
        }
    }

    /**
     * handle lef side drawer open
     * @param {JSON} api api object
     * @returns {boolean} is the api async api
     */
    isAsyncAPI(api) {
        return (api
            && (api.type === CONSTANTS.API_TYPES.WS
                || api.type === CONSTANTS.API_TYPES.WEBSUB
                || api.type === CONSTANTS.API_TYPES.SSE
                || api.type === CONSTANTS.API_TYPES.ASYNC));
    }

    /**
     * @returns {JSX} rendered outpu
     * @memberof DetailsLegacy
     */
    render() {
        const {
            theme, intl,
        } = this.props;
        const user = AuthManager.getUser();
        const {
            api, notFound, open, breadcrumbDocument, tryOutExpanded, apiChatEnabled,
        } = this.state;
        const {
            custom: {
                leftMenu: {
                    rootIconSize, rootIconTextVisible, rootIconVisible, position,
                },
                apiDetailPages: {
                    showCredentials, showComments, showTryout, showDocuments, showSdks, showAsyncSpecification, showSolaceTopics,
                },
                title: {
                    prefix, sufix,
                },
            },
        } = theme;
        const globalStyle = 'body{ font-family: ' + theme.typography.fontFamily + '}';
        const pathPrefix = '/apis/' + this.api_uuid + '/';
        if (!api && notFound) {
            return <ResourceNotFound />;
        }
        // check for widget=true in the query params. If it's present we render without <Base> component.
        const pageUrl = new URL(window.location);
        const isWidget = pageUrl.searchParams.get('widget');
        const isAsyncApi = this.isAsyncAPI(api);

        return api ? (
            <Root>
                <ApiContext.Provider value={this.state}>
                    <Helmet>
                        <title>{`${prefix} ${api.name}${sufix}`}</title>
                    </Helmet>
                    <style>{globalStyle}</style>
                    {!isWidget && (
                        <nav
                            role='navigation'
                            aria-label={intl.formatMessage({
                                id: 'Apis.Details.index.secondary.navigation',
                                defaultMessage: 'Secondary Navigation',
                            })}
                            className={classNames(
                                classes.leftMenu,
                                {
                                    [classes.leftMenuHorizontal]: position === 'horizontal',
                                },
                                {
                                    [classes.leftMenuVerticalLeft]: position === 'vertical-left' && open,
                                    [classes.leftMenuVerticalLeftMinView]: position === 'vertical-left' && !open,

                                },
                                {
                                    [classes.leftMenuVerticalRight]: position === 'vertical-right',
                                },
                                'left-menu',
                            )}
                        >
                            {rootIconVisible && (
                                <Link to='/apis' className={classes.leftLInkMain} aria-label='ALL APIs'>
                                    <CustomIcon width={rootIconSize} height={rootIconSize} icon='api' />
                                    {rootIconTextVisible && (
                                        <Typography className={classes.leftLInkMainText}>
                                            <FormattedMessage id='Apis.Details.index.all.apis' defaultMessage='ALL APIs' />
                                        </Typography>
                                    )}
                                </Link>
                            )}
                            <LeftMenuItem
                                text={<FormattedMessage id='Apis.Details.index.overview' defaultMessage='Overview' />}
                                route='overview'
                                iconText='overview'
                                to={pathPrefix + 'overview'}
                                open={open}
                                id='left-menu-overview'
                            />
                            {user && showCredentials && (
                                <>

                                    <LeftMenuItem
                                        text={(
                                            <FormattedMessage
                                                id='Apis.Details.index.subscriptions'
                                                defaultMessage='Subscriptions'
                                            />
                                        )}
                                        route='credentials'
                                        iconText='credentials'
                                        to={pathPrefix + 'credentials'}
                                        open={open}
                                        id='left-menu-credentials'
                                    />

                                </>
                            )}
                            {showTryout && (api.gatewayVendor === 'wso2'
                                || (api.type === 'APIPRODUCT' && !api.gatewayVendor)) && (
                                <>
                                    <Accordion
                                        id='left-menu-try-out'
                                        expanded={tryOutExpanded}
                                        elevation={0}
                                        style={{ backgroundColor: 'transparent', margin: 0 }}
                                        onChange={(_event, expanded) => this.setState({ tryOutExpanded: expanded })}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon className={classes.expandIconColor} />}
                                            style={{ padding: '0 12px 0 5px', maxHeight: 43, minHeight: 43 }}
                                        >
                                            <LeftMenuItem
                                                text={(
                                                    <FormattedMessage
                                                        id='Apis.Details.index.try.out.'
                                                        defaultMessage='Try Out'
                                                    />
                                                )}
                                                iconText='test'
                                                open={open}
                                                id='left-menu-try-out'
                                            />
                                        </AccordionSummary>
                                        <AccordionDetails
                                            style={{ paddingTop: 0, paddingBottom: 0, margin: 0 }}
                                        >
                                            <div>
                                                <LeftMenuItem
                                                    text={(
                                                        <FormattedMessage
                                                            id='Apis.Details.index.try.out.api.console'
                                                            defaultMessage='API Console'
                                                        />
                                                    )}
                                                    route='api-console'
                                                    iconText='api-console'
                                                    to={pathPrefix + 'api-console'}
                                                    open={open}
                                                    id='left-menu-test'
                                                />
                                                {api.type !== CONSTANTS.API_TYPES.GRAPHQL && !isAsyncApi && apiChatEnabled && (
                                                    <LeftMenuItem
                                                        text={(
                                                            <FormattedMessage
                                                                id='Apis.Details.index.try.out.api.chat'
                                                                defaultMessage='API Chat'
                                                            />
                                                        )}
                                                        route='api-chat'
                                                        Icon={<QuestionAnswerIcon style={{ fontSize: 'large', padding: 8 }} />}
                                                        to={pathPrefix + 'api-chat'}
                                                        open={open}
                                                        id='left-menu-api-chat'
                                                    />
                                                )}
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </>
                            )}
                            {(showSolaceTopics && api.gatewayVendor === 'solace') && (
                                <LeftMenuItem
                                    text={(
                                        <FormattedMessage
                                            id='Apis.Details.index.solaceTopicsInfo'
                                            defaultMessage='Solace Info'
                                        />
                                    )}
                                    route='solaceTopicsInfo'
                                    iconText='test'
                                    to={pathPrefix + 'solaceTopicsInfo'}
                                    open={open}
                                    id='left-menu-solace-info'
                                />
                            )}
                            {isAsyncApi && showAsyncSpecification && (
                                <LeftMenuItem
                                    text={(
                                        <FormattedMessage
                                            id='Apis.Details.index.definition'
                                            defaultMessage='Definition'
                                        />
                                    )}
                                    route='definition'
                                    iconText='Definition'
                                    to={pathPrefix + 'definition'}
                                    open={open}
                                    id='left-menu-definition'
                                />
                            )}
                            {showComments && (

                                <LeftMenuItem
                                    text={(
                                        <FormattedMessage
                                            id='Apis.Details.index.comments'
                                            defaultMessage='Comments'
                                        />
                                    )}
                                    route='comments'
                                    iconText='comments'
                                    to={pathPrefix + 'comments'}
                                    open={open}
                                    id='left-menu-comments'
                                />
                            )}
                            {showDocuments && (

                                <LeftMenuItem
                                    text={(
                                        <FormattedMessage
                                            id='Apis.Details.index.documentation'
                                            defaultMessage='Documents'
                                        />
                                    )}
                                    route='documents'
                                    iconText='docs'
                                    to={pathPrefix + 'documents'}
                                    open={open}
                                    id='left-menu-documents'
                                />

                            )}
                            {!isAsyncApi && showSdks && (

                                <LeftMenuItem
                                    text={<FormattedMessage id='Apis.Details.index.sdk' defaultMessage='SDKs' />}
                                    route='sdk'
                                    iconText='sdk'
                                    to={pathPrefix + 'sdk'}
                                    open={open}
                                    id='left-menu-sdk'
                                />

                            )}
                            {open ? (
                                <div
                                    onClick={this.handleDrawerClose}
                                    onKeyDown={this.handleDrawerClose}
                                    style={{
                                        width: 100, paddingLeft: '15px', position: 'absolute', bottom: 0, cursor: 'pointer',
                                    }}
                                >
                                    <ArrowBackIosIcon fontSize='medium' style={{ color: 'white' }} />
                                </div>
                            ) : (
                                <div
                                    onClick={this.handleDrawerOpen}
                                    onKeyDown={this.handleDrawerOpen}
                                    style={{
                                        paddingLeft: '15px', position: 'absolute', bottom: 0, cursor: 'pointer',
                                    }}
                                >
                                    <ArrowForwardIosIcon fontSize='medium' style={{ color: 'white' }} />
                                </div>

                            )}

                        </nav>
                    )}

                    <div
                        className={classNames(
                            { [classes.content]: open },
                            { [classes.contentExpandView]: !open },
                        )}
                    >
                        <Breadcrumb
                            breadcrumbDocument={breadcrumbDocument}
                        />
                        <div
                            className={classNames(
                                { [classes.contentLoader]: position === 'horizontal' },
                                { [classes.contentLoaderRightMenu]: position === 'vertical-right' },
                            )}
                        >
                            <LoadableSwitch
                                api={api}
                                updateSubscriptionData={this.updateSubscriptionData}
                                setbreadcrumbDocument={this.setbreadcrumbDocument}
                                apiChatEnabled={apiChatEnabled}
                            />
                        </div>
                    </div>
                </ApiContext.Provider>
            </Root>
        ) : (
            <div className='apim-dual-ring' />
        );
    }
}

DetailsLegacy.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    match: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

function Details(props) {
    const theme = useTheme();
    return (
        <DetailsLegacy
            {...props}
            theme={theme}
        />
    );
}

export default withSettings(injectIntl((Details)));
