/* eslint-disable */
/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from 'react';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { spectralSeverityMap as severityMap} from '../Linting/Linting'

const useStyles = makeStyles((theme) => ({

    tableCell: {
        border: 'none',
        fontSize: '10px !important',
    },
    headerTableCell: {
        background: 'transparent',
        fontSize: 10,
        fontWeight: 'bold',
        border: 'none',
    },
    tableRow: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        cursor: 'pointer',
    },
    tableWrapper: {
        '& table tr td:first-child': {
            width: 10,
        },
        '& table tr td:nth-child(2)': {
            width: 10,
        },
    },
    headerTableRow: {
        display: 'flex',
    }

}));

export default function LinterUI(props) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const { linterResults, handleRowClick } = props;
    const classes = useStyles();

    function getData(type, line, message, code) {
        return { type, line, message, code};
    }

    const columns = [
        { id: 'type',
            label: 'Type',
            minWidth: 50,
        },
        { id: 'line',
            label: 'Line',
            minWidth: 50
        },
        {
            id: 'message',
            label: 'Message',
            minWidth: 170,
            align: 'left',
        },
    ];

    const  rows = linterResults.map((item, index) => getData(
            severityMap[item.severity],
            item.range.start.line + 1, 
            item.message,
            index,
    ));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }} className={classes.tableWrapper}>
                <Table stickyHeader aria-label='linter-table'>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    className={classes.headerTableCell}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow
                                        key={row.code}
                                        className={classes.tableRow}
                                        onClick={() => handleRowClick(row.line)}
                                    >
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    className={classes.tableCell}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component='div'
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
