/**
 * Copyright (c) 2019, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const CONSTS = {
    API: 'API',
    APIProduct: 'APIProduct',
    HTTP_METHODS: ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'],
    errorCodes: {
        INSUFFICIENT_PREVILEGES: '900403: Insufficient privileges to login',
        UNEXPECTED_SERVER_ERROR: 'Unexpected token S in JSON at position 0',
        INVALID_TOKEN: '900401: Invalid token',
        NO_TOKEN_FOUND: '901401: No partial token found!',
    },
    TENANT_STATE_ACTIVE: 'ACTIVE',
    DESCRIPTION_TYPES: {
        DESCRIPTION: 'description',
        OVERVIEW: '_overview',
    },
    DEFAULT_VHOST: {
        host: '',
        httpContext: '',
        httpPort: 80,
        httpsPort: 443,
        wsPort: 9099,
        wssPort: 8099,
        websubHttpPort: 9021,
        websubHttpsPort: 8021,
    },
    DEFAULT_ENDPOINT_SECURITY: {
        enabled: false,
        type: 'NONE',
        apiKeyIdentifier: null, // AI api key identifier
        apiKeyValue: null, // AI api key value
        apiKeyIdentifierType: null,
        username: '',
        password: null, // has to use null to differentiate the returned '' (empty) password vs no password provided
        grantType: '',
        tokenUrl: '',
        clientId: null,
        clientSecret: null, // same as above password case
        customParameters: {},
        connectionTimeoutDuration: -1,
        connectionRequestTimeoutDuration: -1,
        socketTimeoutDuration: -1,
        proxyConfigs: {
            proxyEnabled: '',
            proxyHost: '',
            proxyPort: '',
            proxyUsername: '',
            proxyPassword: '',
            proxyProtocol: '',
        },
    },
    DEFAULT_ENDPOINT: {
        id: null,
        name: '',
        deploymentStage: '',
        endpointConfig: {
            endpoint_type: 'http',
        },
    },
    DEPLOYMENT_STAGE: {
        production: 'PRODUCTION',
        sandbox: 'SANDBOX',
    },
    DEFAULT_ENDPOINT_ID: {
        PRODUCTION: 'default_production_endpoint',
        SANDBOX: 'default_sandbox_endpoint',
    },
    GATEWAY_TYPE: {
        synapse: 'Synapse',
        choreoConnect: 'ChoreoConnect',
        AWS: 'AWS',
    },
    PATH_TEMPLATES: {
        COMMON_POLICIES: '/policies',
        COMMON_POLICY_CREATE: '/policies/create',
    },
    DEFAULT_SUBSCRIPTIONLESS_PLAN: 'DefaultSubscriptionless',
    DEFAULT_ASYNC_SUBSCRIPTIONLESS_PLAN: 'AsyncDefaultSubscriptionless',
    RULESET_TYPES: [
        { value: 'API_DEFINITION', label: 'API Definition' },
        { value: 'API_METADATA', label: 'API Metadata' },
        { value: 'API_DOCUMENTATION', label: 'Documentation' },
    ],
    POLICY_ADHERENCE_STATES: [
        { value: 'FOLLOWED', label: 'Followed' },
        { value: 'VIOLATED', label: 'Violated' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'UNAPPLIED', label: 'Unapplied' },
    ],
    RULESET_VALIDATION_STATES: [
        { value: 'PASSED', label: 'Passed' },
        { value: 'FAILED', label: 'Failed' },
        { value: 'UNAPPLIED', label: 'Unapplied' },
    ],
};

export default CONSTS;
