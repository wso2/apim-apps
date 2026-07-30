/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
 * Pick the first non-empty URL from a URL map.
 * Priority: https > wss > http > ws, then any remaining keys as a fallback.
 *
 * @param {Object|null|undefined} urls  Map of protocol keys to URL strings,
 *                                      e.g. { http: '...', https: '...', ws: '...', wss: '...' }
 * @returns {string} The chosen URL, or '' when nothing is available.
 */
export const pickFirstEnabledUrl = (urls) => {
    if (!urls || typeof urls !== 'object') {
        return '';
    }
    const priorityKeys = ['https', 'wss', 'http', 'ws'];
    for (const key of priorityKeys) {
        const val = urls[key];
        if (typeof val === 'string' && val.trim() !== '') {
            return val;
        }
    }
    // Fallback: return the first non-empty value for any non-standard keys.
    return Object.values(urls).find((val) => typeof val === 'string' && val.trim() !== '') || '';
};

/**
 * Pick the first non-empty WebSocket URL from a URL map.
 * Priority: ws > wss.
 *
 * @param {Object|null|undefined} urls  Map of protocol keys to URL strings.
 * @returns {string} The chosen URL, or '' when no WS URL is available.
 */
export const pickFirstEnabledWSUrl = (urls) => {
    if (!urls || typeof urls !== 'object') {
        return '';
    }
    const keys = ['ws', 'wss'];
    for (const key of keys) {
        const val = urls[key];
        if (typeof val === 'string' && val.trim() !== '') {
            return val;
        }
    }
    return '';
};

/**
 * Returns true when the URL map contains at least one non-empty value.
 *
 * @param {Object|null|undefined} urls  Map of protocol keys to URL strings.
 * @returns {boolean}
 */
export const hasURLs = (urls) => {
    if (!urls || typeof urls !== 'object') {
        return false;
    }
    return Object.values(urls).some((val) => typeof val === 'string' && val.trim() !== '');
};
