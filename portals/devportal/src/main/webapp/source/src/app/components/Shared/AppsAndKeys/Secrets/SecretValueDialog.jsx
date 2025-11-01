import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    IconButton,
    Tooltip,
    Box,
} from "@mui/material";

import ViewSecret from "../ViewSecret"; // your existing component

export default function SecretValueDialog({ open, onClose, secret }) {

    if (!secret) return null; // nothing to show

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Secret Generated Successfully
            </DialogTitle>

            <DialogContent>
                <DialogContentText component="div">
                    <ViewSecret secret={ { consumerSecret: secret } } />
                </DialogContentText>
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: "space-between",
                    px: 3,
                    pb: 2,
                }}
            >
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
