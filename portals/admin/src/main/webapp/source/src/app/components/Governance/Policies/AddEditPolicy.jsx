/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useReducer, useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    MenuItem,
    Paper,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Editor from '@monaco-editor/react';
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GovernanceAPI from 'AppData/GovernanceAPI';
import CONSTS from 'AppData/Constants';
import AuthManager from 'AppData/AuthManager';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));
const StyledHr = styled('hr')({ border: 'solid 1px #efefef' });

const EditorToolbar = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: theme.palette.grey[50],
}));

const EditorContainer = styled(Box)(({ theme }) => ({
    height: 400,
    '& .monaco-editor': {
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
        overflow: 'hidden',
    },
}));

function reducer(state, { field, value }) {
    const nextState = cloneDeep(state);
    switch (field) {
        case 'all':
            return value;
        case 'name':
        case 'description':
        case 'policyType':
        case 'artifactType':
        case 'provider':
        case 'policyContent':
        case 'documentationLink':
            nextState[field] = value;
            return nextState;
        default:
            return nextState;
    }
}

function AddEditPolicy(props) {
    const [validating, setValidating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const intl = useIntl();
    const { match: { params: { id } }, history } = props;

    const initialState = {
        name: '',
        description: '',
        policyType: '',
        artifactType: '',
        provider: '',
        policyContent: '',
        documentationLink: '',
    };
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        name,
        description,
        policyType,
        artifactType,
        policyContent,
        documentationLink,
    } = state;

    useEffect(() => {
        const restApi = new GovernanceAPI();
        if (id) {
            // Get policy metadata
            restApi
                .getPolicyById(id)
                .then((result) => {
                    const { body } = result;
                    return body;
                })
                .then((data) => {
                    dispatch({ field: 'all', value: data });
                    // After getting metadata, fetch the policy content
                    return restApi.getPolicyContent(id);
                })
                .then((contentResult) => {
                    const { text } = contentResult;
                    dispatch({ field: 'policyContent', value: text });
                })
                .catch((error) => {
                    const { response } = error;
                    if (response && response.body) {
                        Alert.error(response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Governance.Policies.AddEdit.error.loading',
                            defaultMessage: 'Error loading policy',
                        }));
                    }
                });
        }
    }, [id]);

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    const handleEditorChange = (value) => {
        dispatch({ field: 'policyContent', value });
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            dispatch({ field: 'policyContent', value: e.target.result });
        };
        reader.onerror = () => {
            Alert.error(intl.formatMessage({
                id: 'Governance.Policies.AddEdit.file.read.error',
                defaultMessage: 'Error reading file',
            }));
        };
        reader.readAsText(file);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (policyContent.trim()) {
                setPendingFile(file);
                setOpenConfirmDialog(true);
            } else {
                processFile(file);
            }
        }
        // Clone the event target before modifying
        const input = event.target;
        setTimeout(() => {
            input.value = '';
        }, 0);
    };

    const handleConfirmOverwrite = () => {
        if (pendingFile) {
            processFile(pendingFile);
            setPendingFile(null);
        }
        setOpenConfirmDialog(false);
    };

    const handleCancelOverwrite = () => {
        setPendingFile(null);
        setOpenConfirmDialog(false);
    };

    const hasErrors = (fieldName, fieldValue, validatingActive) => {
        let error = false;
        if (!validatingActive) {
            return false;
        }
        switch (fieldName) {
            case 'name':
                if (!fieldValue) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.name.required',
                        defaultMessage: 'Policy name is required',
                    });
                } else if (fieldValue.length > 255) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.name.too.long',
                        defaultMessage: 'Policy name cannot exceed 255 characters',
                    });
                } else if (!/^[a-zA-Z0-9-_ ]+$/.test(fieldValue)) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.name.invalid',
                        defaultMessage: 'Policy name can only contain alphanumeric characters,'
                            + ' spaces, hyphens and underscores.',
                    });
                }
                break;

            case 'description':
                if (fieldValue && fieldValue.length > 1000) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.description.too.long',
                        defaultMessage: 'Description cannot exceed 1000 characters',
                    });
                }
                break;

            case 'policyType':
                if (!fieldValue) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.policyType.required',
                        defaultMessage: 'Policy type is required',
                    });
                }
                break;

            case 'artifactType':
                if (!fieldValue) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.artifacttype.required',
                        defaultMessage: 'Artifact type is required',
                    });
                }
                break;

            case 'documentationLink':
                if (fieldValue) {
                    if (fieldValue.length > 500) {
                        error = intl.formatMessage({
                            id: 'Governance.Policies.AddEdit.form.doclink.too.long',
                            defaultMessage: 'Documentation link cannot exceed 500 characters',
                        });
                    } else if (!/^https?:\/\/.+/.test(fieldValue)) {
                        error = intl.formatMessage({
                            id: 'Governance.Policies.AddEdit.form.doclink.invalid',
                            defaultMessage: 'Documentation link must be a valid HTTP/HTTPS URL',
                        });
                    }
                }
                break;

            case 'policyContent':
                if (!fieldValue || fieldValue.trim().length === 0) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.policyContent.required',
                        defaultMessage: 'Policy content is required',
                    });
                }
                break;

            default:
                break;
        }
        return error;
    };

    const formHasErrors = (validatingActive = false) => {
        if (hasErrors('name', name, validatingActive)
            || hasErrors('description', description, validatingActive)
            || hasErrors('policyType', policyType, validatingActive)
            || hasErrors('artifactType', artifactType, validatingActive)
            || hasErrors('documentationLink', documentationLink, validatingActive)
            || hasErrors('policyContent', policyContent, validatingActive)) {
            return true;
        }
        return false;
    };

    const formSave = () => {
        setValidating(true);
        if (formHasErrors(true)) {
            Alert.error(intl.formatMessage({
                id: 'Governance.Policies.AddEdit.form.has.errors',
                defaultMessage: 'One or more fields contain errors.',
            }));
            return false;
        }

        setSaving(true);

        const file = new File([policyContent], `${name}.yaml`);
        const body = {
            ...state,
            provider: AuthManager.getUser().name,
            policyContent: file,
        };

        // Do the API call
        const restApi = new GovernanceAPI();
        let promiseAPICall = null;

        if (id) {
            promiseAPICall = restApi.updatePolicyById(id, body)
                .then(() => {
                    return intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.edit.success',
                        defaultMessage: 'Policy Updated Successfully',
                    });
                });
        } else {
            promiseAPICall = restApi.createPolicy(body)
                .then(() => {
                    return intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.add.success',
                        defaultMessage: 'Policy Added Successfully',
                    });
                });
        }

        promiseAPICall.then((msg) => {
            Alert.success(`${name} ${msg}`);
            history.push('/governance/policies/');
        }).catch((error) => {
            const { response, message } = error;
            if (response && response.body) {
                Alert.error(response.body.description);
            } else if (message) {
                Alert.error(message);
            }
            return null;
        }).finally(() => {
            setSaving(false);
        });
        return true;
    };

    return (
        <ContentBase
            pageStyle='half'
            title={
                id ? (
                    <FormattedMessage
                        id='Governance.Policies.AddEdit.title.edit'
                        defaultMessage='Edit Policy - {name}'
                        values={{ name }}
                    />
                ) : (
                    <FormattedMessage
                        id='Governance.Policies.AddEdit.title.new'
                        defaultMessage='Create New Policy'
                    />
                )
            }
            help={<div>TODO: Link Doc</div>}
        >
            <Box component='div' m={2} sx={{ mb: 15 }}>
                <Grid container spacing={2}>
                    {/* General Details Section */}
                    <Grid item xs={12} md={12} lg={3} style={{ paddingLeft: '24px', paddingTop: '24px' }}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.general.details'
                                defaultMessage='General Details'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.general.details.description'
                                defaultMessage='Provide name and description of the policy.'
                            />
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <TextField
                                autoFocus
                                margin='dense'
                                name='name'
                                value={name}
                                onChange={onChange}
                                label={(
                                    <span>
                                        <FormattedMessage
                                            id='Governance.Policies.AddEdit.form.name'
                                            defaultMessage='Name'
                                        />
                                        <StyledSpan>*</StyledSpan>
                                    </span>
                                )}
                                fullWidth
                                error={hasErrors('name', name, validating)}
                                helperText={hasErrors('name', name, validating)}
                                variant='outlined'
                            />
                            <TextField
                                margin='dense'
                                name='description'
                                value={description}
                                onChange={onChange}
                                label={(
                                    <FormattedMessage
                                        id='Governance.Policies.AddEdit.form.description'
                                        defaultMessage='Description'
                                    />
                                )}
                                fullWidth
                                error={hasErrors('description', description, validating)}
                                helperText={hasErrors('description', description, validating)}
                                multiline
                                rows={3}
                                variant='outlined'
                                InputProps={{
                                    style: { padding: 0 },
                                }}
                            />
                            <TextField
                                margin='dense'
                                name='documentationLink'
                                value={documentationLink}
                                onChange={onChange}
                                label={(
                                    <FormattedMessage
                                        id='Governance.Policies.AddEdit.form.documentation'
                                        defaultMessage='Documentation Link'
                                    />
                                )}
                                fullWidth
                                error={hasErrors('documentationLink', documentationLink, validating)}
                                helperText={hasErrors('documentationLink', documentationLink, validating)}
                                variant='outlined'
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        margin='dense'
                                        name='policyType'
                                        value={policyType}
                                        onChange={onChange}
                                        label={(
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.form.policy.type'
                                                defaultMessage='Policy Type'
                                            />
                                        )}
                                        fullWidth
                                        error={hasErrors('policyType', policyType, validating)}
                                        helperText={hasErrors('policyType', policyType, validating)}
                                        required
                                        variant='outlined'
                                    >
                                        {CONSTS.POLICY_TYPES.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        margin='dense'
                                        name='artifactType'
                                        value={artifactType}
                                        onChange={onChange}
                                        label={(
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.form.artifact.type'
                                                defaultMessage='Artifact Type'
                                            />
                                        )}
                                        fullWidth
                                        error={hasErrors('artifactType', artifactType, validating)}
                                        helperText={hasErrors('artifactType', artifactType, validating)}
                                        required
                                        variant='outlined'
                                    >
                                        {CONSTS.ARTIFACT_TYPES.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    {/* Policy Content Section */}
                    <Grid item xs={12} md={12} lg={5} style={{ paddingLeft: '24px' }}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.content.title'
                                defaultMessage='Policy Content'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.content.description'
                                defaultMessage='Define the Policy content in YAML or JSON format'
                            />
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={12} lg={12}>
                        <Box component='div' m={1}>
                            <Paper variant='outlined'>
                                <EditorToolbar>
                                    <Button
                                        component='label'
                                        variant='contained'
                                        startIcon={<CloudUploadIcon />}
                                        size='small'
                                    >
                                        <FormattedMessage
                                            id='Governance.Policies.AddEdit.button.upload'
                                            defaultMessage='Upload File'
                                        />
                                        <input
                                            type='file'
                                            hidden
                                            accept='.yaml,.yml,.json'
                                            onChange={handleFileUpload}
                                        />
                                    </Button>
                                </EditorToolbar>
                                <EditorContainer>
                                    <Editor
                                        height='100%'
                                        defaultLanguage='yaml'
                                        value={policyContent}
                                        onChange={handleEditorChange}
                                        theme='light'
                                        options={{
                                            minimap: { enabled: false },
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                        }}
                                    />
                                </EditorContainer>
                            </Paper>
                        </Box>
                        {validating && hasErrors('policyContent', policyContent, true) && (
                            <Box sx={{ color: 'error.main', pl: 2, pb: 1 }}>
                                {hasErrors('policyContent', policyContent, true)}
                            </Box>
                        )}
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Box component='span' m={1}>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={formSave}
                                disabled={saving}
                            >
                                {(() => {
                                    if (saving) {
                                        return <CircularProgress size={16} />;
                                    } else if (id) {
                                        return (
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.button.update'
                                                defaultMessage='Update'
                                            />
                                        );
                                    } else {
                                        return (
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.button.create'
                                                defaultMessage='Create'
                                            />
                                        );
                                    }
                                })()}
                            </Button>
                        </Box>
                        <RouterLink to='/governance/policies'>
                            <Button variant='outlined'>
                                <FormattedMessage
                                    id='Governance.Policies.AddEdit.form.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </RouterLink>
                    </Grid>
                </Grid>
            </Box>

            {/* Add the confirmation dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCancelOverwrite}
                aria-labelledby='overwrite-dialog-title'
                aria-describedby='overwrite-dialog-description'
            >
                <DialogTitle id='overwrite-dialog-title'>
                    <FormattedMessage
                        id='Governance.Policies.AddEdit.confirm.overwrite.title'
                        defaultMessage='Confirm Overwrite'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id='overwrite-dialog-description'>
                        <FormattedMessage
                            id='Governance.Policies.AddEdit.confirm.overwrite.message'
                            defaultMessage={'The editor contains existing content.'
                                + ' Do you want to overwrite it with the uploaded file?'}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelOverwrite} color='primary'>
                        <FormattedMessage
                            id='Governance.Policies.AddEdit.confirm.overwrite.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button onClick={handleConfirmOverwrite} color='primary' autoFocus>
                        <FormattedMessage
                            id='Governance.Policies.AddEdit.confirm.overwrite.ok'
                            defaultMessage='Overwrite'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </ContentBase>
    );
}

AddEditPolicy.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string,
        }),
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
};

export default AddEditPolicy;
