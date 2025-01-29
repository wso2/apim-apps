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
    Chip,
    FormControl,
    IconButton,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { MuiChipsInput } from 'mui-chips-input';
import Autocomplete from '@mui/material/Autocomplete';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import ActionConfigDialog from './ActionConfigDialog';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import GovernanceAPI from 'AppData/GovernanceAPI';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

const StyledHr = styled('hr')({ border: 'solid 1px #efefef' });

function reducer(state, { field, value }) {
    const nextState = cloneDeep(state);
    switch (field) {
        case 'all': // We set initial state with this.
            return value;
        case 'name':
        case 'description':
            nextState[field] = value;
            return nextState;
        case 'labels':
            if (Array.isArray(value)) {
                nextState.labels = value;
            }
            return nextState;
        case 'rulesets':
            if (Array.isArray(value)) {
                nextState.rulesets = value;
            }
            return nextState;
        case 'actions':
            if (Array.isArray(value)) {
                nextState.actions = value;
            } else if (typeof value === 'object') {
                const { actionType, actionData, indexToRemove } = value;

                if (actionType === 'ADD') {
                    nextState.actions.push(actionData);
                } else if (actionType === 'REMOVE') {
                    nextState.actions = nextState.actions.filter((_, index) => index !== indexToRemove);
                } else if (actionType === 'UPDATE') {
                    nextState.actions[indexToRemove] = actionData;
                }
            }
            return nextState;
        default:
            return nextState;
    }
}

