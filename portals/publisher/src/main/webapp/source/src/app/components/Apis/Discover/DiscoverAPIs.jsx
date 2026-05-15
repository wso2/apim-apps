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

const DiscoverAPIs = () => {
    const { data: settings, isLoading } = usePublisherSettings();
    const [selectedGateways, setSelectedGateways] = useState([]);
    const [step, setStep] = useState(1);
    const [discoveredAPIs, setDiscoveredAPIs] = useState([]);
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

        try {
            const token = AuthManager.getUser().getPartialToken();
            const basePath = Utils.getSwaggerURL().replace('/swagger.yaml', '');

            const results = await Promise.all(
                selectedGateways.map(async (gw) => {
                    const newResponse = await fetch(
                        `${basePath}/federated-apis/discover/new?environment=${gw}`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: 'application/json',
                            },
                        }
                    );

                    const updatedResponse = await fetch(
                        `${basePath}/federated-apis/discover/updates?environment=${gw}`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: 'application/json',
                            },
                        }
                    );

                    if (!newResponse.ok || !updatedResponse.ok) {
                        throw new Error(`Failed to discover APIs from ${gw}`);
                    }

                    const newData = await newResponse.json();
                    const updatedData = await updatedResponse.json();

                    const newItems = newData.map((item) => ({
                        ...item,
                        gatewayName: gw,
                        isUpdate: false,
                    }));
                    const updatedItems = updatedData.map((item) => ({
                        ...item,
                        gatewayName: gw,
                        isUpdate: true,
                    }));

                    return [...newItems, ...updatedItems];
                })
            );

            // Flatten the array of arrays
            setDiscoveredAPIs(results.flat());
        } catch (err) {
            setError(err.message);
        } finally {
            setDiscovering(false);
        }
    };

    const handleAction = async (api, gatewayName, isUpdate) => {
        setImportingStates((prev) => ({ ...prev, [api.id]: 'importing' }));
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
                body: JSON.stringify([api.id]),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isUpdate ? 'update' : 'import'} API`);
            }

            setImportingStates((prev) => ({ ...prev, [api.id]: 'success' }));
        } catch (err) {
            console.error(err);
            setImportingStates((prev) => ({ ...prev, [api.id]: 'error' }));
        }
    };

    const renderAction = (item) => {
        const { api, gatewayName, isUpdate } = item;
        const importState = importingStates[api.id];
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
        let buttonText = 'Create';

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
                onClick={() => handleAction(api, gatewayName, isUpdate)}
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
                            <Typography mt={2}>Discovering APIs...</Typography>
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
                                                <TableCell>Gateway Name</TableCell>
                                                <TableCell>Gateway Type</TableCell>
                                                <TableCell>Discovered At</TableCell>
                                                <TableCell align='right'>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {discoveredAPIs.map((item) => {
                                                const { api } = item;
                                                const gwData = gateways.find((g) => g.name === item.gatewayName);
                                                const gwType = gwData ? gwData.gatewayType : 'External';

                                                return (
                                                    <TableRow key={api.id}>
                                                        <TableCell>{api.name}</TableCell>
                                                        <TableCell>{api.version}</TableCell>
                                                        <TableCell>{api.description || '-'}</TableCell>
                                                        <TableCell>{api.context}</TableCell>
                                                        <TableCell>{item.gatewayName}</TableCell>
                                                        <TableCell>{gwType}</TableCell>
                                                        <TableCell>{new Date().toLocaleString()}</TableCell>
                                                        <TableCell align='right'>
                                                            {renderAction(item)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
