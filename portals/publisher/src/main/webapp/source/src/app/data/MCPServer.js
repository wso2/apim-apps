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
     * Get the type of the MCP Server.
     * @returns {string} The type of the MCP Server.
     */
    getType() {
        return this.type;
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

            const promisedResponse = client.apis['MCP Servers'].importMCPServerDefinition(
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

            const promisedResponse = client.apis['MCP Servers'].importMCPServerDefinition(
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
                    apiId: id,
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

    // /**
    //  * Update an MCP Server.
    //  * @param {*} updatedProperties - The updated properties for the MCP Server.
    //  * @returns {Promise<MCPServer>} A promise that resolves to the updated MCPServer instance.
    //  */
    // static updateMCPServer(updatedProperties) {
    //     const updatedMCPServer = updatedProperties;
    //     const apiClient = new APIClientFactory()
    //         .getAPIClient(
    //             Utils.getCurrentEnvironment(),
    //             Utils.CONST.API_CLIENT
    //         ).client;
    //     const promisedUpdate = apiClient.then(client => {
    //         const payload = {
    //             apiId: updatedMCPServer.id,
    //         };
    //         const requestBody = {
    //             requestBody: updatedMCPServer,
    //         };
    //         return client.apis['MCP Servers'].updateMCPServer(
    //             payload,
    //             requestBody
    //         );
    //     });
    //     return promisedUpdate.then(response => {
    //         if (response.body === null || response.body === undefined) {
    //             throw new Error(`MCP Server with ID ${updatedMCPServer.id} not found.`);
    //         }
    //         return new MCPServer(response.body);
    //     });
    // }

    /**
     * Update an MCP Server.
     * @param {Object} updatedProperties - The updated properties for the MCP Server.
     * @returns {Promise<MCPServer>} A promise that resolves to the updated MCPServer
     */
    updateMCPServer(updatedProperties) {
        const updatedMCPServer = { ...this.toJSON(), ...updatedProperties };
        const promisedUpdate = this.client.then(client => {
            const payload = {
                apiId: updatedMCPServer.id,
            };
            const requestBody = {
                requestBody: updatedMCPServer,
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
     * To get MCPServer object with the fields filled as per the definition
     * @param {Object} client Client object after resolving this.client.then()
     * @returns {Object} MCP Server Object corresponding to spec fields
     * @memberof MCPServer
     */
    getDataFromSpecFields(client) {
        const {properties} = client.spec.components.schemas.API;
        const data = {};
        Object.keys(this).forEach(apiAttribute => {
            if (apiAttribute in properties) {
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
    getRevisions(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(client => {
            return client.apis['MCP Server Revisions'].getMCPServerRevisions({
                apiId: id,
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
                    apiId: id,
                    query: 'deployed:true',
                },
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
    restoreRevision(id, revisionId) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return apiClient.then(
            client => {
                return client.apis['MCP Server Revisions'].restoreMCPServerRevision(
                    {
                        apiId: id,
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
            return client.apis['MCP Server Endpoints'].getMCPServerEndpoints(
                {
                    apiId: id,
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
            return client.apis['MCP Server Endpoints'].getMCPServerEndpoint(
                {
                    apiId: id,
                    endpointId,
                },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an endpoint of the MCP Server
     * @param {String} id UUID of the MCP Server
     * @param {String} endpointId UUID of the endpoint
     * @param {Object} endpointBody Updated endpoint object
     * @returns {Promise} Promise containing the updated endpoint
     */
    static updateMCPServerEndpoint(id, endpointId, endpointBody) {
        const restApiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        return restApiClient.then(client => {
            return client.apis['API Endpoints'].updateMCPServerEndpoint(
                {
                    apiId: id,
                    endpointId,
                },
                {
                    requestBody: endpointBody,
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
            apiId: id,
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
     * Get the swagger of an MCP Server
     * @param {String} id UUID of the MCP Server in which the swagger is needed
     * @returns {promise} With given id and environmentName, it returns the swagger of the MCP Server
     */
    static getSwagger(id) {
        const apiClient = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT
            ).client;
        const payload = { apiId: id };
        return apiClient.then((client) => {
            return client.apis['MCP Servers'].getMCPServerSwagger(payload, this._requestMetaData());
        });
    }

    /**
     * Get the swagger of an MCP Server
     * @param {string} id UUID of the MCP Server in which the swagger is needed 
     * @returns {Promise} A promise that resolves to the swagger of the MCP Server.
     */
    getSwagger(id) {
        const payload = { apiId: id };
        return this.client.then((client) => {
            return client.apis['MCP Servers'].getMCPServerSwagger(payload, this._requestMetaData());
        });
    }

    /**
     * Get the life cycle state of an MCP Server given its id (UUID)
     * @param id {string} UUID of the MCP Server
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
                    apiId: id,
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
                    apiId: id,
                },
                this._requestMetaData(),
            );
        });
        return promiseLcHistoryGet;
    }

}

export default MCPServer;
