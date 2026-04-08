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
import ContentBasedRouter from '../CustomPolicies/ContentBasedRouter';
import SemanticRouting from '../CustomPolicies/SemanticRouting';
import IntelligentModelRouting from '../CustomPolicies/IntelligentModelRouting';
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

type SchemaNode = {
    type?: string;
    title?: string;
    description?: string;
    properties?: Record<string, SchemaNode>;
    items?: SchemaNode;
    required?: string[];
    enum?: Array<string | number>;
    default?: any;
};

const parseSchemaValue = (value: any) => {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value !== 'string') {
        return value;
    }
    const normalized = value.replace(/&quot;/g, '"');
    try {
        return JSON.parse(normalized);
    } catch {
        return value;
    }
};

const cloneDefaultValue = (value: any): any => {
    if (value === null || value === undefined) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => cloneDefaultValue(item));
    }
    if (typeof value === 'object') {
        return Object.entries(value).reduce(
            (acc: Record<string, any>, [key, nested]: [string, any]) => ({
                ...acc,
                [key]: cloneDefaultValue(nested),
            }),
            {},
        );
    }
    return value;
};

const buildInitialValueFromSchema = (schema: SchemaNode, existingValue?: any): any => {
    const parsedExisting = parseSchemaValue(existingValue);
    if (parsedExisting !== null && parsedExisting !== undefined && parsedExisting !== '') {
        return parsedExisting;
    }
    if (schema.default !== undefined) {
        return cloneDefaultValue(schema.default);
    }

    if (schema.type === 'array') {
        return [];
    }

    if (schema.type === 'object') {
        const initObj: Record<string, any> = {};
        const requiredFields = Array.isArray(schema.required) ? schema.required : [];
        Object.entries(schema.properties || {}).forEach(([key, childSchema]) => {
            const childValue = buildInitialValueFromSchema(childSchema, undefined);
            if (childValue !== undefined && (requiredFields.includes(key) || childValue !== '')) {
                initObj[key] = childValue;
            }
        });
        return initObj;
    }

    if (schema.type === 'boolean') {
        return false;
    }

    return '';
};

const setNestedValue = (source: any, path: Array<string | number>, value: any): any => {
    if (path.length === 0) {
        return value;
    }
    const [head, ...rest] = path;
    let base = source;
    if (source === null || source === undefined) {
        base = typeof head === 'number' ? [] : {};
    }
    const clone = Array.isArray(base) ? [...base] : { ...base };
    clone[head] = setNestedValue(base[head], rest, value);
    return clone;
};

const removeNestedArrayItem = (source: any, path: Array<string | number>, indexToRemove: number): any => {
    const arrayAtPath = path.reduce((current, key) => (current ? current[key] : undefined), source);
    const nextArray = Array.isArray(arrayAtPath)
        ? arrayAtPath.filter((_: any, index: number) => index !== indexToRemove)
        : [];
    return setNestedValue(source, path, nextArray);
};

const hasMissingRequiredFields = (schema: SchemaNode, value: any, isRequired = true): boolean => {
    if (!isRequired) {
        return false;
    }
    if (schema.type === 'object') {
        if (!value || typeof value !== 'object') {
            return true;
        }
        const requiredFields = Array.isArray(schema.required) ? schema.required : [];
        return requiredFields.some((field) =>
            hasMissingRequiredFields(schema.properties?.[field] || {}, value[field], true)
        );
    }
    if (schema.type === 'array') {
        return !Array.isArray(value) || value.length === 0;
    }
    if (schema.type === 'boolean') {
        return value === null || value === undefined;
    }
    return value === null || value === undefined || value === '';
};

