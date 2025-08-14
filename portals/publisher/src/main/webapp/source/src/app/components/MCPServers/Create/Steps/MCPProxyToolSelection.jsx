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

import React, { useState, useCallback, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { FormattedMessage, useIntl } from 'react-intl';
import debounce from 'lodash.debounce';
import MCPServer from 'AppData/MCPServer';
import MethodView from 'AppComponents/Apis/Details/ProductResources/MethodView';
import TransferList from './components/TransferList';

const PREFIX = 'MCPProxyToolSelection';

const classes = {
    root: `${PREFIX}-root`,
    methodView: `${PREFIX}-methodView`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        width: '100%',
    },
    [`& .${classes.methodView}`]: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
}));

/**
 * MCP Proxy Tool Selection Component
 * Handles URL validation and tool selection for MCP Proxy servers
 */
const MCPProxyToolSelection = ({ onValidate, apiInputs, inputsDispatcher }) => {
    // Safety check to prevent crashes if apiInputs is undefined
    if (!apiInputs) {
        console.warn('MCPProxyToolSelection: apiInputs is undefined');
        return null;
    }
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [toolInfo, setToolInfo] = useState(null);
    const intl = useIntl();

    // Operation cleaner function to remove display properties and add backendOperationMapping
    const operationCleaner = (operations) => {
        return operations.map(operation => {
            const { verb, target, id, ...cleanOperation } = operation;
            return {
                ...cleanOperation,
                backendOperationMapping: {
                    backendId: "",
                    backendOperation: {
                        target: operation.target,
                        verb: "TOOL"
                    }
                }
            };
        });
    };

    // Custom hook state for tool selection without validation side effects
    const [checked, setChecked] = useState([]);
    const [availableOperations, setAvailableOperations] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);

    const getCheckedItemsInList = (items, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => {
        const itemKeys = items.map(itemKeyExtractor);
        return itemKeys.filter(key => checked.includes(key));
    };

    const handleToggle = (value, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => () => {
        const valueKey = itemKeyExtractor(value);
        if (checked.includes(valueKey)) {
            setChecked(prev => prev.filter(key => key !== valueKey));
        } else {
            setChecked(prev => [...prev, valueKey]);
        }
    };

    const numberOfChecked = (items, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => {
        const itemKeys = items.map(itemKeyExtractor);
        return itemKeys.filter(key => checked.includes(key)).length;
    };

    const handleToggleAll = (items, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => () => {
        const itemKeys = items.map(itemKeyExtractor);
        const currentChecked = numberOfChecked(items, itemKeyExtractor);
        
        if (currentChecked === items.length) {
            // All are checked, uncheck all of them from this list
            setChecked(prev => prev.filter(key => !itemKeys.includes(key)));
        } else {
            // Not all are checked, check all of them from this list
            setChecked(prev => [...new Set([...prev, ...itemKeys])]);
        }
    };

    const handleCheckedObjectsRight = () => {
        const itemsToMove = availableOperations.filter(item => 
            checked.includes(`${item.verb}-${item.target}`)
        );
        setSelectedOperations(prev => [...prev, ...itemsToMove]);
        setAvailableOperations(prev => 
            prev.filter(item => !checked.includes(`${item.verb}-${item.target}`))
        );
        setChecked(prev => 
            prev.filter(key => !itemsToMove.some(item => `${item.verb}-${item.target}` === key))
        );
    };

    const handleCheckedObjectsLeft = () => {
        const itemsToMove = selectedOperations.filter(item => 
            checked.includes(`${item.verb}-${item.target}`)
        );
        setAvailableOperations(prev => [...prev, ...itemsToMove]);
        setSelectedOperations(prev => 
            prev.filter(item => !checked.includes(`${item.verb}-${item.target}`))
        );
        setChecked(prev => 
            prev.filter(key => !itemsToMove.some(item => `${item.verb}-${item.target}` === key))
        );
    };

    const updateAvailableOperations = (newOperations) => {
        setAvailableOperations(newOperations);
        setSelectedOperations([]);
        setChecked([]);
    };

    // Dispatch selected operations to parent and validate form
    useEffect(() => {
        const cleanedOperations = operationCleaner(selectedOperations);
        inputsDispatcher({ action: 'operations', value: cleanedOperations });
        
        const hasValidUrl = apiInputs?.mcpServerUrl && !validationError && toolInfo;
        const hasSelectedOperations = selectedOperations.length > 0;
        onValidate(hasValidUrl && hasSelectedOperations);
    }, [apiInputs?.mcpServerUrl, validationError, toolInfo, selectedOperations,
        onValidate, inputsDispatcher, operationCleaner]);

    // Debounced URL validation function
    const validateURLDebounced = useCallback(
        debounce(async (url) => {
            if (!url || url.trim() === '') {
                setValidationError(null);
                setToolInfo(null);
                updateAvailableOperations([]);
                return;
            }

            setIsValidating(true);
            setValidationError(null);

            try {
                const response = await MCPServer.validateThirdPartyMCPServerUrl(url);
                const { body } = response;

                if (body.isValid) {
                    // Set the endpoint URL for step 2 (with /mcp appended)
                    inputsDispatcher({ action: 'endpointUrl', value: url });
                    
                    // Extract tool information from the response
                    if (body.toolInfo && body.toolInfo.operations) {
                        const tools = body.toolInfo.operations.map(operation => ({
                            id: `${operation.target}`,
                            verb: 'POST', // MCP tools are typically POST operations
                            target: operation.target,
                            description: operation.description,
                            schemaDefinition: operation.schemaDefinition,
                            feature: operation.feature,
                            authType: operation.authType,
                            scopes: operation.scopes,
                        }));
                        
                        setToolInfo(body.toolInfo);
                        updateAvailableOperations(tools);
                    } else {
                        setToolInfo(null);
                        updateAvailableOperations([]);
                    }
                } else {
                    setValidationError(body.errorMessage || 'Invalid MCP Server URL');
                    setToolInfo(null);
                    updateAvailableOperations([]);
                }
            } catch (error) {
                console.error('Error validating MCP Server URL:', error);
                setValidationError('Failed to validate MCP Server URL');
                setToolInfo(null);
                updateAvailableOperations([]);
            } finally {
                setIsValidating(false);
            }
        }, 500),
        [updateAvailableOperations]
    );

    // Handle URL input change
    const handleUrlChange = (event) => {
        const { value } = event.target;
        // Store the original value (without /mcp) in the text field
        inputsDispatcher({ action: 'mcpServerUrl', value });
        
        // Append '/mcp' internally for validation
        const urlWithMCP = value.endsWith('/mcp') ? value : value + '/mcp';
        validateURLDebounced(urlWithMCP);
    };

    // Handle URL blur
    const handleUrlBlur = (event) => {
        const { value } = event.target;
        // Append '/mcp' internally for validation
        const urlWithMCP = value.endsWith('/mcp') ? value : value + '/mcp';
        validateURLDebounced(urlWithMCP);
    };

    // Custom render function for MCP tools - using same style as default renderItem
    const renderToolItem = (tool) => (
        <div>
            <MethodView
                method='TOOL'
                className={classes.methodView}
            />
            <span>{tool.target}</span>
        </div>
    );

    // URL validation end adornment
    const getEndAdornment = () => {
        if (isValidating) {
            return <CircularProgress size={20} />;
        }
        if (validationError) {
            return <ErrorOutlineIcon color='error' />;
        }
        if (toolInfo) {
            return <CheckIcon color='success' />;
        }
        return null;
    };

    const urlStateEndAdornment = (
        <InputAdornment position='end'>
            {getEndAdornment()}
        </InputAdornment>
    );

    return (
        <Root>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        autoFocus
                        id='mcp-server-url'
                        label={intl.formatMessage({
                            id: 'MCPServers.Create.MCPProxyToolSelection.url.label',
                            defaultMessage: 'MCP Server URL',
                        })}
                        placeholder={intl.formatMessage({
                            id: 'MCPServers.Create.MCPProxyToolSelection.url.placeholder',
                            defaultMessage: 'Enter MCP Server URL',
                        })}
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={apiInputs?.mcpServerUrl || ''}
                        onChange={handleUrlChange}
                        onBlur={handleUrlBlur}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            endAdornment: urlStateEndAdornment,
                        }}
                        helperText={
                            validationError || (
                                <FormattedMessage
                                    id='MCPServers.Create.MCPProxyToolSelection.url.helper.text'
                                    defaultMessage='Click away to validate the URL'
                                />
                            )
                        }
                        error={!!validationError}
                        data-testid='mcp-server-url-input'
                    />
                </Grid>
            </Grid>

            {toolInfo && (availableOperations.length > 0 || selectedOperations.length > 0) && (
                <TransferList
                    availableOperations={availableOperations}
                    selectedOperations={selectedOperations}
                    checked={checked}
                    onToggle={handleToggle}
                    onToggleAll={handleToggleAll}
                    onMoveRight={handleCheckedObjectsRight}
                    onMoveLeft={handleCheckedObjectsLeft}
                    getCheckedItemsInList={getCheckedItemsInList}
                    numberOfChecked={numberOfChecked}
                    leftTitle='Available Tools'
                    rightTitle='Selected Tools'
                    renderItem={renderToolItem}
                    keyExtractor={(item) => `${item.verb}-${item.target}`}
                />
            )}
        </Root>
    );
};

MCPProxyToolSelection.propTypes = {
    onValidate: PropTypes.func.isRequired,
    apiInputs: PropTypes.shape({
        inputValue: PropTypes.string,
        endpointUrl: PropTypes.string,
        operations: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            parameters: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
            })),
        })),
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
};

export default MCPProxyToolSelection;
