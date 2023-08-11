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

function CleanKeys(props) {
    const [open, setOpen] = React.useState(false);
    const {
        keyMappingId, keys, selectedTab, handleClickClean,
    } = props;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRemove = () => {
        handleClickClean(keyMappingId);
    };

    return (
        <div>
            <Button
                id='remove-generated-keys'
                variant='outlined'
                color='secondary'
                startIcon={<DeleteIcon />}
                onClick={handleClickOpen}
                disabled={!keys.get(selectedTab)
                    .supportedGrantTypes.includes('client_credentials')}
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
                <DialogTitle id='alert-dialog-title'>Do you really want to remove keys?</DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        This will remove only the key entries stored in devportal, gateway and will not remove the service proveder keys.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handleRemove} color='primary' autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default CleanKeys;
