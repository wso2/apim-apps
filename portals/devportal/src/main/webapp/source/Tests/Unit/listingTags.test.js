/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
    buildTagListingQuery,
    filterTagsForListing,
    getTagMatchCount,
    resolveTagListingType,
} from 'AppComponents/Apis/Listing/listingTags';

const API_TYPE_QUERY = 'type:HTTP type:WS type:SOAPTOREST type:GRAPHQL type:SOAP '
    + 'type:SSE type:WEBSUB type:WEBHOOK type:ASYNC type:APIProduct';

describe('listingTags', () => {
    test('resolves the sidebar listing from the devportal route', () => {
        expect(resolveTagListingType('/devportal/apis')).toBe('api');
        expect(resolveTagListingType('/devportal/mcp-servers')).toBe('mcp');
        expect(resolveTagListingType('/devportal/search')).toBe(null);
    });

    test('builds the tag query used when a sidebar tag is clicked', () => {
        expect(buildTagListingQuery('pizza', 'api')).toBe(`tag:pizza ${API_TYPE_QUERY}`);
        expect(buildTagListingQuery('mcp', 'mcp')).toBe('tag:mcp type:MCP');
    });

    test('reads the matched total from a list response', () => {
        expect(getTagMatchCount({ body: { pagination: { total: 2 }, list: [{}] } })).toBe(2);
        expect(getTagMatchCount({ body: { pagination: { total: '0' }, list: [] } })).toBe(0);
        expect(getTagMatchCount({ body: { list: [{}] } })).toBe(1);
        expect(getTagMatchCount({})).toBe(0);
    });

    test('keeps only tags that the current listing search can open', async () => {
        const tags = [
            { value: 'pizza', count: 1 },
            { value: 'mcp', count: 4 },
            { value: 'shared', count: 9 },
        ];
        const filtered = await filterTagsForListing(tags, 'api', (query) => {
            if (query.startsWith('tag:pizza ')) {
                return Promise.resolve(0);
            }
            if (query.startsWith('tag:mcp ')) {
                return Promise.resolve(3);
            }
            return Promise.resolve(2);
        });
        expect(filtered.map((tag) => tag.value)).toEqual(['mcp', 'shared']);
        expect(filtered.find((tag) => tag.value === 'mcp').count).toBe(3);
        expect(filtered.find((tag) => tag.value === 'shared').count).toBe(2);
    });

    test('leaves the combined tag list unchanged for unified search', async () => {
        const tags = [{ value: 'pizza', count: 1 }];
        const probe = jest.fn();
        await expect(filterTagsForListing(tags, null, probe)).resolves.toEqual(tags);
        expect(probe).not.toHaveBeenCalled();
    });

    test('keeps a tag when its membership lookup fails', async () => {
        const tags = [{ value: 'pizza', count: 2 }];
        const filtered = await filterTagsForListing(tags, 'mcp', () => Promise.reject(new Error('down')));
        expect(filtered).toEqual(tags);
    });
});
