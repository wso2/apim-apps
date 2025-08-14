/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import moment from 'moment';

// Constants for entity types
export const ENTITY_TYPES = {
    APIS: 'apis',
    API_PRODUCTS: 'api-products',
    MCP_SERVERS: 'mcp-servers'
};

// Constants for pagination configuration
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 5,
    DEFAULT_PAGE: 1
};

// Helper functions
export const formatUpdatedTime = (updatedTime) => {
    if (!updatedTime) return 'N/A';
    return moment(parseInt(updatedTime, 10)).fromNow();
};

// Helper function to get detail path for navigation
export const getDetailPath = (type, id) => {
    if (type === ENTITY_TYPES.APIS) {
        return `/apis/${id}/overview`;
    } else if (type === ENTITY_TYPES.API_PRODUCTS) {
        return `/api-products/${id}/overview`;
    } else {
        return `/mcp-servers/${id}/overview`;
    }
};
