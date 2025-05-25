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
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Autocomplete,
    RadioGroup,
    FormControlLabel,
    Radio,
    List,
    ListItemButton,
    ListItemIcon,
    Link,
    ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import Configurations from 'Config';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import GovernanceAPI from 'AppData/GovernanceAPI';
import API from 'AppData/api';
import Utils from 'AppData/Utils';
import CONSTS from 'AppData/Constants';
import Tooltip from '@mui/material/Tooltip';
import ActionConfigDialog from './ActionConfigDialog';
import RulesetSelector from './RulesetSelector';

// Keep these styled components
const StyledSpan = styled('span')(({ theme }) => ({
    color: theme.palette.error.dark,
}));

const StyledHr = styled('hr')({
    border: 'solid 1px #efefef',
});

const PREFIX = 'AddEditPolicy';

const classes = {
    root: `${PREFIX}-root`,
    formContainer: `${PREFIX}-formContainer`,
    helperText: `${PREFIX}-helperText`,
    divider: `${PREFIX}-divider`,
    actionButton: `${PREFIX}-actionButton`,
    actionButtonContainer: `${PREFIX}-actionButtonContainer`,
    tableContainer: `${PREFIX}-tableContainer`,
    actionChip: `${PREFIX}-actionChip`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    requiredStar: `${PREFIX}-requiredStar`,
};

