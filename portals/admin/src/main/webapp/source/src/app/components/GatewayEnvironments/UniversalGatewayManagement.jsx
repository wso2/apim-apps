/* eslint-disable object-curly-newline, operator-linebreak, implicit-arrow-linebreak, indent */
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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Alert from 'AppComponents/Shared/Alert';
import {
    Alert as MuiAlert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    IconButton,
    Link,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import { MuiChipsInput } from 'mui-chips-input';
import base64url from 'base64url';
import { red } from '@mui/material/colors';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import UniversalGatewaySuccessView from './UniversalGatewaySuccessView';
import UniversalGatewayRegenerateTokenDialog from './UniversalGatewayRegenerateTokenDialog';
import {
    gatewayShape,
    getAdditionalProperty,
    getGatewayStatusChipProps,
    normalizeBaseUrl,
    normalizeProperties,
    PERMISSION_TYPE_OPTIONS,
    resolveGatewayStatus,
    slugifyName,
    getVhostFromBaseUrl,
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
    const [baseUrl, setBaseUrl] = useState('');
    const [permissionType, setPermissionType] = useState('PUBLIC');
    const [validRoles, setValidRoles] = useState([]);
    const [invalidRoles, setInvalidRoles] = useState([]);
    const [roleValidity, setRoleValidity] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdGateway, setCreatedGateway] = useState(null);
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
                        loadError.message ||
                            t('Gateways.UniversalGatewayManagement.error.load', 'Failed to load gateway'),
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

    useEffect(() => {
        setRoleValidity(invalidRoles.length === 0);
    }, [invalidRoles]);

    const handleRoleDeletion = (role) => {
        setInvalidRoles((existingInvalidRoles) => existingInvalidRoles.filter((existingRole) => existingRole !== role));
        setValidRoles((existingValidRoles) => existingValidRoles.filter((existingRole) => existingRole !== role));
    };

    const handleRoleAddition = (role) => {
        const normalizedRole = role.trim();
        if (!normalizedRole) {
            return;
        }

        restApi
            .validateSystemRole(base64url.encode(normalizedRole))
            .then(() => {
                setInvalidRoles(
                    (existingInvalidRoles) =>
                        existingInvalidRoles.filter((existingRole) => existingRole !== normalizedRole),
                );
                setValidRoles((existingValidRoles) => {
                    if (existingValidRoles.includes(normalizedRole)) {
                        return existingValidRoles;
                    }
                    return existingValidRoles.concat(normalizedRole);
                });
            })
            .catch((requestError) => {
                if (requestError.status === 404) {
                    setValidRoles(
                        (existingValidRoles) =>
                            existingValidRoles.filter((existingRole) => existingRole !== normalizedRole),
                    );
                    setInvalidRoles((existingInvalidRoles) => {
                        if (existingInvalidRoles.includes(normalizedRole)) {
                            return existingInvalidRoles;
                        }
                        return existingInvalidRoles.concat(normalizedRole);
                    });
                }
            });
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setBaseUrl('');
        setPermissionType('PUBLIC');
        setValidRoles([]);
        setInvalidRoles([]);
        setRoleValidity(true);
        setError('');
    };

    const handleAddAnother = () => {
        setCreatedGateway(null);
        setConfirmReconfigureOpen(false);
        setPlatformTokenRegenerating(false);
        setShowTokenCommands(false);
        resetForm();
    };

    const openReconfigureConfirm = () => {
        setConfirmReconfigureOpen(true);
    };

    const closeReconfigureConfirm = () => {
        if (!platformTokenRegenerating) {
            setConfirmReconfigureOpen(false);
        }
    };

    const handleRegeneratePlatformKey = async () => {
        if (!createdGateway?.id) {
            return;
        }
        setPlatformTokenRegenerating(true);
        try {
            const result = await restApi.regeneratePlatformGatewayToken(createdGateway.id);
            const regeneratedGateway = result?.body || result;
            if (regeneratedGateway) {
                setCreatedGateway(regeneratedGateway);
            }
            setConfirmReconfigureOpen(false);
            Alert.success(
                t(
                    'Gateways.UniversalGatewayManagement.token.regenerate.success',
                    'Gateway registration token regenerated successfully.',
                ),
            );
        } catch (regenError) {
            const errorMessage =
                regenError?.response?.body?.description ||
                regenError.message ||
                t(
                    'Gateways.UniversalGatewayManagement.token.regenerate.error',
                    'Failed to regenerate gateway registration token.',
                );
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
        }
    };

    const pageProps = {
        pageStyle: 'paperLess',
        title: createdGateway
            ? createdGateway.displayName || createdGateway.name
            : t('Gateways.UniversalGatewayManagement.page.title.new', 'Add WSO2 Gateway'),
    };

    const addUniversalGateway = async () => {
        setLoading(true);
        setError('');
        try {
            const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
            const computedVhost = getVhostFromBaseUrl(normalizedBaseUrl);
            if (!computedVhost) {
                throw new Error(
                    t(
                        'Gateways.UniversalGatewayManagement.validation.url.required',
                        'A valid gateway URL is required.',
                    ),
                );
            }

            const displayName = name.trim();
            const gatewayName = slugifyName(displayName);
            if (!gatewayName || gatewayName.length < 3) {
                throw new Error(
                    t(
                        'Gateways.UniversalGatewayManagement.validation.name.invalid',
                        'Gateway name must have at least 3 letters or numbers.',
                    ),
                );
            }

            const result = await restApi.createPlatformGateway({
                name: gatewayName,
                displayName,
                description: description.trim(),
                vhost: computedVhost,
                properties: {
                    gatewayController: {
                        enabled: true,
                        baseUrl: normalizedBaseUrl,
                    },
                },
                permissions: {
                    permissionType,
                    roles: validRoles,
                },
            });

            const gateway = result?.body || result;
            setCreatedGateway(gateway);
        } catch (createError) {
            setError(
                createError.message ||
                    t('Gateways.UniversalGatewayManagement.error.create', 'Failed to add platform gateway.'),
            );
        } finally {
            setLoading(false);
        }
    };

    const isAddDisabled =
        loading ||
        !name.trim() ||
        !baseUrl.trim() ||
        !roleValidity ||
        ((permissionType === 'ALLOW' || permissionType === 'DENY') && validRoles.length === 0);

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
            const errorMessage =
                requestError?.response?.body?.description ||
                requestError.message ||
                t('Gateways.UniversalGatewayManagement.token.regenerate.error.short', 'Failed to regenerate token');
            setError(errorMessage);
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
            setConfirmReconfigureOpen(false);
        }
    };

    const isExistingGatewaySaveDisabled =
        updatingExisting ||
        !name.trim() ||
        (name.trim() === (existingGateway?.displayName || existingGateway?.name || '').trim() &&
            description.trim() === (existingGateway?.description || '').trim());

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
            const errorMessage =
                updateError?.response?.body?.description ||
                updateError.message ||
                t('Gateways.UniversalGatewayManagement.update.error', 'Failed to update gateway');
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
        const gatewayInitials =
            gatewayDisplayName
                .split(/\s+/)
                .filter(Boolean)
                .map((part) => part.charAt(0))
                .join('')
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
                                        {existingGateway.description ||
                                            t(
                                                'Gateways.UniversalGatewayManagement.description.empty',
                                                'No description provided.',
                                            )}
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

    if (createdGateway) {
        return (
            <ContentBase {...pageProps}>
                <UniversalGatewaySuccessView
                    gateway={createdGateway}
                    onAddAnother={handleAddAnother}
                    onReconfigureRequested={openReconfigureConfirm}
                    reconfigureLoading={platformTokenRegenerating}
                />
                <UniversalGatewayRegenerateTokenDialog
                    open={confirmReconfigureOpen}
                    titleId='reconfigure-created-gateway-dialog-title'
                    onClose={closeReconfigureConfirm}
                    onConfirm={handleRegeneratePlatformKey}
                    loading={platformTokenRegenerating}
                    t={t}
                />
            </ContentBase>
        );
    }

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
                <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
                    {t('Gateways.UniversalGatewayManagement.page.title.new', 'Add WSO2 Gateway')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    {t(
                        'Gateways.UniversalGatewayManagement.page.description.new',
                        'Register a new API Gateway to manage your APIs',
                    )}
                </Typography>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        {t('Gateways.UniversalGatewayManagement.form.title', 'Gateway Details')}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label={t('Gateways.UniversalGatewayManagement.form.name', 'Name')}
                                placeholder={t(
                                    'Gateways.UniversalGatewayManagement.form.name.placeholder',
                                    'Enter gateway name',
                                )}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                helperText={t(
                                    'Gateways.UniversalGatewayManagement.form.name.help',
                                    'A unique name for your gateway',
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label={t('Gateways.UniversalGatewayManagement.form.url', 'URL')}
                                placeholder='https://gateway.example.com:8443'
                                value={baseUrl}
                                onChange={(event) => setBaseUrl(event.target.value)}
                                required
                                helperText={t(
                                    'Gateways.UniversalGatewayManagement.form.url.help',
                                    'The base URL where your gateway will be accessible',
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label={t('Gateways.UniversalGatewayManagement.form.description', 'Description')}
                                placeholder={t(
                                    'Gateways.UniversalGatewayManagement.form.description.placeholder',
                                    'Enter description (optional)',
                                )}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant='outlined' size='small'>
                                <InputLabel id='permission-type-label'>
                                    {t('Gateways.UniversalGatewayManagement.form.visibility', 'Visibility')}
                                </InputLabel>
                                <Select
                                    labelId='permission-type-label'
                                    id='permission-type-select'
                                    value={permissionType}
                                    label={t('Gateways.UniversalGatewayManagement.form.visibility', 'Visibility')}
                                    onChange={(event) => setPermissionType(event.target.value)}
                                >
                                    {PERMISSION_TYPE_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {t(option.labelKey, option.defaultMessage)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    {t(
                                        'Gateways.UniversalGatewayManagement.form.visibility.help',
                                        'Who can access APIs deployed to this gateway',
                                    )}
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        {(permissionType === 'ALLOW' || permissionType === 'DENY') && (
                            <Grid item xs={12}>
                                <MuiChipsInput
                                    fullWidth
                                    label={t('Gateways.UniversalGatewayManagement.form.roles', 'Roles')}
                                    InputLabelProps={{ shrink: true }}
                                    name='GatewayEnvironmentPermissions'
                                    variant='outlined'
                                    size='small'
                                    value={validRoles.concat(invalidRoles)}
                                    alwaysShowPlaceholder={false}
                                    placeholder={t(
                                        'Gateways.UniversalGatewayManagement.form.roles.placeholder',
                                        'Enter roles and press Enter',
                                    )}
                                    blurBehavior='clear'
                                    data-testid='gateway-permission-roles'
                                    InputProps={{
                                        endAdornment: !roleValidity && (
                                            <InputAdornment
                                                position='end'
                                                sx={{
                                                    position: 'absolute',
                                                    right: '25px',
                                                    top: '50%',
                                                }}
                                            >
                                                <ErrorIcon color='error' />
                                            </InputAdornment>
                                        ),
                                    }}
                                    onAddChip={handleRoleAddition}
                                    renderChip={(ChipComponent, key, chipProps) => (
                                        <ChipComponent
                                            key={`${chipProps.label}-${key}`}
                                            label={chipProps.label}
                                            onDelete={() => handleRoleDeletion(chipProps.label)}
                                            data-testid={chipProps.label}
                                            style={{
                                                backgroundColor: invalidRoles.includes(chipProps.label)
                                                    ? red[300]
                                                    : null,
                                                margin: '8px 8px 8px 0',
                                                float: 'left',
                                            }}
                                        />
                                    )}
                                    error={!roleValidity}
                                    helperText={(() => {
                                        if (!roleValidity) {
                                            return t(
                                                'Gateways.UniversalGatewayManagement.form.roles.invalid',
                                                'Invalid Role(s) Found',
                                            );
                                        }
                                        if (permissionType === 'ALLOW') {
                                            return t(
                                                'Gateways.UniversalGatewayManagement.form.roles.allow.help',
                                                'Use of this Gateway is "Allowed" for above roles. ' +
                                                    'Enter a valid role and press Enter.',
                                            );
                                        }
                                        return t(
                                            'Gateways.UniversalGatewayManagement.form.roles.deny.help',
                                            'Use of this Gateway is "Denied" for above roles. ' +
                                                'Enter a valid role and press Enter.',
                                        );
                                    })()}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {error && (
                <MuiAlert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </MuiAlert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button component={RouterLink} to='/settings/environments' variant='outlined'>
                    {t('Gateways.UniversalGatewayManagement.action.cancel', 'Cancel')}
                </Button>
                <Button
                    variant='contained'
                    disabled={isAddDisabled}
                    onClick={addUniversalGateway}
                    startIcon={loading && <CircularProgress size={16} color='inherit' />}
                >
                    {loading
                        ? t('Gateways.UniversalGatewayManagement.action.adding', 'Adding...')
                        : t('Gateways.UniversalGatewayManagement.action.add', 'Add Gateway')}
                </Button>
            </Box>
        </ContentBase>
    );
};

UniversalGatewayManagement.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            gatewayId: PropTypes.string,
        }),
    }),
    location: PropTypes.shape({
        state: PropTypes.shape({
            createdGateway: gatewayShape,
        }),
    }),
};

UniversalGatewayManagement.defaultProps = {
    match: {
        params: {},
    },
    location: {},
};

export default UniversalGatewayManagement;
