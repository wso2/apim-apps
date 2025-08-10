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
import { styled, alpha } from '@mui/material/styles';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import { Link, useHistory } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import {
    useTheme,
    Box,
    Grid,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination
} from '@mui/material';
import Utils from 'AppData/Utils';
import { FormattedMessage } from 'react-intl';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import AddIcon from '@mui/icons-material/Add';
import Configurations from 'Config';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import moment from 'moment';
import { Progress } from 'AppComponents/Shared';
import { isRestricted } from 'AppData/AuthManager';
import PropTypes from 'prop-types';

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

// Custom styled Button for tab navigation
const TabButton = styled(Button)(({ theme, isActive }) => ({
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: theme.spacing(2),
    height: '100%',
    border: isActive === true ? `1px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.30)',
    borderRadius: '8px',
    backgroundColor: isActive === true ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    color: isActive === true ?
        theme.palette.getContrastText(theme.custom.globalNavBar.active) :
        theme.palette.text.primary,
    boxShadow: isActive === true ?
        `0px 2px 4px ${alpha(theme.palette.primary.main, 0.2)}` :
        'none',
    '&:hover': {
        backgroundColor: isActive === true ?
            alpha(theme.palette.primary.main, 0.12) :
            theme.palette.grey[200],
        borderColor: isActive === true ?
            theme.palette.primary.main :
            'rgba(0, 0, 0, 0.30)',
    },
}));

// Constants for pagination configuration

const ENTITY_TYPES = {
    APIS: 'apis',
    MCP_SERVERS: 'mcp-servers'
};

const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 5,
    DEFAULT_PAGE: 1
};

// Helper functions
const formatUpdatedTime = (updatedTime) => {
    if (!updatedTime) return 'N/A';
    return moment(parseInt(updatedTime, 10)).fromNow();
};

// Helper function to get detail path for navigation
const getDetailPath = (type, id) => {
    return type === ENTITY_TYPES.APIS ? `/apis/${id}/overview` : `/mcp-servers/${id}/overview`;
};

/**
 * Reusable DataTable Component for APIs and MCP Servers
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of items to display in the table
 * @param {string} props.type - Entity type (apis or mcp-servers)
 * @param {Function} props.onRowClick - Optional callback for row clicks
 * @param {number} props.totalCount - Total number of items
 * @param {number} props.currentPage - Current page number
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Callback for page changes
 * @returns {JSX.Element} DataTable component
 */
const DataTable = ({ data, type, onRowClick, totalCount, currentPage, pageSize, onPageChange }) => {
    const history = useHistory();

    const handleRowClick = useCallback((item) => {
        const path = getDetailPath(type, item.id);
        history.push(path);
        if (onRowClick) onRowClick(item);
    }, [type, history, onRowClick]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <Box>
            <TableContainer component={Paper} className={classes.TableContainer}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell width='20%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.name'
                                    defaultMessage='Name'
                                />
                            </TableCell>
                            <TableCell width='15%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.context'
                                    defaultMessage='Context'
                                />
                            </TableCell>
                            <TableCell width='12%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.version'
                                    defaultMessage='Version'
                                />
                            </TableCell>
                            <TableCell width='35%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.description'
                                    defaultMessage='Description'
                                />
                            </TableCell>
                            <TableCell width='18%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.lastUpdated'
                                    defaultMessage='Last Updated'
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow
                                key={item.id}
                                onClick={() => handleRowClick(item)}
                                style={{ cursor: 'pointer' }}
                                hover
                            >
                                <TableCell>
                                    <Box display='flex' alignItems='center'>
                                        <Avatar
                                            style={{
                                                backgroundColor: Utils.stringToColor(item.name),
                                            }}
                                        >
                                            {Utils.stringAvatar(item.name.toUpperCase())}
                                        </Avatar>
                                        <Typography variant='body2' fontWeight='medium' ml={1}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography 
                                        variant='body2'
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={item.context || '/'}
                                    >
                                        {item.context || '/'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body2'>
                                        {item.version}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography 
                                        variant='body2'
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '300px'
                                        }}
                                        title={item.description || 'No description available'}
                                    >
                                        {item.description || 'No description available'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body2' color='textSecondary'>
                                        {formatUpdatedTime(item.updatedTime)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {totalPages > 1 && (
                <Box display='flex' justifyContent='center' mt={2}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, page) => onPageChange(page)}
                        color='primary'
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );
};

DataTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        version: PropTypes.string,
        description: PropTypes.string,
        context: PropTypes.string,
        updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    type: PropTypes.string.isRequired,
    onRowClick: PropTypes.func,
    totalCount: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

DataTable.defaultProps = {
    onRowClick: null,
};

/**
 * APIs Section Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of APIs to display
 * @param {string} props.noDataIcon - Path to no data icon
 * @param {number} props.totalCount - Total number of APIs
 * @param {number} props.currentPage - Current page number
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Callback for page changes
 * @returns {JSX.Element} APIs section component
 */
const ApisSection = ({ data, noDataIcon, totalCount, currentPage, pageSize, onPageChange }) => {
    return (
        <Box mb={4} mx={4}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h4'>
                    <FormattedMessage
                        id='Publisher.Landing.apis.section.title'
                        defaultMessage='APIs'
                    />
                </Typography>
                {data.length > 0 && (
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/apis/create'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.button'
                            defaultMessage='Create API'
                        />
                    </Button>
                )}
            </Box>
            {data.length === 0 ? (
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                    <img
                        src={Configurations.app.context + noDataIcon}
                        alt='No APIs available'
                    />
                    <Typography variant='body1' color='textSecondary' mt={2} mb={3}>
                        <FormattedMessage
                            id='Publisher.Landing.no.apis.message'
                            defaultMessage='No APIs found. Create your first API to get started.'
                        />
                    </Typography>
                    <Button
                        variant='outlined'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/apis'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.button'
                            defaultMessage='Create API'
                        />
                    </Button>
                </Box>
            ) : (
                <DataTable 
                    data={data} 
                    type={ENTITY_TYPES.APIS} 
                    totalCount={totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            )}
        </Box>
    );
};

/**
 * MCP Servers Section Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of MCP Servers to display
 * @param {string} props.noDataIcon - Path to no data icon
 * @param {number} props.totalCount - Total number of MCP Servers
 * @param {number} props.currentPage - Current page number
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Callback for page changes
 * @returns {JSX.Element} MCP Servers section component
 */
const McpServersSection = ({ data, noDataIcon, totalCount, currentPage, pageSize, onPageChange }) => {
    return (
        <Box mb={4} mx={4}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h4'>
                    <FormattedMessage
                        id='Publisher.Landing.mcpServers.section.title'
                        defaultMessage='MCP Servers'
                    />
                </Typography>
                {data.length > 0 && (
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/mcp-servers/create'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.mcp.button'
                            defaultMessage='Create MCP Server'
                        />
                    </Button>
                )}
            </Box>
            {data.length === 0 ? (
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                    <img
                        src={Configurations.app.context + noDataIcon}
                        alt='No MCP Servers available'
                    />
                    <Typography variant='body1' color='textSecondary' mt={2} mb={3}>
                        <FormattedMessage
                            id='Publisher.Landing.no.mcpServers.message'
                            defaultMessage='No MCP Servers found. Create your first MCP Server to get started.'
                        />
                    </Typography>
                    <Button
                        variant='outlined'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/mcp-servers'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.mcp.button'
                            defaultMessage='Create MCP Server'
                        />
                    </Button>
                </Box>
            ) : (
                <DataTable 
                    data={data} 
                    type={ENTITY_TYPES.MCP_SERVERS} 
                    totalCount={totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            )}
        </Box>
    );
};

ApisSection.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        version: PropTypes.string,
        description: PropTypes.string,
        context: PropTypes.string,
        updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    noDataIcon: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

McpServersSection.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        version: PropTypes.string,
        description: PropTypes.string,
        context: PropTypes.string,
        updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    noDataIcon: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

/**
 * Publisher Portal Landing Page Component.
 * @returns {JSX.Element} Landing page to render
 */
const PublisherLanding = () => {
    const [selectedType, setSelectedType] = useState('apis');
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
                            />
                            <McpServersSection 
                                data={mcpServers} 
                                noDataIcon={noDataIcon}
                                totalCount={mcpServersTotalCount}
                                currentPage={mcpServersPage}
                                pageSize={pageSize}
                                onPageChange={handleMcpServersPageChange}
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
                                                    type.value === 'APIs' ? 'apis' : 'mcp-servers'
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
                                {selectedType === 'apis' && <APILanding />}
                                {selectedType === 'mcp-servers' && <MCPServerLanding />}
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </Root>
    );
};

export default PublisherLanding;
