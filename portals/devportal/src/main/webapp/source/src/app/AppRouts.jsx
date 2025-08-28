/* eslint-disable react/jsx-props-no-spreading */
/**
 * Copyright (c) 2016, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {
    lazy, Suspense,
} from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import ApplicationFormHandler from 'AppComponents/Applications/ApplicationFormHandler';
import { PageNotFound, ScopeNotFound } from 'AppComponents/Base/Errors';
import RedirectToLogin from 'AppComponents/Login/RedirectToLogin';
import Progress from 'AppComponents/Shared/Progress';
import PortalModeRouteGuard from 'AppComponents/Shared/PortalModeRouteGuard';
import { useTheme } from '@mui/material';
import { usePortalMode, PORTAL_MODES } from './utils/PortalModeUtils';

const Apis = lazy(() => import('AppComponents/Apis/Apis' /* webpackChunkName: "Apis" */));
const MCPServers = lazy(() => import('AppComponents/MCPServers/MCPServers' /* webpackChunkName: "MCPServers" */));
const Landing = lazy(() => import('AppComponents/LandingPage/Landing' /* webpackChunkName: "Landing" */));
const TagCloudListing = lazy(() => import('AppComponents/Apis/Listing/TagCloudListing' /* webpackChunkName: "TagCloudListing" */));
const ChangePassword = lazy(() => import('AppComponents/Settings/ChangePassword/ChangePassword'));
const Listing = lazy(() => import('AppComponents/Applications/Listing/Listing' /* webpackChunkName: "ApiListing" */));
const Details = lazy(() => import('AppComponents/Applications/Details/index' /* webpackChunkName: "ApplicationDetails" */));

/**
 * Handle redirection
 * @param {Object} theme configuration
 * @param {string} portalMode current portal mode
 * @returns {string} redirect path
 */
function getRedirectingPath(theme, portalMode = PORTAL_MODES.HYBRID) {
    if (theme.custom.landingPage.active) {
        return '/home';
    } if (
        theme.custom.landingPage.active === false
        && theme.custom.tagWise.active
        && theme.custom.tagWise.style === 'page'
    ) {
        return '/api-groups';
    }
    // Default redirection based on portal mode
    if (portalMode === PORTAL_MODES.MCP_ONLY) {
        return '/mcp-servers';
    }
    return '/apis';
}

/**
 * Handle routes
 * @param {Object} props properties
 * @returns {React.ReactElement} routes component
 */
function AppRouts(props) {
    const { isAuthenticated, isUserFound } = props;
    const theme = useTheme();
    const portalMode = usePortalMode();

    return (
        <Suspense fallback={<Progress />}>
            <Switch>
                <Redirect exact from='/' to={getRedirectingPath(theme, portalMode)} />
                <Route path='/home' component={Landing} />
                <Route path='/api-groups' component={TagCloudListing} />
                <Route
                    path='/(apis|api-products)'
                    render={(routeProps) => (
                        <PortalModeRouteGuard>
                            <Apis {...routeProps} />
                        </PortalModeRouteGuard>
                    )}
                />
                <Route
                    path='/mcp-servers'
                    render={(routeProps) => (
                        <PortalModeRouteGuard>
                            <MCPServers {...routeProps} />
                        </PortalModeRouteGuard>
                    )}
                />
                <Route
                    path='/settings/change-password/'
                    render={(localProps) => {
                        if (isAuthenticated) {
                            return <ChangePassword {...localProps} />;
                        } else {
                            return <RedirectToLogin {...localProps} />;
                        }
                    }}
                />
                <Route
                    path='/applications'
                    exact
                    render={(localProps) => {
                        if (isAuthenticated) {
                            return <Listing {...localProps} />;
                        } else if (isUserFound) {
                            return <ScopeNotFound {...localProps} />;
                        } else {
                            return <RedirectToLogin {...localProps} />;
                        }
                    }}
                />
                <Route
                    path='/applications/create'
                    render={(localProps) => {
                        if (isAuthenticated) {
                            return <ApplicationFormHandler {...localProps} />;
                        } else if (isUserFound) {
                            return <ScopeNotFound {...localProps} />;
                        } else {
                            return <RedirectToLogin {...localProps} />;
                        }
                    }}
                />
                <Route
                    path='/applications/:application_id/edit'
                    render={(localProps) => {
                        if (isAuthenticated) {
                            return <ApplicationFormHandler {...localProps} />;
                        } else if (isUserFound) {
                            return <ScopeNotFound {...localProps} />;
                        } else {
                            return <RedirectToLogin {...localProps} />;
                        }
                    }}
                />
                <Route
                    path='/applications/:application_uuid/'
                    render={(localProps) => {
                        if (isAuthenticated) {
                            return <Details {...localProps} />;
                        } else if (isUserFound) {
                            return <ScopeNotFound {...localProps} />;
                        } else {
                            return <RedirectToLogin {...localProps} />;
                        }
                    }}
                />
                <Route
                    path='/applications/:application_uuid/webhooks/'
                    render={(localProps) => {
                        if (isAuthenticated) {
                            return <Details {...localProps} />;
                        } else if (isUserFound) {
                            return <ScopeNotFound {...localProps} />;
                        } else {
                            return <RedirectToLogin {...localProps} />;
                        }
                    }}
                />
                <Route
                    path='/search'
                    render={(routeProps) => (
                        <PortalModeRouteGuard>
                            <Apis {...routeProps} />
                        </PortalModeRouteGuard>
                    )}
                />
                <Route component={PageNotFound} />
            </Switch>
        </Suspense>
    );
}

AppRouts.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isUserFound: PropTypes.bool.isRequired,
};

export default AppRouts;
