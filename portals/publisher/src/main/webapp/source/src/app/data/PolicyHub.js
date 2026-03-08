/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com).
 * All Rights Reserved.
 */

const Configurations = require('Config');
const YAML = require('js-yaml');
const ConstantsModule = require('AppData/Constants');

const CONSTS = ConstantsModule.default || ConstantsModule;

const DEFAULT_POLICY_HUB_ENDPOINT =
    'https://db720294-98fd-40f4-85a1-cc6a3b65bc9a-dev.e1-us-east-azure.choreoapis.dev' +
    '/api-platform/policy-hub-api/policy-hub-public/v1.0';
const DEFAULT_POLICY_HUB_LIMIT = 100;
const POLICY_ID_SEPARATOR = '::';

const policyDefinitionCache = new Map();
const policySpecCache = new Map();

const getPolicyHubEndpoint = () => {
    const configuredEndpoint = Configurations?.app?.policyHub?.endpoint;
    const endpoint = configuredEndpoint || DEFAULT_POLICY_HUB_ENDPOINT;
    return endpoint.replace(/\/$/, '');
};

const getPolicyHubLimit = () => (
    Configurations?.app?.policyHub?.limit || DEFAULT_POLICY_HUB_LIMIT
);

const buildPolicyId = (name, version) => `${name}${POLICY_ID_SEPARATOR}${version}`;

const parsePolicyId = (policyId) => {
    if (!policyId || typeof policyId !== 'string' || !policyId.includes(POLICY_ID_SEPARATOR)) {
        return null;
    }
    const [name, version] = policyId.split(POLICY_ID_SEPARATOR);
    if (!name || !version) {
        return null;
    }
    return { name, version };
};

const humanizeName = (name = '') =>
    name
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (match) => match.toUpperCase());

const normalizeAttributeType = (attribute) => {
    const rawType = attribute?.type || attribute?.dataType || attribute?.schema?.type || '';
    const type = typeof rawType === 'string' ? rawType.toLowerCase() : '';

    if (attribute?.format === 'password' || attribute?.secret) {
        return 'secret';
    }
    if (attribute?.enum || attribute?.allowedValues || attribute?.options) {
        return 'enum';
    }
    if (type === 'boolean' || type === 'bool') {
        return 'boolean';
    }
    if (type === 'integer' || type === 'int' || type === 'number') {
        return 'integer';
    }
    if (type === 'object' || type === 'array' || type === 'json') {
        return 'json';
    }
    return 'string';
};

const normalizeAttribute = (attribute, required = false) => {
    const name = attribute?.name || attribute?.key;
    if (!name) {
        return null;
    }
    return {
        name,
        displayName: attribute?.displayName || attribute?.label || attribute?.title || humanizeName(name),
        version: attribute?.version || '',
        description: attribute?.description || attribute?.summary || '',
        required: Boolean(attribute?.required ?? required),
        type: normalizeAttributeType(attribute),
        validationRegex: attribute?.validationRegex || attribute?.pattern || '',
        defaultValue: attribute?.defaultValue ?? attribute?.default ?? attribute?.example ?? null,
        allowedValues: attribute?.allowedValues || attribute?.enum || attribute?.options || attribute?.values || [],
    };
};

const isAttributeArray = (value) =>
    Array.isArray(value)
    && value.length > 0
    && value.every((item) => item && typeof item === 'object' && (item.name || item.key));

const findAttributeArray = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return null;
    }
    if (isAttributeArray(obj)) {
        return obj;
    }
    for (const value of Object.values(obj)) {
        if (isAttributeArray(value)) {
            return value;
        }
    }
    for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
            const nested = findAttributeArray(value);
            if (nested) {
                return nested;
            }
        }
    }
    return null;
};

const findSchemaObject = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return null;
    }
    if (obj.properties && typeof obj.properties === 'object') {
        return obj;
    }
    for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
            const nested = findSchemaObject(value);
            if (nested) {
                return nested;
            }
        }
    }
    return null;
};

const getPolicyAttributesFromDefinition = (policyDefinitionText) => {
    if (!policyDefinitionText || typeof policyDefinitionText !== 'string') {
        return [];
    }
    let definition;
    try {
        definition = YAML.load(policyDefinitionText);
    } catch (error) {
        console.error('Failed to parse policy definition YAML', error);
        return [];
    }

    const attributeArray = findAttributeArray(definition);
    if (attributeArray) {
        return attributeArray
            .map((attribute) => normalizeAttribute(attribute))
            .filter(Boolean);
    }

    const getByPath = (source, path) => {
        let current = source;
        for (const key of path) {
            if (!current || typeof current !== 'object') {
                return null;
            }
            current = current[key];
        }
        return current;
    };

    const preferredSchemaPaths = [
        ['parametersSchema'],
        ['parameterSchema'],
        ['configSchema'],
        ['configurationSchema'],
        ['schema'],
        ['spec', 'schema'],
        ['spec', 'parametersSchema'],
        ['spec', 'configSchema'],
    ];

    let schemaObj = null;
    for (const path of preferredSchemaPaths) {
        const candidate = getByPath(definition, path);
        if (candidate && candidate.properties) {
            schemaObj = candidate;
            break;
        }
    }

    if (!schemaObj) {
        schemaObj = findSchemaObject(definition);
    }

    if (schemaObj && schemaObj.properties) {
        const requiredList = Array.isArray(schemaObj.required) ? schemaObj.required : [];
        return Object.entries(schemaObj.properties)
            .map(([name, schema]) =>
                normalizeAttribute({ name, ...schema }, requiredList.includes(name)),
            )
            .filter(Boolean);
    }

    return [];
};

