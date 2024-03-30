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
import { PropTypes } from 'prop-types';
import Drawer from '@mui/material/Drawer';
import {
    Box, Grid, Paper, Typography, Button,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';
import AuthManager from 'AppData/AuthManager';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import Progress from 'AppComponents/Shared/Progress';
import TryOutController from 'AppComponents/Shared/ApiTryOut/TryOutController';
import Application from 'AppData/Application';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';

const ConfigureKeyDrawer = ({
    isDrawerOpen,
    updateDrawerOpen,
    setTestAccessToken,
    onConfigChange,
}) => {
    const [api, setApi] = useState(null);
    const [securityScheme, setSecurityScheme] = useState('OAUTH');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [scopes, setScopes] = useState([]);
    const [selectedKeyType, setSelectedKeyType] = useState('PRODUCTION');
    const [keys, setKeys] = useState([]);
    const [selectedEnvironment, setSelectedEnvironment] = useState('');
    const [productionAccessToken, setProductionAccessToken] = useState('');
    const [sandboxAccessToken, setSandboxAccessToken] = useState('');
    const [environments, setEnvironments] = useState([]);
    const [selectedKeyManager, setSelectedKeyManager] = useState('Resident Key Manager');
    const [productionApiKey, setProductionApiKey] = useState('');
    const [sandboxApiKey, setSandboxApiKey] = useState('');
    const [advAuthHeader, setAdvAuthHeader] = useState('Authorization');
    const [advAuthHeaderValue, setAdvAuthHeaderValue] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('PRODUCTION');

    const user = AuthManager.getUser();
    const { api: apiObj } = useContext(ApiContext);

    useEffect(() => {
        setApi(apiObj);
    }, [apiObj]);

    useEffect(() => {
        if (api) {
            if (api.endpointURLs) {
                setEnvironments(
                    api.endpointURLs.map((endpoint) => ({
                        name: endpoint.environmentName,
                        displayName: endpoint.environmentDisplayName,
                    })),
                );
            }

            if (api.scopes) {
                const scopeList = api.scopes.map((scope) => scope.key);
                setScopes(scopeList);
            }

            let defaultSecurityScheme = 'OAUTH';
            if (!api.securityScheme.includes('oauth2')) {
                defaultSecurityScheme = api.securityScheme.includes('api_key')
                    ? 'API-KEY'
                    : 'BASIC';
            }

            if (environments && environments.length > 0) {
                setSelectedEnvironment(environments[0].name);
            }

            setProductionAccessToken(productionAccessToken);
            setSandboxAccessToken(sandboxAccessToken);
            setSecurityScheme(defaultSecurityScheme);
        }
    }, [api]);

    useEffect(() => {
        // Update selected environment only when environments change
        if (api) {
            if (environments && environments.length > 0) {
                setSelectedEnvironment(environments[0].name);
            }
        }
    }, [environments, api]);

    useEffect(() => {
        updateDrawerOpen(isDrawerOpen);
    }, [isDrawerOpen]);

    // Load the access token for the given key type
    const updateAccessToken = (selectedApplication) => {
        let accessToken;
        if (keys.get(selectedKeyManager) && keys.get(selectedKeyManager).keyType === selectedKeyType) {
            ({ accessToken } = keys.get(selectedKeyManager).token);
            if (selectedKeyType === 'PRODUCTION') {
                setProductionAccessToken(accessToken);
            } else {
                setSandboxAccessToken(accessToken);
            }
        } else {
            Application.get(selectedApplication)
                .then((application) => {
                    return application.getKeys(selectedKeyType);
                })
                .then((appKeys) => {
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
    const updateSelectedKeyManager = (keyManager, isUpdateToken, selectedApplication) => {
        if (isUpdateToken) {
            setSelectedKeyManager(keyManager);
            updateAccessToken(selectedApplication);
        } else {
            setSelectedKeyManager(keyManager);
        }
    };

    if (api == null) {
        return <Progress />;
    }

    return (
        <>
            <Drawer
                title='Configure Key'
                anchor='right'
                open={isDrawerOpen}
                onClose={() => updateDrawerOpen(false)}
                id='api-chat-configure-key-drawer'
                PaperProps={{
                    sx: { width: '70%', borderRadius: 1 },
                }}
            >
                <Box p={2}>
                    <Grid container justifyContent='space-between' alignItems='center'>
                        <Grid item xs={10}>
                            <Typography variant='h6'>
                                <FormattedMessage
                                    id='Apis.Details.ApiChat.components.ConfigureKeyDrawer.title'
                                    defaultMessage='Configure Key'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={2} display='flex' justifyContent='flex-end'>
                            <IconButton onClick={() => updateDrawerOpen(false)} size='large'>
                                <Close />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Grid container padding={2}>
                        {!user && (!api.advertiseInfo || !api.advertiseInfo.advertised) && (
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
                    <Grid container justifyContent='center' spacing={0}>
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
                            api={api}
                            URLs={null}
                            autoGenerateToken
                            setTestAccessToken={setTestAccessToken}
                            onConfigChange={onConfigChange}
                        />
                    </Grid>
                    <Grid container justifyContent='right' pr={2}>
                        <Button
                            variant='outlined'
                            type='submit'
                            color='primary'
                            data-testid='key-details-cancel'
                            onClick={() => updateDrawerOpen(false)}
                            sx={{
                                marginRight: '1em',
                            }}
                        >
                            <FormattedMessage
                                id='Apis.Details.ApiChat.components.ConfigureKeyDrawer.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            data-testid='key-details-save'
                            onClick={() => updateDrawerOpen(false)}
                        >
                            <FormattedMessage
                                id='Apis.Details.ApiChat.components.ConfigureKeyDrawer.done'
                                defaultMessage='Done'
                            />
                        </Button>
                    </Grid>
                </Box>
            </Drawer>
        </>
    );
};

ConfigureKeyDrawer.propTypes = {
    isDrawerOpen: PropTypes.bool.isRequired,
    updateDrawerOpen: PropTypes.func.isRequired,
    setTestAccessToken: PropTypes.func.isRequired,
    onConfigChange: PropTypes.func.isRequired,
};

export default ConfigureKeyDrawer;
