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
import { styled } from '@mui/material/styles';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import { useTheme, Box, Grid, Typography, Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CustomIcon from 'AppComponents/Shared/CustomIcon';

const PREFIX = 'PublisherLanding';

const classes = {
    root: `${PREFIX}-root`,
    buttonActive: `${PREFIX}-buttonActive`,
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
    [`& .${classes.buttonActive}`]: {
        backgroundColor: theme.custom.globalNavBar.active,
        color: theme.palette.getContrastText(theme.custom.globalNavBar.active),
    },
}));

/**
 * Publisher Portal Landing Page Component.
 * @returns {JSX.Element} Landing page to render
 */
const PublisherLanding = () => {
    const [selectedType, setSelectedType] = useState('api');
    // const intl = useIntl();
    const theme = useTheme();

    const creationTypes = [
        {
            value: 'API',
            name: 'API',
            description: 'Create a new API',
            icon: 'apis',
        },
        {
            value: 'MCP Server',
            name: 'MCP Server',
            description: 'Create a new MCP Server',
            icon: 'mcp-servers',
        },
    ]

    return (
        <Root>
            <Box display='flex' flexDirection='column' flexGrow={1} pt={6}>
                <Grid container spacing={2} mb={4}>
                    <Grid item xs={12} alignItems='center'>
                        <Typography variant='h4' component='h1'>    
                            <FormattedMessage
                                id='Publisher.Landing.title'
                                defaultMessage='Welcome to the Publisher Portal'
                            />
                        </Typography>
                        <Typography variant='body1' color='textSecondary' mt={1}>
                            <FormattedMessage
                                id='Publisher.Landing.description'
                                defaultMessage='Create, Secure, and Publish with WSO2!'
                            />
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={2} mb={6}>
                    {creationTypes.map((type) => (
                        <Grid item xs={12} sm={6} key={type.value}>
                            <Button
                                startIcon={
                                    <CustomIcon
                                        width={28}
                                        height={28}
                                        icon={type.icon}
                                        strokeColor={theme.palette.getContrastText(theme.custom.globalNavBar.active)}
                                    />
                                }
                                fullWidth
                                disableRipple
                                variant='outlined'
                                onClick={() => setSelectedType(type.value === 'API' ? 'api' : 'mcp-server')}
                                data-testid={`create-${type.value.toLowerCase()}-button`}
                                active={selectedType === type.value.toLowerCase()}
                            >
                                <Box display='flex' flexDirection='column' alignItems='flex-start' pl={2}>
                                    <Typography variant='h6'>{type.name}</Typography>
                                    <Typography variant='body2' color='textSecondary'>
                                        {type.description}
                                    </Typography>
                                </Box>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {selectedType === 'api' && <APILanding />}
                        {selectedType === 'mcp-server' && <MCPServerLanding />}
                    </Grid>
                </Grid>
            </Box>
        </Root>
    );
};

export default PublisherLanding;
