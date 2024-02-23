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
import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import Drawer from '@mui/material/Drawer';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GlobalNavLinks from './GlobalNavLinks';

const PREFIX = 'GlobalNavBar';

const classes = {
    list: `${PREFIX}-list`,
    drawer: `${PREFIX}-drawer`,
    drawerOpen: `${PREFIX}-drawerOpen`,
    drawerClose: `${PREFIX}-drawerClose`,
    listText: `${PREFIX}-listText`,
    listInline: `${PREFIX}-listInline`,
    paperStyles: `${PREFIX}-paperStyles`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.list}`]: {
        width: theme.custom.globalNavBar.opened.drawerWidth,
    },

    [`& .${classes.drawer}`]: {
        width: theme.custom.globalNavBar.opened.drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.background.drawer,
    },

    [`& .${classes.drawerOpen}`]: {
        width: theme.custom.globalNavBar.opened.drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        backgroundColor: 'green',
    },

    [`& .${classes.drawerClose}`]: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(7),
        },
    },

    [`& .${classes.listText}`]: {
        color: theme.palette.getContrastText(theme.palette.background.drawer),
    },

    [`& .${classes.listInline}`]: {
        '& ul': {
            display: 'flex',
            flexDirection: 'row',
        },
    },

    [`& .${classes.drawerCommon}`]: {
        top: theme.spacing(8),
    },
}));

const GlobalNavBar = (props) => {
    const { open, setOpen } = props;

    const theme = useTheme();
    const drawerCommon = { class: classes.drawerCommon };
    const location = useLocation();

    let isRootPage = false;
    const { pathname } = location;
    if (/^\/(apis|api-products|scopes|policies|global-policies|service-catalog)($|\/$)/g.test(pathname)) {
        isRootPage = true;
    }
    useEffect(() => {
        if (!isRootPage) {
            setOpen(false);
        }
    }, [location, isRootPage]);
    const pathSegments = pathname && pathname.split('/');
    const [, currentPage] = pathSegments.length > 1 ? pathname.split('/') : ['', ''];
    return (
        <Root>
            <Drawer
                variant={isRootPage ? 'permanent' : 'temporary'}
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
                PaperProps={{ style: { backgroundColor: theme.palette.background.drawer, }}}
                SlideProps={drawerCommon}
                ModalProps={drawerCommon}
                BackdropProps={drawerCommon}
                open={open}
            >
                <GlobalNavLinks selected={currentPage} />
            </Drawer>
        </Root>
    );
};

GlobalNavBar.propTypes = {
    open: PropTypes.bool.isRequired,
};

export default GlobalNavBar;
