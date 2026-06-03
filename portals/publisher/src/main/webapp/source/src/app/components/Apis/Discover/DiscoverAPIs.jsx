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


const DiscoverAPIs = () => {
    const { data: settings, isLoading } = usePublisherSettings();
    const [selectedGateways, setSelectedGateways] = useState([]);
    const [step, setStep] = useState(1);
    const [discoveredAPIs, setDiscoveredAPIs] = useState([]);
    const [discovering, setDiscovering] = useState(false);
    const [discoveringStatus, setDiscoveringStatus] = useState('');
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
        setDiscoveredAPIs([]);

        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');

            const results = await Promise.all(
                selectedGateways.map(async (gw) => {
                    // Step 1: Submit the async discovery task — server returns 202 with {taskId, status}
                    setDiscoveringStatus(`Submitting discovery for ${gw}...`);
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

                    // 202 is success for async submission
                    if (!submitResponse.ok && submitResponse.status !== 202) {
                        throw new Error(`Failed to start discovery for ${gw} (HTTP ${submitResponse.status})`);
                    }

                    const submitData = await submitResponse.json();
                    const { taskId } = submitData;

                    if (!taskId) {
                        throw new Error(`No task ID returned for gateway ${gw}`);
                    }

                    // Step 2: Poll GET /status/{taskId} until COMPLETED or FAILED
                    setDiscoveringStatus(`Discovering APIs from ${gw} (task: ${taskId.substring(0, 8)}...)...`);
                    const apiList = await pollTaskStatus(taskId, basePath, token);

                    // Backend returns a flat array: [{apiName, version, status, gatewayName, ...}]
                    return apiList;
                })
            );

            // Flatten results from all selected gateways into one list
            setDiscoveredAPIs(results.flat());
        } catch (err) {
            setError(err.message);
        } finally {
            setDiscovering(false);
            setDiscoveringStatus('');
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

            const response = await fetch(`${basePath}/federated-apis/${endpoint}?environment=${gatewayName}`, {
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
                    <Typography variant='h6' gutterBottom>
                        Select Gateways
                    </Typography>
                    {gateways.length === 0 ? (
                        <Typography color='textSecondary'>No external gateways available.</Typography>
                    ) : (
                        <div className='gateway-list'>
                            {gateways.map((gw) => (
                                <FormControlLabel
                                    key={gw.name}
                                    control={
                                        <Checkbox
                                            checked={selectedGateways.includes(gw.name)}
                                            onChange={() => handleToggleGateway(gw.name)}
                                            color='primary'
                                        />
                                    }
                                    label={`${gw.displayName || gw.name} (${gw.gatewayType || 'External'})`}
                                />
                            ))}
                        </div>
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
                        <Box display='flex' flexDirection='column' alignItems='center' my={5}>
                            <CircularProgress />
                            <Typography mt={2}>
                                {discoveringStatus || 'Discovering APIs...'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                                <Typography variant='h6'>
                                    Discovered APIs ({discoveredAPIs.length})
                                </Typography>
                                <Button variant='outlined' onClick={() => setStep(1)}>
                                    Back to Selection
                                </Button>
                            </Box>

                            {discoveredAPIs.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography>No new APIs discovered from the selected gateways.</Typography>
                                </Paper>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>API Name</TableCell>
                                                <TableCell>Version</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Context</TableCell>
                                                <TableCell>Gateway</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Discovered At</TableCell>
                                                <TableCell align='right'>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {discoveredAPIs.map((item) => (
                                                <TableRow key={item.id || `${item.apiName}-${item.version}`}>
                                                    <TableCell>{item.apiName}</TableCell>
                                                    <TableCell>{item.version}</TableCell>
                                                    <TableCell>{item.description || '-'}</TableCell>
                                                    <TableCell>{item.context || '-'}</TableCell>
                                                    <TableCell>{item.gatewayName}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.status}
                                                            color={item.status === 'NEW' ? 'success' : 'warning'}
                                                            size='small'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.discoveredAt
                                                            ? new Date(item.discoveredAt).toLocaleString()
                                                            : new Date().toLocaleString()}
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        {renderAction(item)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </Box>
            )}
        </Root>
    );
};

export default DiscoverAPIs;
