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

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import MCPPlayground from '@wso2-org/mcp-playground';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import SecurityDetailsPanel from 'AppComponents/Shared/ApiTryOut/SecurityDetailsPanel';

const PREFIX = 'MCPTryOut';

const classes = {
    mcpPlaygroundWrapper: `${PREFIX}-mcpPlaygroundWrapper`,
    titleSub: `${PREFIX}-titleSub`,
};

const Root = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    [`& .${classes.titleSub}`]: {
        marginBottom: theme.spacing(3),
    },
    [`& .${classes.mcpPlaygroundWrapper}`]: {
        // Apply the portal's font family to the MCP playground
        fontFamily: theme.typography.fontFamily,
        marginTop: theme.spacing(2),
        '& *': {
            fontFamily: theme.typography.fontFamily,
        },
        // Ensure all text elements within the playground inherit the font family
        '& input, & textarea, & select, & button, & div, & span, & p, & label, & h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: theme.typography.fontFamily,
        },
    },
}));

const MCPTryOut = () => {
    const [configurationDrawerOpen, setConfigurationDrawerOpen] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [securityScheme, setSecurityScheme] = useState('OAUTH');
    const [selectedEnvironment, setSelectedEnvironment] = useState('Default');

    const { api } = useContext(ApiContext);

    const handleConfigChange = ({
        newAccessToken,
        newSecurityScheme,
        newSelectedEnvironment,
    }) => {
        if (newAccessToken !== undefined) {
            setAccessToken(newAccessToken);
        }
        if (newSecurityScheme !== undefined) {
            setSecurityScheme(newSecurityScheme);
        }
        if (newSelectedEnvironment !== undefined) {
            setSelectedEnvironment(newSelectedEnvironment);
        }
    };

    const getEnvironmentURLs = (endpointURLs, environmentName) => {
        const environment = endpointURLs.find((env) => env.environmentName === environmentName);
        return environment ? environment.URLs : {};
    };

    const handleConfigurationDrawerOpen = () => {
        setConfigurationDrawerOpen(true);
    };

    const getMCPServerUrl = () => {
        const environmentURLs = getEnvironmentURLs(api.endpointURLs, selectedEnvironment);
        const url = environmentURLs.https || environmentURLs.http;
        return `${url}/mcp`;
    };

    const getToken = () => {
        if (securityScheme === 'OAUTH' && accessToken !== null && accessToken !== undefined && accessToken !== '') {
            return `Bearer ${accessToken}`;
        }
        return accessToken;
    };

    return (
        <Root>
            <Typography variant='h4' className={classes.titleSub}>
                <FormattedMessage
                    id='Apis.Details.MCPTryOut.MCPTryOut.title'
                    defaultMessage='MCP Playground'
                />
            </Typography>
            <SecurityDetailsPanel
                isDrawerOpen={configurationDrawerOpen}
                updateDrawerOpen={setConfigurationDrawerOpen}
                onConfigChange={handleConfigChange}
            />
            <div className={classes.mcpPlaygroundWrapper}>
                <MCPPlayground
                    disableTitle
                    enableConfiguration
                    onConfigurationClick={handleConfigurationDrawerOpen}
                    url={getMCPServerUrl()}
                    token={getToken()}
                    headerName={api.authorizationHeader ? api.authorizationHeader : 'Authorization'}
                    shouldSetHeaderNameExternally
                    disableConnectionButton={
                        accessToken === null || accessToken === undefined || accessToken === ''
                    }
                />
            </div>
        </Root>
    );
};

MCPTryOut.propTypes = {
    api: PropTypes.shape({
        context: PropTypes.string.isRequired,
    }).isRequired,
};

export default MCPTryOut;
