/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

const GRANT_TYPE_LABELS = {
    authorization_code: 'Authorization Code',
    implicit: 'Implicit',
    password: 'Password',
    client_credentials: 'Client Credentials',
    refresh_token: 'Refresh Token',
    'urn:ietf:params:oauth:grant-type:device_code': 'Device Code',
    'urn:ietf:params:oauth:grant-type:token-exchange': 'Token Exchange',
};
const RESIDENT_KEY_MANAGER_NAME = 'Resident Key Manager';

function isHidden(fieldConfig) {
    return fieldConfig?.hidden === true || fieldConfig?.hidden === 'true';
}

function isInactive(fieldConfig) {
    return fieldConfig?.active === false || fieldConfig?.active === 'false';
}

function isRequired(fieldConfig) {
    return fieldConfig?.required === true || fieldConfig?.required === 'true';
}

function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
}

function formatValue(value, valueMap = {}) {
    if (Array.isArray(value)) {
        return value.map((item) => valueMap[item] ?? item).join(', ');
    }
    if (value === -1) return 'Unlimited';
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    return valueMap[value] ?? String(value);
}

function addFieldLimit(items, label, fieldConfig, options = {}) {
    const {
        valueMap,
        hiddenOnly = false,
        includeVisibleDefault = true,
    } = options;
    if (isInactive(fieldConfig)) {
        return;
    }
    const hidden = isHidden(fieldConfig);
    const value = fieldConfig?.defaultValue;

    if (hidden && hasValue(value)) {
        items.push(`${label} is fixed to ${formatValue(value, valueMap)}.`);
    } else if (hidden) {
        items.push(`${label} is hidden from developers.`);
    } else if (!hiddenOnly && includeVisibleDefault && hasValue(value)) {
        items.push(`${label} defaults to ${formatValue(value, valueMap)}.`);
    }
}

function addRequiredLimit(items, label, fieldConfig) {
    if (!isInactive(fieldConfig) && !isHidden(fieldConfig) && isRequired(fieldConfig)) {
        items.push(`${label} is required.`);
    }
}

export function normalizeLimitations(limitations) {
    const raw = Array.isArray(limitations)
        ? limitations
        : String(limitations || '').split('\n');
    return raw.map((item) => String(item).trim()).filter(Boolean);
}

export function getDeveloperExperience(template) {
    return template?.formConfig?.developerExperience ?? {};
}

export function buildDeveloperLimitations(template) {
    const formConfig = template?.formConfig ?? {};
    const application = formConfig.application ?? {};
    const subscription = formConfig.subscription ?? {};
    const keyGeneration = formConfig.keyGeneration ?? {};
    const items = [];

    addFieldLimit(items, 'Application throttling policy', application.throttlingPolicy);
    addFieldLimit(items, 'Application description', application.description);
    addFieldLimit(items, 'Application groups', application.groups);
    addRequiredLimit(items, 'Application description', application.description);
    addRequiredLimit(items, 'Application groups', application.groups);

    Object.entries(application.attributes ?? {}).forEach(([attrName, attrConfig]) => {
        addFieldLimit(items, `Application attribute "${attrName}"`, attrConfig);
        if (!isInactive(attrConfig) && !isHidden(attrConfig) && isRequired(attrConfig)) {
            items.push(`Application attribute "${attrName}" is required.`);
        }
    });

    addFieldLimit(items, 'Subscription throttling policy', subscription.throttlingPolicy);

    const allowedKeyManagers = Array.isArray(keyGeneration.allowedKeyManagers?.defaultValue)
        ? keyGeneration.allowedKeyManagers.defaultValue
        : [];
    if (allowedKeyManagers.length > 0) {
        items.push(`Key generation is limited to ${allowedKeyManagers.join(', ')}.`);
    }

    const residentKeyManagerAllowed = allowedKeyManagers.length === 0
        || allowedKeyManagers.includes(RESIDENT_KEY_MANAGER_NAME);
    if (residentKeyManagerAllowed) {
        const selectedGrantTypes = Array.isArray(keyGeneration.grantTypes?.defaultValue)
            ? keyGeneration.grantTypes.defaultValue
            : [];
        const hasGrantType = (...grantTypes) => grantTypes.some((grantType) => selectedGrantTypes.includes(grantType));

        addFieldLimit(items, 'OAuth grant types', keyGeneration.grantTypes, { valueMap: GRANT_TYPE_LABELS });
        if (hasGrantType('authorization_code', 'implicit')) {
            addFieldLimit(items, 'Callback URL', keyGeneration.callbackUrl);
        }
        if (hasGrantType('client_credentials')) {
            addFieldLimit(items, 'Application access token expiry', keyGeneration.appAccessTokenExpiry, {
                hiddenOnly: true,
            });
        }
        if (hasGrantType('password', 'authorization_code', 'implicit')) {
            addFieldLimit(items, 'User access token expiry', keyGeneration.userAccessTokenExpiry, {
                hiddenOnly: true,
            });
        }
        if (hasGrantType('refresh_token')) {
            addFieldLimit(items, 'Refresh token expiry', keyGeneration.refreshTokenExpiry, {
                hiddenOnly: true,
            });
        }
        if (hasGrantType('authorization_code')) {
            addFieldLimit(items, 'ID token expiry', keyGeneration.idTokenExpiry, {
                hiddenOnly: true,
            });
            addFieldLimit(items, 'PKCE', keyGeneration.enablePKCE, { hiddenOnly: true });
            addFieldLimit(items, 'PKCE plain text support', keyGeneration.pkceSupportsPlainText, {
                hiddenOnly: true,
            });
            addFieldLimit(items, 'Public client mode', keyGeneration.publicClient, { hiddenOnly: true });
        }
    }

    const rulesetCount = template?.rulesetBindings?.length ?? 0;
    if (rulesetCount > 0) {
        items.push(`${rulesetCount} governance ruleset${rulesetCount === 1 ? '' : 's'} will validate application changes.`);
    }

    return items;
}

export function getDeveloperLimitations(template) {
    const developerExperience = getDeveloperExperience(template);
    const documentedLimitations = normalizeLimitations(developerExperience.limitations);
    return documentedLimitations.length > 0 ? documentedLimitations : buildDeveloperLimitations(template);
}
