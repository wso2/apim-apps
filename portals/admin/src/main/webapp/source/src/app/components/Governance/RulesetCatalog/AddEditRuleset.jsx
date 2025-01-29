/* eslint-disable */
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Editor from "@monaco-editor/react";
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GovernanceAPI from 'AppData/GovernanceAPI';

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
        overflow: 'hidden'
    }
}));

// TODO: should load from backend
const RULE_TYPES = [
    { value: 'API_DEFINITION', label: 'API Definition' },
    { value: 'API_METADATA', label: 'API Metadata' },
    { value: 'DOCUMENTATION', label: 'Documentation' },
];

// TODO: should load from backend
const ARTIFACT_TYPES = [
    { value: 'REST_API', label: 'REST API' },
    { value: 'ASYNC_API', label: 'Async API' },
];

function reducer(state, { field, value }) {
    const nextState = cloneDeep(state);
    switch (field) {
        case 'all':
            return value;
        case 'name':
        case 'description':
        case 'ruleType':
        case 'artifactType':
        case 'provider':
        case 'rulesetContent':
            nextState[field] = value;
            return nextState;
        default:
            return nextState;
    }
}

function AddEditRuleset(props) {
    const [validating, setValidating] = useState(false);
    const [saving, setSaving] = useState(false);
    const intl = useIntl();
    const { match: { params: { id } }, history } = props;
    const editMode = id !== undefined;

    const initialState = {
        name: '',
        description: '',
        ruleType: '',
        artifactType: '',
        provider: '',
        rulesetContent: ''
    };
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        name,
        description,
        ruleType,
        artifactType,
        provider,
        rulesetContent
    } = state;

    useEffect(() => {
        const restApi = new GovernanceAPI();
        if (id) {
            // Get ruleset metadata
            restApi
                .getRuleset(id)
                .then((result) => {
                    const { body } = result;
                    return body;
                })
                .then((data) => {
                    dispatch({ field: 'all', value: data });
                    // After getting metadata, fetch the ruleset content
                    return restApi.getRulesetContent(id);
                })
                .then((contentResult) => {
                    const { text } = contentResult;
                    dispatch({ field: 'rulesetContent', value: text });
                })
                .catch((error) => {
                    const { response } = error;
                    if (response && response.body) {
                        Alert.error(response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Governance.Rulesets.AddEdit.error.loading',
                            defaultMessage: 'Error loading ruleset',
                        }));
                    }
                });
        }
    }, [id]);

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    const handleEditorChange = (value) => {
        dispatch({ field: 'rulesetContent', value });
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dispatch({ field: 'rulesetContent', value: e.target.result });
            };
            reader.onerror = () => {
                Alert.error(intl.formatMessage({
                    id: 'Governance.Rulesets.AddEdit.file.read.error',
                    defaultMessage: 'Error reading file',
                }));
            };
            reader.readAsText(file);
        }
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
                        id: 'Governance.Rulesets.AddEdit.form.name.required',
                        defaultMessage: 'Ruleset name is required',
                    });
                }
                break;
            // Add other validation cases as needed
            default:
                break;
        }
        return error;
    };

    const formHasErrors = (validatingActive = false) => {
        return hasErrors('name', name, validatingActive);
    };

    const formSave = () => {
        setValidating(true);
        if (formHasErrors(true)) {
            Alert.error(intl.formatMessage({
                id: 'Governance.Rulesets.AddEdit.form.has.errors',
                defaultMessage: 'One or more fields contain errors.',
            }));
            return false;
        }

        setSaving(true);

        const file = new File([rulesetContent], `${name}.yaml`);
        const body = {
            ...state,
            rulesetContent: file
        }

        // Do the API call
        const restApi = new GovernanceAPI();
        let promiseAPICall = null;

        if (id) {
            promiseAPICall = restApi.updateRuleset(id, body)
                .then(() => {
                    return intl.formatMessage({
                        id: 'Governance.Rulesets.AddEdit.edit.success',
                        defaultMessage: 'Ruleset Updated Successfully',
                    });
                });
        } else {
            promiseAPICall = restApi.addRuleset(body)
                .then(() => {
                    return intl.formatMessage({
                        id: 'Governance.Rulesets.AddEdit.add.success',
                        defaultMessage: 'Ruleset Added Successfully',
                    });
                });
        }

        promiseAPICall.then((msg) => {
            Alert.success(`${name} ${msg}`);
            history.push('/governance/ruleset-catalog/');
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
            title={id ? `Edit Ruleset - ${name}` : 'Create New Ruleset'}
            help={<div>Help</div>}
        >
            <Box component='div' m={2} sx={{ mb: 15 }}>
                <Grid container spacing={2}>
                    {/* General Details Section */}
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Rulesets.AddEdit.general.details'
                                defaultMessage='General Details'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Rulesets.AddEdit.general.details.description'
                                defaultMessage='Provide name and description of the ruleset.'
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
                                            id='Governance.Rulesets.AddEdit.form.name'
                                            defaultMessage='Name'
                                        />
                                        <StyledSpan>*</StyledSpan>
                                    </span>
                                )}
                                fullWidth
                                error={hasErrors('name', name, validating)}
                                helperText={hasErrors('name', name, validating)}
                                variant='outlined'
                                disabled={editMode}
                            />
                            <TextField
                                margin='dense'
                                name='description'
                                value={description}
                                onChange={onChange}
                                label='Description'
                                fullWidth
                                multiline
                                rows={3}
                                variant='outlined'
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        margin='dense'
                                        name='ruleType'
                                        value={ruleType}
                                        onChange={onChange}
                                        label='Ruleset Type'
                                        fullWidth
                                        required
                                        variant='outlined'
                                    >
                                        {RULE_TYPES.map((option) => (
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
                                        label='Artifact Type'
                                        fullWidth
                                        required
                                        variant='outlined'
                                    >
                                        {ARTIFACT_TYPES.map((option) => (
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

                    {/* Ruleset Content Section */}
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Rulesets.AddEdit.content.title'
                                defaultMessage='Ruleset Content'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Rulesets.AddEdit.content.description'
                                defaultMessage='Define the ruleset content in YAML format'
                            />
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={12} lg={12}>
                        <Box component='div' m={1}>
                            <Paper variant="outlined">
                                <EditorToolbar>
                                    <Button
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        size="small"
                                    >
                                        Upload File
                                        <input
                                            type="file"
                                            hidden
                                            accept=".yaml,.yml"
                                            onChange={handleFileUpload}
                                        />
                                    </Button>
                                </EditorToolbar>
                                <EditorContainer>
                                    <Editor
                                        height="100%"
                                        defaultLanguage="yaml"
                                        value={rulesetContent}
                                        onChange={handleEditorChange}
                                        theme="light"
                                        options={{
                                            minimap: { enabled: false },
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                        }}
                                    />
                                </EditorContainer>
                            </Paper>
                        </Box>
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
                                {saving ? <CircularProgress size={16} /> : (
                                    id ? 'Update' : 'Create'
                                )}
                            </Button>
                        </Box>
                        <RouterLink to='/governance/ruleset-catalog'>
                            <Button variant='outlined'>
                                <FormattedMessage
                                    id='Governance.Rulesets.AddEdit.form.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </RouterLink>
                    </Grid>
                </Grid>
            </Box>
        </ContentBase>
    );
}

AddEditRuleset.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string,
        }),
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
};

export default AddEditRuleset;
