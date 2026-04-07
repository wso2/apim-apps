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
import { FormattedMessage, useIntl } from 'react-intl';
import CONSTANTS from 'AppData/Constants';
import Application from 'AppData/Application';
import ApiKeyAssociation from './ApiKeyAssociation';
import ApiKeyGenerate from './ApiKeyGenerate';

/**
 * Component for listing and managing API keys for a specific API
 * @returns {React.Component} ApiKeyListing component
 */
export default function ApiKeyListing() {
    const params = useParams();
    const apiUUID = params.apiUuid;
    const intl = useIntl();

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
    }, [apiUUID]);

    /**
     * Fetch all applications and filter approved ones for subscriptionless APIs
     * @param {number} subscriptionLimit - Maximum number of applications to fetch
     */
    const fetchAllApplications = (subscriptionLimit) => {
        Application.all(subscriptionLimit, 0, 'asc', 'name', '')
            .then((appResponse) => {
                if (appResponse?.list) {
                    const appList = appResponse.list.filter((app) => app.status === 'APPROVED');
                    if (appList.length > 0) {
                        setSubscribedApps(appList.map((app) => ({
                            id: app.applicationId,
                            name: app.name,
                            environment: app.subscriptionCount > 0 ? 'PRODUCTION' : 'SANDBOX',
                        })));
                    }
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                setSubscribedApps([]);
            });
    };

    /**
     * Fetch subscriptions for subscription-based APIs
     * @param {Object} restApi - API client instance
     * @param {number} subscriptionLimit - Maximum number of subscriptions to fetch
     */
    const fetchSubscriptions = (restApi, subscriptionLimit) => {
        restApi.getSubscriptions(apiUUID, null, subscriptionLimit)
            .then((response) => {
                const subscriptions = response.obj;
                if (subscriptions?.list) {
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
    };

    /**
     * Load subscribed applications for this API
     * Depending on the API's subscription validation configuration.
     */
    useEffect(() => {
        const restApi = new API();
        const subscriptionLimit = 5000;

        restApi.getAPIById(apiUUID)
            .then((apiResponse) => {
                const apiData = apiResponse.obj;
                const isSubValidationDisabled = apiData.tiers?.length === 1
                    && apiData.tiers[0].tierName.includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);

                if (isSubValidationDisabled) {
                    fetchAllApplications(subscriptionLimit);
                } else {
                    fetchSubscriptions(restApi, subscriptionLimit);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    }, [apiUUID]);

    // Function to refresh API keys list
    const refreshApiKeys = () => {
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
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                setRevokeErrorMessage(
                    error.message || intl.formatMessage({
                        id: 'Apis.Details.APIKeys.ApiKeyListing.error.revokeFailed',
                        defaultMessage: 'Failed to revoke API key. Please try again.',
                    }),
                );
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
        {
            name: 'keyName',
            label: intl.formatMessage({ id: 'Apis.Details.APIKeys.ApiKeyListing.column.apiKey', defaultMessage: 'API Key' }),
        },
        {
            name: 'associatedApp',
            label: intl.formatMessage({ id: 'Apis.Details.APIKeys.ApiKeyListing.column.application', defaultMessage: 'Application' }),
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
            label: intl.formatMessage({ id: 'Apis.Details.APIKeys.ApiKeyListing.column.issuedOn', defaultMessage: 'Issued On' }),
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
            label: intl.formatMessage({ id: 'Apis.Details.APIKeys.ApiKeyListing.column.expiresOn', defaultMessage: 'Expires On' }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = apiKeys[dataIndex];
                    const { issuedOn, validityPeriod: keyValidityPeriod } = keyData;

                    if (keyValidityPeriod === -1) {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.table.never' defaultMessage='Never' />
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
            label: intl.formatMessage({ id: 'Apis.Details.APIKeys.ApiKeyListing.column.lastUsedOn', defaultMessage: 'Last Used On' }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const keyData = apiKeys[dataIndex];
                    const { lastUsed } = keyData;
                    if (lastUsed === 'NOT_USED') {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.table.never' defaultMessage='Never' />
                            </Typography>
                        );
                    }
                    if (lastUsed == null) {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.table.never' defaultMessage='Not Used' />
                            </Typography>
                        );
                    }
                    try {
                        const date = new Date(lastUsed);
                        const dateOnly = date.toLocaleDateString(undefined, {
                            year: 'numeric', month: '2-digit', day: '2-digit',
                        });
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
            label: intl.formatMessage({ id: 'Apis.Details.APIKeys.ApiKeyListing.column.actions', defaultMessage: 'Actions' }),
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({ align: 'right' }),
                setCellProps: () => ({ align: 'right' }),
                customHeadRender: () => (
                    <TableCell align='right' className='keys-header'>
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.column.actions' defaultMessage='Actions' />
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
                                    <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.associate' defaultMessage='Associate' />
                                </Button>
                            ) : (
                                <Button
                                    variant='outlined'
                                    size='small'
                                    color='error'
                                    startIcon={<LinkOff />}
                                    onClick={() => handleRemoveAssociation(keyData)}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.APIKeys.ApiKeyListing.button.removeAssociation'
                                        defaultMessage='Remove Association'
                                    />
                                </Button>
                            )}
                            <Button
                                variant='outlined'
                                size='small'
                                color='error'
                                startIcon={<Block />}
                                onClick={() => handleRevokeKey(keyData)}
                            >
                                <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.revoke' defaultMessage='Revoke' />
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
                            <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.emptyState.title' defaultMessage='No API Keys Found' />
                        </Typography>
                        <Typography variant='subtitle1' gutterBottom sx={{ mb: 3 }}>
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyListing.emptyState.description'
                                defaultMessage='Get started by generating your first API key to access this API from your applications.'
                            />
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
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyListing.button.generateApiKey'
                                defaultMessage='Generate API Key'
                            />
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
                                    <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.section.title' defaultMessage='API Keys' />
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                                    <FormattedMessage
                                        id='Apis.Details.APIKeys.ApiKeyListing.section.description'
                                        defaultMessage='View and manage your current API keys for this API across all applications.'
                                    />
                                </Typography>
                            </Box>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleOpenGenerationModal}
                                sx={{ borderRadius: '999px', textTransform: 'none', px: 3 }}
                            >
                                <FormattedMessage
                                    id='Apis.Details.APIKeys.ApiKeyListing.button.generateApiKey'
                                    defaultMessage='Generate API Key'
                                />
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
                    {showToken
                        ? (
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyListing.dialog.generate.successTitle'
                                defaultMessage='API Key Generated Successfully'
                            />
                        )
                        : (
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyListing.dialog.generate.title'
                                defaultMessage='Generate New API Key'
                            />
                        )}
                    <Typography variant='body2' color='text.secondary'>
                        {showToken ? (
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyListing.dialog.generate.successSubtitle'
                                defaultMessage='Your API key has been generated. Copy it now as it will not be shown again.'
                            />
                        ) : (
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyListing.dialog.generate.subtitle'
                                defaultMessage='Create a new API key for one of your subscribed applications with custom settings.'
                            />
                        )}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {!showToken ? (
                        <Stack spacing={3} padding={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        size='small'
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.APIKeys.ApiKeyListing.input.name.label',
                                            defaultMessage: 'Name',
                                        })}
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Details.APIKeys.ApiKeyListing.input.name.placeholder',
                                            defaultMessage: 'Enter a name for this API key',
                                        })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.input.keyType.label'
                                                defaultMessage='Key Type'
                                            />
                                        </InputLabel>
                                        <Select
                                            value={keyType}
                                            label={intl.formatMessage({
                                                id: 'Apis.Details.APIKeys.ApiKeyListing.input.keyType.label',
                                                defaultMessage: 'Key Type',
                                            })}
                                            onChange={(e) => setKeyType(e.target.value)}
                                        >
                                            <MenuItem value='PRODUCTION'>
                                                <FormattedMessage
                                                    id='Apis.Details.APIKeys.ApiKeyListing.keyType.production'
                                                    defaultMessage='Production'
                                                />
                                            </MenuItem>
                                            <MenuItem value='SANDBOX'>
                                                <FormattedMessage
                                                    id='Apis.Details.APIKeys.ApiKeyListing.keyType.sandbox'
                                                    defaultMessage='Sandbox'
                                                />
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.input.validityPeriod.label'
                                                defaultMessage='Validity Period'
                                            />
                                        </InputLabel>
                                        <Select
                                            value={validityPeriod}
                                            label={intl.formatMessage({
                                                id: 'Apis.Details.APIKeys.ApiKeyListing.input.validityPeriod.label',
                                                defaultMessage: 'Validity Period',
                                            })}
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
                                            label={intl.formatMessage({
                                                id: 'Apis.Details.APIKeys.ApiKeyListing.input.days.label',
                                                defaultMessage: 'Days',
                                            })}
                                            type='number'
                                            value={customValidityDays}
                                            onChange={(e) => setCustomValidityDays(e.target.value)}
                                            placeholder={intl.formatMessage({
                                                id: 'Apis.Details.APIKeys.ApiKeyListing.input.days.placeholder',
                                                defaultMessage: 'Enter days',
                                            })}
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={validityPeriod === 'custom' ? 4 : 4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.input.securityRestriction.label'
                                                defaultMessage='Security Restriction'
                                            />
                                        </InputLabel>
                                        <Select
                                            value={restrictionType}
                                            label={intl.formatMessage({
                                                id: 'Apis.Details.APIKeys.ApiKeyListing.input.securityRestriction.label',
                                                defaultMessage: 'Security Restriction',
                                            })}
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
                                                ? intl.formatMessage({
                                                    id: 'Apis.Details.APIKeys.ApiKeyListing.input.ipAddress.label',
                                                    defaultMessage: 'IP Address',
                                                })
                                                : intl.formatMessage({
                                                    id: 'Apis.Details.APIKeys.ApiKeyListing.input.referrerUrl.label',
                                                    defaultMessage: 'Referrer URL',
                                                })}
                                            value={restrictionValue}
                                            onChange={(e) => setRestrictionValue(e.target.value)}
                                            placeholder={restrictionType === 'ip'
                                                ? intl.formatMessage({
                                                    id: 'Apis.Details.APIKeys.ApiKeyListing.input.ipAddress.placeholder',
                                                    defaultMessage: 'e.g. 192.168.1.100',
                                                })
                                                : intl.formatMessage({
                                                    id: 'Apis.Details.APIKeys.ApiKeyListing.input.referrerUrl.placeholder',
                                                    defaultMessage: 'e.g. https://example.com',
                                                })}
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
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.alert.copyKey.title'
                                                defaultMessage='Please Copy the API Key'
                                            />
                                        </Typography>
                                        <Typography component='p' variant='body2' sx={{ fontSize: '0.875rem' }}>
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.alert.copyKey.description'
                                                defaultMessage={
                                                    'Please copy this generated API Key value as it will be'
                                                    + ' displayed only for the current browser session.'
                                                    + ' (The API Key will not be visible in the UI'
                                                    + ' after the page is refreshed.)'
                                                }
                                            />
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
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.label.apiKeyPrefix'
                                                defaultMessage='API Key -'
                                            />
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
                                                        <Tooltip
                                                            title={intl.formatMessage({
                                                                id: 'Apis.Details.APIKeys.ApiKeyListing.tooltip.copyToClipboard',
                                                                defaultMessage: 'Copy to clipboard',
                                                            })}
                                                            placement='top'
                                                        >
                                                            <IconButton
                                                                aria-label={intl.formatMessage({
                                                                    id: 'Apis.Details.APIKeys.ApiKeyListing.tooltip.copyToClipboard',
                                                                    defaultMessage: 'Copy to clipboard',
                                                                })}
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
                                            <FormattedMessage
                                                id='Apis.Details.APIKeys.ApiKeyListing.helperText.validityPeriod'
                                                defaultMessage='Above API Key has a validity period of {validity}.'
                                                values={{
                                                    validity: (
                                                        <strong>
                                                            {apikey.validityPeriod === -1
                                                                ? (
                                                                    <FormattedMessage
                                                                        id='Apis.Details.APIKeys.ApiKeyListing.validity.neverExpires'
                                                                        defaultMessage='Never Expires'
                                                                    />
                                                                )
                                                                : (
                                                                    <FormattedMessage
                                                                        id='Apis.Details.APIKeys.ApiKeyListing.validity.seconds'
                                                                        defaultMessage='{seconds} seconds'
                                                                        values={{
                                                                            seconds: apikey.validityPeriod,
                                                                        }}
                                                                    />
                                                                )}
                                                        </strong>
                                                    ),
                                                }}
                                            />
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
                                <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.cancel' defaultMessage='Cancel' />
                            </Button>
                            <Button
                                onClick={handleGenerateKey}
                                variant='contained'
                                disabled={!displayName.trim() || isGenerating}
                            >
                                {isGenerating
                                    ? (
                                        <FormattedMessage
                                            id='Apis.Details.APIKeys.ApiKeyListing.button.generating'
                                            defaultMessage='Generating...'
                                        />
                                    )
                                    : (
                                        <FormattedMessage
                                            id='Apis.Details.APIKeys.ApiKeyListing.button.generateApiKey'
                                            defaultMessage='Generate API Key'
                                        />
                                    )}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleCloseGenerationModal}
                            variant='contained'
                        >
                            <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.close' defaultMessage='Close' />
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
                    <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.revokeDialog.confirm.title' defaultMessage='Confirm Revoke' />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyListing.revokeDialog.confirm.message'
                            defaultMessage='Are you sure you want to revoke the API key {keyName}? This action cannot be undone.'
                            values={{ keyName: <strong>{selectedKeyForRevoke?.keyName}</strong> }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRevoke}>
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.cancel' defaultMessage='Cancel' />
                    </Button>
                    <Button
                        onClick={handleConfirmRevoke}
                        variant='contained'
                        color='error'
                    >
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.revoke' defaultMessage='Revoke' />
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
                    <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.revokeDialog.success.title' defaultMessage='API Key Revoked' />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyListing.revokeDialog.success.message'
                            defaultMessage='The API key has been successfully revoked.'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseRevokeSuccess}
                        variant='contained'
                    >
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.ok' defaultMessage='OK' />
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
                    <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.revokeDialog.error.title' defaultMessage='Revoke Failed' />
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
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyListing.button.ok' defaultMessage='OK' />
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
