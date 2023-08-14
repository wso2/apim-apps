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
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function RemoveKeys(props) {
    const [open, setOpen] = React.useState(false);
    const {
        keyMappingId, keys, selectedTab, handleClickRemove,
    } = props;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRemove = () => {
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
                            id='Applications.Listing.DeleteConfirmation.remove.keys.dialog.content'
                            defaultMessage='This will remove the key entries stored in devportal,
                            gateway as well as in the service provider.'
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
                    <Button onClick={handleRemove} color='primary' autoFocus>
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

export default RemoveKeys;
