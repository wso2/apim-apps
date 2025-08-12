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
import MCPServer from 'AppData/MCPServer';
import { Progress } from 'AppComponents/Shared';
import ApisSection from './ApisSection';
import McpServersSection from './McpServersSection';
import TabButton from './TabButton';
import { PAGINATION_CONFIG } from './utils';

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
    const [mcpServers, setMcpServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const { noDataIcon } = theme.custom.landingPage.icons;

    // Pagination state
    const [apisPage, setApisPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
    const [apisTotalCount, setApisTotalCount] = useState(0);
    const [mcpServersPage, setMcpServersPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
    const [mcpServersTotalCount, setMcpServersTotalCount] = useState(0);
    const pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;

    // Fetch APIs data
    const fetchApis = useCallback(async (page = apisPage) => {
        try {
            const offset = (page - 1) * pageSize;
            const response = await API.all({ limit: pageSize, offset });
            
            if (response.body) {
                setApis(response.body.list || []);
                setApisTotalCount(response.body.pagination?.total || response.body.count || 0);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch APIs:', err);
        }
    }, [apisPage, pageSize]);

    // Fetch MCP Servers data
    const fetchMcpServers = useCallback(async (page = mcpServersPage) => {
        try {
            const offset = (page - 1) * pageSize;
            const response = await MCPServer.all({ limit: pageSize, offset });
            
            if (response.body) {
                setMcpServers(response.body.list || []);
                setMcpServersTotalCount(response.body.pagination?.total || response.body.count || 0);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch MCP Servers:', err);
        }
    }, [mcpServersPage, pageSize]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both APIs and MCP Servers concurrently
                await Promise.allSettled([
                    fetchApis(apisPage),
                    fetchMcpServers(mcpServersPage)
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
    }, [fetchApis, fetchMcpServers, apisPage, mcpServersPage]);

    // Pagination handlers
    const handleApisPageChange = useCallback((page) => {
        setApisPage(page);
        fetchApis(page);
    }, [fetchApis]);

    const handleMcpServersPageChange = useCallback((page) => {
        setMcpServersPage(page);
        fetchMcpServers(page);
    }, [fetchMcpServers]);

    // Delete handlers
    const handleApiDelete = useCallback((deletedId) => {
        // Remove the deleted API from the current list
        setApis(prevApis => prevApis.filter(api => api.id !== deletedId));
        // Update total count
        setApisTotalCount(prevCount => Math.max(0, prevCount - 1));
        
        // If current page becomes empty and it's not the first page, go to previous page
        const currentApisCount = apis.length;
        if (currentApisCount === 1 && apisPage > 1) {
            const newPage = apisPage - 1;
            setApisPage(newPage);
            fetchApis(newPage);
        } else if (currentApisCount === 1) {
            // If it's the first page and becomes empty, refetch to get updated data
            fetchApis(apisPage);
        }
    }, [apis.length, apisPage, fetchApis]);

    const handleMcpServerDelete = useCallback((deletedId) => {
        // Remove the deleted MCP Server from the current list
        setMcpServers(prevServers => prevServers.filter(server => server.id !== deletedId));
        // Update total count
        setMcpServersTotalCount(prevCount => Math.max(0, prevCount - 1));
        
        // If current page becomes empty and it's not the first page, go to previous page
        const currentServersCount = mcpServers.length;
        if (currentServersCount === 1 && mcpServersPage > 1) {
            const newPage = mcpServersPage - 1;
            setMcpServersPage(newPage);
            fetchMcpServers(newPage);
        } else if (currentServersCount === 1) {
            // If it's the first page and becomes empty, refetch to get updated data
            fetchMcpServers(mcpServersPage);
        }
    }, [mcpServers.length, mcpServersPage, fetchMcpServers]);

    // Check if we have any data to display
    const hasData = apisTotalCount > 0 || mcpServersTotalCount > 0;

    // Render loading state
    if (loading) {
        return (
            <Root>
                <Box display='flex' justifyContent='center' alignItems='center' height='400px'>
                    <Progress per={80} message='Loading APIs and MCP Servers...' />
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
                        <Typography variant='body1' color='textSecondary' mt={1}>
                            <FormattedMessage
                                id='Publisher.Landing.description'
                                defaultMessage='Let’s get started!'
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
                                currentPage={apisPage}
                                pageSize={pageSize}
                                onPageChange={handleApisPageChange}
                                onDelete={handleApiDelete}
                            />
                            <McpServersSection 
                                data={mcpServers} 
                                noDataIcon={noDataIcon}
                                totalCount={mcpServersTotalCount}
                                currentPage={mcpServersPage}
                                pageSize={pageSize}
                                onPageChange={handleMcpServersPageChange}
                                onDelete={handleMcpServerDelete}
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
