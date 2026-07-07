/*
 * Copyright (c) 2026, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/* eslint-disable no-await-in-loop */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip,
    TextField,
    TablePagination,
    InputAdornment,
    Tooltip,
    Checkbox,
    IconButton,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import AuthManager from 'AppData/AuthManager';
import Utils from 'AppData/Utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormattedMessage } from 'react-intl';
import APIMAlert from 'AppComponents/Shared/Alert';

const Root = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    '& .header': {
        marginBottom: theme.spacing(4),
    },
    '& .actions': {
        marginTop: theme.spacing(2),
    },
}));

// How often (ms) to poll the status endpoint while a task is PENDING
const POLL_INTERVAL_MS = 2000;
// Maximum time (ms) to wait before giving up on a task
const POLL_TIMEOUT_MS = 120000;

/**
 * Single poll attempt: checks GET /federated-apis/status/{taskId} once.
 */
const pollOnce = (taskId, basePath, token) => {
    return fetch(`${basePath}/federated-apis/status/${taskId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    }).then((res) => {
        if (!res.ok) {
            throw new Error(`Status check failed for task ${taskId} (HTTP ${res.status})`);
        }
        return res.json();
    }).then((data) => {
        if (data.status === 'COMPLETED') {
            return data.result || [];
        }
        if (data.status === 'FAILED') {
            throw new Error(data.error || `Task ${taskId} failed on the server.`);
        }
        return null; // still PENDING
    });
};

/**
 * Polls GET /federated-apis/status/{taskId} until COMPLETED or FAILED.
 */
const pollTaskStatus = (taskId, basePath, token, startTime = Date.now()) => {
    if (Date.now() - startTime >= POLL_TIMEOUT_MS) {
        return Promise.reject(
            new Error(`Discovery timed out after ${POLL_TIMEOUT_MS / 1000}s for task ${taskId}.`)
        );
    }
    return new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
        .then(() => pollOnce(taskId, basePath, token))
        .then((result) => {
            if (result !== null) {
                return result; // COMPLETED
            }
            return pollTaskStatus(taskId, basePath, token, startTime);
        });
};

/**
 * Map rawError to a friendly explanation
 */
const getFriendlyErrorMessage = (rawError) => {
    if (!rawError) {
        return 'Discovery failed due to a server error or invalid gateway response. '
            + 'Please inspect the gateway logs.';
    }
    const errLower = rawError.toLowerCase();
    if (
        errLower.includes('aadsts')
        || errLower.includes('unauthorized')
        || errLower.includes('401')
        || errLower.includes('invalid_client')
        || errLower.includes('invalid client')
        || errLower.includes('invalid_grant')
        || errLower.includes('invalid grant')
        || errLower.includes('forbidden')
        || errLower.includes('403')
        || errLower.includes('invalid key')
        || errLower.includes('credentials')
        || errLower.includes('api key')
        || errLower.includes('service account')
    ) {
        return 'Authentication failed. Please verify the credentials, API keys, '
            + 'or certificates configured for this gateway in the Admin portal.';
    } else if (
        errLower.includes('tenant')
        || errLower.includes('project_id')
        || errLower.includes('project')
        || errLower.includes('not found')
        || errLower.includes('404')
        || errLower.includes('resource not found')
        || errLower.includes('environment')
        || errLower.includes('workspace')
        || errLower.includes('organization')
    ) {
        return 'Resource not found or configuration is invalid. Please verify the project ID, '
            + 'tenant, organization, or environment/workspace settings configured '
            + 'for this gateway in the Admin portal.';
    } else if (
        errLower.includes('timeout')
        || errLower.includes('timed out')
        || errLower.includes('connect')
        || errLower.includes('connection refused')
        || errLower.includes('dns')
        || errLower.includes('resolve')
        || errLower.includes('unreachable')
        || errLower.includes('host')
        || errLower.includes('network')
    ) {
        return 'Network connection issue. The third-party gateway is unreachable. '
            + 'Please verify network connectivity, firewall rules, and the host URL config.';
    } else if (
        errLower.includes('429')
        || errLower.includes('too many requests')
        || errLower.includes('rate limit')
        || errLower.includes('quota')
    ) {
        return 'Rate limit exceeded. The third-party gateway rejected the requests '
            + 'because the quota or rate limit has been reached. Please try again later.';
    }
    return 'Discovery failed due to a server error or invalid gateway response. '
        + 'Please inspect the gateway logs.';
};

/**
 * Helper to import/update a single API from a federated gateway.
 */
const importSingleApi = async (item, gwName, setImportingStates, setSelectedApis, setImportErrors) => {
    const apiId = item.id;
    const isUpdate = item.status === 'UPDATE';
    const actionLabel = isUpdate ? 'update' : 'import';
    setImportingStates((prev) => ({ ...prev, [apiId]: 'importing' }));
    try {
        const token = AuthManager.getUser().getPartialToken();
        const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');
        const url = `${basePath}/federated-apis/${actionLabel}?environment=${gwName}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify([apiId]),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const backendMsg = errorData.message || `Failed to ${actionLabel} API`;
            throw new Error(backendMsg);
        }
        setImportingStates((prev) => ({ ...prev, [apiId]: 'success' }));
        setSelectedApis((prev) => {
            const next = { ...prev };
            delete next[apiId];
            return next;
        });
        setImportErrors((prev) => {
            const next = { ...prev };
            delete next[apiId];
            return next;
        });
        APIMAlert.success(
            isUpdate
                ? `API "${item.apiName}" updated successfully`
                : `API "${item.apiName}" imported successfully`
        );
    } catch (err) {
        console.error(err);
        const friendly = getFriendlyErrorMessage(err.message);
        setImportingStates((prev) => ({ ...prev, [apiId]: 'error' }));
        setImportErrors((prev) => ({ ...prev, [apiId]: friendly }));
        APIMAlert.error(
            `Failed to ${actionLabel} API "${item.apiName}": ${friendly}`
        );
    }
};

