import React, { useState } from 'react';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Alert from 'AppComponents/Shared/Alert';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import { FormattedMessage } from 'react-intl';
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
    button: {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
        marginTop: theme.spacing(1),
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

const ApisTableContent = ({ apis, updateApiList }) => {
    const [notFound] = useState(false);
    const restApi = new API();
    const [provider, setProvider] = useState('');
    const [editableRows, setEditableRows] = useState(new Set());

    const classes = useStyles();

    if (notFound) {
        return <ResourceNotFound />;
    }

    const handleEditClick = (apiId) => {
        setEditableRows((prevRows) => {
            const newRows = new Set(prevRows);
            newRows.add(apiId);
            return newRows;
        });
    };

    const handleCancelClick = (apiId) => {
        setEditableRows((prevRows) => {
            const newRows = new Set(prevRows);
            newRows.delete(apiId);
            return newRows;
        });
    };

    const handleSubmitClick = (apiId, apiProvider) => {
        return restApi.updateApiProvider(apiId, apiProvider)
            .then(() => {
                return (
                    Alert.success(
                        <FormattedMessage
                            id='AdminPages.ApiSettings.EditApi.form.edit.successful'
                            defaultMessage='Api provider changed successfully'
                        />,
                    )
                );
            })
            .catch((error) => {
                let validationError = 'Something went wrong when validating the user';
                const { response } = error;
                // This api returns 404 when the $provider is not found.
                // error codes: 901502, 901500 for user not found and scope not found
                if (response?.body?.code === 901502 || response?.body?.code === 901500) {
                    validationError = `${provider} is not a valid User`;
                }
                if (response?.body?.code === 500) {
                    const notValidUser = 'Error while updating the provider name to ' + provider;
                    throw notValidUser;
                } else {
                    const updateError = validationError;
                    throw updateError;
                }
            })
            .finally(() => {
                updateApiList();
                handleCancelClick(apiId);
            });
    };

    return (
        <TableBody className={classes.fullHeight}>
            {apis && apis.map((api) => (
                <StyledTableRow className={classes.tableRow} key={api.id}>
                    <StyledTableCell align='left'>
                        {api.name}
                    </StyledTableCell>
                    <StyledTableCell align='left'>{api.version}</StyledTableCell>
                    <StyledTableCell align='left'>
                        {!editableRows.has(api.id) && (
                            <>
                                {api.provider}
                                <IconButton color='primary' onClick={() => handleEditClick(api.id)}>
                                    <EditIcon aria-label='edit-api-settings' />
                                </IconButton>
                            </>
                        )}
                        {editableRows.has(api.id) && (
                            <>
                                <TextField
                                    id='standard-basic'
                                    label='Enter Provider Name'
                                    variant='standard'
                                    size='small'
                                    defaultValue={api.provider}
                                    value={provider}
                                    onChange={(e) => { setProvider(e.target.value); }}
                                />
                                <Button
                                    variant='contained'
                                    color='primary'
                                    size='small'
                                    className={classes.button}
                                    onClick={() => handleSubmitClick(api.id, provider)}
                                >
                                    Submit
                                </Button>
                                <Button
                                    variant='outlined'
                                    size='small'
                                    className={classes.button}
                                    onClick={() => handleCancelClick(api.id)}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </StyledTableCell>
                </StyledTableRow>
            ))}
        </TableBody>
    );
};

ApisTableContent.propTypes = {
    apis: PropTypes.instanceOf(Map).isRequired,
};

export default ApisTableContent;
