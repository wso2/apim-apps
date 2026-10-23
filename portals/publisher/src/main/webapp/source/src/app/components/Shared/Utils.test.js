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
    test.each([
        ['APIPRODUCT', '/api-products/'],
        ['apiproduct', '/api-products/'],
        ['MCP', '/mcp-servers/'],
        ['mcp', '/mcp-servers/'],
        ['API', '/apis/'],
        ['', '/apis/'],
        [null, '/apis/'],
        [undefined, '/apis/'],
    ])('given type "%s", returns "%s"', (type, expected) => {
        expect(getBasePath(type)).toBe(expected);
    });
});

describe('Shared Utils - getTypeToDisplay', () => {
    test.each([
        ['APIPRODUCT', 'API Product'],
        ['apiproduct', 'API Product'],
        ['MCP', 'MCP Server'],
        ['mcp', 'MCP Server'],
        ['API', 'API'],
        ['', 'API'],
        [null, 'API'],
        [undefined, 'API'],
        ['UNKNOWN', 'API'],
    ])('given type "%s", returns "%s"', (type, expected) => {
        expect(getTypeToDisplay(type)).toBe(expected);
    });
});

describe('Shared Utils - getDefaultSubscriptionPolicy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockApiResponse = (list) => {
        API.policies.mockResolvedValue({ body: { list } });
    };

    it('returns default subscription policy if present', async () => {
        mockApiResponse([{ name: 'Bronze' }, { name: 'Silver' }, { name: 'Gold' }]);
        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'Silver', 'Gold');
        expect(policy).toEqual(['Silver']);
    });

    it('falls back to fallback policy when default policy is absent', async () => {
        mockApiResponse([{ name: 'Bronze' }, { name: 'Gold' }]);
        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'Missing', 'Gold');
        expect(policy).toEqual(['Gold']);
    });

    it('selects first policy when neither default nor fallback match', async () => {
        mockApiResponse([{ name: 'Bronze' }, { name: 'Silver' }]);
        const policy = await getDefaultSubscriptionPolicy('subscription', false, 'None1', 'None2');
        expect(policy).toEqual(['Bronze']);
    });

    it('returns empty array when policy list is empty or API call fails', async () => {
        mockApiResponse([]);
        expect(await getDefaultSubscriptionPolicy('subscription', false, 'Silver')).toEqual([]);

        API.policies.mockRejectedValue(new Error('Network error'));
        expect(await getDefaultSubscriptionPolicy('subscription', false, 'Silver')).toEqual([]);
    });
});
