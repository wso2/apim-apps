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

import React, { useEffect } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TableCell,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Link,
    LinkOff,
    Block,
    ContentCopy,
} from '@mui/icons-material';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api';
import { useParams } from 'react-router-dom';
import ApiKeyAssociation from './ApiKeyAssociation';
import ApiKeyGenerate from './ApiKeyGenerate';

export default function ApiKeyListing() {
    const params = useParams();
    const apiUUID = params.apiUuid;

    // API keys state for dynamic updates
    const [apiKeys, setApiKeys] = React.useState(null);

    // Revoke key dialog state
    const [revokeConfirmOpen, setRevokeConfirmOpen] = React.useState(false);
    const [revokeSuccessOpen, setRevokeSuccessOpen] = React.useState(false);
    const [revokeErrorOpen, setRevokeErrorOpen] = React.useState(false);
    const [revokeErrorMessage, setRevokeErrorMessage] = React.useState('');
    const [selectedKeyForRevoke, setSelectedKeyForRevoke] = React.useState(null);

    // Subscribed applications state
    const [subscribedApps, setSubscribedApps] = React.useState([]);

    /**
     * Gets all the api keys for a particular API
     */
    useEffect(() => {
        const restApi = new API();

        restApi.getApiApiKeys(apiUUID)
            .then((result) => {
                const apiKeyList = result.body;
                setApiKeys(apiKeyList);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    }, []);

    /**
     * Load subscribed applications for this API
     */
    useEffect(() => {
        const restApi = new API();
        const subscriptionLimit = 5000;

        restApi.getSubscriptions(apiUUID, null, subscriptionLimit)
            .then((response) => {
                const subscriptions = response.obj;
                if (subscriptions && subscriptions.list) {
                    // Extract unique applications from subscriptions
                    const apps = subscriptions.list.map((subscription) => ({
                        id: subscription.applicationId,
                        name: subscription.applicationInfo.name,
                        environment: subscription.applicationInfo.subscriptionCount > 0 ? 'PRODUCTION' : 'SANDBOX',
                    }));
                    setSubscribedApps(apps);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                setSubscribedApps([]);
            });
    }, []);

    // Function to refresh API keys list
    const refreshApiKeys = () => {
        const restApi = new API();
        restApi.getApiApiKeys(apiUUID)
            .then((result) => {
                const apiKeyList = result.body;
                setApiKeys(apiKeyList);
            })
            .catch((error) => {
                console.error('Error refreshing API keys list:', error);
            });
    };

    // Use the custom hook for association/dissociation management
    const {
        handleOpenAssociationModal,
        handleRemoveAssociation,
        renderDialogs: renderAssociationDialogs,
    } = ApiKeyAssociation(apiUUID, refreshApiKeys, subscribedApps);

    // Use the custom hook for generation/regeneration management
    const {
        displayName,
        setDisplayName,
        keyType,
        setKeyType,
        validityPeriod,
        setValidityPeriod,
        customValidityDays,
        setCustomValidityDays,
        restrictionType,
        setRestrictionType,
        restrictionValue,
        setRestrictionValue,
        generationModalOpen,
        isGenerating,
        apikey,
        showToken,
        validityOptions,
        restrictionOptions,
        handleOpenGenerationModal,
        handleCloseGenerationModal,
        handleGenerateKey,
        renderRegenerateButton,
        renderDialogs: renderGenerateDialogs,
    } = ApiKeyGenerate(apiUUID, refreshApiKeys);

    const handleRevokeKey = (keyData) => {
        setSelectedKeyForRevoke(keyData);
        setRevokeConfirmOpen(true);
    };

    const handleConfirmRevoke = () => {
        setRevokeConfirmOpen(false);
        console.log('Revoking key:', selectedKeyForRevoke);
        const restApi = new API();
        restApi.revokeAPIBoundAPIKey(apiUUID, selectedKeyForRevoke.keyUUID)
            .then(() => {
                setRevokeSuccessOpen(true);
                // Refresh the API keys list
                return restApi.getApiApiKeys(apiUUID);
            })
            .then((result) => {
                const apiKeyList = result.body;
                setApiKeys(apiKeyList);
            })
            .catch((error) => {
                console.error('Error revoking key:', error);
                setRevokeErrorMessage(error.message || 'Failed to revoke API key. Please try again.');
                setRevokeErrorOpen(true);
            });
    };

    const handleCancelRevoke = () => {
        setRevokeConfirmOpen(false);
        setSelectedKeyForRevoke(null);
    };

    const handleCloseRevokeSuccess = () => {
        setRevokeSuccessOpen(false);
        setSelectedKeyForRevoke(null);
    };

    const handleCloseRevokeError = () => {
        setRevokeErrorOpen(false);
        setSelectedKeyForRevoke(null);
    };

    const columns = [
        { name: 'keyName', label: 'API Key' },
        {
            name: 'associatedApp',
            label: 'Application',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = apiKeys[dataIndex];
                    const appName = keyData.associatedApp;
                    return appName && appName !== 'NO_ASSOCIATION' ? (
                        <Chip label={appName} size='small' className='keys-chip' />
                    ) : (
                        <Typography variant='body2' color='text.secondary'>
                            -
                        </Typography>
                    );
                },
            },
        },
        {
            name: 'issuedOn',
            label: 'Issued On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = apiKeys[dataIndex];
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
                    const keyData = apiKeys[dataIndex];
                    const { issuedOn, validityPeriod: keyValidityPeriod } = keyData;

                    if (keyValidityPeriod === -1) {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                Never
                            </Typography>
                        );
                    }

                    try {
                        const issuedDate = new Date(issuedOn);
                        const expiresDate = new Date(issuedDate.getTime() + (keyValidityPeriod * 1000));
                        return expiresDate.toLocaleString();
                    } catch (error) {
                        return keyValidityPeriod;
                    }
                },
            },
        },
        {
            name: 'lastUsed',
            label: 'Last Used On',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = apiKeys[dataIndex];
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
                    const keyData = apiKeys[dataIndex];
                    const originalRowData = apiKeys[dataIndex];
                    const hasNoAssociation = !originalRowData.associatedApp
                        || originalRowData.associatedApp === ''
                        || originalRowData.associatedApp === 'NO_ASSOCIATION';

                    return (
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            {hasNoAssociation ? (
                                <Button
                                    variant='outlined'
                                    size='small'
                                    startIcon={<Link />}
                                    onClick={() => handleOpenAssociationModal(keyData)}
                                >
                                    Associate
                                </Button>
                            ) : (
                                <Button
                                    variant='outlined'
                                    size='small'
                                    color='error'
                                    startIcon={<LinkOff />}
                                    onClick={() => handleRemoveAssociation(keyData)}
                                >
                                    Remove Association
                                </Button>
                            )}
                            <Button
                                variant='outlined'
                                size='small'
                                color='error'
                                startIcon={<Block />}
                                onClick={() => handleRevokeKey(keyData)}
                            >
                                Revoke
                            </Button>
                            {renderRegenerateButton(keyData)}
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
        <Stack spacing={4}>
            {/* Check if API keys exist */}
            {apiKeys && apiKeys.length === 0 ? (
                /* Empty state - Show only generate button */
                <Grid container spacing={3}>
                    <Grid
                        item
                        xs={12}
                        sx={{
                            textAlign: 'center', mt: 4, p: 2, color: 'text.secondary',
                        }}
                    >
                        <Typography variant='h5' gutterBottom>
                            No API Keys Found
                        </Typography>
                        <Typography variant='subtitle1' gutterBottom sx={{ mb: 3 }}>
                            Get started by generating your first API key to access this API from your applications.
                        </Typography>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={handleOpenGenerationModal}
                            sx={{
                                borderRadius: '999px',
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            Generate API Key
                        </Button>
                    </Grid>
                </Grid>
            ) : (
                /* API Keys Section */
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
                                    View and manage your current API keys for this API across all applications.
                                </Typography>
                            </Box>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleOpenGenerationModal}
                                sx={{ borderRadius: '999px', textTransform: 'none', px: 3 }}
                            >
                                Generate API Key
                            </Button>
                        </Box>
                        {apiKeys && apiKeys.length > 0 && (
                            <MUIDataTable
                                key={JSON.stringify(apiKeys.map((k) => k.issuedOn))}
                                data={apiKeys}
                                columns={columns}
                                options={options}
                            />
                        )}
                    </Stack>
                </Paper>
            )}

            {/* API Key Generation Modal */}
            <Dialog
                open={generationModalOpen}
                onClose={handleCloseGenerationModal}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle>
                    {showToken ? 'API Key Generated Successfully' : 'Generate New API Key'}
                    <Typography variant='body2' color='text.secondary'>
                        {showToken
                            ? 'Your API key has been generated. Copy it now as it will not be shown again.'
                            : 'Create a new API key for one of your subscribed applications with custom settings.'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {!showToken ? (
                        <Stack spacing={3} padding={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        size='small'
                                        label='Name'
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder='Enter a name for this API key'
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>Key Type</InputLabel>
                                        <Select
                                            value={keyType}
                                            label='Key Type'
                                            onChange={(e) => setKeyType(e.target.value)}
                                        >
                                            <MenuItem value='PRODUCTION'>Production</MenuItem>
                                            <MenuItem value='SANDBOX'>Sandbox</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>Validity Period</InputLabel>
                                        <Select
                                            value={validityPeriod}
                                            label='Validity Period'
                                            onChange={(e) => setValidityPeriod(e.target.value)}
                                        >
                                            {validityOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {validityPeriod === 'custom' && (
                                    <Grid item xs={4}>
                                        <TextField
                                            size='small'
                                            fullWidth
                                            label='Days'
                                            type='number'
                                            value={customValidityDays}
                                            onChange={(e) => setCustomValidityDays(e.target.value)}
                                            placeholder='Enter days'
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={validityPeriod === 'custom' ? 4 : 4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>Security Restriction</InputLabel>
                                        <Select
                                            value={restrictionType}
                                            label='Security Restriction'
                                            onChange={(e) => {
                                                setRestrictionType(e.target.value);
                                                setRestrictionValue('');
                                            }}
                                        >
                                            {restrictionOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {restrictionType !== 'none' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            size='small'
                                            fullWidth
                                            label={restrictionType === 'ip' ? 'IP Address' : 'Referrer URL'}
                                            value={restrictionValue}
                                            onChange={(e) => setRestrictionValue(e.target.value)}
                                            placeholder={restrictionType === 'ip'
                                                ? 'e.g. 192.168.1.100'
                                                : 'e.g. https://example.com'}
                                            sx={{ minWidth: 200 }}
                                        />
                                    </Grid>
                                )}
                                {restrictionType !== 'none' && (
                                    <Grid item xs={12}>
                                        <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ fontStyle: 'italic' }}
                                        >
                                            {(() => {
                                                const selectedOption = restrictionOptions.find(
                                                    (option) => option.value === restrictionType,
                                                );
                                                return selectedOption ? selectedOption.description : '';
                                            })()}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Stack>
                    ) : (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            {apikey && (
                                <>
                                    <Alert severity='warning' sx={{ mb: 0.5 }}>
                                        <Typography variant='h6' component='h3' sx={{ mb: 0.5, fontSize: '0.95rem' }}>
                                            Please Copy the API Key
                                        </Typography>
                                        <Typography component='p' variant='body2' sx={{ fontSize: '0.875rem' }}>
                                            Please copy this generated API Key value as it will be displayed only for
                                            the current browser session. (The API Key will not be visible in the UI
                                            after the page is refreshed.)
                                        </Typography>
                                    </Alert>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography
                                            variant='subtitle2'
                                            component='label'
                                            htmlFor='api-key-value'
                                            sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                display: 'block',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            API Key -
                                            {' '}
                                            <Typography
                                                component='span'
                                                variant='subtitle2'
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {apikey.keyName}
                                            </Typography>
                                        </Typography>
                                        <TextField
                                            id='api-key-value'
                                            defaultValue={apikey.apikey}
                                            multiline
                                            fullWidth
                                            rows={1}
                                            variant='outlined'
                                            InputProps={{
                                                readOnly: true,
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <Tooltip title='Copy to clipboard' placement='top'>
                                                            <IconButton
                                                                aria-label='Copy to clipboard'
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(apikey.apikey);
                                                                }}
                                                                edge='end'
                                                            >
                                                                <ContentCopy color='secondary' />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.813rem',
                                                    bgcolor: 'grey.50',
                                                },
                                            }}
                                        />
                                        <FormHelperText sx={{ mt: 0.75, fontSize: '0.75rem' }}>
                                            Above API Key has a validity period of
                                            {' '}
                                            <strong>
                                                {apikey.validityPeriod === -1 ? 'Never Expires' : `${apikey.validityPeriod} seconds`}
                                            </strong>
                                            .
                                        </FormHelperText>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    {!showToken ? (
                        <>
                            <Button onClick={handleCloseGenerationModal}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerateKey}
                                variant='contained'
                                disabled={!displayName.trim() || isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate API Key'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleCloseGenerationModal}
                            variant='contained'
                        >
                            Close
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Revoke Confirmation Dialog */}
            <Dialog
                open={revokeConfirmOpen}
                onClose={handleCancelRevoke}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Confirm Revoke
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to revoke the API key
                        {' '}
                        <strong>{selectedKeyForRevoke?.keyName}</strong>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRevoke}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmRevoke}
                        variant='contained'
                        color='error'
                    >
                        Revoke
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Success Dialog */}
            <Dialog
                open={revokeSuccessOpen}
                onClose={handleCloseRevokeSuccess}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    API Key Revoked
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        The API key has been successfully revoked.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseRevokeSuccess}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Error Dialog */}
            <Dialog
                open={revokeErrorOpen}
                onClose={handleCloseRevokeError}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Revoke Failed
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {revokeErrorMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseRevokeError}
                        variant='contained'
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Render association/dissociation dialogs from hook */}
            {renderAssociationDialogs()}

            {/* Render generation/regeneration dialogs from hook */}
            {renderGenerateDialogs()}
        </Stack>
    );
}
