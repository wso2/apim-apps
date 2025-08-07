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
    const [apiThrottlingPolicy, setApiThrottlingPolicy] = useState(api.apiThrottlingPolicy);
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
            case 'init':
                setSelectedOperation({});
                return data || {};
            // case 'removeAllSecurity':
            //     setSelectedOperation({});
            //     return Object.entries(currentOperations).reduce((acc, [key, operation]) => {
            //         const newOperation = { ...operation, 'x-auth-type': data.disable ? 'None' : 'Any' };
            //         return { ...acc, [key]: newOperation };
            //     }, {});
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
                    if (!updatedOperation.backendAPIOperationMapping) {
                        updatedOperation.backendAPIOperationMapping = {};
                    }
                    updatedOperation.backendAPIOperationMapping.backendOperation = data.backendOperation;
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
                // Generate a ID for the operation
                const operationId = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                updatedOperations[name] = {
                    id: operationId,
                    'x-wso2-new': true,
                    'x-auth-type': 'Application & Application User',
                    target: name,
                    verb: 'tool',
                    description: description || '',
                    summary: name,
                    throttlingPolicy: 'Unlimited',
                    scopes: [],
                    backendAPIOperationMapping: {
                        backendAPIId: '',
                        backendOperation: {
                            target: selectedOperation.target,
                            verb: selectedOperation.verb
                        }
                    }
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
     * Fetch available operations from MCP Server endpoints
     */
    function fetchAvailableOperations() {
        MCPServer.getMCPServerEndpoints(api.id)
            .then((response) => {
                const endpoints = response.body;
                if (endpoints && endpoints.length > 0) {
                    const operationsTemp = [];
                    endpoints.forEach(endpoint => {
                        try {
                            const apiDefinition = typeof endpoint.apiDefinition === 'string'
                                ? JSON.parse(endpoint.apiDefinition)
                                : endpoint.apiDefinition;

                            if (apiDefinition && apiDefinition.paths) {
                                Object.entries(apiDefinition.paths).forEach(([path, pathObj]) => {
                                    Object.entries(pathObj).forEach(([verb, operation]) => {
                                        if (['get', 'post', 'put', 'patch', 'delete'].includes(verb.toLowerCase())) {
                                            operationsTemp.push({
                                                target: path,
                                                verb: verb.toUpperCase(),
                                                summary: operation.summary || `${verb.toUpperCase()} ${path}`,
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

    const localAPI = useMemo(
        () => ({
            id: api.id,
            apiThrottlingPolicy,
            scopes: api.scopes,
            operations: api.isAPIProduct() ? {} : mapAPIOperations(api.operations),
            endpointConfig: mcpEndpoints.endpointConfig,
        }),
        [api, apiThrottlingPolicy, mcpEndpoints],
    );


    /**
     * Initialize operations from API object
     */
    function initializeOperations() {
        const operationsMap = {};
        if (api.operations && api.operations.length > 0) {
            api.operations.forEach(operation => {
                const operationName = operation.target || operation.id;
                if (operationName) {
                    operationsMap[operationName] = {
                        id: operation.id || `existing_${operationName}_${Date.now()}`,
                        target: operation.target,
                        verb: 'tool',
                        name: operation.target,
                        description: operation.description || '',
                        'x-auth-type': operation.authType || 'Application & Application User',
                        throttlingPolicy: operation.throttlingPolicy || 'Unlimited',
                        'x-throttling-tier': operation.throttlingPolicy || 'Unlimited',
                        schemaDefinition: operation.schemaDefinition,
                        backendAPIOperationMapping: operation.backendAPIOperationMapping,
                        scopes: operation.scopes || [],
                        'x-wso2-new': false
                    };
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
        const operationsArray = Object.entries(toolsOperations).map(([name, operation]) => ({
            id: operation.id || '',
            target: operation.target || name,
            verb: 'tool',
            authType: operation['x-auth-type'] || 'Application & Application User',
            throttlingPolicy: operation.throttlingPolicy || 'Unlimited',
            description: operation.description || '',
            schemaDefinition: operation.schemaDefinition,
            scopes: operation.scopes || [],
            usedProductIds: operation.usedProductIds || [],
            amznResourceName: operation.amznResourceName || null,
            amznResourceTimeout: operation.amznResourceTimeout || null,
            amznResourceContentEncode: operation.amznResourceContentEncode || null,
            payloadSchema: operation.payloadSchema || null,
            uriMapping: operation.uriMapping || null,
            operationPolicies: operation.operationPolicies || {
                request: [],
                response: [],
                fault: []
            },
            backendAPIOperationMapping: operation.backendAPIOperationMapping || {
                backendAPIId: operation.backendAPIOperationMapping?.backendAPIId || mcpEndpoints[0]?.id || '',
                backendOperation: {
                    target: operation.backendAPIOperationMapping?.backendOperation?.target || operation.target || name,
                    verb: operation.backendAPIOperationMapping?.backendOperation?.verb || 'GET'
                }
            },
            // apiOperationMapping: operation.apiOperationMapping || null
        }));

        return updateAPI({ operations: operationsArray })
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

        if (apiThrottlingPolicy !== api.apiThrottlingPolicy) {
            return updateAPI({ apiThrottlingPolicy })
                .then((updatedApi) => {
                    setApiThrottlingPolicy(updatedApi.apiThrottlingPolicy);
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
            setComponentValidator(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].resources);
        }
    }, [isLoading]);

    useEffect(() => {
        setApiThrottlingPolicy(api.apiThrottlingPolicy);
    }, [api.apiThrottlingPolicy]);

    useEffect(() => {
        // Sync local apiThrottlingPolicy state with API context when API loads or changes
        if (api.id && api.apiThrottlingPolicy !== apiThrottlingPolicy) {
            setApiThrottlingPolicy(api.apiThrottlingPolicy);
        }
    }, [api.id, api.apiThrottlingPolicy]);

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
                            value={apiThrottlingPolicy}
                            onChange={setApiThrottlingPolicy}
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
                            availableOperations={availableOperations}
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
                            Object.entries(operations).map(([target, operation]) => (
                                <Grid key={operation.id || target} item md={12}>
                                    <ToolDetails
                                        target={target}
                                        verb={operation.verb || 'tool'}
                                        operation={operation}
                                        operationsDispatcher={operationsDispatcher}
                                        api={localAPI}
                                        disableUpdate={disableUpdate}
                                        markedOperations={markedOperations}
                                        onMarkAsDelete={setSelectedOperation}
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
                                        availableOperations={availableOperations}
                                    />
                                </Grid>
                            ))
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
    // operationProps: { disableDelete: false },
    disableUpdate: false,
    disableRateLimiting: false,
    // disableMultiSelect: false,
    disableAddOperation: false,
}

Tools.propTypes = {
    disableRateLimiting: PropTypes.bool,
    // disableMultiSelect: PropTypes.bool,
    disableAddOperation: PropTypes.bool,
    disableUpdate: PropTypes.bool,
    // operationProps: PropTypes.shape({
    //     disableDelete: PropTypes.bool,
    // }),
}

export default Tools;
