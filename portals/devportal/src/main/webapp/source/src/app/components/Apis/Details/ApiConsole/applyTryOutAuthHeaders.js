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

/**
 * Swagger UI injects OAuth {@code Authorization} headers from the OpenAPI security
 * schemes. For API-key try-out that leaves an empty {@code Authorization} header
 * in generated cURL (product-apim#11242).
 *
 * @param {Record<string, string>} headers
 * @returns {Record<string, string>}
 */
export function removeSwaggerAuthorizationHeaders(headers) {
    const next = { ...headers };
    delete next.Authorization;
    delete next.authorization;
    return next;
}

/**
 * @param {unknown} token
 * @returns {boolean}
 */
export function hasTryOutToken(token) {
    if (token === undefined || token === null) {
        return false;
    }
    const normalized = String(token).trim();
    if (normalized === '') {
        return false;
    }
    const lower = normalized.toLowerCase();
    return lower !== 'undefined' && lower !== 'null';
}

/**
 * Applies Dev Portal try-out authentication headers to a Swagger UI request.
 *
 * @param {object} req swagger-client request object
 * @param {object} options
 * @param {string} options.securitySchemeType OAUTH | API-KEY | BASIC | TEST
 * @param {string} options.authorizationHeader header name configured for the API
 * @param {unknown} options.token credential from accessTokenProvider()
 * @param {boolean} options.isAdvertised whether the API is an advertised external API
 * @returns {object}
 */
export function applyTryOutAuthHeaders(req, {
    securitySchemeType,
    authorizationHeader,
    token,
    isAdvertised,
}) {
    const normalizedToken = (token === undefined || token === null) ? '' : String(token).trim();
    const hasToken = hasTryOutToken(token);
    const headers = removeSwaggerAuthorizationHeaders(req.headers || {});

    if (securitySchemeType === 'API-KEY') {
        if (authorizationHeader && hasToken) {
            headers[authorizationHeader] = normalizedToken;
        }
    } else if (securitySchemeType === 'BASIC') {
        if (authorizationHeader && hasToken) {
            headers[authorizationHeader] = `Basic ${normalizedToken}`;
        }
    } else if (securitySchemeType === 'TEST') {
        if (authorizationHeader && hasToken) {
            headers[authorizationHeader] = normalizedToken;
        }
    } else if (isAdvertised) {
        if (authorizationHeader && hasToken) {
            headers[authorizationHeader] = normalizedToken;
        }
    } else if (authorizationHeader && hasToken) {
        headers[authorizationHeader] = `Bearer ${normalizedToken}`;
    }

    return {
        ...req,
        headers,
    };
}