const DiscoveryResults = (props) => {
    const { history, location } = props;
    const selectedGateways = location.state?.selectedGateways || [];

    const { data: settings, isLoading } = usePublisherSettings();
    const [discoveryResults, setDiscoveryResults] = useState({});
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [searchQueries, setSearchQueries] = useState({});
    const [statusFilters, setStatusFilters] = useState({});
    const [pages, setPages] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState({});
    const [importingStates, setImportingStates] = useState({});

    const [selectedApis, setSelectedApis] = useState({});
    const [importErrors, setImportErrors] = useState({});
    const [lastDiscoveredAt, setLastDiscoveredAt] = useState(null);
    const discoveryTriggered = useRef(false);

    // Load cached results from DB on mount
    const loadCachedResults = async (gw) => {
        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');
            const response = await fetch(
                `${basePath}/federated-apis/cached?environment=${gw}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                if (data.lastDiscoveredAt) {
                    setLastDiscoveredAt(data.lastDiscoveredAt);
                }
                if (data.result && data.result.length > 0) {
                    setDiscoveryResults((prev) => ({
                        ...prev,
                        [gw]: { status: 'success', apis: data.result },
                    }));
                    return true;
                }
            }
        } catch (err) {
            console.warn('Failed to load cached results:', err);
        }
        return false;
    };

    useEffect(() => {
        if (!location.state?.selectedGateways?.length) {
            history.replace('/apis/discover');
        }
    }, [location.state, history]);

    const discoverGateway = async (gw, token, basePath) => {
        const submitResponse = await fetch(
            `${basePath}/federated-apis/discover?environment=${gw}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            }
        );
        if (!submitResponse.ok && submitResponse.status !== 202) {
            throw new Error(`Failed to start discovery (HTTP ${submitResponse.status})`);
        }
        const submitData = await submitResponse.json();
        const { taskId } = submitData;
        if (!taskId) {
            throw new Error('No task ID returned');
        }
        const apiList = await pollTaskStatus(taskId, basePath, token);
        if (apiList.length > 0 && apiList[0].discoveredAt) {
            setLastDiscoveredAt(apiList[0].discoveredAt);
        } else {
            setLastDiscoveredAt(new Date().toISOString());
        }
        return apiList;
    };

    const handleDiscover = async () => {
        setDiscovering(true);
        setError(null);
        setSearchQueries({});
        setStatusFilters({});
        setPages({});
        setRowsPerPage({});
        setImportingStates({});
        setSelectedApis({});
        setImportErrors({});

        const initialResults = {};
        selectedGateways.forEach((gw) => {
            initialResults[gw] = {
                status: 'pending',
                statusText: 'Discovering...',
                apis: [],
            };
        });
        setDiscoveryResults(initialResults);

        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');

            await Promise.all(
                selectedGateways.map(async (gw) => {
                    try {
                        setDiscoveryResults((prev) => ({
                            ...prev,
                            [gw]: {
                                ...prev[gw],
                                statusText: 'Discovering...',
                            },
                        }));
                        const apiList = await discoverGateway(gw, token, basePath);
                        setDiscoveryResults((prev) => ({
                            ...prev,
                            [gw]: { status: 'success', apis: apiList },
                        }));
                    } catch (err) {
                        setDiscoveryResults((prev) => ({
                            ...prev,
                            [gw]: { status: 'error', error: err.message, apis: [] },
                        }));
                    }
                })
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setDiscovering(false);
        }
    };

    useEffect(() => {
        const initDiscovery = async () => {
            if (selectedGateways.length > 0 && !discoveryTriggered.current) {
                discoveryTriggered.current = true;
                // Try loading from cache first
                const gw = selectedGateways[0];
                const hasCached = await loadCachedResults(gw);
                if (!hasCached) {
                    // No cache - trigger fresh discovery
                    handleDiscover();
                }
            }
        };
        initDiscovery();
    }, [selectedGateways]);

    const handleRetryGateway = async (gw) => {
        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');
            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: { status: 'pending', statusText: 'Discovering...', apis: [] },
            }));
            const apiList = await discoverGateway(gw, token, basePath);
            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: { status: 'success', apis: apiList },
            }));
        } catch (err) {
            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: { status: 'error', error: err.message, apis: [] },
            }));
        }
    };

    const handleAction = async (item) => {
        await importSingleApi(item, item.gatewayName, setImportingStates, setSelectedApis, setImportErrors);
    };

    const handleBulkImport = async (gwName, gwApis) => {
        const toImport = gwApis.filter(
            (item) => selectedApis[item.id] && importingStates[item.id] !== 'success'
        );
        if (toImport.length === 0) return;

        for (const item of toImport) {
            await importSingleApi(item, gwName, setImportingStates, setSelectedApis, setImportErrors);
        }
    };

    const renderAction = (item) => {
        const apiId = item.id;
        const isUpdate = item.status === 'UPDATE';
        const importState = importingStates[apiId];

        if (importState === 'success') {
            return (
                <Chip
                    label={isUpdate ? 'Updated' : 'Imported'}
                    color='success'
                    variant='filled'
                    size='small'
                />
            );
        }
        if (importState === 'importing') {
            return <CircularProgress size={24} />;
        }

        let buttonColor = 'primary';
        let buttonText = 'Import';

        if (importState === 'error') {
            buttonColor = 'error';
            buttonText = 'Retry';
        } else if (isUpdate) {
            buttonColor = 'success';
            buttonText = 'Update';
        }

        return (
            <Box display='flex' gap={1} justifyContent='flex-end' alignItems='center'>
                {importState === 'error' && importErrors[apiId] && (
                    <Tooltip title={importErrors[apiId]} arrow>
                        <IconButton size='small' color='error' sx={{ p: 0.5 }}>
                            <InfoIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                )}
                <Button
                    variant='contained'
                    size='small'
                    color={buttonColor}
                    onClick={() => handleAction(item)}
                >
                    {buttonText}
                </Button>
            </Box>
        );
    };

    const renderGatewayResults = (gwName, res) => {
        if (res.status === 'pending') {
            return (
                <Paper
                    variant='outlined'
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <CircularProgress size={32} />
                    <Typography color='textSecondary'>{res.statusText || 'Discovering...'}</Typography>
                </Paper>
            );
        }

        if (res.status === 'error') {
            const rawError = res.error || 'Unknown error occurred during discovery.';
            const friendlyMessage = getFriendlyErrorMessage(rawError);

            return (
                <Box sx={{ mb: 2 }}>
                    <Alert severity='error' sx={{ mb: 1 }}>
                        <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                            {friendlyMessage}
                        </Typography>
                    </Alert>
                    <Button
                        variant='outlined'
                        size='small'
                        color='error'
                        startIcon={<RefreshIcon />}
                        onClick={() => handleRetryGateway(gwName)}
                    >
                        Retry Discovery
                    </Button>
                </Box>
            );
        }

        if (res.apis.length === 0) {
            return (
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                    <Typography color='textSecondary'>
                        No new or updated APIs discovered from this gateway.
                    </Typography>
                </Paper>
            );
        }

        const query = (searchQueries[gwName] || '').toLowerCase();
        const statusFilter = statusFilters[gwName] || 'ALL';
        const filteredApis = res.apis.filter((item) => {
            const matchesQuery =
                item.apiName?.toLowerCase().includes(query) ||
                item.version?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.context?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'NEW' && item.status === 'NEW') ||
                (statusFilter === 'UPDATE' && item.status === 'UPDATE');

            return matchesQuery && matchesStatus;
        });

        const page = pages[gwName] || 0;
        const rpp = rowsPerPage[gwName] || 5;
        const paginatedApis = filteredApis.slice(page * rpp, page * rpp + rpp);

        const checkableFilteredApis = filteredApis.filter(
            (item) => importingStates[item.id] !== 'success'
        );
        const selectedCheckableFilteredApis = checkableFilteredApis.filter(
            (item) => selectedApis[item.id]
        );
        const isAllSelected = checkableFilteredApis.length > 0
            && selectedCheckableFilteredApis.length === checkableFilteredApis.length;
        const isSomeSelected = selectedCheckableFilteredApis.length > 0
            && selectedCheckableFilteredApis.length < checkableFilteredApis.length;

        const handleSelectAll = (e) => {
            const { checked } = e.target;
            const next = { ...selectedApis };
            checkableFilteredApis.forEach((item) => {
                if (checked) {
                    next[item.id] = true;
                } else {
                    delete next[item.id];
                }
            });
            setSelectedApis(next);
        };

        const handleRowCheck = (e, item) => {
            const { checked } = e.target;
            const next = { ...selectedApis };
            if (checked) {
                next[item.id] = true;
            } else {
                delete next[item.id];
            }
            setSelectedApis(next);
        };

        const renderDescription = (desc) => {
            if (!desc) return '-';
            if (desc.length <= 50) return desc;
            const truncated = desc.substring(0, 47) + '...';
            return (
                <Tooltip title={desc} arrow>
                    <span style={{ cursor: 'pointer' }}>
                        {truncated}
                    </span>
                </Tooltip>
            );
        };

        const renderProtocol = (type) => {
            const typeUpper = (type || 'HTTP').toUpperCase();
            if (typeUpper === 'HTTP') return 'REST';
            if (typeUpper === 'WS') return 'WebSocket';
            if (typeUpper === 'WEBSOCKET') return 'WebSocket';
            return typeUpper;
        };

        const renderRow = (item) => {
            const isNew = item.status === 'NEW';
            return (
                <TableRow key={item.id || `${item.apiName}-${item.version}`}>
                    <TableCell padding='checkbox'>
                        <Checkbox
                            checked={!!selectedApis[item.id]}
                            disabled={
                                importingStates[item.id] === 'success'
                                || importingStates[item.id] === 'importing'
                            }
                            onChange={(e) => handleRowCheck(e, item)}
                        />
                    </TableCell>
                    <TableCell>
                        {item.apiName}
                    </TableCell>
                    <TableCell>{item.version}</TableCell>
                    <TableCell>
                        {renderDescription(item.description)}
                    </TableCell>
                    <TableCell>{item.context || '-'}</TableCell>
                    <TableCell>
                        {renderProtocol(item.apiType)}
                    </TableCell>
                    <TableCell>
                        <Chip
                            label={item.status}
                            color={isNew ? 'success' : 'primary'}
                            size='small'
                            variant='outlined'
                        />
                    </TableCell>
                    <TableCell align='right'>{renderAction(item)}</TableCell>
                </TableRow>
            );
        };

        return (
            <Box>
                {filteredApis.length === 0 ? (
                    <Paper variant='outlined' sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color='textSecondary'>
                            No matching discovered APIs found.
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding='checkbox'>
                                            <Checkbox
                                                indeterminate={isSomeSelected}
                                                checked={isAllSelected}
                                                disabled={checkableFilteredApis.length === 0}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>API Name</TableCell>
                                        <TableCell>Version</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Context</TableCell>
                                        <TableCell>Protocol</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align='right'>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedApis.map(renderRow)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component='div'
                            count={filteredApis.length}
                            rowsPerPage={rpp}
                            page={page}
                            onPageChange={(event, newPage) => {
                                setPages(prev => ({ ...prev, [gwName]: newPage }));
                            }}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(prev => ({
                                    ...prev,
                                    [gwName]: Number.parseInt(event.target.value, 10),
                                }));
                                setPages(prev => ({ ...prev, [gwName]: 0 }));
                            }}
                        />
                    </>
                )}
            </Box>
        );
    };

    if (isLoading || !selectedGateways || selectedGateways.length === 0) {
        return null;
    }

    const gateways = (settings?.environment || []).filter(
        (env) => !env.provider.toLowerCase().includes('wso2')
    );

    const totalApisCount = Object.values(discoveryResults).reduce(
        (sum, res) => sum + (res.apis || []).length,
        0
    );

    const hasErrors = Object.values(discoveryResults).some((r) => r.status === 'error');
    const isAnyPending = Object.values(discoveryResults).some((r) => r.status === 'pending');

    const handleBackToSelection = () => {
        history.push({
            pathname: '/apis/discover',
            state: { selectedGateways },
        });
    };

    return (
        <Root>
            <Box mb={2}>
                <Button
                    variant='text'
                    onClick={handleBackToSelection}
                    startIcon={<ArrowBackIcon />}
                    id='itest-apis-back-to-gateways'
                >
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.back.to.gateways'
                        defaultMessage='Back to Gateway Selection'
                    />
                </Button>
            </Box>
            <div className='header'>
                <Typography variant='h4'>Discover APIs</Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                    Discover and import APIs from federated gateways into WSO2 API Manager.
                </Typography>
            </div>

            {error && (
                <Alert severity='error' sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box>
                {discovering ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 4 }}>
                        <Typography variant='h6' gutterBottom>
                            Discovering APIs
                        </Typography>
                        {selectedGateways.map((gw) => {
                            const result = discoveryResults[gw] || {
                                status: 'pending',
                                statusText: 'Queued...',
                            };

                            let displayStatusText = '';
                            if (result.status === 'pending') {
                                displayStatusText = result.statusText;
                            } else if (result.status === 'success') {
                                displayStatusText = `${result.apis.length} APIs discovered`;
                            } else {
                                const friendly = getFriendlyErrorMessage(result.error);
                                displayStatusText = friendly;
                            }

                            const gwObj = gateways.find((g) => g.name === gw);
                            const gwType = gwObj ? (gwObj.gatewayType || 'External').toUpperCase() : '';

                            return (
                                <Paper
                                    variant='outlined'
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: 2,
                                    }}
                                    key={gw}
                                >
                                    <Box display='flex' alignItems='center' gap={2}>
                                        {result.status === 'pending' && <CircularProgress size={20} />}
                                        {result.status === 'success' && (
                                            <Chip label='Done' color='success' size='small' />
                                        )}
                                        {result.status === 'error' && (
                                            <Chip label='Failed' color='error' size='small' />
                                        )}
                                        <Typography sx={{ fontWeight: 'bold' }}>
                                            {gw}{gwType ? ` (${gwType})` : ''}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant='body2'
                                        color='textSecondary'
                                        sx={{
                                            ml: 2,
                                            textAlign: 'right',
                                            wordBreak: 'break-word',
                                            maxWidth: '70%',
                                        }}
                                    >
                                        {displayStatusText}
                                    </Typography>
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    <>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                            <Box display='flex' alignItems='center' gap={2}>
                                {lastDiscoveredAt && (
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#1a3c73',
                                            fontSize: '1rem',
                                            backgroundColor: '#E8F0FE',
                                            py: 0.75,
                                            px: 1.5,
                                            borderRadius: '6px',
                                        }}
                                    >
                                        Last Discovered: {new Date(lastDiscoveredAt).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                variant='outlined'
                                size='small'
                                startIcon={<RefreshIcon />}
                                disabled={discovering}
                                onClick={handleDiscover}
                            >
                                Refresh
                            </Button>
                        </Box>

                        {totalApisCount === 0 && !hasErrors && !isAnyPending ? (
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant='outlined'>
                                <Typography>
                                    {lastDiscoveredAt
                                        ? 'No new or updated APIs discovered from this gateway.'
                                        : 'No previous discovery data. Click Refresh to discover APIs.'}
                                </Typography>
                                {!lastDiscoveredAt && (
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        sx={{ mt: 2 }}
                                        startIcon={<RefreshIcon />}
                                        onClick={handleDiscover}
                                        disabled={discovering}
                                    >
                                        Discover Now
                                    </Button>
                                )}
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {Object.entries(discoveryResults).map(([gwName, res]) => {
                                    const isDone = res.status === 'success';
                                    const gwObj = gateways.find((g) => g.name === gwName);
                                    const gwType = gwObj ? (gwObj.gatewayType || 'External').toUpperCase() : '';
                                    return (
                                        <Box key={gwName}>
                                            <Box
                                                display='flex'
                                                justifyContent='space-between'
                                                alignItems='center'
                                                mb={2}
                                            >
                                                <Box display='flex' alignItems='center' gap={1}>
                                                    <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                                                        Gateway: {gwName}{gwType ? ` (${gwType})` : ''}
                                                    </Typography>
                                                    {isDone ? (
                                                        <Chip
                                                            label={`${res.apis.length} APIs`}
                                                            color='primary'
                                                            size='small'
                                                            variant='outlined'
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label='Error'
                                                            color='error'
                                                            size='small'
                                                            variant='outlined'
                                                        />
                                                    )}
                                                </Box>
                                                {isDone && res.apis && res.apis.length > 0 && (
                                                    <Box display='flex' alignItems='center' gap={2}>
                                                        {(() => {
                                                            const selectedCountForGw = res.apis.filter(
                                                                (item) => selectedApis[item.id]
                                                                    && importingStates[item.id] !== 'success'
                                                            ).length;
                                                            if (selectedCountForGw > 0) {
                                                                const isGwBulkImporting = res.apis.some(
                                                                    (item) => selectedApis[item.id]
                                                                        && importingStates[item.id] === 'importing'
                                                                );
                                                                return (
                                                                    <Button
                                                                        variant='contained'
                                                                        color='primary'
                                                                        size='small'
                                                                        disabled={isGwBulkImporting}
                                                                        onClick={() => handleBulkImport(
                                                                            gwName,
                                                                            res.apis
                                                                        )}
                                                                        startIcon={
                                                                            isGwBulkImporting ? (
                                                                                <CircularProgress
                                                                                    size={16}
                                                                                    color='inherit'
                                                                                />
                                                                            ) : (
                                                                                <GetAppIcon />
                                                                            )
                                                                        }
                                                                    >
                                                                        Import Selected ({selectedCountForGw})
                                                                    </Button>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                        <FormControl size='small' sx={{ minWidth: 140 }}>
                                                            <Select
                                                                value={statusFilters[gwName] || 'ALL'}
                                                                onChange={(e) => {
                                                                    setStatusFilters((prev) => ({
                                                                        ...prev,
                                                                        [gwName]: e.target.value,
                                                                    }));
                                                                    setPages((prev) => ({ ...prev, [gwName]: 0 }));
                                                                }}
                                                            >
                                                                <MenuItem value='ALL'>All APIs</MenuItem>
                                                                <MenuItem value='NEW'>New APIs</MenuItem>
                                                                <MenuItem value='UPDATE'>Updated APIs</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                        <TextField
                                                            size='small'
                                                            placeholder='Search APIs...'
                                                            value={searchQueries[gwName] || ''}
                                                            onChange={(e) => {
                                                                setSearchQueries((prev) => ({
                                                                    ...prev,
                                                                    [gwName]: e.target.value,
                                                                }));
                                                                setPages((prev) => ({ ...prev, [gwName]: 0 }));
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position='start'>
                                                                        <SearchIcon />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            sx={{ width: 250 }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                            {renderGatewayResults(gwName, res)}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </>
                )}
            </Box>

        </Root>
    );
};

DiscoveryResults.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func,
        replace: PropTypes.func,
    }).isRequired,
    location: PropTypes.shape({
        state: PropTypes.shape({
            selectedGateways: PropTypes.arrayOf(PropTypes.string),
        }),
    }).isRequired,
};

export default DiscoveryResults;
