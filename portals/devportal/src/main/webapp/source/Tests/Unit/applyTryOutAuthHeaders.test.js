/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import {
    applyTryOutAuthHeaders,
    hasTryOutToken,
    removeSwaggerAuthorizationHeaders,
} from 'AppComponents/Apis/Details/ApiConsole/applyTryOutAuthHeaders';
import { requestObjectToCurl } from 'AppComponents/Apis/Details/ApiConsole/buildTryoutCurlRequest';

describe('applyTryOutAuthHeaders (product-apim#11242)', () => {
    it('removes Swagger OAuth Authorization headers', () => {
        expect(removeSwaggerAuthorizationHeaders({
            Authorization: 'Bearer ',
            Accept: 'application/json',
        })).toEqual({
            Accept: 'application/json',
        });
    });

    it('sets the API key header and drops Authorization for API-KEY try-out', () => {
        const req = applyTryOutAuthHeaders({
            method: 'GET',
            url: 'https://localhost:8243/pizzashack/1.0.0/menu',
            headers: {
                Authorization: 'Bearer ',
                Accept: 'application/json',
            },
        }, {
            securitySchemeType: 'API-KEY',
            authorizationHeader: 'apikey',
            token: 'test-api-key-value',
            isAdvertised: false,
        });

        expect(req.headers).toEqual({
            Accept: 'application/json',
            apikey: 'test-api-key-value',
        });
    });

    it('does not emit Authorization in generated cURL for API-KEY try-out', () => {
        const req = applyTryOutAuthHeaders({
            method: 'GET',
            url: 'https://localhost:8243/pizzack/1.0.0/menu',
            headers: { Authorization: 'Bearer ' },
        }, {
            securitySchemeType: 'API-KEY',
            authorizationHeader: 'apikey',
            token: 'test-api-key-value',
            isAdvertised: false,
        });

        const curl = requestObjectToCurl(req);
        expect(curl).toContain("apikey: test-api-key-value");
        expect(curl).not.toMatch(/Authorization:/i);
    });

    it('keeps Bearer Authorization for OAuth try-out', () => {
        const req = applyTryOutAuthHeaders({
            method: 'GET',
            url: 'https://localhost:8243/pizzack/1.0.0/menu',
            headers: { Accept: 'application/json' },
        }, {
            securitySchemeType: 'OAUTH',
            authorizationHeader: 'Authorization',
            token: 'oauth-access-token',
            isAdvertised: false,
        });

        expect(req.headers.Authorization).toBe('Bearer oauth-access-token');
    });
});

describe('hasTryOutToken', () => {
    it('returns false for empty and placeholder values', () => {
        expect(hasTryOutToken('')).toBe(false);
        expect(hasTryOutToken('undefined')).toBe(false);
        expect(hasTryOutToken('null')).toBe(false);
    });

    it('returns true for a non-empty token', () => {
        expect(hasTryOutToken('abc123')).toBe(true);
    });
});
