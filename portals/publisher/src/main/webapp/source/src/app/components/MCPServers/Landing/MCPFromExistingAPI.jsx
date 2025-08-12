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
import { FormattedMessage } from 'react-intl';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import LandingMenu from 'AppComponents/Apis/Listing/Landing/components/LandingMenu';
import APICreateMenuSection from 'AppComponents/Apis/Listing/components/APICreateMenuSection';

const MCPFromExistingAPI = (props) => {
    const { icon, isCreateMenu } = props;
    const Component = isCreateMenu ? APICreateMenuSection : LandingMenu;
    const dense = isCreateMenu;

    return (
        <Component
            id='itest-mcp-servers-create-menu'
            title={(
                <FormattedMessage
                    id='MCPServers.Landing.ExistingAPIsAsMCPMenu.title'
                    defaultMessage='Start from Existing API'
                />
            )}
            icon={icon}
        >
            <LandingMenuItem
                dense={dense}
                id='itest-id-mcp-servers-create-from-existing-api'
                linkTo='/mcp-servers/create/mcp-from-existing-api'
                helperText={(
                    <FormattedMessage
                        id='MCPServers.Landing.ExistingAPIsAsMCPMenu.helperText'
                        defaultMessage='Start from Existing API'
                    />
                )}
            >
                <FormattedMessage
                    id='MCPServers.Landing.ExistingAPIsAsMCPMenu.create.title'
                    defaultMessage='Create MCP Server from Existing API'
                />
            </LandingMenuItem>
        </Component>
    );
};

MCPFromExistingAPI.propTypes = {
    icon: PropTypes.string.isRequired,
    isCreateMenu: PropTypes.bool.isRequired,
};

export default MCPFromExistingAPI;
