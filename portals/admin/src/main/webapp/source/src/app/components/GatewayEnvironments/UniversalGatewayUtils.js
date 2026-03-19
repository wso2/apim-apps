/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* global globalThis */

import PropTypes from 'prop-types';
import CONSTS from 'AppData/Constants';

export const PERMISSION_TYPE_OPTIONS = [
    {
        value: 'PUBLIC',
        labelKey: 'Gateways.UniversalGatewayManagement.permission.public',
        defaultMessage: 'Public',
    },
    {
        value: 'ALLOW',
        labelKey: 'Gateways.UniversalGatewayManagement.permission.allow',
        defaultMessage: 'Allow for role(s)',
    },
    {
        value: 'DENY',
        labelKey: 'Gateways.UniversalGatewayManagement.permission.deny',
        defaultMessage: 'Deny for role(s)',
    },
];

export const WSO2_GATEWAY_TYPES = [CONSTS.GATEWAY_TYPE.regular, CONSTS.GATEWAY_TYPE.apk];

export const WSO2_SELF_HOSTED_GATEWAY_TYPES = [CONSTS.GATEWAY_TYPE.apiPlatform, ...WSO2_GATEWAY_TYPES];

const DEFAULT_PLATFORM_GATEWAY_RELEASES_URL = 'https://github.com/wso2/api-platform/releases';
const DEFAULT_PLATFORM_GATEWAY_VERSION = 'v0.9.0';
const DEFAULT_HELM_CHART_OCI_URL = 'oci://ghcr.io/wso2/api-platform/helm-charts/gateway';
const DEFAULT_HELM_CHART_VERSION = '0.9.0';

// Safe regex: anchored at end ($), single char class, no nested quantifiers
const trimTrailingSlashes = (value) => (value || '').trim().replace(/\/+$/, '');

const normalizeReleaseBaseUrl = (value) => {
    const trimmed = value?.trim();
    if (!trimmed) {
        return DEFAULT_PLATFORM_GATEWAY_RELEASES_URL;
    }
    return trimTrailingSlashes(trimmed);
};

export const getPlatformGatewayReleaseConfig = (settings) => {
    const platformGatewayConfig = settings?.platformGateway || {};
    const releasesUrl = normalizeReleaseBaseUrl(platformGatewayConfig.releasesUrl);
    const version = (platformGatewayConfig.version || DEFAULT_PLATFORM_GATEWAY_VERSION).trim();
    const browserHost = globalThis.window?.location.host || '';
    const configuredControlPlaneHost = (platformGatewayConfig.controlPlaneHost || '').trim();
    const controlPlaneHost = configuredControlPlaneHost || browserHost;
    const artifactName = `gateway-${version}`;
    const downloadCommand = `curl -sLO ${releasesUrl}/download/gateway/${version}/${artifactName}.zip && \\\n`
        + `unzip ${artifactName}.zip`;
    const helmChartOciUrl = (platformGatewayConfig.helmChartOciUrl || DEFAULT_HELM_CHART_OCI_URL).trim();
    const helmChartVersion = (platformGatewayConfig.helmChartVersion || DEFAULT_HELM_CHART_VERSION).trim();

    return {
        artifactName,
        controlPlaneHost,
        downloadCommand,
        helmChartOciUrl,
        helmChartVersion,
    };
};

export const slugifyName = (value) => {
    const normalized = (value || '')
        .toLowerCase()
        .trim()
        .replaceAll(/[^a-z0-9]+/g, '-');
    let start = 0;
    let end = normalized.length;
    while (start < end && normalized.codePointAt(start) === 45) {
        start += 1;
    }
    while (end > start && normalized.codePointAt(end - 1) === 45) {
        end -= 1;
    }
    return normalized.slice(start, end).slice(0, 64);
};

export const normalizeBaseUrl = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return '';
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimTrailingSlashes(trimmed);
    }
    return trimTrailingSlashes(`https://${trimmed}`);
};

export const getVhostFromBaseUrl = (baseUrl) => {
    // URL.canParse may not be available in older browsers
    const canParse = URL.canParse ? URL.canParse(baseUrl) : (() => {
        try {
            const url = new URL(baseUrl);
            return Boolean(url);
        } catch {
            return false;
        }
    })();
    if (!canParse) {
        return '';
    }
    return new URL(baseUrl).host;
};

export const tryParseJson = (value) => {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
};

export const normalizeProperties = (properties) => {
    if (!properties) {
        return {};
    }
    if (Array.isArray(properties)) {
        const mapped = {};
        properties.forEach((property) => {
            if (property && property.key) {
                mapped[property.key] = tryParseJson(property.value);
            }
        });
        return mapped;
    }
    if (typeof properties === 'string') {
        const parsed = tryParseJson(properties);
        return parsed && typeof parsed === 'object' ? parsed : {};
    }
    if (typeof properties === 'object') {
        return properties;
    }
    return {};
};

