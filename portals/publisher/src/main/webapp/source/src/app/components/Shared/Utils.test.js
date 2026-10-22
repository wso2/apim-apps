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

import API from 'AppData/api';
import { getBasePath, getTypeToDisplay, getDefaultSubscriptionPolicy } from './Utils';

jest.mock('AppData/api', () => ({
    policies: jest.fn(),
    getApiEndpoint: jest.fn(),
    getLLMProviderEndpointConfiguration: jest.fn(),
}));

describe('Shared Utils - getBasePath', () => {
    it('returns /api-products/ for APIPRODUCT type', () => {
        expect(getBasePath('APIPRODUCT')).toBe('/api-products/');
    });

    it('returns /api-products/ for lowercase apiproduct type', () => {
        expect(getBasePath('apiproduct')).toBe('/api-products/');
    });

    it('returns /mcp-servers/ for MCP type', () => {
        expect(getBasePath('MCP')).toBe('/mcp-servers/');
    });

    it('returns /mcp-servers/ for lowercase mcp type', () => {
        expect(getBasePath('mcp')).toBe('/mcp-servers/');
    });

    it('returns /apis/ for default API type', () => {
        expect(getBasePath('API')).toBe('/apis/');
    });

    it('returns /apis/ for undefined or empty input', () => {
        expect(getBasePath()).toBe('/apis/');
        expect(getBasePath('')).toBe('/apis/');
        expect(getBasePath(null)).toBe('/apis/');
    });
});

describe('Shared Utils - getTypeToDisplay', () => {
    it('returns "API Product" for APIPRODUCT type', () => {
        expect(getTypeToDisplay('APIPRODUCT')).toBe('API Product');
    });

    it('returns "API Product" for case-insensitive apiproduct', () => {
        expect(getTypeToDisplay('apiproduct')).toBe('API Product');
    });

    it('returns "MCP Server" for MCP type', () => {
        expect(getTypeToDisplay('MCP')).toBe('MCP Server');
    });

    it('returns "MCP Server" for case-insensitive mcp', () => {
        expect(getTypeToDisplay('mcp')).toBe('MCP Server');
    });

    it('returns "API" for standard API type', () => {
        expect(getTypeToDisplay('API')).toBe('API');
    });

    it('returns "API" for undefined, null, or unknown types', () => {
        expect(getTypeToDisplay()).toBe('API');
        expect(getTypeToDisplay(null)).toBe('API');
        expect(getTypeToDisplay('')).toBe('API');
        expect(getTypeToDisplay('OTHER')).toBe('API');
    });
});

describe('Shared Utils - getDefaultSubscriptionPolicy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default subscription policy if found in the list', async () => {
        API.policies.mockResolvedValue({
            body: {
                list: [
                    { name: 'Bronze' },
                    { name: 'Silver' },
                    { name: 'Gold' },
                ],
            },
        });

        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'Silver', 'Gold');
        expect(policy).toEqual(['Silver']);
    });

    it('falls back to fallback policy if default subscription policy is not found', async () => {
        API.policies.mockResolvedValue({
            body: {
                list: [
                    { name: 'Bronze' },
                    { name: 'Gold' },
                ],
            },
        });

        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'NonExistent', 'Gold');
        expect(policy).toEqual(['Gold']);
    });

    it('returns first available policy when neither default nor fallback match', async () => {
        API.policies.mockResolvedValue({
            body: {
                list: [
                    { name: 'Bronze' },
                    { name: 'Silver' },
                ],
            },
        });

        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'NonExistent', 'AlsoNonExistent');
        expect(policy).toEqual(['Bronze']);
    });

    it('returns empty array when policy list is empty', async () => {
        API.policies.mockResolvedValue({
            body: {
                list: [],
            },
        });

        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'Silver', 'Gold');
        expect(policy).toEqual([]);
    });

    it('handles API errors gracefully and returns empty array', async () => {
        API.policies.mockRejectedValue(new Error('Network error'));

        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'Silver', 'Gold');
        expect(policy).toEqual([]);
    });
});
