/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import APIClient from './APIClient';
import GovernanceAPIClient from './GovernanceAPIClient';
import Utils from './Utils';

/**
 * Class representing a Factory of APIClients
 */
class APIClientFactory {
    /**
     * Initialize a single instance of APIClientFactory
     * @returns {APIClientFactory}
     */
    constructor() {
        /* eslint-disable no-underscore-dangle */
        // indicate “private” members of APIClientFactory that is why underscore has used here
        if (APIClientFactory._instance) {
            return APIClientFactory._instance;
        }

        this._APIClientMap = new Map();
        APIClientFactory._instance = this;
        /* eslint-enable no-underscore-dangle */
    }

    /**
     * Get an API Client for the given environment and client type
     * @param {Object} environment - Environment object for the client
     * @param {String} clientType - Type of client (API_CLIENT or GOVERNANCE_CLIENT)
     * @returns {APIClient|GovernanceAPIClient} Client instance
     */
    getAPIClient(environment = Utils.getDefaultEnvironment(), clientType = Utils.CONST.API_CLIENT) {
        const key = environment.label + '_' + clientType;
        let client = this._APIClientMap.get(key);

        if (client) {
            return client;
        }

        if (clientType === Utils.CONST.API_CLIENT) {
            client = new APIClient(environment);
        } else if (clientType === Utils.CONST.GOVERNANCE_CLIENT) {
            client = new GovernanceAPIClient(environment);
        }

        this._APIClientMap.set(key, client);
        return client;
    }

    /**
     * Remove client from map
     * @param {String} environmentLabel name of the environment
     * @param {String} clientType - Type of client (API_CLIENT or GOVERNANCE_CLIENT)
     */
    destroyAPIClient(environmentLabel, clientType = Utils.CONST.API_CLIENT) {
        this._APIClientMap.delete(environmentLabel + '_' + clientType);
    }
}

/**
 * Single instance of APIClientFactory indicate “private” members of objects
 * @type {APIClientFactory}
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
APIClientFactory._instance = null;

export default APIClientFactory;
