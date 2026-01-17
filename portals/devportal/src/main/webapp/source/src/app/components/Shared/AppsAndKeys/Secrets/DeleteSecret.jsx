/*
* Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useIntl, FormattedMessage } from 'react-intl';

export default function DeleteSecretDialog({ onDelete, disabled }) {
  const [open, setOpen] = useState(false);
  const intl = useIntl();

  const handleClickOpen = () => {
    if (!disabled) setOpen(true); // don't open dialog if disabled
  };

  const handleClose = () => setOpen(false);

  const handleConfirmDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={disabled ?
        intl.formatMessage({
          id: 'Shared.AppsAndKeys.Secrets.DeleteSecret.latest.secret.tooltip',
          defaultMessage: 'The most recently added secret cannot be deleted',
        })
        : intl.formatMessage({
          id: 'Shared.AppsAndKeys.Secrets.DeleteSecret.delete.secret.tooltip.title',
          defaultMessage: 'Delete secret',
        })}
      >
        <span>
          <IconButton color="error" onClick={handleClickOpen} disabled={disabled}>
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-secret-title"
        aria-describedby="delete-secret-description"
      >
        <DialogTitle id="delete-secret-title">
          <FormattedMessage
            id='Shared.AppsAndKeys.Secrets.DeleteSecret.delete.secret.dialog.title'
            defaultMessage='Delete Secret'
          />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-secret-description">
            <FormattedMessage
              id='Shared.AppsAndKeys.Secrets.DeleteSecret.delete.secret.dialog.confirmation'
              defaultMessage='Are you sure you want to delete this secret? This action cannot be undone.'
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            <FormattedMessage
              id='Shared.AppsAndKeys.Secrets.DeleteSecret.delete.secret.dialog.cancel.button'
              defaultMessage='Cancel'
            />
          </Button>
          <Button onClick={handleConfirmDelete} color='primary' variant="contained" autoFocus>
            <FormattedMessage
              id='Shared.AppsAndKeys.Secrets.DeleteSecret.delete.secret.dialog.delete.button'
              defaultMessage='Delete'
            />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
