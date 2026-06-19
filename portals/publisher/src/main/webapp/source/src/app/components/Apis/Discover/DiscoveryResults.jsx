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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
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

const DiscoveryResults = (props) => {
    const { history, location } = props;
    const selectedGateways = (location.state && location.state.selectedGateways) || [];

    const { data: settings, isLoading } = usePublisherSettings();
    const [discoveryResults, setDiscoveryResults] = useState({});
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [searchQueries, setSearchQueries] = useState({});
    const [pages, setPages] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState({});
    const [importingStates, setImportingStates] = useState({});
    const [customizedApis, setCustomizedApis] = useState({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingApi, setEditingApi] = useState(null);
    const [editedDisplayName, setEditedDisplayName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [selectedApis, setSelectedApis] = useState({});
    const [importErrors, setImportErrors] = useState({});
    const discoveryTriggered = useRef(false);

    useEffect(() => {
        if (!location.state || !location.state.selectedGateways || location.state.selectedGateways.length === 0) {
            history.replace('/apis/discover');
        }
    }, [location.state, history]);

    const handleDiscover = async () => {
        setDiscovering(true);
        setError(null);
        setSearchQueries({});
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

                        setDiscoveryResults((prev) => ({
                            ...prev,
                            [gw]: {
                                ...prev[gw],
                                statusText: 'Discovering...',
                            },
                        }));

                        const apiList = await pollTaskStatus(taskId, basePath, token);

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
        if (selectedGateways.length > 0 && !discoveryTriggered.current) {
            discoveryTriggered.current = true;
            handleDiscover();
        }
    }, [selectedGateways]);

    const handleRetryGateway = async (gw) => {
        setDiscoveryResults((prev) => ({
            ...prev,
            [gw]: {
                status: 'pending',
                statusText: 'Discovering...',
                apis: [],
            },
        }));

        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');

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

            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: {
                    ...prev[gw],
                    statusText: 'Discovering...',
                },
            }));

            const apiList = await pollTaskStatus(taskId, basePath, token);

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
        const apiId = item.id;
        const { gatewayName } = item;
        const isUpdate = item.status === 'UPDATE';

        setImportingStates((prev) => ({ ...prev, [apiId]: 'importing' }));
        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');
            const endpoint = isUpdate ? 'update' : 'import';

            const customData = customizedApis[apiId];
            const payload = customData
                ? JSON.stringify({
                    id: apiId,
                    displayName: customData.displayName,
                    description: customData.description,
                })
                : apiId;

            const url = `${basePath}/federated-apis/${endpoint}?environment=${gatewayName}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify([payload]),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const backendMsg = errorData.message || `Failed to ${isUpdate ? 'update' : 'import'} API`;
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
            setImportingStates((prev) => ({ ...prev, [apiId]: 'error' }));
            setImportErrors((prev) => ({ ...prev, [apiId]: err.message }));
            APIMAlert.error(
                `Failed to ${isUpdate ? 'update' : 'import'} API "${item.apiName}": ${err.message}`
            );
        }
    };

    const handleBulkImport = async (gwName, gwApis) => {
        const toImport = gwApis.filter(
            (item) => selectedApis[item.id] && importingStates[item.id] !== 'success'
        );
        if (toImport.length === 0) return;

        for (const item of toImport) {
            const apiId = item.id;
            const isUpdate = item.status === 'UPDATE';
            setImportingStates((prev) => ({ ...prev, [apiId]: 'importing' }));
            try {
                const token = AuthManager.getUser().getPartialToken();
                const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');
                const endpoint = isUpdate ? 'update' : 'import';

                const customData = customizedApis[apiId];
                const payload = customData
                    ? JSON.stringify({
                        id: apiId,
                        displayName: customData.displayName,
                        description: customData.description,
                    })
                    : apiId;

                const url = `${basePath}/federated-apis/${endpoint}?environment=${gwName}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify([payload]),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const backendMsg = errorData.message || `Failed to ${isUpdate ? 'update' : 'import'} API`;
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
                setImportingStates((prev) => ({ ...prev, [apiId]: 'error' }));
                setImportErrors((prev) => ({ ...prev, [apiId]: err.message }));
                APIMAlert.error(
                    `Failed to ${isUpdate ? 'update' : 'import'} API "${item.apiName}": ${err.message}`
                );
            }
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
                    variant='outlined'
                    size='small'
                    color='primary'
                    startIcon={<EditIcon />}
                    onClick={() => {
                        setEditingApi(item);
                        setEditedDisplayName(
                            customizedApis[item.id]?.displayName || item.apiName
                        );
                        setEditedDescription(
                            customizedApis[item.id]?.description || item.description || ''
                        );
                        setIsEditDialogOpen(true);
                    }}
                >
                    Edit
                </Button>
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
            
            // Map rawError to a friendly explanation
            let friendlyMessage = 'Discovery failed due to a server error or invalid gateway response. '
                + 'Please inspect the gateway logs.';
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
                friendlyMessage = 'Authentication failed. Please verify the credentials, API keys, '
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
                friendlyMessage = 'Resource not found or configuration is invalid. '
                    + 'Please verify the project ID, tenant, organization, or environment/workspace '
                    + 'settings configured for this gateway in the Admin portal.';
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
                friendlyMessage = 'Network connection issue. The third-party gateway is unreachable. '
                    + 'Please verify network connectivity, firewall rules, and the host URL config.';
            } else if (
                errLower.includes('429')
                || errLower.includes('too many requests')
                || errLower.includes('rate limit')
                || errLower.includes('quota')
            ) {
                friendlyMessage = 'Rate limit exceeded. The third-party gateway rejected the requests '
                    + 'because the quota or rate limit has been reached. Please try again later.';
            }

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
        const filteredApis = res.apis.filter((item) =>
            (item.apiName && item.apiName.toLowerCase().includes(query)) ||
            (item.version && item.version.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.context && item.context.toLowerCase().includes(query))
        );

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
                                                onChange={(e) => {
                                                    const { checked } = e.target;
                                                    setSelectedApis((prev) => {
                                                        const next = { ...prev };
                                                        checkableFilteredApis.forEach((item) => {
                                                            if (checked) {
                                                                next[item.id] = true;
                                                            } else {
                                                                delete next[item.id];
                                                            }
                                                        });
                                                        return next;
                                                    });
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>API Name</TableCell>
                                        <TableCell>Version</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Context</TableCell>
                                        <TableCell>API Type / Protocol</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Discovered At</TableCell>
                                        <TableCell align='right'>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedApis.map((item) => {
                                        const isNew = item.status === 'NEW';
                                        const date = item.discoveredAt
                                            ? new Date(item.discoveredAt)
                                            : new Date();
                                        const dateOnlyStr = date.toLocaleDateString();
                                        const dateTimeStr = date.toLocaleString();

                                        return (
                                            <TableRow key={item.id || `${item.apiName}-${item.version}`}>
                                                <TableCell padding='checkbox'>
                                                    <Checkbox
                                                        checked={!!selectedApis[item.id]}
                                                        disabled={
                                                            importingStates[item.id] === 'success'
                                                            || importingStates[item.id] === 'importing'
                                                        }
                                                        onChange={(e) => {
                                                            const { checked } = e.target;
                                                            setSelectedApis((prev) => {
                                                                const next = { ...prev };
                                                                if (checked) {
                                                                    next[item.id] = true;
                                                                } else {
                                                                    delete next[item.id];
                                                                }
                                                                return next;
                                                            });
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {customizedApis[item.id]?.displayName || item.apiName}
                                                </TableCell>
                                                <TableCell>{item.version}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const fullDesc = customizedApis[item.id]?.description
                                                            || item.description;
                                                        if (!fullDesc) return '-';
                                                        if (fullDesc.length <= 50) return fullDesc;
                                                        const truncated = fullDesc.substring(0, 47) + '...';
                                                        return (
                                                            <Tooltip title={fullDesc} arrow>
                                                                <span style={{ cursor: 'pointer' }}>
                                                                    {truncated}
                                                                </span>
                                                            </Tooltip>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell>{item.context || '-'}</TableCell>
                                                <TableCell>{item.apiType || 'HTTP'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.status}
                                                        color={isNew ? 'success' : 'primary'}
                                                        size='small'
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={dateTimeStr} arrow>
                                                        <span>{dateOnlyStr}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align='right'>{renderAction(item)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
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
                                    [gwName]: parseInt(event.target.value, 10),
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
                                displayStatusText = result.error;
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
                                    <Typography variant='body2' color='textSecondary'>
                                        {displayStatusText}
                                    </Typography>
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    <>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                            <Typography variant='h6'>
                                Discovered APIs ({totalApisCount})
                            </Typography>
                        </Box>

                        {totalApisCount === 0 && !hasErrors && !isAnyPending ? (
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant='outlined'>
                                <Typography>No new APIs discovered from the selected gateways.</Typography>
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
            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle>Edit API Details</DialogTitle>
                <DialogContent dividers>
                    <Box display='flex' flexDirection='column' gap={3} sx={{ mt: 1 }}>
                        <TextField
                            label='Display Name'
                            variant='outlined'
                            fullWidth
                            value={editedDisplayName}
                            onChange={(e) => setEditedDisplayName(e.target.value)}
                        />
                        <TextField
                            label='Description'
                            variant='outlined'
                            fullWidth
                            multiline
                            rows={3}
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)} color='secondary'>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (editingApi) {
                                setCustomizedApis((prev) => ({
                                    ...prev,
                                    [editingApi.id]: {
                                        displayName: editedDisplayName,
                                        description: editedDescription,
                                    },
                                }));
                            }
                            setIsEditDialogOpen(false);
                        }}
                        variant='contained'
                        color='primary'
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Root>
    );
};

export default DiscoveryResults;
