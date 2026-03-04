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

import React from 'react';
import { Link } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    TableCell,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';
import { LinkOff } from '@mui/icons-material';
import LegacyApiKeys from 'AppComponents/Shared/AppsAndKeys/LegacyApiKeys';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api';
import { getBasePath } from 'AppUtils/utils';
import { mdiOpenInNew } from '@mdi/js';
import { Icon as MDIcon } from '@mdi/react';

export default function ApiKeyListing({ keyType, selectedApp }) {
    const [currentTab, setCurrentTab] = React.useState(0);
    const [selectedAPI, setSelectedAPI] = React.useState('');
    const [selectedExistingKey, setSelectedExistingKey] = React.useState('');
    const [associateModalOpen, setAssociateModalOpen] = React.useState(false);


    // Function to refresh associated API keys list (tab 0)
    const refreshAssociatedKeys = () => {
        if (selectedApp && selectedApp.appId) {
            const restApi = new API();
            restApi.getAPIKeyAssociationsForApp(selectedApp.appId, keyType)
                .then((result) => {
                    setAssociatedApiKeysData(Array.isArray(result.body) ? result.body : []);
                })
                .catch((error) => {
                    console.error('Error refreshing associated API keys:', error);
                });
        }
    };

    /**
     * Gets all the associated API key associations for this application
     */
    React.useEffect(() => {
        if (selectedApp && selectedApp.appId) {
            const restApi = new API();
            restApi.getAPIKeyAssociationsForApp(selectedApp.appId, keyType)
                .then((result) => {
                    setAssociatedApiKeysData(Array.isArray(result.body) ? result.body : []);
                })
                .catch((error) => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(error);
                    }
                    setAssociatedApiKeysData([]);
                });
        }
    }, [selectedApp, keyType]);

    // Associate modal state - real data from API
    const [subscribedAPIKeysData, setSubscribedAPIKeysData] = React.useState([]);
    const [associateLoading, setAssociateLoading] = React.useState(false);
    const [associateSuccessOpen, setAssociateSuccessOpen] = React.useState(false);
    const [associateErrorOpen, setAssociateErrorOpen] = React.useState(false);
    const [associateErrorMessage, setAssociateErrorMessage] = React.useState('');

    // Associated API keys state (tab 0) - real data from API
    const [associatedApiKeysData, setAssociatedApiKeysData] = React.useState(null);

    // Dissociate dialog state for associated keys
    const [dissociateConfirmOpen, setDissociateConfirmOpen] = React.useState(false);
    const [dissociateSuccessOpen, setDissociateSuccessOpen] = React.useState(false);
    const [dissociateErrorOpen, setDissociateErrorOpen] = React.useState(false);
    const [dissociateErrorMessage, setDissociateErrorMessage] = React.useState('');
    const [selectedKeyForDissociate, setSelectedKeyForDissociate] = React.useState(null);

    // Data for associated API keys (tab 0) - real data from getAPIKeyAssociationsForApp
    const associatedKeysData = Array.isArray(associatedApiKeysData) ? associatedApiKeysData : [];

    // Derive unique APIs from the subscribed API keys response
    const uniqueSubscribedAPIs = Array.from(
        new Map(
            subscribedAPIKeysData.map((item) => [
                item.apiUUID,
                { apiUUID: item.apiUUID, apiName: item.apiName },
            ])
        ).values()
    );

    // Keys available for the currently selected API
    const keysForSelectedAPI = subscribedAPIKeysData.filter(
        (item) => item.apiUUID === selectedAPI
    );

    const handleAssociateKey = () => {
        if (!selectedAPI) {
            alert('Please select an API first.');
            return;
        }
        if (!selectedExistingKey) {
            alert('Please select an existing API key to associate.');
            return;
        }
        const restApi = new API();
        restApi.associateAPIKeyToApp(selectedAPI, selectedExistingKey, selectedApp.appId, keyType)
            .then((response) => {
                handleCloseAssociateModal();
                setAssociateSuccessOpen(true);
                setTimeout(() => { refreshAssociatedKeys(); }, 500);
            })
            .catch((error) => {
                console.error('Error associating key:', error);
                handleCloseAssociateModal();
                setAssociateErrorMessage(
                    error.response?.body?.description || 'Failed to associate API key. Please try again.',
                );
                setAssociateErrorOpen(true);
            });
    };

    const handleCloseAssociateSuccess = () => {
        setAssociateSuccessOpen(false);
    };

    const handleCloseAssociateError = () => {
        setAssociateErrorOpen(false);
        setAssociateErrorMessage('');
    };

    // Dissociate handlers for associated keys
    const handleRemoveAssociation = (keyData) => {
        setSelectedKeyForDissociate(keyData);
        setDissociateConfirmOpen(true);
    };

    const handleConfirmDissociate = () => {
        setDissociateConfirmOpen(false);
        const restApi = new API();
        restApi.dissociateAPIKeyFromApp(selectedApp.appId, keyType, selectedKeyForDissociate.keyUUID)
            .then((response) => {
                setDissociateSuccessOpen(true);
                setTimeout(() => { refreshAssociatedKeys(); }, 500);
            })
            .catch((error) => {
                console.error('Error dissociating key:', error);
                setDissociateErrorMessage(
                    error.response?.body?.description || 'Failed to remove association. Please try again.',
                );
                setDissociateErrorOpen(true);
            });
    };

    const handleCancelDissociate = () => {
        setDissociateConfirmOpen(false);
        setSelectedKeyForDissociate(null);
    };

    const handleCloseDissociateSuccess = () => {
        setDissociateSuccessOpen(false);
        setSelectedKeyForDissociate(null);
    };

    const handleCloseDissociateError = () => {
        setDissociateErrorOpen(false);
        setSelectedKeyForDissociate(null);
    };

    const handleOpenAssociateModal = () => {
        setAssociateModalOpen(true);
        setAssociateLoading(true);
        const restApi = new API();
        restApi.getSubscribedAPIsWithAPIKeys(selectedApp.appId, keyType)
            .then((result) => {
                setSubscribedAPIKeysData(Array.isArray(result.body) ? result.body : []);
                setAssociateLoading(false);
            })
            .catch((error) => {
                console.error('Error loading subscribed APIs with keys:', error);
                setSubscribedAPIKeysData([]);
                setAssociateLoading(false);
            });
    };

    const handleCloseAssociateModal = () => {
        setAssociateModalOpen(false);
        setSelectedAPI('');
        setSelectedExistingKey('');
        setSubscribedAPIKeysData([]);
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Columns for associated API keys (tab 0) - real data from getAPIKeyAssociationsForApp
    const associatedKeysColumns = [
        {
            name: 'keyName',
            label: 'Key Name',
        },
        {
            name: 'apiName',
            label: 'API',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = associatedKeysData[dataIndex];
                    if (!keyData.apiName) {
                        return <Typography variant='body2' color='text.secondary'>-</Typography>;
                    }
                    return (
                        <Link
                            to={`${getBasePath()}${keyData.apiUUID}/overview`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {keyData.apiName}
                            {' '}
                            <MDIcon path={mdiOpenInNew} size='12px' />
                        </Link>
                    );
                },
            },
        },
        {
            name: 'issuedOn',
            label: 'Issued On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = associatedKeysData[dataIndex];
                    const { issuedOn } = keyData;
                    if (!issuedOn) return '-';
                    try {
                        const date = new Date(issuedOn);
                        const dateOnly = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
                        const fullDateTime = date.toLocaleString();
                        return (
                            <Tooltip title={fullDateTime} placement='top'>
                                <Typography variant='body2'>{dateOnly}</Typography>
                            </Tooltip>
                        );
                    } catch (error) {
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
                    const keyData = associatedKeysData[dataIndex];
                    const { issuedOn, validityPeriod } = keyData;

                    if (validityPeriod === -1) {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                Never
                            </Typography>
                        );
                    }

                    try {
                        const issuedDate = new Date(issuedOn);
                        const expiresDate = new Date(issuedDate.getTime() + (validityPeriod * 1000));
                        const dateOnly = expiresDate.toLocaleDateString('en-CA');
                        const fullDateTime = expiresDate.toLocaleString();
                        return (
                            <Tooltip title={fullDateTime} placement='top'>
                                <Typography variant='body2'>{dateOnly}</Typography>
                            </Tooltip>
                        );
                    } catch (error) {
                        return validityPeriod;
                    }
                },
            },
        },
        {
            name: 'lastUsed',
            label: 'Last Used On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = associatedKeysData[dataIndex];
                    const { lastUsed } = keyData;
                    if (lastUsed === 'NOT_USED') {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                Never
                            </Typography>
                        );
                    }
                    if (!lastUsed) return '-';
                    try {
                        const date = new Date(lastUsed);
                        const dateOnly = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
                        const fullDateTime = date.toLocaleString();
                        return (
                            <Tooltip title={fullDateTime} placement='top'>
                                <Typography variant='body2'>{dateOnly}</Typography>
                            </Tooltip>
                        );
                    } catch (error) {
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
                    const keyData = associatedKeysData[dataIndex];
                    return (
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            <Button
                                variant='outlined'
                                size='small'
                                color='error'
                                startIcon={<LinkOff />}
                                onClick={() => handleRemoveAssociation(keyData)}
                            >
                                Remove Association
                            </Button>
                        </Stack>
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
        <Box>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label='API Keys' />
                    <Tab label='Legacy API Keys' />
                </Tabs>
            </Box>

            {/* Tab Content */}
            {currentTab === 0 && (
                <Stack spacing={4}>
                    {/* Loading state while fetching from API */}
                    {associatedApiKeysData === null ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
                                <CircularProgress size={24} />
                                <Typography variant='body1' color='text.secondary'>
                                    Loading API key associations...
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : associatedKeysData.length === 0 ? (
                    /* Empty state - Show only associate button */
                        <Grid container spacing={3}>
                            <Grid item xs={12} sx={{ textAlign: 'center', mt: 4, p: 2, color: 'text.secondary' }}>
                                <Typography variant='h5' gutterBottom>
                                    No API Keys Found
                                </Typography>
                                <Typography variant='subtitle1' gutterBottom sx={{ mb: 3 }}>
                                    Get started by associating an existing API key with your subscribed APIs.
                                </Typography>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={handleOpenAssociateModal}
                                    sx={{
                                        borderRadius: '999px',
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Associate API Key
                                </Button>
                            </Grid>
                        </Grid>
                    ) : (
                    /* Associated API Keys Section */
                        <Paper
                            className='keys-panel'
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 3,
                            }}
                        >
                            <Stack spacing={3}>
                                <Box display='flex' justifyContent='space-between' alignItems='center'>
                                    <Box>
                                        <Typography variant='h5' sx={{ fontWeight: 600 }}>
                                            API Keys
                                        </Typography>
                                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                                            View and manage API keys that have been associated with APIs from this application.
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={handleOpenAssociateModal}
                                        sx={{ borderRadius: '999px', textTransform: 'none', px: 3 }}
                                    >
                                        Associate API Key
                                    </Button>
                                </Box>
                                <MUIDataTable
                                    data={associatedKeysData}
                                    columns={associatedKeysColumns}
                                    options={options}
                                />
                            </Stack>
                        </Paper>
                    )}

                    {/* Associate API Key Modal */}
                    <Dialog
                        open={associateModalOpen}
                        onClose={handleCloseAssociateModal}
                        maxWidth='md'
                        fullWidth
                    >
                        <DialogTitle>
                            Associate Existing API Key
                            <Typography variant='body2' color='text.secondary'>
                                Associate an existing API key from your subscribed APIs to this application.
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={3} padding={2}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl size='small' fullWidth disabled={associateLoading}>
                                            <InputLabel>Select API</InputLabel>
                                            <Select
                                                value={selectedAPI}
                                                label='Select API'
                                                onChange={(e) => {
                                                    setSelectedAPI(e.target.value);
                                                    setSelectedExistingKey('');
                                                }}
                                            >
                                                {uniqueSubscribedAPIs.length === 0 && !associateLoading && (
                                                    <MenuItem disabled value=''>
                                                        No subscribed APIs found
                                                    </MenuItem>
                                                )}
                                                {uniqueSubscribedAPIs.map((api) => (
                                                    <MenuItem key={api.apiUUID} value={api.apiUUID}>
                                                        {api.apiName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl size='small' fullWidth disabled={!selectedAPI || associateLoading}>
                                            <InputLabel>Select Existing API Key</InputLabel>
                                            <Select
                                                value={selectedExistingKey}
                                                label='Select Existing API Key'
                                                onChange={(e) => setSelectedExistingKey(e.target.value)}
                                            >
                                                {keysForSelectedAPI.length === 0 && selectedAPI && (
                                                    <MenuItem disabled value=''>
                                                        No API keys available for this API
                                                    </MenuItem>
                                                )}
                                                {keysForSelectedAPI.map((key) => (
                                                    <MenuItem key={key.keyUUID} value={key.keyUUID}>
                                                        {key.keyName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    {associateLoading && (
                                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={16} />
                                            <Typography variant='caption' color='text.secondary'>
                                                Loading subscribed APIs and keys...
                                            </Typography>
                                        </Grid>
                                    )}
                                    {!associateLoading && selectedAPI && keysForSelectedAPI.length === 0 && (
                                        <Grid item xs={12}>
                                            <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                                                No API keys are available to associate with this API
                                            </Typography>
                                        </Grid>
                                    )}
                                    {!associateLoading && selectedAPI && keysForSelectedAPI.length > 0 && !selectedExistingKey && (
                                        <Grid item xs={12}>
                                            <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                                                Select an API key to associate with the selected API
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseAssociateModal}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssociateKey}
                                variant='contained'
                                disabled={!selectedAPI || !selectedExistingKey}
                            >
                                Associate API Key
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Stack>
            )}

            {currentTab === 1 && (
                <LegacyApiKeys keyType={keyType} selectedApp={selectedApp} />
            )}

            {/* Dissociate Confirmation Dialog */}
            <Dialog
                open={dissociateConfirmOpen}
                onClose={handleCancelDissociate}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Confirm Remove Association
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove this API key association?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDissociate}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDissociate}
                        variant='contained'
                        color='error'
                    >
                        Remove Association
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dissociate Success Dialog */}
            <Dialog
                open={dissociateSuccessOpen}
                onClose={handleCloseDissociateSuccess}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Association Removed
                </DialogTitle>
                <DialogContent>
                    <Alert severity='success' sx={{ mb: 1 }}>
                        API key association has been successfully removed.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDissociateSuccess}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dissociate Error Dialog */}
            <Dialog
                open={dissociateErrorOpen}
                onClose={handleCloseDissociateError}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Remove Association Failed
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {dissociateErrorMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDissociateError}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Associate Success Dialog */}
            <Dialog
                open={associateSuccessOpen}
                onClose={handleCloseAssociateSuccess}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Association Successful
                </DialogTitle>
                <DialogContent>
                    <Alert severity='success' sx={{ mb: 1 }}>
                        API key has been successfully associated with the application.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseAssociateSuccess}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Associate Error Dialog */}
            <Dialog
                open={associateErrorOpen}
                onClose={handleCloseAssociateError}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Association Failed
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {associateErrorMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseAssociateError}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
