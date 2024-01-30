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
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar as AvatarComponent } from '@mui/material';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Breadcrumbs from 'AppComponents/Base/Header/Breadcrumbs';

/**
 * Render header component
 * @param {JSON} props .
 * @returns {JSX} Header AppBar components.
 */
function Header(props) {
    const { handleDrawerToggle, avatar } = props;

    return (
        <>
            <Toolbar sx={{ boxShadow: '0 -1px 0 #dddddd inset', height: 50 }}>
                <Grid container spacing={1} alignItems='center'>
                    <Hidden smUp>
                        <Grid item>
                            <IconButton
                                color='inherit'
                                aria-label='open drawer'
                                onClick={() => handleDrawerToggle()}
                                sx={{ ml: -1 }}
                                size='large'
                            >
                                <MenuIcon />
                            </IconButton>
                        </Grid>
                    </Hidden>
                    <Breadcrumbs />
                    <Grid item xs />
                    <Grid item>
                        {avatar}
                        {/* <IconButton color="inherit" className={classes.iconButtonAvatar}>
                <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
              </IconButton> */}
                    </Grid>
                </Grid>
            </Toolbar>
        </>
    );
}

Header.defaultProps = {
    avatar: <AvatarComponent />,
};

Header.propTypes = {
    user: PropTypes.shape({}).isRequired,
    handleDrawerToggle: PropTypes.func.isRequired,
    avatar: PropTypes.element,
};

export default (Header);
