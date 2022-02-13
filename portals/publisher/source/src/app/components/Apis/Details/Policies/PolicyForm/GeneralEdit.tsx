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

import React, { useState, FC, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Button,
    TextField,
    CircularProgress,
    Box,
} from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import Policies from '../../LifeCycle/Policies';
import { PolicySpec, ApiPolicy, AttachedPolicy, Policy } from '../Types';
import ApiOperationContext from "../ApiOperationContext";

const useStyles = makeStyles(theme => ({
    resetBtn: {
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
    },
    avatar: {
        width: theme.spacing(14),
        height: theme.spacing(15),
    },
    btn: {
        marginRight: '1em',
    },
    drawerInfo: {
        marginBottom: '1em',
    },
}));
interface GeneralEditProps {
    policyObj: AttachedPolicy | null;
    currentFlow: string;
    target: string;
    verb: string;
    apiPolicy: ApiPolicy;
    policySpec: PolicySpec;
    handleDrawerClose: () => void;
}

const GeneralEdit: FC<GeneralEditProps> = ({
    policyObj, currentFlow, target, verb, apiPolicy, policySpec, handleDrawerClose
}) => {
    const intl = useIntl();
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const initState: any = {};
    const { updateApiOperations } = useContext<any>(ApiOperationContext);
    policySpec.policyAttributes.forEach(attr => { initState[attr.name] = null });
    const [state, setState] = useState(initState);

    if (!policyObj) {
        return <Progress />
    }

    const onInputChange = (event: any, specType: string) => {
        if (specType.toLocaleLowerCase() === 'boolean') {
            setState({ ...state, [event.target.name]: event.target.checked });
        } else if (specType.toLowerCase() === 'string' || specType.toLocaleLowerCase() === 'enum') {
            setState({ ...state, [event.target.name]: event.target.value });
        }
    }

    const getValueOfPolicyParam = (policyParamName: any) => {
        return apiPolicy.parameters[policyParamName];
    }

    const submitForm = async (event: any) => {
        event.preventDefault();
        setSaving(true);
        const updateCandidates: any = {};
        Object.keys(state).forEach((key) => {
            const value = state[key];
            if (value === null && getValueOfPolicyParam(key) && getValueOfPolicyParam(key) !== '') {
                updateCandidates[key] = getValueOfPolicyParam(key);
            } else {
                updateCandidates[key] = value;
            }
        });
        // Saving field changes to backend
        // eslint-disable-next-line no-alert
        const apiPolicyToSave = {...apiPolicy};
        apiPolicyToSave.parameters = updateCandidates;
        updateApiOperations(apiPolicyToSave, target, verb, currentFlow);
        setSaving(false);
        handleDrawerClose();
    };

    const getError = (specInCheck: any) => {
        let error = '';
        const value = state[specInCheck.name];
        if (specInCheck.required && value === '') {
            error = intl.formatMessage({
                id: 'Apis.Details.Policies.PolicyForm.GeneralEdit.required.error',
                defaultMessage: 'Required field is empty',
            });
        } else if (specInCheck.validationRegex && !(new RegExp(specInCheck.validationRegex)).test(value)) {
            error = intl.formatMessage({
                id: 'Apis.Details.Policies.PolicyForm.GeneralEdit.regex.error',
                defaultMessage: 'Please enter a valid input',
            });
        }
        return error;
    }

    const getValue = (specName: string) => {
        const previousVal = getValueOfPolicyParam(specName);
        if (state[specName] !== null) {
            return state[specName];
        } else if (previousVal) {
            return previousVal;
        } else {
            return '';
        }
    }

    /**
     * Reset the input fields
     */
    const resetAll = () => {
        setState(initState);
    }

    const formHasErrors = () => {
        let formHasAnError = false;
        policySpec.policyAttributes.forEach((spec) => {
            if(getError(spec) !== '') {
                formHasAnError = true
            }
        })
        return formHasAnError;
    }

    const resetDisabled = Object.keys(state).filter(k => !!state[k]).length === 0;
    const hasAttributes = policySpec.policyAttributes.length !== 0

    if (!policySpec || !Policies) {
        return <CircularProgress />
    }
    return (
        <Box p={2}>
            <form onSubmit={submitForm}>
                <Grid container spacing={2}>
                    <Grid item xs={12} className={classes.drawerInfo}>
                        {hasAttributes && (
                            <div className={classes.resetBtn}>
                                <Button variant='outlined' color='primary' disabled={resetDisabled} onClick={resetAll}>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyForm.GeneralEdit.reset'
                                        defaultMessage='Reset'
                                    />
                                </Button>
                            </div>
                        )}
                        <div>
                            <Typography variant='subtitle2' color='textPrimary'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralEdit.description.title'
                                    defaultMessage='Description'
                                />
                            </Typography>
                            <Typography variant='caption' color='textPrimary'>
                                {policySpec.description ? (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyForm.GeneralEdit.description.value.provided'
                                        defaultMessage='{description}'
                                        values={{ description: policySpec.description }}
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyForm.GeneralEdit.description.value.not.provided'
                                        defaultMessage='Oops! Looks like this policy does not have a description'
                                    />
                                )}                            
                            </Typography>
                        </div>
                    </Grid>
                    {policySpec.policyAttributes && policySpec.policyAttributes.map((spec) => (<Grid item xs={12}>
                        {(spec.type.toLowerCase() === 'string' || spec.type.toLocaleLowerCase() === 'enum') 
                            && (<Typography
                                variant='subtitle1'
                                color='textPrimary'
                            >
                                {spec.displayName}
                            </Typography>)}
                        {spec.type.toLocaleLowerCase() === 'string' && (
                            <TextField
                                placeholder={spec.displayName}
                                helperText={getError(spec) === '' ? spec.description : getError(spec)}
                                error={getError(spec) !== ''}
                                variant='outlined'
                                name={spec.name}
                                value={getValue(spec.name)}
                                onChange={(e) => onInputChange(e, spec.type)}
                                fullWidth
                            />
                        )}
                        {/* {spec.type === 'Boolean' && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={getValue(spec.name)}
                                        onChange={(e) => onInputChange(e, spec.type)}
                                        name={spec.name}
                                        color='primary'
                                    />
                                }
                                label={spec.displayName}
                            />
                        )}
                        {spec.type === 'Enum' && (
                            <Select
                                placeholder={spec.displayName}
                                helperText={spec.description}
                                variant='outlined'
                                name={spec.name}
                                value={getValue(spec.name)}
                                onChange={(e) => onInputChange(e, spec.type)}
                                fullWidth
                            >
                                {spec.values && spec.values.map((enumVal) => (<MenuItem 
                                    value={enumVal}>{enumVal}</MenuItem>))}
                            </Select>
                        )} */}
                    </Grid>))}
                    {/* {supportAllGateways() && (<Alert severity='info' variant='outlined'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.GeneralEdit.supported.in.all.gw'
                            defaultMessage='Supported in all Gateways'
                        /></Alert>)} */}
                    <Grid item container justify='flex-end' xs={12}>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={handleDrawerClose}
                            className={classes.btn}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.GeneralEdit.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            disabled={(resetDisabled && hasAttributes) || formHasErrors() || saving}
                        >
                            {saving ? <><CircularProgress size='small' /><FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.GeneralEdit.saving'
                                defaultMessage='Saving'
                            /></> : <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.GeneralEdit.save'
                                defaultMessage='Save'
                            />}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};


export default GeneralEdit;
