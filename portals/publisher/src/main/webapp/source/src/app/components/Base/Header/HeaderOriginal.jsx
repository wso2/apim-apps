import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import Hidden from '@mui/material/Hidden';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import Avatar from 'AppComponents/Base/Header/avatar/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import Configurations from 'Config';
import HeaderSearch from 'AppComponents/Base/Header/headersearch/HeaderSearch';
import GlobalNavBar from 'AppComponents/Base/Header/navbar/GlobalNavBar';
import { GlobalDrawerProvider } from 'AppComponents/Base/Header/navbar/useNavBar';


const useStyles = makeStyles((theme) => ({
    appBar: {
        background: theme.palette.background.appBar,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    menuIcon: {
        color: theme.palette.getContrastText(theme.palette.background.appBar),
    },
    drawerToggleIcon: {
        color: theme.palette.getContrastText(theme.palette.background.appBar),
    },
    toolbarStyles: {
        minHeight: theme.spacing(8),
    },
}));

/**
 *
 */
export default function HeaderOriginal(props) {
    const { avatar, menuItems, user } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [openMiniSearch, setOpenMiniSearch] = React.useState(false);
    const toggleMiniSearch = () => { setOpenMiniSearch(!openMiniSearch); };
    const handleDrawerToggle = () => {
        setOpen(!open);
    };
    const Icon = open ? CloseIcon : MenuIcon;
    return (
        <GlobalDrawerProvider value={{ open, setOpen }}>
            <AppBar
                position='fixed'
                className={classes.appBar}
            >
                <Toolbar className={classes.toolbarStyles}>
                    <IconButton
                        aria-label='Expand publisher landing page drawer'
                        onClick={handleDrawerToggle}
                        edge='start'
                    >
                        <Icon
                            fontSize='large'
                            className={classes.drawerToggleIcon}
                            titleAccess='Expand page drawer'
                        />
                    </IconButton>
                    <Box display='flex' justifyContent='space-between' flexDirection='row' width={1}>
                        <Box display='flex'>
                            <Link to='/' aria-label='Go to home page'>
                                <img
                                    src={Configurations.app.context + theme.custom.logo}
                                    alt={`${theme.custom.title.prefix} ${theme.custom.title.suffix}`}
                                    style={{ height: theme.custom.logoHeight, width: theme.custom.logoWidth }}
                                />
                            </Link>
                        </Box>
                        <Box display='flex'>
                            <Hidden smDown>
                                <HeaderSearch />
                            </Hidden>
                            <Hidden mdUp>
                                <IconButton onClick={toggleMiniSearch} color='inherit' aria-label='Search button'>
                                    <SearchIcon className={classes.menuIcon} />
                                </IconButton>
                                {openMiniSearch
                                    && (
                                        <HeaderSearch toggleSmSearch={toggleMiniSearch} smSearch={openMiniSearch} />
                                    )}
                            </Hidden>
                            {menuItems}
                            {avatar || <Avatar user={user} />}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <GlobalNavBar setOpen={setOpen} open={open} />
        </GlobalDrawerProvider>
    );
}
