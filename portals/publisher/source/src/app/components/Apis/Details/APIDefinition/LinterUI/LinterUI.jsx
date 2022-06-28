import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { spectralSeverityMap as severityMap} from '../Linting/APILinting'


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

    function getData(type, line, message) {
        return { type, line, message};
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

    const  rows = linterResults.map((item) => getData(
        severityMap[item.severity],
        item.range.start.line, 
        item.message
    ))

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
