/* eslint-disable react/prop-types */
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
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
    Route, Switch, Redirect, Link,
} from 'react-router-dom';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ScreenLockLandscapeIcon from '@mui/icons-material/ScreenLockLandscape';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import API from 'AppData/api';
import { app } from 'Settings';
import Loading from 'AppComponents/Base/Loading/Loading';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import LeftMenuItem from 'AppComponents/Shared/LeftMenuItem';
import TokenManager from 'AppComponents/Shared/AppsAndKeys/TokenManager';
import ApiKeyManager from 'AppComponents/Shared/AppsAndKeys/ApiKeyManager';
import classNames from 'classnames';
import Paper from '@mui/material/Paper';
import Subscriptions from './Subscriptions';
import InfoBar from './InfoBar';
import Overview from './Overview';
import WebHookDetails from './WebHookDetails';

const PREFIX = 'index';

const classes = {
    LeftMenu: `${PREFIX}-LeftMenu`,
    leftMenuHorizontal: `${PREFIX}-leftMenuHorizontal`,
    leftMenuVerticalLeft: `${PREFIX}-leftMenuVerticalLeft`,
    leftMenuVerticalRight: `${PREFIX}-leftMenuVerticalRight`,
    leftLInkMain: `${PREFIX}-leftLInkMain`,
    leftLInkMainText: `${PREFIX}-leftLInkMainText`,
    detailsContent: `${PREFIX}-detailsContent`,
    content: `${PREFIX}-content`,
    contentLoader: `${PREFIX}-contentLoader`,
    contentLoaderRightMenu: `${PREFIX}-contentLoaderRightMenu`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    keyTitle: `${PREFIX}-keyTitle`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    width: '100%',
    [`& .${classes.LeftMenu}`]: {
        backgroundColor: theme.custom.leftMenu.background,
        backgroundImage: `url(${app.context}${theme.custom.leftMenu.backgroundImage})`,
        textAlign: 'left',
        fontFamily: theme.typography.fontFamily,
        position: 'absolute',
        bottom: 0,
        paddingLeft: (theme.custom.leftMenu.position === 'horizontal' ? theme.spacing(3) : 0),
    },

    [`& .${classes.leftMenuHorizontal}`]: {
        top: theme.custom.infoBar.height,
        width: '100%',
        overflowX: 'auto',
        height: 60,
        display: 'flex',
        left: 0,
    },

    [`& .${classes.leftMenuVerticalLeft}`]: {
        width: theme.custom.leftMenu.width,
        top: 0,
        left: 0,
        overflowY: 'auto',
        [theme.breakpoints.down('md')]: {
            width: 50,
        },
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
        textDecoration: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        height: theme.custom.infoBar.height,
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
        flexDirection: 'column',
        marginLeft: (theme.custom.leftMenu.position === 'vertical-left' ? (theme.custom.leftMenu.width - 4) : 0),
        marginRight: (theme.custom.leftMenu.position === 'vertical-right' ? theme.custom.leftMenu.width : 0),
        paddingBottom: theme.spacing(3),
        overflowX: 'hidden',
        [theme.breakpoints.down('md')]: {
            marginLeft: (theme.custom.leftMenu.position === 'vertical-left' ? (theme.custom.leftMenu.width - 4) : 0) !== 0 && 50,
            marginRight: (theme.custom.leftMenu.position === 'vertical-right' ? theme.custom.leftMenu.width : 0) !== 0 && 50,
        },
    },

    [`& .${classes.contentLoader}`]: {
        paddingTop: theme.spacing(3),
    },

    [`& .${classes.contentLoaderRightMenu}`]: {
        paddingRight: theme.custom.leftMenu.width,
    },

    [`& .${classes.titleWrapper}`]: {
        paddingLeft: 25,
        paddingTop: 28,
        textTransform: 'capitalize',
    },

    [`& .${classes.contentWrapper}`]: {
        paddingLeft: 25,
    },

    [`& .${classes.keyTitle}`]: {
        textTransform: 'capitalize',
    },
}));

/**
 *
 *
 * @class Details
 * @extends {Component}
 */
