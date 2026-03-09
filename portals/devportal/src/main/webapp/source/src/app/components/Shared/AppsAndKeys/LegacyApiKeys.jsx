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
import { FormattedMessage, useIntl } from 'react-intl';
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
    Block,
    ContentCopy,
    Refresh,
} from '@mui/icons-material';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api';

export default function LegacyApiKeys({ keyType, selectedApp }) {
    const intl = useIntl();

    // API keys state
    const [apiKeys, setApiKeys] = React.useState(null);

    // Revoke key dialog state
    const [revokeConfirmOpen, setRevokeConfirmOpen] = React.useState(false);
    const [revokeSuccessOpen, setRevokeSuccessOpen] = React.useState(false);
    const [revokeErrorOpen, setRevokeErrorOpen] = React.useState(false);
    const [revokeErrorMessage, setRevokeErrorMessage] = React.useState('');
    const [selectedKeyForRevoke, setSelectedKeyForRevoke] = React.useState(null);

    // Regenerate key dialog state
    const [regenerateModalOpen, setRegenerateModalOpen] = React.useState(false);
    const [regeneratedApiKey, setRegeneratedApiKey] = React.useState(null);
    const [regenerateErrorOpen, setRegenerateErrorOpen] = React.useState(false);
    const [regenerateErrorMessage, setRegenerateErrorMessage] = React.useState('');

    // Legacy generation modal state
    const [legacyModalOpen, setLegacyModalOpen] = React.useState(false);
    const [generatedKeyModalOpen, setGeneratedKeyModalOpen] = React.useState(false);
    const [generatedApiKey, setGeneratedApiKey] = React.useState(null);
    const [showToken, setShowToken] = React.useState(false);

    // Legacy generation form state
    const [displayName, setDisplayName] = React.useState('');
    const [validityPeriod, setValidityPeriod] = React.useState('never');
    const [customValidityDays, setCustomValidityDays] = React.useState('');
    const [restrictionType, setRestrictionType] = React.useState('none');
    const [restrictionValue, setRestrictionValue] = React.useState('');

    /**
     * Gets all the legacy API keys for a particular application
     */
    React.useEffect(() => {
        if (selectedApp && selectedApp.appId) {
            const restApi = new API();
            restApi.getAppApiKeys(selectedApp.appId, keyType)
                .then((result) => {
                    setApiKeys(result.body);
                })
                .catch((error) => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(error);
                    }
                    setApiKeys([]);
                });
        }
    }, [selectedApp, keyType]);

    const refreshApiKeys = () => {
        if (selectedApp && selectedApp.appId) {
            const restApi = new API();
            restApi.getAppApiKeys(selectedApp.appId, keyType)
                .then((result) => {
                    setApiKeys(result.body);
                })
                .catch((error) => {
                    console.error('Error refreshing API keys list:', error);
                });
        }
    };

    // Validity period options
    const validityOptions = [
        { value: '30', label: intl.formatMessage({ id: 'LegacyApiKeys.validity.30days', defaultMessage: '30 Days' }) },
        { value: '90', label: intl.formatMessage({ id: 'LegacyApiKeys.validity.90days', defaultMessage: '90 Days' }) },
        { value: '180', label: intl.formatMessage({ id: 'LegacyApiKeys.validity.6months', defaultMessage: '6 Months' }) },
        { value: '365', label: intl.formatMessage({ id: 'LegacyApiKeys.validity.1year', defaultMessage: '1 Year' }) },
        { value: 'never', label: intl.formatMessage({ id: 'LegacyApiKeys.validity.never', defaultMessage: 'Never Expires' }) },
        { value: 'custom', label: intl.formatMessage({ id: 'LegacyApiKeys.validity.custom', defaultMessage: 'Custom' }) },
    ];

    // Restriction options
    const restrictionOptions = [
        { value: 'none', label: intl.formatMessage({ id: 'LegacyApiKeys.restriction.none.label', defaultMessage: 'None' }), description: intl.formatMessage({ id: 'LegacyApiKeys.restriction.none.description', defaultMessage: 'No restrictions applied' }) },
        { value: 'ip', label: intl.formatMessage({ id: 'LegacyApiKeys.restriction.ip.label', defaultMessage: 'Preferred IP' }), description: intl.formatMessage({ id: 'LegacyApiKeys.restriction.ip.description', defaultMessage: 'Restrict by IP address' }) },
        { value: 'referrer', label: intl.formatMessage({ id: 'LegacyApiKeys.restriction.referrer.label', defaultMessage: 'Preferred Referrer' }), description: intl.formatMessage({ id: 'LegacyApiKeys.restriction.referrer.description', defaultMessage: 'Restrict by HTTP referrer' }) },
    ];

    // ── Generate handlers ──────────────────────────────────────────────────

    const handleOpenLegacyModal = () => {
        setLegacyModalOpen(true);
    };

    const handleCloseLegacyModal = () => {
        setLegacyModalOpen(false);
        setDisplayName('');
        setValidityPeriod('never');
        setCustomValidityDays('');
        setRestrictionType('none');
        setRestrictionValue('');
    };

    const handleCloseGeneratedKeyModal = () => {
        setGeneratedKeyModalOpen(false);
        setGeneratedApiKey(null);
        setShowToken(false);
    };

    const handleLegacyGenerateKey = () => {
        if (!displayName.trim()) {
            alert(intl.formatMessage({ id: 'LegacyApiKeys.alert.enterName', defaultMessage: 'Please enter a name for the API key.' }));
            return;
        }
        if (restrictionType !== 'none' && !restrictionValue.trim()) {
            const restrictionOption = restrictionOptions.find((option) => option.value === restrictionType);
            const restrictionLabel = restrictionOption ? restrictionOption.label : '';
            alert(intl.formatMessage({ id: 'LegacyApiKeys.alert.enterRestrictionValue', defaultMessage: 'Please enter a {restrictionLabel} value.' }, { restrictionLabel: restrictionLabel.toLowerCase() }));
            return;
        }
        if (validityPeriod === 'custom' && !customValidityDays) {
            const customDays = Number(customValidityDays);
            if (!Number.isInteger(customDays) || customDays <= 0) {
                alert(intl.formatMessage({ id: 'LegacyApiKeys.alert.invalidCustomDays', defaultMessage: 'Please enter a valid positive number of days for custom validity period.' }));
                return;
            }
        }

        let validityInSeconds;
        if (validityPeriod === 'never') {
            validityInSeconds = -1;
        } else if (validityPeriod === 'custom') {
            validityInSeconds = Number(customValidityDays) * 24 * 60 * 60;
        } else {
            validityInSeconds = Number(validityPeriod) * 24 * 60 * 60;
        }

        const restrictions = {
            permittedIP: restrictionType === 'ip' ? restrictionValue : '',
            permittedReferer: restrictionType === 'referrer' ? restrictionValue : '',
        };

        const restApi = new API();
        restApi.generateAppBoundAPIKey(selectedApp.appId, displayName, keyType, validityInSeconds, restrictions)
            .then((response) => {
                const generatedKey = {
                    keyName: response.body.keyName,
                    apikey: response.body.apikey,
                    validityPeriod: response.body.validityPeriod,
                };
                setGeneratedApiKey(generatedKey);
                setShowToken(true);
                handleCloseLegacyModal();
                setGeneratedKeyModalOpen(true);
                setTimeout(() => { refreshApiKeys(); }, 500);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error('Error generating legacy API key:', error);
                }
                alert(intl.formatMessage({ id: 'LegacyApiKeys.alert.generateFailed', defaultMessage: 'Failed to generate API key. Please try again.' }));
            });
    };

    // ── Revoke handlers ────────────────────────────────────────────────────

    const handleRevokeKey = (keyData) => {
        setSelectedKeyForRevoke(keyData);
        setRevokeConfirmOpen(true);
    };

    const handleConfirmRevoke = () => {
        setRevokeConfirmOpen(false);
        const restApi = new API();
        restApi.revokeAppBoundAPIKey(selectedApp.appId, keyType, selectedKeyForRevoke.keyUUID)
            .then(() => {
                setRevokeSuccessOpen(true);
                refreshApiKeys();
            })
            .catch((error) => {
                console.error('Error revoking legacy key:', error);
                setRevokeErrorMessage(error.message || intl.formatMessage({ id: 'LegacyApiKeys.error.revokeFailed', defaultMessage: 'Failed to revoke API key. Please try again.' }));
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

    // ── Regenerate handlers ────────────────────────────────────────────────

    const handleRegenerateKey = (keyData) => {
        const restApi = new API();
        restApi.regenerateAppBoundAPIKey(selectedApp.appId, keyType, keyData.keyUUID)
            .then((response) => {
                const regenKey = {
                    keyName: response.body.keyName,
                    apikey: response.body.apikey,
                    validityPeriod: response.body.validityPeriod,
                };
                setRegeneratedApiKey(regenKey);
                setRegenerateModalOpen(true);
                setTimeout(() => { refreshApiKeys(); }, 500);
            })
            .catch((error) => {
                console.error('Error regenerating legacy key:', error);
                setRegenerateErrorMessage(error.message || intl.formatMessage({ id: 'LegacyApiKeys.error.regenerateFailed', defaultMessage: 'Failed to regenerate API key. Please try again.' }));
                setRegenerateErrorOpen(true);
            });
    };

    const handleCloseRegenerateModal = () => {
        setRegenerateModalOpen(false);
        setRegeneratedApiKey(null);
        refreshApiKeys();
    };

    const handleCloseRegenerateError = () => {
        setRegenerateErrorOpen(false);
    };

    // ── Table ──────────────────────────────────────────────────────────────

    const legacyKeysData = Array.isArray(apiKeys) ? apiKeys : [];

    const legacyKeysColumns = [
        {
            name: 'keyName',
            label: intl.formatMessage({ id: 'LegacyApiKeys.column.keyName', defaultMessage: 'Key Name' }),
        },
        {
            name: 'issuedOn',
            label: intl.formatMessage({ id: 'LegacyApiKeys.column.issuedOn', defaultMessage: 'Issued On' }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = legacyKeysData[dataIndex];
                    const { issuedOn } = keyData;
                    if (!issuedOn) return '-';
                    try {
                        const date = new Date(issuedOn);
                        const dateOnly = date.toLocaleDateString('en-CA');
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
            label: intl.formatMessage({ id: 'LegacyApiKeys.column.expiresOn', defaultMessage: 'Expires On' }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = legacyKeysData[dataIndex];
                    const { issuedOn, validityPeriod: vp } = keyData;
                    if (vp === -1) {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage id='LegacyApiKeys.table.never' defaultMessage='Never' />
                            </Typography>
                        );
                    }
                    try {
                        const issuedDate = new Date(issuedOn);
                        const expiresDate = new Date(issuedDate.getTime() + (vp * 1000));
                        const dateOnly = expiresDate.toLocaleDateString('en-CA');
                        const fullDateTime = expiresDate.toLocaleString();
                        return (
                            <Tooltip title={fullDateTime} placement='top'>
                                <Typography variant='body2'>{dateOnly}</Typography>
                            </Tooltip>
                        );
                    } catch (error) {
                        return vp;
                    }
                },
            },
        },
        {
            name: 'lastUsed',
            label: intl.formatMessage({ id: 'LegacyApiKeys.column.lastUsedOn', defaultMessage: 'Last Used On' }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = legacyKeysData[dataIndex];
                    const { lastUsed } = keyData;
                    if (lastUsed === 'NOT_USED') {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage id='LegacyApiKeys.table.never' defaultMessage='Never' />
                            </Typography>
                        );
                    }
                    if (!lastUsed) return '-';
                    try {
                        const date = new Date(lastUsed);
                        const dateOnly = date.toLocaleDateString('en-CA');
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
            label: intl.formatMessage({ id: 'LegacyApiKeys.column.actions', defaultMessage: 'Actions' }),
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({ align: 'right' }),
                setCellProps: () => ({ align: 'right' }),
                customHeadRender: () => (
                    <TableCell align='right' className='keys-header'>
                        <FormattedMessage id='LegacyApiKeys.column.actions' defaultMessage='Actions' />
                    </TableCell>
                ),
                customBodyRenderLite: (dataIndex) => {
                    const keyData = legacyKeysData[dataIndex];
                    return (
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            <Button
                                variant='outlined'
                                size='small'
                                color='error'
                                startIcon={<Block />}
                                onClick={() => handleRevokeKey(keyData)}
                            >
                                <FormattedMessage id='LegacyApiKeys.button.revoke' defaultMessage='Revoke' />
                            </Button>
                            <Button
                                variant='outlined'
                                size='small'
                                startIcon={<Refresh />}
                                onClick={() => handleRegenerateKey(keyData)}
                            >
                                <FormattedMessage id='LegacyApiKeys.button.regenerate' defaultMessage='Regenerate' />
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

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <Stack spacing={4}>
            {/* Loading state */}
            {apiKeys === null ? (
                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant='body1' color='text.secondary'>
                            <FormattedMessage id='LegacyApiKeys.loading' defaultMessage='Loading legacy API keys...' />
                        </Typography>
                    </Grid>
                </Grid>
            ) : legacyKeysData.length === 0 ? (
                /* Empty state */
                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ textAlign: 'center', mt: 4, p: 2, color: 'text.secondary' }}>
                        <Typography variant='h5' gutterBottom>
                            <FormattedMessage id='LegacyApiKeys.empty.title' defaultMessage='No Legacy API Keys Found' />
                        </Typography>
                        <Typography variant='subtitle1' gutterBottom sx={{ mb: 3 }}>
                            <FormattedMessage id='LegacyApiKeys.empty.subtitle' defaultMessage='Generate your first legacy API key to access your subscribed APIs from this application.' />
                        </Typography>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={handleOpenLegacyModal}
                            sx={{
                                borderRadius: '999px',
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            <FormattedMessage id='LegacyApiKeys.button.generate' defaultMessage='Generate Legacy API Key' />
                        </Button>
                    </Grid>
                </Grid>
            ) : (
                /* Legacy API Keys table */
                <Paper
                    className='keys-panel'
                    sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}
                >
                    <Stack spacing={3}>
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Box>
                                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                                    <FormattedMessage id='LegacyApiKeys.title' defaultMessage='Legacy API Keys' />
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                                    <FormattedMessage id='LegacyApiKeys.subtitle' defaultMessage='Manage legacy API keys generated for your Applications.' />
                                </Typography>
                            </Box>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleOpenLegacyModal}
                                sx={{ borderRadius: '999px', textTransform: 'none', px: 3 }}
                            >
                                <FormattedMessage id='LegacyApiKeys.button.generate' defaultMessage='Generate Legacy API Key' />
                            </Button>
                        </Box>
                        <MUIDataTable
                            data={legacyKeysData}
                            columns={legacyKeysColumns}
                            options={options}
                        />
                    </Stack>
                </Paper>
            )}

            {/* Generate Legacy API Key Modal */}
            <Dialog
                open={legacyModalOpen}
                onClose={handleCloseLegacyModal}
                maxWidth='md'
                fullWidth
            >
                <DialogTitle>
                    <FormattedMessage id='LegacyApiKeys.modal.generate.title' defaultMessage='Generate Legacy API Key' />
                    <Typography variant='body2' color='text.secondary'>
                        <FormattedMessage id='LegacyApiKeys.modal.generate.subtitle' defaultMessage='Create a new legacy API key for this application to access your subscribed APIs.' />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} padding={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    size='small'
                                    label={intl.formatMessage({ id: 'LegacyApiKeys.field.name.label', defaultMessage: 'Name' })}
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={intl.formatMessage({ id: 'LegacyApiKeys.field.name.placeholder', defaultMessage: 'Enter a name for this API key' })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl size='small' fullWidth>
                                    <InputLabel><FormattedMessage id='LegacyApiKeys.field.validityPeriod.label' defaultMessage='Validity Period' /></InputLabel>
                                    <Select
                                        value={validityPeriod}
                                        label={intl.formatMessage({ id: 'LegacyApiKeys.field.validityPeriod.label', defaultMessage: 'Validity Period' })}
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
                                <Grid item xs={6}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        label={intl.formatMessage({ id: 'LegacyApiKeys.field.days.label', defaultMessage: 'Days' })}
                                        type='number'
                                        value={customValidityDays}
                                        onChange={(e) => setCustomValidityDays(e.target.value)}
                                        placeholder={intl.formatMessage({ id: 'LegacyApiKeys.field.days.placeholder', defaultMessage: 'Enter days' })}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={validityPeriod === 'custom' ? 6 : 6}>
                                <FormControl size='small' fullWidth>
                                    <InputLabel><FormattedMessage id='LegacyApiKeys.field.securityRestriction.label' defaultMessage='Security Restriction' /></InputLabel>
                                    <Select
                                        value={restrictionType}
                                        label={intl.formatMessage({ id: 'LegacyApiKeys.field.securityRestriction.label', defaultMessage: 'Security Restriction' })}
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
                                        label={restrictionType === 'ip'
                                            ? intl.formatMessage({ id: 'LegacyApiKeys.field.ipAddress.label', defaultMessage: 'IP Address' })
                                            : intl.formatMessage({ id: 'LegacyApiKeys.field.referrerUrl.label', defaultMessage: 'Referrer URL' })}
                                        value={restrictionValue}
                                        onChange={(e) => setRestrictionValue(e.target.value)}
                                        placeholder={restrictionType === 'ip'
                                            ? intl.formatMessage({ id: 'LegacyApiKeys.field.ipAddress.placeholder', defaultMessage: 'e.g. 192.168.1.100' })
                                            : intl.formatMessage({ id: 'LegacyApiKeys.field.referrerUrl.placeholder', defaultMessage: 'e.g. https://example.com' })}
                                    />
                                </Grid>
                            )}
                            {restrictionType !== 'none' && (
                                <Grid item xs={12}>
                                    <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                                        {(() => {
                                            const option = restrictionOptions.find((o) => o.value === restrictionType);
                                            return option ? option.description : '';
                                        })()}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLegacyModal}>
                        <FormattedMessage id='LegacyApiKeys.button.cancel' defaultMessage='Cancel' />
                    </Button>
                    <Button
                        onClick={handleLegacyGenerateKey}
                        variant='contained'
                        disabled={!displayName.trim()}
                    >
                        <FormattedMessage id='LegacyApiKeys.button.generate' defaultMessage='Generate Legacy API Key' />
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Generated Key Response Dialog */}
            <Dialog
                open={generatedKeyModalOpen}
                onClose={handleCloseGeneratedKeyModal}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle><FormattedMessage id='LegacyApiKeys.generatedKey.title' defaultMessage='API Key Generated Successfully' /></DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {showToken && generatedApiKey && (
                            <>
                                <Alert severity='warning' sx={{ mb: 0.5 }}>
                                    <Typography variant='h6' component='h3' sx={{ mb: 0.5, fontSize: '0.95rem' }}>
                                        <FormattedMessage id='LegacyApiKeys.copyAlert.title' defaultMessage='Please Copy the API Key' />
                                    </Typography>
                                    <Typography component='p' variant='body2' sx={{ fontSize: '0.875rem' }}>
                                        <FormattedMessage id='LegacyApiKeys.generatedKey.alert.message' defaultMessage='Please copy this generated API Key value as it will be displayed only for the current browser session. (The API Key will not be visible in the UI after the page is refreshed.)' />
                                    </Typography>
                                </Alert>
                                <Box sx={{ mt: 1 }}>
                                    <Typography
                                        variant='subtitle2'
                                        component='label'
                                        htmlFor='generated-api-key-value'
                                        sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.875rem' }}
                                    >
                                        <FormattedMessage id='LegacyApiKeys.keyLabel' defaultMessage='API Key' />
                                        {' - '}
                                        <Typography
                                            component='span'
                                            variant='subtitle2'
                                            sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.875rem' }}
                                        >
                                            {generatedApiKey.keyName}
                                        </Typography>
                                    </Typography>
                                    <TextField
                                        id='generated-api-key-value'
                                        defaultValue={generatedApiKey.apikey}
                                        multiline
                                        fullWidth
                                        rows={1}
                                        variant='outlined'
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <Tooltip title={intl.formatMessage({ id: 'LegacyApiKeys.tooltip.copyToClipboard', defaultMessage: 'Copy to clipboard' })} placement='top'>
                                                        <IconButton
                                                            aria-label={intl.formatMessage({ id: 'LegacyApiKeys.tooltip.copyToClipboard', defaultMessage: 'Copy to clipboard' })}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(generatedApiKey.apikey);
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
                                        <FormattedMessage id='LegacyApiKeys.validityHelperText' defaultMessage='Above API Key has a validity period of' />
                                        {' '}
                                        <strong>
                                            {generatedApiKey.validityPeriod === -1
                                                ? <FormattedMessage id='LegacyApiKeys.validity.neverExpires' defaultMessage='Never Expires' />
                                                : <FormattedMessage id='LegacyApiKeys.validity.seconds' defaultMessage='{seconds} seconds' values={{ seconds: generatedApiKey.validityPeriod }} />}
                                        </strong>
                                        .
                                    </FormHelperText>
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGeneratedKeyModal} variant='contained'>
                        <FormattedMessage id='LegacyApiKeys.button.close' defaultMessage='Close' />
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Confirmation Dialog */}
            <Dialog open={revokeConfirmOpen} onClose={handleCancelRevoke} maxWidth='xs' fullWidth>
                <DialogTitle><FormattedMessage id='LegacyApiKeys.revokeConfirm.title' defaultMessage='Confirm Revoke' /></DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='LegacyApiKeys.revokeConfirm.message'
                            defaultMessage='Are you sure you want to revoke the API key {keyName}? This action cannot be undone.'
                            values={{ keyName: <strong>{selectedKeyForRevoke?.keyName}</strong> }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRevoke}><FormattedMessage id='LegacyApiKeys.button.cancel' defaultMessage='Cancel' /></Button>
                    <Button onClick={handleConfirmRevoke} variant='contained' color='error'>
                        <FormattedMessage id='LegacyApiKeys.button.revoke' defaultMessage='Revoke' />
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Success Dialog */}
            <Dialog open={revokeSuccessOpen} onClose={handleCloseRevokeSuccess} maxWidth='xs' fullWidth>
                <DialogTitle><FormattedMessage id='LegacyApiKeys.revokeSuccess.title' defaultMessage='API Key Revoked' /></DialogTitle>
                <DialogContent>
                    <Typography><FormattedMessage id='LegacyApiKeys.revokeSuccess.message' defaultMessage='The API key has been successfully revoked.' /></Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRevokeSuccess} variant='contained'><FormattedMessage id='LegacyApiKeys.button.ok' defaultMessage='OK' /></Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Error Dialog */}
            <Dialog open={revokeErrorOpen} onClose={handleCloseRevokeError} maxWidth='xs' fullWidth>
                <DialogTitle><FormattedMessage id='LegacyApiKeys.revokeError.title' defaultMessage='Revoke Failed' /></DialogTitle>
                <DialogContent>
                    <Typography>{revokeErrorMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRevokeError} variant='contained'><FormattedMessage id='LegacyApiKeys.button.ok' defaultMessage='OK' /></Button>
                </DialogActions>
            </Dialog>

            {/* Regenerate Key Response Dialog */}
            <Dialog
                open={regenerateModalOpen}
                onClose={handleCloseRegenerateModal}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle><FormattedMessage id='LegacyApiKeys.regenerateKey.title' defaultMessage='API Key Regenerated Successfully' /></DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {regeneratedApiKey && (
                            <>
                                <Alert severity='warning' sx={{ mb: 0.5 }}>
                                    <Typography variant='h6' component='h3' sx={{ mb: 0.5, fontSize: '0.95rem' }}>
                                        <FormattedMessage id='LegacyApiKeys.copyAlert.title' defaultMessage='Please Copy the API Key' />
                                    </Typography>
                                    <Typography component='p' variant='body2' sx={{ fontSize: '0.875rem' }}>
                                        <FormattedMessage id='LegacyApiKeys.regenerateKey.alert.message' defaultMessage='Please copy this regenerated API Key value as it will be displayed only for the current browser session. (The API Key will not be visible in the UI after the page is refreshed.)' />
                                    </Typography>
                                </Alert>
                                <Box sx={{ mt: 1 }}>
                                    <Typography
                                        variant='subtitle2'
                                        component='label'
                                        htmlFor='legacy-regenerated-api-key-value'
                                        sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.875rem' }}
                                    >
                                        <FormattedMessage id='LegacyApiKeys.keyLabel' defaultMessage='API Key' />
                                        {' - '}
                                        <Typography
                                            component='span'
                                            variant='subtitle2'
                                            sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.875rem' }}
                                        >
                                            {regeneratedApiKey.keyName}
                                        </Typography>
                                    </Typography>
                                    <TextField
                                        id='legacy-regenerated-api-key-value'
                                        defaultValue={regeneratedApiKey.apikey}
                                        multiline
                                        fullWidth
                                        rows={1}
                                        variant='outlined'
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <Tooltip title={intl.formatMessage({ id: 'LegacyApiKeys.tooltip.copyToClipboard', defaultMessage: 'Copy to clipboard' })} placement='top'>
                                                        <IconButton
                                                            aria-label={intl.formatMessage({ id: 'LegacyApiKeys.tooltip.copyToClipboard', defaultMessage: 'Copy to clipboard' })}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(regeneratedApiKey.apikey);
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
                                        <FormattedMessage id='LegacyApiKeys.validityHelperText' defaultMessage='Above API Key has a validity period of' />
                                        {' '}
                                        <strong>
                                            {regeneratedApiKey.validityPeriod === -1
                                                ? <FormattedMessage id='LegacyApiKeys.validity.neverExpires' defaultMessage='Never Expires' />
                                                : <FormattedMessage id='LegacyApiKeys.validity.seconds' defaultMessage='{seconds} seconds' values={{ seconds: regeneratedApiKey.validityPeriod }} />}
                                        </strong>
                                        .
                                    </FormHelperText>
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRegenerateModal} variant='contained'><FormattedMessage id='LegacyApiKeys.button.close' defaultMessage='Close' /></Button>
                </DialogActions>
            </Dialog>

            {/* Regenerate Error Dialog */}
            <Dialog open={regenerateErrorOpen} onClose={handleCloseRegenerateError} maxWidth='xs' fullWidth>
                <DialogTitle><FormattedMessage id='LegacyApiKeys.regenerateError.title' defaultMessage='Regenerate Failed' /></DialogTitle>
                <DialogContent>
                    <Typography>{regenerateErrorMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRegenerateError} variant='contained'><FormattedMessage id='LegacyApiKeys.button.ok' defaultMessage='OK' /></Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
