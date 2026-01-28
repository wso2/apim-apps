import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import { FormattedMessage } from 'react-intl';

import ViewSecret from "../ViewSecret";

export default function SecretValueDialog({ open, onClose, secret }) {

    if (!secret) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                <FormattedMessage
                    id='Shared.AppsAndKeys.Secrets.SecretValueDialog.secret.generate.success.dialog.title'
                    defaultMessage='Secret Generated Successfully'
                />
            </DialogTitle>

            <DialogContent>
                <DialogContentText component="div">
                    <ViewSecret secret={{ consumerSecret: secret }} isGenerated={true} />
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
                    <FormattedMessage
                        id='Shared.AppsAndKeys.Secrets.SecretValueDialog.delete.button'
                        defaultMessage='Close'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