class Details extends Component {
    /**
     *
     * @param {Object} props props passed from above
     */
    constructor(props) {
        super(props);
        this.state = {
            application: null,
        };
        this.getApplication = this.getApplication.bind(this);
    }

    /**
     *
     *
     * @memberof Details
     */
    componentDidMount() {
        this.getApplication();
    }

    getApplication = () => {
        const client = new API();
        const applicationId = this.props.match.params.application_uuid;
        const promisedApplication = client.getApplication(applicationId);
        promisedApplication
            .then((response) => {
                this.setState({ application: response.obj });
                return Promise.all([response]);
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

    /**
     *
     * @param {String} menuLink selected menu name
     * @memberof Details
     */
    handleMenuSelect = (menuLink) => {
        const { history, match } = this.props;
        history.push({ pathname: '/applications/' + match.params.application_uuid + '/' + menuLink });
    };

    toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            },
        );
    };

    renderManager = (application, keyType, secScheme) => {
        return (
            <Paper>
                {secScheme === 'oauth' && (
                    <TokenManager
                        keyType={keyType}
                        selectedApp={{
                            appId: application.applicationId,
                            label: application.name,
                            tokenType: application.tokenType,
                            owner: application.owner,
                            hashEnabled: application.hashEnabled,
                        }}
                    />

                )}
                {secScheme === 'apikey' && (
                    <div className={classes.root}>
                        <div className={classes.titleWrapper}>
                            <Typography variant='h5' className={classes.keyTitle}>
                                {this.toTitleCase(keyType)}
                                <FormattedMessage
                                    id='Applications.Details.api.keys.title'
                                    defaultMessage=' API Key'
                                />
                            </Typography>
                        </div>
                        <div className={classes.contentWrapper}>
                            <ApiKeyManager
                                keyType={keyType}
                                selectedApp={{
                                    appId: application.applicationId,
                                    label: application.name,
                                    tokenType: application.tokenType,
                                    owner: application.owner,
                                }}
                            />
                        </div>
                    </div>
                )}
            </Paper>
        );
    }

