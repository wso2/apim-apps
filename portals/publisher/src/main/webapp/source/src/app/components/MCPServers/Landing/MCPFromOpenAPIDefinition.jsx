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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import LandingMenu from 'AppComponents/Apis/Listing/Landing/components/LandingMenu';
import APICreateMenuSection from 'AppComponents/Apis/Listing/components/APICreateMenuSection';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Configurations from 'Config';
import API from 'AppData/api';
import SampleMCPServer from 'AppComponents/MCPServers/SampleMCPServer/SampleMCPServer';

const MCPFromOpenAPIDefinition = (props) => {
    const { icon, isCreateMenu } = props;
    const { data: settings } = usePublisherSettings();
    const noRegularGw = settings && !settings.gatewayTypes.includes('Regular');
    const Component = isCreateMenu ? APICreateMenuSection : LandingMenu;
    const dense = isCreateMenu;
    const { alwaysShowDeploySampleButton } = Configurations.apis;
    const [showSampleDeploy, setShowSampleDeploy] = useState(false);

    useEffect(() => {
        const composeQuery = '?query=name:PizzaShackServer version:1.0.0 context:pizzashackserver type:MCP';
        const composeQueryJSON = queryString.parse(composeQuery);
        composeQueryJSON.limit = 1;
        composeQueryJSON.offset = 0;
        API.search(composeQueryJSON).then((resp) => {
            const data = JSON.parse(resp.data);
            setShowSampleDeploy(data.count === 0);
        });
    }, []);

    return (
        <Component
            id='itest-mcp-servers-create-menu'
            title={(
                <FormattedMessage
                    id='MCPServers.Landing.APIsAsMCPMenu.title'
                    defaultMessage='Import API Definition'
                />
            )}
            icon={icon}
        >
            <LandingMenuItem
                dense={dense}
                id='itest-id-landing-create-mcp-from-scratch'
                linkTo='/mcp-servers/create/import-api-definition'
                helperText={(
                    <FormattedMessage
                        id='MCPServers.Landing.APIsAsMCPMenu.helperText'
                        defaultMessage='Start with OpenAPI Definition'
                    />
                )}
            >
                <FormattedMessage
                    id='MCPServers.Landing.APIsAsMCPMenu.create.title'
                    defaultMessage='Create MCP Server from Definition'
                />
            </LandingMenuItem>

            {(!isCreateMenu || (isCreateMenu && alwaysShowDeploySampleButton)) && showSampleDeploy &&
                !noRegularGw && (
                <>
                    <Box width={1} sx={{ pt: 2, pr: 2, pl: 2, ml: 2 }}>
                        <Divider variant='middle' />
                    </Box>
                    <SampleMCPServer dense={dense} />
                </>
            )}
        </Component>
    );
};

MCPFromOpenAPIDefinition.propTypes = {
    icon: PropTypes.string.isRequired,
    isCreateMenu: PropTypes.bool.isRequired,
};

export default MCPFromOpenAPIDefinition;
