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
import cloneDeep from 'lodash.clonedeep';
import APIClientFactory from './APIClientFactory';
import Utils from './Utils';
import Resource from './Resource';

const Configurations = require('Config');

/**
 * An abstract representation of an MCP Server.
 */
class MCPServer extends Resource {
    /**
     * Creates an instance of MCPServer.
     * @param {string} name - The name of the MCP Server.
     * @param {string} [version] - The version of the MCP Server.
     * @param {string} [context] - The context of the MCP Server.
     * @param {Object} [kwargs] - Additional properties for the MCP Server.
     */
    constructor(name, version, context, kwargs) {
        super();
        let properties = kwargs;
        if (name instanceof Object) {
            properties = name;
        } else {
            this.name = name;
            this.version = version;
            this.context = context;
            this.isDefaultVersion = false;
            this.transport = ['http', 'https'];
            this.visibility = 'PUBLIC';
            this.endpointConfig = {
                endpoint_type: 'http',
                sandbox_endpoints: {
                    url: '',
                },
                production_endpoints: {
                    url: '',
                },
            };
        }
        this._data = properties;
        for (const key in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, key)) {
                this[key] = properties[key];
            }
        }
        this.type = MCPServer.CONSTS.MCP;
        this.apiType = MCPServer.CONSTS.MCP;
    }

    static CONSTS = {
        MCP: 'MCP',
    };

    /**
     * Request metadata for MCP Server.
     * This method is used to fetch metadata related to the MCP Server.
     * It is a private method and should not be called directly.
     * Instead, use the static method `Resource._requestMetaData()`.
     * @private
     */
    _requestMetaData() {
        // eslint-disable-next-line no-underscore-dangle
        Resource._requestMetaData();
    }

    /**
     *
     * Instance method of the API class to provide raw JSON object
     * which is API body friendly to use with REST api requests
     * Use this method instead of accessing the private _data object for
     * converting to a JSON representation of an API object.
     * Note: This is deep coping, Use sparingly, Else will have a bad impact on performance
     * Basically this is the revers operation in constructor.
     * This method simply iterate through all the object properties (excluding the properties in `excludes` list)
     * and copy their values to new object.
     * So use this method with care!!
     * @memberof API
     * @param {Array} [userExcludes=[]] List of properties that are need to be excluded from the generated JSON object
     * @returns {JSON} JSON representation of the API
     */
    toJSON(userExcludes = []) {
        const copy = {};
        const excludes = ['_data', 'client', 'apiType', ...userExcludes];

        for (const prop in this) {
            if (!excludes.includes(prop)) {
                copy[prop] = cloneDeep(this[prop]);
            }
        }

        return copy;
    }

    /**
     * Create a new MCP Server using an OpenAPI file.
     * @param {*} openAPIData - The OpenAPI data to use.
     * @returns {Promise<MCPServer>} A promise that resolves to the created MCPServer instance.
     */
    createMCPServerUsingOpenAPIFile(openAPIData) {
        let payload;
        const promisedCreate = this.client.then(client => {
            const apiData = this.getDataFromSpecFields(client);

            payload = {
                requestBody: {
                    file: openAPIData,
                    additionalProperties: JSON.stringify(apiData),
                }
            };

            const promisedResponse = client.apis['MCP Servers'].createMCPServerFromOpenAPI(
                null,
                payload,
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
            return promisedResponse.then(response => new MCPServer(response.body));
        });
        return promisedCreate;
    }

    /**
     * Create a new MCP Server using an OpenAPI URL.
     * @param {*} openAPIUrl - The OpenAPI URL to use.
     * @returns {Promise<MCPServer>} A promise that resolves to the created MCPServer instance.
     */
    createMCPServerUsingOpenAPIUrl(openAPIUrl) {
        let payload;
        const promisedCreate = this.client.then(client => {
            const apiData = this.getDataFromSpecFields(client);

            payload = {
                requestBody: {
                    url: openAPIUrl,
                    additionalProperties: JSON.stringify(apiData),
                }
            };

            const promisedResponse = client.apis['MCP Servers'].createMCPServerFromOpenAPI(
                null,
                payload,
                this._requestMetaData({
                    'Content-Type': 'application/json',
                }),
            );
            return promisedResponse.then(response => new MCPServer(response.body));
        });
        return promisedCreate;
    }

    /**
     * Create a new MCP Server using an existing API.
     * @returns {Promise<MCPServer>} A promise that resolves to the created MCPServer instance.
     */
    createMCPServerUsingExistingAPI() {
        const promisedCreate = this.client.then(client => {
            const apiData = this.getDataFromSpecFields(client);
            const data = {};

            Object.keys(this).forEach(apiAttribute => {
                if (apiAttribute in apiData) {
                    data[apiAttribute] = this[apiAttribute];
                }
            });

            return client.apis['MCP Servers'].createMCPServerFromAPI(
                { 'Content-Type': 'application/json' },
                { requestBody: data },
                this._requestMetaData(),
            );
        });
        return promisedCreate.then(response => {
            return new MCPServer(response.body);
        });
    }

    /**
     * Create a new MCP Server using an MCP Server URL.
     * @param {string} mcpServerUrl - The URL of the MCP Server to create.
     * @returns {Promise<MCPServer>} A promise that resolves to the created MCPServer instance.
     */
    createMCPServerUsingMCPServerURL(mcpServerUrl) {
        let payload;
        const promisedCreate = this.client.then(client => {
            const apiData = this.getDataFromSpecFields(client);

            payload = {
                requestBody: {
                    url: mcpServerUrl,
                    additionalProperties: apiData,
                    securityInfo: {
                        isSecure: false,
                        header: '',
                        value: ''
                    }
                }
            };

            const promisedResponse = client.apis['MCP Servers'].createMCPServerProxy(
                null,
                payload,
                this._requestMetaData({
                    'Content-Type': 'application/json',
                }),
            );
            return promisedResponse.then(response => new MCPServer(response.body));
        });
        return promisedCreate;
    }

    /**
     * Validate an OpenAPI file.
     * This method is used to validate an OpenAPI file before creating an MCP Server.
     * @param {*} openAPIData - The OpenAPI data to validate.
     * @returns {Promise} A promise that resolves to the validation result.
     */
    static validateOpenAPIByFile(openAPIData) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            const payload = {
                file: openAPIData,
                'Content-Type': 'multipart/form-data',
            };
            const requestBody = {
                requestBody: {
                    file: openAPIData,
                },
            };
            return client.apis.Validation.validateOpenAPIDefinitionOfMCPServer(
                payload,
                requestBody,
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }

    /**
     * Validate an OpenAPI URL.
     * This method is used to validate an OpenAPI URL before creating an MCP Server.
     * @param {string} url - The OpenAPI URL to validate.
     * @param {Object} [params={ returnContent: false }] - Additional parameters for validation.
     * @returns {Promise} A promise that resolves to the validation result.
     */
    static validateOpenAPIByUrl(url, params = { returnContent: false}) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            const payload = {
                'Content-Type': 'multipart/form-data',
                ...params
            };
            const requestBody = {
                requestBody: {
                    url,
                },
            };
            return client.apis.Validation.validateOpenAPIDefinitionOfMCPServer(
                payload,
                requestBody,
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }

    /**
     * Validate the MCP Server URL.
     * @param {string} url - The URL of the MCP Server to validate.
     * @returns {Promise} A promise that resolves to the validation result.
     */
    static validateThirdPartyMCPServerUrl(url) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            const payload = {
                'Content-Type': 'multipart/form-data',
            }
            const requestBody = {
                requestBody: {
                    url,
                    securityInfo: {
                        isSecure: false,
                        header: '',
                        value: ''
                    }
                }
            };
            return client.apis.Validation.validateThirdPartyMCPServer(
                payload,
                requestBody,
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }

    /**
     * Validate the MCP Server parameters for existence. (MCP Server name, context)
     * @param {string} query The parameters that should be validated.
     * @return {boolean} True if the MCP Server parameters are valid, false otherwise.
     */
    static validateMCPServerParameter(query) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis.Validation.validateMCPServer({ query })
                .then(resp => {
                    return resp.ok;
                })
                .catch(() => {
                    return false;
                });
        });
    }

    /**
     * Get all MCP Servers.
     * @param {*} params - The parameters for the request.
     * @returns {Promise<Array<MCPServer>>} A promise that resolves to an array of MCPServer instances.
     */
    static all(params) {
        let updatedQuery = '';
        if (params && 'query' in params) {
            Object.entries(params.query).forEach(([key, value], index) => {
                const property = `${key}:${value}`;
                updatedQuery += property;
                if (Object.entries(params.query).length !== index + 1) {
                    updatedQuery += ' ';
                }
            });
        }

        const updatedParams = {
            ...params,
            query: updatedQuery,
        }

        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promisedAPIs = apiClient.then(client => {
            // eslint-disable-next-line no-underscore-dangle
            return client.apis['MCP Servers'].getAllMCPServers(updatedParams, Resource._requestMetaData());
        });

        return promisedAPIs.then(response => {
            response.obj.apiType = MCPServer.CONSTS.MCP;

            // for each MCP Server, set the apiType attribute
            response.body.list = response.body.list.map(mcpServer => ({
                ...mcpServer,
                apiType: MCPServer.CONSTS.MCP,
            }));

            return response;
        });
    }

    /**
     * Get an MCP Server by its ID.
     * @param {*} id ID of the MCP Server.
     * @returns {Promise<MCPServer>} A promise that resolves to the MCPServer instance.
     */
    static getMCPServerById(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promisedAPI = apiClient.then(client => {
            return client.apis['MCP Servers'].getMCPServer(
                {
                    mcpServerId: id,
                },
                this._requestMetaData(),
            );
        });
        return promisedAPI.then(response => {
            if (response.body === null || response.body === undefined) {
                throw new Error(`MCP Server with ID ${id} not found.`);
            }
            return new MCPServer(response.body);
        });
    }

    /**
     * Update an MCP Server.
     * @param {Object} updatedProperties - The updated properties for the MCP Server.
     * @returns {Promise<MCPServer>} A promise that resolves to the updated MCPServer
     */
    updateMCPServer(updatedProperties) {
        const updatedMCPServer = { ...this.toJSON(), ...updatedProperties };
        // Remove type field from the final payload
        const { type, ...finalPayload } = updatedMCPServer;
        const promisedUpdate = this.client.then(client => {
            const payload = {
                mcpServerId: finalPayload.id,
            };
            const requestBody = {
                requestBody: finalPayload,
            }
            return client.apis['MCP Servers'].updateMCPServer(
                payload,
                requestBody,
                this._requestMetaData(),
            );
        })
        return promisedUpdate.then(response => {
            return new MCPServer(response.body);
        })
    }

    /**
     * Delete an MCP Server given its ID.
     * @param {String} id - The ID of the MCP Server to delete.
     * @returns {Promise} A promise that resolves when the MCP Server is deleted.
     */
    static deleteMCPServer(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Servers'].deleteMCPServer(
                {
                    mcpServerId: id,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * To get MCPServer object with the fields filled as per the definition
     * @param {Object} client Client object after resolving this.client.then()
     * @returns {Object} MCP Server Object corresponding to spec fields
     * @memberof MCPServer
     */
    getDataFromSpecFields(client) {
        const {properties} = client.spec.components.schemas.API;
        const data = {};
        Object.keys(this).forEach(apiAttribute => {
            if ((apiAttribute in properties)
                && apiAttribute !== 'type') {
                data[apiAttribute] = this[apiAttribute];
            }
        });
        return data;
    }

    /**
     * Get list of revisions.
     *
     * @param {string} id ID of the MCP Server.
     * @return {Promise} A promise that resolves to the list of revisions.
     * */
    static getRevisions(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].getMCPServerRevisions({
                mcpServerId: id,
            });
        });
    }

    /**
     * Get list of revisions with environments.
     *
     * @param {string} id ID of the MCP Server.
     * @return {Promise} A promise that resolves to the list of revisions with environments.
     * */
    static getRevisionsWithEnv(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].getMCPServerRevisions(
                {
                    mcpServerId: id,
                    query: 'deployed:true',
                },
            );
        });
    }

    /**
     * Create a new revision for an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {Object} revisionBody - The body of the revision to create.
     * @returns {Promise} A promise that resolves to the created revision.
     */
    static createRevision(mcpServerId, revisionBody) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].createMCPServerRevision(
                {
                    mcpServerId,
                },
                {
                    requestBody: revisionBody,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a revision of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {string} revisionId - The ID of the revision to delete.
     * @returns {Promise} A promise that resolves to the response of the delete operation.
     */
    static deleteRevision(mcpServerId, revisionId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].deleteMCPServerRevision(
                {
                    mcpServerId,
                    revisionId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Restore revision.
     *
     * @param {string} id ID of the MCP Server.
     * @param {string} revisionId ID of the revision to restore.
     * @returns {Promise} A promise that resolves to the restored revision.
     * */
    static restoreRevision(id, revisionId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].restoreMCPServerRevision(
                {
                    mcpServerId: id,
                    revisionId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get the endpoints of an MCP Server.
     * @param {string} id - The ID of the MCP Server.
     * @returns {Promise} A promise that resolves to the list of endpoints.
     */
    static getMCPServerEndpoints(id) {
        const restApiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return restApiClient.then(client => {
            return client.apis['MCP Server Backends'].getMCPServerBackends(
                {
                    mcpServerId: id,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get an endpoint of the MCP Server
     * @param {String} id ID of the MCP Server
     * @param {String} endpointId UUID of the endpoint
     * @returns {Promise} Promise containing the requested endpoint
     * */
    static getMCPServerEndpoint(id, endpointId) {
        const restApiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return restApiClient.then(client => {
            return client.apis['MCP Server Backends'].getMCPServerBackend(
                {
                    mcpServerId: id,
                    backendId: endpointId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an backend of the MCP Server
     * @param {String} id UUID of the MCP Server
     * @param {String} endpointId UUID of the endpoint
     * @param {Object} backendBody Updated backend object
     * @returns {Promise} Promise containing the updated backend
     */
    static updateMCPServerBackend(id, endpointId, backendBody) {
        const restApiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return restApiClient.then(client => {
            return client.apis['MCP Server Backends'].updateMCPServerBackend(
                {
                    mcpServerId: id,
                    backendId: endpointId,
                },
                {
                    requestBody: backendBody,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update the life cycle state of an MCP Server given its id (UUID)
     * @param {string} id UUID of the MCP Server
     * @param {string} state Target state which need to be transferred
     * @param {Array} checkedItems List of checked items in the lifecycle checklist
     * @param {function} callback Callback function which needs to be executed in the success call
     * @returns {Promise} A promise that resolves to the updated MCP Server lifecycle state.
     */
    static updateLcState(id, state, checkedItems, callback = null) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const payload = {
            action: state,
            mcpServerId: id,
            lifecycleChecklist: checkedItems,
            'Content-Type': 'application/json',
        };
        const promiseLcUpdate = apiClient.then(client => {
            return client.apis['MCP Server Lifecycle'].changeMCPServerLifecycle(payload, this._requestMetaData());
        });
        if (callback) {
            return promiseLcUpdate.then(callback);
        } else {
            return promiseLcUpdate;
        }
    }

    /**
     * Get the life cycle state of an MCP Server given its id (UUID)
     * @param {string} id UUID of the MCP Server
     * @returns {Promise} A promise that resolves to the MCP Server lifecycle state.
     */
    static getMCPServerLcState(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promiseLcGet = apiClient.then(client => {
            return client.apis['MCP Server Lifecycle'].getMCPServerLifecycleState(
                {
                    mcpServerId: id,
                },
                this._requestMetaData(),
            );
        });
        return promiseLcGet;
    }

    /**
     * Get the life cycle history data of an MCP Server given its id (UUID)
     * @param id {string} UUID of the MCP Server
     * @return {Promise} A promise that resolves to the MCP Server lifecycle history.
     */
    static getMCPServerLcHistory(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promiseLcHistoryGet = apiClient.then(client => {
            return client.apis['MCP Server Lifecycle'].getMCPServerLifecycleHistory(
                {
                    mcpServerId: id,
                },
                this._requestMetaData(),
            );
        });
        return promiseLcHistoryGet;
    }

    /**
     * Clean pending tasks of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @returns {Promise} A promise that resolves to the response of the clean pending tasks request.
     */
    static cancelLifecyclePendingTask(mcpServerId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Lifecycle'].deleteMCPServerLifecycleStatePendingTasks(
                {
                    mcpServerId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Test the endpoint of an MCP Server.
     * @param {string} endpointUrl - The URL of the endpoint to test.
     * @param {string} id - The ID of the MCP Server.   
     * @return {Promise} A promise that resolves to the response of the endpoint validation.
     */
    static testEndpoint(endpointUrl, id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis.Validation.validateMCPServerEndpoint(
                {
                    mcpServerId: id,
                    endpointUrl,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Deploy a revision of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {string} revisionId - The ID of the revision to deploy.
     * @param {Object} body - The request body containing deployment information.
     * @returns {Promise} A promise that resolves to the response of the deployment request.
     */
    static deployRevision(mcpServerId, revisionId, body) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].deployMCPServerRevision(
                {
                    mcpServerId,
                    revisionId,
                },
                {
                    requestBody: body,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Undeploy a revision of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {string} revisionId - The ID of the revision to undeploy.
     * @param {Object} body - The request body containing undeployment information.
     * @returns {Promise} A promise that resolves to the response of the undeployment request.
     */
    static undeployRevision(mcpServerId, revisionId, body) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].undeployMCPServerRevision(
                {
                    mcpServerId,
                    revisionId,
                },
                {
                    requestBody: body,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get the settings of the MCP Server.
     * @returns {Promise<Object>} A promise that resolves to the settings of the MCP Server.
     */
    getSettings() {
        const promisedSettings = this.client.then(client => {
            return client.apis.Settings.getSettings();
        });
        return promisedSettings.then(response => response.body);
    }

    /**
     * Get settings of an MCP Server.
     * @returns {Promise<Object>} A promise that resolves to the settings of the MCP Server
     */
    static getSettings() {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promisedSettings = apiClient.then(client => {
            return client.apis.Settings.getSettings();
        });
        return promisedSettings.then(response => response.body);
    }

    /**
     * Validate if a document exists in an MCP Server
     * @param {string} id - The ID of the MCP Server
     * @param {string} name - The name of the document
     * @returns {Promise} A promise that resolves to the validation result
     */
    static validateDocumentExists(id, name) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].validateMCPServerDocument({
                mcpServerId: id,
                name,
            }, this._requestMetaData());
        });
    }

    /**
     * Add a document to an MCP Server
     * @param {string} id - The ID of the MCP Server
     * @param {string} name - The name of the document
     * @param {Object} body - The request body containing the document data
     * @returns {Promise} A promise that resolves to the added document
     */
    static addDocument(mcpServerId, body) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].addMCPServerDocument({
                mcpServerId,
                'Content-Type': 'application/json',
            },
            {
                requestBody: body,
            },
            this._requestMetaData(),
            );
        });
    }

    /**
     * Add a file to a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @param {Object} fileToDocument - The file to add to the document
     * @returns {Promise} A promise that resolves to the added file
     */
    static addFileToDocument(mcpServerId, documentId, fileToDocument) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].addMCPServerDocumentContent(
                {
                    mcpServerId,
                    documentId,
                    'Content-Type': 'application/json',
                },
                {
                    requestBody: {
                        file: fileToDocument,
                    },
                },
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }


    /**
     * Add inline content to a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @param {string} sourceType - The source type of the document
     * @param {Object} inlineContent - The inline content to add to the document
     * @returns {Promise} A promise that resolves to the added inline content
     */
    static addInlineContentToDocument(mcpServerId, documentId, sourceType, inlineContent) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].addMCPServerDocumentContent(
                {
                    mcpServerId,
                    documentId,
                    sourceType,
                    'Content-Type': 'application/json',
                },
                {
                    requestBody: {
                        inlineContent,
                    },
                },
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }

    /**
     * Get the file for a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @returns {Promise} A promise that resolves to the file content of the document
     */
    static getFileForDocument(mcpServerId, documentId,) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].getMCPServerDocumentContent(
                {
                    mcpServerId,
                    documentId,
                    Accept: 'application/octet-stream',
                },
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }

    /**
     * Get the inline content of a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @returns {Promise} A promise that resolves to the inline content of the document
     */
    static getInlineContentOfDocument(mcpServerId, documentId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].getMCPServerDocumentContent(
                {
                    mcpServerId,
                    documentId,
                },
            );
        });
    }

    /**
     * Get the documents of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @returns {Promise} A promise that resolves to the documents of the MCP Server.
     */
    static getDocuments(mcpServerId) {
        const limit = Configurations.app.documentCount || 80;
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].getMCPServerDocuments(
                {
                    mcpServerId,
                    limit,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @param {Object} body - The request body containing the document data
     * @returns {Promise} A promise that resolves to the updated document
     */
    static updateDocument(mcpServerId, documentId, body) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].updateMCPServerDocument(
                {
                    mcpServerId,
                    documentId,
                    'Content-Type': 'application/json',
                },
                {
                    requestBody: body,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @returns {Promise} A promise that resolves to the document
     */
    static getDocument(mcpServerId, documentId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].getMCPServerDocument(
                {
                    mcpServerId,
                    documentId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a document
     * @param {string} mcpServerId - The ID of the MCP Server
     * @param {string} documentId - The ID of the document
     * @returns {Promise} A promise that resolves to the deleted document
     */
    static deleteDocument(mcpServerId, documentId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Documents'].deleteMCPServerDocument(
                {
                    mcpServerId,
                    documentId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get all active Tenants
     * @param state state of the tenant
     * @returns {Promise} A promise that resolves to the list of tenants in the given state.
     */
    getTenantsByState(state) {
        return this.client.then(client => {
            return client.apis.Tenants.getTenantsByState({ state });
        });
    }

    /**
     * Get the available subscriptions for a given API
     * @param {String} apiId API UUID
     * @param {Number} [offset=null] Offset for pagination
     * @param {Number} [limit=null] Limit for pagination
     * @param {String} [query=null] Query string for filtering subscriptions
     * @param {Function} [callback=null] Callback function to handle the response
     * @returns {Promise} With given callback attached to the success chain else API invoke promise.
     */
    subscriptions(apiId, offset = null, limit = null, query = null, callback = null) {
        const promiseSubscription = this.client.then(client => {
            return client.apis.Subscriptions.getSubscriptions(
                { apiId, limit, offset, query },
                this._requestMetaData(),
            );
        });
        if (callback) {
            return promiseSubscription.then(callback);
        } else {
            return promiseSubscription;
        }
    }

    /**
     * Export the MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server to export.
     * @returns {Promise} A promise that resolves to the exported MCP Server data.
     */
    static exportMCPServer(mcpServerId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['Import Export'].exportMCPServer({
                mcpServerId,
            }, this._requestMetaData({
                'accept': 'application/zip'
            }));
        });
    };

    /**
     * Create a new version of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {string} version - The version to create.
     * @param {boolean} isDefaultVersion - Whether the new version should be the default version.
     * @param {string} serviceVersion - The service version of the MCP Server.
     * @returns {Promise} A promise that resolves to the created MCP Server version.
     */
    static createNewMCPServerVersion(mcpServerId, version, isDefaultVersion, serviceVersion) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Servers'].createNewMCPServerVersion(
                {
                    mcpServerId,
                    newVersion: version,
                    serviceVersion,
                    defaultVersion: isDefaultVersion,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Return the deployed revisions of an MCP Server
     * @param {string} id - The ID of the MCP Server to get the deployed revisions for.
     * @returns {Promise} A promise that resolves to the deployed revisions of the MCP Server.
     */
    static getDeployedRevisions(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].getMCPServerRevisionDeployments({
                mcpServerId: id,
            },
            this._requestMetaData(),
            );
        });
    }

    /**
     * Generate an internal key for an MCP Server
     * @param {*} id MCP Server ID
     * @param {*} callback Callback function to handle the response
     * @returns {Promise} With given callback attached to the success chain else API invoke promise.
     */
    static generateInternalKey(id, callback = null) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promiseKey = apiClient.then((client) => {
            return client.apis['MCP Servers'].generateInternalAPIKeyMCPServer(
                { mcpServerId: id },
                this._requestMetaData()
            );
        });
        if (callback) {
            return promiseKey.then(callback);
        } else {
            return promiseKey;
        }
    }

    /**
     * Change displayInDevportal
     *
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {string} deploymentId - The ID of the deployment.
     * @param {Object} body - The request body containing the displayInDevportal information.
     * @returns {Promise} A promise that resolves to the response of the displayInDevportal request.
     */
    static displayInDevportal(mcpServerId, deploymentId, body) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].updateMCPServerDeployment(
                {
                    mcpServerId,
                    deploymentId,
                },
                {
                    requestBody: body,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Cancel a pending deployment or undeployment task for a revision of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @param {string} revisionId - The ID of the revision.
     * @param {string} envName - The name of the environment.
     * @returns {Promise} A promise that resolves to the response of the cancel request.
     */
    static cancelRevisionDeploymentWorkflow(mcpServerId, revisionId, envName) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].deleteMCPServerRevisionDeploymentPendingTask(
                {
                    mcpServerId,
                    revisionId,
                    envName,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a thumbnail to an MCP Server.
     * @param {String} mcpServerId - The ID of the MCP Server.
     * @param {File} file - The file to be uploaded.
     * @returns {Promise} A promise that resolves to the response of the thumbnail upload request.
     */
    static addThumbnail(mcpServerId, file) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Servers'].updateMCPServerThumbnail(
                {
                    mcpServerId,
                    'Content-Type': file.type,
                },
                {
                    requestBody: {
                        file,
                    },
                },
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
    }

    /**
     * Get the thumbnail of an MCP Server.
     * @param {String} mcpServerId - The ID of the MCP Server.
     * @returns {Promise} A promise that resolves to the response of the thumbnail get request.
     */
    static getThumbnail(mcpServerId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Servers'].getMCPServerThumbnail(
                {
                    mcpServerId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get the subscription policies of an MCP Server.
     * @param {string} mcpServerId - The ID of the MCP Server.
     * @returns {Promise} A promise that resolves to the subscription policies of the MCP Server.
     */
    static getSubscriptionPolicies(mcpServerId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const promisePolicies = apiClient.then(client => {
            return client.apis['MCP Servers'].getMCPServerSubscriptionPolicies(
                {
                    mcpServerId,
                },
                this._requestMetaData(),
            );
        });
        return promisePolicies.then(response => response.body);
    }
}

export default MCPServer;
