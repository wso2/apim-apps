/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import { useTheme, Box, Grid, Typography, Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CustomIcon from 'AppComponents/Shared/CustomIcon';

const PREFIX = 'PublisherLanding';

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled('div')(({ theme }) => ({
    '&': {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
    },
}));

// Custom styled Button for tab navigation
const TabButton = styled(Button)(({ theme, isActive }) => ({
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: theme.spacing(2),
    height: '100%',
    border: isActive === true ? `1px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.30)',
    backgroundColor: isActive === true ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    color: isActive === true ? 
        theme.palette.getContrastText(theme.custom.globalNavBar.active) : 
        theme.palette.text.primary,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
}));

/**
 * Publisher Portal Landing Page Component.
 * @returns {JSX.Element} Landing page to render
 */
const PublisherLanding = () => {
    const [selectedType, setSelectedType] = useState('apis');
    const theme = useTheme();

    const creationTypes = [
        {
            value: 'APIs',
            name: 'APIs',
            description: 'Expose APIs',
            icon: 'apis',
        },
        {
            value: 'MCP Servers',
            name: 'MCP Servers',
            description: 'Expose MCP Servers',
            icon: 'mcp-servers',
        },
    ]

    return (
        <Root>
            <Box display='flex' flexDirection='column' flexGrow={1} pt={3}>
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} alignItems='center' display='flex' flexDirection='column'>
                        <Typography variant='h4' component='h1'>    
                            <FormattedMessage
                                id='Publisher.Landing.title'
                                defaultMessage='Welcome to the Publisher Portal!'
                            />
                        </Typography>
                        <Typography variant='body1' color='textSecondary' mt={1}>
                            <FormattedMessage
                                id='Publisher.Landing.description'
                                defaultMessage='Manage APIs and MCP Servers — From Design to Deployment'
                            />
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container mb={3} px={34}>
                    <Grid container spacing={2}>
                        {creationTypes.map((type) => {
                            const isActive = selectedType === type.value.toLowerCase() || 
                                            (type.value === 'APIs' && selectedType === 'apis') ||
                                            (type.value === 'MCP Servers' && selectedType === 'mcp-servers');
                            return (
                                <Grid item xs={12} sm={6} key={type.value}>
                                    <TabButton
                                        startIcon={
                                            <CustomIcon
                                                width={32}
                                                height={32}
                                                icon={type.icon}
                                                strokeColor={isActive ? 
                                                    theme.palette.getContrastText(theme.custom.globalNavBar.active) : 
                                                    theme.palette.text.primary}
                                            />
                                        }
                                        fullWidth
                                        disableRipple
                                        variant='outlined'
                                        onClick={() => setSelectedType(type.value === 'APIs' ? 'apis' : 'mcp-servers')}
                                        data-testid={`create-${type.value.toLowerCase()}-button`}
                                        isActive={!!isActive}
                                    >
                                        <Box display='flex' flexDirection='column' alignItems='flex-start' pl={2}>
                                            <Typography 
                                                variant='h6'
                                                color='text.primary'
                                            >
                                                {type.name}
                                            </Typography>
                                            <Typography 
                                                variant='body1'
                                                color='text.secondary'
                                            >
                                                {type.description}
                                            </Typography>
                                        </Box>
                                    </TabButton>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {selectedType === 'apis' && <APILanding />}
                        {selectedType === 'mcp-servers' && <MCPServerLanding />}
                    </Grid>
                </Grid>
            </Box>
        </Root>
    );
};

export default PublisherLanding;
