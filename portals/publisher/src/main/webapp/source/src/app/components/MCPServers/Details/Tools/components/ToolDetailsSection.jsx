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

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';
import { FormattedMessage } from 'react-intl';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import OperationSelector from './OperationSelector';

// load Monaco from node_modules instead of CDN
loader.config({ monaco });

/**
 * Tool Details Component (Name, Description, Schema, Resource Mapping)
 * @param {object} props - Component props
 * @param {object} props.operation - The operation object
 * @param {Function} props.operationsDispatcher - Function to dispatch operation updates
 * @param {boolean} props.disableUpdate - Whether updates are disabled
 * @param {string} props.target - The target string
 * @param {string} props.feature - The feature string
 * @param {Array} props.availableOperations - Array of available operations
 * @returns {React.Component} Tool details section component
 */
function ToolDetailsSection({
    operation, operationsDispatcher, disableUpdate, target, feature, availableOperations
}) {
    const { api } = useContext(APIContext);

    /**
     * Format schema definition as JSON if it's not already formatted
     * @param {string} schemaDefinition - The schema definition string
     * @returns {string} - Formatted JSON string
     */
    const formatJsonSchema = (schemaDefinition) => {
        if (!schemaDefinition) return '';
        
        try {
            // If it's already a string, try to parse and format it
            if (typeof schemaDefinition === 'string') {
                const parsed = JSON.parse(schemaDefinition);
                return JSON.stringify(parsed, null, 2);
            }
            // If it's already an object, stringify it with formatting
            if (typeof schemaDefinition === 'object') {
                return JSON.stringify(schemaDefinition, null, 2);
            }
            // Fallback to string representation
            return String(schemaDefinition);
        } catch (error) {
            // If parsing fails, return the original string
            console.warn('Failed to format schema definition as JSON:', error);
            return String(schemaDefinition);
        }
    };

    // Get current selected operation for the OperationSelector component
    const getCurrentSelectedOperation = () => {
        if (operation.backendOperationMapping && operation.backendOperationMapping.backendOperation) {
            const backendOp = operation.backendOperationMapping.backendOperation;
            return availableOperations.find(op =>
                op.target === backendOp.target && op.verb === backendOp.verb
            ) || null;
        }
        if (operation.apiOperationMapping && operation.apiOperationMapping.backendOperation) {
            const apiOp = operation.apiOperationMapping.backendOperation;
            return availableOperations.find(op =>
                op.target === apiOp.target && op.verb === apiOp.verb
            ) || null;
        }
        return null;
    };

    // Determine if this is an MCP Server Proxy to show appropriate labels
    const isMCPServerProxy = api && api.isMCPServerFromProxy();
    
    // Set appropriate labels based on MCP Server type
    const selectorLabel = isMCPServerProxy ? 'Tool' : 'Operation';
    const selectorPlaceholder = isMCPServerProxy ? 'Select a tool' : 'Select an operation';

    const editorOptions = {
        selectOnLineNumbers: true,
        readOnly: true,
        smoothScrolling: true,
        wordWrap: 'on',
    };

    return (
        <Grid
            item
            xs={12}
            sx={{ marginY: 1 }}
        >
            <Typography variant='subtitle1' gutterBottom>
                <FormattedMessage
                    id='Apis.Details.Resources.components.Operation.Tool.Details'
                    defaultMessage='Tool Details'
                />
            </Typography>
            <Divider variant='middle' />
            <Grid container spacing={3} px={3} mt={1}>
                <Grid item xs={6}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={
                                    <FormattedMessage
                                        id='Apis.Details.Resources.components.Operation.Name'
                                        defaultMessage='Name'
                                    />
                                }
                                value={operation.target || target || ''}
                                disabled={disableUpdate}
                                variant='outlined'
                                onChange={({ target: { value } }) => operationsDispatcher({
                                    action: 'name',
                                    data: { target, feature, value },
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <OperationSelector
                                availableOperations={availableOperations}
                                value={getCurrentSelectedOperation()}
                                onChange={(selectedOp) => {
                                    if (selectedOp) {
                                        // Determine which type of mapping to update based on the operation structure
                                        const isFromExistingAPI = operation.apiOperationMapping && 
                                            operation.apiOperationMapping.apiId;
                                        
                                        if (isFromExistingAPI) {
                                            // For MCP servers created from existing APIs, 
                                            // update apiOperationMapping
                                            operationsDispatcher({
                                                action: 'updateApiOperation',
                                                data: {
                                                    target,
                                                    feature,
                                                    apiOperation: {
                                                        target: selectedOp.target,
                                                        verb: selectedOp.verb
                                                    }
                                                },
                                            });
                                        } else {
                                            // For MCP servers created from backend definitions,
                                            // update backendOperationMapping
                                            operationsDispatcher({
                                                action: 'updateBackendOperation',
                                                data: {
                                                    target,
                                                    feature,
                                                    backendOperation: {
                                                        target: selectedOp.target,
                                                        verb: selectedOp.verb
                                                    }
                                                },
                                            });
                                        }
                                    }
                                }}
                                disabled={disableUpdate}
                                fullWidth
                                margin='dense'
                                variant='outlined'
                                label={selectorLabel}
                                placeholder={selectorPlaceholder}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography
                                variant='subtitle2'
                                gutterBottom
                                sx={{
                                    fontWeight: 400,
                                    color: 'black'
                                }}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.Operation.Schema'
                                    defaultMessage='Schema'
                                />
                            </Typography>
                            <Box
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    padding: 2,
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                {operation.schemaDefinition ? (
                                    <MonacoEditor
                                        language='json'
                                        width='100%'
                                        height='200px'
                                        theme='vs-light'
                                        value={formatJsonSchema(operation.schemaDefinition)}
                                        options={editorOptions}
                                    />
                                ) : (
                                    <Typography variant='body2' color='textSecondary'>
                                        <FormattedMessage
                                            id='Apis.Details.Resources.components.Operation.Schema.Not.Available'
                                            defaultMessage='No schema definition available'
                                        />
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={6}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={
                                    <FormattedMessage
                                        id='Apis.Details.Resources.Operation.Components.Description'
                                        defaultMessage='Description'
                                    />
                                }
                                value={operation.description || ''}
                                disabled={disableUpdate}
                                variant='outlined'
                                multiline
                                rows={5}
                                onChange={({ target: { value } }) => operationsDispatcher({
                                    action: 'description',
                                    data: { target, feature, value },
                                })}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

ToolDetailsSection.propTypes = {
    operation: PropTypes.shape({
        name: PropTypes.string,
        target: PropTypes.string,
        description: PropTypes.string,
        schemaDefinition: PropTypes.string,
        backendOperationMapping: PropTypes.shape({
            backendOperation: PropTypes.shape({
                verb: PropTypes.string,
                target: PropTypes.string,
            }),
        }),
        apiOperationMapping: PropTypes.shape({
            apiId: PropTypes.string,
            apiName: PropTypes.string,
            apiVersion: PropTypes.string,
            backendOperation: PropTypes.shape({
                verb: PropTypes.string,
                target: PropTypes.string,
            }),
        }),
    }).isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    disableUpdate: PropTypes.bool.isRequired,
    target: PropTypes.string.isRequired,
    feature: PropTypes.string.isRequired,
    availableOperations: PropTypes.arrayOf(PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        summary: PropTypes.string,
        description: PropTypes.string,
    })).isRequired,
};

export default React.memo(ToolDetailsSection);
