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
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import LaunchIcon from '@material-ui/icons/Launch';
import { useTheme } from '@material-ui/styles';
import { FormattedMessage } from 'react-intl';
import AuthManager, { isRestricted } from 'AppData/AuthManager';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';

import GlobalNavLink from './GlobalNavLink';

const useStyles = makeStyles((theme) => ({
    scopeIcon: {
        color: theme.palette.background.paper,
    },
    externalLinkIcon: {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(-1),
    },
}));


/**
 *
 *
 * @param {*} props
 * @returns
 */
function GlobalNavLinks(props) {
    const publisherUser = !AuthManager.isNotPublisher();
    const readOnlyUser = AuthManager.isReadOnlyUser();
    const adminUser = AuthManager.isAdminUser();
    const classes = useStyles();
    const { selected } = props;
    const theme = useTheme();
    const analyticsMenuEnabled = theme.custom.leftMenuAnalytics.enable;
    const analyticsMenuLink = theme.custom.leftMenuAnalytics.link;
    return (
        <Box mt={10}>
            <List className={classes.listRoot} component='nav' name='primaryNavigation' aria-label='primary navigation'>
                <GlobalNavLink
                    to='/apis'
                    type='apis'
                    title='APIs'
                    active={selected === 'apis'}
                >
                    <FormattedMessage
                        id='Base.Header.navbar.GlobalNavBar.apis'
                        defaultMessage='APIs'
                    />
                </GlobalNavLink>
                <GlobalNavLink
                    to='/service-catalog'
                    type='service-catalog'
                    title='Services'
                    active={selected === 'service-catalog'}
                >
                    <FormattedMessage
                        id='Base.Header.navbar.GlobalNavBar.Service.Catalog'
                        defaultMessage='Services'
                    />
                </GlobalNavLink>
                { (readOnlyUser || publisherUser)
                    && (
                        <GlobalNavLink
                            to='/api-products'
                            type='api-product'
                            title='API Products'
                            active={selected === 'api-products'}
                        >
                            <FormattedMessage
                                id='Base.Header.navbar.GlobalNavBar.api.products'
                                defaultMessage='API Products'
                            />
                        </GlobalNavLink>
                    )}
                {(adminUser)
                    && (
                        <GlobalNavLink
                            id='scope'
                            to='/scopes'
                            type='scopes'
                            title='Scopes'
                            active={selected === 'scopes'}
                        >
                            <FormattedMessage id='Base.Header.navbar.GlobalNavBar.scopes' defaultMessage='Scopes' />
                        </GlobalNavLink>
                    )}
                <GlobalNavLink
                    id='policies'
                    to='/policies'
                    type='policies'
                    title='Policies'
                    active={selected === 'policies'}
                >
                    <FormattedMessage
                        id='Base.Header.navbar.GlobalNavBar.common.policies'
                        defaultMessage='Policies'
                    />
                </GlobalNavLink>
                {(!isRestricted(['apim:gateway_policy_manage', 'apim:gateway_policy_view']))
                    && (
                        <GlobalNavLink
                            id='global-policies'
                            to='/global-policies'
                            type='global-policies'
                            title='Global Policies'
                            active={selected === 'global-policies'}
                        >
                            <FormattedMessage id='Base.Header.navbar.GlobalNavBar.global.policies' 
                                defaultMessage='Global Policies'/>
                        </GlobalNavLink>
                    )}
                {analyticsMenuEnabled && (
                    <>
                        <Divider />
                        <a href={analyticsMenuLink} target='_blank' rel='noreferrer'>
                            <GlobalNavLink
                                isExternalLink
                                type='analytics'
                                title='Analytics'
                            >
                                <div style={{ flexDirection: 'row', display: 'flex' }}>
                                    <FormattedMessage
                                        id='Base.Header.navbar.GlobalNavBar.analytics'
                                        defaultMessage='Analytics'
                                    />
                                    <div className={classes.externalLinkIcon}>
                                        <LaunchIcon style={{ fontSize: 15 }} />
                                    </div>
                                </div>
                            </GlobalNavLink>
                        </a>
                    </>
                )}
            </List>
        </Box>
    );
}
GlobalNavLinks.propTypes = {
    classes: PropTypes.shape({
        drawerStyles: PropTypes.string,
        list: PropTypes.string,
        listText: PropTypes.string,
    }).isRequired,
    theme: PropTypes.shape({
        palette: PropTypes.shape({
            getContrastText: PropTypes.func,
            background: PropTypes.shape({
                drawer: PropTypes.string,
                leftMenu: PropTypes.string,
            }),
        }),
    }).isRequired,
};

export default GlobalNavLinks;