const toHumanReadableLabel = (key: string): string => {
    if (!key) {
        return '';
    }

    const spaced = key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');

    const words = spaced.split(' ').filter(Boolean);
    if (words.length === 0) {
        return '';
    }

    // Display array-like keys in singular form for cleaner labels (e.g., requestHeaders -> Request Header).
    const lastWord = words[words.length - 1];
    if (lastWord.length > 1 && /s$/i.test(lastWord) && !/ss$/i.test(lastWord)) {
        words[words.length - 1] = lastWord.slice(0, -1);
    }

    return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

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
    const dynamicSchema: SchemaNode | null = (policySpec as any).parametersSchema || null;
    const hasDynamicSchema = Boolean(dynamicSchema?.type === 'object' && dynamicSchema?.properties);
    const [dynamicState, setDynamicState] = useState<any>({});
    const [isManualFormValid, setIsManualFormValid] = useState<boolean>(true);
    const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);

    useEffect(() => {
        if (
            (policyObj && policyObj.name === 'modelRoundRobin') ||
            (policyObj && policyObj.name === 'modelWeightedRoundRobin') ||
            (policyObj && policyObj.name === 'modelFailover') ||
            (policyObj && policyObj.name === 'ContentBasedModelRouter') ||
            (policyObj && policyObj.name === 'SemanticRouting') ||
            (policyObj && policyObj.name === 'IntelligentModelRouting')
        ) {
            setManual(true);
            // Initialize form as invalid for policies that require validation
            if (policyObj.name === 'SemanticRouting' || policyObj.name === 'IntelligentModelRouting') {
                setIsManualFormValid(false);
            }
        }
    }, [policyObj]);

    useEffect(() => {
        if (hasDynamicSchema && dynamicSchema) {
            const initialDynamicState = buildInitialValueFromSchema(dynamicSchema, apiPolicy.parameters);
            setDynamicState(initialDynamicState || {});
        }
    }, [apiPolicy.parameters, hasDynamicSchema, dynamicSchema]);

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
            if (specName) {
                setState({ ...state, [specName]: event });
            }
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

    const updateDynamicField = (path: Array<string | number>, value: any) => {
        setDynamicState((prevState: any) => setNestedValue(prevState, path, value));
    };

    const addDynamicArrayItem = (path: Array<string | number>, itemSchema: SchemaNode = {}) => {
        setDynamicState((prevState: any) => {
            const currentArray = path.reduce((current, key) => (current ? current[key] : undefined), prevState);
            const nextArray = Array.isArray(currentArray) ? [...currentArray] : [];
            nextArray.push(buildInitialValueFromSchema(itemSchema, undefined));
            return setNestedValue(prevState, path, nextArray);
        });
    };

    const removeDynamicArrayItem = (path: Array<string | number>, indexToRemove: number) => {
        setDynamicState((prevState: any) => removeNestedArrayItem(prevState, path, indexToRemove));
    };

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
        if (
            isManual &&
            (policyObj?.name === 'SemanticRouting' || policyObj?.name === 'IntelligentModelRouting') &&
            !isManualFormValid
        ) {
            setShowValidationErrors(true);
            return;
        }
        setSaving(true);
        let updateCandidates: any = {};

        if (hasDynamicSchema) {
            updateCandidates = dynamicState;
        } else {
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
                        console.error(`Failed to escape double quotes for key "${key}" of type "json".`,
                            e instanceof Error ? e.message : e);
                    }
                }
            });
        }

        if ([
            'modelRoundRobin',
            'modelWeightedRoundRobin',
            'modelFailover',
            'ContentBasedModelRouter',
            'SemanticRouting',
            'IntelligentModelRouting',
        ].includes(policyObj.name)) {
            if (policySpec.policyAttributes?.length) {
                updateCandidates[policySpec.policyAttributes[0].name] = manualPolicyConfig;
            }
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

    const renderDynamicPrimitiveField = (
        fieldSchema: SchemaNode,
        value: any,
        path: Array<string | number>,
        label: string,
        required: boolean,
    ) => {
        const schemaType = (fieldSchema.type || 'string').toLowerCase();
        const description = fieldSchema.description || '';

        if (schemaType === 'boolean') {
            return (
                <FormControl variant='outlined' className={classes.formControl}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(value)}
                                onChange={(event) => updateDynamicField(path, event.target.checked)}
                                color='primary'
                            />
                        }
                        label={(
                            <>
                                {label}
                                {required && (
                                    <sup className={classes.mandatoryStar}>*</sup>
                                )}
                            </>
                        )}
                    />
                    {description && <FormHelperText>{description}</FormHelperText>}
                </FormControl>
            );
        }

        if (Array.isArray(fieldSchema.enum) && fieldSchema.enum.length > 0) {
            return (
                <FormControl variant='outlined' className={classes.formControl}>
                    <InputLabel htmlFor={`dynamic-enum-${path.join('-')}`}>
                        <>
                            {label}
                            {required && (
                                <sup className={classes.mandatoryStar}>*</sup>
                            )}
                        </>
                    </InputLabel>
                    <Select
                        value={value ?? ''}
                        onChange={(event) => updateDynamicField(path, event.target.value)}
                        label={label}
                        inputProps={{ id: `dynamic-enum-${path.join('-')}` }}
                    >
                        <MenuItem aria-label='None' value=''>&nbsp;</MenuItem>
                        {fieldSchema.enum.map((enumValue) => (
                            <MenuItem key={`${path.join('-')}-${String(enumValue)}`} value={enumValue}>
                                {String(enumValue)}
                            </MenuItem>
                        ))}
                    </Select>
                    {description && <FormHelperText>{description}</FormHelperText>}
                </FormControl>
            );
        }

        const numberType = schemaType === 'integer' || schemaType === 'number';
        return (
            <TextField
                id={`dynamic-${path.join('-')}`}
                label={(
                    <>
                        {label}
                        {required && (
                            <sup className={classes.mandatoryStar}>*</sup>
                        )}
                    </>
                )}
                helperText={description}
                variant='outlined'
                type={numberType ? 'number' : 'text'}
                value={value ?? ''}
                onChange={(event) => {
                    if (numberType) {
                        const parsedValue = event.target.value === '' ? '' : Number(event.target.value);
                        updateDynamicField(path, parsedValue);
                    } else {
                        updateDynamicField(path, event.target.value);
                    }
                }}
                fullWidth
            />
        );
    };

    const renderDynamicField = (
        fieldName: string,
        fieldSchema: SchemaNode,
        value: any,
        path: Array<string | number>,
        required: boolean,
    ): React.ReactNode => {
        const schemaType = (fieldSchema.type || 'string').toLowerCase();
        const label = fieldSchema.title || toHumanReadableLabel(fieldName);

        if (schemaType === 'object') {
            const requiredFields = Array.isArray(fieldSchema.required) ? fieldSchema.required : [];
            return (
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                        {label}
                        {required && <sup className={classes.mandatoryStar}>*</sup>}
                    </Typography>
                    {fieldSchema.description && (
                        <Typography variant='caption' color='textSecondary'>
                            {fieldSchema.description}
                        </Typography>
                    )}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {Object.entries(fieldSchema.properties || {}).map(([childName, childSchema]) => (
                            <Grid item xs={12} key={`${path.join('-')}-${childName}`}>
                                {renderDynamicField(
                                    childName,
                                    childSchema,
                                    value?.[childName],
                                    [...path, childName],
                                    requiredFields.includes(childName),
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            );
        }

        if (schemaType === 'array') {
            const arrayValue = Array.isArray(value) ? value : [];
            const itemSchema = fieldSchema.items || {};
            const itemType = (itemSchema.type || 'string').toLowerCase();
            return (
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                        <Typography variant='subtitle2'>
                            {label}
                            {required && <sup className={classes.mandatoryStar}>*</sup>}
                        </Typography>
                        <Button
                            size='small'
                            variant='outlined'
                            onClick={() => addDynamicArrayItem(path, itemSchema)}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.AttachedPolicyForm.General.dynamic.array.add'
                                defaultMessage='Add Item'
                            />
                        </Button>
                    </Box>
                    {fieldSchema.description && (
                        <Typography variant='caption' color='textSecondary'>
                            {fieldSchema.description}
                        </Typography>
                    )}
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {arrayValue.map((arrayItem: any, index: number) => {
                            return (
                                <Grid item xs={12} key={`${path.join('-')}-${index}`}>
                                    <Paper variant='outlined' sx={{ p: 2 }}>
                                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                                        <Typography variant='caption'>
                                            {`${label} ${index + 1}`}
                                        </Typography>
                                        <Button
                                            size='small'
                                            color='error'
                                            onClick={() => removeDynamicArrayItem(path, index)}
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.Policies.AttachedPolicyForm.General.dynamic.array.remove'
                                                defaultMessage='Remove'
                                            />
                                        </Button>
                                    </Box>
                                    {itemType === 'object'
                                        ? (
                                            <Grid container spacing={2}>
                                                {Object.entries(itemSchema.properties || {}).map(
                                                    ([itemProperty, itemPropertySchema]) => {
                                                        return (
                                                            <Grid
                                                                item
                                                                xs={12}
                                                                key={`${path.join('-')}-${index}-${itemProperty}`}
                                                            >
                                                                {renderDynamicField(
                                                                    itemProperty,
                                                                    itemPropertySchema,
                                                                    arrayItem?.[itemProperty],
                                                                    [...path, index, itemProperty],
                                                                    (itemSchema.required || []).includes(itemProperty),
                                                                )}
                                                            </Grid>
                                                        );
                                                    },
                                                )}
                                            </Grid>
                                        ) : renderDynamicPrimitiveField(
                                            itemSchema,
                                            arrayItem,
                                            [...path, index],
                                            `${label} ${index + 1}`,
                                            required,
                                        )}
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            );
        }

        return renderDynamicPrimitiveField(fieldSchema, value, path, label, required);
    };

    /**
     * Reset the input fields
     */
    const resetAll = () => {
        if (hasDynamicSchema && dynamicSchema) {
            setDynamicState(buildInitialValueFromSchema(dynamicSchema, apiPolicy.parameters));
        } else {
            setState(initState);
        }
    }

    /**
     * Function to check whether there are any errors in the form.
     * If there are errors, we disable the save button.
     * @returns {boolean} Boolean value indicating whether or not the form has any errors.
     */
    const formHasErrors = () => {
        if (hasDynamicSchema && dynamicSchema) {
            return hasMissingRequiredFields(dynamicSchema, dynamicState, true);
        }
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
        if (hasDynamicSchema && dynamicSchema) {
            return hasMissingRequiredFields(dynamicSchema, dynamicState, true);
        }
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

    const hasAttributes = hasDynamicSchema || policySpec.policyAttributes.length !== 0;
    const initialDynamicState = hasDynamicSchema
        ? (buildInitialValueFromSchema(dynamicSchema || {}, apiPolicy.parameters) || {})
        : {};
    const resetDisabled = hasDynamicSchema
        ? JSON.stringify(dynamicState || {}) === JSON.stringify(initialDynamicState)
        : Object.values(state).filter((value: any) =>
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
                    {(isManual && policyObj.name === 'ContentBasedModelRouter') && (
                        <ContentBasedRouter
                            setManualPolicyConfig={setManualPolicyConfig}
                            manualPolicyConfig={getValue(policySpec.policyAttributes[0])}
                        />
                    )}
                    {(isManual && policyObj.name === 'SemanticRouting') && (
                        <SemanticRouting
                            setManualPolicyConfig={setManualPolicyConfig}
                            manualPolicyConfig={getValue(policySpec.policyAttributes[0])}
                            setIsFormValid={setIsManualFormValid}
                            showValidationErrors={showValidationErrors}
                            setShowValidationErrors={setShowValidationErrors}
                        />
                    )}
                    {(isManual && policyObj.name === 'IntelligentModelRouting') && (
                        <IntelligentModelRouting
                            setManualPolicyConfig={setManualPolicyConfig}
                            manualPolicyConfig={getValue(policySpec.policyAttributes[0])}
                            setIsFormValid={setIsManualFormValid}
                            showValidationErrors={showValidationErrors}
                            setShowValidationErrors={setShowValidationErrors}
                        />
                    )}
                    {!isManual && hasDynamicSchema && dynamicSchema
                        && Object.entries(dynamicSchema.properties || {}).map(
                            ([fieldName, fieldSchema]) => (
                                <Grid item xs={12} key={`dynamic-field-${fieldName}`}>
                                    {renderDynamicField(
                                        fieldName,
                                        fieldSchema,
                                        dynamicState?.[fieldName],
                                        [fieldName],
                                        (dynamicSchema.required || []).includes(fieldName),
                                    )}
                                </Grid>
                            ),
                        )}
                    {!isManual && !hasDynamicSchema && policySpec.policyAttributes && policySpec.policyAttributes.map((spec: PolicySpecAttribute) => (
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
                            disabled={
                                isManual
                                    ? (saving || !isManualFormValid)
                                    : (isSaveDisabled() || formHasErrors() || saving)
                            }
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
