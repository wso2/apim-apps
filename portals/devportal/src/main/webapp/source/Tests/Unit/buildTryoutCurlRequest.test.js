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

import { requestObjectToCurl } from 'AppComponents/Apis/Details/ApiConsole/buildTryoutCurlRequest';

describe('requestObjectToCurl', () => {
    describe('method and URL', () => {
        it('renders method uppercased with URL on the first two lines', () => {
            const curl = requestObjectToCurl({
                url: 'https://localhost:8244/akch/1.0.0/pizza',
                method: 'get',
                headers: {},
            });
            expect(curl).toMatch(/^curl -X 'GET' \\\n {2}'https:\/\/localhost:8244\/akch\/1\.0\.0\/pizza'/);
        });

        it('defaults method to GET when method is missing', () => {
            const curl = requestObjectToCurl({
                url: 'https://localhost:8244/x',
                headers: {},
            });
            expect(curl.startsWith("curl -X 'GET'")).toBe(true);
        });

        it('handles an empty URL without throwing', () => {
            const curl = requestObjectToCurl({ method: 'POST' });
            expect(curl).toContain("curl -X 'POST'");
            expect(curl).toContain("''");
        });

        it("escapes single quotes in the URL so the shell doesn't break", () => {
            const curl = requestObjectToCurl({
                url: "https://localhost/quote'in'url",
                method: 'GET',
                headers: {},
            });
            // Every `'` in the source must become the shell-safe `'\''` sequence.
            expect(curl).toContain("'https://localhost/quote'\\''in'\\''url'");
        });
    });

    describe('API-KEY header — regression for Problem 1 (issue #4962)', () => {
        it("uses the API's configured custom header name (e.g. X-Custom-Key) for Platform gateway APIs", () => {
            // Simulates the request the swagger-ui requestInterceptor produces for a
            // Platform gateway API with apiKeyHeader='X-Custom-Key' after the fix.
            const curl = requestObjectToCurl({
                url: 'https://localhost:8244/akch/1.0.0/pizza',
                method: 'GET',
                headers: {
                    accept: '*/*',
                    'X-Custom-Key': 'DUMMY_API_KEY_TOKEN_123',
                },
            });
            expect(curl).toContain("-H 'X-Custom-Key: DUMMY_API_KEY_TOKEN_123'");
            // Critically, we must NOT see the hard-coded 'ApiKey' header name —
            // that was the bug.
            expect(curl).not.toMatch(/-H 'ApiKey:/);
        });

        it("falls back to the default 'ApiKey' header when apiKeyHeader is unset on the API", () => {
            const curl = requestObjectToCurl({
                url: 'https://localhost:8244/x/1.0.0/pizza',
                method: 'GET',
                headers: {
                    accept: '*/*',
                    ApiKey: 'DUMMY_API_KEY_TOKEN_123',
                },
            });
            expect(curl).toContain("-H 'ApiKey: DUMMY_API_KEY_TOKEN_123'");
        });
    });

    describe('OAUTH / BASIC header — regression for Problem 2 (issue #4962)', () => {
        it('emits the real Bearer token, not the literal <ACCESS_TOKEN> placeholder', () => {
            const curl = requestObjectToCurl({
                url: 'https://localhost:8244/akch2/1.0.0/pizza',
                method: 'GET',
                headers: {
                    accept: '*/*',
                    Authorization: 'Bearer REAL_BEARER_TOKEN_abc123',
                },
            });
            expect(curl).toContain("-H 'Authorization: Bearer REAL_BEARER_TOKEN_abc123'");
            expect(curl).not.toContain('<ACCESS_TOKEN>');
        });

        it('emits real Basic credentials, not the literal <BASE64_CREDENTIALS> placeholder', () => {
            const curl = requestObjectToCurl({
                url: 'https://localhost:8244/x/1.0.0/pizza',
                method: 'GET',
                headers: {
                    accept: '*/*',
                    Authorization: 'Basic YWRtaW46YWRtaW4=',
                },
            });
            expect(curl).toContain("-H 'Authorization: Basic YWRtaW46YWRtaW4='");
            expect(curl).not.toContain('<BASE64_CREDENTIALS>');
        });
    });

    describe('header serialization — edge cases', () => {
        it('skips headers whose value is undefined, null, or empty string', () => {
            const curl = requestObjectToCurl({
                url: 'https://x',
                method: 'GET',
                headers: {
                    accept: '*/*',
                    'X-Empty': '',
                    'X-Null': null,
                    'X-Undef': undefined,
                    'X-Keep': 'kept',
                },
            });
            expect(curl).toContain("-H 'accept: */*'");
            expect(curl).toContain("-H 'X-Keep: kept'");
            expect(curl).not.toContain('X-Empty');
            expect(curl).not.toContain('X-Null');
            expect(curl).not.toContain('X-Undef');
        });

        it('handles a missing or non-object headers field as empty', () => {
            expect(() => requestObjectToCurl({
                url: 'https://x', method: 'GET',
            })).not.toThrow();
            expect(() => requestObjectToCurl({
                url: 'https://x', method: 'GET', headers: null,
            })).not.toThrow();
            const curl = requestObjectToCurl({
                url: 'https://x', method: 'GET', headers: 'notAnObject',
            });
            expect(curl).not.toContain('-H');
        });

        it("escapes single quotes embedded in header values", () => {
            const curl = requestObjectToCurl({
                url: 'https://x',
                method: 'GET',
                headers: { 'X-Weird': "he said 'hi'" },
            });
            expect(curl).toContain("-H 'X-Weird: he said '\\''hi'\\'''");
        });
    });

    describe('body handling', () => {
        it('omits -d when body is missing on GET', () => {
            const curl = requestObjectToCurl({
                url: 'https://x', method: 'GET', headers: {},
            });
            expect(curl).not.toContain('-d');
        });

        it('passes through a string body as-is with single-quote escaping', () => {
            const curl = requestObjectToCurl({
                url: 'https://x',
                method: 'POST',
                headers: { 'content-type': 'text/plain' },
                body: "raw 'quoted' text",
            });
            expect(curl).toContain("-d 'raw '\\''quoted'\\'' text'");
        });

        it('JSON-stringifies a plain-object body', () => {
            const curl = requestObjectToCurl({
                url: 'https://x',
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: { hello: 'world', n: 1 },
            });
            expect(curl).toContain("-d '{\"hello\":\"world\",\"n\":1}'");
        });

        it('emits a fallback comment for FormData bodies', () => {
            const form = new FormData();
            form.append('file', 'x');
            const curl = requestObjectToCurl({
                url: 'https://x',
                method: 'POST',
                headers: { 'content-type': 'multipart/form-data' },
                body: form,
            });
            expect(curl).toContain('# multipart/form-data');
            expect(curl).not.toMatch(/-d '/);
        });

        it('skips body when it is null, undefined, or empty string', () => {
            [null, undefined, ''].forEach((body) => {
                const curl = requestObjectToCurl({
                    url: 'https://x', method: 'POST', headers: {}, body,
                });
                expect(curl).not.toContain('-d');
            });
        });
    });
});
