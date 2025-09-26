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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CancelIcon from '@mui/icons-material/Cancel';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';

const PREFIX = 'EditableParameterRow';

const classes = {
    link: `${PREFIX}-link`,
    actionCell: `${PREFIX}-actionCell`,
};

const StyledTableRow = styled(TableRow)(() => ({
    [`& .${classes.link}`]: {
        cursor: 'pointer',
    },
    [`& .${classes.actionCell}`]: {
        paddingRight: 0,
        paddingLeft: 0,
    },
}));

/**
 * EditableParameterRow for OAuth Endpoint Security
 * @param {*} props properties
 * @returns {*} EditableParameterRow component
 */
function EditableParameterRow(props) {
    const {
        oldName, oldValue, isSecret,
        handleUpdateList, handleDelete,
        intl, isRestricted, api,
    } = props;
    const [newName, setName] = useState(oldName);
    const [newValue, setValue] = useState(oldValue);
    const [editMode, setEditMode] = useState(false);
    const [showValue, setShowValue] = useState(false);

    const getCreateOrPublishScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isCreateOrPublishRestricted = () => isRestricted(getCreateOrPublishScopes(), api);

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
     * Update value field considering masking for secret parameters
     * @param {*} event value entered for the value field
     */
    const handleValueChange = (event) => {
        let { value } = event.target;

        // Special handling for secret parameters
        if (isSecret) {
            if (value === '******') {
                // User hasn't changed the masked value, keep empty to preserve original
                value = '';
            } else if (value.includes('******')) {
                // User is editing part of the masked value, remove mask
                value = value.replace('******', '');
            }

            if (value === '') {
                // If the value is empty, hide the stars
                setShowValue(false);
            }
        }

        setValue(value);
    };

    /**
     * Get display value considering masking for secret parameters
     */
    const getDisplayValue = () => {
        if (isSecret) {
            return oldValue ? oldValue.replace(/./g, '•') : '••••••';
        }
        return oldValue;
    };

    /**
     * Validate if the field is empty
     * @param {*} itemValue value of the field
     * @returns {*} boolean value
     */
    const validateEmpty = (itemValue) => {
        if (itemValue === null) {
            return false;
        } else if (itemValue === '' && !isSecret) {
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
        let updatedValue = newValue;
        
        // For secret parameters, preserve empty value if masked value wasn't changed
        if (isSecret && updatedValue === '') {
            updatedValue = oldValue; // Keep original value if user didn't change masked value
        }

        const newRow = {
            newName: newName || oldName,
            newValue: updatedValue || oldValue,
        };
        handleUpdateList(oldRow, newRow, isSecret);
        setEditMode(false);
    };

    /**
     * Delete name-value pair in the custom parameters object
     */
    const deleteRow = () => {
        handleDelete(oldName);
    };

    /**
     * Cancel editing and reset values
     */
    const cancelEdit = () => {
        setName(oldName);
        setValue(oldValue);
        setEditMode(false);
        setShowValue(false);
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
                        value={newValue === '' && isSecret ? '******' : newValue}
                        onChange={handleValueChange}
                        onKeyDown={handleKeyDown}
                        error={validateEmpty(newValue)}
                        type={isSecret && !showValue ? 'password' : 'text'}
                        InputProps={isSecret ? {
                            endAdornment: (
                                <IconButton
                                    onClick={() => {
                                        // Only allow toggling if value is not masked
                                        if (newValue !== '' && newValue !== '******') {
                                            setShowValue(!showValue);
                                        }
                                    }}
                                    edge='end'
                                    size='small'
                                >
                                    {showValue ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                            ),
                        } : undefined}
                    />
                </TableCell>
            ) : (
                <TableCell>{getDisplayValue()}</TableCell>
            )}
            <TableCell align='right' className={classes.actionCell}>
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
                        <IconButton
                            className={classes.link}
                            aria-label='cancel'
                            onClick={cancelEdit}
                            onKeyDown={() => { }}
                            color='inherit'
                        >
                            <CancelIcon className={classes.buttonIcon} />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <IconButton
                            className={classes.link}
                            aria-label='edit'
                            onClick={updateEditMode}
                            onKeyDown={() => {}}
                            color='inherit'
                            disabled={isCreateOrPublishRestricted()}
                            size='large'>
                            <EditIcon className={classes.buttonIcon} />
                        </IconButton>
                        <IconButton
                            className={classes.link}
                            aria-label='remove'
                            onClick={deleteRow}
                            onKeyDown={() => {}}
                            color='inherit'
                            disabled={isCreateOrPublishRestricted()}
                            size='large'>
                            <DeleteForeverIcon className={classes.buttonIcon} />
                        </IconButton>
                    </>
                )}
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
    isSecret: PropTypes.bool,
};

EditableParameterRow.defaultProps = {
    isSecret: false,
};

export default injectIntl(EditableParameterRow);
