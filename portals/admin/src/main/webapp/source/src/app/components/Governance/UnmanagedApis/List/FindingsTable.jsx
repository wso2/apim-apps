/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Paper, Chip, Typography, Box,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Style overrides for the four chip variants. Mirrors the Compliance
 * dashboard palette (coral / pink / blue) per spec
 * phase4_admin_portal.md §6.2 — values eyeballed from the existing pages
 * since the spec's hex codes were intent-only, not literal.
 */
const chipSx = {
    shadow: { backgroundColor: '#FAECE7', color: '#712B13' },
    drift: { backgroundColor: '#FBEAF0', color: '#72243E' },
    internal: { backgroundColor: '#E6F1FB', color: '#0C447C' },
};

/**
 * FindingsTable renders the paginated list of unmanaged APIs. Click a
 * row to navigate to /governance/unmanaged-apis/<id> (Round 11 detail).
 *
 * @param {object} props component props
 * @returns {JSX} table + pagination
 */
const FindingsTable = ({
    items, total, page, rowsPerPage, onPageChange, onRowsPerPageChange,
    onRowClick, history,
}) => {
    const intl = useIntl();

    const handleRow = (id) => {
        if (onRowClick) {
            onRowClick(id);
        } else {
            history.push(`/governance/unmanaged-apis/${id}`);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleString();
        } catch (e) {
            return iso;
        }
    };

    return (
        <Paper variant='outlined'>
            <TableContainer>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <FormattedMessage
                                    id='Discovery.column.service'
                                    defaultMessage='Service'
                                />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage
                                    id='Discovery.column.method'
                                    defaultMessage='Method'
                                />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage
                                    id='Discovery.column.path'
                                    defaultMessage='Path'
                                />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage
                                    id='Discovery.column.tags'
                                    defaultMessage='Tags'
                                />
                            </TableCell>
                            <TableCell align='right'>
                                <FormattedMessage
                                    id='Discovery.column.observations'
                                    defaultMessage='Obs.'
                                />
                            </TableCell>
                            <TableCell align='right'>
                                <FormattedMessage
                                    id='Discovery.column.clients'
                                    defaultMessage='Clients'
                                />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage
                                    id='Discovery.column.lastSeen'
                                    defaultMessage='Last seen'
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                        >
                                            <FormattedMessage
                                                id='Discovery.findings.empty'
                                                defaultMessage='No findings match the current filters.'
                                            />
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((row) => (
                            <TableRow
                                key={row.id}
                                hover
                                onClick={() => handleRow(row.id)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>{row.serviceIdentity}</TableCell>
                                <TableCell>
                                    <Typography variant='body2'>
                                        <strong>{row.method}</strong>
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                    {row.normalizedPath}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {row.classification === 'shadow' && (
                                            <Chip
                                                size='small'
                                                label={intl.formatMessage({
                                                    id: 'Discovery.tag.shadow',
                                                    defaultMessage: 'Shadow',
                                                })}
                                                sx={chipSx.shadow}
                                            />
                                        )}
                                        {row.classification === 'drift' && (
                                            <Chip
                                                size='small'
                                                label={intl.formatMessage({
                                                    id: 'Discovery.tag.drift',
                                                    defaultMessage: 'Drift',
                                                })}
                                                sx={chipSx.drift}
                                            />
                                        )}
                                        {row.isInternal && (
                                            <Chip
                                                size='small'
                                                label={intl.formatMessage({
                                                    id: 'Discovery.tag.internal',
                                                    defaultMessage: 'Internal',
                                                })}
                                                sx={chipSx.internal}
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align='right'>
                                    {row.observationCount}
                                </TableCell>
                                <TableCell align='right'>
                                    {row.distinctClientCount}
                                </TableCell>
                                <TableCell>
                                    {formatDate(row.lastSeenAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component='div'
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                onPageChange={(event, newPage) => onPageChange(newPage)}
                onRowsPerPageChange={(event) => onRowsPerPageChange(
                    parseInt(event.target.value, 10),
                )}
            />
        </Paper>
    );
};

FindingsTable.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        serviceIdentity: PropTypes.string,
        method: PropTypes.string,
        normalizedPath: PropTypes.string,
        classification: PropTypes.string,
        isInternal: PropTypes.bool,
        observationCount: PropTypes.number,
        distinctClientCount: PropTypes.number,
        lastSeenAt: PropTypes.string,
    })).isRequired,
    total: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
    onRowClick: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

FindingsTable.defaultProps = {
    onRowClick: null,
};

export default withRouter(FindingsTable);
