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
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import Icon from '@material-ui/core/Icon';
import {
    ListItemIcon, List, ListItem, ListItemText,
} from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import AuthManager from 'AppData/AuthManager';
import CustomIcon from '../../Shared/CustomIcon';

/**
 * GlobalNavBar
 * @param {*} props Properties
 * @returns {React.Component} Renders global navbar
 */
function GlobalNavBar(props) {
    const {
        classes, theme, intl, drawerView, selected, iconWidth, strokeColorSelected, strokeColor,
    } = props;
    const { custom: { landingPage: { active: landingPageActive, activeForAnonymous } } } = theme;
    const isUserFound = AuthManager.getUser();
    React.useEffect(() => {}, [selected]);
    return (
        <List className={classes.listRootInline} component='nav' aria-label='primary navigation' role='navigation'>
            {landingPageActive && ((isUserFound && !activeForAnonymous) || activeForAnonymous)
                && (
                    <Link
                        to='/home'
                        className={classNames({
                            [classes.selected]: selected === 'home',
                            // eslint-disable-next-line quote-props
                            'selected': selected === 'home',
                            [classes.links]: true,
                        }, 'header-link')}
                    >
                        <ListItem component='div' classes={{ root: classes.listItemRoot }}>
                            <ListItemIcon classes={{
                                root: classNames({ [classes.smallIcon]: !drawerView },
                                    'heder-menu-icon-home', 'header-menu-icon'),
                            }}
                            >
                                <Icon
                                    style={{
                                        fontSize: iconWidth,
                                        color: selected === 'home'
                                            ? strokeColorSelected : strokeColor,
                                    }}
                                    className={classes.listText}
                                >
                                    home
                                </Icon>
                            </ListItemIcon>
                            <ListItemText
                                classes={{
                                    root: classes.listItemTextRoot,
                                    primary: classNames({
                                        [classes.selectedText]: selected === 'home',
                                        [classes.listText]: selected !== 'home',
                                    }),
                                }}
                                primary={intl.formatMessage({
                                    id: 'Base.Header.GlobalNavbar.menu.home',
                                    defaultMessage: 'Home',
                                })}
                            />
                        </ListItem>
                        {(selected === 'home' && !drawerView) && (<div className={classes.triangleDown} />)}
                    </Link>
                ) }
            <Link
                data-testid='itest-link-to-apis'
                to={(theme.custom.tagWise.active && theme.custom.tagWise.style === 'page') ? '/api-groups' : '/apis'}
                className={classNames({
                    [classes.selected]: selected === 'apis',
                    // eslint-disable-next-line quote-props
                    'selected': selected === 'apis',
                    [classes.links]: true,
                }, 'header-link')}
            >
                <ListItem component='div' classes={{ root: classes.listItemRoot }}>
                    <ListItemIcon classes={{
                        root: classNames({ [classes.smallIcon]: !drawerView },
                            'heder-menu-icon-apis', 'header-menu-icon'),
                    }}
                    >
                        <CustomIcon
                            width={iconWidth}
                            height={iconWidth}
                            icon='api'
                            className={classes.listText}
                            strokeColor={selected === 'apis' ? strokeColorSelected : strokeColor}
                        />
                    </ListItemIcon>
                    <ListItemText
                        classes={{
                            root: classes.listItemTextRoot,
                            primary: classNames({
                                [classes.selectedText]: selected === 'apis',
                                [classes.listText]: selected !== 'apis',
                            }),
                        }}
                        primary={intl.formatMessage({
                            id: 'Base.Header.GlobalNavbar.menu.apis',
                            defaultMessage: 'APIs',
                        })}
                    />
                </ListItem>
                {(selected === 'apis' && !drawerView) && (<div className={classes.triangleDown} />)}
            </Link>
            <Link
                id='itest-link-to-applications'
                to='/applications'
                className={classNames({
                    [classes.selected]: selected === 'applications',
                    // eslint-disable-next-line quote-props
                    'selected': selected === 'applications',
                    [classes.links]: true,
                }, 'header-link')}
            >
                <ListItem component='div' classes={{ root: classes.listItemRoot }}>
                    <ListItemIcon classes={{
                        root: classNames({ [classes.smallIcon]: !drawerView },
                            'heder-menu-icon-applications', 'header-menu-icon'),
                    }}
                    >
                        <CustomIcon
                            width={iconWidth}
                            height={iconWidth}
                            icon='applications'
                            className={classes.listText}
                            strokeColor={selected === 'applications' ? strokeColorSelected : strokeColor}
                        />
                    </ListItemIcon>
                    <ListItemText
                        classes={{
                            root: classes.listItemTextRoot,
                            primary: classNames({
                                [classes.selectedText]: selected === 'applications',
                                [classes.listText]: selected !== 'applications',
                            }),
                        }}
                        primary={intl.formatMessage({
                            id: 'Base.Header.GlobalNavbar.menu.applications',
                            defaultMessage: 'Applications',
                        })}
                    />
                </ListItem>
                {(selected === 'applications' && !drawerView) && (<div className={classes.triangleDown} />)}
            </Link>
        </List>
    );
}

GlobalNavBar.propTypes = {
    intl: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};

export default withRouter(withTheme(injectIntl(GlobalNavBar)));
