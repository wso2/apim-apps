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

export default function DeleteSecretDialog({ onDelete, disabled }) {
  const [open, setOpen] = useState(false);

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
      <Tooltip title={disabled ? "At least one secret must be present" : "Delete secret"}>
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
        <DialogTitle id="delete-secret-title">Delete Secret</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-secret-description">
            Are you sure you want to delete this secret? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color='primary' variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
