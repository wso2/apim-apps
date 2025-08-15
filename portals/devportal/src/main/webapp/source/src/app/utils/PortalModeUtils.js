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

import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';

/**
 * Portal mode constants
 */
export const PORTAL_MODES = {
    HYBRID: 'HYBRID',
    API_ONLY: 'API_ONLY',
    MCP_ONLY: 'MCP_ONLY',
};

/**
 * Extracts portal mode from settings response
 * @param {Object} settings - Settings response body
 * @returns {string} Portal mode
 */
export const extractPortalMode = (settings) => {
    // Check if devportalMode exists in settings
    if (settings && settings.devportalMode) {
        const mode = settings.devportalMode.toUpperCase();
        if (Object.values(PORTAL_MODES).includes(mode)) {
            return mode;
        }
    }

    // Default to HYBRID if devportalMode is not set or invalid
    return PORTAL_MODES.HYBRID;
};

/**
 * Checks if APIs are accessible in the current portal mode
 * @param {string} portalMode - Current portal mode
 * @returns {boolean} True if APIs are accessible
 */
export const areApisAccessible = (portalMode) => {
    return portalMode === PORTAL_MODES.HYBRID || portalMode === PORTAL_MODES.API_ONLY;
};

/**
 * Checks if MCP servers are accessible in the current portal mode
 * @param {string} portalMode - Current portal mode
 * @returns {boolean} True if MCP servers are accessible
 */
export const areMcpServersAccessible = (portalMode) => {
    return portalMode === PORTAL_MODES.HYBRID || portalMode === PORTAL_MODES.MCP_ONLY;
};

/**
 * Custom hook to get portal mode from settings context
 * @returns {string} Portal mode
 */
export const usePortalMode = () => {
    const { settings } = useSettingsContext();
    return extractPortalMode(settings);
};

/**
 * Custom hook to check if APIs are accessible
 * @returns {boolean} True if APIs are accessible
 */
export const useAreApisAccessible = () => {
    const portalMode = usePortalMode();
    return areApisAccessible(portalMode);
};

/**
 * Custom hook to check if MCP servers are accessible
 * @returns {boolean} True if MCP servers are accessible
 */
export const useAreMcpServersAccessible = () => {
    const portalMode = usePortalMode();
    return areMcpServersAccessible(portalMode);
};
