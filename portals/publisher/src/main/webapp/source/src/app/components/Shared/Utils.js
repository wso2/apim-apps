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

import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import CONSTS from 'AppData/Constants';

/**
 * Get the base path for API routing based on the API type
 * @param {string} type - The type of the API
 * @returns {string} The base path for routing
 */
export const getBasePath = (type = '') => {
    const upperCaseType = (type ?? '').toUpperCase();
    if (upperCaseType === 'APIPRODUCT') {
        return '/api-products/';
    } else if (upperCaseType === 'MCP') {
        return '/mcp-servers/';
    } else {
        return '/apis/';
    }
};

/**
 * Get the type of the API to display
 * @param {string} type - The type of the API
 * @returns {string} The type of the API to display
 */
export const getTypeToDisplay = (type) => {
    if (type === 'APIPRODUCT') {
        return 'API Product';
    } else if (type === 'MCP') {
        return 'MCP Server';
    } else {
        return 'API';
    }
};

/**
 * Helper function to check endpoint status (production or sandbox)
 * @param {string} endpointId - The endpoint ID
 * @param {string} endpointType - The endpoint type (production/sandbox)
 * @param {Object} config - The configuration object
 * @param {Object} api - The API object
 * @returns {Promise<Object>} Object with isUrlPresent and isSecure properties
 */
export const verifyEndpointUrlAndSecurity = async (endpointId, endpointType, config, api) => {
    const isDefaultEndpoint = endpointId === CONSTS.DEFAULT_ENDPOINT_ID[endpointType];
    
    if (isDefaultEndpoint) {
        return {
            isUrlPresent: !!api.endpointConfig?.[endpointType.toLowerCase() + '_endpoints']?.url,
            isSecure: config?.enabled 
                ? !!api.endpointConfig?.endpoint_security?.[endpointType.toLowerCase()] 
                : true
        };
    } else {
        const endpoint = await API.getApiEndpoint(api.id, endpointId);
        const endpointConfig = endpoint?.body?.endpointConfig;
        
        return {
            isUrlPresent: !!endpointConfig?.[endpointType.toLowerCase() + '_endpoints']?.url,
            isSecure: config?.enabled 
                ? !!endpointConfig?.endpoint_security?.[endpointType.toLowerCase()] 
                : true
        };
    }
};

/**
 * Function to check both URL availability and security configuration
 * @param {Object} api - The API object
 * @param {Object} config - The configuration object
 * @returns {Promise<boolean>} True if endpoint configuration is valid
 */
export const checkEndpointConfiguration = async (api, config) => {
    try {
        const hasProductionEndpoint = !!api.primaryProductionEndpointId;
        const hasSandboxEndpoint = !!api.primarySandboxEndpointId;
        
        let productionResult = null;
        let sandboxResult = null;

        // Check production endpoint if it exists
        if (hasProductionEndpoint) {
            productionResult = await verifyEndpointUrlAndSecurity(
                api.primaryProductionEndpointId, 
                CONSTS.DEPLOYMENT_STAGE.production, 
                config,
                api
            );
        }

        // Check sandbox endpoint if it exists
        if (hasSandboxEndpoint) {
            sandboxResult = await verifyEndpointUrlAndSecurity(
                api.primarySandboxEndpointId, 
                CONSTS.DEPLOYMENT_STAGE.sandbox, 
                config,
                api
            );
        }

        // Determine overall availability and security
        let isAvailable = false;
        let isSecurityConfigured = false;

        if (hasProductionEndpoint && hasSandboxEndpoint) {
            isAvailable = productionResult.isUrlPresent && sandboxResult.isUrlPresent;
            isSecurityConfigured = productionResult.isSecure && sandboxResult.isSecure;
        } else if (hasProductionEndpoint) {
            isAvailable = productionResult.isUrlPresent;
            isSecurityConfigured = productionResult.isSecure;
        } else if (hasSandboxEndpoint) {
            isAvailable = sandboxResult.isUrlPresent;
            isSecurityConfigured = sandboxResult.isSecure;
        }

        return isAvailable && isSecurityConfigured;
    } catch (error) {
        console.error('Error checking endpoint configuration:', error);
        return false;
    }
};

/**
 * Unified function to check endpoint availability and security
 * @param {Object} api - The API object
 * @returns {Promise<boolean>} True if endpoint is ready
 */
export const checkEndpointStatus = async (api) => {
    try {
        let isEndpointReady = false;
        const isMCPServer = api.isMCPServer();

        if (isMCPServer) {
            // For MCP servers, check if endpoints are available
            if (api.isMCPServerFromExistingAPI()) {
                isEndpointReady = true;
            } else {
                const response = await MCPServer.getMCPServerEndpoints(api.id);
                const fetchedEndpoints = response.body;
                isEndpointReady = fetchedEndpoints && fetchedEndpoints.length > 0;
            }
        } else if (api.subtypeConfiguration?.subtype === 'AIAPI') {
            // For AI APIs, both URL availability and security must be ready
            const hasPrimaryEndpoints = api.primaryProductionEndpointId !== null || 
                api.primarySandboxEndpointId !== null;
            
            if (hasPrimaryEndpoints) {
                const response = await API.getLLMProviderEndpointConfiguration(
                    JSON.parse(api.subtypeConfiguration.configuration).llmProviderId
                );
                const config = response.body?.authenticationConfiguration;
                
                // Use optimized function to check both URL availability and security
                isEndpointReady = await checkEndpointConfiguration(api, config);
            }
        } else {
            // For regular APIs, endpoint configuration presence is sufficient
            isEndpointReady = api.endpointConfig !== null;
        }

        return isEndpointReady;
    } catch (error) {
        console.error('Error checking endpoint status:', error);
        return false;
    }
};
