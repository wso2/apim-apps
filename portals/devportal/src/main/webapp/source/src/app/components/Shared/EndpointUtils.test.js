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

import { pickFirstEnabledUrl, pickFirstEnabledWSUrl, hasURLs } from './EndpointUtils';

describe('EndpointUtils - pickFirstEnabledUrl', () => {
    it('returns https url when multiple protocol URLs are provided', () => {
        const urls = {
            http: 'http://api.example.com',
            https: 'https://api.example.com',
            ws: 'ws://api.example.com',
        };
        expect(pickFirstEnabledUrl(urls)).toBe('https://api.example.com');
    });

    it('falls back to wss when https is not present', () => {
        const urls = {
            http: 'http://api.example.com',
            wss: 'wss://api.example.com',
        };
        expect(pickFirstEnabledUrl(urls)).toBe('wss://api.example.com');
    });

    it('falls back to http when neither https nor wss is present', () => {
        const urls = {
            http: 'http://api.example.com',
            ws: 'ws://api.example.com',
        };
        expect(pickFirstEnabledUrl(urls)).toBe('http://api.example.com');
    });

    it('returns custom protocol URL when standard protocols are missing', () => {
        const urls = {
            custom: 'custom://api.example.com',
        };
        expect(pickFirstEnabledUrl(urls)).toBe('custom://api.example.com');
    });

    it('returns empty string for null, undefined, or empty object', () => {
        expect(pickFirstEnabledUrl(null)).toBe('');
        expect(pickFirstEnabledUrl(undefined)).toBe('');
        expect(pickFirstEnabledUrl({})).toBe('');
    });

    it('ignores empty strings and whitespace-only URLs', () => {
        const urls = {
            https: '   ',
            http: 'http://api.example.com',
        };
        expect(pickFirstEnabledUrl(urls)).toBe('http://api.example.com');
    });
});

describe('EndpointUtils - pickFirstEnabledWSUrl', () => {
    it('prefers ws over wss when both are present', () => {
        const urls = {
            ws: 'ws://api.example.com',
            wss: 'wss://api.example.com',
        };
        expect(pickFirstEnabledWSUrl(urls)).toBe('ws://api.example.com');
    });

    it('returns wss when ws is not present', () => {
        const urls = {
            wss: 'wss://api.example.com',
            http: 'http://api.example.com',
        };
        expect(pickFirstEnabledWSUrl(urls)).toBe('wss://api.example.com');
    });

    it('returns empty string when no WebSocket URL is present', () => {
        const urls = {
            http: 'http://api.example.com',
            https: 'https://api.example.com',
        };
        expect(pickFirstEnabledWSUrl(urls)).toBe('');
        expect(pickFirstEnabledWSUrl(null)).toBe('');
        expect(pickFirstEnabledWSUrl({})).toBe('');
    });
});

describe('EndpointUtils - hasURLs', () => {
    it('returns true when valid URLs are present', () => {
        expect(hasURLs({ https: 'https://api.example.com' })).toBe(true);
    });

    it('returns false for null, undefined, or empty object', () => {
        expect(hasURLs(null)).toBe(false);
        expect(hasURLs(undefined)).toBe(false);
        expect(hasURLs({})).toBe(false);
    });

    it('returns false when all values are empty strings or whitespace', () => {
        expect(hasURLs({ https: '', http: '   ' })).toBe(false);
    });
});