const normalizeFlow = (flow) => {
    const value = typeof flow === 'string' ? flow.trim().toLowerCase() : '';
    if (!value) {
        return null;
    }
    if (value === 'request' || value === 'inbound') {
        return 'request';
    }
    if (value === 'response' || value === 'outbound') {
        return 'response';
    }
    if (value === 'fault' || value === 'error') {
        return 'fault';
    }
    return null;
};

const getApplicableFlows = (policy) => {
    const candidateFlows = policy?.applicableFlows
        || policy?.supportedFlows
        || policy?.flows
        || [];

    const normalizedFlows = [];
    (Array.isArray(candidateFlows) ? candidateFlows : [candidateFlows]).forEach((flow) => {
        const normalizedFlow = normalizeFlow(flow);
        if (normalizedFlow) {
            normalizedFlows.push(normalizedFlow);
        }
    });

    if (normalizedFlows.length > 0) {
        return [...new Set(normalizedFlows)];
    }

    // Keep Policy Hub behavior aligned with regular policy handling in Publisher.
    return ['request', 'response', 'fault'];
};

const toPolicySpec = (policy, policyDefinitionText) => {
    const supportedApiTypes = Configurations?.app?.policyHub?.supportedApiTypes || [
        'HTTP',
        'SOAP',
        'SOAPTOREST',
        'GRAPHQL',
        'WS',
        'SSE',
    ];

    return {
        id: buildPolicyId(policy.name, policy.version),
        category: policy.categories?.[0] || 'PolicyHub',
        name: policy.name,
        displayName: policy.displayName || policy.name,
        version: policy.version,
        description: policy.description || '',
        applicableFlows: getApplicableFlows(policy),
        supportedGateways: [CONSTS.GATEWAY_TYPE.apiPlatform],
        supportedApiTypes,
        policyAttributes: getPolicyAttributesFromDefinition(policyDefinitionText),
        isAPISpecific: false,
    };
};

const request = async (path, { method = 'GET', params, headers, body } = {}) => {
    const endpoint = getPolicyHubEndpoint();
    const url = new URL(`${endpoint}${path}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, value);
            }
        });
    }

    const response = await fetch(url.toString(), {
        method,
        headers: {
            Accept: 'application/json',
            ...(headers || {}),
        },
        body,
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const error = new Error(`Policy Hub request failed: ${response.status} ${response.statusText}`);
        error.details = errorText;
        throw error;
    }

    return response;
};

const listPolicies = async ({ offset = 0, limit = getPolicyHubLimit(), search, categories, providers } = {}) => {
    const params = {
        offset,
        limit,
        search,
        categories,
        providers,
    };
    const response = await request('/policies', { params });
    const body = await response.json();
    return body;
};

const listAllPolicies = async () => {
    const limit = getPolicyHubLimit();
    let offset = 0;
    let count = 0;
    const policies = [];

    do {
        // eslint-disable-next-line no-await-in-loop
        const response = await listPolicies({ offset, limit });
        const data = response?.data || [];
        if (data.length === 0) {
            break;
        }
        count = response?.count ?? data.length;
        policies.push(...data);
        offset += limit;
    } while (policies.length < count);

    return policies;
};

const getPolicyVersion = async (name, version) => {
    if (!name || !version) {
        return null;
    }
    const response = await request(`/policies/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}`);
    const body = await response.json();
    return body?.data || null;
};

const getPolicyDefinition = async (name, version) => {
    if (!name || !version) {
        return null;
    }
    const response = await request(
        `/policies/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}/definition`,
        { headers: { Accept: 'text/yaml' } },
    );
    const data = await response.text();
    return {
        data,
        contentType: response.headers.get('content-type') || 'text/yaml',
    };
};

const getPolicyDefinitionCached = async (name, version) => {
    const cacheKey = buildPolicyId(name, version);
    if (policyDefinitionCache.has(cacheKey)) {
        return policyDefinitionCache.get(cacheKey);
    }
    const definition = await getPolicyDefinition(name, version);
    if (definition) {
        policyDefinitionCache.set(cacheKey, definition);
    }
    return definition;
};

const getPolicySpec = async (policy) => {
    if (!policy) {
        return null;
    }
    const cacheKey = buildPolicyId(policy.name, policy.version);
    if (policySpecCache.has(cacheKey)) {
        return policySpecCache.get(cacheKey);
    }
    let definitionText;
    try {
        const definition = await getPolicyDefinitionCached(policy.name, policy.version);
        definitionText = definition?.data;
    } catch (error) {
        console.error(error);
    }
    const policySpec = toPolicySpec(policy, definitionText);
    policySpecCache.set(cacheKey, policySpec);
    return policySpec;
};

const listAllPolicySpecs = async () => {
    const policies = await listAllPolicies();
    const policySpecs = await Promise.all(
        policies.map(async (policy) => getPolicySpec(policy)),
    );
    return policySpecs.filter(Boolean);
};

export default {
    buildPolicyId,
    parsePolicyId,
    toPolicySpec,
    listAllPolicySpecs,
    getPolicySpec,
    getPolicyAttributesFromDefinition,
    listPolicies,
    listAllPolicies,
    getPolicyVersion,
    getPolicyDefinition,
};
