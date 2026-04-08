/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {
    useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Alert from 'AppComponents/Shared/Alert';
import {
    Alert as MuiAlert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Link,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import UniversalGatewaySuccessView from './UniversalGatewaySuccessView';
import UniversalGatewayRegenerateTokenDialog from './UniversalGatewayRegenerateTokenDialog';
import {
    gatewayShape,
    getAdditionalProperty,
    getGatewayStatusChipProps,
    normalizeProperties,
    resolveGatewayStatus,
} from './UniversalGatewayUtils';

const UniversalGatewayManagement = (props) => {
    const intl = useIntl();
    const t = useCallback((id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values), [intl]);
    const { match: { params: { gatewayId } = {} } = {}, location } = props;
    const restApi = useMemo(() => new API(), []);
    const preloadedGateway = useMemo(() => {
        const createdGateway = location?.state?.createdGateway;
        if (!createdGateway) {
            return null;
        }
        if (!gatewayId) {
            return createdGateway;
        }
        if (createdGateway.id === gatewayId || createdGateway.name === gatewayId) {
            return createdGateway;
        }
        return null;
    }, [gatewayId, location?.state]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [confirmReconfigureOpen, setConfirmReconfigureOpen] = useState(false);
    const [platformTokenRegenerating, setPlatformTokenRegenerating] = useState(false);
    const [existingGateway, setExistingGateway] = useState(null);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [updatingExisting, setUpdatingExisting] = useState(false);
    const [showTokenCommands, setShowTokenCommands] = useState(false);
    const [existingHeaderEditMode, setExistingHeaderEditMode] = useState(false);

    const applyExistingGateway = useCallback((gatewayToApply) => {
        setExistingGateway(gatewayToApply);
        setName(gatewayToApply?.displayName || gatewayToApply?.name || '');
        setDescription(gatewayToApply?.description || '');
        setExistingHeaderEditMode(false);
    }, []);

    const getMergedGateway = useCallback(
        (gatewayToApply) => {
            if (preloadedGateway?.registrationToken) {
                return {
                    ...gatewayToApply,
                    registrationToken: preloadedGateway.registrationToken,
                };
            }
            return gatewayToApply;
        },
        [preloadedGateway],
    );

    const loadExistingGateway = useCallback(async () => {
        const result = await restApi.getPlatformGatewayList();
        const gateways = result?.body?.list || [];
        const foundGateway = gateways.find((gateway) => gateway.id === gatewayId || gateway.name === gatewayId);

        if (!foundGateway) {
            setError(t('Gateways.UniversalGatewayManagement.error.not.found', 'Gateway not found'));
            return;
        }

        applyExistingGateway(getMergedGateway(foundGateway));
    }, [applyExistingGateway, gatewayId, getMergedGateway, restApi, t]);

    useEffect(() => {
        if (!gatewayId) {
            return undefined;
        }

        let isMounted = true;
        const hasPreloadedToken = Boolean(preloadedGateway?.registrationToken);

        if (preloadedGateway) {
            applyExistingGateway(preloadedGateway);
        }

        setShowTokenCommands(hasPreloadedToken);
        setLoadingExisting(true);
        setError('');

        loadExistingGateway()
            .catch((loadError) => {
                if (isMounted) {
                    setError(
                        loadError.message
                            || t('Gateways.UniversalGatewayManagement.error.load', 'Failed to load gateway'),
                    );
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingExisting(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [applyExistingGateway, gatewayId, loadExistingGateway, preloadedGateway, t]);

    const openReconfigureConfirm = () => {
        setConfirmReconfigureOpen(true);
    };

    const closeReconfigureConfirm = () => {
        if (!platformTokenRegenerating) {
            setConfirmReconfigureOpen(false);
        }
    };

    const pageProps = {
        pageStyle: 'paperLess',
        title: existingGateway?.displayName || existingGateway?.name
            || t('Gateways.UniversalGatewayManagement.page.title', 'Gateway Details'),
    };

    const handleRegenerateExistingGatewayToken = async () => {
        if (!existingGateway?.id) {
            return;
        }
        setPlatformTokenRegenerating(true);
        try {
            const result = await restApi.regeneratePlatformGatewayToken(existingGateway.id);
            const updatedGateway = result?.body || result;
            if (updatedGateway) {
                setExistingGateway(updatedGateway);
            } else {
                const gatewayListResponse = await restApi.getPlatformGatewayList();
                const gateways = gatewayListResponse?.body?.list || [];
                const reloadedGateway = gateways.find((gateway) => gateway.id === existingGateway.id);
                if (reloadedGateway) {
                    setExistingGateway(reloadedGateway);
                }
            }
            setShowTokenCommands(true);
            Alert.success(
                t(
                    'Gateways.UniversalGatewayManagement.token.regenerate.success',
                    'Gateway registration token regenerated successfully.',
                ),
            );
        } catch (requestError) {
            const errorMessage = requestError?.response?.body?.description
                || requestError.message
                    || t('Gateways.UniversalGatewayManagement.token.regenerate.error.short',
                        'Failed to regenerate token');
            setError(errorMessage);
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
            setConfirmReconfigureOpen(false);
        }
    };

    const isExistingGatewaySaveDisabled = updatingExisting || !name.trim()
        || (name.trim() === (existingGateway?.displayName
            || existingGateway?.name || '').trim() && description.trim()
                === (existingGateway?.description || '').trim());

    const handleUpdateExistingGateway = async () => {
        if (!existingGateway?.id) {
            return;
        }

        setUpdatingExisting(true);
        setError('');
        try {
            const result = await restApi.updatePlatformGateway(existingGateway.id, {
                name: existingGateway.name,
                displayName: name.trim(),
                description: description.trim(),
                vhost: existingGateway.vhost,
                properties: normalizeProperties(existingGateway.properties),
                permissions: existingGateway.permissions,
            });
            const updatedGateway = result?.body || result;
            if (updatedGateway) {
                setExistingGateway(updatedGateway);
                setName(updatedGateway.displayName || updatedGateway.name || '');
                setDescription(updatedGateway.description || '');
            }
            setExistingHeaderEditMode(false);
            Alert.success(t('Gateways.UniversalGatewayManagement.update.success', 'Gateway updated successfully.'));
        } catch (updateError) {
            const errorMessage = updateError?.response?.body?.description || updateError.message
                || t('Gateways.UniversalGatewayManagement.update.error', 'Failed to update gateway');
            setError(errorMessage);
            Alert.error(errorMessage);
        } finally {
            setUpdatingExisting(false);
        }
    };

    const handleStartExistingGatewayHeaderEdit = () => {
        setExistingHeaderEditMode(true);
    };

    const handleCancelExistingGatewayHeaderEdit = () => {
        setName(existingGateway?.displayName || existingGateway?.name || '');
        setDescription(existingGateway?.description || '');
        setExistingHeaderEditMode(false);
    };

    if (loadingExisting) {
        return (
            <ContentBase {...pageProps}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            </ContentBase>
        );
    }

    if (existingGateway) {
        const gatewayDisplayName = existingGateway.displayName || existingGateway.name || '';
        const gatewayInitials = gatewayDisplayName.split(/\s+/).filter(Boolean).map((part) => part
            .charAt(0)).join('')
            .slice(0, 2)
            .toUpperCase() || 'GW';
        const gatewayStatus = resolveGatewayStatus(
            getAdditionalProperty(existingGateway.additionalProperties, 'isActive') || existingGateway.isActive,
        );
        const hasStatus = Boolean(gatewayStatus);
        const isActive = gatewayStatus === 'ACTIVE';

        return (
            <ContentBase {...pageProps}>
                <Box sx={{ mb: 3 }}>
                    <Link
                        component={RouterLink}
                        to='/settings/environments'
                        underline='none'
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 3,
                        }}
                    >
                        <ArrowBackIcon fontSize='small' />
                        {t('Gateways.UniversalGatewayManagement.navigation.back', 'Back to Gateways')}
                    </Link>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: { xs: 'column', md: 'row' },
                        }}
                    >
                        <Box
                            sx={{
                                width: 96,
                                height: 96,
                                borderRadius: 2,
                                bgcolor: 'primary.dark',
                                color: 'primary.contrastText',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {gatewayInitials}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {existingHeaderEditMode ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        size='small'
                                        label={t(
                                            'Gateways.UniversalGatewayManagement.form.gateway.name',
                                            'Gateway Name',
                                        )}
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        disabled={updatingExisting}
                                    />
                                    <TextField
                                        fullWidth
                                        size='small'
                                        multiline
                                        minRows={2}
                                        label={t('Gateways.UniversalGatewayManagement.form.description', 'Description')}
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        disabled={updatingExisting}
                                    />
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Button
                                            variant='contained'
                                            onClick={handleUpdateExistingGateway}
                                            disabled={isExistingGatewaySaveDisabled}
                                            startIcon={
                                                updatingExisting && <CircularProgress size={16} color='inherit' />
                                            }
                                        >
                                            {updatingExisting
                                                ? t('Gateways.UniversalGatewayManagement.action.saving', 'Saving...')
                                                : t('Gateways.UniversalGatewayManagement.action.save', 'Save')}
                                        </Button>
                                        <Button
                                            variant='outlined'
                                            onClick={handleCancelExistingGatewayHeaderEdit}
                                            disabled={updatingExisting}
                                        >
                                            {t('Gateways.UniversalGatewayManagement.action.close', 'Close')}
                                        </Button>
                                        {hasStatus && (
                                            <Chip
                                                size='small'
                                                label={
                                                    isActive
                                                        ? t(
                                                            'Gateways.UniversalGatewayManagement.status.active',
                                                            'Active',
                                                        )
                                                        : t(
                                                            'Gateways.UniversalGatewayManagement.status.inactive',
                                                            'Inactive',
                                                        )
                                                }
                                                {...getGatewayStatusChipProps(isActive ? 'ACTIVE' : 'INACTIVE')}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant='h5' sx={{ fontWeight: 700 }}>
                                            {gatewayDisplayName}
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            onClick={handleStartExistingGatewayHeaderEdit}
                                            aria-label={t(
                                                'Gateways.UniversalGatewayManagement.action.edit.details',
                                                'edit gateway details',
                                            )}
                                        >
                                            <EditOutlinedIcon fontSize='small' />
                                        </IconButton>
                                        {hasStatus && (
                                            <Chip
                                                size='small'
                                                label={
                                                    isActive
                                                        ? t(
                                                            'Gateways.UniversalGatewayManagement.status.active',
                                                            'Active',
                                                        )
                                                        : t(
                                                            'Gateways.UniversalGatewayManagement.status.inactive',
                                                            'Inactive',
                                                        )
                                                }
                                                {...getGatewayStatusChipProps(isActive ? 'ACTIVE' : 'INACTIVE')}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
                                        {existingGateway.description
                                            || t('Gateways.UniversalGatewayManagement.description.empty',
                                                'No description provided.')}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>

                {error && (
                    <MuiAlert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </MuiAlert>
                )}

                <UniversalGatewaySuccessView
                    gateway={existingGateway}
                    onAddAnother={null}
                    onReconfigureRequested={openReconfigureConfirm}
                    reconfigureLoading={platformTokenRegenerating}
                    isViewMode
                    showTokenCommands={showTokenCommands}
                    hideHeader
                />
                <UniversalGatewayRegenerateTokenDialog
                    open={confirmReconfigureOpen}
                    titleId='reconfigure-existing-gateway-dialog-title'
                    onClose={closeReconfigureConfirm}
                    onConfirm={handleRegenerateExistingGatewayToken}
                    loading={platformTokenRegenerating}
                    t={t}
                />
            </ContentBase>
        );
    }

    // No gateway found - show error or redirect
    return (
        <ContentBase {...pageProps}>
            <Box sx={{ mb: 3 }}>
                <Link
                    component={RouterLink}
                    to='/settings/environments'
                    underline='none'
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <ArrowBackIcon fontSize='small' />
                    {t('Gateways.UniversalGatewayManagement.navigation.back', 'Back to Gateways')}
                </Link>
            </Box>
            {error && (
                <MuiAlert severity='error' sx={{ mb: 2 }}>
                    {error}
                </MuiAlert>
            )}
            {!error && (
                <MuiAlert severity='warning'>
                    {t('Gateways.UniversalGatewayManagement.error.not.found', 'Gateway not found')}
                </MuiAlert>
            )}
        </ContentBase>
    );
};

UniversalGatewayManagement.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            gatewayId: PropTypes.string.isRequired,
        }),
    }).isRequired,
    location: PropTypes.shape({
        state: PropTypes.shape({
            createdGateway: gatewayShape,
        }),
    }),
};

UniversalGatewayManagement.defaultProps = {
    location: {},
};

export default UniversalGatewayManagement;
