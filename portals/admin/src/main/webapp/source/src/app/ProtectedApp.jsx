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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { IntlProvider, injectIntl } from 'react-intl';
import {
    createTheme,
    adaptV4Theme,
    ThemeProvider,
    StyledEngineProvider,
} from '@mui/material/styles';
import Hidden from '@mui/material/Hidden';
import Configurations from 'Config';
import Themes from 'Themes';
import ResourceNotFound from './components/Base/Errors/ResourceNotFound';
import User from './data/User';
import Utils from './data/Utils';
import Base from './components/Base';
import AuthManager from './data/AuthManager';
import Header from './components/Base/Header';
import Avatar from './components/Base/Header/Avatar';
import AppErrorBoundary from './components/Shared/AppErrorBoundary';
import RedirectToLogin from './components/Shared/RedirectToLogin';
import { AppContextProvider } from './components/Shared/AppContext';
import Navigator from './components/Base/Navigator';
import RouteMenuMapping from './components/Base/RouteMenuMapping';
import Api from './data/api';
import Progress from './components/Shared/Progress';
import Dashboard from './components/AdminPages/Dashboard/Dashboard';
import Alert from './components/Shared/Alert';

const theme = createTheme(adaptV4Theme(Themes.light));
const { drawerWidth } = Themes.light.custom;
/**
 * Language.
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
const allRoutes = [];

/**
 * Render protected application paths, Implements container presenter pattern
 */
class Protected extends Component {
    /**
     * Creates an instance of Protected.
     * @param {any} props @inheritDoc
     * @memberof Protected
     */
    constructor(props) {
        super(props);
        this.state = {
            settings: null,
            clientId: Utils.getCookieWithoutEnvironment(User.CONST.ADMIN_CLIENT_ID),
            sessionStateCookie: Utils.getCookieWithoutEnvironment(User.CONST.ADMIN_SESSION_STATE),
            mobileOpen: false,
            isSuperTenant: false,
        };
        this.environments = [];
        this.checkSession = this.checkSession.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        const { intl } = props;
        const routeMenuMapping = RouteMenuMapping(intl);
        for (let i = 0; i < routeMenuMapping.length; i++) {
            const childRoutes = routeMenuMapping[i].children;
            if (childRoutes) {
                for (let j = 0; j < childRoutes.length; j++) {
                    allRoutes.push(childRoutes[j]);
                }
            } else {
                allRoutes.push(routeMenuMapping[i]);
            }
        }
    }

    /**
     * @inheritDoc
     * @memberof Protected
     */
    componentDidMount() {
        const user = AuthManager.getUser();
        const api = new Api();
        const settingPromise = api.getSettings();
        window.addEventListener('message', this.handleMessage);
        if (user) {
            this.setState({ user });
            settingPromise.then((settingsNew) => this.setState({ settings: settingsNew }));
            api.getTenantInformation(btoa(user.name))
                .then((result) => {
                    const { tenantDomain } = result.body;
                    if (tenantDomain === 'carbon.super') {
                        this.setState({ isSuperTenant: true });
                    } else {
                        this.setState({ isSuperTenant: false });
                    }
                })
                .catch((error) => {
                    Alert.error(error.response.body.description);
                    console.log(error);
                });
            this.checkSession();
        } else {
            // If no user data available , Get the user info from existing token information
            // This could happen when OAuth code authentication took place and could send
            // user information via redirection
            const userPromise = AuthManager.getUserFromToken();
            userPromise.then((loggedUser) => this.setState({ user: loggedUser }));
            settingPromise.then((settingsNew) => this.setState({ settings: settingsNew }));
        }
    }

    /**
     * Handle iframe message
     * @param {event} e Event
     */
    handleMessage(e) {
        if (e.data === 'changed') {
            window.location = Configurations.app.context + '/services/auth/login?not-Login';
        }
    }

    /**
     * Invoke checksession oidc endpoint.
     */
    checkSession() {
        if (Configurations.app.singleLogout && Configurations.app.singleLogout.enabled) {
            setInterval(() => {
                const { clientId, sessionStateCookie } = this.state;
                const msg = clientId + ' ' + sessionStateCookie;
                document.getElementById('iframeOP').contentWindow.postMessage(msg, Configurations.idp.origin);
            }, Configurations.app.singleLogout.timeout);
        }
    }

    /**
     * @returns {React.Component} @inheritDoc
     * @memberof Protected
     */
    render() {
        const { user = AuthManager.getUser(), messages, mobileOpen } = this.state;
        const header = (
            <Header
                avatar={<Avatar user={user} />}
                user={user}
                handleDrawerToggle={() => {
                    this.setState((oldState) => ({ mobileOpen: !oldState.mobileOpen }));
                }}
            />
        );
        const { clientId, settings, isSuperTenant } = this.state;
        const checkSessionURL = Configurations.idp.checkSessionEndpoint + '?client_id='
            + clientId + '&redirect_uri=https://' + window.location.host
            + Configurations.app.context + '/services/auth/callback/login';
        if (!user) {
            return (
                <IntlProvider locale={language} messages={messages}>
                    <RedirectToLogin />
                </IntlProvider>
            );
        }
        const leftMenu = (
            settings && (
                <AppContextProvider value={{ settings, user, isSuperTenant }}>
                    <>
                        <Hidden smUp implementation='js'>
                            <Navigator
                                PaperProps={{ style: { width: drawerWidth } }}
                                variant='temporary'
                                open={mobileOpen}
                                onClose={() => {
                                    this.setState((oldState) => ({ mobileOpen: !oldState.mobileOpen }));
                                }}
                            />
                        </Hidden>
                        <Hidden smDown implementation='css'>
                            <Navigator PaperProps={{ style: { width: drawerWidth } }} />
                        </Hidden>
                    </>
                </AppContextProvider>
            )
        );
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <AppErrorBoundary>
                        {settings ? (
                            <AppContextProvider value={{ settings, user, isSuperTenant }}>
                                <Base header={header} leftMenu={leftMenu}>
                                    <Route>
                                        <Switch>
                                            <Redirect exact from='/' to='/dashboard' />
                                            <Route
                                                path='/dashboard'
                                                component={Dashboard}
                                            />
                                            {allRoutes.map((r) => {
                                                return <Route path={r.path} component={r.component} key={r.path} />;
                                            })}
                                            <Route component={ResourceNotFound} />
                                        </Switch>
                                    </Route>
                                </Base>
                            </AppContextProvider>
                        ) : (
                            <Progress message='Loading Settings ...' />
                        )}
                        <iframe
                            title='iframeOP'
                            id='iframeOP'
                            src={checkSessionURL}
                            width='0%'
                            height='0%'
                            style={{ position: 'absolute', bottom: 0 }}
                        />
                    </AppErrorBoundary>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

Protected.propTypes = {
    user: PropTypes.shape({}).isRequired,
};

export default injectIntl(Protected);
