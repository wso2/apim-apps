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
          id: 'Shared.AppsAndKeys.Secrets.DeleteSecret.at.least.one.secret.tooltip.title',
          defaultMessage: 'At least one secret must be present',
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