export const buildAdditionalPropertiesArray = (properties = {}) => Object.keys(properties).map((key) => ({
    key,
    value: properties[key],
}));

export const buildPermissionsDTO = (permissions = {}, roles = [], validRoles = []) => ({
    permissionType: permissions.permissionType || 'PUBLIC',
    roles: roles.concat(validRoles),
});

export const buildVhostDTO = (vhosts = [], gatewayType) => {
    if (gatewayType === CONSTS.GATEWAY_TYPE.regular) {
        return vhosts.map((vhost) => ({
            host: vhost.host,
            httpContext: vhost.httpContext,
            httpPort: vhost.httpPort,
            httpsPort: vhost.httpsPort,
            wsPort: vhost.wsPort,
            wssPort: vhost.wssPort,
        }));
    }

    if (gatewayType === CONSTS.GATEWAY_TYPE.apk || !WSO2_GATEWAY_TYPES.includes(gatewayType)) {
        return vhosts.map((vhost) => ({
            host: vhost.host,
            httpContext: vhost.httpContext,
            httpPort: vhost.httpPort,
            httpsPort: vhost.httpsPort,
        }));
    }

    return [];
};

export const getGatewayProvider = (gatewayType) => (WSO2_GATEWAY_TYPES.includes(gatewayType) ? 'wso2' : 'external');

export const createDefaultVhost = (gatewayType) => {
    const isExternalGateway = !WSO2_GATEWAY_TYPES.includes(gatewayType);
    return {
        host: '',
        httpContext: '',
        httpsPort: isExternalGateway ? 443 : 8243,
        httpPort: isExternalGateway ? 80 : 8280,
        wssPort: 8099,
        wsPort: 9099,
        isNew: true,
    };
};

export const getAdditionalProperty = (additionalProperties, key) => {
    if (!additionalProperties || !key) {
        return '';
    }
    if (Array.isArray(additionalProperties)) {
        const matched = additionalProperties.find((property) => property?.key === key);
        return matched?.value || '';
    }
    if (typeof additionalProperties === 'object') {
        return additionalProperties[key] || '';
    }
    return '';
};

export const getAdditionalPropertiesAsMap = (additionalProperties) => {
    if (!additionalProperties) {
        return {};
    }

    if (Array.isArray(additionalProperties)) {
        return additionalProperties.reduce((mappedProperties, property) => {
            if (property?.key) {
                return {
                    ...mappedProperties,
                    [property.key]: property.value,
                };
            }
            return mappedProperties;
        }, {});
    }

    if (typeof additionalProperties === 'object') {
        return additionalProperties;
    }

    return {};
};

export const getPlatformGatewayUrl = (gateway) => {
    const properties = normalizeProperties(gateway?.properties);
    const gatewayController = tryParseJson(properties.gatewayController);
    const controllerBaseUrl = gatewayController?.baseUrl || properties?.baseUrl;
    if (controllerBaseUrl && String(controllerBaseUrl).trim()) {
        return String(controllerBaseUrl).trim();
    }
    const additionalBaseUrl = getAdditionalProperty(gateway?.additionalProperties, 'platformGatewayBaseUrl');
    if (additionalBaseUrl && String(additionalBaseUrl).trim()) {
        return String(additionalBaseUrl).trim();
    }
    if (gateway?.vhost) {
        return `https://${gateway.vhost}`;
    }
    return '-';
};

export const resolveGatewayStatus = (value) => {
    if (typeof value === 'undefined' || value === null || value === '') {
        return null;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toUpperCase();
        if (normalized === 'ACTIVE' || normalized === 'INACTIVE') {
            return normalized;
        }
        if (normalized === 'TRUE') {
            return 'ACTIVE';
        }
        if (normalized === 'FALSE') {
            return 'INACTIVE';
        }
    }
    return value ? 'ACTIVE' : 'INACTIVE';
};

export const resolvePlatformGatewayStatus = (isPlatformGateway, isActiveProperty) => {
    if (!isPlatformGateway) {
        return null;
    }

    return resolveGatewayStatus(isActiveProperty);
};

export const toPlatformGatewayName = slugifyName;

export const getGatewayStatusChipProps = (status) => {
    if (status === 'ACTIVE') {
        return {
            color: 'success',
            variant: 'filled',
        };
    }

    return {
        color: 'error',
        variant: 'outlined',
    };
};

export const gatewayShape = PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    displayName: PropTypes.string,
    description: PropTypes.string,
    vhost: PropTypes.string,
    registrationToken: PropTypes.string,
    properties: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    additionalProperties: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    permissions: PropTypes.shape({
        permissionType: PropTypes.string,
        roles: PropTypes.arrayOf(PropTypes.string),
    }),
});
