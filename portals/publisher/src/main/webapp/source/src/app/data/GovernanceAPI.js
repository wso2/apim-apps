/* eslint-disable */
/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import Utils from './Utils';
import Resource from './Resource';
import APIClientFactory from './APIClientFactory';

/**
 * An abstract representation of GovernanceAPI
 */
class GovernanceAPI extends Resource {
    constructor(kwargs) {
        super();
        this.client = new APIClientFactory().getAPIClient(Utils.getCurrentEnvironment(),
            Utils.CONST.GOVERNANCE_CLIENT).client;
        const properties = kwargs;
        Utils.deepFreeze(properties);
        this._data = properties;
        for (const key in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, key)) {
                this[key] = properties[key];
            }
        }
    }

    /**
     * @param data
     * @returns {object} Metadata for API request
     * @private 
     */
    _requestMetaData(data = {}) {
        return {
            requestContentType: data['Content-Type'] || 'application/json',
            signal: data.signal,
        };
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
        var copy = {},
            excludes = ['_data', 'client', 'apiType', ...userExcludes];
        for (var prop in this) {
            if (!excludes.includes(prop)) {
                copy[prop] = cloneDeep(this[prop]);
            }
        }
        return copy;
    }

    /**
     * Get artifact compliance by id
     * @param {string} artifactId Artifact id
     * @param {Object} options Optional parameters including signal for AbortController
     * @returns {Promise} Promised artifact compliance response
     */
    getComplianceByAPIId(artifactId, options = {}) {
        return this.client.then((client) => {
            return client.apis['Artifact Compliance'].getComplianceByAPIId(
                { apiId: artifactId },
                { ...this._requestMetaData(), signal: options.signal }
            );
        });
    }

    /**
     * Get ruleset validation results by artifact id
     * @param {string} artifactId Artifact id
     * @param {string} rulesetId Ruleset id
     * @param {Object} options Optional parameters including signal for AbortController
     * @returns {Promise} Promised validation results response
     */
    getRulesetValidationResultsByAPIId(artifactId, rulesetId) {
        return this.client.then((client) => {
            return client.apis['Artifact Compliance'].getRulesetValidationResultsByAPIId(
                { apiId: artifactId, rulesetId: rulesetId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get ruleset by id
     * @param {string} rulesetId Ruleset id
     * @returns {Promise} Promised ruleset response
     */
    getRulesetById(rulesetId) {
        return this.client.then((client) => {
            return client.apis['Rulesets'].getRulesetById(
                { rulesetId: rulesetId },
                this._requestMetaData(),
            );
        });
    }
}

export default GovernanceAPI;
