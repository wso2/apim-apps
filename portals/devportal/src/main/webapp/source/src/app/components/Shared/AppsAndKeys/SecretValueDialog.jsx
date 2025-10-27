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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import ViewSecret from "./ViewSecret"; // your existing component

export default function SecretValueDialog({ open, onClose, secret }) {
    const [copied, setCopied] = React.useState(false);
    console.log("secret");
    console.log(secret);

    if (!secret) return null; // nothing to show

    const handleCopy = () => {
        navigator.clipboard.writeText(secret.secretValue || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

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
                {/* <Box>
                    <Tooltip title={copied ? "Copied!" : "Copy Secret Value"}>
                        <IconButton onClick={handleCopy} color={copied ? "success" : "default"}>
                            {copied ? <CheckIcon /> : <ContentCopyIcon />}
                        </IconButton>
                    </Tooltip>
                </Box> */}
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
