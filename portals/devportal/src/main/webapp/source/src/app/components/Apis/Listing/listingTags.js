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

/**
 * Type clause used when an API listing tag is selected.
 * Matches the devportal API search scope (every non-MCP type, including API products).
 */
export const API_TAG_LISTING_TYPES = 'type:HTTP type:WS type:SOAPTOREST type:GRAPHQL type:SOAP '
    + 'type:SSE type:WEBSUB type:WEBHOOK type:ASYNC type:APIProduct';

/**
 * Type clause used when an MCP Server listing tag is selected.
 */
export const MCP_TAG_LISTING_TYPES = 'type:MCP';

/**
 * Decide which artifact collection the current DevPortal route is showing.
 * Unified search keeps the combined tag list.
 * @param {string} pathname window location pathname
 * @returns {'api'|'mcp'|null} listing whose tags should be shown
 */
export function resolveTagListingType(pathname = '') {
    if (pathname.includes('/mcp-servers')) {
        return 'mcp';
    }
    if (pathname.includes('/search')) {
        return null;
    }
    return 'api';
}

/**
 * Build the tag search used by the sidebar click and by the tag membership check.
 * GET /tags does not accept a type filter, so membership is resolved with this query.
 * @param {string} tagValue tag name
 * @param {'api'|'mcp'} listingType current listing
 * @returns {string} devportal search query
 */
export function buildTagListingQuery(tagValue, listingType) {
    const typeQuery = listingType === 'mcp' ? MCP_TAG_LISTING_TYPES : API_TAG_LISTING_TYPES;
    return `tag:${tagValue} ${typeQuery}`;
}

/**
 * Number of artifacts matched by a list or search response.
 * @param {Object} response swagger-client response
 * @returns {number} matched count, or 0 when the payload has no matches
 */
export function getTagMatchCount(response) {
    const body = response && response.body;
    if (!body) {
        return 0;
    }
    const { pagination } = body;
    if (pagination && pagination.total !== undefined && pagination.total !== null && pagination.total !== '') {
        const total = Number(pagination.total);
        if (Number.isFinite(total)) {
            return total;
        }
    }
    return Array.isArray(body.list) ? body.list.length : 0;
}

/**
 * Drop tags that are not used by the current listing.
 * A failed lookup keeps the tag so a transport error does not hide tags the user can open.
 * @param {Array<{value: string, count: number}>} tags tags returned by GET /tags
 * @param {'api'|'mcp'|null} listingType listing to filter for; null returns the tags unchanged
 * @param {function(string): Promise<number>} countMatching resolves the match count for a search query
 * @returns {Promise<Array>} tags that belong to the listing, with counts limited to that listing
 */
export function filterTagsForListing(tags, listingType, countMatching) {
    const list = Array.isArray(tags) ? tags : [];
    if (listingType !== 'api' && listingType !== 'mcp') {
        return Promise.resolve(list);
    }
    const lookups = list.map((tag) => {
        if (!tag || typeof tag.value !== 'string' || tag.value.length === 0) {
            return Promise.resolve(null);
        }
        return countMatching(buildTagListingQuery(tag.value, listingType))
            .then((count) => {
                const matchCount = Number(count);
                if (!Number.isFinite(matchCount) || matchCount <= 0) {
                    return null;
                }
                return { ...tag, count: matchCount };
            })
            .catch(() => tag);
    });
    return Promise.all(lookups).then((results) => results.filter((tag) => tag));
}
