/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useReducer, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import API from 'AppData/api';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { FormattedMessage, useIntl } from 'react-intl';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Box from '@mui/material/Box';
import Alert from 'AppComponents/Shared/Alert';

const PREFIX = 'Organizations';

const classes = {
    tooltip: `${PREFIX}-tooltip`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.tooltip}`]: {
        position: 'absolute',
        right: theme.spacing(-4),
        top: theme.spacing(1),
    },
}));

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

/**
 * Reducer
 * @param {JSON} state State
 * @returns {Promise}.
 */
function reducer(state, { field, value }) {
    switch (field) {
        case 'referenceId':
        case 'displayName':
        case 'description':
            return { ...state, [field]: value };
        case 'editDetails':
            return value;
        default:
            return state;
    }
}

/**
 * Render a pop-up dialog to add/edit an Organization
 * @param {JSON} props .
 * @returns {JSX}.
 */
function AddEditOrganization(props) {
    const {
        updateList, icon, triggerButtonText, title, dataRow,
    } = props;
    const intl = useIntl();
    const [initialState, setInitialState] = useState({
        description: '',
    });
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        referenceId, displayName, description,
    } = state;

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    useEffect(() => {
        setInitialState({
            description: '',
        });
    }, []);

    const hasErrors = (fieldName, value) => {
        let error;
        switch (fieldName) {
            case 'referenceId':
                if (value === undefined) {
                    error = false;
                    break;
                }
                if (value === '') {
                    error = intl.formatMessage({
                        id: 'AdminPages.Organizations.AddEdit.form.error.referenceId.empty',
                        defaultMessage: 'Reference ID is Empty',
                    });
                } else if (/\s/.test(value)) {
                    error = intl.formatMessage({
                        id: 'AdminPages.Organizations.AddEdit.form.error.referenceId.has.spaces',
                        defaultMessage: 'Reference ID contains spaces',
                    });
                } else {
                    error = false;
                }
                break;
            case 'displayName':
                if (value === undefined) {
                    error = false;
                    break;
                }
                if (value === '') {
                    error = intl.formatMessage({
                        id: 'AdminPages.Organizations.AddEdit.form.error.name.empty',
                        defaultMessage: 'Name is Empty',
                    });
                } else {
                    error = false;
                }
                break;
            case 'description':
                if (value && value.length > 1024) {
                    error = intl.formatMessage({
                        id: 'AdminPages.Organization.AddEdit.form.error.description.too.long',
                        defaultMessage: 'Organization description is too long',
                    });
                }
                break;
            default:
                break;
        }
        return error;
    };
    const getAllFormErrors = () => {
        let errorText = '';
        let NameErrors;
        let DescriptionErrors;
        let ReferenceIdErrors;

        if (referenceId === undefined) {
            dispatch({ field: 'referenceId', value: '' });
            ReferenceIdErrors = hasErrors('referenceId', '');
        } else {
            ReferenceIdErrors = hasErrors('referenceId', referenceId);
        }
        if (ReferenceIdErrors) {
            errorText += ReferenceIdErrors + '\n';
        }

        if (displayName === undefined) {
            dispatch({ field: 'displayName', value: '' });
            NameErrors = hasErrors('displayName', '');
        } else {
            NameErrors = hasErrors('displayName', displayName);
        }
        if (NameErrors) {
            errorText += NameErrors + '\n';
        }

        if (description !== undefined) {
            DescriptionErrors = hasErrors('description', description);
        }
        if (DescriptionErrors) {
            errorText += DescriptionErrors + '\n';
        }

        return errorText;
    };

    const formSaveCallback = () => {
        const formErrors = getAllFormErrors();
        if (formErrors !== '') {
            Alert.error(formErrors);
            return false;
        }

        const promiseAPICall = dataRow
            ? new API().updateOrganization(
                referenceId,
                dataRow.organizationId,
                displayName,
                description,
            )
            : new API().createOrganization(referenceId, displayName, description);

        return promiseAPICall
            .then(() => {
                if (dataRow) {
                    return (
                        intl.formatMessage({
                            id: 'AdminPages.Organizations.AddEdit.form.edit.successful',
                            defaultMessage: 'Organizations edited successfully',
                        })
                    );
                } else {
                    return (
                        intl.formatMessage({
                            id: 'AdminPages.Organizations.AddEdit.form.add.successful',
                            defaultMessage: 'Organizations added successfully',
                        })
                    );
                }
            })
            .catch((error) => {
                const { response } = error;
                if (response.body) {
                    throw response.body.description;
                }
            })
            .finally(() => {
                updateList();
            });
    };
    const dialogOpenCallback = () => {
        if (dataRow) {
            const {
                externalOrganizationId: originalReferenceId,
                displayName: originalName,
                description: originalDescription,
            } = dataRow;
            dispatch({
                field: 'editDetails',
                value: {
                    referenceId: originalReferenceId,
                    displayName: originalName,
                    description: originalDescription,
                },
            });
        }
    };

    return (
        <FormDialogBase
            title={title}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.Organizations.AddEdit.form.save.btn',
                defaultMessage: 'Save',
            })}
            icon={icon}
            triggerButtonText={triggerButtonText}
            formSaveCallback={formSaveCallback}
            dialogOpenCallback={dialogOpenCallback}
        >
            <Box style={{ paddingRight: '20px' }}>
                <TextField
                    autoFocus
                    margin='dense'
                    name='displayName'
                    value={displayName}
                    onChange={onChange}
                    label={(
                        <span>
                            <FormattedMessage id='AdminPages.Organizations.AddEdit.form.name' defaultMessage='Name' />
                            <StyledSpan>*</StyledSpan>
                        </span>
                    )}
                    fullWidth
                    error={hasErrors('displayName', displayName)}
                    variant='outlined'
                />
                <StyledBox
                    style={{
                        position: 'relative',
                        marginTop: 10,
                        marginBottom: 10,
                        minWidth: 400,
                    }}
                >
                    <TextField
                        margin='dense'
                        name='referenceId'
                        value={referenceId}
                        onChange={onChange}
                        label={(
                            <span>
                                <FormattedMessage
                                    id='AdminPages.Organizations.AddEdit.form.id'
                                    defaultMessage='Reference ID'
                                />
                                <StyledSpan>*</StyledSpan>
                            </span>
                        )}
                        fullWidth
                        error={hasErrors('referenceId', referenceId)}
                        variant='outlined'
                    />
                    <Tooltip
                        title={(
                            <>
                                <p>
                                    <FormattedMessage
                                        id='Api.organization.dropdown.tooltip'
                                        defaultMessage='Organization ID assigned by the External Identity Provider.'
                                    />
                                </p>
                            </>
                        )}
                        aria-label='Organization'
                        interactive
                        className={classes.tooltip}
                    >
                        <HelpOutline />
                    </Tooltip>
                </StyledBox>
                <TextField
                    margin='dense'
                    name='description'
                    value={description}
                    onChange={onChange}
                    label={intl.formatMessage({
                        id: 'AdminPages.Organizations.AddEdit.form.description',
                        defaultMessage: 'Description',
                    })}
                    fullWidth
                    error={hasErrors('description', description)}
                    multiline
                    variant='outlined'
                />
            </Box>
        </FormDialogBase>
    );
}

AddEditOrganization.defaultProps = {
    icon: null,
    dataRow: null,
};

AddEditOrganization.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
    }),
    icon: PropTypes.element,
    triggerButtonText: PropTypes.oneOfType([
        PropTypes.element.isRequired,
        PropTypes.string.isRequired,
    ]).isRequired,
    title: PropTypes.shape({}).isRequired,
};

export default AddEditOrganization;
