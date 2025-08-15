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

import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import APIRateLimiting from 'AppComponents/Apis/Details/Resources/components/APIRateLimiting';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import Configurations from 'Config';
import Banner from 'AppComponents/Shared/Banner';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SaveOperations from 'AppComponents/Apis/Details/Resources/components/SaveOperations';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import cloneDeep from 'lodash.clonedeep';
import Alert from 'AppComponents/Shared/Alert';
import { isRestricted } from 'AppData/AuthManager';
import CircularProgress from '@mui/material/CircularProgress';
import isEmpty from 'lodash/isEmpty';
import { Progress } from 'AppComponents/Shared';
import {
    mapAPIOperations,
} from 'AppComponents/Apis/Details/Resources/operationUtils';
import OperationsSelector from 'AppComponents/Apis/Details/Resources/components/OperationsSelector';
import AddTool from './components/AddTool';
import ToolDetails from './components/ToolDetails';

const PREFIX = 'Tools';

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    subHeading: `${PREFIX}-subHeading`,
    toolBox: `${PREFIX}-toolBox`,
}

const Root = styled('div')(({
    theme
}) => ({
    [`& .${classes.root}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    [`& .${classes.heading}`]: {
        marginRight: 20,
    },

    [`& .${classes.subHeading}`]: {
        color: theme.palette.primary.dark,
    },

    [`& .${classes.toolBox}`]: {
        padding: theme.spacing(1),
        margin: theme.spacing(1),
        backgroundColor: theme.custom.mcpToolBar.backgroundColor,
        border: theme.custom.mcpToolBar.border,
    }
}));

const Tools = ({
    disableRateLimiting,
    disableUpdate,
    disableAddOperation,
}) => {
    const { data: publisherSettings, isLoading } = usePublisherSettings();
    const [api, updateAPI] = useAPI();
    const [pageError, setPageError] = useState(false);
    const [operationRateLimits, setOperationRateLimits] = useState([]);
    const [markedOperations, setSelectedOperation] = useState({});
    const [mcpEndpoints, setMcpEndpoints] = useState([]);
    const [availableOperations, setAvailableOperations] = useState([]);
    const [sharedScopes, setSharedScopes] = useState();
    // const [sharedScopesByName, setSharedScopesByName] = useState();
    // const [securityDefScopes, setSecurityDefScopes] = useState({});
    const [throttlingPolicy, setThrottlingPolicy] = useState(api.throttlingPolicy);
    // const [resolvedSpec, setResolvedSpec] = useState({ spec: {}, errors: [] });
    const [focusOperationLevel, setFocusOperationLevel] = useState(false);
    const [expandedResource, setExpandedResource] = useState('');
    const [componentValidator, setComponentValidator] = useState([]);

    const intl = useIntl();

    useEffect(() => {
        if (api.apitype !== 'APIProduct') {
            const maxScopeLimit = Configurations.apis.maxScopeCount;
            API.getAllScopes(0, maxScopeLimit)
                .then((response) => {
                    if (response.body && response.body.list) {
                        const sharedScopesList = [];
                        const sharedScopesByNameList = {};
                        const shared = true;
                        for (const scope of response.body.list) {
                            const modifiedScope = {};
                            modifiedScope.scope = scope;
                            modifiedScope.shared = shared;
                            sharedScopesList.push(modifiedScope);
                            sharedScopesByNameList[scope.name] = modifiedScope;
                        }
                        setSharedScopes(sharedScopesList);
                        // setSharedScopesByName(sharedScopesByNameList);
                    }
                });
        }
    }, []);

    /**
     * Generate a static ID for an operation based on target and verb
     * @param {string} target - The operation target
     * @param {string} verb - The operation verb
     * @returns {string} - The generated ID
     */
    function generateOperationId(target, verb) {
        return `tool_${target}_${verb}`;
    }

    /**
     * Create operation object from API operation data
     * @param {Object} operation - The operation data from API
     * @returns {Object} - The formatted operation object
     */
    function createOperationFromAPI(operation) {
        const operationName = operation.target || operation.id;
        if (!operationName) return null;
        
        return {
            id: operation.id || generateOperationId(operation.target, operation.verb || 'GET'),
            target: operation.target,
            feature: 'TOOL',
            name: operation.target,
            description: operation.description || '',
            'x-auth-type': operation.authType || 'Application & Application User',
            throttlingPolicy: operation.throttlingPolicy || 'Unlimited',
            'x-throttling-tier': operation.throttlingPolicy || 'Unlimited',
            schemaDefinition: operation.schemaDefinition,
            backendOperationMapping: operation.backendOperationMapping,
            apiOperationMapping: operation.apiOperationMapping,
            scopes: operation.scopes || [],
            'x-wso2-new': false
        };
    }

    /**
     * Operations reducer for MCP tools management
     * @param {Object} currentOperations Current state
     * @param {Object} operationAction action and payload  
     * @return {Object} next next state
     */
    function operationsReducer(currentOperations, operationAction) {
        const { action, data } = operationAction;
        const { target, value } = data || {};
        let updatedOperation;
        let updatedOperations;

        switch (action) {
            case 'init': {
                setSelectedOperation({});
                if (data) {
                    return data;
                }
                // Fall back to initial state from API object
                const operationsMap = {};
                if (api.operations && api.operations.length > 0) {
                    api.operations.forEach(operation => {
                        const formattedOperation = createOperationFromAPI(operation);
                        if (formattedOperation) {
                            operationsMap[formattedOperation.target] = formattedOperation;
                        }
                    });
                }
                return operationsMap;
            }
            case 'removeAllSecurity':
                setSelectedOperation({});
                return Object.entries(currentOperations).reduce((acc, [key, operation]) => {
                    const newOperation = { ...operation, 'x-auth-type': data.disable ? 'None' : 'Any' };
                    return { ...acc, [key]: newOperation };
                }, {});
            case 'description':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    updatedOperation.description = value; // Update description field for API structure
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'name':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    updatedOperation.target = value; // Update target field for API structure
                    // Keep the same key to prevent accordion from closing/rearranging
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'authType':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    updatedOperation['x-auth-type'] = value ? 'Any' : 'None';
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'throttlingPolicy':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    updatedOperation.throttlingPolicy = value;
                    updatedOperation['x-throttling-tier'] = value;
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'scopes':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    if (!updatedOperation.security) {
                        updatedOperation.security = [{ default: [] }];
                    } else if (!updatedOperation.security.find((item) => item.default)) {
                        updatedOperation.security.push({ default: [] });
                    }
                    const defValue = value[0] || value;
                    updatedOperation.scopes = Array.isArray(defValue)
                        ? defValue : [defValue];
                    updatedOperation.security.find((item) => item.default).default = updatedOperation.scopes;
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'updateBackendOperation':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    if (!updatedOperation.backendOperationMapping) {
                        updatedOperation.backendOperationMapping = {};
                    }
                    updatedOperation.backendOperationMapping.backendOperation = data.backendOperation;
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'updateApiOperation':
                if (target) {
                    updatedOperation = cloneDeep(currentOperations[target]);
                    if (!updatedOperation.apiOperationMapping) {
                        updatedOperation.apiOperationMapping = {};
                    }
                    updatedOperation.apiOperationMapping.backendOperation = data.apiOperation;
                    return { ...currentOperations, [target]: updatedOperation };
                }
                break;
            case 'add': {
                const { name, description, selectedOperation } = data;
                if (!name || !selectedOperation) {
                    Alert.warning(intl.formatMessage({
                        id: 'MCPServers.Details.Tools.add.validation.error',
                        defaultMessage: 'Tool name and operation selection are required',
                    }));
                    return currentOperations;
                }

                // Check if tool with this name already exists
                if (currentOperations[name]) {
                    Alert.warning(intl.formatMessage({
                        id: 'MCPServers.Details.Tools.add.already.exists.error',
                        defaultMessage: 'Tool with name "{name}" already exists',
                    }, { name }));
                    return currentOperations;
                }

                updatedOperations = cloneDeep(currentOperations);
                // Generate a static ID for the operation based on target and verb
                const operationId = generateOperationId(selectedOperation.target, selectedOperation.verb);

                // Determine which type of mapping to create based on MCP server type
                const isFromExistingAPI = api.isMCPServerFromExistingAPI();

                updatedOperations[name] = {
                    id: operationId,
                    'x-wso2-new': true,
                    'x-auth-type': 'Application & Application User',
                    target: name,
                    feature: 'TOOL',
                    description: description || '',
                    summary: name,
                    throttlingPolicy: 'Unlimited',
                    scopes: [],
                    backendOperationMapping: isFromExistingAPI ? null : {
                        backendId: '',
                        backendOperation: {
                            target: selectedOperation.target,
                            verb: selectedOperation.verb
                        }
                    },
                    apiOperationMapping: isFromExistingAPI ? {
                        apiId: api.operations?.[0]?.apiOperationMapping?.apiId || '',
                        apiName: api.operations?.[0]?.apiOperationMapping?.apiName || '',
                        apiVersion: api.operations?.[0]?.apiOperationMapping?.apiVersion || '',
                        backendOperation: {
                            target: selectedOperation.target,
                            verb: selectedOperation.verb
                        }
                    } : null
                };
                return updatedOperations;
            }
            default:
                return currentOperations;
        }
        return currentOperations;
    }

    // Operations state management
    const [operations, operationsDispatcher] = useReducer(operationsReducer, {});

    /**
     * Filter out operations that are already added to the MCP server
     * @param {Array} availableOps - Array of available operations
     * @param {Object} currentOps - Current operations in the MCP server
     * @param {string} excludeTarget - Optional target to exclude from filtering (for editing)
     * @returns {Array} - Filtered available operations
     */
    function filterAlreadyAddedOperations(availableOps, currentOps, excludeTarget = null) {
        if (!availableOps || !Array.isArray(availableOps)) {
            return [];
        }

        const currentOperationKeys = new Set();
        
        // Collect all current operation targets and their verb-target combinations
        Object.entries(currentOps).forEach(([target, operation]) => {
            // Skip the operation being edited - this allows the current operation to remain available
            if (excludeTarget && target === excludeTarget) {
                return;
            }
            
            // Add verb-target combinations from backend mappings
            if (operation.backendOperationMapping?.backendOperation) {
                const backendOp = operation.backendOperationMapping.backendOperation;
                const key = `${backendOp.verb}_${backendOp.target}`;
                currentOperationKeys.add(key);
                // Also add just the target for broader matching in some cases
                currentOperationKeys.add(backendOp.target);
            }
            
            // Add verb-target combinations from API mappings
            if (operation.apiOperationMapping?.backendOperation) {
                const apiOp = operation.apiOperationMapping.backendOperation;
                const key = `${apiOp.verb}_${apiOp.target}`;
                currentOperationKeys.add(key);
                // Also add just the target for broader matching in some cases
                currentOperationKeys.add(apiOp.target);
            }
        });

        // Filter out operations that are already added
        return availableOps.filter(operation => {
            const verbTargetKey = `${operation.verb}_${operation.target}`;
            const targetKey = operation.target;
            
            // Check if this operation is already used by another tool
            // We check both the precise verb-target combination and just the target
            return !currentOperationKeys.has(verbTargetKey) && !currentOperationKeys.has(targetKey);
        });
    }

    /**
     * Get filtered available operations for components
     * This function dynamically filters based on current operations state,
     * ensuring that when a tool's operation mapping is updated, the old operation
     * becomes available again and the new operation is removed from available options.
     * 
     * @param {string} excludeTarget - Optional target to exclude from filtering (for editing)
     * @returns {Array} - Filtered available operations
     */
    function getFilteredAvailableOperations(excludeTarget = null) {
        return filterAlreadyAddedOperations(availableOperations, operations, excludeTarget);
    }

    const enableSecurity = () => {
        operationsDispatcher({ action: 'removeAllSecurity', data: { disable: false } });
    };
    const disableSecurity = () => {
        operationsDispatcher({ action: 'removeAllSecurity', data: { disable: true } });
    };

    /**
     * Transform tools operations to the format expected by OperationsSelector
     * @param {Object} toolsOperations - The flat tools operations object
     * @returns {Object} - Transformed operations in nested format
     */
    function transformOperationsForSelector(toolsOperations) {
        const transformed = {};
        Object.entries(toolsOperations).forEach(([target, operation]) => {
            // Create a nested structure with a default verb for tools
            transformed[target] = {
                TOOL: operation
            };
        });
        return transformed;
    }

    /**
     * Transform marked operations to the format expected by OperationsSelector
     * @param {Object} markedOps - The flat marked operations object
     * @returns {Object} - Transformed marked operations in nested format
     */
    function transformMarkedOperationsForSelector(markedOps) {
        const transformed = {};
        Object.entries(markedOps).forEach(([target, isMarked]) => {
            if (isMarked) {
                transformed[target] = {
                    TOOL: true
                };
            }
        });
        return transformed;
    }

    /**
     * Handle operations selection from OperationsSelector
     * @param {Object} selectedOps - The selected operations in nested format
     */
    function handleOperationsSelection(selectedOps) {
        const flatSelected = {};
        Object.entries(selectedOps).forEach(([target, verbObj]) => {
            if (verbObj.TOOL) {
                flatSelected[target] = true;
            }
        });
        setSelectedOperation(flatSelected);
    }

    /**
     * Handle marking tools for deletion
     * @param {Object} operation - The operation object with target
     * @param {boolean} checked - Whether to mark for deletion
     */
    function onMarkAsDelete(operation, checked) {
        const { target } = operation;
        setSelectedOperation((currentSelections) => {
            const nextSelectedOperations = cloneDeep(currentSelections);
            if (checked) {
                nextSelectedOperations[target] = true;
            } else {
                delete nextSelectedOperations[target];
            }
            return nextSelectedOperations;
        });
    }

    /**
     * Fetch available operations from MCP Server endpoints
     */
    function fetchAvailableOperations() {
        if (api.isMCPServerFromExistingAPI()) {
            const underlyingApiId = api.operations?.[0]?.apiOperationMapping?.apiId;
            if (!underlyingApiId) {
                console.error('No underlying API ID found for MCP server created from existing API');
                Alert.error(intl.formatMessage({
                    id: 'MCPServers.Details.Tools.fetch.underlying.api.error',
                    defaultMessage: 'No underlying API found for this MCP server',
                }));
                return;
            }
            API.getAPIById(underlyingApiId)
                .then((response) => {
                    const underlyingApi = response.body;
                    setAvailableOperations(underlyingApi.operations);
                })
                .catch((error) => {
                    console.error('Error fetching underlying API:', error);
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Details.Tools.fetch.underlying.api.error',
                        defaultMessage: 'Error fetching underlying API operations',
                    }));
                });
        } else {
            MCPServer.getMCPServerEndpoints(api.id)
                .then((response) => {
                    const endpoints = response.body;
                    if (endpoints && endpoints.length > 0) {
                        const operationsTemp = [];
                        endpoints.forEach(endpoint => {
                            try {
                                const apiDefinition = typeof endpoint.definition === 'string'
                                    ? JSON.parse(endpoint.definition)
                                    : endpoint.definition;

                                if (api.isMCPServerFromProxy()) {
                                    // For MCP Server Proxy, extract tools from definition
                                    if (apiDefinition && apiDefinition.tools && Array.isArray(apiDefinition.tools)) {
                                        apiDefinition.tools.forEach(tool => {
                                            operationsTemp.push({
                                                target: tool.name,
                                                verb: 'TOOL',
                                                summary: tool.name,
                                                description: tool.description || ''
                                            });
                                        });
                                    }
                                } else if (apiDefinition && apiDefinition.paths) {
                                    // For other MCP Server types, extract operations from paths
                                    Object.entries(apiDefinition.paths).forEach(([path, pathObj]) => {
                                        Object.entries(pathObj).forEach(
                                            ([verb, operation]) => {
                                                if (
                                                    [
                                                        'get',
                                                        'post',
                                                        'put',
                                                        'patch',
                                                        'delete'
                                                    ].includes(verb.toLowerCase())
                                                ) {
                                                    operationsTemp.push({
                                                        target: path,
                                                        verb: verb.toUpperCase(),
                                                        summary:
                                                            operation.summary ||
                                                            `${verb.toUpperCase()} ${path}`,
                                                        description: operation.description || ''
                                                    });
                                                }
                                            });
                                    });
                                }
                            } catch (error) {
                                console.error('Error parsing API definition:', error);
                            }
                        });
                        setAvailableOperations(operationsTemp);
                        setMcpEndpoints(endpoints);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching MCP Server endpoints:', error);
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Details.Tools.fetch.endpoints.error',
                        defaultMessage: 'Error fetching available operations from MCP Server',
                    }));
                });
        }
    }

    const localAPI = useMemo(
        () => ({
            id: api.id,
            throttlingPolicy,
            scopes: api.scopes,
            operations: api.isAPIProduct() ? {} : mapAPIOperations(api.operations),
            endpointConfig: mcpEndpoints.endpointConfig,
        }),
        [api, throttlingPolicy, mcpEndpoints],
    );


    /**
     * Initialize operations from API object
     */
    function initializeOperations() {
        const operationsMap = {};
        if (api.operations && api.operations.length > 0) {
            api.operations.forEach(operation => {
                const formattedOperation = createOperationFromAPI(operation);
                if (formattedOperation) {
                    operationsMap[formattedOperation.target] = formattedOperation;
                }
            });
        }
        operationsDispatcher({ action: 'init', data: operationsMap });
    }

    /**
     * Update MCP Server tools using API update
     * @param {Object} toolsOperations Updated tools operations
     * @returns {Promise} Promise resolving to updated API object
     */
    function updateMCPServerTools(toolsOperations) {
        console.log('Updating MCP Server tools with operations:', toolsOperations);
        const operationsArray = Object.entries(toolsOperations).map(([name, operation]) => {
            const mappedOperation = {
                id: operation.id || '',
                target: operation.target || name,
                feature: 'TOOL',
                authType: operation['x-auth-type'] || 'Application & Application User',
                throttlingPolicy: operation.throttlingPolicy || 'Unlimited',
                description: operation.description || '',
                schemaDefinition: operation.schemaDefinition,
                scopes: operation.scopes || [],
                payloadSchema: operation.payloadSchema || null,
                uriMapping: operation.uriMapping || null,
                operationPolicies: operation.operationPolicies || {
                    request: [],
                    response: [],
                    fault: []
                },
                backendOperationMapping: operation.apiOperationMapping ? null : (operation.backendOperationMapping || {
                    backendId: operation.backendOperationMapping?.backendId || (mcpEndpoints?.[0]?.id || ''),
                    backendOperation: {
                        target: operation.backendOperationMapping?.backendOperation?.target || operation.target || name,
                        verb: operation.backendOperationMapping?.backendOperation?.verb || 'GET'
                    }
                }),
                apiOperationMapping: operation.apiOperationMapping || null
            };
            console.log(`Mapped operation for ${name}:`, mappedOperation);
            return mappedOperation;
        });

        return updateAPI({ operations: operationsArray })
            .then((updatedApi) => {
                // Update local operations state with the response from API
                const operationsMap = {};
                if (updatedApi.operations && updatedApi.operations.length > 0) {
                    updatedApi.operations.forEach(operation => {
                        const formattedOperation = createOperationFromAPI(operation);
                        if (formattedOperation) {
                            operationsMap[formattedOperation.target] = formattedOperation;
                        }
                    });
                }
                operationsDispatcher({ action: 'init', data: operationsMap });
                
                // Clear marked operations after successful update
                setSelectedOperation({});
                
                return updatedApi;
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'MCPServers.Details.Tools.update.error',
                    defaultMessage: 'Error while updating MCP Server tools',
                }));
                throw error;
            });
    }

    /**
     * Save the MCP Server tools changes
     * @param {String} type Type of operation
     * @returns {Promise} Promise resolving to updated MCP Server
     */
    function apiUpdateCall(type) {
        const copyOfOperations = cloneDeep(operations);
        switch (type) {
            case 'save': {
                // Check if all operations are marked for deletion
                const operationKeys = Object.keys(copyOfOperations);
                const markedKeys = Object.keys(markedOperations);
                if (markedKeys.length === operationKeys.length && operationKeys.length > 0) {
                    const message = intl.formatMessage({
                        id: 'MCPServers.Details.Tools.operation.required',
                        defaultMessage: 'At least one tool is required for an MCP Server',
                    });
                    return Promise.reject(new Error(message));
                }

                // Remove marked operations
                for (const target of Object.keys(markedOperations)) {
                    delete copyOfOperations[target];
                }

                // Remove x-wso2-new flag from newly added operations
                for (const [, operationInfo] of Object.entries(copyOfOperations)) {
                    if (operationInfo['x-wso2-new']) {
                        delete operationInfo['x-wso2-new'];
                    }
                }
                break;
            }
            default:
                return Promise.reject(new Error('Unsupported tool operation!'));
        }

        if (throttlingPolicy !== api.throttlingPolicy) {
            return updateAPI({ throttlingPolicy })
                .then((updatedApi) => {
                    setThrottlingPolicy(updatedApi.throttlingPolicy);
                    return updatedApi;
                })
                .catch((error) => {
                    console.error(error);
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Details.Tools.api.update.error',
                        defaultMessage: 'Error while updating the MCP Server',
                    }));
                    throw error;
                })
                .then(() => updateMCPServerTools(copyOfOperations));
        } else {
            return updateMCPServerTools(copyOfOperations);
        }
    }

    useEffect(() => {
        // Initialize operations from MCP Server API object
        initializeOperations();

        // Fetch available operations from MCP Server endpoints
        fetchAvailableOperations();

        // Fetch throttling policies for MCP Server
        const limit = Configurations.app.throttlingPolicyLimit;
        if (typeof API.policies === 'function') {
            API.policies('api', limit)
                .then((response) => {
                    setOperationRateLimits(response.body.list);
                })
                .catch(() => {
                    // Fallback to default if method fails
                    setOperationRateLimits([]);
                });
        } else {
            // Fallback to default if MCPServer doesn't have policies method
            setOperationRateLimits([]);
        }
    }, [api.id]);

    useEffect(() => {
        if (!isLoading) {
            const validator = publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].resources;
            setComponentValidator(Array.isArray(validator) ? validator : []);
        }
    }, [isLoading, publisherSettings, api.gatewayType]);

    useEffect(() => {
        setThrottlingPolicy(api.throttlingPolicy);
    }, [api.throttlingPolicy]);

    useEffect(() => {
        // Sync local throttlingPolicy state with API context when API loads or changes
        if (api.id && api.throttlingPolicy !== throttlingPolicy) {
            setThrottlingPolicy(api.throttlingPolicy);
        }
    }, [api.id, api.throttlingPolicy]);

    if (!pageError && (isEmpty(operations) && availableOperations.length === 0)) {
        return (
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                <Grid item>
                    <CircularProgress disableShrink />
                </Grid>
            </Grid>
        );
    }
    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }

    return (
        <Root>
            <Grid container direction='row' justifyContent='flex-start' spacing={2} alignItems='stretch'>
                {pageError && (
                    <Grid item md={12}>
                        <Banner onClose={() => setPageError(null)} disableActions type='error' message={pageError} />
                    </Grid>
                )}
                {!disableRateLimiting && (
                    <Grid item md={12}>
                        <APIRateLimiting
                            api={api}
                            operationRateLimits={operationRateLimits}
                            value={throttlingPolicy}
                            onChange={setThrottlingPolicy}
                            isAPIProduct={false}
                            focusOperationLevel={focusOperationLevel}
                            setFocusOperationLevel={setFocusOperationLevel}
                        />
                    </Grid>
                )}
                {!isRestricted(['apim:api_create'], api) && !disableAddOperation && (
                    <Grid item md={12} xs={12}>
                        <AddTool
                            operationsDispatcher={operationsDispatcher}
                            availableOperations={getFilteredAvailableOperations()}
                            api={api}
                        />
                    </Grid>
                )}
                <Grid item md={12}>
                    <Paper sx={{ paddingY: 1 }}>
                        {Object.keys(operations).length === 0 ? (
                            <Grid item md={12}>
                                <Box p={3} textAlign='center'>
                                    <Typography variant='body1' color='textSecondary'>
                                        <FormattedMessage
                                            id='MCPServers.Details.Tools.no.tools.message'
                                            defaultMessage='No tools available. Add a tool to get started.'
                                        />
                                    </Typography>
                                </Box>
                            </Grid>
                        ) : (
                            <>
                                <OperationsSelector
                                    operations={transformOperationsForSelector(operations)}
                                    selectedOperations={transformMarkedOperationsForSelector(markedOperations)}
                                    setSelectedOperation={handleOperationsSelection}
                                    enableSecurity={enableSecurity}
                                    disableSecurity={disableSecurity}
                                    componentValidator={componentValidator}
                                />
                                {Object.entries(operations).map(([target, operation]) => (
                                    <Grid key={operation.id || target} item md={12}>
                                        <ToolDetails
                                            target={target}
                                            feature={operation.feature || 'TOOL'}
                                            operation={operation}
                                            operationsDispatcher={operationsDispatcher}
                                            api={localAPI}
                                            disableUpdate={disableUpdate}
                                            markedOperations={markedOperations}
                                            onMarkAsDelete={onMarkAsDelete}
                                            markAsDelete={Boolean(markedOperations[target])}
                                            spec={{}}
                                            operationRateLimits={operationRateLimits}
                                            sharedScopes={sharedScopes}
                                            setFocusOperationLevel={setFocusOperationLevel}
                                            expandedResource={expandedResource}
                                            setExpandedResource={setExpandedResource}
                                            componentValidator={componentValidator}
                                            resourcePolicy={{}}
                                            resolvedSpec={{}}
                                            highlight={false}
                                            disableDelete={false}
                                            availableOperations={getFilteredAvailableOperations(target)}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}
                    </Paper>
                    <Grid
                        style={{ marginTop: '25px' }}
                        container
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                    >
                        <Grid item>
                            {!disableUpdate && (
                                <SaveOperations
                                    operationsDispatcher={operationsDispatcher}
                                    updateOpenAPI={apiUpdateCall}
                                    api={api}
                                />
                            )}
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>
        </Root>
    );
}

Tools.defaultProps = {
    disableUpdate: false,
    disableRateLimiting: false,
    disableAddOperation: false,
}

Tools.propTypes = {
    disableRateLimiting: PropTypes.bool,
    disableAddOperation: PropTypes.bool,
    disableUpdate: PropTypes.bool,
}

export default Tools;