    /**
     *
     *
     * @returns {Component}
     * @memberof Details
     */
    render() {
        const {
            match, intl,
        } = this.props;
        const { notFound, application } = this.state;
        const pathPrefix = '/applications/' + match.params.application_uuid;
        const redirectUrl = pathPrefix + '/overview';
        const rootIconSize = 42;
        const rootIconTextVisible = false;
        const rootIconVisible = false;
        const position = 'vertical-left';

        if (notFound) {
            return <ResourceNotFound />;
        } else if (!application) {
            return <Loading />;
        }
        return (
            <Root>
                <nav
                    role='navigation'
                    aria-label={intl.formatMessage({
                        id: 'Applications.Details.index.secondary.navigation',
                        defaultMessage: 'Secondary Navigation',
                    })}
                    className={classNames(
                        classes.LeftMenu,
                        {
                            [classes.leftMenuHorizontal]: position === 'horizontal',
                        },
                        {
                            [classes.leftMenuVerticalLeft]: position === 'vertical-left',
                        },
                        {
                            [classes.leftMenuVerticalRight]: position === 'vertical-right',
                        },
                        'left-menu',
                    )}
                >
                    {rootIconVisible && (
                        <Link to='/applications' className={classes.leftLInkMain} aria-label='All applications'>
                            <CustomIcon width={rootIconSize} height={rootIconSize} icon='applications' />
                            {rootIconTextVisible && (
                                <Typography className={classes.leftLInkMainText}>
                                    <FormattedMessage
                                        id='Applications.Details.applications.all'
                                        defaultMessage='ALL APPs'
                                    />
                                </Typography>
                            )}
                        </Link>
                    )}
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.overview'
                                defaultMessage='Overview'
                            />
                        )}
                        iconText='overview'
                        route='overview'
                        to={pathPrefix + '/overview'}
                        open
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.prod.keys'
                                defaultMessage='Production Keys'
                            />
                        )}
                        iconText='productionkeys'
                        route='productionkeys'
                        to={pathPrefix + '/productionkeys/oauth'}
                        open
                        id='production-keys'
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.oauth.tokens'
                                defaultMessage='OAuth2 Tokens'
                            />
                        )}
                        route='productionkeys/oauth'
                        to={pathPrefix + '/productionkeys/oauth'}
                        submenu
                        Icon={<ScreenLockLandscapeIcon />}
                        open
                        id='production-keys-oauth'
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.api.key'
                                defaultMessage='API Key'
                            />
                        )}
                        route='productionkeys/apikey'
                        to={pathPrefix + '/productionkeys/apikey'}
                        submenu
                        Icon={<VpnKeyIcon />}
                        open
                        id='production-keys-apikey'
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.sandbox.keys'
                                defaultMessage='Sandbox Keys'
                            />
                        )}
                        iconText='productionkeys'
                        route='sandboxkeys'
                        to={pathPrefix + '/sandboxkeys/oauth'}
                        open
                        id='sandbox-keys'
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.oauth.tokens'
                                defaultMessage='OAuth2 Tokens'
                            />
                        )}
                        route='sandboxkeys/oauth'
                        to={pathPrefix + '/sandboxkeys/oauth'}
                        submenu
                        Icon={<ScreenLockLandscapeIcon />}
                        open
                        id='sandbox-keys-oauth'
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.api.key'
                                defaultMessage='API Key'
                            />
                        )}
                        route='sandboxkeys/apikey'
                        to={pathPrefix + '/sandboxkeys/apikey'}
                        submenu
                        Icon={<VpnKeyIcon />}
                        open
                        id='sandbox-keys-apikey'
                    />
                    <LeftMenuItem
                        text={(
                            <FormattedMessage
                                id='Applications.Details.menu.subscriptions'
                                defaultMessage='Subscriptions'
                            />
                        )}
                        iconText='subscriptions'
                        route='subscriptions'
                        to={pathPrefix + '/subscriptions'}
                        open
                        id='left-menu-subscriptions'
                    />
                </nav>
                <Box sx={(theme) => ({
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    marginLeft: (theme.custom.leftMenu.position === 'vertical-left' ? (theme.custom.leftMenu.width - 158) : 0),
                    paddingBottom: theme.spacing(3),
                    overflowX: 'hidden',
                    [theme.breakpoints.down('md')]: {
                        marginLeft: (theme.custom.leftMenu.position === 'vertical-left'
                            ? (theme.custom.leftMenu.width - 4) : 0) !== 0 && 50,
                    },
                })}
                >
                    <InfoBar
                        application={application}
                        applicationId={match.params.application_uuid}
                        innerRef={(node) => { this.infoBar = node; }}
                    />
                    <div
                        className={classNames(
                            { [classes.contentLoader]: position === 'horizontal' },
                            { [classes.contentLoaderRightMenu]: position === 'vertical-right' },
                        )}
                    >
                        <Switch>
                            <Redirect exact from='/applications/:applicationId' to={redirectUrl} />
                            <Route
                                path='/applications/:applicationId/overview'
                                component={Overview}
                            />
                            <Route
                                path='/applications/:applicationId/webhooks/:apiId'
                                component={WebHookDetails}
                            />
                            <Route
                                path='/applications/:applicationId/productionkeys/oauth'
                                component={() => (this.renderManager(application, 'PRODUCTION', 'oauth'))}
                            />
                            <Route
                                path='/applications/:applicationId/productionkeys/apikey'
                                component={() => (this.renderManager(application, 'PRODUCTION', 'apikey'))}
                            />
                            <Route
                                path='/applications/:applicationId/sandboxkeys/oauth'
                                component={() => (this.renderManager(application, 'SANDBOX', 'oauth'))}
                            />
                            <Route
                                path='/applications/:applicationId/sandboxkeys/apikey'
                                component={() => (this.renderManager(application, 'SANDBOX', 'apikey'))}
                            />
                            <Route
                                path='/applications/:applicationId/subscriptions'
                                render={() => (
                                    <Subscriptions application={application} getApplication={this.getApplication} />
                                )}
                            />
                            <Route component={ResourceNotFound} />
                        </Switch>
                    </div>
                </Box>
            </Root>
        );
    }
}

Details.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            application_uuid: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default (injectIntl(Details));
