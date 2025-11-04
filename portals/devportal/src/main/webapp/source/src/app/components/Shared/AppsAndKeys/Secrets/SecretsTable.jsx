/*
* Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import AddIcon from "@mui/icons-material/Add";
import NewSecretDialog from "./NewSecretDialog";
import PropTypes from 'prop-types';
import SearchIcon from "@mui/icons-material/Search";
import Application from '../../../../data/Application';
import DeleteSecretDialog from "./DeleteSecret";
import SecretValueDialog from "./SecretValueDialog";
import Alert from 'AppComponents/Shared/Alert';
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

    const applicationPromise = Application.get(props.appId);

    const fetchSecrets = async () => {
        try {
            const application = await applicationPromise;
            const response = await application.getSecrets(props.keyMappingId);
            setSecrets(response || []);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error("Error fetching secrets:", error);
            }

            const status = error?.status;
            if (status === 404) {
                this.setState({ notFound: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecrets();
    }, []);

    const handleDelete = async (secretId) => {
        // let message = intl.formatMessage({
        //     defaultMessage: 'Secret deleted successfully!',
        //     id: 'Applications.Listing.Listing.application.deleted.successfully',
        // });
        try {
            let message = 'Secret deleted successfully!';
            const application = await applicationPromise;
            const status = await application.deleteSecret(props.keyMappingId, secretId);

            if (status === 204) {
                Alert.info(message);
                // ✅ Remove the deleted item from the state
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
                Alert.error('Unexpected response while deleting secret.');
            }
        } catch (error) {
            console.log(error);
            message = 'Error while deleting secret';
            // message = intl.formatMessage({
            //     defaultMessage: 'Error while deleting secret',
            //     id: 'Applications.Listing.Listing.application.deleting.error',
            // });
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

            Alert.info("Secret created successfully!");
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
            Alert.error("Failed to create secret");
        }
    };

    /**
     * Renders the "Expires In" column with color and tooltip.
     * Handles "Never expires", "Expired", and remaining days cases.
     *
     * @param {number} expiryEpoch - Expiry timestamp in milliseconds (epoch)
     */
    const renderExpiresIn = (expiryEpoch) => {
        if (!expiryEpoch || expiryEpoch === 0) {
            return (
                <Tooltip title="This secret never expires" arrow>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Never expires
                    </Typography>
                </Tooltip>
            );
        }

        const now = Date.now();
        const diffMs = expiryEpoch - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        //const formattedDate = format(new Date(expiryEpoch), 'PPP p'); // Example: Oct 25, 2025, 5:30 PM
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
                <Tooltip title={`Expired on: ${formattedDate}`} arrow>
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        Expired
                    </Typography>
                </Tooltip>
            );
        }

        return (
            <Tooltip title={`Expires on: ${formattedDate}`} arrow>
                <Typography variant="body2">
                    {`${diffDays} day${diffDays !== 1 ? 's' : ''}`}
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

            const matchesSearch =
                !searchTerm ||
                description?.toLowerCase().includes(searchTerm.toLowerCase());

            const isExpired = expiresAt && Date.now() > expiresAt;

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

    const hasExpiredSecrets = useMemo(
        () => secrets.some((s) => s.additionalProperties?.expiresAt && Date.now() > s.additionalProperties.expiresAt),
        [secrets]
    );

    const currentCount = secrets?.length || 0;
    const maxReached = currentCount >= props.secretCount;

    if (loading)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );

    return (
        <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={9}>
                <Box sx={{ position: "relative" }}>
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
                        Consumer Secrets
                        {/* <FormattedMessage
                    id="Shared.AppsAndKeys.ViewKeys.consumer.secrets"
                    defaultMessage="Consumer Secrets"
                    /> */}
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{

                            width: "100%", overflow: "hidden", p: 2,
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
                                title={maxReached ? "Maximum number of consumer secrets reached" : ""}
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
                                        New Secret
                                    </Button>
                                </span>
                            </Tooltip>

                            <Tooltip
                                title={
                                    !hasExpiredSecrets
                                        ? "No expired secrets available"
                                        : ""
                                }
                                disableHoverListener={hasExpiredSecrets}
                            >
                                <span>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={showExpired}
                                                onChange={(e) => setShowExpired(e.target.checked)}
                                                color="primary"
                                                disabled={!hasExpiredSecrets}
                                                size="small"
                                            />
                                        }
                                        label="Show Expired"
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
                                placeholder="Search by description..."
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
                                                Description
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '35%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                Value
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '20%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                Expires In
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '10%' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                Actions
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {paginatedSecrets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No secrets found
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
                                                            {description || "No description"}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {secretValue}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>
                                                        {/* <Typography variant="body2">
                                                            {renderExpiresIn(expiresAt)}
                                                        </Typography> */}
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {renderExpiresIn(expiresAt)}
                                                        </Box>
                                                    </TableCell>

                                                    <TableCell>
                                                        <DeleteSecretDialog
                                                            onDelete={() => handleDelete(secretId)}
                                                            disabled={secrets.length <= 1}
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
