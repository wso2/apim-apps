/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUpgrade = () => {
        return restApi.upgradeApplicationTokenType(app.applicationId)
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'AdminPages.ApplicationSettings.Edit.form.edit.successful',
                    defaultMessage: 'Application {appName} upgraded to JWT successfully',
                }, {
                    appName: app.name,
                }));
            })
            .catch(() => {
                const upgradeError = intl.formatMessage({
                    id: 'Applications.Listing.Listing.applications.edit.error.subscriber.invalid',
                    defaultMessage: 'Error while upgrading application {appName} to JWT',
                }, {
                    appName: app.name,
                });
                Alert.error(upgradeError);
            })
            .finally(() => {
                handleClose();
                updateList();
            });
    };

    return (
        <>
            <Button
                size='small'
                variant='outlined'
                onClick={handleOpen}
            >
                Upgrade to JWT
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Upgrade Application to JWT</DialogTitle>

                <DialogContent>
                    <Typography variant='body1' gutterBottom>
                        You are about to upgrade the application
                        {' '}
                        <strong>{app.name}</strong>
                        {' '}
                        to use
                        {' '}
                        <strong>JWT-based access tokens</strong>
                    </Typography>
                    <br />
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                        This change will
                        {' '}
                        <strong>permanently switch</strong>
                        {' '}
                        the newly generated access token format from opaque to JWT.
                    </Typography>
                    <br />
                    <MuiAlert severity='warning' sx={{ mb: 2 }}>
                        <strong>Important</strong>
                        <ul style={{ margin: '8px 0 0 16px' }}>
                            <li>This action cannot be undone</li>
                            <li>Existing opaque tokens will still be supported</li>
                        </ul>
                    </MuiAlert>

                    <Typography variant='body1'>
                        <b>Do you want to proceed with the upgrade?</b>
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleUpgrade}
                        variant='contained'
                        color='primary'
                    >
                        Upgrade
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
