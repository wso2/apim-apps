/* eslint-disable react/jsx-props-no-spreading */
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

import React from 'react';
import { styled } from '@mui/material/styles';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Hidden from '@mui/material/Hidden';
import {
    MenuItem, MenuList, useTheme,
} from '@mui/material';
import Icon from '@mui/material/Icon';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Toaster } from 'react-hot-toast';
import Drawer from '@mui/material/Drawer';
import HeaderSearch from 'AppComponents/Base/Header/Search/HeaderSearch';
import Settings, { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import { app } from 'Settings';
import HTMLRender from 'AppComponents/Shared/HTMLRender';
import Box from '@mui/material/Box';
import AuthManager from '../../data/AuthManager';
import LanguageSelector from './Header/LanuageSelector';
import GlobalNavBar from './Header/GlobalNavbar';
import VerticalDivider from '../Shared/VerticalDivider';

const PREFIX = 'index';

const classes = {
    appBar: `${PREFIX}-appBar`,
    icon: `${PREFIX}-icon`,
    menuIcon: `${PREFIX}-menuIcon`,
    userLink: `${PREFIX}-userLink`,
    publicStore: `${PREFIX}-publicStore`,
    linkWrapper: `${PREFIX}-linkWrapper`,
    drawer: `${PREFIX}-drawer`,
    wrapper: `${PREFIX}-wrapper`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    push: `${PREFIX}-push`,
    footer: `${PREFIX}-footer`,
    toolbar: `${PREFIX}-toolbar`,
    list: `${PREFIX}-list`,
    drawerStyles: `${PREFIX}-drawerStyles`,
    listInline: `${PREFIX}-listInline`,
    reactRoot: `${PREFIX}-reactRoot`,
    icons: `${PREFIX}-icons`,
    banner: `${PREFIX}-banner`,
    listRoot: `${PREFIX}-listRoot`,
    listRootInline: `${PREFIX}-listRootInline`,
    listItemTextRoot: `${PREFIX}-listItemTextRoot`,
    listText: `${PREFIX}-listText`,
    listTextSmall: `${PREFIX}-listTextSmall`,
    smallIcon: `${PREFIX}-smallIcon`,
    links: `${PREFIX}-links`,
    selected: `${PREFIX}-selected`,
    selectedText: `${PREFIX}-selectedText`,
    triangleDown: `${PREFIX}-triangleDown`,
    listIconRoot: `${PREFIX}-listIconRoot`,
    listItemRoot: `${PREFIX}-listItemRoot`,
    logoutLink: `${PREFIX}-logoutLink`,
};

const Root = styled('div')((
    {
        theme,
    },
) => {
    const pageMaxWidth = theme.custom.page.style === 'fluid' ? 'none' : theme.custom.page.width;
    const footerHeight = theme.custom.footer.active ? theme.custom.footer.height : 0;
    return {
        [`& .${classes.appBar}`]: {
            position: 'fixed',
            backgroundColor: theme.custom.appBar.background,
            backgroundImage: `url(${app.context}${theme.custom.appBar.backgroundImage})`,
            backgroundRepeat: 'no-repeat',
        },
        [`& .${classes.icon}`]: {
            marginRight: theme.spacing(2),
        },
        [`& .${classes.menuIcon}`]: {
            color: theme.palette.getContrastText(theme.custom.appBar.background),
            fontSize: 35,
        },
        [`& .${classes.userLink}`]: {
            color: theme.palette.getContrastText(theme.custom.appBar.background),
        },
        [`& .${classes.publicStore}`]: {
            color: theme.palette.getContrastText(theme.custom.appBar.background),
            minWidth: 'auto',
        },
        [`& .${classes.linkWrapper}`]: {
            display: 'flex',
            marginLeft: 'auto',
        },
        // Page layout styles
        [`& .${classes.drawer}`]: {
            top: 64,
        },
        [`& .${classes.wrapper}`]: {
            minHeight: '100%',
            marginBottom: -50,
            background: theme.palette.background.default + ' url(' + app.context + theme.custom.backgroundImage + ') repeat left top',
        },
        [`& .${classes.contentWrapper}`]: {
            display: 'flex',
            flexDirection: 'row',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            minHeight: theme.custom.banner.active ? `calc(100vh - ${64 + footerHeight}px)` : `calc(100vh - ${footerHeight}px)`,
            marginLeft: -4,
            marginTop: theme.custom.banner.active ? 0 : '64px',
        },
        [`& .${classes.push}`]: {
            height: 50,
        },
        [`& .${classes.footer}`]: {
            background: theme.custom.footer.background,
            color: theme.custom.footer.color,
            paddingLeft: theme.spacing(3),
            height: theme.custom.footer.height || 50,
            alignItems: 'center',
            display: 'flex',
        },
        [`& .${classes.toolbar}`]: {
            minHeight: 56,
            [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
                minHeight: 48,
            },
            [theme.breakpoints.up('sm')]: {
                minHeight: 64,
            },
        },
        [`& .${classes.list}`]: {
            width: theme.custom.appBar.drawerWidth,
        },
        [`& .${classes.drawerStyles}`]: {
            top: theme.mixins.toolbar['@media (min-width:600px)'].minHeight,
        },
        [`& .${classes.listInline}`]: {
            '& ul': {
                display: 'flex',
                flexDirection: 'row',
            },
        },
        [`& .${classes.reactRoot}`]: {
            maxWidth: pageMaxWidth,
            margin: 'auto',
            borderLeft: theme.custom.page.border,
            borderRight: theme.custom.page.border,
        },
        [`& .${classes.icons}`]: {
            marginRight: theme.spacing(),
            '&.material-icons': {
                fontSize: theme.spacing(2),
            },
        },
        [`& .${classes.banner}`]: {
            color: theme.custom.banner.color,
            background: theme.custom.banner.background,
            padding: theme.custom.banner.padding,
            margin: theme.custom.banner.margin,
            fontSize: theme.custom.banner.fontSize,
            display: 'flex',
            distributeContent: theme.custom.banner.textAlign,
            justifyContent: theme.custom.banner.textAlign,
            top: 0,
            position: 'fixed',
            width: '100%',
            boxSizing: 'border-box',
            zIndex: 1000,
        },
        [`& .${classes.listRoot}`]: {
            padding: 0,
        },
        [`& .${classes.listRootInline}`]: {
            padding: 0,
            display: 'flex',
            [theme.breakpoints.down('md')]: {
                flexDirection: 'column',
            },
        },
        [`& .${classes.listItemTextRoot}`]: {
            padding: 0,
        },
        [`& .${classes.listText}`]: {
            color: theme.palette.getContrastText(theme.custom.appBar.background),
        },
        [`& .${classes.listTextSmall}`]: {
            color: theme.palette.getContrastText(theme.custom.appBar.background),
        },
        [`& .${classes.smallIcon}`]: {
            marginRight: 5,
            minWidth: 'auto',
        },
        [`& .${classes.links}`]: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        [`& .${classes.selected}`]: {
            background: theme.custom.appBar.activeBackground,
            alignItems: 'center',
            textDecoration: 'none',
            color: theme.palette.getContrastText(theme.custom.appBar.activeBackground),
        },
        [`& .${classes.selectedText}`]: {
            color: theme.palette.getContrastText(theme.custom.appBar.activeBackground),
        },
        [`& .${classes.triangleDown}`]: {
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${theme.custom.appBar.activeBackground}`,
            fontSize: 0,
            lineHeight: 0,
            position: 'absolute',
            bottom: -5,
        },
        [`& .${classes.listIconRoot}`]: {
            minWidth: 'auto',
        },
        [`& .${classes.listItemRoot}`]: {
            padding: `0 ${theme.spacing(1)} 0 ${theme.spacing(1)} `,
            height: 30,
        },
        [`& .${classes.logoutLink}`]: {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
    };
});

/**
 *
 * @class LayoutLegacy
 * @extends {React.Component}
 */
class LayoutLegacy extends React.Component {
    /**
     * @inheritdoc
     * @param {*} props
     * @memberof LayoutLegacy
     */
    constructor(props) {
        super(props);
        this.state = {
            openNavBar: false,
            openUserMenu: false,
            selected: 'home',
            anchorEl: null,
            bannerHeight: 0,
        };
        this.toggleGlobalNavBar = this.toggleGlobalNavBar.bind(this);
        const { history } = props;
        history.listen((location) => {
            this.detectCurrentMenu(location);
        });
    }

    /**
     * Component did mount callback.
     * @returns {void}
     */
    componentDidMount() {
        const { history: { location }, theme } = this.props;
        document.body.style.backgroundColor = theme.custom.page.emptyAreadBackground || '#ffffff';
        this.detectCurrentMenu(location);
        if (theme.custom.banner.active) {
            if (theme.custom.banner.style === 'image') {
                setTimeout(() => {
                    const bannerElement = document.getElementById('bannerElement');
                    this.setState({ bannerHeight: bannerElement.clientHeight });
                }, 1000);
            } else {
                const bannerElement = document.getElementById('bannerElement');
                this.setState({ bannerHeight: bannerElement.clientHeight });
            }
        }
    }

    detectCurrentMenu = (location) => {
        const { pathname } = location;
        if (/\/apis$/g.test(pathname) || /\/apis\//g.test(pathname)) {
            this.setState({ selected: 'apis' });
        } else if (/\/home$/g.test(pathname) || /\/home\//g.test(pathname)) {
            this.setState({ selected: 'home' });
        } else if (/\/applications$/g.test(pathname) || /\/applications\//g.test(pathname)) {
            this.setState({ selected: 'applications' });
        } else if (/\/settings$/g.test(pathname) || /\/settings\//g.test(pathname)) {
            this.setState({ selected: 'settings' });
        }
    };

    handleRequestCloseUserMenu = () => {
        this.setState({ openUserMenu: false });
    };

    /**
     * Do OIDC logout redirection
     * @param {React.SyntheticEvent} e Click event of the submit button
     */
    doOIDCLogout = (e) => {
        e.preventDefault();
        window.location = app.context + '/services/logout';
    };

    handleClickButton = (key) => {
        this.setState({
            [key]: true,
        });
    };

    handleRequestClose = (key) => {
        this.setState({
            [key]: false,
        });
    };

    handleToggleUserMenu = (event) => {
        this.setState((state) => ({ openUserMenu: !state.openUserMenu }));
        this.setState({ anchorEl: event.currentTarget });
    };

    handleCloseUserMenu = (event) => {
        if (this.state.anchorEl?.contains(event.target)) {
            return;
        }

        this.setState({ openUserMenu: false });
    };

    getLogoPath = () => {
        const settingsContext = this.context;
        const { tenantDomain } = settingsContext;
        const { theme } = this.props;
        const { custom: { appBar: { logo } } } = theme;
        let logoWithTenant = logo;
        if (logo && logoWithTenant) {
            logoWithTenant = logo.replace('<tenant-domain>', tenantDomain);
        }
        if (logoWithTenant && /^(ftp|http|https):\/\/[^ "]+$/.test(logoWithTenant)) {
            return logoWithTenant;
        } else {
            return app.context + logoWithTenant;
        }
    };

    getPasswordChangeEnabled = () => {
        const { settings: { IsPasswordChangeEnabled } } = useSettingsContext();
        return IsPasswordChangeEnabled;
    };

    /**
     * toggleGlobalNavBar callback.
     * @returns {void}
     */
    toggleGlobalNavBar() {
        this.setState((prevState) => ({ openNavBar: !prevState.openNavBar }));
    }

    /**
     * Render callback.
     * @returns {JSX} returns the JSX
     */
    render() {
        const {
            theme, children,
        } = this.props;
        const {
            custom: {
                banner: {
                    style, text, image, active,
                },
                appBar: {
                    showSearch,
                },
                footer: {
                    active: footerActive, text: footerText, footerHTML, dangerMode,
                },
                languageSwitch: { active: languageSwitchActive },
                publicTenantStore,
            },
        } = theme;
        const { openNavBar, selected } = this.state;
        const { tenantDomain, setTenantDomain } = this.context;
        const { customUrl: { tenantDomain: customUrlEnabledDomain } } = app;

        const user = AuthManager.getUser();
        // TODO: Refer to fix: https://github.com/mui-org/material-ui/issues/10076#issuecomment-361232810 ~tmkb
        let username = null;

        if (user) {
            username = user.name;
            const count = (username.match(/@/g) || []).length;
            if (user.name.endsWith('@carbon.super') && count <= 1) {
                username = user.name.replace('@carbon.super', '');
            }
        }
        const commonStyle = {
            style: { top: 64 },
        };
        const paperStyles = {
            style: {
                top: 64,
                backgroundColor: theme.custom.appBar.background,
            },
        };

        const strokeColor = theme.palette.getContrastText(theme.custom.appBar.background);
        const strokeColorSelected = theme.palette.getContrastText(theme.custom.appBar.activeBackground);

        let publicTenantStoreVisible = true;

        if (publicTenantStore) {
            const { active: publicTenantStoreActive } = publicTenantStore;
            publicTenantStoreVisible = publicTenantStoreActive;
        }
        return (
            <Root>
                {active && (
                    <div className={classes.banner} id='bannerElement'>
                        {style === 'text' ? text
                            : (
                                <img
                                    alt={(
                                        <FormattedMessage
                                            id='Base.index.banner.alt'
                                            defaultMessage='Dev Portal Banner'
                                        />
                                    )}
                                    src={`${app.context}/${image}`}
                                />
                            )}
                    </div>
                )}
                <Toaster
                    position='bottom-right'
                    gutter={8}
                    toastOptions={{
                        style: {
                            background: '#008fcc',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            fontSize: '13px',
                        },
                        success: {
                            style: {
                                backgroundColor: '#4caf50',
                                color: '#ffffff',
                                fontFamily: theme.typography.fontFamily,
                                fontSize: '13px',
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#4caf50',
                            },
                        },
                        error: {
                            style: {
                                backgroundColor: '#BD0808',
                                color: '#ffffff',
                                fontFamily: theme.typography.fontFamily,
                                fontSize: '13px',
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#BD0808',
                            },
                        },
                        custom: {
                            style: { backgroundColor: '#DDEFFF' },
                        },
                    }}
                />
                <div className={classes.reactRoot} id='pageRoot'>
                    <div className={classes.wrapper} style={{ marginTop: active ? (this.state.bannerHeight + 64) + 'px' : 0 }}>
                        <AppBar
                            position='fixed'
                            className={classes.appBar}
                            id='appBar'
                            style={{ top: active ? this.state.bannerHeight + 'px' : 0 }}
                        >
                            <Toolbar className={classes.toolbar} id='toolBar'>
                                <Hidden mdUp>
                                    <IconButton onClick={this.toggleGlobalNavBar} color='inherit' size='large'>
                                        <Icon className={classes.menuIcon}>menu</Icon>
                                    </IconButton>
                                </Hidden>
                                <Link to='/' id='logoLink' aria-label='Go to home page'>
                                    <img
                                        alt={(
                                            <FormattedMessage
                                                id='Base.index.logo.alt'
                                                defaultMessage='Dev Portal'
                                            />
                                        )}
                                        src={this.getLogoPath()}
                                        style={{
                                            height: theme.custom.appBar.logoHeight,
                                            width: theme.custom.appBar.logoWidth,
                                        }}
                                    />
                                </Link>
                                <Hidden mdDown>
                                    <VerticalDivider height={32} />
                                    <div className={classes.listInline}>
                                        <GlobalNavBar
                                            selected={selected}
                                            drawerView={false}
                                            iconWidth={16}
                                            strokeColor={strokeColor}
                                            strokeColorSelected={strokeColorSelected}
                                            classes={classes}
                                        />
                                    </div>
                                </Hidden>
                                <Hidden mdUp>
                                    <Drawer
                                        className={classes.drawerStyles}
                                        PaperProps={paperStyles}
                                        SlideProps={commonStyle}
                                        ModalProps={commonStyle}
                                        BackdropProps={commonStyle}
                                        open={openNavBar}
                                        onClose={this.toggleGlobalNavBar}
                                    >
                                        <div
                                            tabIndex={0}
                                            role='button'
                                            onClick={this.toggleGlobalNavBar}
                                            onKeyDown={this.toggleGlobalNavBar}
                                        >
                                            <div className={classes.list}>
                                                <GlobalNavBar
                                                    selected={selected}
                                                    drawerView
                                                    iconWidth={24}
                                                    strokeColor={strokeColor}
                                                    strokeColorSelected={strokeColorSelected}
                                                    classes={classes}
                                                />
                                            </div>
                                        </div>
                                    </Drawer>
                                </Hidden>
                                <VerticalDivider height={32} />
                                {showSearch && (<HeaderSearch id='headerSearch' />)}
                                <Box sx={{ flexGrow: 1 }} />
                                {tenantDomain && customUrlEnabledDomain === 'null' && tenantDomain !== 'INVALID'
                                    && publicTenantStoreVisible && (
                                    <Link
                                        style={{
                                            textDecoration: 'none',
                                            color: '#ffffff',
                                        }}
                                        to='/'
                                        onClick={() => setTenantDomain('INVALID')}
                                        id='gotoPubulicDevPortal'
                                    >
                                        <Button className={classes.publicStore}>
                                            <Icon className={classes.icons}>public</Icon>
                                            <Hidden lgDown>
                                                <FormattedMessage
                                                    id='Base.index.go.to.public.store'
                                                    defaultMessage='Switch Dev Portals'
                                                />
                                            </Hidden>
                                        </Button>
                                    </Link>
                                )}
                                <VerticalDivider height={64} />
                                {languageSwitchActive && <LanguageSelector />}
                                {user ? (
                                    <>
                                        <div className={classes.linkWrapper}>
                                            <Button
                                                aria-owns={this.openUserMenu ? 'menu-list-grow' : null}
                                                aria-haspopup='true'
                                                onClick={this.handleToggleUserMenu}
                                                className={classes.userLink}
                                                id='userToggleButton'
                                                aria-label='user menu'
                                            >
                                                <Icon className={classes.icons}>person</Icon>
                                                {username}
                                            </Button>
                                            <Popper
                                                id='userPopup'
                                                open={this.state.openUserMenu}
                                                anchorEl={this.state.anchorEl}
                                                transition
                                                disablePortal
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'center',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                placement='bottom-end'
                                            >
                                                {({ TransitionProps, placement }) => (
                                                    <Grow
                                                        {...TransitionProps}
                                                        id='menu-list-grow'
                                                        style={{
                                                            transformOrigin:
                                                                placement === 'bottom' ? 'center top' : 'center bottom',
                                                        }}
                                                    >
                                                        <Paper>
                                                            <ClickAwayListener onClickAway={this.handleCloseUserMenu}>
                                                                <MenuList>
                                                                    {this.getPasswordChangeEnabled()
                                                                        ? (
                                                                            <MenuItem className={classes.logoutLink}>
                                                                                <Link
                                                                                    to='/settings/change-password/'
                                                                                    onClick={this.handleCloseUserMenu}
                                                                                >
                                                                                    <FormattedMessage
                                                                                        id='Base.index.settingsMenu.changePassword'
                                                                                        defaultMessage='Change Password'
                                                                                    />
                                                                                </Link>
                                                                            </MenuItem>
                                                                        )
                                                                        : null}
                                                                    <MenuItem
                                                                        onClick={this.doOIDCLogout}
                                                                        className={classes.logoutLink}
                                                                        id='logout-link'
                                                                    >
                                                                        <FormattedMessage
                                                                            id='Base.index.logout'
                                                                            defaultMessage='Logout'
                                                                        />
                                                                    </MenuItem>
                                                                </MenuList>
                                                            </ClickAwayListener>
                                                        </Paper>
                                                    </Grow>
                                                )}
                                            </Popper>
                                        </div>
                                    </>
                                ) : (
                                    <div className={classes.linkWrapper}>
                                        <Button
                                            id='itest-devportal-sign-in'
                                            className={classes.userLink}
                                            component='a'
                                            href={app.context + '/services/configs'}
                                        >
                                            <Icon>person</Icon>
                                            <FormattedMessage id='Base.index.sign.in' defaultMessage=' Sign-in' />
                                        </Button>
                                    </div>
                                )}
                            </Toolbar>
                        </AppBar>
                        <main>
                            <div className={classes.contentWrapper}>{children}</div>
                        </main>
                        {footerActive && <div className={classes.push} />}
                    </div>
                    {footerActive && (
                        <footer className={classes.footer} id='footer'>
                            {footerHTML && footerHTML !== '' ? (
                                <>
                                    {!dangerMode && (<HTMLRender html={footerHTML} />)}
                                    {dangerMode && (<div contentEditable='true' dangerouslySetInnerHTML={{ __html: footerHTML }} />)}
                                </>
                            ) : (
                                <Typography noWrap>
                                    {footerText && footerText !== '' ? <span>{footerText}</span> : (
                                        <FormattedMessage
                                            id='Base.index.copyright.text'
                                            defaultMessage='WSO2 API-M v4.3.0 | © 2024 WSO2 LLC'
                                        />
                                    )}
                                </Typography>
                            )}
                        </footer>
                    )}
                </div>
            </Root>
        );
    }
}
LayoutLegacy.contextType = Settings;

LayoutLegacy.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};

function Layout(props) {
    const theme = useTheme();
    return (
        <LayoutLegacy
            {...props}
            theme={theme}
        />
    );
}

export default injectIntl(withRouter((Layout)));
