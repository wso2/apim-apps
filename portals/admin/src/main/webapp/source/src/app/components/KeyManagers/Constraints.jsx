/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

/**
 * Supported constraint types
 */
export const CONSTRAINT_TYPES = {
    RANGE: 'RANGE',
    MIN: 'MIN',
    MAX: 'MAX',
    ENUM: 'ENUM',
    REGEX: 'REGEX',
};

const CONSTRAINT_KEYS = {
    MIN: 'min',
    MAX: 'max',
    PATTERN: 'pattern',
    ALLOWED: 'allowed',
};

const CONSTRAINT_LABELS = {
    MIN: 'Min',
    MAX: 'Max',
    PATTERN: 'Pattern',
    ALLOWED: 'Allowed',
    VALUE: 'Value',
};

// Float loose precision after 999999999999999
const MAXIMUM_CHARACTER_LENGTH = 15;

/**
 * Parse constraint value from saved format to input format
 * @param {string} type - Constraint type
 * @param {Object} val - Saved constraint value
 * @returns {*} Parsed value for input
 */
export const parseToInput = (type, val) => {
    switch (type) {
        case CONSTRAINT_TYPES.RANGE:
            if (val && typeof val === 'object') {
                const min = val.min !== undefined && val.min !== null ? String(val.min) : '';
                const max = val.max !== undefined && val.max !== null ? String(val.max) : '';
                return { min, max };
            }
            return { min: '', max: '' };
        case CONSTRAINT_TYPES.MIN:
            return val && val.min !== undefined ? { min: String(val.min) } : { min: '' };
        case CONSTRAINT_TYPES.MAX:
            return val && val.max !== undefined ? { max: String(val.max) } : { max: '' };
        case CONSTRAINT_TYPES.REGEX:
            return val && val.pattern ? { pattern: val.pattern } : { pattern: '' };
        case CONSTRAINT_TYPES.ENUM:
            if (val && Array.isArray(val.allowed)) return { allowed: val.allowed };
            if (Array.isArray(val)) return { allowed: val };
            return { allowed: [] };
        default:
            return {};
    }
};

/**
 * Parse input value to constraint save format
 * @param {string} type - Constraint type
 * @param {*} val - Input value (structure matched from parseToInput)
 * @returns {Object|null} Constraint value for saving
 */
export const parseToSave = (type, val) => {
    switch (type) {
        case CONSTRAINT_TYPES.RANGE: {
            const result = {};
            if (val === null) {
                return result;
            }
            const minStr = String(val.min || '').trim();
            const maxStr = String(val.max || '').trim();

            if (minStr !== '') {
                const min = parseInt(minStr, 10);
                if (!Number.isNaN(min)) result.min = min;
            }
            if (maxStr !== '') {
                const max = parseInt(maxStr, 10);
                if (!Number.isNaN(max)) result.max = max;
            }
            return result;
        }
        case CONSTRAINT_TYPES.MIN: {
            if (val === null) {
                return {};
            }
            const n = parseInt(val.min, 10);
            return Number.isNaN(n) ? {} : { min: n };
        }
        case CONSTRAINT_TYPES.MAX: {
            if (val === null) {
                return {};
            }
            const n = parseInt(val.max, 10);
            return Number.isNaN(n) ? {} : { max: n };
        }
        case CONSTRAINT_TYPES.REGEX: {
            if (val === null) {
                return {};
            }
            const str = String(val.pattern || '').trim();
            if (str === '') return {};
            return { pattern: str };
        }
        case CONSTRAINT_TYPES.ENUM: {
            if (!Array.isArray(val.allowed)) return {};
            return { allowed: val.allowed };
        }
        default:
            return {};
    }
};

/**
 * Render field based on constraint type
 * @param {Object} props - Component props
 * @returns {JSX.Element} Constraint input field
 */