function AddEditPolicy(props) {
    const [validating, setValidating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [availableRulesets, setAvailableRulesets] = useState([]);
    const [selectedRulesets, setSelectedRulesets] = useState([]); // Store full ruleset objects for UI
    const intl = useIntl();
    const { match: { params: { id } }, history } = props;
    const editMode = id !== undefined;

    const initialState = {
        name: '',
        description: '',
        labels: [],
        actions: [],
        rulesets: [], // Store only IDs
    };
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        name,
        description,
        labels,
        actions,
        rulesets,
    } = state;

    const [autocompleteInput, setAutocompleteInput] = useState('');
    const [dialogConfig, setDialogConfig] = useState({
        open: false,
        editAction: null
    });

    useEffect(() => {
        const restApi = new GovernanceAPI();
        if (id) {
            restApi
                .getPolicy(id)
                .then((result) => {
                    console.log(result);
                    const { body } = result;
                    // Store the full ruleset objects for display
                    setSelectedRulesets(body.rulesets.map(rulesetId => ({
                        id: rulesetId,
                        name: 'Loading...' // Will be updated when rulesets load
                    })));
                    return body;
                })
                .then((data) => {
                    dispatch({
                        field: 'all', value: {
                            ...data,
                            rulesets: data.rulesets.map(ruleset =>
                                typeof ruleset === 'object' ? ruleset.id : ruleset
                            )
                        }
                    });
                })
                .catch((error) => {
                    throw error;
                });
        }

        // Load available rulesets as full objects
        restApi
            .getRulesetsList()
            .then((result) => {
                const rulesetList = result.body.list.map(ruleset => ({
                    id: ruleset.id,
                    name: ruleset.name
                }));
                setAvailableRulesets(rulesetList);
                // Update selected rulesets with names if in edit mode
                if (id) {
                    setSelectedRulesets(prev => prev.map(selected => {
                        const foundRuleset = rulesetList.find(r => r.id === selected.id);
                        return foundRuleset || selected;
                    }));
                }
            })
            .catch((error) => {
                console.error('Error loading rulesets:', error);
                Alert.error(intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.error.loading.rulesets',
                    defaultMessage: 'Error loading rulesets',
                }));
            });
    }, [id]);

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
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
                } else if (fieldValue.length > 30) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.name.too.long',
                        defaultMessage: 'Policy name cannot exceed 30 characters',
                    });
                }
                break;
            case 'description':
                if (!fieldValue) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.description.required',
                        defaultMessage: 'Description is required',
                    });
                } else if (fieldValue.length > 256) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.description.too.long',
                        defaultMessage: 'Description cannot exceed 512 characters',
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
            || hasErrors('description', description, validatingActive)) {
            return true;
        } else {
            return false;
        }
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
        const body = {
            ...state,
            governableStates: [...new Set(actions.map(action => action.state))],
        };

        // Do the API call
        const restApi = new GovernanceAPI();
        let promiseAPICall = null;

        if (id) {
            promiseAPICall = restApi
                .updatePolicy(body).then(() => {
                    return intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.edit.success',
                        defaultMessage: 'Policy Updated Successfully',
                    });
                });
        } else {
            promiseAPICall = restApi
                .addPolicy(body).then(() => {
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

    const groupActionsByState = (actions) => {
        return actions.reduce((acc, action) => {
            const existingStateIndex = acc.findIndex(item => item.state === action.state);
            if (existingStateIndex === -1) {
                acc.push({
                    state: action.state,
                    Error: action.ruleSeverity === 'ERROR' ? action.type : null,
                    Warn: action.ruleSeverity === 'WARN' ? action.type : null,
                    Info: action.ruleSeverity === 'INFO' ? action.type : null
                });
            } else {
                if (action.ruleSeverity === 'ERROR') acc[existingStateIndex].Error = action.type;
                if (action.ruleSeverity === 'WARN') acc[existingStateIndex].Warn = action.type;
                if (action.ruleSeverity === 'INFO') acc[existingStateIndex].Info = action.type;
            }
            return acc;
        }, []);
    };

    const handleActionSave = (actionConfig) => {
        const newActions = [];
        const { governedState, actions: configActions } = actionConfig;

        Object.entries(configActions).forEach(([severity, action]) => {
            if (action) {
                newActions.push({
                    state: governedState,
                    ruleSeverity: severity.toUpperCase(),
                    type: action.toUpperCase()
                });
            }
        });

        // Remove existing actions for this governedState
        const filteredActions = actions.filter(action => action.state !== governedState);
        dispatch({ field: 'actions', value: [...filteredActions, ...newActions] });
        setDialogConfig({
            open: false,
            editAction: null
        });
    };

    const handleAddAction = () => {
        setDialogConfig({
            open: true,
            editAction: null
        });
    };

    const handleEditAction = (groupedAction) => {
        const actionConfig = {
            governedState: groupedAction.state,
            actions: {
                Error: groupedAction.Error?.toLowerCase() || 'notify',
                Warn: groupedAction.Warn?.toLowerCase() || 'notify',
                Info: groupedAction.Info?.toLowerCase() || 'notify'
            }
        };
        setDialogConfig({
            open: true,
            editAction: actionConfig
        });
    };

    const handleCloseDialog = () => {
        setDialogConfig({
            open: false,
            editAction: null
        });
    };

    return (
        <ContentBase
            pageStyle='half'
            title={
                id ? `${intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.title.edit',
                    defaultMessage: 'Governance Policy - Edit ',
                })} ${name}` : intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.title.new',
                    defaultMessage: 'Governance Policy - Create new',
                })}
            help={<div>Help Button</div>}
        >
            <Box component='div' m={2} sx={{ mb: 15 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={3}>
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
                                disabled={editMode}
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
                                helperText={hasErrors('name', name, validating) || intl.formatMessage({
                                    id: 'Governance.Policies.AddEdit.form.name.help',
                                    defaultMessage: 'Name of the governance policy.',
                                })}
                                variant='outlined'
                            />
                            <TextField
                                margin='dense'
                                name='description'
                                value={description}
                                onChange={onChange}
                                label={intl.formatMessage({
                                    id: 'Governance.Policies.AddEdit.form.description',
                                    defaultMessage: 'Description',
                                })}
                                fullWidth
                                multiline
                                helperText={intl.formatMessage({
                                    id: 'Governance.Policies.AddEdit.form.description.help',
                                    defaultMessage: 'Description of the governance policy.',
                                })}
                                variant='outlined'
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={12} lg={3}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id="Governance.Policies.AddEdit.labels.title"
                                defaultMessage="Applicable Labels"
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id="Governance.Policies.AddEdit.labels.description"
                                defaultMessage="Specify the API labels to associate the governance policy"
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <MuiChipsInput
                                variant='outlined'
                                fullWidth
                                value={labels}
                                onAddChip={(label) => {
                                    labels.push(label);
                                }}
                                onDeleteChip={(labelToDelete) => {
                                    const filteredLabels = labels.filter(
                                        (label) => label !== labelToDelete,
                                    );
                                    dispatch({ field: 'labels', value: filteredLabels });
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'Governance.Policies.AddEdit.labels.placeholder',
                                    defaultMessage: 'Type labels and press Enter',
                                })}
                                helperText={(
                                    <div style={{ position: 'absolute', marginTop: '10px' }}>
                                        {intl.formatMessage({
                                            id: 'Governance.Policies.AddEdit.labels.helper',
                                            defaultMessage: 'Type labels and press Enter to add them',
                                        })}
                                    </div>
                                )}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={12} lg={3}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id="Governance.Policies.AddEdit.enforcement.title"
                                defaultMessage="Enforcement Details"
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id="Governance.Policies.AddEdit.enforcement.description"
                                defaultMessage="Provide details of when the policy will be applied"
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddAction}
                            >
                                Add Action Configuration
                            </Button>
                        </Box>
                        <Box component='div' m={1}>
                            {actions && actions.length > 0 && (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>State</TableCell>
                                                <TableCell>On Error</TableCell>
                                                <TableCell>On Warn</TableCell>
                                                <TableCell>On Info</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {groupActionsByState(actions).map((groupedAction, index) => (
                                                <TableRow key={groupedAction.state}>
                                                    <TableCell>{groupedAction.state}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={groupedAction.Error || 'Not Set'}
                                                            color={groupedAction.Error === 'BLOCK' ? 'error' : 'primary'}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                borderColor: groupedAction.Error === 'BLOCK' ? 'error.main' : 'primary.main',
                                                                backgroundColor: groupedAction.Error === 'BLOCK' ? 'error.lighter' : 'primary.lighter',
                                                                opacity: groupedAction.Error ? 1 : 0.5
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={groupedAction.Warn || 'Not Set'}
                                                            color={groupedAction.Warn === 'BLOCK' ? 'error' : 'primary'}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                borderColor: groupedAction.Warn === 'BLOCK' ? 'error.main' : 'primary.main',
                                                                backgroundColor: groupedAction.Warn === 'BLOCK' ? 'error.lighter' : 'primary.lighter',
                                                                opacity: groupedAction.Warn ? 1 : 0.5
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={groupedAction.Info || 'Not Set'}
                                                            color={groupedAction.Info === 'BLOCK' ? 'error' : 'primary'}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                borderColor: groupedAction.Info === 'BLOCK' ? 'error.main' : 'primary.main',
                                                                backgroundColor: groupedAction.Info === 'BLOCK' ? 'error.lighter' : 'primary.lighter',
                                                                opacity: groupedAction.Info ? 1 : 0.5
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            onClick={() => handleEditAction(groupedAction)}
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => {
                                                                const newActions = actions.filter(a => a.state !== groupedAction.state);
                                                                dispatch({ field: 'actions', value: newActions });
                                                            }}
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={12} lg={3}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id="Governance.Policies.AddEdit.rulesets.title"
                                defaultMessage="Rulesets"
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id="Governance.Policies.AddEdit.rulesets.description"
                                defaultMessage="Search for a ruleset from the dropdown menu and select"
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    id="ruleset-select"
                                    options={availableRulesets}
                                    inputValue={autocompleteInput}
                                    getOptionLabel={(option) => option.name}
                                    onInputChange={(event, newInputValue, reason) => {
                                        setAutocompleteInput(newInputValue);
                                    }}
                                    onChange={(event, newValue) => {
                                        if (newValue && !rulesets.includes(newValue.id)) {
                                            dispatch({
                                                field: 'rulesets',
                                                value: [...rulesets, newValue.id]
                                            });
                                            setSelectedRulesets([...selectedRulesets, newValue]);
                                            setAutocompleteInput('');
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label={intl.formatMessage({
                                                id: 'Governance.Policies.AddEdit.rulesets.select',
                                                defaultMessage: 'Select Ruleset',
                                            })}
                                            required
                                        />
                                    )}
                                    value={null}
                                />
                            </FormControl>

                            {selectedRulesets.length > 0 && (
                                <Box mt={2}>
                                    {selectedRulesets.map((ruleset, index) => (
                                        <Card key={ruleset.id} variant="outlined" sx={{ mb: 1 }}>
                                            <CardContent sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                pt: 1,
                                                '&:last-child': { pb: 1 },
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2">
                                                        {ruleset.name}
                                                    </Typography>
                                                    <IconButton
                                                        href={`/governance/ruleset-catalog/${ruleset.id}`}
                                                        target="_blank"
                                                        size="small"
                                                        sx={{ ml: 0.5 }}
                                                    >
                                                        <LaunchIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <IconButton
                                                    onClick={() => {
                                                        const newRulesets = rulesets.filter(id => id !== ruleset.id);
                                                        const newSelectedRulesets = selectedRulesets.filter(r => r.id !== ruleset.id);
                                                        dispatch({ field: 'rulesets', value: newRulesets });
                                                        setSelectedRulesets(newSelectedRulesets);
                                                    }}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Box component='span' m={1}>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={formSave}
                            >
                                {saving ? (<CircularProgress size={16} />) : (
                                    <>
                                        {id ? (
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.form.update.btn'
                                                defaultMessage='Update'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.form.add.btn'
                                                defaultMessage='Create'
                                            />
                                        )}
                                    </>
                                )}

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

            <ActionConfigDialog
                open={dialogConfig.open}
                onClose={handleCloseDialog}
                onSave={handleActionSave}
                editAction={dialogConfig.editAction}
            />
        </ContentBase>);
}


AddEditPolicy.propTypes = {
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
};

export default AddEditPolicy;
