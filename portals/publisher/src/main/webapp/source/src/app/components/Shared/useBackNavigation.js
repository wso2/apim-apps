/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC licenses this file to you under the Apache License,
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

import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for smart back navigation
 * This hook provides a function that:
 * 1. Goes back in browser history if available
 * 2. Falls back to a default route if no history is available
 * 
 * @param {string} fallbackRoute - The route to navigate to if no history is available
 * @returns {function} - Function to handle back navigation
 */
export const useBackNavigation = (fallbackRoute = '/') => {
    const history = useHistory();

    const handleBackNavigation = useCallback(() => {
        // Check if there's a previous page in history to go back to
        // We check both history object length and browser history length
        if (history.length > 1 && window.history.length > 1) {
            history.goBack();
        } else {
            // Fallback to the specified route if no history is available
            history.push(fallbackRoute);
        }
    }, [history, fallbackRoute]);

    return handleBackNavigation;
};

export default useBackNavigation;
