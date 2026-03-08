/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com/).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Paper,
    Stack,
    TableCell,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import Block from '@mui/icons-material/Block';
import Search from '@mui/icons-material/Search';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api';

const typeChipSx = {
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
};

export default function ApiKeysView() {
    const [isRevoking, setIsRevoking] = useState(false);
    const [apiKeys, setApiKeys] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Revoke dialog state
    const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
    const [revokeSuccessOpen, setRevokeSuccessOpen] = useState(false);
    const [revokeErrorOpen, setRevokeErrorOpen] = useState(false);
    const [revokeErrorMessage, setRevokeErrorMessage] = useState('');
    const [selectedKeyForRevoke, setSelectedKeyForRevoke] = useState(null);

    /**
     * Load all API keys on mount
     */
    useEffect(() => {
        const restApi = new API();
        restApi.getAllAPIKeys()
            .then((result) => {
                setApiKeys(result.body.list || result.body);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                setApiKeys([]);
            });
    }, []);

    const refreshApiKeys = () => {
        const restApi = new API();
        restApi.getAllAPIKeys()
            .then((result) => {
                setApiKeys(result.body.list || result.body);
            })
            .catch((error) => {
                console.error('Error refreshing API keys:', error);
            });
    };

    const handleRevokeKey = (keyData) => {
        setSelectedKeyForRevoke(keyData);
        setRevokeConfirmOpen(true);
    };

    const handleConfirmRevoke = () => {
        if (!selectedKeyForRevoke?.keyUUID || isRevoking) {
            return;
        }
        if (!selectedKeyForRevoke?.keyUUID) {
            setRevokeErrorMessage('No API key selected for revoke.');
            setRevokeErrorOpen(true);
            return;
        }
        setRevokeConfirmOpen(false);
        setIsRevoking(true);
        const restApi = new API();
        restApi.revokeAPIKeyFromAdmin(selectedKeyForRevoke.keyUUID)
            .then(() => {
                setRevokeSuccessOpen(true);
                refreshApiKeys();
            })
            .catch((error) => {
                console.error('Error revoking key:', error);
                setRevokeErrorMessage(
                    (error.response && error.response.body && error.response.body.description)
                        || error.message
                        || 'Failed to revoke API key. Please try again.',
                );
                setRevokeErrorOpen(true);
            })
            .finally(() => {
                setIsRevoking(false);
            });
    };

    const handleCancelRevoke = () => {
        setRevokeConfirmOpen(false);
        setSelectedKeyForRevoke(null);
    };

    const filteredKeys = (apiKeys || []).filter((row) => {
        const q = searchQuery.toLowerCase();
        return (
            (row.keyName || '').toLowerCase().includes(q)
            || (row.applicationName || '').toLowerCase().includes(q)
            || (row.apiName || '').toLowerCase().includes(q)
            || (row.keyType || '').toLowerCase().includes(q)
            || (row.user || '').toLowerCase().includes(q)
        );
    });

    const columns = [
        { name: 'keyName', label: 'API Key' },
        {
            name: 'applicationName',
            label: 'Application',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const app = filteredKeys[dataIndex].applicationName;
                    return app
                        ? <Chip label={app} size='small' className='keys-chip' />
                        : <Typography variant='body2' color='text.secondary'>-</Typography>;
                },
            },
        },
        {
            name: 'apiName',
            label: 'API',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const api = filteredKeys[dataIndex].apiName;
                    return api
                        ? <Chip label={api} size='small' className='keys-chip' />
                        : <Typography variant='body2' color='text.secondary'>-</Typography>;
                },
            },
        },
        {
            name: 'keyType',
            label: 'Type',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { keyType } = filteredKeys[dataIndex];
                    const isProduction = keyType === 'PRODUCTION';
                    return (
                        <Chip
                            label={keyType}
                            size='small'
                            sx={{
                                ...typeChipSx,
                                backgroundColor: isProduction ? '#FFE7E3' : '#E3F2FD',
                                color: isProduction ? '#B42318' : '#1565C0',
                            }}
                        />
                    );
                },
            },
        },
        { name: 'user', label: 'User' },
        {
            name: 'issuedOn',
            label: 'Issued On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { issuedOn } = filteredKeys[dataIndex];
                    if (!issuedOn) return '-';
                    try {
                        const date = new Date(issuedOn);
                        return (
                            <Tooltip title={date.toLocaleString()} placement='top'>
                                <Typography variant='body2'>
                                    {date.toLocaleDateString('en-CA')}
                                </Typography>
                            </Tooltip>
                        );
                    } catch (e) {
                        return issuedOn;
                    }
                },
            },
        },
        {
            name: 'validityPeriod',
            label: 'Expires On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { issuedOn, validityPeriod } = filteredKeys[dataIndex];
                    if (validityPeriod === -1) {
                        return <Typography variant='body2' color='text.secondary'>Never</Typography>;
                    }
                    try {
                        const expires = new Date(new Date(issuedOn).getTime() + validityPeriod * 1000);
                        return (
                            <Tooltip title={expires.toLocaleString()} placement='top'>
                                <Typography variant='body2'>
                                    {expires.toLocaleDateString('en-CA')}
                                </Typography>
                            </Tooltip>
                        );
                    } catch (e) {
                        return '-';
                    }
                },
            },
        },
        {
            name: 'lastUsed',
            label: 'Last Used On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { lastUsed } = filteredKeys[dataIndex];
                    if (!lastUsed || lastUsed === 'NOT_USED') {
                        return <Typography variant='body2' color='text.secondary'>Never</Typography>;
                    }
                    try {
                        const date = new Date(lastUsed);
                        return (
                            <Tooltip title={date.toLocaleString()} placement='top'>
                                <Typography variant='body2'>
                                    {date.toLocaleDateString('en-CA')}
                                </Typography>
                            </Tooltip>
                        );
                    } catch (e) {
                        return lastUsed;
                    }
                },
            },
        },
        {
            name: 'actions',
            label: 'Actions',
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({ align: 'right' }),
                setCellProps: () => ({ align: 'right' }),
                customHeadRender: () => (
                    <TableCell align='right' className='keys-header'>
                        Actions
                    </TableCell>
                ),
                customBodyRenderLite: (dataIndex) => {
                    const keyData = filteredKeys[dataIndex];
                    return (
                        <Button
                            variant='outlined'
                            size='small'
                            color='error'
                            startIcon={<Block />}
                            onClick={() => handleRevokeKey(keyData)}
                        >
                            Revoke
                        </Button>
                    );
                },
            },
        },
    ];

    const options = {
        selectableRows: 'none',
        filter: false,
        search: false,
        download: false,
        print: false,
        viewColumns: false,
        pagination: false,
        sort: false,
        responsive: 'standard',
        tableBodyMaxHeight: '520px',
    };

    return (
        <Stack spacing={4}>
            <Paper
                className='keys-panel'
                sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    p: 3,
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography variant='h5' sx={{ fontWeight: 600 }}>
                            API Keys
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                            Visibility into key usage by application and environment.
                        </Typography>
                    </Box>
                    <TextField
                        placeholder='Search by key, application, API, type, or user…'
                        size='small'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Search fontSize='small' />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 400 }}
                    />
                    {apiKeys === null ? (
                        <Box display='flex' justifyContent='center' p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <MUIDataTable
                            data={filteredKeys}
                            columns={columns}
                            options={options}
                        />
                    )}
                </Stack>
            </Paper>

            {/* Revoke Confirmation Dialog */}
            <Dialog open={revokeConfirmOpen} onClose={handleCancelRevoke} maxWidth='xs' fullWidth>
                <DialogTitle>Confirm Revoke</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to revoke the API key
                        {' '}
                        <strong>{selectedKeyForRevoke?.keyName}</strong>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRevoke}>Cancel</Button>
                    <Button onClick={handleConfirmRevoke} variant='contained' color='error' disabled={isRevoking}>
                        Revoke
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Success Dialog */}
            <Dialog
                open={revokeSuccessOpen}
                onClose={() => { setRevokeSuccessOpen(false); setSelectedKeyForRevoke(null); }}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>API Key Revoked</DialogTitle>
                <DialogContent>
                    <Typography>The API key has been successfully revoked.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => { setRevokeSuccessOpen(false); setSelectedKeyForRevoke(null); }}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Error Dialog */}
            <Dialog
                open={revokeErrorOpen}
                onClose={() => { setRevokeErrorOpen(false); setSelectedKeyForRevoke(null); }}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>Revoke Failed</DialogTitle>
                <DialogContent>
                    <Typography>{revokeErrorMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => { setRevokeErrorOpen(false); setSelectedKeyForRevoke(null); }}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