const ConstraintInput = (props) => {
    const {
        config, value, onChange, disabled,
    } = props;
    const {
        name, constraintType, values,
    } = config;

    // RANGE: multiple fields (min/max)
    if (constraintType === CONSTRAINT_TYPES.RANGE) {
        const rangeFields = [
            { key: CONSTRAINT_KEYS.MIN, label: CONSTRAINT_LABELS.MIN, type: 'text' },
            { key: CONSTRAINT_KEYS.MAX, label: CONSTRAINT_LABELS.MAX, type: 'text' }];
        const objVal = value || { min: '', max: '' };
        return (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {rangeFields.map((f) => (
                    <TextField
                        key={f.key}
                        id={`${name}-${f.key}`}
                        label={f.label}
                        type={f.type}
                        variant='outlined'
                        size='small'
                        margin='dense'
                        disabled={disabled}
                        value={objVal[f.key] ?? ''}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, MAXIMUM_CHARACTER_LENGTH);
                            onChange(name, { [f.key]: val });
                        }}
                        inputProps={{
                            onWheel: (e) => e.target.blur(),
                        }}
                        sx={{ flex: 1, minWidth: 100 }}
                    />
                ))}
            </Box>
        );
    }

    // MIN / MAX
    if (constraintType === CONSTRAINT_TYPES.MIN || constraintType === CONSTRAINT_TYPES.MAX) {
        const isMin = constraintType === CONSTRAINT_TYPES.MIN;
        const label = isMin ? CONSTRAINT_LABELS.MIN : CONSTRAINT_LABELS.MAX;
        const key = isMin ? CONSTRAINT_KEYS.MIN : CONSTRAINT_KEYS.MAX;
        const objVal = value || { [key]: '' };
        return (
            <TextField
                id={`${name}-${label.toLowerCase()}`}
                label={label}
                type='text'
                variant='outlined'
                size='small'
                margin='dense'
                fullWidth
                disabled={disabled}
                value={objVal[key] ?? ''}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, MAXIMUM_CHARACTER_LENGTH);
                    onChange(name, { [key]: val });
                }}
                inputProps={{
                    onWheel: (e) => e.target.blur(),
                }}
            />
        );
    }

    // ENUM: checkboxes
    if (constraintType === CONSTRAINT_TYPES.ENUM) {
        const opts = Array.isArray(values) ? values : [];
        const allowed = (value && Array.isArray(value.allowed)) ? value.allowed : [];

        return (
            <FormControl variant='standard' component='fieldset' disabled={disabled}>
                <FormGroup row>
                    {opts.map((opt) => {
                        const optVal = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        return (
                            <FormControlLabel
                                key={optVal}
                                label={optLabel}
                                control={(
                                    <Checkbox
                                        checked={allowed.includes(optVal)}
                                        onChange={(e) => {
                                            const newVal = e.target.checked
                                                ? [...allowed, optVal]
                                                : allowed.filter((v) => v !== optVal);
                                            onChange(name, { allowed: newVal });
                                        }}
                                        color='primary'
                                        size='small'
                                    />
                                )}
                            />
                        );
                    })}
                </FormGroup>
            </FormControl>
        );
    }

    // REGEX / default: text field
    const pattern = (value && value.pattern) ? value.pattern : '';
    return (
        <TextField
            id={`${name}-pattern`}
            label={constraintType === CONSTRAINT_TYPES.REGEX ? CONSTRAINT_LABELS.PATTERN : CONSTRAINT_LABELS.VALUE}
            variant='outlined'
            size='small'
            margin='dense'
            fullWidth
            disabled={disabled}
            value={pattern}
            onChange={(e) => onChange(name, { pattern: e.target.value })}
            placeholder={constraintType === CONSTRAINT_TYPES.REGEX ? 'e.g., ^[a-zA-Z0-9]+$' : ''}
        />
    );
};

ConstraintInput.propTypes = {
    config: PropTypes.shape({
        name: PropTypes.string.isRequired,
        constraintType: PropTypes.string,
        values: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])),
    }).isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.shape({}),
    ]),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};
ConstraintInput.defaultProps = { value: null, disabled: false };

/**
 * Constraints Component
 *
 * A controlled component for rendering configuration constraint items.
 * State is managed by parent component in format: { [name]: { type, value } }
 * Enable/disable is determined internally based on whether value exists.
 *
 * @param {Object} props - Component props
 * @returns {JSX.Element} Constraints component
 *
 * @example
 * <Constraints
 *     items={availableAppConfigConstraints}
 *     constraintsData={constraintsState}
 *     onToggle={(name) => handleToggle(name)}
 *     onChange={(name, value) => handleChange(name, value)}
 * />
 */
