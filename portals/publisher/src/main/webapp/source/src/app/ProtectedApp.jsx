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

import React, { Component, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ThemeProvider as CoreThemeProvider, createTheme } from '@material-ui/core/styles';
import { ThemeProvider as NormalThemeProvider } from '@material-ui/styles';
// import MaterialDesignCustomTheme from 'AppComponents/Shared/CustomTheme';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import Base from 'AppComponents/Base';
import AuthManager from 'AppData/AuthManager';
import userThemes from 'userCustomThemes';
import defaultTheme from 'AppData/defaultTheme';
import AppErrorBoundary from 'AppComponents/Shared/AppErrorBoundary/AppErrorBoundary';
import RedirectToLogin from 'AppComponents/Shared/RedirectToLogin';
import { IntlProvider } from 'react-intl';
import { AppContextProvider } from 'AppComponents/Shared/AppContext';
import ServiceCatalogRouting from 'AppComponents/ServiceCatalog/ServiceCatalogRouting';
import Progress from 'AppComponents/Shared/Progress';
import Configurations from 'Config';
import { QueryClientProviderX } from 'AppData/hooks/ReactQueryX';
import Scopes from 'AppComponents/Scopes/Scopes';
import CommonPolicies from 'AppComponents/CommonPolicies/CommonPolicies';
import GlobalPolicies from 'AppComponents/GlobalPolicies/GlobalPolicies';
import merge from 'lodash/merge';
import User from './data/User';
import Utils from './data/Utils';

const ThemeProvider = CoreThemeProvider || NormalThemeProvider;
const Apis = lazy(() => import('AppComponents/Apis/Apis' /* webpackChunkName: "DeferredAPIs" */));
const DeferredAPIs = () => (
    <Suspense fallback={<Progress per={30} message='Loading components ...' />}>
        <Apis />
    </Suspense>
);
/**
 * Language.
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

/**
 * Render protected application paths, Implements container presenter pattern
 */
export default class Protected extends Component {
    /**
     * Creates an instance of Protected.
     * @param {any} props @inheritDoc
     * @memberof Protected
     */
    constructor(props) {
        super(props);
        this.state = {
            theme: null,
            settings: null,
            clientId: Utils.getCookieWithoutEnvironment(User.CONST.PUBLISHER_CLIENT_ID),
            sessionState: Utils.getCookieWithoutEnvironment(User.CONST.PUBLISHER_SESSION_STATE),
        };
        this.environments = [];
        this.checkSession = this.checkSession.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
    }

    /**
     * @inheritDoc
     * @memberof Protected
     */
    componentDidMount() {
        const user = AuthManager.getUser();
        window.addEventListener('message', this.handleMessage);
        if (user) {
            this.setState({ user });
            this.checkSession();
            if (user.name && user.name.indexOf('@') !== -1) {
                const tenant = user.name.split('@')[user.name.split('@').length - 1];
                this.setTenantTheme(tenant);
            } else {
                this.setState({ theme: userThemes.light });
            }
        } else {
            // If no user data available , Get the user info from existing token information
            // This could happen when OAuth code authentication took place and could send
            // user information via redirection
            const userPromise = AuthManager.getUserFromToken();
            userPromise.then((loggedUser) => {
                if (loggedUser.name && loggedUser.name.indexOf('@') !== -1) {
                    const tenant = loggedUser.name.split('@')[loggedUser.name.split('@').length - 1];
                    this.setTenantTheme(tenant);
                } else {
                    this.setState({ theme: userThemes.light });
                }
                this.setState({ user: loggedUser });
            });
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
     * Load Theme file.
     *
     * @param {string} tenant tenant name
     */
    setTenantTheme(tenant) {
        if (tenant && tenant !== '' && tenant !== 'carbon.super') {
            fetch(`${Configurations.app.context}/site/public/tenant_themes/${tenant}/apim-publisher/defaultTheme.json`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data && data.light) {
                        this.setState({ theme: data.light });
                    } else {
                        console.warn('Error loading teant theme. Loading the default theme.');
                        this.setState({ theme: userThemes.light });
                    }
                })
                .catch(() => {
                    console.warn('Error loading teant theme. Loading the default theme.');
                    this.setState({ theme: userThemes.light });
                });
        } else {
            this.setState({ theme: userThemes.light });
        }
    }

    /**
     *
     * @param {any} settings Publisher settings object
     */
    updateSettings(settings) {
        this.setState({ settings });
    }

    /**
     * Invoke check session OIDC endpoint.
     */
    checkSession() {
        if (Configurations.app.singleLogout && Configurations.app.singleLogout.enabled) {
            setInterval(() => {
                // Check session will only trigger if user is available
                const { clientId, sessionState } = this.state;
                const msg = clientId + ' ' + sessionState;
                if (document.getElementById('iframeOP')) {
                    document.getElementById('iframeOP').contentWindow.postMessage(msg, Configurations.idp.origin);
                } else {
                    console.warn("Can't post message to iframe, Unable to find `iframeOP` iframe element");
                }
            }, Configurations.app.singleLogout.timeout);
        }
    }

    /**
     * @returns {React.Component} @inheritDoc
     * @memberof Protected
     */
    render() {
        const { user = AuthManager.getUser(), messages } = this.state;
        const { theme, settings } = this.state;
        if (!user) {
            return (
                <IntlProvider locale={language} messages={messages}>
                    <RedirectToLogin />
                </IntlProvider>
            );
        }
        if (!theme) {
            return (<Progress />);
        }
        return (
            <ThemeProvider theme={createTheme(defaultTheme)}>
                <ThemeProvider theme={(currentTheme) => createTheme(
                    merge(currentTheme, (typeof theme === 'function' ? theme(currentTheme) : theme)),
                )}
                >
                    <AppErrorBoundary>
                        <QueryClientProviderX>
                            <Base user={user}>
                                <AppContextProvider value={{
                                    user,
                                    settings,
                                    updateSettings: this.updateSettings,
                                }}
                                >
                                    <Switch>
                                        <Redirect exact from='/' to='/apis' />
                                        <Route path='/apis' component={DeferredAPIs} />
                                        <Route path='/api-products' component={DeferredAPIs} />
                                        <Route path='/scopes' component={Scopes} />
                                        <Route path='/policies' component={CommonPolicies} />
                                        <Route path='/global-policies' component={GlobalPolicies} />
                                        <Route path='/service-catalog' component={ServiceCatalogRouting} />
                                        <Route component={ResourceNotFound} />
                                    </Switch>
                                </AppContextProvider>
                            </Base>
                        </QueryClientProviderX>
                    </AppErrorBoundary>
                </ThemeProvider>
            </ThemeProvider>
        );
    }
}

Protected.propTypes = {
    user: PropTypes.shape({}).isRequired,
};
