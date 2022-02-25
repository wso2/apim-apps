/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { FC, useReducer } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage,  } from 'react-intl';
import { Link } from 'react-router-dom';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import { isRestricted } from 'AppData/AuthManager';
import { AddCircle } from '@material-ui/icons';
import type { CreatePolicySpec } from '../Types';
import type { NewPolicyState, PolicyAttribute } from './Types';
import UploadPolicyDropzone from './UploadPolicyDropzone';
import PolicyAttributes from './PolicyAttributes';
import uuidv4 from '../Utils';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
}));

export const ACTIONS = {
    UPDATE_POLICY_METADATA: 'updatePolicyMetadata',
    DISPLAY_NAME: 'displayName',
    DESCRIPTION: 'description',
    APPLICABLE_FLOWS: 'applicableFlows',
    SUPPORTED_GATEWAYS: 'supportedGateways',
    ADD_POLICY_ATTRIBUTE: 'addPolicyAttribute',
    SAVE_POLICY_ATTRIBUTE: 'savePolicyAttribute',
    DELETE_POLICY_ATTRIBUTE: 'deletePolicyAttribute'
}
/**
 * Reducer to manage policy creation related logic
 * @param {NewPolicyState} state State
 * @param {any} action Action
 * @returns {Promise} Promised state
 */
function policyReducer(state: NewPolicyState, action: any) {
    switch(action.type) {
        case ACTIONS.UPDATE_POLICY_METADATA: {
            return {
                ...state,
                [action.field]: action.value
            };
        }
        case ACTIONS.ADD_POLICY_ATTRIBUTE: {
            return {
                ...state,
                policyAttributes: [...state.policyAttributes, {
                    id: uuidv4(),
                    name: '',
                    displayName: '',
                    description: '',
                    required: false,
                    type: 'String',
                    validationRegex: '',
                    defaultValue: '',
                    allowedValues: [],
                }]
            };
        }
        case ACTIONS.DELETE_POLICY_ATTRIBUTE: {
            return {
                ...state,
                policyAttributes: state.policyAttributes.filter(
                    (policyAttribute: PolicyAttribute) =>
                        policyAttribute.id !== action.payload.id,
                )
            };
        }
        default:
            return state;
    }
}

