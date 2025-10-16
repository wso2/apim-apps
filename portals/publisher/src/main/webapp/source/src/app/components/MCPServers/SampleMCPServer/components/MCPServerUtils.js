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

import AuthManager from 'AppData/AuthManager';

/**
 * Common permission scopes for MCP Server operations
 */
export const MCP_SERVER_SCOPES = {
    CREATE_MANAGE: [
        'apim:mcp_server_create',
        'apim:mcp_server_manage',
    ],
    CREATE_MANAGE_PUBLISH: [
        'apim:mcp_server_create',
        'apim:mcp_server_manage',
        'apim:mcp_server_publish',
    ],
    CREATE_MANAGE_PUBLISH_IMPORT: [
        'apim:mcp_server_create',
        'apim:mcp_server_manage',
        'apim:mcp_server_publish',
        'apim:mcp_server_import_export',
    ],
    PUBLISH_MANAGE_IMPORT: [
        'apim:mcp_server_publish',
        'apim:mcp_server_manage',
        'apim:mcp_server_import_export',
    ],
};

/**
 * Check if user has restricted permissions for given scopes
 * @param {Array} scopes - Array of required scopes
 * @returns {boolean} - True if user is restricted
 */
export const isRestrictedForScopes = (scopes) => {
    return AuthManager.isRestricted(scopes);
};

/**
 * Mark tasks as completed with permission error
 * @param {Function} tasksStatusDispatcher - Function to dispatch task status updates
 * @param {Array} taskNames - Array of task names to mark as completed
 * @param {string} errorMessage - Error message to display
 */
export const markTasksAsCompletedWithError = (tasksStatusDispatcher, taskNames, errorMessage) => {
    taskNames.forEach(taskName => {
        tasksStatusDispatcher({ 
            name: taskName, 
            status: { 
                completed: true, 
                errors: errorMessage 
            } 
        });
    });
};

/**
 * Get environment list from publisher settings
 * @param {Object} publisherSettings - Publisher settings object
 * @returns {Array} - Array of internal gateway environments
 */
export const getInternalGateways = (publisherSettings) => {
    return publisherSettings && publisherSettings.environment.filter((p) => p.provider
        && p.provider.toLowerCase().includes('wso2'));
};

/**
 * Build deployment payload for revision
 * @param {Array} internalGateways - Array of internal gateways
 * @returns {Array} - Deployment payload array
 */
export const buildDeploymentPayload = (internalGateways) => {
    const envList = internalGateways.map((env) => env.name);
    const deployRevisionPayload = [];
    
    const getFirstVhost = (envName) => {
        const env = internalGateways.find(
            (ev) => ev.name === envName && ev.mode !== 'READ_ONLY' && ev.vhosts.length > 0,
        );
        return env && env.vhosts[0].host;
    };
    
    if (envList && envList.length > 0) {
        if (envList.includes('Default') && getFirstVhost('Default')) {
            deployRevisionPayload.push({
                name: 'Default',
                displayOnDevportal: true,
                vhost: getFirstVhost('Default'),
            });
        } else if (getFirstVhost(envList[0])) {
            deployRevisionPayload.push({
                name: envList[0],
                displayOnDevportal: true,
                vhost: getFirstVhost(envList[0]),
            });
        }
    }
    
    return deployRevisionPayload;
};

/**
 * Convert OpenAPI definition to File object for binary upload
 * @param {Object} openAPIDefinition - OpenAPI definition object
 * @param {string} filename - Name of the file
 * @returns {File} - File object for upload
 */
export const convertOpenAPIToFile = (openAPIDefinition, filename = 'sample-mcp-server.yaml') => {
    const openAPIContent = JSON.stringify(openAPIDefinition, null, 2);
    return new File([openAPIContent], filename, {
        type: 'application/x-yaml',
    });
};
