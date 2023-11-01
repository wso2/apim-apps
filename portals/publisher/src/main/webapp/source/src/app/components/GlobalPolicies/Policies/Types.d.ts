/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

export type Policy = {
    id: string;
    name: string;
    version: string;
    displayName: string;
    applicableFlows: string[];
    supportedGateways: string[];
    supportedApiTypes: string[];
    isAPISpecific: boolean;
    supportedGateways: string[];
};

export type AttachedPolicy = {
    id: string;
    name: string;
    displayName: string;
    version: string;
    applicableFlows: string[];
    uniqueKey: string;
    attributes?: any;
    isAPISpecific?: boolean;
};

export type PolicySpecAttribute = {
    name: string;
    displayName: string;
    version: string;
    description: string;
    required: boolean;
    type: string;
    validationRegex: string;
    defaultValue: any;
    allowedValues: string[];
};

export type PolicySpec = {
    id: string;
    category: string;
    name: string;
    displayName: string;
    version: string;
    description: string;
    applicableFlows: string[];
    supportedGateways: string[];
    supportedApiTypes: string[];
    policyAttributes: PolicySpecAttribute[];
    isAPISpecific?: boolean;
    md5?: string;
};

export type CreatePolicySpec = {
    id?: string;
    category: string;
    name: string;
    displayName: string;
    version: string;
    description: string;
    applicableFlows: string[];
    supportedGateways: string[];
    supportedApiTypes: string[];
    policyAttributes: PolicySpecAttribute[];
};

export type ApiPolicy = {
    policyName?: string;
    policyId?: string;
    policyVersion?: string;
    parameters: any;
    uuid?: string;
};

export type ApiLevelPolicy = {
    request?: any[];
    response?: any[];
    fault?: any[];
};
