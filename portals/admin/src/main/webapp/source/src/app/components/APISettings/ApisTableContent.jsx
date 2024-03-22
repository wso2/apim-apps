/*
* Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import { FormattedMessage } from 'react-intl';
import { IconButton, styled } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const styles = {
    fullHeight: {
        height: '100%',
    },
    tableRow: (theme) => ({
        height: theme.spacing(5),
        '& td': {
            padding: theme.spacing(0.5),
        },
    }),
    appOwner: {
        pointerEvents: 'none',
    },
    appName: {
        '& a': {
            color: '#1b9ec7 !important',
        },
    },
    button: {
        marginLeft: 0.5,
        marginRight: 0.5,
        marginTop: 1,
    },
    appTablePaper: (theme) => ({
        '& table tr td': {
            paddingLeft: theme.spacing(1),
        },
        '& table tr td:first-child, & table tr th:first-child': {
            paddingLeft: theme.spacing(2),
        },
        '& table tr td button.Mui-disabled span.material-icons': {
            color: theme.palette.action.disabled,
        },
    }),
    tableCellWrapper: {
        '& td': {
            'word-break': 'break-all',
            'white-space': 'normal',
        },
    },
    tableActionBtnContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'left',
        justifyContent: 'left',
        marginLeft: 10,
    },
    textfield: {
        maxHeight: '10px',
        marginTop: '-5px',
        maxWidth: '120px',
    },
    tableCell: {
        marginLeft: 10,
    },
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
    root: {
        '&:first-of-type': {
            paddingLeft: theme.spacing(2),
        },
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}));

const StyledDiv = styled('div')({});

const ApisTableContent = ({ apis, updateApiList }) => {
    const restApi = new API();
    const [provider, setProvider] = useState('');
    const [editableRows, setEditableRows] = useState(new Set());

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
        setProvider('');
    };

    const handleSubmitClick = (apiId, apiProvider) => {
        if (apiProvider === '') {
            return (
                Alert.error(
                    <FormattedMessage
                        id='AdminPages.ApiSettings.EditApi.form.edit.error'
                        defaultMessage='API provider should not be empty.'
                    />,
                )
            );
        } else {
            return restApi.updateApiProvider(apiId, apiProvider.trim())
                .then(() => {
                    return (
                        Alert.success(
                            <FormattedMessage
                                id='AdminPages.ApiSettings.EditApi.form.edit.successful'
                                defaultMessage='API provider changed successfully'
                            />,
                        )
                    );
                })
                .catch((error) => {
                    const { response } = error;
                    // This api returns 404 when the $provider is not found.
                    // error codes: 901502, 901500 for user not found and scope not found
                    if (response?.body?.code === 901502 || response?.body?.code === 901500) {
                        return (
                            Alert.error(
                                <FormattedMessage
                                    id='AdminPages.ApiSettings.EditApi.form.edit.other.error'
                                    defaultMessage='Given Username is not valid.'
                                />,
                            )
                        );
                    } else {
                        return (
                            Alert.error(
                                <FormattedMessage
                                    id='AdminPages.ApiSettings.EditApi.form.edit.user.notvalid'
                                    defaultMessage='Error while updating the provider name.'
                                />,
                            )
                        );
                    }
                })
                .finally(() => {
                    updateApiList();
                    handleCancelClick(apiId);
                });
        }
    };

    return (
        <TableBody sx={styles.fullHeight}>
            {apis && apis.map((api) => (
                <StyledTableRow sx={styles.tableRow} key={api.id}>
                    <StyledTableCell align='left'>
                        {api.name}
                    </StyledTableCell>
                    <StyledTableCell align='left'>
                        <StyledDiv sx={styles.tableCell}>
                            {api.version}
                        </StyledDiv>
                    </StyledTableCell>
                    <StyledTableCell align='left'>
                        {!editableRows.has(api.id) && (
                            <StyledDiv sx={styles.tableCell}>
                                { api.provider }
                                <IconButton color='primary' onClick={() => handleEditClick(api.id)}>
                                    <EditIcon aria-label='edit-api-settings' />
                                </IconButton>
                            </StyledDiv>
                        )}
                        { editableRows.has(api.id) && (
                            <StyledDiv sx={styles.tableActionBtnContainer}>
                                <TextField
                                    id='standard-basic'
                                    label='Provider Name'
                                    variant='standard'
                                    size='small'
                                    defaultValue={api.provider}
                                    sx={styles.textfield}
                                    onChange={(e) => { setProvider(e.target.value); }}
                                />
                                <IconButton color='primary' onClick={() => handleSubmitClick(api.id, provider)}>
                                    <SaveIcon aria-label='edit-api-settings' />
                                </IconButton>
                                <IconButton onClick={() => handleCancelClick(api.id)}>
                                    <CancelIcon aria-label='edit-api-settings' />
                                </IconButton>
                            </StyledDiv>
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
