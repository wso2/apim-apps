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
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import API from 'AppData/api';

/**
 * Custom hook for managing API key association and dissociation operations
 * @param {string} apiUUID - The UUID of the API
 * @param {Function} refreshApiKeys - Callback function to refresh the API keys list
 * @param {Array} subscribedApps - List of subscribed applications
 * @returns {Object} Hook state and handlers
 */
export default function ApiKeyAssociation(apiUUID, refreshApiKeys, subscribedApps) {
    const intl = useIntl();

    // Association modal state
    const [associationModalOpen, setAssociationModalOpen] = React.useState(false);
    const [selectedKeyForAssociation, setSelectedKeyForAssociation] = React.useState(null);
    const [selectedAppForAssociation, setSelectedAppForAssociation] = React.useState('');

    // Associate dialog state
    const [associateSuccessOpen, setAssociateSuccessOpen] = React.useState(false);
    const [associateErrorOpen, setAssociateErrorOpen] = React.useState(false);
    const [associateErrorMessage, setAssociateErrorMessage] = React.useState('');

    // Dissociate dialog state
    const [dissociateConfirmOpen, setDissociateConfirmOpen] = React.useState(false);
    const [dissociateSuccessOpen, setDissociateSuccessOpen] = React.useState(false);
    const [dissociateErrorOpen, setDissociateErrorOpen] = React.useState(false);
    const [dissociateErrorMessage, setDissociateErrorMessage] = React.useState('');
    const [selectedKeyForDissociate, setSelectedKeyForDissociate] = React.useState(null);

    // Association handlers
    const handleOpenAssociationModal = (keyData) => {
        setSelectedKeyForAssociation(keyData);
        setAssociationModalOpen(true);
    };

    const handleCloseAssociationModal = () => {
        setAssociationModalOpen(false);
        setSelectedKeyForAssociation(null);
        setSelectedAppForAssociation('');
    };

    const [isAssociating, setIsAssociating] = React.useState(false);
    const [isDissociating, setIsDissociating] = React.useState(false);

    const handleAssociateKey = () => {
        if (!selectedAppForAssociation || !selectedKeyForAssociation || isAssociating) {
            alert(intl.formatMessage({
                id: 'Apis.Details.APIKeys.ApiKeyAssociation.alert.selectApplication',
                defaultMessage: 'Please select an application.',
            }));
            return;
        }
        setIsAssociating(true);
        const restApi = new API();
        const { keyUUID } = selectedKeyForAssociation;
        const applicationUUID = selectedAppForAssociation;

        restApi.associateApiApiKey(apiUUID, keyUUID, applicationUUID)
            .then(() => {
                handleCloseAssociationModal();
                setAssociateSuccessOpen(true);
                // Refresh the API keys list
                setTimeout(() => {
                    refreshApiKeys();
                }, 500);
            })
            .catch((error) => {
                console.error('Error associating key:', error);
                handleCloseAssociationModal();
                setAssociateErrorMessage(
                    error.response?.body?.description
                    || intl.formatMessage({
                        id: 'Apis.Details.APIKeys.ApiKeyAssociation.error.associateFailed',
                        defaultMessage: 'Failed to associate API key. Please try again.',
                    }),
                );
                setAssociateErrorOpen(true);
            })
            .finally(() => setIsAssociating(false));
    };

    const handleCloseAssociateSuccess = () => {
        setAssociateSuccessOpen(false);
    };

    const handleCloseAssociateError = () => {
        setAssociateErrorOpen(false);
        setAssociateErrorMessage('');
    };

    // Dissociation handlers
    const handleRemoveAssociation = (keyData) => {
        setSelectedKeyForDissociate(keyData);
        setDissociateConfirmOpen(true);
    };

    const handleConfirmDissociate = () => {
        if (!selectedKeyForDissociate || isDissociating) {
            return;
        }
        setIsDissociating(true);
        setDissociateConfirmOpen(false);
        const restApi = new API();
        restApi.dissociateApiApiKey(apiUUID, selectedKeyForDissociate.keyUUID)
            .then(() => {
                setDissociateSuccessOpen(true);
                // Refresh the API keys list
                setTimeout(() => {
                    refreshApiKeys();
                }, 500);
            })
            .catch((error) => {
                console.error('Error dissociating key:', error);
                setDissociateErrorMessage(
                    error.response?.body?.description
                    || intl.formatMessage({
                        id: 'Apis.Details.APIKeys.ApiKeyAssociation.error.dissociateFailed',
                        defaultMessage: 'Failed to remove association. Please try again.',
                    }),
                );
                setDissociateErrorOpen(true);
            })
            .finally(() => setIsDissociating(false));
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

    // Render dialogs
    const renderDialogs = () => (
        <>
            {/* Association Modal */}
            <Dialog
                open={associationModalOpen}
                onClose={handleCloseAssociationModal}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Apis.Details.APIKeys.ApiKeyAssociation.modal.associate.title'
                        defaultMessage='Associate API Key'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyAssociation.modal.associate.body'
                            defaultMessage='Select an application to associate with API key:'
                        />
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>
                            <FormattedMessage
                                id='Apis.Details.APIKeys.ApiKeyAssociation.field.application.label'
                                defaultMessage='Application'
                            />
                        </InputLabel>
                        <Select
                            value={selectedAppForAssociation}
                            onChange={(e) => setSelectedAppForAssociation(e.target.value)}
                            label={intl.formatMessage({
                                id: 'Apis.Details.APIKeys.ApiKeyAssociation.field.application.label',
                                defaultMessage: 'Application',
                            })}
                        >
                            {subscribedApps.map((app) => (
                                <MenuItem key={app.id} value={app.id}>
                                    {app.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssociationModal}>
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.cancel' defaultMessage='Cancel' />
                    </Button>
                    <Button
                        onClick={handleAssociateKey}
                        variant='contained'
                        disabled={!selectedAppForAssociation || isAssociating}
                    >
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.associate' defaultMessage='Associate' />
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
                    <FormattedMessage
                        id='Apis.Details.APIKeys.ApiKeyAssociation.associateSuccess.title'
                        defaultMessage='Association Successful'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyAssociation.associateSuccess.message'
                            defaultMessage='API key has been successfully associated with the application.'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseAssociateSuccess}
                        variant='contained'
                    >
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.ok' defaultMessage='OK' />
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
                    <FormattedMessage
                        id='Apis.Details.APIKeys.ApiKeyAssociation.associateError.title'
                        defaultMessage='Association Failed'
                    />
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
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.ok' defaultMessage='OK' />
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dissociate Confirmation Dialog */}
            <Dialog
                open={dissociateConfirmOpen}
                onClose={handleCancelDissociate}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Apis.Details.APIKeys.ApiKeyAssociation.dissociateConfirm.title'
                        defaultMessage='Confirm Remove Association'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyAssociation.dissociateConfirm.message'
                            defaultMessage='Are you sure you want to remove this API key association?'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDissociate}>
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.cancel' defaultMessage='Cancel' />
                    </Button>
                    <Button
                        onClick={handleConfirmDissociate}
                        variant='contained'
                        color='error'
                        disabled={isDissociating}
                    >
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyAssociation.button.removeAssociation'
                            defaultMessage='Remove Association'
                        />
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
                    <FormattedMessage
                        id='Apis.Details.APIKeys.ApiKeyAssociation.dissociateSuccess.title'
                        defaultMessage='Association Removed'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.APIKeys.ApiKeyAssociation.dissociateSuccess.message'
                            defaultMessage='API key association has been successfully removed.'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDissociateSuccess}
                        variant='contained'
                    >
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.ok' defaultMessage='OK' />
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
                    <FormattedMessage
                        id='Apis.Details.APIKeys.ApiKeyAssociation.dissociateError.title'
                        defaultMessage='Remove Association Failed'
                    />
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
                        <FormattedMessage id='Apis.Details.APIKeys.ApiKeyAssociation.button.ok' defaultMessage='OK' />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    return {
        // Handlers
        handleOpenAssociationModal,
        handleRemoveAssociation,
        // Dialogs
        renderDialogs,
    };
}
