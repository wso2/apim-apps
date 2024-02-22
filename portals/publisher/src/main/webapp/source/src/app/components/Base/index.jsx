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
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Footer from 'AppComponents/Base/Footer/Footer';
import Header from 'AppComponents/Base/Header';
import { Toaster } from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import defaultTheme from 'AppData/defaultTheme';
import userThemes from 'userCustomThemes';

const PREFIX = 'Base';

const classes = {
    wrapper: `${PREFIX}-wrapper`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    contentRoot: `${PREFIX}-contentRoot`,
    drawerHeader: `${PREFIX}-drawerHeader`
};


const Root = styled('div')(({ theme }) => ({
    [`& .${classes.wrapper}`]: {
        display: 'flex',
        background: theme.custom.wrapperBackground,
    },

    [`& .${classes.contentWrapper}`]: {
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },

    [`& .${classes.contentRoot}`]: {
        minHeight: `calc(100vh - ${64 + theme.custom.footer.height}px)`, // 64 coming from default MUI appbar height
    },

    [`& .${classes.drawerHeader}`]: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
        minHeight: theme.spacing(8),
    },

    [`.GlobalNavBar-drawer > .MuiDrawer-paper`]: {
        backgroundColor: theme.palette.background.drawer,
    }
}));

/**
 * Base Component for the publisher app
 * Adding a padding to Base container to avoid overlapping content with the Header AppBar
 * Following padding top values are based on material UI AppBar height parameters as described in here:
 * https://github.com/mui-org/material-ui/issues/10076#issuecomment-361232810
 * @class Layout
 * @extends {React.Component}
 */
const Base = ({ children, user }) => {

    const theme = useTheme();

    function getTitle() {
        let prefix;
        let suffix;
        if (userThemes.custom && userThemes.custom.title) {
            prefix = userThemes.custom.title.prefix;
            suffix = userThemes.custom.title.suffix;
        } else {
            prefix = defaultTheme.custom.title.prefix;
            suffix = defaultTheme.custom.title.suffix;
        }
        return (prefix + suffix);
    }

    return (
        (<Root>
            {/* <CssBaseline /> */}
            <Helmet>
                <title>{getTitle()}</title>
            </Helmet>
            <Toaster
                position='bottom-right'
                gutter={8}
                toastOptions={{
                    style: {
                        background: '#008fccC8',
                        color: '#ffffff',
                        fontFamily: theme.typography.fontFamily,
                        fontSize: "13px",
                    },
                    success: {
                        style: {
                            backgroundColor: '#4caf50C8',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            fontSize: "13px",
                        },
                        iconTheme: {
                            primary: '#ffffffC8',
                            secondary: '#4caf50C8',
                        },
                    },
                    error: {
                        style: {
                            backgroundColor: '#BD0808BE',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            fontSize: "13px"
                        },
                        iconTheme: {
                            primary: '#ffffffBE',
                            secondary: '#BD0808BE',
                        },
                    },
                    custom: {
                        style: { backgroundColor: '#DDEFFFC8' },
                    },
                }}
            />
            <div className={classes.wrapper}>
                <Header user={user} />
                <main className={classes.contentWrapper}>
                    <div className={classes.drawerHeader} />
                    <div className={classes.contentRoot}>
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </Root>)
    );
};

Base.propTypes = {
    children: PropTypes.element.isRequired,
    user: PropTypes.shape({}).isRequired,
};

export default Base;