const StyledContentBase = styled(ContentBase)(({ theme }) => ({
    [`& .${classes.formContainer}`]: {
        margin: theme.spacing(1),
    },
    [`& .${classes.helperText}`]: {
        position: 'absolute',
        marginTop: '10px',
    },
    [`& .${classes.divider}`]: {
        margin: `${theme.spacing(2)} 0`,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    [`& .${classes.actionButton}`]: {
        margin: theme.spacing(1),
    },
    [`& .${classes.actionButtonContainer}`]: {
        margin: theme.spacing(1),
    },
    [`& .${classes.tableContainer}`]: {
        margin: theme.spacing(1),
    },
    [`& .${classes.actionChip}`]: {
        borderColor: (props) => (props.isBlock ? theme.palette.error.main : theme.palette.primary.main),
        backgroundColor: (props) => (props.isBlock ? theme.palette.error.lighter : theme.palette.primary.lighter),
    },
    [`& .${classes.buttonWrapper}`]: {
        margin: theme.spacing(2),
    },
    [`& .${classes.requiredStar}`]: {
        color: theme.palette.error.dark,
    },
}));

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
                // Store only the IDs in the state
                nextState.labels = value.map((label) => (typeof label === 'object' ? label.id : label));
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
    const [availableLabels, setAvailableLabels] = useState([]);
    const [labelMode, setLabelMode] = useState('all');
    const [originalLabels, setOriginalLabels] = useState([]);
    const intl = useIntl();
    const { match: { params: { id: policyId } }, history } = props;

    const initialState = {
        name: '',
        description: '',
        labels: ['GLOBAL'],
        actions: [
            {
                state: 'API_UPDATE',
                ruleSeverity: 'ERROR',
                type: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            },
            {
                state: 'API_UPDATE',
                ruleSeverity: 'WARN',
                type: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            },
            {
                state: 'API_UPDATE',
                ruleSeverity: 'INFO',
                type: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            },
        ],
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

    const [dialogConfig, setDialogConfig] = useState({
        open: false,
        editAction: null,
    });

    // Add this function inside the component before useEffect
    const fetchAllRulesets = async (restApi, offset = 0, accumulator = []) => {
        try {
            const params = {
                limit: 25,
                offset,
            };

            const response = await restApi.getRulesets(params);
            const { list, pagination } = response.body;
            const newAccumulator = [...accumulator, ...list];

            // If we haven't fetched all items yet, fetch the next page
            if (pagination.total > offset + params.limit) {
                return fetchAllRulesets(restApi, offset + params.limit, newAccumulator);
            }

            return newAccumulator;
        } catch (error) {
            console.error('Error fetching rulesets:', error);
            throw error;
        }
    };

    useEffect(() => {
        const restApi = new GovernanceAPI();
        const adminApi = new API();

        // Fetch available labels
        adminApi.labelsListGet()
            .then((response) => {
                const labelList = response.body.list || [];
                setAvailableLabels(labelList); // Store full label objects
            })
            .catch((error) => {
                console.error('Error loading labels:', error);
                Alert.error(intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.error.loading.labels',
                    defaultMessage: 'Error loading labels',
                }));
            });

        // Fetch all rulesets recursively
        fetchAllRulesets(restApi)
            .then((allRulesets) => {
                setAvailableRulesets(allRulesets);

                if (policyId) {
                    return restApi.getGovernancePolicyById(policyId)
                        .then((policyResponse) => {
                            const { body } = policyResponse;
                            const fullRulesets = body.rulesets.map((rulesetId) => {
                                const foundRuleset = allRulesets.find((r) => r.id === rulesetId);
                                return foundRuleset || { id: rulesetId, name: 'Unknown Ruleset' };
                            });
                            setSelectedRulesets(fullRulesets);

                            // Set the correct label mode based on the policy data
                            if (body.labels.length === 1 && body.labels[0] === 'GLOBAL') {
                                setLabelMode('all');
                            } else if (body.labels.length === 0) {
                                setLabelMode('none');
                            } else {
                                setLabelMode('specific');
                                setOriginalLabels(body.labels);
                            }

                            return dispatch({
                                field: 'all',
                                value: {
                                    ...body,
                                    rulesets: body.rulesets.map(
                                        (ruleset) => (typeof ruleset === 'object' ? ruleset.id : ruleset),
                                    ),
                                },
                            });
                        });
                }
                return null;
            })
            .catch((error) => {
                console.error('Error loading rulesets:', error);
                Alert.error(intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.error.loading.rulesets',
                    defaultMessage: 'Error loading rulesets',
                }));
            });
    }, [policyId]);

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    const handleLabelModeChange = (e) => {
        setLabelMode(e.target.value);
        switch (e.target.value) {
            case 'all':
                dispatch({ field: 'labels', value: ['GLOBAL'] });
                break;
            case 'none':
                dispatch({ field: 'labels', value: [] });
                break;
            case 'specific':
                // Restore original labels when switching to specific mode
                if (originalLabels?.length > 0) {
                    dispatch({ field: 'labels', value: originalLabels });
                } else {
                    dispatch({ field: 'labels', value: [] });
                }
                break;
            default:
                break;
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
                        id: 'Governance.Policies.AddEdit.form.name.required',
                        defaultMessage: 'Policy name is required',
                    });
                } else if (fieldValue.length < 1) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.name.too.short',
                        defaultMessage: 'Policy name cannot be empty',
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
                            + ' hyphens, underscores, and spaces',
                    });
                }
                break;
            case 'description':
                if (fieldValue && fieldValue.length > 1024) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.description.too.long',
                        defaultMessage: 'Description cannot exceed 1024 characters',
                    });
                }
                break;
            case 'rulesets':
                if (!fieldValue || !Array.isArray(fieldValue) || fieldValue.length === 0) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.rulesets.required',
                        defaultMessage: 'At least one ruleset is required',
                    });
                } else if (new Set(fieldValue).size !== fieldValue.length) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.rulesets.duplicate',
                        defaultMessage: 'Duplicate rulesets are not allowed',
                    });
                }
                break;
            case 'actions': {
                if (!fieldValue || !Array.isArray(fieldValue) || fieldValue.length === 0) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.actions.invalid',
                        defaultMessage: 'Actions must be properly configured',
                    });
                    break;
                }

                // Check for invalid BLOCK actions
                const invalidBlockActions = fieldValue.filter((action) => (
                    action.state === 'API_CREATE' || action.state === 'API_UPDATE')
                    && action.type === CONSTS.GOVERNANCE_ACTIONS.BLOCK);
                if (invalidBlockActions.length > 0) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.actions.invalid.block',
                        defaultMessage: 'BLOCK action is not allowed for API_CREATE and API_UPDATE states',
                    });
                    break;
                }
                break;
            }
            case 'labels':
                if (labelMode === 'specific' && (!fieldValue || fieldValue.length === 0)) {
                    error = intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.form.labels.required',
                        defaultMessage: 'At least one label is required when applying to specific APIs',
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
            || hasErrors('labels', labels, validatingActive)
            || hasErrors('rulesets', rulesets, validatingActive)
            || hasErrors('actions', actions, validatingActive)) {
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
        const body = {
            ...state,
            governableStates: [...new Set(actions.map((action) => action.state))],
        };

        // Do the API call
        const restApi = new GovernanceAPI();
        let promiseAPICall = null;

        if (policyId) {
            promiseAPICall = restApi
                .updateGovernancePolicyById(body).then(() => {
                    return intl.formatMessage({
                        id: 'Governance.Policies.AddEdit.edit.success',
                        defaultMessage: 'Policy Updated Successfully',
                    });
                });
        } else {
            promiseAPICall = restApi
                .createGovernancePolicy(body).then(() => {
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

    const groupActionsByState = (actionsList) => {
        // Create a map of all actions by state
        const actionMap = actionsList.reduce((acc, action) => {
            const existingState = acc.get(action.state);
            if (!existingState) {
                acc.set(action.state, {
                    state: action.state,
                    error: action.ruleSeverity === 'ERROR' ? action.type : null,
                    warn: action.ruleSeverity === 'WARN' ? action.type : null,
                    info: action.ruleSeverity === 'INFO' ? action.type : null,
                });
            } else {
                if (action.ruleSeverity === 'ERROR') existingState.error = action.type;
                if (action.ruleSeverity === 'WARN') existingState.warn = action.type;
                if (action.ruleSeverity === 'INFO') existingState.info = action.type;
            }
            return acc;
        }, new Map());

        // Return array in GOVERNABLE_STATES order
        return CONSTS.GOVERNABLE_STATES
            .filter((st) => actionMap.has(st.value))
            .map((st) => actionMap.get(st.value));
    };

    const handleActionSave = (actionConfig) => {
        const newActions = [];
        const { governedState, actions: configuredActions } = actionConfig;

        Object.entries(configuredActions).forEach(([severity, action]) => {
            if (action) {
                newActions.push({
                    state: governedState,
                    ruleSeverity: severity.toUpperCase(),
                    type: action,
                });
            }
        });

        // Remove existing actions for this governedState
        const filteredActions = actions.filter((action) => action.state !== governedState);
        dispatch({ field: 'actions', value: [...filteredActions, ...newActions] });
        setDialogConfig({
            open: false,
            editAction: null,
        });
    };

    const handleAddAction = () => {
        setDialogConfig({
            open: true,
            editAction: null,
        });
    };

    const handleEditAction = (groupedAction) => {
        const actionConfig = {
            governedState: groupedAction.state,
            actions: {
                error: groupedAction.error || CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                warn: groupedAction.warn || CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                info: groupedAction.info || CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            },
        };
        setDialogConfig({
            open: true,
            editAction: actionConfig,
        });
    };

    const handleCloseDialog = () => {
        setDialogConfig({
            open: false,
            editAction: null,
        });
    };

    const handleRulesetSelect = (ruleset) => {
        dispatch({
            field: 'rulesets',
            value: [...rulesets, ruleset.id],
        });
        setSelectedRulesets([...selectedRulesets, ruleset]);
    };

    const handleRulesetDeselect = (ruleset) => {
        dispatch({
            field: 'rulesets',
            value: rulesets.filter((id) => id !== ruleset.id),
        });
        setSelectedRulesets(selectedRulesets.filter((r) => r.id !== ruleset.id));
    };

    // Get existing states from current actions
    const getExistingStates = () => {
        return [...new Set(actions.map((action) => action.state))];
    };

    // Add this helper function to check if all states are configured
    const areAllStatesConfigured = () => {
        const existingStates = getExistingStates();
        return CONSTS.GOVERNABLE_STATES.every((st) => existingStates.includes(st.value));
    };

    return (
        <StyledContentBase
            pageStyle='half'
            title={
                policyId ? `${intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.title.edit',
                    defaultMessage: 'Governance Policy - Edit ',
                })} ${name}` : intl.formatMessage({
                    id: 'Governance.Policies.AddEdit.title.new',
                    defaultMessage: 'Governance Policy - Create new',
                })
            }
            help={(
                <HelpBase>
                    <List component='nav'>
                        <ListItemButton>
                            <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <Link
                                target='_blank'
                                href={Configurations.app.docUrl
                                    + 'governance/api-governance-admin-capabilities/#create-and-manage-policies'}
                                underline='hover'
                            >
                                <ListItemText primary={(
                                    <FormattedMessage
                                        id='Governance.Policies.AddEdit.help.link'
                                        defaultMessage='Create and Manage Policies'
                                    />
                                )}
                                />
                            </Link>
                        </ListItemButton>
                    </List>
                </HelpBase>
            )}
        >
            <Box component='div' m={2} sx={{ mb: 15 }}>
                <Grid container spacing={2}>
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
                                rows={3}
                                error={hasErrors('description', description, validating)}
                                helperText={hasErrors('description', description, validating) || intl.formatMessage({
                                    id: 'Governance.Policies.AddEdit.form.description.help',
                                    defaultMessage: 'Description of the governance policy.',
                                })}
                                variant='outlined'
                                InputProps={{
                                    style: { padding: 0 },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={12} lg={3} style={{ paddingLeft: '24px' }}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.labels.title'
                                defaultMessage='Attachment'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.labels.description'
                                defaultMessage={'Choose whether to attach this policy to'
                                    + ' all APIs or only to APIs with specific labels'}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <Box mb={2}>
                                <RadioGroup
                                    row
                                    value={labelMode}
                                    onChange={handleLabelModeChange}
                                >
                                    <FormControlLabel
                                        value='all'
                                        control={<Radio />}
                                        label={intl.formatMessage({
                                            id: 'Governance.Policies.AddEdit.labels.applyAll',
                                            defaultMessage: 'All APIs',
                                        })}
                                    />
                                    <FormControlLabel
                                        value='specific'
                                        control={<Radio />}
                                        label={intl.formatMessage({
                                            id: 'Governance.Policies.AddEdit.labels.applySpecific',
                                            defaultMessage: 'APIs with specific labels',
                                        })}
                                    />
                                    <FormControlLabel
                                        value='none'
                                        control={<Radio />}
                                        label={intl.formatMessage({
                                            id: 'Governance.Policies.AddEdit.labels.applyNone',
                                            defaultMessage: 'None',
                                        })}
                                    />
                                </RadioGroup>
                            </Box>
                            {labelMode === 'specific' && (
                                <Autocomplete
                                    multiple
                                    id='governance-policy-labels'
                                    options={availableLabels}
                                    value={
                                        labels.map((labelId) => {
                                            const labelObject = availableLabels.find((l) => l.id === labelId);
                                            return labelObject || labelId;
                                        })
                                    }
                                    onChange={(event, newValue) => {
                                        dispatch({ field: 'labels', value: newValue });
                                    }}
                                    getOptionLabel={(option) => {
                                        return typeof option === 'object' ? option.name : option;
                                    }}
                                    isOptionEqualTo={(option, value) => {
                                        return typeof option === 'object' && typeof value === 'object'
                                            ? option.id === value.id
                                            : option === value;
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant='outlined'
                                            label={intl.formatMessage({
                                                id: 'Governance.Policies.AddEdit.labels.input',
                                                defaultMessage: 'Select Labels',
                                            })}
                                            error={hasErrors('labels', labels, validating)}
                                            helperText={hasErrors('labels', labels, validating) || intl.formatMessage({
                                                id: 'Governance.Policies.AddEdit.labels.helper',
                                                defaultMessage:
                                                    'Select one or more labels to determine'
                                                    + ' which APIs this policy attaches to',
                                            })}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) => value.map((option, index) => (
                                        <Chip
                                            label={typeof option === 'object' ? option.name : option}
                                            {...getTagProps({ index })}
                                        />
                                    ))}
                                    sx={{
                                        '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                                            padding: '4px 4px 4px 5px',
                                        },
                                    }}
                                />
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={12} lg={3} style={{ paddingLeft: '24px' }}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.enforcement.title'
                                defaultMessage='Enforcement'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.enforcement.description'
                                defaultMessage={'Choose when the policy should be applied and the action '
                                    + 'that should be taken based on the severity of the rule violation.'}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <Tooltip title={
                                areAllStatesConfigured()
                                    ? intl.formatMessage({
                                        id: 'Governance.Policies.AddEdit.enforcement.add.disabled.tooltip',
                                        defaultMessage: 'All available states have been configured',
                                    })
                                    : ''
                            }
                            >
                                <span>
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAction}
                                        disabled={areAllStatesConfigured()}
                                    >
                                        {intl.formatMessage({
                                            id: 'Governance.Policies.AddEdit.enforcement.add.button',
                                            defaultMessage: 'Add Enforcement Criteria',
                                        })}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                        <Box component='div' m={1}>
                            {actions && actions.length > 0 && (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    {intl.formatMessage({
                                                        id: 'Governance.Policies.AddEdit.action.table.state',
                                                        defaultMessage: 'State',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {intl.formatMessage({
                                                        id: 'Governance.Policies.AddEdit.action.table.onError',
                                                        defaultMessage: 'On Error',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {intl.formatMessage({
                                                        id: 'Governance.Policies.AddEdit.action.table.onWarn',
                                                        defaultMessage: 'On Warn',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {intl.formatMessage({
                                                        id: 'Governance.Policies.AddEdit.action.table.onInfo',
                                                        defaultMessage: 'On Info',
                                                    })}
                                                </TableCell>
                                                <TableCell align='right'>
                                                    {intl.formatMessage({
                                                        id: 'Governance.Policies.AddEdit.action.table.actions',
                                                        defaultMessage: 'Edit / Delete',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {groupActionsByState(actions).map((groupedAction) => (
                                                <TableRow key={groupedAction.state}>
                                                    <TableCell>
                                                        {Utils.mapGovernableStateToLabel(groupedAction.state)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={groupedAction.error || 'Not Set'}
                                                            color={
                                                                groupedAction.error === CONSTS.GOVERNANCE_ACTIONS.BLOCK
                                                                    ? 'error' : 'primary'
                                                            }
                                                            variant='outlined'
                                                            size='small'
                                                            className={classes.actionChip}
                                                            isBlock={
                                                                groupedAction.error === CONSTS.GOVERNANCE_ACTIONS.BLOCK
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={groupedAction.warn || 'Not Set'}
                                                            color={
                                                                groupedAction.warn === CONSTS.GOVERNANCE_ACTIONS.BLOCK
                                                                    ? 'error' : 'primary'
                                                            }
                                                            variant='outlined'
                                                            size='small'
                                                            className={classes.actionChip}
                                                            isBlock={
                                                                groupedAction.warn === CONSTS.GOVERNANCE_ACTIONS.BLOCK
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={groupedAction.info || 'Not Set'}
                                                            color={
                                                                groupedAction.info === CONSTS.GOVERNANCE_ACTIONS.BLOCK
                                                                    ? 'error' : 'primary'
                                                            }
                                                            variant='outlined'
                                                            size='small'
                                                            className={classes.actionChip}
                                                            isBlock={
                                                                groupedAction.info === CONSTS.GOVERNANCE_ACTIONS.BLOCK
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Tooltip title={
                                                            (groupedAction.state === 'API_UPDATE'
                                                                || groupedAction.state === 'API_CREATE')
                                                                ? intl.formatMessage({
                                                                    id: 'Governance.Policies.AddEdit.action.edit.'
                                                                        + 'disabled.tooltip',
                                                                    defaultMessage: 'Cannot edit as only notify action'
                                                                        + ' is allowed',
                                                                })
                                                                : ''
                                                        }
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    onClick={() => handleEditAction(groupedAction)}
                                                                    size='small'
                                                                    sx={{ mr: 1 }}
                                                                    disabled={groupedAction.state === 'API_UPDATE'
                                                                        || groupedAction.state === 'API_CREATE'}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <IconButton
                                                            onClick={() => {
                                                                const newActions = actions.filter(
                                                                    (a) => a.state !== groupedAction.state,
                                                                );
                                                                dispatch({ field: 'actions', value: newActions });
                                                            }}
                                                            size='small'
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
                        {validating && hasErrors('actions', actions, true) && (
                            <Box sx={{ color: 'error.main', pl: 2, pb: 1 }}>
                                {hasErrors('actions', actions, true)}
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={12} lg={12} style={{ paddingLeft: '24px' }}>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.rulesets.title'
                                defaultMessage='Rulesets'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.rulesets.description'
                                defaultMessage={'Search and select rulesets to include in the policy. '
                                    + 'Selected rulesets will appear above the search bar.'}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Box component='div' m={1}>
                            <RulesetSelector
                                availableRulesets={availableRulesets}
                                selectedRulesets={selectedRulesets}
                                onRulesetSelect={handleRulesetSelect}
                                onRulesetDeselect={handleRulesetDeselect}
                            />
                        </Box>
                        {validating && hasErrors('rulesets', rulesets, true) && (
                            <Box sx={{ color: 'error.main', pl: 2, pb: 1 }}>
                                {hasErrors('rulesets', rulesets, true)}
                            </Box>
                        )}
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
                                        {policyId ? (
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
                existingStates={getExistingStates()}
            />
        </StyledContentBase>
    );
}

AddEditPolicy.propTypes = {
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
};

export default AddEditPolicy;
