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

import React, { FC, useReducer, useState } from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { FormattedMessage,  } from 'react-intl';
import { Link } from 'react-router-dom';
import { isRestricted } from 'AppData/AuthManager';
import type { CreatePolicySpec } from '../Types';
import type { NewPolicyState, PolicyAttribute } from './Types';
import PolicyAttributes from './PolicyAttributes';
import uuidv4 from '../Utils';
import GeneralDetails from './GeneralDetails';
import SourceDetails from './SourceDetails';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
}));

export const ACTIONS = {
    UPDATE_POLICY_METADATA: 'updatePolicyMetadata',
    UPDATE_APPLICALBLE_FLOWS: 'updateApplicableFlows',
    UPDATE_SUPPORTED_GATEWAYS: 'updateSupportedGateways',
    ADD_POLICY_ATTRIBUTE: 'addPolicyAttribute',
    UPDATE_POLICY_ATTRIBUTE: 'updatePolicyAttribute',
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
        case ACTIONS.UPDATE_APPLICALBLE_FLOWS: {
            return {
                ...state,
                applicableFlows: action.checked
                    ? [...state.applicableFlows, action.name]
                    : state.applicableFlows.filter((flow: string) => flow !== action.name)
            }
        }
        case ACTIONS.UPDATE_SUPPORTED_GATEWAYS: {
            return {
                ...state,
                supportedGateways: action.checked
                    ? [...state.supportedGateways, action.name]
                    : state.supportedGateways.filter((gateway: string) => gateway !== action.name)
            }
        }
        case ACTIONS.ADD_POLICY_ATTRIBUTE: {
            return {
                ...state,
                policyAttributes: [...state.policyAttributes, {
                    id: uuidv4(),
                    name: null,
                    displayName: null,
                    description: '',
                    required: false,
                    type: 'String',
                    validationRegex: null,
                    defaultValue: null,
                    allowedValues: [],
                }]
            };
        }
        case ACTIONS.UPDATE_POLICY_ATTRIBUTE: {
            return {
                ...state,
                policyAttributes: state.policyAttributes.map(
                    (policyAttribute: PolicyAttribute) =>
                        policyAttribute.id === action.id ? {
                            ...policyAttribute,
                            [action.field]: action.value
                        } : policyAttribute
                )
            }
        }
        case ACTIONS.DELETE_POLICY_ATTRIBUTE: {
            return {
                ...state,
                policyAttributes: state.policyAttributes.filter(
                    (policyAttribute: PolicyAttribute) =>
                        policyAttribute.id !== action.id,
                )
            };
        }
        default:
            return state;
    }
}

interface PolicyCreateFormProps {
    onSave: (policySpecification: CreatePolicySpec) => void;
    policyDefinitionFile: any[];
    setPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
}    

/**
 * Renders the policy create form.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyCreateForm: FC<PolicyCreateFormProps> = ({
    onSave, policyDefinitionFile, setPolicyDefinitionFile
}) => {
    const classes = useStyles();
    const url = '/policies';
    const [saving, setSaving] = useState(false);
    const initialState: NewPolicyState = {
        displayName: null,
        description: '',
        applicableFlows: ['request', 'response', 'fault'],
        supportedGateways: ['Synapse'],
        policyAttributes: [],
    };
    const [state, dispatch] = useReducer(policyReducer, initialState);

    /**
     * Function to check whether there are any errors in the form.
     * If there are errors, we disable the save button.
     * @returns {boolean} Boolean indicating whether or not the form has any errors.
     */
    const isSaveDisabled = () => {
        let hasErrors = false;

        // Display name current state validation
        if (state.displayName === '') hasErrors = true;

        // Applicable flows current state validation
        if (state.applicableFlows.length === 0) hasErrors = true;

        // Supported gateways current state validation
        if (state.supportedGateways.length === 0) hasErrors = true;

        // Policy file upload current state validation
        if (policyDefinitionFile.length === 0) hasErrors = true;

        // Policy attributes current state validation
        state.policyAttributes.forEach((attribute: PolicyAttribute) => {
            if (attribute.name === '' || attribute.displayName === '') hasErrors = true;
        });

        return hasErrors;
    }

    const onPolicySave = () => {
        setSaving(true);
        if (state.displayName) {
            const policySpec = {
                category: 'Mediation',
                name: state.displayName.replace(/[^A-Za-z0-9]+/ig, ''),
                displayName: state.displayName,
                description: state.description,
                applicableFlows: state.applicableFlows,
                supportedGateways: state.supportedGateways,
                policyAttributes: state.policyAttributes,
                multipleAllowed: true,
                supportedApiTypes: ['HTTP'],
            };
            onSave(policySpec);
        }
        setSaving(false);
    }

    return (
        <>
            <Paper elevation={0} className={classes.root}>
                {/* General details of policy */}
                <GeneralDetails
                    displayName={state.displayName}
                    description={state.description}
                    applicableFlows={state.applicableFlows}
                    dispatch={dispatch}
                />
                <Divider light />
                {/* Gateway specific details of policy */}
                <SourceDetails
                    supportedGateways={state.supportedGateways}
                    policyDefinitionFile={policyDefinitionFile}
                    setPolicyDefinitionFile={setPolicyDefinitionFile}
                    dispatch={dispatch}
                />
                <Divider light />
                {/* Attributes of policy */}
                <PolicyAttributes
                    policyAttributes={state.policyAttributes}
                    dispatch={dispatch}
                />
                <Box>
                    <Button 
                        variant='contained'
                        color='primary'
                        onClick={onPolicySave}
                        disabled={ isRestricted(['apim:shared_scope_manage']) || isSaveDisabled() }
                    >
                        {saving ? (<CircularProgress size={16} />) : (
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyPolicyCreateForm.policy.save'
                                defaultMessage='Save'
                            />     
                        )}               
                    </Button>
                    <Button
                        component={Link}
                        to={url}
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyPolicyCreateForm.policy.cancel'
                            defaultMessage='Cancel'
                        />    
                    </Button>
                </Box>
            </Paper>
        </>
    );
}

export default PolicyCreateForm;
