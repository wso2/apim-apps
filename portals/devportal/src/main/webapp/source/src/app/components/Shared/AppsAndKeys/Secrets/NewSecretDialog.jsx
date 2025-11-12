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
    Tooltip,
} from "@mui/material";
import { useIntl, FormattedMessage } from 'react-intl';

const NewSecretDialog = ({ open, onClose, onCreate }) => {
    const initialFormState = {
        description: "",
        expiryOption: "30",
        customDays: "",
    };

    const [value, setValue] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState(" ");
    const intl = useIntl();

    const handleKeyDown = (e) => {
        const allowedKeys = [
            "Backspace",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Delete",
        ];

        const isCtrlCmd = e.ctrlKey || e.metaKey;

        // Allow system shortcuts like Ctrl+C, Ctrl+V, Ctrl+A
        if (isCtrlCmd) {
            return;
        }

        // Allow navigation keys
        if (allowedKeys.includes(e.key)) {
            return;
        }

        // Allow digits only
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            showTemporaryError(
                intl.formatMessage({
                    id: "Shared.AppsAndKeys.Secrets.NewSecretDialog.error.digitsOnly",
                    defaultMessage: "Only digits (0–9) are allowed",
                })
            );
        } else {
            setError(false);
            setHelperText(" ");
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text");

        // Allow only positive integers greater than 0
        if (!/^[1-9][0-9]*$/.test(paste)) {
            e.preventDefault();
            showTemporaryError(
                intl.formatMessage({
                    id: "Shared.AppsAndKeys.Secrets.NewSecretDialog.error.only.positive.numbers",
                    defaultMessage: "Only positive whole numbers are allowed",
                })
            );
        }
    };

    const handleCustomDaysChange = (e) => {
        const newValue = e.target.value;
        setForm({ ...form, customDays: newValue });
        if (newValue === "" || /^[1-9][0-9]*$/.test(newValue)) {
            setError(false);
            setHelperText("");
            setIsValid(newValue !== "");
        } else {
            setIsValid(false);
            showTemporaryError(
                intl.formatMessage({
                    id: "Shared.AppsAndKeys.Secrets.NewSecretDialog.error.positive.whole.numbers",
                    defaultMessage: "Only positive whole numbers allowed",
                })
            );
        }
    };

    const showTemporaryError = (message) => {
        setError(true);
        setHelperText(message);
        setTimeout(() => {
            setError(false);
            setHelperText("");
        }, 2000);
    };

    const handleClose = () => {
        setForm(initialFormState);
        setIsValid(true); // Reset validity when closing
        onClose();
    };

    const handleSubmit = () => {
        let expiryDays = 0;

        if (form.expiryOption === "custom") {
            expiryDays = parseInt(form.customDays || 0, 10);
        } else if (form.expiryOption !== "never") {
            expiryDays = parseInt(form.expiryOption, 10);
        }

        // Build payload conditionally — omit expiresInSeconds for "never"
        const payload = {
            description: form.description,
            ...(form.expiryOption !== "never" && {
                expiresInSeconds: expiryDays > 0 ? expiryDays * 24 * 60 * 60 : 0,
            }),
        };
        onCreate(payload);
        // Reset form after creation
        setForm(initialFormState);
        onClose();
    };

    // determine if Create button should be disabled
    const isCreateDisabled =
        form.expiryOption === "custom" ? !isValid : false;

    // determine tooltip message
    const tooltipTitle =
        form.expiryOption === "custom" && !isValid
            ? intl.formatMessage({
                id: "Shared.AppsAndKeys.Secrets.NewSecretDialog.valid.days.tooltip",
                defaultMessage: "Enter a valid number of days to enable creation",
            })
            : "";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create New Secret</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField
                        label={intl.formatMessage({
                            id: 'Shared.AppsAndKeys.Secrets.NewSecretDialog.description.label',
                            defaultMessage: 'Description (optional)',

                        })}
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
                        label={intl.formatMessage({
                            id: 'Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.label',
                            defaultMessage: 'Expiry Time',

                        })}
                        fullWidth
                        value={form.expiryOption}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Reset state properly based on selection
                            if (value === "custom") {
                                setForm({ ...form, expiryOption: value, customDays: "" }); // reset input
                                setIsValid(false); // must enter a new value
                            } else {
                                setForm({ ...form, expiryOption: value }); // normal selection
                                setIsValid(true); // predefined values are always valid
                            }
                        }}
                    >
                        <MenuItem value="30">
                            <FormattedMessage
                                id="Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.30days"
                                defaultMessage="30 days" />
                        </MenuItem>
                        <MenuItem value="60">
                            <FormattedMessage
                                id="Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.60days"
                                defaultMessage="60 days" />
                        </MenuItem>
                        <MenuItem value="90">
                            <FormattedMessage
                                id="Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.90days"
                                defaultMessage="90 days" />
                        </MenuItem>
                        <MenuItem value="180">
                            <FormattedMessage
                                id="Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.180days"
                                defaultMessage="180 days" />
                        </MenuItem>
                        <MenuItem value="never">
                            <FormattedMessage
                                id="Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.never"
                                defaultMessage="Never Expires" />
                        </MenuItem>
                        <MenuItem value="custom">
                            <FormattedMessage
                                id="Shared.AppsAndKeys.Secrets.NewSecretDialog.expiry.time.custom"
                                defaultMessage="Custom" />
                        </MenuItem>
                    </TextField>

                    {form.expiryOption === "custom" && (
                        <TextField
                            label={intl.formatMessage({
                                id: 'Shared.AppsAndKeys.Secrets.NewSecretDialog.custom.expiry.time.label',
                                defaultMessage: 'Custom Expiry Time(days)',
                            })}
                            type="number"
                            fullWidth
                            value={form.customDays}
                            onChange={handleCustomDaysChange}
                            onPaste={handlePaste}
                            onKeyDown={handleKeyDown}
                            error={error}
                            helperText={helperText}
                            inputProps={{
                                min: 1, // ensures spinner doesn’t go below 1
                                step: 1, // integer only
                            }}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    <FormattedMessage
                        id='Shared.AppsAndKeys.Secrets.NewSecretDialog.cancel.button'
                        defaultMessage='Cancel'
                    />
                </Button>

                {/* Wrap button in Tooltip to show reason when disabled */}
                <Tooltip title={tooltipTitle} disableHoverListener={!isCreateDisabled}>
                    <span>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isCreateDisabled}
                        >
                            <FormattedMessage
                                id='Shared.AppsAndKeys.Secrets.NewSecretDialog.create.button'
                                defaultMessage='Create'
                            />
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default NewSecretDialog;
