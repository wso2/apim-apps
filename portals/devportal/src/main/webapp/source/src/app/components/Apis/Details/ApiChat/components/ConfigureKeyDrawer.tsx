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

import React, { useEffect, useContext, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import {
    Box, Grid, Paper, Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';
import AuthManager from 'AppData/AuthManager';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import Progress from 'AppComponents/Shared/Progress';
import TryOutController from 'AppComponents/Shared/ApiTryOut/TryOutController';
import Application from 'AppData/Application';

interface ConfigureKeyDrawerProps {
    isDrawerOpen: boolean;
    updateDrawerOpen: (isOpen: boolean) => void;
}

const ConfigureKeyDrawer: React.FC<ConfigureKeyDrawerProps> = ({
    isDrawerOpen,
    updateDrawerOpen,
}) => {
    const [api123, setApi123] = useState<any>(null);
    const [securityScheme, setSecurityScheme] = useState('OAUTH');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [scopes, setScopes] = useState([]);
    const [selectedKeyType, setSelectedKeyType] = useState('PRODUCTION');
    const [keys, setKeys] = useState<any>([]);
    const [selectedEnvironment, setSelectedEnvironment] = useState('production');
    const [productionAccessToken, setProductionAccessToken] = useState('');
    const [sandboxAccessToken, setSandboxAccessToken] = useState('');
    const [environments, setEnvironments] = useState<any>([]);
    const [selectedKeyManager, setSelectedKeyManager] = useState('');
    const [productionApiKey, setProductionApiKey] = useState('');
    const [sandboxApiKey, setSandboxApiKey] = useState('');
    const [advAuthHeader, setAdvAuthHeader] = useState('Authorization');
    const [advAuthHeaderValue, setAdvAuthHeaderValue] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('PRODUCTION');

    const user = AuthManager.getUser();
    const { api } = useContext(ApiContext);

    useEffect(() => {
        setApi123(api);
    }, [api]);

    useEffect(() => {
        if (api123) {
            if (api123.endpointURLs) {
                setEnvironments(
                    api123.endpointURLs.map((endpoint: any) => ({
                        name: endpoint.environmentName,
                        displayName: endpoint.environmentDisplayName,
                    })),
                );
            }

            if (api123.scopes) {
                const scopeList = api123.scopes.map((scope: any) => scope.key);
                setScopes(scopeList);
            }

            // Update selected environment only when environments change
            if (environments && environments.length > 0) {
                setSelectedEnvironment(environments[0].name);
            }

            let defaultSecurityScheme = 'OAUTH';
            if (!api123.securityScheme.includes('oauth2')) {
                defaultSecurityScheme = api123.securityScheme.includes('api_key')
                    ? 'API-KEY'
                    : 'BASIC';
            }

            setProductionAccessToken(productionAccessToken);
            setSandboxAccessToken(sandboxAccessToken);
            setSecurityScheme(defaultSecurityScheme);
        }
    }, [api123, productionAccessToken, sandboxAccessToken, environments]);

    useEffect(() => {
        updateDrawerOpen(isDrawerOpen);
    }, [isDrawerOpen]);

    const handleDrawerClose = () => {
        updateDrawerOpen(false);
    };

    // Load the access token for the given key type
    const updateAccessToken = (selectedApplication: string) => {
        let accessToken: string;
        if (keys.get(selectedKeyManager) && keys.get(selectedKeyManager).keyType === selectedKeyType) {
            ({ accessToken } = keys.get(selectedKeyManager).token);
            if (selectedKeyType === 'PRODUCTION') {
                setProductionAccessToken(accessToken);
            } else {
                setSandboxAccessToken(accessToken);
            }
        } else {
            Application.get(selectedApplication)
                .then((application: any) => {
                    return application.getKeys(selectedKeyType);
                })
                .then((appKeys: any) => {
                    if (appKeys.get(selectedKeyManager)
                    && appKeys.get(selectedKeyManager).keyType === selectedKeyType) {
                        ({ accessToken } = appKeys.get(selectedKeyManager).token);
                    }
                    if (appKeys.get(selectedKeyManager).keyType === 'PRODUCTION') {
                        setProductionAccessToken(accessToken);
                    } else {
                        setSandboxAccessToken(accessToken);
                    }
                    setKeys(appKeys);
                });
        }
    };

    // Update the selected key manager
    const updateSelectedKeyManager = (keyManager: string, isUpdateToken: boolean, selectedApplication: string) => {
        if (isUpdateToken) {
            setSelectedKeyManager(keyManager);
            updateAccessToken(selectedApplication);
        } else {
            setSelectedKeyManager(keyManager);
        }
    };

    if (api123 == null) {
        return <Progress />;
    }

    return (
        <Drawer
            title='Configure Key'
            anchor='right'
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            id='api-chat-configure-key-drawer'
            PaperProps={{
                sx: { width: '40%', borderRadius: 1 },
            }}
        >
            <Box p={2}>
                <Typography variant='h6'>
                    <FormattedMessage
                        id='Apis.Details.ApiChat.components.ConfigureKeyDrawer.title'
                        defaultMessage='Configure Key'
                    />
                </Typography>
                <Box>
                    <Grid container padding={2}>
                        {!user && (!api123.advertiseInfo || !api123.advertiseInfo.advertised) && (
                            <Paper sx={{ padding: 1 }}>
                                <Typography variant='h5' component='h3'>
                                    <InfoIcon sx={{ verticalAlign: 'middle', marginBottom: 0.5 }} />
                                    {' '}
                                    <FormattedMessage id='notice' defaultMessage='Notice' />
                                </Typography>
                                <Typography component='p' align='justify' sx={{ padding: 1 }}>
                                    <FormattedMessage
                                        id='api.console.require.access.token'
                                        defaultMessage={'You need an access token to try the API. Please log '
                                        + 'in and subscribe to the API to generate an access token. If you already '
                                        + 'have an access token, please provide it below.'}
                                    />
                                </Typography>
                            </Paper>
                        )}
                    </Grid>
                    <Grid container>
                        <TryOutController
                            setSecurityScheme={setSecurityScheme}
                            securitySchemeType={securityScheme}
                            setSelectedEnvironment={setSelectedEnvironment}
                            selectedEnvironment={selectedEnvironment}
                            productionAccessToken={productionAccessToken}
                            setProductionAccessToken={setProductionAccessToken}
                            sandboxAccessToken={sandboxAccessToken}
                            setSandboxAccessToken={setSandboxAccessToken}
                            environments={environments}
                            scopes={scopes}
                            setUsername={setUsername}
                            setPassword={setPassword}
                            username={username}
                            password={password}
                            setSelectedKeyType={setSelectedKeyType}
                            selectedKeyType={selectedKeyType}
                            setSelectedKeyManager={updateSelectedKeyManager}
                            selectedKeyManager={selectedKeyManager}
                            setKeys={setKeys}
                            setProductionApiKey={setProductionApiKey}
                            setSandboxApiKey={setSandboxApiKey}
                            productionApiKey={productionApiKey}
                            sandboxApiKey={sandboxApiKey}
                            setAdvAuthHeader={setAdvAuthHeader}
                            setAdvAuthHeaderValue={setAdvAuthHeaderValue}
                            advAuthHeader={advAuthHeader}
                            advAuthHeaderValue={advAuthHeaderValue}
                            setSelectedEndpoint={setSelectedEndpoint}
                            selectedEndpoint={selectedEndpoint}
                            api={api123}
                            URLs={null}
                        />
                    </Grid>
                </Box>
            </Box>
        </Drawer>
    );
};

export default ConfigureKeyDrawer;
