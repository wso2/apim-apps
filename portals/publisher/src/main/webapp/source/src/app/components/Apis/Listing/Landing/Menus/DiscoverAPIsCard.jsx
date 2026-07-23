/* eslint-disable */
/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
import { Box, Button, Typography, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { app } from 'Settings';
import { isRestricted } from 'AppData/AuthManager';
import useMediaQuery from '@mui/material/useMediaQuery';
import ExploreIcon from '@mui/icons-material/Explore';

const DiscoverAPIsCard = () => {
    const theme = useTheme();    
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));

    return (
        <Paper
            square={false}
            elevation={4}
            sx={{
                width: isSmallScreen ? 250 : isMediumScreen ? 400 : 390,
                maxWidth: isSmallScreen ? 250 : isMediumScreen ? 400 : 390,
                height: isSmallScreen ? 140 : isMediumScreen ? 150 : 140, 
                display: 'flex',
                justifyContent: 'center', alignItems: 'center',
                transition: 'all 0.3s ease-in-out',
                padding: isSmallScreen ? 1 : 2,
                borderRadius: isSmallScreen ? 2 : 4,
            }}
        >
            <Box p={1} border={0} borderRadius={1}
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img
                    alt='Discover APIs'
                    src={`${app.context}/site/public/images/api/DiscoverAPI.svg`}
                    style={{ width: '90px', height: 'auto' }}
                />
                <Box p={2} border={0} borderRadius={2}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant='h6' sx={{ color: '#1a3c73', textAlign: 'center', mt: 2, maxWidth: 220, lineHeight: 1.2 }}>
                        <FormattedMessage
                            id='Apis.Listing.components.TopMenu.discover.apis.tooltip'
                            defaultMessage='Discover and import APIs from your third party gateways'
                        />
                    </Typography>
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_create', 'apim:api_manage'])}
                        to='/apis/discover'
                        sx={{ whiteSpace: 'nowrap', mt: 2 }}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.discover.apis.button'
                            defaultMessage='Discover APIs'
                        />
                        <ExploreIcon sx={{ ml: 1, fontSize: '1.1rem', color: '#B8CFE9' }} />
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default DiscoverAPIsCard;
