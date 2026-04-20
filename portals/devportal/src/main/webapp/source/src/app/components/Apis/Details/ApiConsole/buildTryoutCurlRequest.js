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

import { Map as ImmutableMap } from 'immutable';
import parseUrl from 'url-parse';

/**
 * Minimal param value lookup for allowEmptyValue handling (aligned with swagger-ui spec/actions).
 * @param {import('immutable').Map} param Immutable parameter map
 * @param {object} paramValues plain parameter hash from specSelectors.parameterValues
 * @returns {unknown}
 */
function paramToValueSimple(param, paramValues) {
    const name = param.get('name');
    const inType = param.get('in');
    const candidates = [name, `${inType}.${name}`];
    for (let i = 0; i < candidates.length; i += 1) {
        const id = candidates[i];
        if (paramValues[id] !== undefined) {
            return paramValues[id];
        }
    }
    return undefined;
}

function isEmptyValueSimple(value) {
    if (!value) {
        return true;
    }
    if (value && typeof value.isEmpty === 'function') {
        return value.isEmpty();
    }
    return false;
}

/**
 * Builds the same HTTP request object Swagger UI would send (after requestInterceptor), without executing fetch.
 *
 * @param {function(): object} getSystem swagger-ui getSystem
 * @param {{ path: string, method: string, operation: import('immutable').Map }} pathMethodOp
 * @returns {Promise<object>}
 */
export async function buildMutatedSwaggerRequest(getSystem, { path, method, operation }) {
    const system = getSystem();
    const {
        fn, specSelectors, getConfigs, oas3Selectors,
    } = system;
    const spec = specSelectors.specJsonWithResolvedSubtrees().toJS();
    const scheme = specSelectors.operationScheme(path, method);
    const { requestContentType, responseContentType } = specSelectors
        .contentTypeValues([path, method])
        .toJS();
    const isXml = /xml/i.test(requestContentType);
    const parameters = specSelectors.parameterValues([path, method], isXml).toJS();

    const req = {
        fetch: fn.fetch,
        spec,
        pathName: path,
        method,
        parameters,
        requestContentType,
        scheme,
        responseContentType,
        operation,
    };

    const op = (operation && typeof operation.toJS === 'function')
        ? operation.toJS()
        : undefined;

    if (operation && operation.get('parameters')) {
        operation.get('parameters')
            .filter((param) => param && param.get('allowEmptyValue') === true)
            .forEach((param) => {
                if (specSelectors.parameterInclusionSettingFor(
                    [path, method],
                    param.get('name'),
                    param.get('in'),
                )) {
                    const nextParams = req.parameters || {};
                    req.parameters = nextParams;
                    const paramValue = paramToValueSimple(param, req.parameters);
                    if (!paramValue || paramValue.size === 0) {
                        req.parameters[param.get('name')] = '';
                    }
                }
            });
    }

    req.contextUrl = parseUrl(specSelectors.url()).toString();

    if (op && op.operationId) {
        req.operationId = op.operationId;
    } else if (op && path && method) {
        req.operationId = fn.opId(op, path, method);
    }

    if (specSelectors.isOAS3()) {
        const namespace = `${path}:${method}`;
        req.server = oas3Selectors.selectedServer(namespace) || oas3Selectors.selectedServer();

        const namespaceVariables = oas3Selectors.serverVariables({
            server: req.server,
            namespace,
        }).toJS();
        const globalVariables = oas3Selectors.serverVariables({ server: req.server }).toJS();

        req.serverVariables = Object.keys(namespaceVariables).length ? namespaceVariables : globalVariables;

        req.requestContentType = oas3Selectors.requestContentType(path, method);
        req.responseContentType = oas3Selectors.responseContentType(path, method) || '*/*';
        const requestBody = oas3Selectors.requestBodyValue(path, method);
        const requestBodyInclusionSetting = oas3Selectors.requestBodyInclusionSetting(path, method);

        if (requestBody && requestBody.toJS) {
            req.requestBody = requestBody
                .map((val) => {
                    if (ImmutableMap.isMap(val)) {
                        return val.get('value');
                    }
                    return val;
                })
                .filter(
                    (value, key) => (Array.isArray(value)
                        ? value.length !== 0
                        : !isEmptyValueSimple(value))
                        || requestBodyInclusionSetting.get(key),
                )
                .toJS();
        } else {
            req.requestBody = requestBody;
        }
    }

    let parsedRequest = { ...req };
    parsedRequest = fn.buildRequest(parsedRequest);

    const { requestInterceptor = (r) => Promise.resolve(r) } = getConfigs();
    const mutated = await requestInterceptor({ ...parsedRequest });
    return mutated;
}

function escapeShellSingleQuotes(value) {
    return String(value).replace(/'/g, '\'\\\'\'');
}

/**
 * @param {object} req mutated request from swagger-client (url, method, headers, body, ...)
 * @returns {string}
 */
export function requestObjectToCurl(req) {
    const method = (req.method || 'GET').toUpperCase();
    const url = req.url || '';
    const lines = [`curl -X '${method}'`, `  '${escapeShellSingleQuotes(url)}'`];

    const headers = req.headers && typeof req.headers === 'object' ? req.headers : {};
    Object.keys(headers).forEach((key) => {
        const val = headers[key];
        if (val === undefined || val === null || val === '') {
            return;
        }
        lines.push(`  -H '${escapeShellSingleQuotes(`${key}: ${val}`)}'`);
    });

    if (req.body !== undefined && req.body !== null && req.body !== '') {
        if (typeof FormData !== 'undefined' && req.body instanceof FormData) {
            lines.push('# multipart/form-data: add -F fields manually for file uploads');
        } else if (typeof req.body === 'string') {
            lines.push(`  -d '${escapeShellSingleQuotes(req.body)}'`);
        } else {
            try {
                lines.push(`  -d '${escapeShellSingleQuotes(JSON.stringify(req.body))}'`);
            } catch {
                lines.push('# (request body could not be converted to curl)');
            }
        }
    }

    return lines.join(' \\\n');
}
