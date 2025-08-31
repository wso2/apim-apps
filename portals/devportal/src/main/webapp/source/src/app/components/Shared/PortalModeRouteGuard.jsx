/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { ResourceNotFound } from 'AppComponents/Base/Errors';
import { usePortalMode, PORTAL_MODES } from 'AppUtils/PortalModeUtils';

/**
 * Route guard component that blocks access based on portal mode
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is allowed
 * @returns {React.ReactNode} Either children or ResourceNotFound component
 */
const PortalModeRouteGuard = ({ children }) => {
    const portalMode = usePortalMode();
    const location = useLocation();
    const currentPath = location.pathname;

    // Check if current path should be blocked based on portal mode
    const getBlockedResourceInfo = () => {
        // Block /apis routes in MCP_ONLY mode
        if (portalMode === PORTAL_MODES.MCP_ONLY && currentPath.startsWith('/apis')) {
            return {
                blocked: true,
                title: 'APIs Not Available',
                body: 'API access is not available in this portal mode.',
            };
        }

        // Block /mcp-servers routes in API_ONLY mode
        if (portalMode === PORTAL_MODES.API_ONLY && currentPath.startsWith('/mcp-servers')) {
            return {
                blocked: true,
                title: 'MCP Servers Not Available',
                body: 'MCP Server access is not available in this portal mode.',
            };
        }

        return { blocked: false };
    };

    const blockedInfo = getBlockedResourceInfo();

    if (blockedInfo.blocked) {
        return (
            <ResourceNotFound
                message={{
                    title: blockedInfo.title,
                    body: blockedInfo.body,
                }}
            />
        );
    }

    return children;
};

PortalModeRouteGuard.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PortalModeRouteGuard;
