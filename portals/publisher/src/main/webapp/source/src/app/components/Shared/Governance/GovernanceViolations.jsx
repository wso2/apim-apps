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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import GovernanceViolationsSummary, { violationSeverityMap } from './GovernanceViolationsSummary';

// Severity priority mapping (higher number = higher priority)
const severityPriority = {
    ERROR: 3,
    WARN: 2,
    INFO: 1,
};

function GovernanceViolations({ violations }) {
    const [expandViolations, setExpandViolations] = useState(true);
    const [selectedSeverity, setSelectedSeverity] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const columns = [
        { id: 'severity', label: 'Severity' },
        { id: 'ruleName', label: 'Rule' },
        { id: 'violatedPath', label: 'Path' },
        { id: 'message', label: 'Message' },
    ];

    const filteredViolations = (selectedSeverity
        ? violations.filter(v => v.severity === selectedSeverity)
        : violations
    ).sort((a, b) => severityPriority[b.severity] - severityPriority[a.severity]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Grid item xs={10} md={12} paddingTop={6}>
            <Accordion
                expanded={expandViolations}
                onChange={() => { setExpandViolations(!expandViolations) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <Grid container direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography sx={{ fontWeight: 600 }}>
                            <FormattedMessage
                                id='Apis.Details.Environments.GovernanceViolations.title'
                                defaultMessage='Governance Rule Violations'
                            />
                        </Typography>
                        <GovernanceViolationsSummary
                            violations={violations}
                            handleChange={(event, value) => {
                                event.stopPropagation();
                                setSelectedSeverity(value);
                                setExpandViolations(true);
                            }}
                        />
                    </Grid>
                </AccordionSummary>
                <AccordionDetails style={{ padding: 0 }}>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table stickyHeader aria-label='violations table' size='small'>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                style={{ minWidth: column.minWidth }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredViolations
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((violation, index) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <TableRow hover key={index}>
                                                <TableCell>{violationSeverityMap[violation.severity]}</TableCell>
                                                <TableCell>{violation.ruleName}</TableCell>
                                                <TableCell>{violation.violatedPath}</TableCell>
                                                <TableCell>{violation.message}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component='div'
                            count={filteredViolations.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
}

export default GovernanceViolations;