function Constraints(props) {
    const {
        items,
        constraintsData,
        onChange,
        disabled,
    } = props;

    // State to track local activation and cached values
    // { [name]: { active: boolean, value: any } }
    const [elementState, setElementState] = useState({});

    // Sync state from external data
    React.useEffect(() => {
        if (constraintsData) {
            setElementState((prev) => {
                const next = { ...prev };
                let hasChanges = false;
                Object.keys(constraintsData).forEach((key) => {
                    const item = constraintsData[key];
                    if (item && item.value !== null && item.value !== undefined) {
                        next[key] = { active: true, value: item.value };
                        hasChanges = true;
                    }
                });
                return hasChanges ? next : prev;
            });
        }
    }, [constraintsData]);

    return (
        <Box sx={{ mt: 2 }}>
            {items.map((c, index) => {
                const data = constraintsData[c.name] || {};
                const local = elementState[c.name] || {};
                // Active if locally active OR externally present
                const isOn = local.active || (data.value !== null && data.value !== undefined);
                // Use active value if on, otherwise use cached value from local state
                let valueToParse = isOn ? data.value : local.value;
                if (c.constraintType === CONSTRAINT_TYPES.ENUM && !local.value) {
                    valueToParse = parseToInput(c.constraintType, c.values);
                }
                const displayValue = parseToInput(c.constraintType, valueToParse);

                return (
                    <React.Fragment key={c.name}>
                        {index > 0 && (
                            <Divider
                                sx={{
                                    my: 1.5,
                                    opacity: 0.2,
                                    ml: 0,
                                    width: 'calc(100%)',
                                }}
                            />
                        )}
                        <Box sx={{ py: 0.5, px: 0.5 }}>
                            {/* Label row: name on the left, toggle switch on the right */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Typography
                                    variant='body1'
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {c.label || c.name}
                                </Typography>
                                <Switch
                                    checked={isOn}
                                    onChange={() => {
                                        if (isOn) {
                                            // Disable: Keep current value in cache, set active=false
                                            setElementState((prev) => ({
                                                ...prev,
                                                [c.name]: { active: false, value: data.value || local.value },
                                            }));
                                            onChange(c.name, null);
                                        } else {
                                            // Enable: Set active=true, restore value
                                            const valToRestore = local.value || displayValue;
                                            setElementState((prev) => ({
                                                ...prev,
                                                [c.name]: { ...prev[c.name], active: true },
                                            }));
                                            onChange(c.name, parseToSave(c.constraintType, valToRestore));
                                        }
                                    }}
                                    color='primary'
                                    size='small'
                                    disabled={disabled}
                                    sx={{ flexShrink: 0 }}
                                />
                            </Box>
                            {/* Input fields — only rendered when toggle is on */}
                            {isOn && (
                                <Box sx={{ mt: 1 }}>
                                    <ConstraintInput
                                        config={c}
                                        value={displayValue}
                                        onChange={(name, inputValue) => {
                                            onChange(name, parseToSave(c.constraintType, inputValue));
                                        }}
                                        disabled={disabled}
                                        inputProps={{
                                            variant: 'outlined',
                                            margin: 'dense',
                                            fullWidth: true,
                                        }}
                                    />
                                    {(c.tooltip || c.toolTip) && (
                                        <FormHelperText>
                                            {c.tooltip || c.toolTip}
                                        </FormHelperText>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </React.Fragment>
                );
            })}
        </Box>
    );
}

Constraints.propTypes = {
    /** Array of constraint configurations */
    items: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string,
        constraintType: PropTypes.oneOf(Object.values(CONSTRAINT_TYPES)).isRequired,
        values: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])),
        tooltip: PropTypes.string,
        toolTip: PropTypes.string,
        type: PropTypes.string,
        multiple: PropTypes.bool,
        default: PropTypes.shape({}),
    })),
    /** Constraints data from parent: { [name]: { type: string, value: object } } */
    constraintsData: PropTypes.shape({}),
    /** Callback when value changes or constraint toggled: (name, value) => void */
    onChange: PropTypes.func,
    /** Whether all fields are disabled */
    disabled: PropTypes.bool,
};

Constraints.defaultProps = {
    items: [],
    constraintsData: {},
    onChange: null,
    disabled: false,
};

export default Constraints;
