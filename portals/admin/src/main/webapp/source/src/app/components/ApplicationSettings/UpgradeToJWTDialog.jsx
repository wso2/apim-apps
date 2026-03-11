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
import API from 'AppData/api';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
                return (
                    intl.formatMessage({
                        id: 'AdminPages.ApplicationSettings.Edit.form.edit.successful',
                        defaultMessage: 'Application owner changed successfully',
                    })
                );
            })
            .catch(() => {
                const upgradeError = intl.formatMessage({
                    id: 'Applications.Listing.Listing.applications.edit.error.subscriber.invalid',
                    defaultMessage: 'Error while upgrading application to JWT',
                });
                throw upgradeError;
            })
            .finally(() => {
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
                    Are you sure you want to upgrade the application
                    {' '}
                    <b>{app.name}</b>
                    {' '}
                    to JWT? This action is irreversible. Learn more...
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

export default UpgradeToJWTDialog;
