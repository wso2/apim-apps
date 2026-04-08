/* eslint-disable object-curly-newline, operator-linebreak, indent */
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

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const UniversalGatewayRegenerateTokenDialog = ({ open, titleId, onClose, onConfirm, loading, t }) => {
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby={titleId}>
            <DialogTitle id={titleId}>
                {t('Gateways.UniversalGatewayManagement.token.dialog.title', 'Generate New Registration Token?')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t(
                        'Gateways.UniversalGatewayManagement.token.dialog.description',
                        'The older registration key will be revoked immediately and the ' +
                            'connected gateway will be disconnected from the control plane. ' +
                            'You must reconfigure the gateway with the new key.',
                    )}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t('Gateways.UniversalGatewayManagement.action.cancel', 'Cancel')}
                </Button>
                <Button onClick={onConfirm} variant='contained' color='primary' disabled={loading}>
                    {loading
                        ? t('Gateways.UniversalGatewayManagement.action.generating', 'Generating...')
                        : t('Gateways.UniversalGatewayManagement.action.generate.key', 'Generate Key')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

UniversalGatewayRegenerateTokenDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    titleId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
};

export default UniversalGatewayRegenerateTokenDialog;
