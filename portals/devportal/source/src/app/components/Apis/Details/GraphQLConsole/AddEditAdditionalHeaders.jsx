/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl, FormattedMessage } from 'react-intl';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormDialogBase from 'AppComponents/Apis/Details/GraphQLConsole/FormDialogBase';
import TextField from '@material-ui/core/TextField';
import CreateIcon from '@material-ui/icons/Create';

const useStyles = makeStyles((theme) => ({
    error: {
        color: theme.palette.error.dark,
    },
}));

/**
 * Render delete dialog box.
 * @param {JSON} props component props.
 * @returns {JSX} Loading animation.
 */
function AddEditAdditionalHeaders(props) {
    const intl = useIntl();
    const classes = useStyles();
    const { callBack, item } = props;
    let initName = '';
    let initValue = '';

    if (item != null) {
        initName = item.name;
        initValue = item.value;
    }

    const [name, setName] = useState(initName);
    const [value, setValue] = useState(initValue);
    const [validating, setValidating] = useState(false);
    const onChange = (e) => {
        const { target: { name: field, value: fieldValue } } = e;
        switch (field) {
            case 'name':
                setName(fieldValue);
                break;
            case 'value':
                setValue(fieldValue);
                break;
            default:
                break;
        }
    };

    const hasErrors = (fieldName, fieldValue, validatingActive) => {
        let error = false;
        if (!validatingActive) {
            return (false);
        }
        switch (fieldName) {
            case 'name':
                error = fieldValue === '' ? fieldName + ' is Empty' : false;
                break;
            case 'value':
                error = fieldValue === '' ? fieldName + ' is Empty' : false;
                break;
            default:
                break;
        }
        return error;
    };
    const formHasErrors = (validatingActive = false) => {
        if (hasErrors('name', name, validatingActive)
        || hasErrors('value', value, validatingActive)) {
            return true;
        } else {
            return false;
        }
    };
    const formSaveCallback = () => {
        setValidating(true);
        if (!formHasErrors(true)) {
            return ((setOpen) => {
                callBack({ name, value }, item);
                setOpen(false);
            });
        }
        return false;
    };
    return (
        <FormDialogBase
            title={item === undefined
                ? `${intl.formatMessage({
                    id: 'GraphQL.Devportal.Tryout.Additional.header.add.new',
                    defaultMessage: 'Add New ',
                })}`
                : `${intl.formatMessage({
                    id: 'GraphQL.Devportal.Tryout.Additional.header.edit',
                    defaultMessage: 'Edit ',
                })}`}
            saveButtonText={intl.formatMessage({
                id: 'GraphQL.Devportal.Tryout.Additional.header.dialog.btn.save',
                defaultMessage: 'Save',
            })}
            triggerButtonText={item ? null : intl.formatMessage({
                id: 'GraphQL.Devportal.Tryout.Additional.header.dialog.trigger.add',
                defaultMessage: 'Add',
            })}
            icon={item ? <CreateIcon /> : null}
            triggerButtonProps={{
                color: 'default',
                variant: 'contained',
                size: 'small',
            }}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                Description
            </DialogContentText>
            <TextField
                margin='dense'
                name='name'
                value={item === undefined ? null : name}
                onChange={onChange}
                label={(
                    <span>
                        Header
                        {' '}
                        <FormattedMessage
                            id='GraphQL.Devportal.Tryout.Additional.header.form.name'
                            defaultMessage='Name'
                        />
                        <span className={classes.error}>*</span>
                    </span>
                )}
                fullWidth
                multiline
                helperText={hasErrors('name', name, validating) || intl.formatMessage({
                    id: 'GraphQL.Devportal.Tryout.Additional.header.form.name.help',
                    defaultMessage: 'Provide Name',
                })}
                variant='outlined'
                error={hasErrors('name', name, validating)}
            />
            <TextField
                margin='dense'
                name='value'
                value={item === undefined ? null : value}
                onChange={onChange}
                label={(
                    <span>
                        Header
                        {' '}
                        <FormattedMessage
                            id='GraphQL.Devportal.Tryout.Additional.header.form.value'
                            defaultMessage='Value'
                        />

                        <span className={classes.error}>*</span>
                    </span>
                )}
                fullWidth
                multiline
                helperText={hasErrors('value', value, validating) || intl.formatMessage({
                    id: 'GraphQL.Devportal.Tryout.Additional.header.form.value.help',
                    defaultMessage: 'Provide Value',
                })}
                variant='outlined'
                error={hasErrors('value', value, validating)}
            />
        </FormDialogBase>
    );
}
AddEditAdditionalHeaders.propTypes = {
    row: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }).isRequired,
};
export default AddEditAdditionalHeaders;
