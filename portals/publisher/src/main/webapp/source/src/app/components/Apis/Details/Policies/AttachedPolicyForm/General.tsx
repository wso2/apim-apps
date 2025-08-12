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

import React, { useState, FC, useContext, useEffect } from 'react';
import { styled } from '@mui/material/styles';
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
    InputAdornment,
    IconButton,
    MenuItem,
    Paper,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { PolicySpec, ApiPolicy, AttachedPolicy, Policy, PolicySpecAttribute } from '../Types';
import ApiOperationContext from "../ApiOperationContext";
import ModelRoundRobin from '../CustomPolicies/ModelRoundRobin';
import ModelWeightedRoundRobin from '../CustomPolicies/ModelWeightedRoundRobin';
import ModelFailover from '../CustomPolicies/ModelFailover';
import { Editor } from '@monaco-editor/react';

const PREFIX = 'General';

const classes = {
    resetBtn: `${PREFIX}-resetBtn`,
    btn: `${PREFIX}-btn`,
    drawerInfo: `${PREFIX}-drawerInfo`,
    mandatoryStar: `${PREFIX}-mandatoryStar`,
    formControl: `${PREFIX}-formControl`
};

const StyledBox = styled(Box)((
    {
        theme
    }
) => ({
    [`& .${classes.resetBtn}`]: {
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
    },

    [`& .${classes.btn}`]: {
        marginRight: '1em',
    },

    [`& .${classes.drawerInfo}`]: {
        marginBottom: '1em',
    },

    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },

    [`& .${classes.formControl}`]: {
        width: '80%',
    }
}));

