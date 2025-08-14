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

import React, { useState, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import {
    useTheme,
    Box,
    Grid,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import API from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import MCPServer from 'AppData/MCPServer';
import { Progress } from 'AppComponents/Shared';
import ApisSection from './ApisSection';
import APIProductSection from './APIProductSection';
import McpServersSection from './McpServersSection';
import TabButton from './TabButton';

const PREFIX = 'PublisherLanding';

const classes = {
    root: `${PREFIX}-root`,
    tableContainer: `${PREFIX}-tableContainer`,
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
    [`& .${classes.tableContainer}`]: {
        overflowX: 'auto',
        maxWidth: '100%',
    },
}));

/**
 * Publisher Portal Landing Page Component.
 * @returns {JSX.Element} Landing page to render
 */
const PublisherLanding = () => {
    const [selectedType, setSelectedType] = useState('api');
    const [apis, setApis] = useState([]);
    const [apiProducts, setApiProducts] = useState([]);
    const [mcpServers, setMcpServers] = useState([]);
    const [apisTotalCount, setApisTotalCount] = useState(0);
    const [apiProductsTotalCount, setApiProductsTotalCount] = useState(0);
    const [mcpServersTotalCount, setMcpServersTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const { noDataIcon } = theme.custom.landingPage.icons;

    // Fixed page size for displaying first 5 entries
    const pageSize = 5;

    // Fetch APIs data
    const fetchApis = useCallback(async () => {
        try {
            const response = await API.all({ limit: pageSize, offset: 0 });
            
            if (response.body) {
                setApis(response.body.list || []);
                setApisTotalCount(response.body.pagination?.total || response.body.count || 0);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch APIs:', err);
        }
    }, [pageSize]);

    // Fetch API Products data
    const fetchApiProducts = useCallback(async () => {
        try {
            const response = await APIProduct.all({ limit: pageSize, offset: 0 });
            
            if (response.body) {
                setApiProducts(response.body.list || []);
                setApiProductsTotalCount(response.body.pagination?.total || response.body.count || 0);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch API Products:', err);
        }
    }, [pageSize]);

    // Fetch MCP Servers data
    const fetchMcpServers = useCallback(async () => {
        try {
            const response = await MCPServer.all({ limit: pageSize, offset: 0 });
            
            if (response.body) {
                setMcpServers(response.body.list || []);
                setMcpServersTotalCount(response.body.pagination?.total || response.body.count || 0);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch MCP Servers:', err);
        }
    }, [pageSize]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch APIs, API Products, and MCP Servers concurrently
                await Promise.allSettled([
                    fetchApis(),
                    fetchApiProducts(),
                    fetchMcpServers()
                ]);

            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchApis, fetchApiProducts, fetchMcpServers]);

    // Delete handlers
    const handleApiDelete = useCallback((deletedId) => {
        // Remove the deleted API from the current list
        setApis(prevApis => prevApis.filter(api => api.id !== deletedId));
    }, []);

    const handleApiProductDelete = useCallback((deletedId) => {
        // Remove the deleted API Product from the current list
        setApiProducts(prevProducts => prevProducts.filter(product => product.id !== deletedId));
    }, []);

    const handleMcpServerDelete = useCallback((deletedId) => {
        // Remove the deleted MCP Server from the current list
        setMcpServers(prevServers => prevServers.filter(server => server.id !== deletedId));
    }, []);

    // Check if we have any data to display
    const hasData = apisTotalCount > 0 || apiProductsTotalCount > 0 || mcpServersTotalCount > 0;

    // Render loading state
    if (loading) {
        return (
            <Root>
                <Box display='flex' justifyContent='center' alignItems='center' height='400px'>
                    <Progress per={80} message='Loading app...' />
                </Box>
            </Root>
        );
    }

    // Render error state
    if (error) {
        return (
            <Root>
                <Box textAlign='center' p={4}>
                    <Typography variant='h6' color='error' gutterBottom>
                        <FormattedMessage
                            id='Publisher.Landing.error.title'
                            defaultMessage='Error Loading Data'
                        />
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                        {error}
                    </Typography>
                </Box>
            </Root>
        );
    }

    const creationTypes = [
        {
            value: 'API',
            name: 'API',
            description: 'Expose your APIs',
            icon: 'apis',
        },
        {
            value: 'MCP Server',
            name: 'MCP Server',
            description: 'Expose your APIs as MCP Servers or manage external MCP Servers',
            icon: 'mcp-servers',
        },
    ];

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
                    </Grid>
                </Grid>

                {hasData ? (
                    // Show dynamic tables if we have data
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <ApisSection 
                                data={apis} 
                                noDataIcon={noDataIcon}
                                totalCount={apisTotalCount}
                                onDelete={handleApiDelete}
                            />
                            <McpServersSection 
                                data={mcpServers} 
                                noDataIcon={noDataIcon}
                                totalCount={mcpServersTotalCount}
                                onDelete={handleMcpServerDelete}
                            />
                            <APIProductSection 
                                data={apiProducts} 
                                noDataIcon={noDataIcon}
                                totalCount={apiProductsTotalCount}
                                onDelete={handleApiProductDelete}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    // Show static creation UI if no data
                    <>
                        <Grid container mb={3} pl={13} pr={16}>
                            <Grid container spacing={2}>
                                {creationTypes.map((type) => {
                                    const isActive = selectedType === type.value.toLowerCase() ||
                                        (type.value === 'API' && selectedType === 'api') ||
                                        (type.value === 'MCP Server' && selectedType === 'mcp-server');
                                    return (
                                        <Grid item xs={12} sm={6} key={type.value}>
                                            <TabButton
                                                startIcon={
                                                    <CustomIcon
                                                        width={32}
                                                        height={32}
                                                        icon={type.icon}
                                                        strokeColor={isActive ?
                                                            theme.palette.getContrastText(
                                                                theme.custom.globalNavBar.active
                                                            ) :
                                                            theme.palette.text.primary}
                                                    />
                                                }
                                                fullWidth
                                                disableRipple
                                                variant='outlined'
                                                onClick={() => setSelectedType(
                                                    type.value === 'API' ? 'api' : 'mcp-server'
                                                )}
                                                data-testid={`create-${type.value.toLowerCase()}-button`}
                                                isActive={!!isActive}
                                            >
                                                <Box
                                                    display='flex'
                                                    flexDirection='column'
                                                    alignItems='flex-start'
                                                    pl={2}
                                                >
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
                                {selectedType === 'api' && <APILanding />}
                                {selectedType === 'mcp-server' && <MCPServerLanding />}
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </Root>
    );
};

export default PublisherLanding;
