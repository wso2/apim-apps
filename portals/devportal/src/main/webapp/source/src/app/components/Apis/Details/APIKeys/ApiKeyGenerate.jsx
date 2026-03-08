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
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { ContentCopy, Refresh } from '@mui/icons-material';
import API from 'AppData/api';

/**
 * Custom hook for managing API key generation and regeneration operations
 * @param {string} apiUUID - The UUID of the API
 * @param {Function} refreshApiKeys - Callback function to refresh the API keys list
 * @returns {Object} Hook state and handlers
 */
export default function ApiKeyGenerate(apiUUID, refreshApiKeys) {
    // Generation form state
    const [displayName, setDisplayName] = React.useState('');
    const [keyType, setKeyType] = React.useState('PRODUCTION');
    const [validityPeriod, setValidityPeriod] = React.useState('never');
    const [customValidityDays, setCustomValidityDays] = React.useState('');
    const [restrictionType, setRestrictionType] = React.useState('none');
    const [restrictionValue, setRestrictionValue] = React.useState('');

    // Generation modal state
    const [generationModalOpen, setGenerationModalOpen] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [apikey, setApikey] = React.useState(null);
    const [showToken, setShowToken] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    // Regenerate modal state
    const [regenerateModalOpen, setRegenerateModalOpen] = React.useState(false);
    const [regeneratedApiKey, setRegeneratedApiKey] = React.useState(null);

    // Validity period options
    const validityOptions = [
        { value: '30', label: '30 Days' },
        { value: '90', label: '90 Days' },
        { value: '180', label: '6 Months' },
        { value: '365', label: '1 Year' },
        { value: 'never', label: 'Never Expires' },
        { value: 'custom', label: 'Custom' },
    ];

    // Restriction options
    const restrictionOptions = [
        { value: 'none', label: 'None', description: 'No restrictions applied' },
        { value: 'ip', label: 'Preferred IP', description: 'Restrict by IP address' },
        { value: 'referrer', label: 'Preferred Referrer', description: 'Restrict by HTTP referrer' },
    ];

    // Generation handlers
    const handleOpenGenerationModal = () => {
        setGenerationModalOpen(true);
    };

    const handleCloseGenerationModal = () => {
        setGenerationModalOpen(false);
        setDisplayName('');
        setKeyType('PRODUCTION');
        setValidityPeriod('never');
        setCustomValidityDays('');
        setRestrictionType('none');
        setRestrictionValue('');
        setShowToken(false);
        setApikey(null);
        // Refresh the API keys list after closing
        refreshApiKeys();
    };

    const handleGenerateKey = () => {
        if (!displayName.trim()) {
            alert('Please enter a name for the API key.');
            return;
        }
        if (restrictionType !== 'none' && !restrictionValue.trim()) {
            const restrictionOption = restrictionOptions.find((option) => option.value === restrictionType);
            const restrictionLabel = restrictionOption ? restrictionOption.label : '';
            alert(`Please enter a ${restrictionLabel.toLowerCase()} value.`);
            return;
        }
        if (validityPeriod === 'custom' && !customValidityDays) {
            const customDays = Number(customValidityDays);
            if (!Number.isInteger(customDays) || customDays <= 0) {
                alert('Please enter a valid positive number of days for custom validity period.');
                return;
            }
        }
        // API key generation logic
        const validityOption = validityOptions.find((option) => option.value === validityPeriod);
        let validity;
        let validityInSeconds;
        if (validityPeriod === 'never') {
            validity = validityOption ? validityOption.label : 'Never Expires';
            validityInSeconds = -1;
        } else if (validityPeriod === 'custom') {
            validity = `${customValidityDays} Days`;
            validityInSeconds = Number(customValidityDays) * 24 * 60 * 60;
        } else {
            validity = validityOption ? validityOption.label : '';
            const days = Number(validityPeriod);
            validityInSeconds = days * 24 * 60 * 60;
        }
        setIsGenerating(true);
        console.log('API key generation details:', {
            name: displayName,
            keyType,
            validity,
            validityInSeconds,
            isGenerating,
        });
        const client = new API();
        const restrictions = {
            permittedIP: restrictionType === 'ip' ? restrictionValue.trim() : '',
            permittedReferer: restrictionType === 'referrer' ? restrictionValue.trim() : '',
        };
        console.log('Using restrictions:', restrictions);
        const promisedKey = client.generateApiApiKey(apiUUID, displayName, keyType, validityInSeconds, restrictions);

        promisedKey
            .then((response) => {
                const generatedApiKey = {
                    keyName: response.body.keyName,
                    apikey: response.body.apikey,
                    validityPeriod: response.body.validityPeriod,
                    isOauth: false,
                };
                setApikey(generatedApiKey);
                setShowToken(true);
                setIsGenerating(false);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    setNotFound(true);
                    console.log('API not found, notFound state:', notFound);
                }
                setIsGenerating(false);
            });
    };

    // Regenerate handlers
    const handleRegenerateKey = (keyData) => {
        const restApi = new API();
        restApi.regenerateApiApiKey(apiUUID, keyData.keyUUID)
            .then((response) => {
                const regeneratedKey = {
                    keyName: response.body.keyName,
                    apikey: response.body.apikey,
                    validityPeriod: response.body.validityPeriod,
                };
                setRegeneratedApiKey(regeneratedKey);
                setRegenerateModalOpen(true);
                setTimeout(() => {
                    refreshApiKeys();
                }, 500);
            })
            .catch((error) => {
                console.error('Error regenerating key:', error);
                alert('Failed to regenerate API key. Please try again.');
            });
    };

    const handleCloseRegenerateModal = () => {
        setRegenerateModalOpen(false);
        setRegeneratedApiKey(null);
        refreshApiKeys();
    };

    // Render regenerate button
    const renderRegenerateButton = (keyData) => (
        <Button
            variant='outlined'
            size='small'
            startIcon={<Refresh />}
            onClick={() => handleRegenerateKey(keyData)}
        >
            Regenerate
        </Button>
    );

    // Render dialogs
    const renderDialogs = () => (
        <>
            {/* Regenerate Key Response Modal */}
            <Dialog
                open={regenerateModalOpen}
                onClose={handleCloseRegenerateModal}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle>
                    API Key Regenerated Successfully
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {regeneratedApiKey && (
                            <>
                                <Alert severity='warning' sx={{ mb: 0.5 }}>
                                    <Typography variant='h6' component='h3' sx={{ mb: 0.5, fontSize: '0.95rem' }}>
                                        Please Copy the API Key
                                    </Typography>
                                    <Typography component='p' variant='body2' sx={{ fontSize: '0.875rem' }}>
                                        Please copy this regenerated API Key value as it will be displayed only for
                                        the current browser session. (The API Key will not be visible in the UI
                                        after the page is refreshed.)
                                    </Typography>
                                </Alert>
                                <Box sx={{ mt: 1 }}>
                                    <Typography
                                        variant='subtitle2'
                                        component='label'
                                        htmlFor='regenerated-api-key-value'
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
                                            {regeneratedApiKey.keyName}
                                        </Typography>
                                    </Typography>
                                    <TextField
                                        id='regenerated-api-key-value'
                                        defaultValue={regeneratedApiKey.apikey}
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
                                        Above API Key has a validity period of
                                        {' '}
                                        <strong>
                                            {regeneratedApiKey.validityPeriod === -1
                                                ? 'Never Expires'
                                                : `${regeneratedApiKey.validityPeriod} seconds`}
                                        </strong>
                                        .
                                    </FormHelperText>
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseRegenerateModal}
                        variant='contained'
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    return {
        // State for external components
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
        // Handlers
        handleOpenGenerationModal,
        handleCloseGenerationModal,
        handleGenerateKey,
        renderRegenerateButton,
        // Dialogs
        renderDialogs,
    };
}
