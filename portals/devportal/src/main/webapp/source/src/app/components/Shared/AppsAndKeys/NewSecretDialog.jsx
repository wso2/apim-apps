import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Box,
} from "@mui/material";

const NewSecretDialog = ({ open, onClose, onCreate }) => {
    const initialFormState = {
        description: "",
        expiryOption: "30",
        customDays: "",
    };

    const [form, setForm] = useState(initialFormState);

    const handleClose = () => {
        setForm(initialFormState); // Reset first
        onClose(); // Then close the dialog
    };

    const handleSubmit = () => {
        const expiryDays =
            form.expiryOption === "custom"
                ? parseInt(form.customDays || 0, 10)
                : parseInt(form.expiryOption, 10);
        const payload = {
            description: form.description,
            expiresInSeconds: expiryDays > 0 ? expiryDays * 24 * 60 * 60 : 0,
        };
        onCreate(payload);
        // Reset form after creation
        setForm(initialFormState);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create New Secret</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField
                        label="Description"
                        fullWidth
                        margin="normal"
                        size="medium"
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />
                    <TextField
                        select
                        label="Expiry Time"
                        fullWidth
                        value={form.expiryOption}
                        onChange={(e) =>
                            setForm({ ...form, expiryOption: e.target.value })
                        }
                    >
                        <MenuItem value="30">30 days</MenuItem>
                        <MenuItem value="60">60 days</MenuItem>
                        <MenuItem value="90">90 days</MenuItem>
                        <MenuItem value="180">180 days</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                    </TextField>

                    {form.expiryOption === "custom" && (
                        <TextField
                            label="Custom Expiry (days)"
                            type="number"
                            fullWidth
                            value={form.customDays}
                            onChange={(e) =>
                                setForm({ ...form, customDays: e.target.value })
                            }
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewSecretDialog;
