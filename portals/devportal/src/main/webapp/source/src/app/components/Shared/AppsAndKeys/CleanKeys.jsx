/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function CleanKeys(props) {
    const [open, setOpen] = React.useState(false);
    const {
        keyMappingId, handleClickRemove,
    } = props;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClean = () => {
        handleClickRemove(keyMappingId);
    };

    return (
        <div>
            <Button
                id='remove-generated-keys'
                variant='outlined'
                color='secondary'
                startIcon={<DeleteIcon />}
                onClick={handleClickOpen}
            >
                <FormattedMessage
                    id='Shared.AppsAndKeys.ViewKeys.remove.keys'
                    defaultMessage='Remove Keys'
                />
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>
                    <FormattedMessage
                        id='Applications.Listing.DeleteConfirmation.remove.keys.dialog.title'
                        defaultMessage='Do you really want to remove keys?'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        <FormattedMessage
                            id='Applications.Listing.DeleteConfirmation.clean.keys.dialog.content'
                            defaultMessage='This will remove only the key entries stored in devportal,
                            gateway and will not remove the service proveder keys.'
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='primary'>
                        <FormattedMessage
                            id='Applications.Listing.DeleteConfirmation.remove.keys.dialog.Cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button onClick={handleClean} color='primary' autoFocus>
                        <FormattedMessage
                            id='Applications.Listing.DeleteConfirmation.remove.keys.dialog.Delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default CleanKeys;
