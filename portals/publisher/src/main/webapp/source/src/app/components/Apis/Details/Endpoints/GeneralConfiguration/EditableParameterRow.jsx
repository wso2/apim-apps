/* eslint-disable react/jsx-no-bind */
/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';

const PREFIX = 'EditableParameterRow';

const classes = {
    link: `${PREFIX}-link`
};

const StyledTableRow = styled(TableRow)(() => ({
    [`& .${classes.link}`]: {
        cursor: 'pointer',
    }
}));

/**
 * EditableParameterRow for OAuth Endpoint Security
 * @param {*} props properties
 * @returns {*} EditableParameterRow component
 */
function EditableParameterRow(props) {
    const {
        oldName, oldValue,
        handleUpdateList, handleDelete,
        intl, isRestricted, api,
    } = props;
    const [newName, setName] = useState(oldName);
    const [newValue, setValue] = useState(oldValue);
    const [editMode, setEditMode] = useState(false);

    /**
     * Set edit mode
     */
    const updateEditMode = () => {
        setEditMode(!editMode);
    };

    /**
     * Update name field
     * @param {*} event value entered for name field
     */
    const handleKeyChange = (event) => {
        const { value } = event.target;
        setName(value);
    };

    /**
     * Update value field
     * @param {*} event value entered for the value field
     */
    const handleValueChange = (event) => {
        const { value } = event.target;
        setValue(value);
    };

    /**
     * Validate if the field is empty
     * @param {*} itemValue value of the field
     * @returns {*} boolean value
     */
    const validateEmpty = (itemValue) => {
        if (itemValue === null) {
            return false;
        } else if (itemValue === '') {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Save the updated values in the custom parameters object
     */
    const saveRow = () => {
        const oldRow = { oldName, oldValue };
        const newRow = { newName: newName || oldName, newValue: newValue || oldValue };
        handleUpdateList(oldRow, newRow);
        setEditMode(false);
    };

    /**
     * Delete name-value pair in the custom parameters object
     */
    const deleteRow = () => {
        handleDelete(oldName);
    };

    /**
     * Keyboard event listener to save the name-value pair on Enter
     * @param {*} e event containing the key that was pressed
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveRow();
        }
    };

    // Styles definition


    return (
        <StyledTableRow>
            {editMode ? (
                <TableCell>
                    <TextField
                        fullWidth
                        required
                        id='outlined-required'
                        label={intl.formatMessage({
                            id: 'Apis.Details.Endpoints.GeneralConfiguration.EditableParameterRow.Parameter.Name',
                            defaultMessage: 'Parameter Name',
                        })}
                        margin='normal'
                        variant='outlined'
                        className={classes.addProperty}
                        value={newName}
                        onChange={handleKeyChange}
                        onKeyDown={handleKeyDown}
                        error={validateEmpty(newName)}
                    />
                </TableCell>
            ) : (
                <TableCell>{oldName}</TableCell>
            )}
            {editMode ? (
                <TableCell>
                    <TextField
                        fullWidth
                        required
                        id='outlined-required'
                        label={intl.formatMessage({
                            id: 'Apis.Details.Endpoints.GeneralConfiguration.EditableParameterRow.Parameter.Value',
                            defaultMessage: 'Parameter Value',
                        })}
                        margin='normal'
                        variant='outlined'
                        className={classes.addProperty}
                        value={newValue}
                        onChange={handleValueChange}
                        onKeyDown={handleKeyDown}
                        error={validateEmpty(newValue)}
                    />
                </TableCell>
            ) : (
                <TableCell>{oldValue}</TableCell>
            )}
            <TableCell align='right'>
                {editMode ? (
                    <>
                        <IconButton
                            className={classes.link}
                            aria-label='save'
                            onClick={saveRow}
                            onKeyDown={() => {}}
                            disabled={validateEmpty(newName) || validateEmpty(newValue)}
                            color='inherit'
                            size='large'>
                            <SaveIcon className={classes.buttonIcon} />
                        </IconButton>
                    </>
                ) : (
                    <IconButton
                        className={classes.link}
                        aria-label='edit'
                        onClick={updateEditMode}
                        onKeyDown={() => {}}
                        color='inherit'
                        disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                        size='large'>
                        <EditIcon className={classes.buttonIcon} />
                    </IconButton>
                )}
                <IconButton
                    className={classes.link}
                    aria-label='remove'
                    onClick={deleteRow}
                    onKeyDown={() => {}}
                    color='inherit'
                    disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                    size='large'>
                    <DeleteForeverIcon className={classes.buttonIcon} />
                </IconButton>
            </TableCell>
        </StyledTableRow>
    );
}

EditableParameterRow.propTypes = {
    oldName: PropTypes.string.isRequired,
    oldValue: PropTypes.string.isRequired,
    classes: PropTypes.shape({}).isRequired,
    handleUpdateList: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
};

export default injectIntl(EditableParameterRow);
