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

import React, { useState, useEffect } from 'react';
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
    Chip
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
    const history = useHistory();
    const { noDataIcon } = theme.custom.landingPage.icons;

    // Fetch APIs and MCP Servers data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both APIs and MCP Servers concurrently
                const [apisResponse, mcpServersResponse] = await Promise.allSettled([
                    API.all({ limit: 5 }), // Limit to 5 for initial display
                    MCPServer.all({ limit: 5 }) // Limit to 5 for initial display
                ]);

                // Handle APIs response
                if (apisResponse.status === 'fulfilled') {
                    setApis(apisResponse.value.body?.list || []);
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Failed to fetch APIs:', apisResponse.reason);
                }

                // Handle MCP Servers response  
                if (mcpServersResponse.status === 'fulfilled') {
                    setMcpServers(mcpServersResponse.value.body?.list || []);
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Failed to fetch MCP Servers:', mcpServersResponse.reason);
                }

            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format the updatedTime for display
    const formatUpdatedTime = (updatedTime) => {
        if (!updatedTime) return 'N/A';
        return moment(parseInt(updatedTime, 10)).fromNow();
    };

    // Render APIs table
    const renderApisTable = () => {
        return (
            <Box mb={4}>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                    <Typography variant='h4'>
                        <FormattedMessage
                            id='Publisher.Landing.apis.section.title'
                            defaultMessage='APIs'
                        />
                    </Typography>
                    {apis.length > 0 && (
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
                {apis.length === 0 ? (
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
                    <TableContainer component={Paper} className={classes.TableContainer}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell width='30%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.name'
                                            defaultMessage='Name'
                                        />
                                    </TableCell>
                                    <TableCell width='10%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.version'
                                            defaultMessage='Version'
                                        />
                                    </TableCell>
                                    <TableCell width='30%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.description'
                                            defaultMessage='Description'
                                        />
                                    </TableCell>
                                    <TableCell width='15%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.type'
                                            defaultMessage='Type'
                                        />
                                    </TableCell>
                                    <TableCell width='15%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.lastUpdated'
                                            defaultMessage='Last Updated'
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {apis.map((api) => (
                                    <TableRow
                                        key={api.id}
                                        onClick={() => history.push(`/apis/${api.id}/overview`)}
                                        style={{ cursor: 'pointer' }}
                                        hover
                                    >
                                        <TableCell>
                                            <Box display='flex' alignItems='center'>
                                                <Avatar
                                                    style={{
                                                        backgroundColor: Utils.stringToColor(
                                                            api.name,
                                                        ),
                                                    }}
                                                >
                                                    {Utils.stringAvatar(
                                                        api.name.toUpperCase(),
                                                    )}
                                                </Avatar>
                                                <Typography variant='body2' fontWeight='medium' ml={1}>
                                                    {api.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2'>
                                                {api.version}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2'>
                                                {api.description && api.description.length > 30
                                                    ? `${api.description.substring(0, 30)}...`
                                                    : api.description || 'No description available'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={api.type || 'API'}
                                                size='small'
                                                color='primary'
                                                variant='outlined'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2' color='textSecondary'>
                                                {formatUpdatedTime(api.updatedTime)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    };

    // Render MCP Servers table
    const renderMcpServersTable = () => {
        return (
            <Box mb={4}>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                    <Typography variant='h4'>
                        <FormattedMessage
                            id='Publisher.Landing.mcpServers.section.title'
                            defaultMessage='MCP Servers'
                        />
                    </Typography>
                    {mcpServers.length > 0 && (
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
                {mcpServers.length === 0 ? (
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
                    <TableContainer component={Paper} className={classes.TableContainer}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell width='30%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.name'
                                            defaultMessage='Name'
                                        />
                                    </TableCell>
                                    <TableCell width='10%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.version'
                                            defaultMessage='Version'
                                        />
                                    </TableCell>
                                    <TableCell width='30%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.description'
                                            defaultMessage='Description'
                                        />
                                    </TableCell>
                                    <TableCell width='15%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.type'
                                            defaultMessage='Type'
                                        />
                                    </TableCell>
                                    <TableCell width='15%'>
                                        <FormattedMessage
                                            id='Publisher.Landing.table.lastUpdated'
                                            defaultMessage='Last Updated'
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mcpServers.map((server) => (
                                    <TableRow
                                        key={server.id}
                                        onClick={() => history.push(`/mcp-servers/${server.id}/overview`)}
                                        style={{ cursor: 'pointer' }}
                                        hover
                                    >
                                        <TableCell>
                                            <Box display='flex' alignItems='center'>
                                                <Avatar
                                                    style={{
                                                        backgroundColor: Utils.stringToColor(
                                                            server.name,
                                                        ),
                                                    }}
                                                >
                                                    {Utils.stringAvatar(
                                                        server.name.toUpperCase(),
                                                    )}
                                                </Avatar>
                                                <Typography variant='body2' fontWeight='medium' ml={1}>
                                                    {server.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2'>
                                                {server.version}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2'>
                                                {server.description && server.description.length > 30
                                                    ? `${server.description.substring(0, 30)}...`
                                                    : server.description || 'No description available'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={server.type || 'MCP'}
                                                size='small'
                                                color='primary'
                                                variant='outlined'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2' color='textSecondary'>
                                                {formatUpdatedTime(server.updatedTime)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    };

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

    // Check if we have any data to display
    const hasData = apis.length > 0 || mcpServers.length > 0;

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
                            {renderApisTable()}
                            {renderMcpServersTable()}
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