interface CreateFormProps {
    onSave: () => void;
    policyDefinitionFile: any[];
    setPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    policySpec: CreatePolicySpec;
    setPolicySpec: React.Dispatch<React.SetStateAction<CreatePolicySpec | null>>;
}    

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const CreateForm: FC<CreateFormProps> = ({
    onSave, policyDefinitionFile, setPolicyDefinitionFile, policySpec, setPolicySpec
}) => {
    const classes = useStyles();
    const url = '/policies';
    // const [saving, setSaving] = useState(false);
    const initialState: NewPolicyState = {
        displayName: '',
        description: '',
        applicableFlows: ['request', 'response', 'fault'],
        supportedGateways: ['Synapse'],
        policyAttributes: [],
    };
    const [state, dispatch] = useReducer(policyReducer, initialState);

    // const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    //     setPolicySpec({ ...policySpec, [event.target.name]: event.target.value });
    // }

    const isSaveDisabled = () => {
        return false;
    }

    const onPolicySave = () => {
        console.log(state)
        setPolicySpec({
            // ...policySpec,
            category: policySpec.category,
            name: state.displayName.replace(/[^A-Za-z0-9]+/ig, ''),
            displayName: state.displayName,
            description: state.description,
            applicableFlows: state.applicableFlows,
            supportedGateways: state.supportedGateways,
            policyAttributes: state.policyAttributes,
            multipleAllowed: policySpec.multipleAllowed,
            supportedApiTypes: policySpec.supportedApiTypes
        });
        console.log(state.displayName.replace(/[^A-Za-z0-9]+/ig, ''))
        console.log(policySpec)
        // onSave();
    }

    const addNewPolicyAttribute = () => {
        dispatch({ type: ACTIONS.ADD_POLICY_ATTRIBUTE });
    }

    const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        console.log(event.target.value)
        dispatch({
            type: ACTIONS.UPDATE_POLICY_METADATA,
            field: event.target.name,
            value: event.target.value
        });
    }

    // Validates whether atleast one flow (i.e. request, response or fault) is selected
    // True if none of the flows are selected.
    const applicableFlowsError = policySpec.applicableFlows.length === 0;

    // Validates whether atleast one gateway type (i.e. synapse, or CC ) is selected
    // True if none of the available gateways are selected.
    const supportedGatewaysError = policySpec.supportedGateways.length === 0;

    return (
        <>
            <Paper elevation={0} className={classes.root}>
                <Box display='flex' flexDirection='row' mt={1}>
                    <Box width='40%'>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Policies.PolicyCreateForm.add.policy.general.details.title'
                                defaultMessage='General Details'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Policies.PolicyCreateForm.add.policy.general.details.description'
                                defaultMessage='Provide the name, description and applicable flows of the policy.'
                            />
                        </Typography>
                    </Box>
                    <Box width='60%'>
                        <Box component='div'>
                            <TextField
                                fullWidth
                                id='name'
                                name='displayName'
                                required
                                label={(
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.PolicyCreateForm.field.name'
                                            defaultMessage='Name'
                                        />
                                    </>
                                )}
                                // error={this.state.valid.name.invalid}
                                helperText={
                                    // this.state.valid.name.invalid ? (
                                    //     this.state.valid.name.error
                                    // ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyCreateForm.short.description.name'
                                        defaultMessage='Enter Policy Name ( E.g.: Add Header )'
                                    />
                                    // )
                                }
                                margin='dense'
                                variant='outlined'
                                value={state.displayName}
                                onChange={onInputChange}
                            />
                            <TextField
                                id='name'
                                name='description'
                                label={(
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.PolicyCreateForm.field.description'
                                            defaultMessage='Description'
                                        />
                                    </>
                                )}
                                // error={this.state.valid.name.invalid}
                                helperText={
                                    // this.state.valid.name.invalid ? (
                                    //     this.state.valid.name.error
                                    // ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyCreateForm.short.description.description'
                                        defaultMessage='Short description about the policy'
                                    />
                                    // )
                                }
                                fullWidth
                                margin='dense'
                                variant='outlined'
                                value={state.description}
                                onChange={onInputChange}
                            />
                            <Box display='flex' flexDirection='row' alignItems='center'>
                                <Typography color='inherit' variant='body1' component='div'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyCreateForm.field.applicable.flows'
                                        defaultMessage='Applicable Flows'
                                    />
                                    <sup className={classes.mandatoryStar}>*</sup>
                                </Typography>
                                <Box flex='1' display='flex' flexDirection='row-reverse' justifyContent='space-around'>
                                    <FormControl
                                        required
                                        component='fieldset'
                                        variant='standard'
                                        margin='normal'
                                        error={applicableFlowsError}
                                    >
                                        <FormGroup className={classes.formGroup}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox name='request' color='primary' />
                                                }
                                                label='Request'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox name='response' color='primary' />
                                                }
                                                label='Response'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox name='fault' color='primary' />
                                                }
                                                label='Fault'
                                            />
                                        </FormGroup>
                                        <FormHelperText>
                                            {applicableFlowsError ? 'Please select one or more flows' : ''}
                                        </FormHelperText>
                                    </FormControl>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Divider light />
                <Box display='flex' flexDirection='row' mt={1}>
                    <Box width='40%' pt={3} mb={2}>
                        <Box width='90%'>
                            <Typography color='inherit' variant='subtitle2' component='div'>
                                <FormattedMessage
                                    id='Policies.PolicyCreateForm.add.policy.gateway.specific.details.title'
                                    defaultMessage='Gateway Specific Details'
                                />
                            </Typography>
                            <Typography color='inherit' variant='caption' component='p'>
                                <FormattedMessage
                                    id='Policies.PolicyCreateForm.add.policy.gateway.specific.details.description'
                                    defaultMessage={'Define the Gateway (s) that will be supporting this policy. '
                                        + 'Based off of this selection, you can upload the relevant business '
                                        + 'logic inclusive policy file.'}
                                />
                            </Typography>
                        </Box>
                    </Box>
                    <Box width='60%'>
                        <Box display='flex' flexDirection='row' alignItems='center'>
                            <Typography color='inherit' variant='body1' component='div'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyCreateForm.field.supported.gateways'
                                    defaultMessage='Supported Gateways'
                                />
                                <sup className={classes.mandatoryStar}>*</sup>
                            </Typography>
                            <Box flex='1'  display='flex' flexDirection='row-reverse' justifyContent='space-around'>
                                <FormControl
                                    required
                                    component='fieldset'
                                    variant='standard'
                                    margin='normal'
                                    error={supportedGatewaysError}
                                >
                                    <FormGroup className={classes.formGroup}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox name='regularGateway' color='primary' />
                                            }
                                            label='Regular Gateway'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox disabled name='choreoConnect' color='primary' />
                                            }
                                            label='Choreo Connect'
                                        />
                                    </FormGroup>
                                    <FormHelperText>
                                        {supportedGatewaysError ? 'Please select one or more Gateways' : ''}
                                    </FormHelperText>
                                </FormControl>
                            </Box>
                        </Box>
                        {policySpec.supportedGateways.includes('Synapse') && (
                            <UploadPolicyDropzone
                                policyDefinitionFile={policyDefinitionFile}
                                setPolicyDefinitionFile={setPolicyDefinitionFile}
                            />
                        )}
                    </Box>
                </Box>
                <Divider light />
                <Box display='flex' flexDirection='row' mt={1} pt={3}>
                    <Box width='40%'>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Policies.PolicyCreateForm.add.policy.attributes.title'
                                defaultMessage='Policy Attributes'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Policies.PolicyCreateForm.add.policy.attributes.description'
                                defaultMessage='Define attributes of the policy.'
                            />
                        </Typography>
                    </Box>
                    <Box width='60%'>
                        <Box component='div'>
                            <Grid item xs={12}>
                                <Box flex='1'>
                                    <Button
                                        color='primary'
                                        variant='outlined'
                                        onClick={addNewPolicyAttribute}
                                    >
                                        <AddCircle className={classes.buttonIcon} />
                                        <FormattedMessage
                                            id='Policies.PolicyCreateForm.add.policy.attributes.add'
                                            defaultMessage='Add Policy Attribute'
                                        />
                                    </Button>
                                </Box>
                            </Grid>    
                        </Box>                           
                    </Box>
                </Box>
                <PolicyAttributes
                    policyAttributes={state.policyAttributes}
                    dispatch={dispatch}
                />
                <Box>
                    <Button 
                        variant='contained'
                        color='primary'
                        onClick={onPolicySave}
                        disabled={isRestricted(['apim:shared_scope_manage']) || isSaveDisabled()}
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyCreateForm.policy.save'
                            defaultMessage='Save'
                        />                    
                    </Button>
                    <Button
                        component={Link}
                        to={url}
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyCreateForm.policy.cancel'
                            defaultMessage='Cancel'
                        />    
                    </Button>
                </Box>
            </Paper>
        </>
    );
}

export default CreateForm;
