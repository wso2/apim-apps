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
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import { useTheme, Box, Grid, Typography, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormattedMessage } from 'react-intl';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import API from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import MCPServer from 'AppData/MCPServer';
import { Progress } from 'AppComponents/Shared';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { app } from 'Settings';
import ApisSection from './ApisSection';
import APIProductSection from './APIProductSection';
import McpServersSection from './McpServersSection';
import TabButton from './TabButton';

const PREFIX = 'PublisherLanding';

const classes = {
    summaryCard: `${PREFIX}-summaryCard`,
    summaryCardContent: `${PREFIX}-summaryCardContent`,
    summaryIcon: `${PREFIX}-summaryIcon`,
    summaryCount: `${PREFIX}-summaryCount`,
    summaryTitle: `${PREFIX}-summaryTitle`,
    summaryArrow: `${PREFIX}-summaryArrow`,
    summarySection: `${PREFIX}-summarySection`,
    summaryContainer: `${PREFIX}-summaryContainer`,
    summaryItem: `${PREFIX}-summaryItem`,
    verticalDivider: `${PREFIX}-verticalDivider`,
};

const Root = styled('div')(({ theme }) => ({
    '&': {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginLeft: theme.spacing(8),
        marginRight: theme.spacing(8),
        marginTop: theme.spacing(3),
    },
    [`& .${classes.summaryCard}`]: {
        borderRadius: theme.spacing(1),
        width: '100%',
    },
    [`& .${classes.summaryCardContent}`]: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(2),
        position: 'relative',
        '&:last-child': {
            paddingBottom: theme.spacing(2),
        },
    },
    [`& .${classes.summaryIcon}`]: {
        marginRight: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.action.hover,
    },
    [`& .${classes.summaryCount}`]: {
        fontSize: '2.25rem',
        fontWeight: 'bold',
        lineHeight: 1,
    },
    [`& .${classes.summaryTitle}`]: {
        color: theme.palette.text.secondary,
        fontSize: '0.875rem',
        alignSelf: 'end',
    },
    [`& .${classes.summaryArrow}`]: {
        color: theme.palette.action.active,
        border: `1px solid ${theme.palette.divider}`,
        width: 28,
        height: 28,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '& .MuiSvgIcon-root': {
            fontSize: '0.875rem',
        },
    },
    [`& .${classes.summarySection}`]: {
        marginBottom: theme.spacing(4),
    },
    [`& .${classes.summaryContainer}`]: {
        borderRadius: theme.spacing(1),
        backgroundColor: '#F7F8FB',
        display: 'flex',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
    },
    [`& .${classes.summaryItem}`]: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        padding: theme.spacing(3),
        position: 'relative',
    },
    [`& .${classes.verticalDivider}`]: {
        width: '1px',
        backgroundColor: theme.palette.divider,
        margin: theme.spacing(2, 0),
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
    const { bgImages } = theme.custom.landingPage.summarySection;
    const { data: settings } = usePublisherSettings();
    const isMCPSupportEnabled = settings && settings.isMCPSupportEnabled;

    // Fixed page size for displaying first 5 entries
    const pageSize = 5;

    // Summary Item Component (uses background images instead of CustomIcon)
    const SummaryItem = ({ imageSrc, title, count, linkTo, backgroundPosition = 'left bottom' }) => {
        return (
            <Box
                className={classes.summaryItem}
                sx={{
                    justifyContent: 'center',
                    ...(imageSrc
                        ? {
                            backgroundImage: `url(${app.context}${imageSrc})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition,
                            backgroundSize: 'auto 95%',
                        }
                        : {}),
                }}
            >
                <Box display='flex' flexDirection='row' justifyContent='center' gap={1}>
                    <Typography variant='h4' className={classes.summaryCount}>
                        {count}
                    </Typography>
                    <Typography className={classes.summaryTitle}>{title}</Typography>
                    <Link to={linkTo} style={{ textDecoration: 'none', alignSelf: 'end' }} tabIndex={-1}>
                        <IconButton className={classes.summaryArrow} size='small'>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </Link>
                </Box>
            </Box>
        );
    };

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
        if (!isMCPSupportEnabled) {
            setMcpServers([]);
            setMcpServersTotalCount(0);
            return;
        }

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
    }, [pageSize, isMCPSupportEnabled]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch APIs, API Products, and MCP Servers concurrently
                await Promise.allSettled([fetchApis(), fetchApiProducts(), fetchMcpServers()]);
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

    // Fetch only the list without updating the count (used after deletion)
    const fetchApisListOnly = useCallback(async () => {
        try {
            const response = await API.all({ limit: pageSize, offset: 0 });
            if (response.body) {
                setApis(response.body.list || []);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch APIs:', err);
        }
    }, [pageSize]);

    const fetchApiProductsListOnly = useCallback(async () => {
        try {
            const response = await APIProduct.all({ limit: pageSize, offset: 0 });
            if (response.body) {
                const newList = response.body.list || [];
                setApiProducts(newList);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch API Products:', err);
        }
    }, [pageSize]);

    const fetchMcpServersListOnly = useCallback(async () => {
        if (!isMCPSupportEnabled) {
            setMcpServers([]);
            return;
        }
        try {
            const response = await MCPServer.all({ limit: pageSize, offset: 0 });
            if (response.body) {
                const newList = response.body.list || [];
                setMcpServers(newList);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch MCP Servers:', err);
        }
    }, [pageSize, isMCPSupportEnabled]);

    // Delete handlers
    const handleApiDelete = useCallback((deletedId) => {
        // Remove the deleted API from the current list
        setApis((prevApis) => {
            const filtered = prevApis.filter((api) => api.id !== deletedId);
            return filtered;
        });

        setApisTotalCount((prevCount) => {
            const newCount = Math.max(0, prevCount - 1);
            // Always fetch new data after deletion to ensure we display the maximum number of APIs
            // This prevents the scenario where we show only 4 APIs when there are more than 5 in the system
            setTimeout(() => {
                fetchApisListOnly();
            }, 1000);
            return newCount;
        });
    }, [fetchApisListOnly]);

    const handleApiProductDelete = useCallback((deletedId) => {
        // Remove the deleted API Product from the current list
        setApiProducts((prevProducts) => {
            const filtered = prevProducts.filter((product) => product.id !== deletedId);
            return filtered;
        });

        setApiProductsTotalCount((prevCount) => {
            const newCount = Math.max(0, prevCount - 1);
            // Always fetch new data after deletion to ensure we display the maximum number of API Products
            setTimeout(() => {
                fetchApiProductsListOnly();
            }, 1000);
            return newCount;
        });
    }, [fetchApiProductsListOnly]);

    const handleMcpServerDelete = useCallback((deletedId) => {
        // Remove the deleted MCP Server from the current list
        setMcpServers((prevServers) => {
            const filtered = prevServers.filter((server) => server.id !== deletedId);
            return filtered;
        });

        setMcpServersTotalCount((prevCount) => {
            const newCount = Math.max(0, prevCount - 1);
            // Always fetch new data after deletion to ensure we display the maximum number of MCP Servers
            setTimeout(() => {
                fetchMcpServersListOnly();
            }, 1000);
            return newCount;
        });
    }, [fetchMcpServersListOnly]);

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
                        <FormattedMessage id='Publisher.Landing.error.title' defaultMessage='Error Loading Data' />
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
        ...(isMCPSupportEnabled
            ? [
                {
                    value: 'MCP Server',
                    name: 'MCP Server',
                    description: 'Expose your APIs as MCP Servers or manage external MCP Servers',
                    icon: 'mcp-servers',
                },
            ]
            : []),
    ];

    return (
        <Root>
            {!hasData && (
                <Grid container spacing={2} padding={2}>
                    <Grid item xs={12} alignItems='center' display='flex' flexDirection='column'>
                        <Typography variant='h4' component='h1'>
                            <FormattedMessage
                                id='Publisher.Landing.title'
                                defaultMessage='Welcome to the {portal}!'
                                values={{
                                    portal: <span style={{ fontWeight: '600' }}>Publisher Portal</span>,
                                }}
                            />
                        </Typography>
                        {!hasData && (
                            <Typography variant='body1' color='textSecondary' mt={1}>
                                <FormattedMessage
                                    id='Publisher.Landing.description'
                                    defaultMessage="Let's get started!"
                                />
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            )}

            {hasData ? (
                // Show dynamic tables if we have data
                <Grid container padding={2}>
                    <Grid item xs={12} className={classes.summarySection}>
                        <Box className={classes.summaryContainer}>
                            <SummaryItem
                                imageSrc={bgImages.apis}
                                title={<FormattedMessage id='Publisher.Landing.summary.apis' defaultMessage='APIs' />}
                                count={apisTotalCount}
                                linkTo='/apis'
                            />
                            {isMCPSupportEnabled > 0 && <Box className={classes.verticalDivider} />}
                            {isMCPSupportEnabled && (
                                <>
                                    <SummaryItem
                                        imageSrc={bgImages.mcps}
                                        title={
                                            <FormattedMessage
                                                id='Publisher.Landing.summary.mcpServers'
                                                defaultMessage='MCP Servers'
                                            />
                                        }
                                        count={mcpServersTotalCount}
                                        linkTo='/mcp-servers'
                                        backgroundPosition='32px bottom'
                                    />
                                    <Box className={classes.verticalDivider} />
                                </>
                            )}
                            <SummaryItem
                                imageSrc={bgImages.apiProducts}
                                title={
                                    <FormattedMessage
                                        id='Publisher.Landing.summary.apiProducts'
                                        defaultMessage='API Products'
                                    />
                                }
                                count={apiProductsTotalCount}
                                linkTo='/api-products'
                                backgroundPosition='32px bottom'
                            />
                        </Box>
                    </Grid>

                    {/* Data Tables */}
                    <Grid item xs={12}>
                        {(() => {
                            // Determine the order of sections based on data availability
                            const sections = [];

                            // Default order: APIs, MCPs, Products
                            // But adjust based on availability:
                            // - If MCPs empty while products not empty, MCP goes to bottom
                            // - If APIs empty while MCPs not empty, MCP comes to top

                            const hasApis = apisTotalCount > 0;
                            const hasMcps = mcpServersTotalCount > 0 && isMCPSupportEnabled;
                            const hasProducts = apiProductsTotalCount > 0;

                            if (!hasApis && hasMcps) {
                                // APIs empty, MCPs not empty - MCP comes to top
                                sections.push(
                                    <McpServersSection
                                        key='mcp-servers'
                                        data={mcpServers}
                                        totalCount={mcpServersTotalCount}
                                        onDelete={handleMcpServerDelete}
                                    />
                                );
                                sections.push(
                                    <ApisSection
                                        key='apis'
                                        data={apis}
                                        noDataIcon={noDataIcon}
                                        totalCount={apisTotalCount}
                                        onDelete={handleApiDelete}
                                    />
                                );
                                sections.push(
                                    <APIProductSection
                                        key='api-products'
                                        data={apiProducts}
                                        totalCount={apiProductsTotalCount}
                                        onDelete={handleApiProductDelete}
                                    />
                                );
                            } else if (!hasMcps && hasProducts) {
                                // MCPs empty, products not empty - MCP goes to bottom
                                sections.push(
                                    <ApisSection
                                        key='apis'
                                        data={apis}
                                        noDataIcon={noDataIcon}
                                        totalCount={apisTotalCount}
                                        onDelete={handleApiDelete}
                                    />
                                );
                                sections.push(
                                    <APIProductSection
                                        key='api-products'
                                        data={apiProducts}
                                        totalCount={apiProductsTotalCount}
                                        onDelete={handleApiProductDelete}
                                    />
                                );
                                if (isMCPSupportEnabled) {
                                    sections.push(
                                        <McpServersSection
                                            key='mcp-servers'
                                            data={mcpServers}
                                            totalCount={mcpServersTotalCount}
                                            onDelete={handleMcpServerDelete}
                                        />
                                    );
                                }
                            } else {
                                // Default order: APIs, MCPs, Products
                                sections.push(
                                    <ApisSection
                                        key='apis'
                                        data={apis}
                                        noDataIcon={noDataIcon}
                                        totalCount={apisTotalCount}
                                        onDelete={handleApiDelete}
                                    />
                                );
                                if (isMCPSupportEnabled) {
                                    sections.push(
                                        <McpServersSection
                                            key='mcp-servers'
                                            data={mcpServers}
                                            totalCount={mcpServersTotalCount}
                                            onDelete={handleMcpServerDelete}
                                        />
                                    );
                                }
                                sections.push(
                                    <APIProductSection
                                        key='api-products'
                                        data={apiProducts}
                                        totalCount={apiProductsTotalCount}
                                        onDelete={handleApiProductDelete}
                                    />
                                );
                            }

                            return sections;
                        })()}
                    </Grid>
                </Grid>
            ) : (
                // Show static creation UI if no data
                <>
                    {isMCPSupportEnabled ? (
                        <>
                            <Grid container mb={3} pl={13} pr={16}>
                                <Grid container spacing={2}>
                                    {creationTypes.map((type) => {
                                        const isActive =
                                            selectedType === type.value.toLowerCase() ||
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
                                                            strokeColor={
                                                                isActive
                                                                    ? theme.palette.getContrastText(
                                                                        theme.custom.globalNavBar.active
                                                                    )
                                                                    : theme.palette.text.primary
                                                            }
                                                        />
                                                    }
                                                    fullWidth
                                                    disableRipple
                                                    variant='outlined'
                                                    onClick={() =>
                                                        setSelectedType(type.value === 'API' ? 'api' : 'mcp-server')
                                                    }
                                                    data-testid={`create-${type.value.toLowerCase()}-button`}
                                                    isActive={!!isActive}
                                                >
                                                    <Box
                                                        display='flex'
                                                        flexDirection='column'
                                                        alignItems='flex-start'
                                                        pl={2}
                                                    >
                                                        <Typography variant='h6' color='text.primary'>
                                                            {type.name}
                                                        </Typography>
                                                        <Typography variant='body1' color='text.secondary'>
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
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <APILanding />
                            </Grid>
                        </Grid>
                    )}
                </>
            )}
        </Root>
    );
};

export default PublisherLanding;
