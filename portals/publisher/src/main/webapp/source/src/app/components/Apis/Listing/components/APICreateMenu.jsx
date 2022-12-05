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
import { makeStyles } from '@mui/styles';
import {
    useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import AuthManager from 'AppData/AuthManager';
import RestAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/RestAPIMenu';
import SoapAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/SoapAPIMenu';
import GraphqlAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/GraphqlAPIMenu';
import StreamingAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/StreamingAPIMenu';
import ServiceCatalogMenu from 'AppComponents/Apis/Listing/Landing/Menus/ServiceCatalogMenu';
import MenuButton from 'AppComponents/Shared/MenuButton';

const useStyles = makeStyles((theme) => {
    return {
        dividerCls: {
            height: '180px',
            position: 'absolute',
            top: '50%',
            '-ms-transform': 'translateY(-50%)',
            transform: 'translateY(-50%)',
            margin: 'auto',
        },
        popover: {
            [theme.breakpoints.down('md')]: {
                width: '95vw',
            },
            [theme.breakpoints.up('md')]: {
                width: '85vw',
            },
            [theme.breakpoints.up('lg')]: {
                width: '65vw',
            },
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
    };
});

const APICreateMenu = () => {
    const theme = useTheme();
    const { dividerCls, popover } = useStyles();
    const {
        graphqlIcon,
        restApiIcon,
        soapApiIcon,
        streamingApiIcon,
    } = theme.custom.landingPage.icons;
    return !AuthManager.isNotCreator() && (
        <MenuButton
            buttonProps={{
                id: 'itest-create-api-menu-button',
                color: 'primary',
                variant: 'contained',
                'aria-label': 'View create API options',
            }}
            menuList={(
                <Grid
                    className={popover}
                    container
                    direction='row'
                    justifyContent='space-around'
                    alignItems='flex-start'
                    spacing={2}
                >
                    <RestAPIMenu isCreateMenu icon={restApiIcon} />
                    <SoapAPIMenu isCreateMenu icon={soapApiIcon} />
                    <GraphqlAPIMenu isCreateMenu icon={graphqlIcon} />
                    <StreamingAPIMenu isCreateMenu icon={streamingApiIcon} />
                    <Box display={{ xs: 'none', md: 'block' }} mx={2}>
                        <Divider className={dividerCls} light orientation='vertical' variant='inset' />
                    </Box>
                    <ServiceCatalogMenu isCreateMenu icon={streamingApiIcon} />
                </Grid>
            )}
        >
            Create API
        </MenuButton>
    );
};
export default APICreateMenu;
