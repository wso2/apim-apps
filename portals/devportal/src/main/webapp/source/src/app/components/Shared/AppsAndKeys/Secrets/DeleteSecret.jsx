import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DeleteSecretDialog({ onDelete }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirmDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <>
      {/* Delete button in your table row */}
      <IconButton color="error" onClick={handleClickOpen}>
        <DeleteIcon />
      </IconButton>

      {/* Confirmation dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-secret-title"
        aria-describedby="delete-secret-description"
      >
        <DialogTitle id="delete-secret-title">Delete Secret</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-secret-description">
            Are you sure you want to delete this secret? 
            This action cannot be undone.
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