const EditorContainer = styled(Box)(({ theme }) => ({
    height: 400,
    '& .monaco-editor': {
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
        overflow: 'hidden',
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
    isAPILevelPolicy: boolean;
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
    isAPILevelPolicy,
}) => {
    const intl = useIntl();

    const [saving, setSaving] = useState(false);
    const [applyToAll, setApplyToAll] = useState(false);
    const initState: any = {};
    const { updateApiOperations, updateAllApiOperations } = useContext<any>(ApiOperationContext);
    policySpec.policyAttributes.forEach(attr => { initState[attr.name] = null });
    const [state, setState] = useState(initState);
    const [isManual, setManual] = useState(false);
    const [manualPolicyConfig, setManualPolicyConfig] = useState<string>('');
    const [secretVisibility, setSecretVisibility] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (
            (policyObj && policyObj.name === 'modelRoundRobin') ||
            (policyObj && policyObj.name === 'modelWeightedRoundRobin') ||
            (policyObj && policyObj.name === 'modelFailover')
        ) {
            setManual(true);
        }
    }, [policyObj]);

    if (!policyObj) {
        return <Progress />
    }

    const onInputChange = (event: any, specType: string, specName?: string) => {
        if (specType.toLowerCase() === 'boolean') {
            setState({ ...state, [event.target.name]: event.target.checked });
        } else if (
            specType.toLowerCase() === 'string'
            || specType.toLowerCase() === 'integer'
            || specType.toLowerCase() === 'enum'
        ) {
            setState({ ...state, [event.target.name]: event.target.value });
        } else if (specType.toLowerCase() === 'json') {
            specName && setState({ ...state, [specName]: event });
        } else if (specType.toLowerCase() === 'secret') {
            const fieldName = event.target.name;
            let value = event.target.value;

            // If the value is empty, delete it from state
            if (!value) {
                const newState = { ...state };
                delete newState[fieldName];
                setState(newState);
                return;
            }

            // If the value is equal to the masked placeholder, clear it
            if (value === '********') {
                value = '';
            } else if (value.includes('********')) {
                value = value.replace('********', '');
            }

            setState({ ...state, [fieldName]: value });
        }
    }

    const getValueOfPolicyParam = (policyParamName: string) => {
        return apiPolicy.parameters[policyParamName];
    }

    /**
     * Toggle visibility of Secret field
     * @param {string} fieldName Name of the Secret field
     */
    const toggleSecretVisibility = (fieldName: string) => {
        // Only toggle visibility if the value is not the masked placeholder
        const value = getValue({ name: fieldName, type: 'Secret' } as PolicySpecAttribute);
        if (value !== '********') {
            setSecretVisibility(prev => ({
                ...prev,
                [fieldName]: !prev[fieldName]
            }));
        }
    };

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

            // Special handling for Secret fields
            if (attributeSpec?.type.toLowerCase() === 'secret') {
                const previousValue = getValueOfPolicyParam(key);

                // If the value is empty (from masked placeholder), 
                // or null (if user doesn't do any change),
                // keep the previous value
                if (value === null || value === '') {
                    if (previousValue !== null && previousValue !== undefined) {
                        updateCandidates[key] = previousValue;
                    } else {
                        // If the previous value is also empty, delete it from updateCandidates
                        delete updateCandidates[key];
                    }
                } else {
                    // If user has entered a new value, use that
                    updateCandidates[key] = value;
                }
            } else if (value === null && getValueOfPolicyParam(key) && getValueOfPolicyParam(key) !== '') {
                updateCandidates[key] = getValueOfPolicyParam(key);
            } else if (value === null && attributeSpec?.defaultValue && attributeSpec?.defaultValue !== null) {
                updateCandidates[key] = attributeSpec.defaultValue;
            } else {
                updateCandidates[key] = value;
            }
            // Escape double quotes in JSON string to HTML-safe equivalent
            if (attributeSpec && attributeSpec.type.toLowerCase() === 'json') {
                try {
                    updateCandidates[key] = updateCandidates[key].replace(/"/g, "&quot;");
                } catch (e) {
                    console.error(
                        `Failed to escape double quotes for key "${key}" of type "json".`, e instanceof Error ? e.message : e
                    );
                }
            }
        });

        if (policyObj.name === 'modelRoundRobin' || policyObj.name === 'modelWeightedRoundRobin' || policyObj.name === 'modelFailover') {
            updateCandidates[policySpec.policyAttributes[0].name] = manualPolicyConfig;
        }

        // Saving field changes to backend
        const apiPolicyToSave = {...apiPolicy};
        apiPolicyToSave.parameters = updateCandidates;
        if (!applyToAll) {
            updateApiOperations(apiPolicyToSave, target, verb, currentFlow);
        } else {
            // Apply the same attached policy to all the resources
            updateAllApiOperations(apiPolicyToSave, currentFlow);
            setApplyToAll(false);
        }

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
            if (specInCheck.required && (value === '' || value === undefined)) {
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
        if (spec.type.toLowerCase() === 'secret') {
            // First check if user has entered a value (in state)
            if (state[specName] !== null) {
                return state[specName];
            }
            // Then check for previous values
            else if (previousVal === null) {
                return '';
            } else if (previousVal === '') {
                return '********';
            } else {
                return previousVal;
            }
        } else if (state[specName] !== null) {
            return state[specName];
        } else if (previousVal !== null && previousVal !== undefined) {
            if (spec.type.toLowerCase() === 'integer') return parseInt(previousVal, 10);
            else if (spec.type.toLowerCase() === 'boolean') return (previousVal.toString() === 'true');
            else if (spec.type.toLowerCase() === 'json') {
                try {
                    const jsonString = previousVal.replace(/&quot;/g, '"');
                    const jsonObject = JSON.parse(jsonString);
                    return JSON.stringify(jsonObject, null, 2);
                } catch (e) {
                    console.error(
                        `Failed to parse json for attribute "${specName}"`, e instanceof Error ? e.message : e
                    );
                }
            }
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

    /**
     * Toggle the apply to all option on initial policy drop.
     */
    const toggleApplyToAll = () => {
        setApplyToAll(!applyToAll);
    }

    const hasAttributes = policySpec.policyAttributes.length !== 0;
    const resetDisabled = Object.values(state).filter((value: any) => 
        (value !== null && (value.toString() !== 'true' || value.toString() !== 'false')) || !!value
    ).length === 0;

    if (!policySpec) {
        return <CircularProgress />
    }

    return (
        <StyledBox p={2}>
            <form onSubmit={submitForm}>
                <Grid container spacing={2}>
                    <Grid item xs={12} className={classes.drawerInfo}>
                        {(hasAttributes && !isManual) && (
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
                    {(isManual && policyObj.name === 'modelRoundRobin') && (
                        <ModelRoundRobin
                            setManualPolicyConfig={setManualPolicyConfig}
                            manualPolicyConfig={getValue(policySpec.policyAttributes[0])}
                        />
                    )}
                    {(isManual && policyObj.name === 'modelWeightedRoundRobin') && (
                        <ModelWeightedRoundRobin
                            setManualPolicyConfig={setManualPolicyConfig}
                            manualPolicyConfig={getValue(policySpec.policyAttributes[0])}
                        />
                    )}
                    {(isManual && policyObj.name === 'modelFailover') && (
                        <ModelFailover
                            setManualPolicyConfig={setManualPolicyConfig}
                            manualPolicyConfig={getValue(policySpec.policyAttributes[0])}
                        />
                    )}
                    {!isManual && policySpec.policyAttributes && policySpec.policyAttributes.map((spec: PolicySpecAttribute) => (
                        <Grid item xs={12} key={spec.name}>

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
                                            <MenuItem aria-label='None' value=''>&nbsp;</MenuItem>
                                            {spec.allowedValues && spec.allowedValues.map((enumVal) => (
                                                <MenuItem value={enumVal}>{enumVal}</MenuItem>
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
                                <FormControl
                                    variant='outlined'
                                    className={classes.formControl}
                                    error={getError(spec) !== ''}
                                >
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
                                    <FormHelperText>
                                        {getError(spec) === '' ? spec.description : getError(spec)}
                                    </FormHelperText>
                                </FormControl>
                            )}

                            {/* When attribute type is json */}
                            {spec.type.toLowerCase() === 'json' && (
                                <FormControl
                                    variant='outlined'
                                    className={classes.formControl}
                                    error={getError(spec) !== ''}
                                    style={{ width: '100%' }}
                                >
                                    {/* Custom Label */}
                                    <InputLabel shrink htmlFor={spec.name} style={{ marginBottom: '0.5rem' }}>
                                        <>
                                            {spec.displayName}
                                            {spec.required && (
                                                <sup className={classes.mandatoryStar}>*</sup>
                                            )}
                                        </>
                                    </InputLabel>

                                    {/* Monaco Editor */}
                                    <Box component='div' m={1}>
                                        <Paper variant='outlined'>
                                            <EditorContainer>
                                                <Editor
                                                    height='100%'
                                                    defaultLanguage='json'
                                                    value={getValue(spec)}
                                                    onChange={(value) => onInputChange(value, spec.type, spec.name)}
                                                    theme='light'
                                                    options={{
                                                        minimap: { enabled: false },
                                                        lineNumbers: 'on',
                                                        scrollBeyondLastLine: false,
                                                        tabSize: 2,
                                                        lineNumbersMinChars: 2,
                                                    }}
                                                />
                                            </EditorContainer>
                                        </Paper>
                                    </Box>

                                    {/* Helper or Error text */}
                                    <FormHelperText>
                                        {getError(spec) === '' ? spec.description : getError(spec)}
                                    </FormHelperText>
                                </FormControl>
                            )}

                            {/* When attribute type is Secret */}
                            {(spec.type.toLowerCase() === 'secret') && (
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
                                    type={secretVisibility[spec.name] ? 'text' : 'password'}
                                    value={getValue(spec)}
                                    onChange={(e: any) => onInputChange(e, spec.type)}
                                    InputLabelProps={{
                                        shrink: Boolean(getValue(spec)),
                                    }}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onClick={() => toggleSecretVisibility(spec.name)}
                                                    edge='end'
                                                    size='small'
                                                >
                                                    {secretVisibility[spec.name] ?
                                                        <VisibilityIcon /> :
                                                        <VisibilityOffIcon />
                                                    }
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}

                        </Grid>
                    ))}
                    {setDroppedPolicy && !isAPILevelPolicy && (
                        <Grid item container justifyContent='flex-start' xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id='checkbox-apply-dropped-policy-to-all'
                                        checked={applyToAll}
                                        color='primary'
                                        name='applyPolicyToAll'
                                        onChange={toggleApplyToAll}
                                    />
                                }
                                label={(
                                    <Typography variant='subtitle1' color='textPrimary'>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.AttachedPolicyForm.General.apply.to.all.resources'
                                            defaultMessage='Apply to all resources'
                                        />
                                    </Typography>
                                )}
                            />
                        </Grid>
                    )}
                    <Grid item container justifyContent='flex-end' xs={12}>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={handleDrawerClose}
                            className={classes.btn}
                            data-testid='policy-attached-details-cancel'
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
                            disabled={!isManual && (isSaveDisabled() || formHasErrors() || saving)}
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
        </StyledBox>
    );
};


export default General;
