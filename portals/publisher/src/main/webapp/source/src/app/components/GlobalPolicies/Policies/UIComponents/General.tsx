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
    FormControlLabel,
    Checkbox,
    Select,
    InputLabel,
    FormControl,
    FormHelperText,
} from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import { PolicySpec, ApiPolicy, AttachedPolicy, Policy, PolicySpecAttribute } from '../Types';
import ApiOperationContext from "../ApiOperationContext";

const useStyles = makeStyles(theme => ({
    resetBtn: {
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
    },
    btn: {
        marginRight: '1em',
    },
    drawerInfo: {
        marginBottom: '1em',
    },
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
    formControl: {
        width: '80%',
    },
}));

interface GeneralProps {
    policyObj: AttachedPolicy | null;
    setDroppedPolicy?: React.Dispatch<React.SetStateAction<Policy | null>>;
    currentFlow: string;
    target: string;
    verb: string;
    apiPolicy: ApiPolicy;
    policySpec: PolicySpec;
    handleDrawerClose: () => void;
    isEditMode: boolean;
}

const General: FC<GeneralProps> = ({
    policyObj,
    setDroppedPolicy,
    currentFlow,
    target,
    verb,
    apiPolicy,
    policySpec,
    handleDrawerClose,
    isEditMode,
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
        if (specType.toLowerCase() === 'boolean') {
            setState({ ...state, [event.target.name]: event.target.checked });
        } else if (
            specType.toLowerCase() === 'string'
            || specType.toLowerCase() === 'integer'
            || specType.toLowerCase() === 'enum'
        ) {
            setState({ ...state, [event.target.name]: event.target.value });
        }
    }

    const getValueOfPolicyParam = (policyParamName: string) => {
        return apiPolicy.parameters[policyParamName];
    }

    /**
     * This function is triggered when the form is submitted for save
     * @param {React.FormEvent<HTMLFormElement>} event Form submit event
     */
    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        const updateCandidates: any = {};
        Object.keys(state).forEach((key) => {
            const value = state[key];
            const attributeSpec = policySpec.policyAttributes.find(
                (attribute: PolicySpecAttribute) => attribute.name === key,
            );
            if (value === null && getValueOfPolicyParam(key) && getValueOfPolicyParam(key) !== '') {
                updateCandidates[key] = getValueOfPolicyParam(key);
            } else if (value === null && attributeSpec?.defaultValue && attributeSpec?.defaultValue !==  null) {
                updateCandidates[key] = attributeSpec.defaultValue;
            } else {
                updateCandidates[key] = value;
            }
        });

        // Saving field changes to backend
        const apiPolicyToSave = {...apiPolicy};
        apiPolicyToSave.parameters = updateCandidates;

        updateApiOperations(apiPolicyToSave, target, verb, currentFlow);

        if (setDroppedPolicy) setDroppedPolicy(null);
        setSaving(false);
        handleDrawerClose();
    };

    /**
     * Function to get the error string, if there are any errors. Empty string to indicate the absence of errors.
     * @param {PolicySpecAttribute} specInCheck The policy attribute that needs to be checked for any errors.
     * @returns {string} String with the error message, where empty string indicates that there are no errors. 
     */
    const getError = (specInCheck: PolicySpecAttribute) => {
        let error = '';
        const value = state[specInCheck.name];
        if (value !== null) {
            if (specInCheck.required && value === '') {
                error = intl.formatMessage({
                    id: 'Apis.Details.Policies.AttachedPolicyForm.General.required.error',
                    defaultMessage: 'Required field is empty',
                });
            } else if (
                value !== '' &&
                specInCheck.validationRegex &&
                !(!specInCheck.validationRegex || specInCheck.validationRegex === '')
            ) {
                // To check if the regex is a valid regex
                try {
                    if (!new RegExp(specInCheck.validationRegex).test(value)) {
                        error = intl.formatMessage({
                            id: 'Apis.Details.Policies.AttachedPolicyForm.General.regex.error',
                            defaultMessage: 'Please enter a valid input',
                        });
                    }
                } catch(e) {
                    console.error(e);
                }
            }
        }
        return error;
    }

    const getValue = (spec: PolicySpecAttribute) => {
        const specName = spec.name;
        const previousVal = getValueOfPolicyParam(specName);
        if (state[specName] !== null) {
            return state[specName];
        } else if (previousVal !== null && previousVal !== undefined) {
            if (spec.type.toLowerCase() === 'integer') return parseInt(previousVal, 10);
            else if (spec.type.toLowerCase() === 'boolean') return (previousVal.toString() === 'true');
            else return previousVal;
        } else if (spec.defaultValue !== null && spec.defaultValue !== undefined) {
            if (spec.type.toLowerCase() === 'integer') return parseInt(spec.defaultValue, 10);
            else if (spec.type.toLowerCase() === 'boolean') return (spec.defaultValue.toString() === 'true');
            else return spec.defaultValue;
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

    /**
     * Function to check whether there are any errors in the form.
     * If there are errors, we disable the save button.
     * @returns {boolean} Boolean value indicating whether or not the form has any errors.
     */
    const formHasErrors = () => {
        let formHasAnError = false;
        policySpec.policyAttributes.forEach((spec) => {
            if(getError(spec) !== '') {
                formHasAnError = true
            }
        })
        return formHasAnError;
    }

    /**
     * Function to check if the form content is in state that needs to be saved.
     * @returns {boolean} Whether or not the save button should be disabled.
     */
    const isSaveDisabled = () => {
        if (!isEditMode) {
            let isDisabled = false;
            policySpec.policyAttributes.forEach((spec) => {
                if (spec.type !== 'Boolean') {
                    const currentState = state[spec.name];
                    const currentVal = getValue(spec);
                    if (spec.required && !(currentState || currentVal)) {
                        isDisabled = true;
                    }
                }
            });
            return isDisabled;
        } else {
            let isDisabled = true;
            policySpec.policyAttributes.forEach((spec) => {
                if (spec.type !== 'Boolean') {
                    const currentState = state[spec.name];
                    if (currentState !== null) {
                        isDisabled = false;
                    }
                } else {
                    const currentState = state[spec.name];
                    if (
                        currentState !== null &&
                        (currentState.toString() === 'true' ||
                            currentState.toString() === 'false')
                    ) {
                        isDisabled = false;
                    }
                }
            });
            return isDisabled;
        }
    };

    const hasAttributes = policySpec.policyAttributes.length !== 0;
    const resetDisabled = Object.values(state).filter((value: any) => 
        (value !== null && (value.toString() !== 'true' || value.toString() !== 'false')) || !!value
    ).length === 0;

    if (!policySpec) {
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
                                        id='Apis.Details.Policies.AttachedPolicyForm.General.reset'
                                        defaultMessage='Reset'
                                    />
                                </Button>
                            </div>
                        )}
                        <div>
                            <Typography variant='subtitle2' color='textPrimary'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.AttachedPolicyForm.General.description.title'
                                    defaultMessage='Description'
                                />
                            </Typography>
                            <Typography variant='caption' color='textPrimary'>
                                {policySpec.description ? (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.AttachedPolicyForm.General.description.value.provided'
                                        defaultMessage='{description}'
                                        values={{ description: policySpec.description }}
                                    />
                                ) : (
                                    <FormattedMessage
                                        id={
                                            'Apis.Details.Policies.AttachedPolicyForm.General.description.value.' +
                                            'not.provided'
                                        }
                                        defaultMessage='Oops! Looks like this policy does not have a description'
                                    />
                                )}                            
                            </Typography>
                        </div>
                    </Grid>
                    {policySpec.policyAttributes && policySpec.policyAttributes.map((spec: PolicySpecAttribute) => (
                        <Grid item xs={12}>

                            {/* When the attribute type is string or integer */}
                            {(spec.type.toLowerCase() === 'string'
                            || spec.type.toLowerCase() === 'integer') && (
                                <TextField
                                    id={spec.name}
                                    label={(
                                        <>
                                            {spec.displayName}
                                            {spec.required && (
                                                <sup className={classes.mandatoryStar}>*</sup>
                                            )}
                                        </>
                                    )}
                                    helperText={getError(spec) === '' ? spec.description : getError(spec)}
                                    error={getError(spec) !== ''}
                                    variant='outlined'
                                    name={spec.name}
                                    type={spec.type.toLowerCase() === 'integer' ? 'number' : 'text'}
                                    value={getValue(spec)}
                                    onChange={(e: any) => onInputChange(e, spec.type)}
                                    fullWidth
                                />
                            )}

                            {/* When the attribute type is enum */}
                            {spec.type.toLowerCase() === 'enum' && (
                                <>
                                    <FormControl
                                        variant='outlined'
                                        className={classes.formControl}
                                        error={getError(spec) !== ''}
                                    >
                                        <InputLabel htmlFor={'enum-label-' + spec.name}>
                                            <>
                                                {spec.displayName}
                                                {spec.required && (
                                                    <sup className={classes.mandatoryStar}>*</sup>
                                                )}
                                            </>
                                        </InputLabel>
                                        <Select 
                                            native
                                            value={getValue(spec)}
                                            onChange={(e) => onInputChange(e, spec.type)}
                                            label={(
                                                <>
                                                    {spec.displayName}
                                                    {spec.required && (
                                                        <sup className={classes.mandatoryStar}>*</sup>
                                                    )}
                                                </>
                                            )}
                                            inputProps={{
                                                name: spec.name,
                                                id: `enum-label-${spec.name}`
                                            }}
                                        >
                                            <option aria-label='None' value='' />
                                            {spec.allowedValues && spec.allowedValues.map((enumVal) => (
                                                <option value={enumVal}>{enumVal}</option>
                                            ))}                                           
                                        </Select>
                                        <FormHelperText>
                                            {getError(spec) === '' ? spec.description : getError(spec)}
                                        </FormHelperText>
                                    </FormControl>
                                </>
                            )}

                            {/* When attribute type is boolean */}
                            {spec.type.toLowerCase() === 'boolean' && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={getValue(spec)}
                                            onChange={(e) => onInputChange(e, spec.type)}
                                            name={spec.name}
                                            color='primary'
                                        />
                                    }
                                    label={(
                                        <>
                                            {spec.displayName}
                                            {spec.required && (
                                                <sup className={classes.mandatoryStar}>*</sup>
                                            )}
                                        </>
                                    )}
                                />
                            )}
                        </Grid>
                    ))}
                    <Grid item container justify='flex-end' xs={12}>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={handleDrawerClose}
                            className={classes.btn}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.AttachedPolicyForm.General.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            data-testid='policy-attached-details-save'
                            disabled={ isSaveDisabled() || formHasErrors() || saving}
                        >
                            {saving
                                ? <>
                                    <CircularProgress size='small' />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.AttachedPolicyForm.General.saving'
                                        defaultMessage='Saving'
                                    />
                                </>
                                : <>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.AttachedPolicyForm.General.save'
                                        defaultMessage='Save'
                                    />
                                </>
                            }
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};


export default General;
