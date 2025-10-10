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

import React, {
    useReducer,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import Alert from 'AppComponents/Shared/Alert';
import ClearIcon from '@mui/icons-material/Clear';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import HelpOutline from '@mui/icons-material/HelpOutline';
import OperationSelector from './OperationSelector';

const PREFIX = 'AddTool';


const classes = {
    paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(() => ({
    [`&.${classes.paper}`]: {
        marginTop: '12px',
    },
}));

/**
 * Add Tool component for MCP Servers
 * @param {*} props - The props for the AddTool component
 * @returns {React.ReactNode} - The AddTool component
 */
function AddTool(props) {
    const { operationsDispatcher, availableOperations, api } = props;
    const intl = useIntl();

    const isMCPServerProxy = api && api.isMCPServerFromProxy();

    /**
     * Reducer for new tool state
     * @param {*} state - The current state of the tool
     * @param {*} action - The action to perform on the state
     * @returns {object} - The new state of the tool
     */
    function newToolReducer(state, action) {
        const { type, value } = action;
        switch (type) {
            case 'name':
                return { 
                    ...state, 
                    [type]: value,
                    errors: { ...state.errors, name: false }
                };
            case 'description':
                return { 
                    ...state, 
                    [type]: value,
                    errors: { ...state.errors, description: false }
                };
            case 'selectedOperation':
                return { 
                    ...state, 
                    [type]: value,
                    errors: { ...state.errors, operation: false }
                };
            case 'clear':
                return { 
                    name: '', 
                    description: '', 
                    selectedOperation: null,
                    errors: { name: false, description: false, operation: false }
                };
            case 'setError':
                return { ...state, errors: { ...state.errors, [action.field]: value } };
            case 'error':
                return { ...state, error: value };
            default:
                return state;
        }
    }

    const [newTool, newToolDispatcher] = useReducer(newToolReducer, {
        name: '',
        description: '',
        selectedOperation: null,
        errors: {
            name: false,
            description: false,
            operation: false
        }
    });

    /**
     * Clear input fields
     */
    function clearInputs() {
        newToolDispatcher({ type: 'clear' });
    }

    /**
     * Add new tool
     */
    function addTool() {
        let hasErrors = false;
        const newErrors = { name: false, description: false, operation: false };

        // Validate all required fields
        if (!newTool.name || !newTool.name.trim()) {
            newErrors.name = true;
            hasErrors = true;
        }
        if (!newTool.description || !newTool.description.trim()) {
            newErrors.description = true;
            hasErrors = true;
        }
        if (!newTool.selectedOperation) {
            newErrors.operation = true;
            hasErrors = true;
        }

        // Set error states
        newToolDispatcher({ type: 'setError', field: 'name', value: newErrors.name });
        newToolDispatcher({ type: 'setError', field: 'description', value: newErrors.description });
        newToolDispatcher({ type: 'setError', field: 'operation', value: newErrors.operation });

        if (hasErrors) {
            Alert.error(intl.formatMessage({
                id: 'MCPServers.Details.Tools.AddTool.validation.error',
                defaultMessage: 'Please fix the validation errors before adding the Tool',
            }));
            return;
        }

        operationsDispatcher({
            action: 'add',
            data: {
                name: newTool.name,
                description: newTool.description,
                selectedOperation: newTool.selectedOperation
            }
        });
        clearInputs();
    }

    return (
        <StyledPaper className={classes.paper}>
            <Grid container direction='row' justifyContent='flex-start' alignItems='flex-start'>
                <Grid item md={12} xs={12} sx={{ p: 1 }}>
                    <Box>
                        <Typography variant='subtitle1' component='h3' gutterBottom>
                            <FormattedMessage
                                id='MCPServers.Details.Tools.AddTool.configuration'
                                defaultMessage='Add Tool'
                            />
                            <Tooltip
                                fontSize='small'
                                title={intl.formatMessage({
                                    id: 'MCPServers.Details.Tools.AddTool.configuration.tooltip',
                                    defaultMessage: 'Configure and add a new tool to the MCP Server',
                                })}
                                placement='right-end'
                                interactive
                            >
                                <IconButton aria-label='Add Tool' size='large'>
                                    <HelpOutline />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                    </Box>
                    <Divider variant='middle' />
                </Grid>
            </Grid>
            <Grid container direction='row'
                spacing={2} justifyContent='center' alignItems='center' pt={1} pb={2} px={3}
            >
                <Grid item md={3} xs={12}>
                    <OperationSelector
                        availableOperations={availableOperations}
                        value={newTool.selectedOperation}
                        onChange={(value) => {
                            newToolDispatcher({ type: 'selectedOperation', value: value || null });

                            // Auto-fill name and description based on selected operation
                            if (value) {
                                // Use operationId if available, otherwise fall back to target
                                let toolName = value.operationId || value.target;

                                // Remove leading slash from target if present
                                if (toolName && toolName.startsWith('/')) {
                                    toolName = toolName.substring(1);
                                }

                                newToolDispatcher({ type: 'name', value: toolName });
                                const description = value.description || value.summary || '';
                                newToolDispatcher({ type: 'description', value: description });
                            } else {
                                // Clear name and description when operation is cleared
                                newToolDispatcher({ type: 'name', value: '' });
                                newToolDispatcher({ type: 'description', value: '' });
                            }
                        }}
                        fullWidth
                        margin='dense'
                        variant='outlined'
                        error={newTool.errors.operation}
                        helperText={
                            newTool.errors.operation &&
                            intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.operation.error',
                                defaultMessage: 'Operation selection is required',
                            })
                        }
                        label={isMCPServerProxy
                            ? intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.tool.label',
                                defaultMessage: 'Tool',
                            })
                            : intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.operation.label',
                                defaultMessage: 'Operation',
                            })
                        }
                        placeholder={isMCPServerProxy
                            ? intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.tool.placeholder',
                                defaultMessage: 'Select a tool',
                            })
                            : intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.operation.placeholder',
                                defaultMessage: 'Select an operation',
                            })
                        }
                    />
                </Grid>

                <Grid item md={3} xs={12}>
                    <TextField
                        id='tool-name'
                        label={intl.formatMessage({
                            id: 'MCPServers.Details.Tools.AddTool.name.label',
                            defaultMessage: 'Tool Name',
                        })}
                        required
                        name='name'
                        value={newTool.name}
                        onChange={(event) => newToolDispatcher({
                            type: 'name',
                            value: event.target.value,
                        })}
                        placeholder={intl.formatMessage({
                            id: 'MCPServers.Details.Tools.AddTool.name.placeholder',
                            defaultMessage: 'Enter tool name',
                        })}
                        fullWidth
                        margin='dense'
                        variant='outlined'
                        error={newTool.errors.name}
                        helperText={newTool.errors.name ? 
                            intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.name.error',
                                defaultMessage: 'Tool name is required',
                            }) : ''
                        }
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>

                <Grid item md={4} xs={12}>
                    <TextField
                        id='tool-description'
                        label={intl.formatMessage({
                            id: 'MCPServers.Details.Tools.AddTool.description.label',
                            defaultMessage: 'Description',
                        })}
                        name='description'
                        value={newTool.description}
                        required
                        onChange={(event) => newToolDispatcher({
                            type: 'description',
                            value: event.target.value,
                        })}
                        placeholder={intl.formatMessage({
                            id: 'MCPServers.Details.Tools.AddTool.description.placeholder',
                            defaultMessage: 'Enter a brief description of what this tool does',
                        })}
                        fullWidth
                        margin='dense'
                        variant='outlined'
                        error={newTool.errors.description}
                        helperText={newTool.errors.description ? 
                            intl.formatMessage({
                                id: 'MCPServers.Details.Tools.AddTool.description.error',
                                defaultMessage: 'Description is required and cannot be empty',
                            }) : ''
                        }
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>

                <Grid item md={2} xs={12}>
                    <Box 
                        display='flex' 
                        flexDirection='row' 
                        alignItems='center' 
                        justifyContent='center'
                        height='100%'
                        gap={1}
                    >
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='MCPServers.Details.Tools.AddTool.add.tooltip'
                                    defaultMessage='Add new tool'
                                />
                            )}
                            placement='bottom'
                            interactive
                        >
                            <span>
                                <Fab
                                    size='small'
                                    color='primary'
                                    aria-label='Add new tool'
                                    onClick={addTool}
                                    id='add-tool-button'
                                >
                                    <AddIcon />
                                </Fab>
                            </span>
                        </Tooltip>
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='MCPServers.Details.Tools.AddTool.clear.inputs.tooltip'
                                    defaultMessage='Clear inputs'
                                />
                            )}
                            placement='bottom'
                            interactive
                        >
                            <span>
                                <IconButton 
                                    onClick={clearInputs} 
                                    size='small' 
                                    aria-label='clear-inputs'
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.08)'
                                        }
                                    }}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                </Grid>
            </Grid>
        </StyledPaper>
    );
}

AddTool.propTypes = {
    operationsDispatcher: PropTypes.func.isRequired,
    availableOperations: PropTypes.arrayOf(PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        description: PropTypes.string,
    })).isRequired,
    api: PropTypes.shape({}).isRequired,
};

export default React.memo(AddTool);
