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

import React from 'react';
import PropTypes from 'prop-types';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import Progress from 'AppComponents/Shared/Progress';

/**
 * Route guard component that checks if MCP support is enabled
 * If MCP support is disabled, it renders a 404 page
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child component to render if MCP is enabled
 * @returns {JSX.Element} Component or 404 page
 */
const MCPRouteGuard = ({ children }) => {
    const { data: settings, isLoading } = usePublisherSettings();
    
    // Show loading state while settings are being fetched
    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }
    
    const isMCPSupportEnabled = settings && settings.isMCPSupportEnabled;

    if (!isMCPSupportEnabled) {
        const resourceNotFoundMessage = {
            title: 'MCP Support Disabled',
            body: 'MCP support is not enabled in this environment.',
        };
        return <ResourceNotFoundError message={resourceNotFoundMessage} />;
    }

    return children;
};

MCPRouteGuard.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MCPRouteGuard;
