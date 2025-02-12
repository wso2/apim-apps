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
     * Get list of governance policy attachments
     * @returns {Promise} Promised policy attachments response
     */
    getGovernancePolicyAttachments() {
        return this.client.then((client) => {
            return client.apis['Governance Policy Attachments'].getGovernancePolicyAttachments(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get governance policy attachment by id
     * @param {string} policyAttachmentId Policy Attachment id
     * @returns {Promise} Promised policy attachment response
     */
    getGovernancePolicyAttachmentById(policyAttachmentId) {
        return this.client.then((client) => {
            return client.apis['Governance Policy Attachments'].getGovernancePolicyAttachmentById(
                { policyAttachmentId: policyAttachmentId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a new governance policy attachment
     * @param {Object} policyAttachment - Policy Attachment object containing the policy attchment configuration
     * @returns {Promise} Promise resolving to API response
     */
    createGovernancePolicyAttachment(policyAttachment) {
        return this.client.then((client) => {
            return client.apis['Governance Policy Attachments'].createGovernancePolicyAttachment(
                { 'Content-Type': 'application/json' },
                { requestBody: policyAttachment },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an existing governance policy attachment
     * @param {Object} policyAttachment - Policy Attachment object containing the updated policy attachment configuration and ID
     * @param {string} policyAttachment.id - ID of the policy attachment to update
     * @returns {Promise} Promise resolving to API response
     */
    updateGovernancePolicyAttachmentById(policyAttachment) {
        return this.client.then((client) => {
            return client.apis['Governance Policy Attachments'].updateGovernancePolicyAttachmentById(
                {
                    policyAttachmentId: policyAttachment.id,
                    'Content-Type': 'application/json'
                },
                { requestBody: policyAttachment },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a governance policy attachment
     * @param {string} policyAttachmentId Policy attachment id
     * @returns {Promise} Promised response
     */
    deleteGovernancePolicyAttachment(policyAttachmentId) {
        return this.client.then((client) => {
            return client.apis['Governance Policy Attachments'].deleteGovernancePolicyAttachment(
                { policyAttachmentId: policyAttachmentId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get list of policies
     * @returns {Promise} Promised policies response
     */
    getPolicies() {
        return this.client.then((client) => {
            return client.apis['Policies'].getPolicies(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get policy by id
     * @param {string} policyId Policy id
     * @returns {Promise} Promised policy response
     */
    getPolicyById(policyId) {
        return this.client.then((client) => {
            return client.apis['Policies'].getPolicyById(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get policy content by id
     * @param {string} policyId Policy id
     * @returns {Promise} Promised policy content response
     */
    getPolicyContent(policyId) {
        return this.client.then((client) => {
            return client.apis['Policies'].getPolicyContent(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a new policy
     * @param {FormData} policy Policy data including the file
     * @returns {Promise} Promise resolving to response
     */
    createPolicy(policy) {
        return this.client.then((client) => {
            return client.apis['Policies'].createPolicy(
                { 'Content-Type': 'multipart/form-data' },
                { requestBody: policy },
            );
        });
    }

    /**
     * Update a policy
     * @param {string} id Policy ID
     * @param {FormData} policy Updated policy data including the file
     * @returns {Promise} Promise resolving to response
     */
    updatePolicyById(id, policy) {
        return this.client.then((client) => {
            const payload = policy;
            return client.apis['Policies'].updatePolicyById(
                { policyId: id },
                { requestBody: payload },
                { 'Content-Type': 'multipart/form-data' },
            );
        });
    }

    /**
     * Delete a policy
     * @param {string} policyId Policy id
     * @returns {Promise} Promised response
     */
    deletePolicy(policyId) {
        return this.client.then((client) => {
            return client.apis['Policies'].deletePolicy(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get policy adherence for all policies
     * @returns {Promise} Promised policy adherence response
     */
    getPolicyAttachmentAdherenceForAllPolicyAttachments() {
        return this.client.then((client) => {
            return client.apis['Policy Attachment Adherence'].getPolicyAttachmentAdherenceForAllPolicyAttachments(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get artifact compliance for all artifacts
     * @returns {Promise} Promised artifact compliance response
     */
    getComplianceStatusListOfAPIs() {
        return this.client.then((client) => {
            return client.apis['Artifact Compliance'].getComplianceStatusListOfAPIs(
                this._requestMetaData(),
            );
        });
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
     * Get policy attachment adherence summary
     * @returns {Promise} Promised policy attachment adherence summary response
     */
    getPolicyAttachmentAdherenceSummary() {
        return this.client.then((client) => {
            return client.apis['Policy Attachment Adherence'].getPolicyAttachmentAdherenceSummary(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get artifact compliance summary
     * @returns {Promise} Promised artifact compliance summary response
     */
    getComplianceSummaryForAPIs() {
        return this.client.then((client) => {
            return client.apis['Artifact Compliance'].getComplianceSummaryForAPIs(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get policy attachment adherence by id
     * @param {string} policyAttachmentId Policy attachment id
     * @returns {Promise} Promised policy attachment adherence response
     */
    getPolicyAttachmentAdherenceByPolicyAttachmentId(policyAttachmentId) {
        return this.client.then((client) => {
            return client.apis['Policy Attachment Adherence'].getPolicyAttachmentAdherenceByPolicyAttachmentId(
                { policyAttachmentId: policyAttachmentId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get policy validation results by artifact id
     * @param {string} artifactId Artifact id
     * @param {string} policyAttachmentId Policy id
     * @returns {Promise} Promised validation results response
     */
    getPolicyValidationResultsByAPIId(artifactId, policyAttachmentId) {
        return this.client.then((client) => {
            return client.apis['Artifact Compliance'].getPolicyValidationResultsByAPIId(
                { apiId: artifactId, policyAttachmentId: policyAttachmentId },
                this._requestMetaData(),
            );
        });
    }
}

export default GovernanceAPI;
