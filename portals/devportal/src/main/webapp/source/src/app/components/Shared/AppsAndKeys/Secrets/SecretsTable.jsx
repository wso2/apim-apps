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

import React, { useEffect, useState, useMemo } from "react";
import {
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    TextField,
    InputAdornment,
    FormControlLabel,
    Switch,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import NewSecretDialog from "./NewSecretDialog";
import PropTypes from 'prop-types';
import SearchIcon from "@mui/icons-material/Search";
import Application from '../../../../data/Application';
import DeleteSecretDialog from "./DeleteSecret";
import SecretValueDialog from "./SecretValueDialog";
import CONSTS from 'AppData/Constants';
import Alert from 'AppComponents/Shared/Alert';
import { useIntl, FormattedMessage } from 'react-intl';
import { maskSecret } from './util';

const SecretsTable = (props) => {

    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [openNewDialog, setOpenNewDialog] = useState(false);
    const [showExpired, setShowExpired] = useState(false);
    const [generatedSecret, setGeneratedSecret] = useState(null); // holds the newly created secret
    const [openSecretValueDialog, setOpenSecretValueDialog] = useState(false); // dialog visibility
    const intl = useIntl();

    const applicationPromise = useMemo(() => Application.get(props.appId), [props.appId]);

    const fetchSecrets = async () => {
        try {
            const application = await applicationPromise;
            const response = await application.getSecrets(props.keyMappingId);
            setSecrets(response || []);
        } catch (error) {
            const status = error?.status;
            if (status === 404) {
                // Clear secrets for this key mapping
                setSecrets([]);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Shared.AppsAndKeys.Secrets.SecretsTable.fetch.error',
                    defaultMessage: 'Error fetching secrets',
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecrets();
    }, []);

    const handleDelete = async (secretId) => {

        try {
            const application = await applicationPromise;
            const status = await application.deleteSecret(props.keyMappingId, secretId);

            if (status === 204) {
                let successMessage = intl.formatMessage({
                    defaultMessage: 'Secret deleted successfully!',
                    id: 'Shared.AppsAndKeys.Secrets.SecretsTable.secret.deleted.successfully',
                });
                Alert.info(successMessage);
                // Remove the deleted item from the state
                setSecrets((prev) => {
                    const updated = prev.filter((s) => s.secretId !== secretId);

                    // Adjust pagination if current page is now invalid
                    const maxPage = Math.ceil(updated.length / rowsPerPage) - 1;
                    if (page > maxPage) {
                        setPage(maxPage);
                    }

                    return updated;
                });
            } else {
                let errorMessage = intl.formatMessage({
                    defaultMessage: 'Unexpected response while deleting secret.',
                    id: 'Shared.AppsAndKeys.Secrets.SecretsTable.secret.deletion.unexpected.response',
                });
                Alert.error(errorMessage);
            }
        } catch (error) {
            console.log(error);
            let message = intl.formatMessage({
                defaultMessage: 'Error while deleting secret',
                id: 'Shared.AppsAndKeys.Secrets.SecretsTable.secret.deletion.error',
            });
            Alert.error(message);
        };
    };

    const handleCreateSecret = async (newSecret) => {
        const application = await applicationPromise;

        // Build payload as expected by your API
        const payload = {
            expiresIn: newSecret.expiresInSeconds,
            description: newSecret.description
        };

        try {
            const response = await application.generateSecret(props.keyMappingId, payload);

            let successMessage = intl.formatMessage({
                defaultMessage: 'Secret created successfully!',
                id: 'Shared.AppsAndKeys.Secrets.SecretsTable.secret.created.successfully',
            });
            Alert.info(successMessage);
            setOpenNewDialog(false);

            // Show the secret value dialog
            setGeneratedSecret(response.secretValue);
            setOpenSecretValueDialog(true);

            // Mask secret before adding to table
            const maskedResponse = {
                ...response,
                secretValue: maskSecret(response.secretValue, props.hashEnabled),
            };

            // Refresh or append new secret to table
            setSecrets((prev) => [...prev, maskedResponse]);
        } catch (error) {
            console.error("Error creating secret:", error);
            let errorMessage = intl.formatMessage({
                defaultMessage: 'Secret creation failed!',
                id: 'Shared.AppsAndKeys.Secrets.SecretsTable.secret.creation.failed',
            });
            Alert.error(errorMessage);
        }
    };

    /**
     * Renders the "Expires In" column with color and tooltip.
     * Handles "Never expires", "Expired", and remaining days cases.
     *
     * @param {number} expiryEpochInSeconds - Expiry timestamp in seconds (epoch)
     */
    const renderExpiresIn = (expiryEpochInSeconds) => {
        if (!expiryEpochInSeconds || expiryEpochInSeconds === 0) {
            return (
                <Tooltip
                    title={
                        <FormattedMessage
                            id="Shared.AppsAndKeys.Secrets.SecretsTable.body.tooltip.never.expire"
                            defaultMessage="This secret never expires"
                        />
                    }
                    arrow
                >
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.Secrets.SecretsTable.body.never.expire.secret'
                            defaultMessage='Never expires'
                        />
                    </Typography>
                </Tooltip>
            );
        }

        const expiryEpoch = expiryEpochInSeconds * 1000;
        const now = Date.now();
        const diffMs = expiryEpoch - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        // Format the expiry date in a human-friendly way
        const expiryDate = new Date(expiryEpoch);
        const formattedDate = expiryDate.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        if (diffMs < 0) {
            return (
                <Tooltip
                    title={
                        <FormattedMessage
                            id="Shared.AppsAndKeys.Secrets.SecretsTable.body.tooltip.expiredOn"
                            defaultMessage="Expired on: {date}"
                            values={{ date: formattedDate }}
                        />
                    }
                    arrow
                >
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.Secrets.SecretsTable.body.expired.secret'
                            defaultMessage='Expired'
                        />
                    </Typography>
                </Tooltip>
            );
        }

        return (
            <Tooltip
                title={
                    <FormattedMessage
                        id="Shared.AppsAndKeys.Secrets.SecretsTable.body.tooltip.expiresOn"
                        defaultMessage="Expires on: {date}"
                        values={{ date: formattedDate }}
                    />
                }
                arrow
            >
                <Typography variant="body2">
                    <FormattedMessage
                        id="Shared.AppsAndKeys.Secrets.SecretsTable.body.expiresInDays"
                        defaultMessage="{count} day{count, plural, one {} other {s}}"
                        values={{ count: diffDays }}
                    />
                    {/*`${diffDays} day${diffDays !== 1 ? 's' : ''}`*/}
                </Typography>
            </Tooltip>
        );
    };

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseSecretValueDialog = () => {
        setOpenSecretValueDialog(false);
        setGeneratedSecret(null);
    };

    // Filter by description, expiration, and search term
    const filteredSecrets = useMemo(() => {
        return secrets.filter((secret) => {
            const { additionalProperties } = secret || {};
            const description = additionalProperties?.description || "";
            const expiresAt = additionalProperties?.expiresAt;
            const expiresAtInSeconds = expiresAt * 1000;

            const matchesSearch =
                !searchTerm ||
                description?.toLowerCase().includes(searchTerm.toLowerCase());

            const isExpired = expiresAtInSeconds && Date.now() > expiresAtInSeconds;

            // Show all if showExpired=true, else filter out expired
            const showSecret = showExpired || !isExpired;

            return matchesSearch && showSecret;
        });
    }, [secrets, searchTerm, showExpired]);

    const paginatedSecrets = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredSecrets.slice(start, end);
    }, [filteredSecrets, page, rowsPerPage]);

    const isExpired = (expiresAtInSeconds) => Date.now() > expiresAtInSeconds * 1000;

    const hasExpiredSecrets = useMemo(
        () => secrets.some((s) => s.additionalProperties?.expiresAt && isExpired(s.additionalProperties.expiresAt)),
        [secrets]
    );

    const allSecretsExpired = useMemo(
        () =>
            secrets.length > 0 &&
            secrets.every((s) => s.additionalProperties?.expiresAt && isExpired(s.additionalProperties.expiresAt)),
        [secrets]
    );

    // ID of the most recently added secret
    const latestSecretId = useMemo(() => {
        if (!secrets || secrets.length === 0) {
            return null;
        }
        return secrets[secrets.length - 1].secretId;
    }, [secrets]);

    // Automatically toggle ON if all secrets are expired
    useEffect(() => {
        if (allSecretsExpired) {
            setShowExpired(true);
        }
    }, [allSecretsExpired]);

    const currentCount = secrets?.length || 0;
    const maxReached = props.secretCount > 0 && currentCount >= props.secretCount;

    if (loading)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );

    return (
        <Grid container spacing={2} alignItems="flex-start" mb={2}>
            <Grid item xs={12} md={9}>
                <Box sx={(theme) => ({
                    position: "relative",
                    backgroundColor: "inherit", // Paper inherits from parent
                })}>
                    <Typography
                        variant="caption"
                        sx={{
                            position: "absolute",
                            top: -10,
                            left: 10,
                            backgroundColor: "background.paper",
                            px: 0.3,
                            color: "text.disabled",
                        }}
                    >
                        <FormattedMessage
                            id="Shared.AppsAndKeys.Secrets.SecretsTable.consumer.secrets"
                            defaultMessage="Consumer Secrets"
                        />
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            backgroundColor: 'inherit',
                            width: "100%", overflow: "hidden",
                            borderColor: "rgba(0, 0, 0, 0.23)", // Same as MUI's default TextField outline
                            borderWidth: 1,
                            borderRadius: 1, // Matches TextField rounded corners
                            boxShadow: "none", // Remove Paper shadow
                            p: 3,
                        }}>
                        {/* Row: New Secret + Show Expired */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                            <Tooltip
                                title={
                                    maxReached && (
                                        <FormattedMessage
                                            id="Shared.AppsAndKeys.Secrets.SecretsTable.new.secret.button.tooltip.maxReached"
                                            defaultMessage="Maximum number of consumer secrets reached"
                                        />
                                    )
                                }
                                placement="top"
                            >
                                {/* Wrapping Button in span so Tooltip works when button is disabled */}
                                <span>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon sx={{ color: "white" }} />}
                                        onClick={() => setOpenNewDialog(true)}
                                        disabled={maxReached}
                                    >
                                        <FormattedMessage
                                            id="Shared.AppsAndKeys.Secrets.SecretsTable.new.secret.button"
                                            defaultMessage="New Secret"
                                        />
                                    </Button>
                                </span>
                            </Tooltip>

                            {/*  Show banner when all secrets are expired */}
                            {allSecretsExpired && (
                                <MuiAlert
                                    severity="warning"
                                    sx={{
                                        height: 40,
                                        display: "flex",
                                        alignItems: "center",
                                        px: 2,
                                        py: 0,
                                        borderRadius: 1,
                                        whiteSpace: "nowrap", // keeps text on one line
                                    }}
                                >
                                    <FormattedMessage
                                        id="Shared.AppsAndKeys.Secrets.SecretsTable.alert.allExpired"
                                        defaultMessage="All secrets have expired. Showing expired secrets only."
                                    />
                                </MuiAlert>
                            )}
                            <Tooltip
                                title={
                                    allSecretsExpired ? (
                                        <FormattedMessage
                                            id="Shared.AppsAndKeys.Secrets.SecretsTable.switch.tooltip.allExpired"
                                            defaultMessage="All secrets are expired"
                                        />
                                    ) : !hasExpiredSecrets ? (
                                        <FormattedMessage
                                            id="Shared.AppsAndKeys.Secrets.SecretsTable.switch.tooltip.noneExpired"
                                            defaultMessage="No expired secrets available"
                                        />
                                    ) : (
                                        ""
                                    )
                                }
                            >
                                <span>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={showExpired}
                                                onChange={(e) => setShowExpired(e.target.checked)}
                                                color="primary"
                                                disabled={!hasExpiredSecrets || allSecretsExpired}
                                                size="small"
                                            />
                                        }
                                        label={
                                            <FormattedMessage
                                                id="Shared.AppsAndKeys.Secrets.SecretsTable.switch.showExpired"
                                                defaultMessage="Show Expired"
                                            />
                                        }
                                    />
                                </span>
                            </Tooltip>
                        </Box>

                        {/* Search bar (full width) */}
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder={intl.formatMessage({
                                    id: "Shared.AppsAndKeys.Secrets.SecretsTable.searchPlaceholder",
                                    defaultMessage: "Search by description...",
                                })}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Table */}
                        <TableContainer sx={{ tableLayout: 'fixed' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '35%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                <FormattedMessage
                                                    id="Shared.AppsAndKeys.Secrets.SecretsTable.heading.description"
                                                    defaultMessage="Description"
                                                />
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '35%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                <FormattedMessage
                                                    id="Shared.AppsAndKeys.Secrets.SecretsTable.heading.value"
                                                    defaultMessage="Value"
                                                />
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '20%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                <FormattedMessage
                                                    id="Shared.AppsAndKeys.Secrets.SecretsTable.heading.expiresIn"
                                                    defaultMessage="Expires In"
                                                />
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '10%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                <FormattedMessage
                                                    id="Shared.AppsAndKeys.Secrets.SecretsTable.heading.actions"
                                                    defaultMessage="Actions"
                                                />
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {paginatedSecrets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <FormattedMessage
                                                    id="Shared.AppsAndKeys.Secrets.SecretsTable.body.no.secrets.found"
                                                    defaultMessage="No secrets found"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedSecrets.map((secret) => {
                                            const { secretId, secretValue, additionalProperties } =
                                                secret;
                                            const { description, expiresAt } = additionalProperties || {};

                                            return (
                                                <TableRow key={secretId}>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            fontStyle={!description ? 'italic' : 'normal'}
                                                            color={!description ? 'text.secondary' : 'inherit'}
                                                        >
                                                            {description || (
                                                                <FormattedMessage
                                                                    id="Shared.AppsAndKeys.Secrets.SecretsTable.body.noDescription"
                                                                    defaultMessage="No description"
                                                                />
                                                            )}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {secretValue}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {renderExpiresIn(expiresAt)}
                                                        </Box>
                                                    </TableCell>

                                                    <TableCell>
                                                        <DeleteSecretDialog
                                                            onDelete={() => handleDelete(secretId)}
                                                            disabled={secretId === latestSecretId}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredSecrets.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                        <NewSecretDialog
                            open={openNewDialog}
                            onClose={() => setOpenNewDialog(false)}
                            onCreate={handleCreateSecret}
                            mode={CONSTS.SECRET_DIALOG_MODES.ADD_SECRET}
                        />
                        <SecretValueDialog
                            open={openSecretValueDialog}
                            onClose={handleCloseSecretValueDialog}
                            secret={generatedSecret}
                        />
                    </Paper>
                </Box>
            </Grid>
        </Grid>
    );
};

SecretsTable.propTypes = {
    appId: PropTypes.string,
    keyMappingId: PropTypes.string,
};

export default SecretsTable;
