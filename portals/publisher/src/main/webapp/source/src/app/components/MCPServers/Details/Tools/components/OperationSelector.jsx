/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MethodView from 'AppComponents/Apis/Details/ProductResources/MethodView';

const PREFIX = 'OperationSelector';

const classes = {
    formControl: `${PREFIX}-formControl`,
    methodView: `${PREFIX}-methodView`,
    operationBox: `${PREFIX}-operationBox`,
};

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    [`&.${classes.formControl}`]: {
        minWidth: 120,
    },

    [`& .${classes.methodView}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.operationBox}`]: {
        cursor: 'text',
        flex: 1,
        minHeight: '1.4375em',
        lineHeight: '1.4375em',
        display: 'flex',
        alignItems: 'center',
    },
}));

/**
 * Operation Selector Component - A reusable autocomplete component for selecting operations
 * @param {object} props - The component props
 * @param {Array} props.availableOperations - Array of available operations to choose from
 * @param {object|null} props.value - The currently selected operation
 * @param {Function} props.onChange - Callback function when selection changes
 * @param {boolean} props.disabled - Whether the component is disabled
 * @param {boolean} props.error - Whether to show error state
 * @param {string} props.helperText - Helper text to display below the input
 * @param {boolean} props.fullWidth - Whether to make the component full width
 * @param {string} props.margin - Margin setting for the component
 * @param {string} props.variant - Variant of the text field
 * @param {string} props.label - Label for the input field
 * @param {string} props.placeholder - Placeholder text
 * @returns {React.ReactNode} - The OperationSelector component
 */
function OperationSelector({
    availableOperations,
    value,
    onChange,
    disabled = false,
    error = false,
    helperText = '',
    fullWidth = false,
    margin = 'dense',
    variant = 'outlined',
    label,
    placeholder,
}) {
    const intl = useIntl();

    // Default label if not provided
    const defaultLabel = label || intl.formatMessage({
        id: 'MCPServers.Details.Tools.OperationSelector.label',
        defaultMessage: 'Operation',
    });

    // Default placeholder if not provided
    const defaultPlaceholder = placeholder || intl.formatMessage({
        id: 'MCPServers.Details.Tools.OperationSelector.placeholder',
        defaultMessage: 'Select an operation',
    });

    return (
        <StyledFormControl
            margin={margin}
            variant={variant}
            className={classes.formControl}
            fullWidth={fullWidth}
            error={error}
            disabled={disabled}
        >
            <Autocomplete
                id='operation-autocomplete'
                key={value && value.target && value.verb ? `selected_${value.target}_${value.verb}` : 'empty'}
                options={availableOperations}
                value={value}
                onChange={(event, newValue) => {
                    onChange(newValue);
                }}
                clearOnEscape
                clearOnBlur={false}
                getOptionLabel={(option) => {
                    if (!option) return '';
                    const verb = option.verb ? option.verb.toUpperCase() : '';
                    const target = option.target || '';
                    return `${verb} ${target}`.trim();
                }}
                isOptionEqualToValue={(option, selectedValue) => {
                    if (!option || !selectedValue) return false;
                    // Compare by target and verb, case-insensitive for verb
                    return option.target === selectedValue.target && 
                           option.verb.toLowerCase() === selectedValue.verb.toLowerCase();
                }}
                renderOption={(renderProps, option) => {
                    const { key, ...otherProps } = renderProps;
                    return (
                        <Box
                            component='li'
                            {...otherProps}
                            key={key || `${option.target}_${option.verb}`}
                        >
                            <Box display='flex' alignItems='center' gap={1}>
                                <MethodView
                                    method={option.verb}
                                    className={classes.methodView}
                                />
                                <span>{option.target}</span>
                            </Box>
                        </Box>
                    );
                }}
                renderInput={(params) => {
                    const hasValue = value && value.verb && value.target;
                    
                    // Modify the params to hide text when we have a value
                    const modifiedParams = hasValue ? {
                        ...params,
                        inputProps: {
                            ...params.inputProps,
                            style: {
                                ...params.inputProps.style,
                                // Hide the text when we have custom display, but keep input active
                                color: 'transparent',
                                caretColor: 'black',
                            }
                        },
                        InputProps: {
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <Box
                                        display='flex'
                                        alignItems='center'
                                        sx={{ marginRight: 1 }}
                                    >
                                        <MethodView
                                            method={value.verb.toUpperCase()}
                                            className={classes.methodView}
                                        />
                                        <span style={{ marginLeft: '4px' }}>
                                            {value.target}
                                        </span>
                                    </Box>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                            style: {
                                minHeight: '56px',
                            },
                        }
                    } : {
                        ...params,
                        InputProps: {
                            ...params.InputProps,
                            style: {
                                minHeight: '56px',
                            },
                        }
                    };
                    
                    return (
                        <TextField
                            {...modifiedParams}
                            label={defaultLabel}
                            variant={variant}
                            error={error}
                            helperText={helperText}
                            placeholder={defaultPlaceholder}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    );
                }}
                filterOptions={(options, { inputValue }) => {
                    if (!inputValue) return options;
                    const filterValue = inputValue.toLowerCase();
                    return options.filter(option =>
                        option.target.toLowerCase().includes(filterValue) ||
                        option.verb.toLowerCase().includes(filterValue) ||
                        (option.description &&
                            option.description.toLowerCase().includes(filterValue))
                    );
                }}
                noOptionsText={intl.formatMessage({
                    id: 'MCPServers.Details.Tools.OperationSelector.noOptions',
                    defaultMessage: 'No operations available',
                })}
                selectOnFocus
                handleHomeEndKeys
                disabled={disabled}
            />
        </StyledFormControl>
    );
}

OperationSelector.propTypes = {
    availableOperations: PropTypes.arrayOf(PropTypes.shape({
        target: PropTypes.string.isRequired,
        verb: PropTypes.string.isRequired,
        description: PropTypes.string,
        summary: PropTypes.string,
    })).isRequired,
    value: PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        description: PropTypes.string,
        summary: PropTypes.string,
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    fullWidth: PropTypes.bool,
    margin: PropTypes.string,
    variant: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
};

OperationSelector.defaultProps = {
    value: null,
    disabled: false,
    error: false,
    helperText: '',
    fullWidth: false,
    margin: 'dense',
    variant: 'outlined',
    label: '',
    placeholder: '',
};

export default React.memo(OperationSelector);
