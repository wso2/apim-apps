import React, { useState } from 'react';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    fullHeight: {
        height: '100%',
    },
    tableRow: {
        height: theme.spacing(5),
        '& td': {
            padding: theme.spacing(0.5),
        },
    },
    appOwner: {
        pointerEvents: 'none',
    },
    appName: {
        '& a': {
            color: '#1b9ec7 !important',
        },
    },
    appTablePaper: {
        '& table tr td': {
            paddingLeft: theme.spacing(1),
        },
        '& table tr td:first-child, & table tr th:first-child': {
            paddingLeft: theme.spacing(2),
        },
        '& table tr td button.Mui-disabled span.material-icons': {
            color: theme.palette.action.disabled,
        },
    },
    tableCellWrapper: {
        '& td': {
            'word-break': 'break-all',
            'white-space': 'normal',
        },
    },
}));

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
    root: {
        '&:first-child': {
            paddingLeft: theme.spacing(2),
        },
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))(TableRow);

const ApisTableContent = ({ apis }) => {
    const [notFound, setNotFound] = useState(false);
    const classes = useStyles();

    if (notFound) {
        return <ResourceNotFound />;
    }

    return (
        <TableBody className={classes.fullHeight}>
            {apis && apis.map((api) => (
                <StyledTableRow className={classes.tableRow} key={api.apiId}>
                    <StyledTableCell align='left'>
                        {api.name}
                    </StyledTableCell>
                    <StyledTableCell align='left'>{api.version}</StyledTableCell>
                    <StyledTableCell align='left'>
                        {api.provider}
                        <IconButton color="primary" onClick={() => console.log("123")}>
                            <EditIcon aria-label='edit-api-settings' />
                        </IconButton>
                    </StyledTableCell>
                </StyledTableRow>
            ))}
        </TableBody>
    );
};

ApisTableContent.propTypes = {
    apis: PropTypes.instanceOf(Map).isRequired,
    classes: PropTypes.object.isRequired,
};

export default ApisTableContent;
