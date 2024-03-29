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

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Render a pop-up dialog to add/edit an Microgateway label
 * @param {JSON} props .
 * @returns {JSX}.
 */
function AddItem(props) {
    const {
        title, children, onSave, disabled, isSaving, saveButtonText, dialogActions, onClose, dialogProps,
    } = props;
    const { disableBackdropClick, maxWidth } = dialogProps;
    return (
        <>
            <Dialog
                fullWidth
                maxWidth={maxWidth || 'sm'}
                open
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick' || !disableBackdropClick) {
                        onClose(event, reason);
                    }
                }}
                aria-labelledby='form-dialog-title'
            >
                <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
                <DialogContent dividers>
                    <Box minHeight={190}>
                        {children}
                    </Box>
                </DialogContent>
                <DialogActions>
                    {dialogActions || (
                        <>
                            <Button onClick={onClose} variant='outlined'>
                                Cancel
                            </Button>
                            <Button onClick={onSave} color='primary' variant='contained' disabled={disabled}>
                                {isSaving ? <CircularProgress size={16} /> : <>{saveButtonText}</>}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

AddItem.defaultProps = {
    isSaving: false,
    disabled: false,
    saveButtonText: 'Save',
    dialogProps: { disableBackdropClick: false },
};

AddItem.propTypes = {
    buttonText: PropTypes.shape({}).isRequired,
    dialogProps: PropTypes.shape({ disableBackdropClick: PropTypes.bool }),
    title: PropTypes.shape({}).isRequired,
    onSave: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    disabled: PropTypes.bool,
    saveButtonText: PropTypes.string,
};

export default AddItem;
