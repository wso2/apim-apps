import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import {
    IconButton,
    Menu,
    MenuItem,
    Icon,
    Box,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Configurations from 'Config';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AuthManager from 'AppData/AuthManager';

const PREFIX = 'Avatar';

const classes = {
    profileMenu: `${PREFIX}-profileMenu`,
    userLink: `${PREFIX}-userLink`,
    readOnlyUserLink: `${PREFIX}-readOnlyUserLink`,
    accountIcon: `${PREFIX}-accountIcon`,
    root: `${PREFIX}-root`,
    flexbox: `${PREFIX}-flexbox`
};


const Root = styled('div')(({ theme }) => ({
    [`& .${classes.profileMenu}`]: {
        zIndex: theme.zIndex.modal + 1,
        paddingTop: '5px',
    },

    [`& .${classes.userLink}`]: {
        color: theme.palette.getContrastText(theme.palette.background.appBar),
        fontSize: theme.typography.fontSize,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },

    [`& .${classes.readOnlyUserLink}`]: {
        color: theme.palette.getContrastText(theme.palette.background.appBar),
        fontSize: theme.typography.fontSize,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        border: 'solid 2px #ccc',
        borderRadius: 20,
        borderColor: '#E57739',
    },

    [`& .${classes.accountIcon}`]: {
        marginRight: 10,
    },

    [`& .${classes.root}`]: {
        borderRadius: 20,
        borderColor: '#000',
    },

    [`& .${classes.flexbox}`]: {
        flex: 1,
        flexDirection: 'column',
        display: 'inline-block',
    }
}));

/**
 * Render the User Avatar with their name inside the Top AppBar component
 *
 * @class Avatar
 * @extends {Component}
 */
class Avatar extends Component {
    /**
     *Creates an instance of Avatar.
     * @param {Object} props @inheritdoc
     * @memberof Avatar
     */
    constructor(props) {
        super(props);
        this.state = { anchorEl: null };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    /**
     * Do OIDC logout redirection
     * @param {React.SyntheticEvent} e Click event of the submit button
     */
    doOIDCLogout = (e) => {
        e.preventDefault();
        window.location = `${Configurations.app.context}/services/logout`;
    };

    /**
     *
     * Close Avatar dropdown menu
     * @memberof Avatar
     */
    handleClose() {
        this.setState({ anchorEl: null });
    }

    /**
     *
     * Open Avatar dropdown menu
     * @param {React.SyntheticEvent} event `click` event on Avatar
     * @memberof Avatar
     */
    handleClick(event) {
        this.setState({ anchorEl: event.currentTarget });
    }

    /**
     *
     * @inheritdoc
     * @returns {React.Component} @inheritdoc
     * @memberof Avatar
     */
    render() {
        const {  user } = this.props;
        let username = user.name;
        const count = (username.match(/@/g) || []).length;
        if (user.name.endsWith('@carbon.super') && count <= 1) {
            username = user.name.replace('@carbon.super', '');
        }
        const readOnlyUser = AuthManager.isReadOnlyUser();
        const { anchorEl } = this.state;
        return (
            <Root>
                <IconButton
                    id='profile-menu-btn'
                    aria-owns='logout-menu'
                    aria-haspopup='true'
                    color='inherit'
                    onClick={this.handleClick}
                    className={readOnlyUser ? classes.readOnlyUserLink : classes.userLink}
                    disableFocusRipple
                    disableRipple
                    size='large'>
                    <AccountCircle className={classes.accountIcon} />
                    {' '}
                    {username.replace('@carbon.super', '')}
                    <Icon style={{ fontSize: '22px', marginLeft: '1px' }}>
                        keyboard_arrow_down
                    </Icon>
                    {readOnlyUser && (
                        <Box
                            className={classes.flexbox}
                            ml={1}
                            color='#E57739'
                        >
                            <FormattedMessage
                                id='Api.login.page.readonly.user'
                                defaultMessage='Read only'
                            />
                        </Box>
                    )}
                </IconButton>
                <Menu
                    id='itest-logout-menu'
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    getContentAnchorEl={null}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    className={classes.profileMenu}
                >
                    <Link to={{ pathname: '/services/logout' }}>
                        <MenuItem onClick={this.doOIDCLogout} id='itest-logout'>
                            <Box mx={1} display='flex' alignItems='center' color='text.secondary'>
                                <ExitToAppIcon fontSize='small' />
                                <Box ml={1}>
                                    <FormattedMessage
                                        id='Base.Header.avatar.Avatar.logout'
                                        defaultMessage='Logout'
                                    />
                                </Box>
                            </Box>

                        </MenuItem>
                    </Link>
                </Menu>
            </Root>
        );
    }
}
Avatar.propTypes = {
    user: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
};

export default (Avatar);
