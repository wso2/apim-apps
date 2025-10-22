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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TablePagination,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    TextField,
    InputAdornment,
} from "@mui/material";
import PropTypes from 'prop-types';
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import Application from '../../../data/Application';
import DeleteSecretDialog from "./DeleteSecret";
import Alert from 'AppComponents/Shared/Alert';

const SecretsTable = (props) => {

    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showSecret, setShowSecret] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    //const {appId} = this.props;

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

    const handleDelete = async (referenceId) => {
        // let message = intl.formatMessage({
        //     defaultMessage: 'Secret deleted successfully!',
        //     id: 'Applications.Listing.Listing.application.deleted.successfully',
        // });
    try {
        let message = 'Secret deleted successfully!';
        const application = await applicationPromise;
        const status = await application.deleteSecret(props.keyMappingId, referenceId);

        if (status === 204) {
            Alert.info(message);
            this.toggleDeleteConfirmation();
            fetchSecrets();
        }
    } catch(error) {
            console.log(error);
            message = 'Error while deleting secret';
            // message = intl.formatMessage({
            //     defaultMessage: 'Error while deleting secret',
            //     id: 'Applications.Listing.Listing.application.deleting.error',
            // });
            Alert.error(message);
        };
    };

    /**
   * Calculates how many days remain until expiry.
   * Handles expired and "never expires" cases.
   *
   * @param {number} expiryEpoch - Expiry time in milliseconds since epoch.
   * @returns {string} Human-readable message: e.g. "5 days remaining", "Expired", or "Never expires".
   */
    function daysUntilExpiry(expiryEpoch) {
        if (!expiryEpoch || expiryEpoch === 0) {
            return "Never expires";
        }

        const now = Date.now();
        const diffMs = expiryEpoch - now;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffMs < 0) {
            return "Expired";
        }

        const daysRemaining = Math.ceil(diffDays);
        return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    }

    const renderExpiresIn = (expiresInMs, expiresAt) => {
        const expiresInDays = Math.floor(expiresInMs / (1000 * 60 * 60 * 24));
        let displayText = '';
        let color = 'text.primary';

        if (expiresInMs === 0) {
            displayText = 'Never expires';
            color = 'text.secondary';
        } else if (expiresInMs < 0) {
            displayText = 'Expired';
            color = 'error.main';
        } else {
            displayText = `${expiresInDays} days`;
        }

        const formattedDate = expiresAt
            ? format(new Date(expiresAt), 'PPP p') // e.g. "Oct 25, 2025, 5:30 PM"
            : 'No expiry date available';

        return (
            <Tooltip title={`Expires on: ${formattedDate}`} arrow>
                <Typography variant="body2" sx={{ color, fontWeight: 500 }}>
                    {displayText}
                </Typography>
            </Tooltip>
        );
    };

    const isExpired = (daysUntilExpiry) => {
        // Assuming expiresIn is the remaining time; if <= 0, it’s expired
        return daysUntilExpiry == 'Expired';
    };

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const toggleSecretVisibility = (id) => {
        setShowSecret((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter logic (case-insensitive on description)
    const filteredSecrets = useMemo(() => {
        return secrets.filter((s) =>
            s.additionalProperties?.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [secrets, searchTerm]);

    if (loading)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );

    return (
        <Paper sx={{ width: "100%", overflow: "hidden", p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Client Secrets
            </Typography>

            {/* Search bar */}
            <Box sx={{ mb: 2 }}>
                <TextField
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
                    sx={{ width: "300px" }}
                />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Expires In</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {secrets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No secrets found
                                </TableCell>
                            </TableRow>
                        ) : (
                            secrets
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((secret) => {
                                    const { referenceId, secretValue, additionalProperties } = secret;
                                    const { description, expiresAt } = additionalProperties || {};
                                    const isVisible = showSecret[referenceId];
                                    //   const daysUntilExpiry = this.daysUntilExpiry(expiresAt);
                                    //   const expired = isExpired(daysUntilExpiry);

                                    return (
                                        <TableRow key={referenceId}>
                                            <TableCell>{description || "—"}</TableCell>

                                            <TableCell sx={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type={isVisible ? "text" : "password"}
                                                    value={secretValue}
                                                    readOnly
                                                    style={{
                                                        border: "none",
                                                        background: "transparent",
                                                        fontSize: "1rem",
                                                        width: "90%",
                                                    }}
                                                />
                                                <Tooltip title={isVisible ? "Hide" : "Show"}>
                                                    <IconButton size="small" onClick={() => toggleSecretVisibility(referenceId)}>
                                                        {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography>{daysUntilExpiry(expiresAt)}</Typography>
                                                    {/* {expired && (
                            <Tooltip title="Expired">
                              <ErrorIcon color="error" fontSize="small" />
                            </Tooltip>
                          )} */}
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <DeleteSecretDialog onDelete={() => handleDelete(referenceId)} />
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
        </Paper>
    );
};

SecretsTable.propTypes = {
    appId: PropTypes.string,
    keyMappingId: PropTypes.string,
};

export default SecretsTable;
