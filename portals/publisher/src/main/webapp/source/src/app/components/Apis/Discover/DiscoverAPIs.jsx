import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import AuthManager from 'AppData/AuthManager';
import Utils from 'AppData/Utils';
import { Link } from 'react-router-dom';

const Root = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    '& .header': {
        marginBottom: theme.spacing(4),
    },
    '& .gateway-list': {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
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
 * Returns the result array if COMPLETED, throws if FAILED, or returns null if still PENDING.
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
 * Polls GET /federated-apis/status/{taskId} using tail-recursive promises until
 * the task is COMPLETED or FAILED, or until the timeout is reached.
 *
 * @returns {Promise<Array>} The flat API list from the COMPLETED task result.
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
            // Still PENDING — recurse
            return pollTaskStatus(taskId, basePath, token, startTime);
        });
};


const groupGatewaysByType = (gatewaysList) => {
    const grouped = {};
    gatewaysList.forEach((gw) => {
        const type = (gw.gatewayType || 'External').toUpperCase();
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(gw);
    });
    return grouped;
};


const DiscoverAPIs = () => {
    const { data: settings, isLoading } = usePublisherSettings();
    const [selectedGateways, setSelectedGateways] = useState([]);
    const [step, setStep] = useState(1);
    const [discoveryResults, setDiscoveryResults] = useState({});
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [importingStates, setImportingStates] = useState({});

    if (isLoading) {
        return <CircularProgress />;
    }

    const gateways = (settings?.environment || []).filter(
        (env) => !env.provider.toLowerCase().includes('wso2')
    );

    const handleToggleGateway = (gatewayName) => {
        setSelectedGateways((prev) =>
            prev.includes(gatewayName)
                ? prev.filter((g) => g !== gatewayName)
                : [...prev, gatewayName]
        );
    };

    const handleDiscover = async () => {
        setStep(2);
        setDiscovering(true);
        setError(null);

        // Initialize results with pending state for all selected gateways
        const initialResults = {};
        selectedGateways.forEach((gw) => {
            initialResults[gw] = {
                status: 'pending',
                statusText: 'Initializing...',
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
                                statusText: `Submitting task for ${gw}...`,
                            },
                        }));

                        // Submit the async discovery task
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
                                statusText: `Polling task ${taskId.substring(0, 8)}...`,
                            },
                        }));

                        // Poll status
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

    const handleAction = async (item) => {
        const apiId = item.id;
        const { gatewayName } = item;
        const isUpdate = item.status === 'UPDATE';

        setImportingStates((prev) => ({ ...prev, [apiId]: 'importing' }));
        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');
            const endpoint = isUpdate ? 'update' : 'import';

            const url = `${basePath}/federated-apis/${endpoint}?environment=${gatewayName}`;
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
                throw new Error(`Failed to ${isUpdate ? 'update' : 'import'} API`);
            }

            setImportingStates((prev) => ({ ...prev, [apiId]: 'success' }));
        } catch (err) {
            console.error(err);
            setImportingStates((prev) => ({ ...prev, [apiId]: 'error' }));
        }
    };

    const renderAction = (item) => {
        const apiId = item.id;
        const isUpdate = item.status === 'UPDATE';
        const importState = importingStates[apiId];

        if (importState === 'success') {
            return (
                <Button disabled color='success'>
                    {isUpdate ? 'Updated' : 'Imported'}
                </Button>
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
            buttonColor = 'secondary';
            buttonText = 'Update';
        }

        return (
            <Button
                variant='contained'
                size='small'
                color={buttonColor}
                onClick={() => handleAction(item)}
            >
                {buttonText}
            </Button>
        );
    };

    const renderGatewayResults = (gwName, res) => {
        if (res.status === 'error') {
            return (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {res.error || 'Unknown error occurred during discovery.'}
                </Alert>
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

        return (
            <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>API Name</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Context</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Discovered At</TableCell>
                            <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {res.apis.map((item) => {
                            const isNew = item.status === 'NEW';
                            const date = item.discoveredAt
                                ? new Date(item.discoveredAt)
                                : new Date();
                            const dateStr = date.toLocaleString();

                            return (
                                <TableRow key={item.id || `${item.apiName}-${item.version}`}>
                                    <TableCell>{item.apiName}</TableCell>
                                    <TableCell>{item.version}</TableCell>
                                    <TableCell>{item.description || '-'}</TableCell>
                                    <TableCell>{item.context || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.status}
                                            color={isNew ? 'success' : 'warning'}
                                            size='small'
                                        />
                                    </TableCell>
                                    <TableCell>{dateStr}</TableCell>
                                    <TableCell align='right'>{renderAction(item)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const totalApisCount = Object.values(discoveryResults).reduce(
        (sum, res) => sum + (res.apis || []).length,
        0
    );

    const hasErrors = Object.values(discoveryResults).some((r) => r.status === 'error');

    return (
        <Root>
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

            {step === 1 && (
                <Box>
                    <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
                        Select Gateways
                    </Typography>
                    {gateways.length === 0 ? (
                        <Typography color='textSecondary'>No external gateways available.</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                            {Object.entries(groupGatewaysByType(gateways)).map(([type, gwList]) => (
                                <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }} key={type}>
                                    <Typography
                                        variant='subtitle2'
                                        color='primary'
                                        sx={{ fontWeight: 'bold', mb: 2, letterSpacing: 1 }}
                                    >
                                        {type} GATEWAYS
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {gwList.map((gw) => (
                                            <FormControlLabel
                                                key={gw.name}
                                                control={
                                                    <Checkbox
                                                        checked={selectedGateways.includes(gw.name)}
                                                        onChange={() => handleToggleGateway(gw.name)}
                                                        color='primary'
                                                    />
                                                }
                                                label={gw.displayName || gw.name}
                                            />
                                        ))}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    <div className='actions'>
                        <Button
                            variant='contained'
                            color='primary'
                            disabled={selectedGateways.length === 0}
                            onClick={handleDiscover}
                        >
                            Discover APIs from {selectedGateways.length} gateway(s)
                        </Button>
                        <Button
                            variant='text'
                            component={Link}
                            to='/apis'
                            sx={{ ml: 2 }}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            )}

            {step === 2 && (
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
                                            <Typography sx={{ fontWeight: 'bold' }}>{gw}</Typography>
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
                                <Button variant='outlined' onClick={() => setStep(1)}>
                                    Back to Selection
                                </Button>
                            </Box>

                            {totalApisCount === 0 && !hasErrors ? (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant='outlined'>
                                    <Typography>No new APIs discovered from the selected gateways.</Typography>
                                </Paper>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {Object.entries(discoveryResults).map(([gwName, res]) => {
                                        const isDone = res.status === 'success';
                                        return (
                                            <Box key={gwName}>
                                                <Box display='flex' alignItems='center' gap={1} mb={2}>
                                                    <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                                                        Gateway: {gwName}
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
                                                {renderGatewayResults(gwName, res)}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            )}
        </Root>
    );
};

export default DiscoverAPIs;
