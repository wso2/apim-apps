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
    DEFAULT_MIN_SCOPES_TO_LOGIN: ['apim:api_workflow_view', 'apim:api_workflow_approve', 'apim:tenantInfo',
        'apim:admin_settings', 'apim:tier_view', 'apim:policies_import_export', 'apim:tier_manage', 'apim:bl_manage',
    ],
    Roles: {
        WORKFLOW_MANAGER: ['apim:api_workflow_view', 'apim:api_workflow_approve', 'apim:tenantInfo', 'openid',
            'apim:admin_settings',
        ],
        POLICY_MANAGER: ['apim:admin_tier_view', 'apim:admin_tier_manage', 'apim:tenantInfo',
            'apim:bl_view', 'apim:bl_manage', 'openid', 'apim:admin_settings',
        ],
        CATEGORY_MANAGER: ['apim:api_category', 'openid', 'apim:tenantInfo', 'apim:admin_settings'],
        KEY_MANAGER: ['apim:keymanagers_manage', 'openid', 'apim:tenantInfo', 'apim:admin_settings'],
        GATEWAY_MANAGER: ['apim:environment_manage', 'openid', 'apim:admin_settings', 'apim:environment_read'],
        GOVERNANCE_MANAGER: ['apim:gov_policy_read', 'apim:gov_policy_manage', 'apim:gov_result_read',
            'apim:gov_rule_read', 'apim:gov_rule_manage'],
        SETTINGS_MANAGER: ['apim:app_owner_change', 'apim:admin_application_view',
            'apim:scope_manage', 'openid', 'apim:admin_settings', 'apim:tenantInfo', 'apim:api_provider_change',
        ],
        ORGANIZATION_MANAGER: ['apim:organization_manage', 'apim:organization_read', 'openid',
            'apim:tenantInfo', 'apim:admin_settings'],
    },
    DEFAULT_SUBSCRIPTIONLESS_PLAN: 'DefaultSubscriptionless',
    DEFAULT_ASYNC_SUBSCRIPTIONLESS_PLAN: 'AsyncDefaultSubscriptionless',
    GOVERNABLE_STATES: [
        { value: 'API_CREATE', label: 'API Create' },
        { value: 'API_UPDATE', label: 'API Update' },
        { value: 'API_DEPLOY', label: 'API Deploy' },
        { value: 'API_PUBLISH', label: 'API Publish' },
    ],
    RULESET_TYPES: [
        { value: 'API_DEFINITION', label: 'API Definition' },
        { value: 'API_METADATA', label: 'API Metadata' },
        { value: 'API_DOCUMENTATION', label: 'Documentation' },
    ],
    ARTIFACT_TYPES: [
        { value: 'REST_API', label: 'REST API' },
        { value: 'ASYNC_API', label: 'Async API' },
    ],
    SEVERITY_LEVELS: [
        { value: 'ERROR', label: 'Error' },
        { value: 'WARN', label: 'Warn' },
        { value: 'INFO', label: 'Info' },
    ],
    COMPLIANCE_STATES: [
        { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
        { value: 'COMPLIANT', label: 'Compliant' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'NON_COMPLIANT', label: 'Non Compliant' },
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
    GOVERNANCE_ACTIONS: {
        BLOCK: 'BLOCK',
        NOTIFY: 'NOTIFY',
    },
};

export default CONSTS;
