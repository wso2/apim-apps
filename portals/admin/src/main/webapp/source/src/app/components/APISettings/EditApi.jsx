/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useReducer, useEffect, useState } from 'react';
import API from 'AppData/api';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';

const useStyles = makeStyles((theme) => ({
    error: {
        color: theme.palette.error.dark,
    },
}));

/**
 * Reducer
 * @param {JSON} state State
 * @returns {Promise}.
 */
function reducer(state, { field, value }) {
    switch (field) {
        case 'name':
        case 'provider':
            return { ...state, [field]: value };
        case 'editDetails':
            return value;
        default:
            return state;
    }
}
/**
 * Render a pop-up dialog to change providership of an Api
 * @param {JSON} props props passed from parent
 * @returns {JSX}.
 */
function EditApi(props) {
    const classes = useStyles();
    const restApi = new API();
    const {
        updateList, dataRow, icon, triggerButtonText, title, apiList,
    } = props;
    const [initialState, setInitialState] = useState({
        name: '',
        provider: '',
    });

    const [state, dispatch] = useReducer(reducer, initialState);
    const { name, provider } = state;

    useEffect(() => {
        setInitialState({
            name: '',
            provider: '',
        });
    }, []);
    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    const formSaveCallback = () => {
        return restApi.updateApiProvider(dataRow.id, provider)
            .then(() => {
                return (
                    <FormattedMessage
                        id='AdminPages.ApiSettings.EditApi.form.edit.successful'
                        defaultMessage='Api provider changed successfully'
                    />
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
                updateList();
            });
    };
    const dialogOpenCallback = () => {
        if (dataRow) {
            const { name: originalName, provider: originalProvider } = dataRow;
            dispatch({ field: 'editDetails', value: { name: originalName, provider: originalProvider } });
        }
    };
    return (
        <FormDialogBase
            title={title}
            saveButtonText='Save'
            icon={icon}
            triggerButtonText={triggerButtonText}
            formSaveCallback={formSaveCallback}
            dialogOpenCallback={dialogOpenCallback}
        >
            <TextField
                margin='dense'
                name='name'
                value={name}
                label={(
                    <span>
                        <FormattedMessage
                            id='AdminPages.ApiSettings.EditApi.form.name'
                            defaultMessage='Api Name'
                        />
                        <span className={classes.error}>*</span>
                    </span>
                )}
                fullWidth
                variant='outlined'
                disabled
            />
            <TextField
                autoFocus
                margin='dense'
                name='provider'
                value={provider}
                onChange={onChange}
                label='Provider'
                fullWidth
                helperText={(
                    <FormattedMessage
                        id='AdminPages.ApiSettings.EditApi.form.helperText'
                        defaultMessage={'Enter a new Provider. '
                        + 'Make sure the new provider has logged into the Developer Portal at least once'}
                    />
                )}
                variant='outlined'
            />
        </FormDialogBase>
    );
}

EditApi.defaultProps = {
    icon: null,
};

EditApi.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
        provider: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    icon: PropTypes.element,
    triggerButtonText: PropTypes.shape({}).isRequired,
    title: PropTypes.shape({}).isRequired,
    apiList: PropTypes.shape([]).isRequired,
};

export default EditApi;
