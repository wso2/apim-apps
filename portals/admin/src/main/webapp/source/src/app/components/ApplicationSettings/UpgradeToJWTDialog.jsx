/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import { Alert as MuiAlert } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

const UpgradeToJWTDialog = (props) => {
    const intl = useIntl();
    const restApi = new API();
    const {
        updateList, app,
    } = props;
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUpgrade = async () => {
        setSubmitting(true);
        const body = {
            tokenType: 'JWT',
        };
        try {
            await restApi.updateApplication(app.applicationId, body);
            Alert.success(intl.formatMessage({
                id: 'ApplicationSettings.UpgradeToJWTDialog.app.upgrade.successful',
                defaultMessage: 'Application {appName} upgraded to JWT successfully',
            }, {
                appName: app.name,
            }));
            handleClose();
            updateList();
        } catch {
            const upgradeError = intl.formatMessage({
                id: 'ApplicationSettings.UpgradeToJWTDialog.app.upgrade.error',
                defaultMessage: 'Error while upgrading application {appName} to JWT',
            }, {
                appName: app.name,
            });
            Alert.error(upgradeError);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button
                size='small'
                variant='contained'
                color='primary'
                onClick={handleOpen}
            >
                {intl.formatMessage({
                    id: 'ApplicationSettings.UpgradeToJWTDialog.button.open',
                    defaultMessage: 'Upgrade to JWT',
                })}
            </Button>

            <Dialog
                open={open}
                onClose={(_, reason) => {
                    if (submitting && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
                        return;
                    }
                    handleClose();
                }}
                disableEscapeKeyDown={submitting}
            >
                <DialogTitle>
                    {intl.formatMessage({
                        id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.title',
                        defaultMessage: 'Upgrade Application to JWT',
                    })}
                </DialogTitle>

                <DialogContent>
                    <Typography variant='body1' gutterBottom>
                        {intl.formatMessage({
                            id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.body1',
                            defaultMessage: 'You are about to upgrade the application {appName} '
                                + 'to use JWT-based access tokens.',
                        }, { appName: <strong>{app.name}</strong> })}
                    </Typography>
                    <br />
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                        {intl.formatMessage({
                            id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.body2',
                            defaultMessage: 'This change will permanently switch the format of the newly generated'
                            + ' access tokens from opaque to JWT.',
                        })}
                    </Typography>
                    <br />
                    <MuiAlert severity='warning' sx={{ mb: 2 }}>
                        <strong>
                            {intl.formatMessage({
                                id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.important',
                                defaultMessage: 'Important',
                            })}
                        </strong>
                        <ul style={{ margin: '8px 0 0 16px' }}>
                            <li>
                                {intl.formatMessage({
                                    id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.warning1',
                                    defaultMessage: 'This action cannot be undone',
                                })}
                            </li>
                            <li>
                                {intl.formatMessage({
                                    id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.warning2',
                                    defaultMessage: 'Existing opaque tokens will still be supported',
                                })}
                            </li>
                        </ul>
                    </MuiAlert>

                    <Typography variant='body1'>
                        <b>
                            {intl.formatMessage({
                                id: 'ApplicationSettings.UpgradeToJWTDialog.dialog.confirmation',
                                defaultMessage: 'Do you want to proceed with the upgrade?',
                            })}
                        </b>
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={submitting}>
                        {intl.formatMessage({
                            id: 'ApplicationSettings.UpgradeToJWTDialog.button.cancel',
                            defaultMessage: 'Cancel',
                        })}
                    </Button>
                    <Button
                        onClick={handleUpgrade}
                        variant='contained'
                        color='primary'
                        disabled={submitting}
                    >
                        {intl.formatMessage({
                            id: 'ApplicationSettings.UpgradeToJWTDialog.button.upgrade',
                            defaultMessage: 'Upgrade',
                        })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

UpgradeToJWTDialog.propTypes = {
    updateList: PropTypes.func.isRequired,
    app: PropTypes.shape({
        applicationId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
};

export default UpgradeToJWTDialog;
