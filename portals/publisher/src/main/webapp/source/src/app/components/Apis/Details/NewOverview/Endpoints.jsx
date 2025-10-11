/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Alert from 'AppComponents/Shared/Alert';
import MCPServer from 'AppData/MCPServer';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';

/**
 * Get the endpoint security type based on the endpoint configuration and environment type.
 * @param {*} endpointConfig endpoint configuration (object or JSON string)
 * @param {*} type type of endpoint ('prod' or 'sand')
 * @returns {string|null} the endpoint security type or null if not available
 */
const getEndpointSecurity = (endpointConfig, type) => {
    let config = endpointConfig;

    // Parse if endpointConfig is a JSON string
    if (typeof endpointConfig === 'string') {
        try {
            config = JSON.parse(endpointConfig);
        } catch (error) {
            console.error('Error parsing endpoint configuration:', error);
            return null;
        }
    }

    if (type === 'prod') {
        return config && config.endpoint_security
            && config.endpoint_security.production
            && config.endpoint_security.production.type;
    } else if (type === 'sand') {
        return config && config.endpoint_security
            && config.endpoint_security.sandbox
            && config.endpoint_security.sandbox.type;
    } else {
        return null;
    }
}

/**
 * Get the production endpoint URL of the MCP Server.
 * @param {*} endpointConfig - The endpoint configuration of the MCP Server.
 * @returns {string|null} The production endpoint URL of the MCP Server.
 */
const getProductionEndpoint = (endpointConfig) => {
    if (!endpointConfig) {
        return null;
    }

    if (!endpointConfig.production_endpoints) {
        return '';
    }
    if (Array.isArray(endpointConfig.production_endpoints)) {
        return endpointConfig.production_endpoints[0].url;
    } else {
        return endpointConfig.production_endpoints.url;
    }
}

/**
 * Get the sandbox endpoint URL of the MCP Server.
 * @param {*} endpointConfig - The endpoint configuration of the MCP Server.
 * @returns {string|null} The sandbox endpoint URL of the MCP Server.
 */
const getSandboxEndpoint = (endpointConfig) => {
    if (!endpointConfig) {
        return null;
    }
    if (!endpointConfig.sandbox_endpoints) {
        return '';
    }
    if (Array.isArray(endpointConfig.sandbox_endpoints)) {
        return endpointConfig.sandbox_endpoints[0].url;
    } else {
        return endpointConfig.sandbox_endpoints.url;
    }
}

/**
 * Endpoints component displays the API endpoints and their security types under the Overview page
 *
 * @param {*} props props of the component
 * @returns {JSX.Element} Endpoints component
 */
function Endpoints(props) {
    const { parentClasses, api } = props;
    
    const [productionEndpointSecurity, setProductionEndpointSecurity] = useState(null);
    const [sandboxEndpointSecurity, setSandboxEndpointSecurity] = useState(null);
    const [productionUrl, setProductionUrl] = useState(null);
    const [sandboxUrl, setSandboxUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const intl = useIntl();
    const authTypes = {
        NONE: 'None',
        BASIC: 'Basic Auth',
        DIGEST: 'Digest Auth',
        OAUTH: 'OAuth2',
        apikey: 'API Key',
    };
    const isMCPServer = api.type === MCPServer.CONSTS.MCP;
    const isPrototypedAvailable = !isMCPServer && api.endpointConfig !== null
        && api.endpointConfig.implementation_status === 'prototyped'
        && api.lifeCycleStatus === 'PROTOTYPED';

    useEffect(() => {
        if (isMCPServer) {
            setLoading(true);
            MCPServer.getMCPServerEndpoints(api.id)
                .then((response) => {
                    const fetchedEndpoints = response.body;

                    if (fetchedEndpoints && fetchedEndpoints.length > 0) {
                        const { endpointConfig: endpointConfiguration } = fetchedEndpoints[0];
                        try {
                            const parsedConfig = JSON.parse(endpointConfiguration);
                            setProductionUrl(getProductionEndpoint(parsedConfig));
                            setSandboxUrl(getSandboxEndpoint(parsedConfig));
                            setProductionEndpointSecurity(getEndpointSecurity(endpointConfiguration, 'prod'));
                            setSandboxEndpointSecurity(getEndpointSecurity(endpointConfiguration, 'sand'));
                        } catch (error) {
                            console.error('Error parsing endpoint configuration:', error);
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching endpoints:', error);
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.NewOverview.Endpoints.fetch.error',
                        defaultMessage: 'Something went wrong while fetching endpoints',
                    }));
                })
                .finally(() => setLoading(false));
        // AI endpoints
        } else if(api.subtypeConfiguration?.subtype === 'AIAPI'){
            const promises = [];

            setLoading(true);
            // Primary production endpoint
            if (api.primaryProductionEndpointId){
                if(api.primaryProductionEndpointId !== 'default_production_endpoint'){
                    promises.push(
                        API.getApiEndpoint(api.id, api.primaryProductionEndpointId)
                            .then((prodEndpointResp) => {
                                if (prodEndpointResp?.body?.endpointConfig) {
                                    try{
                                        setProductionUrl(
                                            getProductionEndpoint(prodEndpointResp.body.endpointConfig)
                                        );
                                        setProductionEndpointSecurity(
                                            getEndpointSecurity(prodEndpointResp.body.endpointConfig, 'prod')
                                        );
                                    } catch (error){
                                        console.error('Error parsing endpoint configuration:', error);
                                    }
                                }
                            })
                            .catch((err) => {
                                console.error('Error fetching primary production endpoint:', err);
                            })
                    );

                } else { 
                    setProductionUrl(getProductionEndpoint(api.endpointConfig));
                    setProductionEndpointSecurity(getEndpointSecurity(api.endpointConfig, 'prod'));
                }
            }
                    
            // Primary Sandbox endpoint
            if (api.primarySandboxEndpointId){
                if(api.primarySandboxEndpointId !== 'default_sandbox_endpoint'){
                    promises.push(
                        API.getApiEndpoint(api.id, api.primarySandboxEndpointId)
                            .then((sandEndpointResp) => {
                                if (sandEndpointResp?.body?.endpointConfig) {
                                    try{
                                        setSandboxUrl(
                                            getSandboxEndpoint(sandEndpointResp.body.endpointConfig)
                                        );
                                        setSandboxEndpointSecurity(
                                            getEndpointSecurity(sandEndpointResp.body.endpointConfig, 'sand')
                                        );
                                    } catch (error){
                                        console.error('Error parsing endpoint configuration:', error);
                                    }
                                }

                            })
                            .catch((err) => {
                                console.error('Error fetching primary sandbox endpoint:', err);
                            })
                    );

                } else { 
                    setSandboxUrl(getSandboxEndpoint(api.endpointConfig));
                    setSandboxEndpointSecurity(getEndpointSecurity(api.endpointConfig, 'sand'));
                }
            }
            Promise.all(promises)
                .finally(() => setLoading(false));
        }
        // Regular API endpoints
        else {
            setProductionUrl(getProductionEndpoint(api.endpointConfig));
            setSandboxUrl(getSandboxEndpoint(api.endpointConfig));
            setProductionEndpointSecurity(getEndpointSecurity(api.endpointConfig, 'prod'));
            setSandboxEndpointSecurity(getEndpointSecurity(api.endpointConfig, 'sand'));
        }
    }, [api]);

    const showEndpoint = (endpointType) => {
        if (api.advertiseInfo && api.advertiseInfo.advertised) {
            if (endpointType === 'prod') {
                return api.advertiseInfo.apiExternalProductionEndpoint;
            }
            if (endpointType === 'sand') {
                return api.advertiseInfo.apiExternalSandboxEndpoint;
            }
        } else {
            if (endpointType === 'prod') {
                return productionUrl;
            }
            if (endpointType === 'sand') {
                return sandboxUrl;
            }
        }
        return null;
    };

    if (loading) {
        return <CircularProgress />
    }

    return (
        <>
            <div>
                <Typography variant='h5' component='h2' className={parentClasses.title} data-testid='endpoints'>
                    <FormattedMessage
                        id='Apis.Details.NewOverview.Endpoints.endpoints'
                        defaultMessage='Endpoints'
                    />
                </Typography>
            </div>
            <Box p={1}>
                {(!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} lg={6}>
                            {/* Production Endpoint (TODO) fix the endpoint
                                                info when it's available with the api object */}
                            { !isPrototypedAvailable ? (
                                <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                    <FormattedMessage
                                        id='Apis.Details.NewOverview.Endpoints.production.endpoint'
                                        defaultMessage='Production Endpoint'
                                        data-testid='production-endpoint'
                                    />
                                </Typography>
                            )
                                : (
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.prototype.endpoint'
                                            defaultMessage='Prototype Endpoint'
                                        />
                                    </Typography>
                                )}
                        </Grid>
                        <Grid item xs={12} md={6} lg={6}>
                            <Tooltip
                                placement='top'
                                classes={{
                                    tooltip: parentClasses.htmlTooltip,
                                }}
                                interactive
                                title={
                                    showEndpoint('prod')
                                    && <>{showEndpoint('prod')}</>
                                }
                            >
                                <Typography component='p' variant='body1' className={parentClasses.url}>
                                    {showEndpoint('prod')
                                    && <>{showEndpoint('prod')}</>}
                                </Typography>
                            </Tooltip>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                {!showEndpoint('prod') && (
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.not.set'
                                            defaultMessage='-'
                                        />
                                    </>
                                )}
                            </Typography>
                        </Grid>
                        {!isPrototypedAvailable && (
                            <Grid item xs={12} md={6} lg={6}>
                                {/* Sandbox Endpoint (TODO) fix the endpoint info when
                                                    it's available with the api object */}
                                <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                    <FormattedMessage
                                        id='Apis.Details.NewOverview.Endpoints.sandbox.endpoint'
                                        defaultMessage='Sandbox Endpoint'
                                        data-testid='sandbox-endpoint'
                                    />
                                </Typography>
                            </Grid>
                        )}

                        {!isPrototypedAvailable && (
                            <Grid item xs={12} md={6} lg={6}>
                                <Tooltip
                                    placement='top'
                                    classes={{
                                        tooltip: parentClasses.htmlTooltip,
                                    }}
                                    interactive
                                    title={
                                        showEndpoint('sand')
                                        && <>{showEndpoint('sand')}</>
                                    }
                                >
                                    <Typography component='p' variant='body1' className={parentClasses.url}>
                                        {showEndpoint('sand')
                                        && <>{showEndpoint('sand')}</>}
                                    </Typography>
                                </Tooltip>
                                <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                    {!showEndpoint('sand') && (
                                        <>
                                            <FormattedMessage
                                                id='Apis.Details.NewOverview.Endpoints.sandbox.not.set'
                                                defaultMessage='-'
                                            />
                                        </>
                                    )}
                                </Typography>
                            </Grid>
                        )}
                        {isPrototypedAvailable ? (
                            <>
                                <Grid item xs={12} md={6} lg={6}>
                                    {/* Sandbox Endpoint (TODO) fix the endpoint info when
                                                        it's available with the api object */}
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.endpoint.security'
                                            defaultMessage='Endpoint Security'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={6}>
                                    <Typography component='p' variant='body1'>
                                        {productionEndpointSecurity && <>{authTypes[productionEndpointSecurity]}</>}
                                    </Typography>
                                    <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                        {!productionEndpointSecurity
                                        && (
                                            <>
                                                <FormattedMessage
                                                    id='Apis.Details.NewOverview.Endpoints.security.not.set'
                                                    defaultMessage='-'
                                                />
                                            </>
                                        )}
                                    </Typography>
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid item xs={12} md={6} lg={6}>
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.production.endpoint.security'
                                            defaultMessage='Production Endpoint Security'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={6}>
                                    <Typography component='p' variant='body1'>
                                        {productionEndpointSecurity && <>{authTypes[productionEndpointSecurity]}</>}
                                    </Typography>
                                    <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                        {!productionEndpointSecurity
                                        && (
                                            <>
                                                <FormattedMessage
                                                    id='Apis.Details.NewOverview.Endpoints.production.security.not.set'
                                                    defaultMessage='-'
                                                />
                                            </>
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={6}>
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.sandbox.endpoint.security'
                                            defaultMessage='Sandbox Endpoint Security'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={6}>
                                    <Typography component='p' variant='body1'>
                                        {sandboxEndpointSecurity && <>{authTypes[sandboxEndpointSecurity]}</>}
                                    </Typography>
                                    <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                        {!sandboxEndpointSecurity
                                        && (
                                            <>
                                                <FormattedMessage
                                                    id='Apis.Details.NewOverview.Endpoints.sandbox.security.not.set'
                                                    defaultMessage='-'
                                                />
                                            </>
                                        )}
                                    </Typography>
                                </Grid>
                            </>
                        )}
                    </Grid>
                )}
                {api.advertiseInfo && api.advertiseInfo.advertised && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} lg={6}>
                            <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                <FormattedMessage
                                    id='Apis.Details.NewOverview.Endpoints.external.production.endpoint'
                                    defaultMessage='External Production Endpoint'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={6}>
                            <Tooltip
                                placement='top'
                                classes={{
                                    tooltip: parentClasses.htmlTooltip,
                                }}
                                interactive
                                title={
                                    showEndpoint('prod')
                                    && <>{showEndpoint('prod')}</>
                                }
                            >
                                <Typography component='p' variant='body1' className={parentClasses.url}>
                                    {showEndpoint('prod')
                                    && <>{showEndpoint('prod')}</>}
                                </Typography>
                            </Tooltip>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                {!showEndpoint('prod') && (
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.sandbox.not.set'
                                            defaultMessage='-'
                                        />
                                    </>
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={6}>
                            <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                <FormattedMessage
                                    id='Apis.Details.NewOverview.Endpoints.external.sandbox.endpoint'
                                    defaultMessage='External Sandbox Endpoint'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={6}>
                            <Tooltip
                                placement='top'
                                classes={{
                                    tooltip: parentClasses.htmlTooltip,
                                }}
                                interactive
                                title={
                                    showEndpoint('sand')
                                    && <>{showEndpoint('sand')}</>
                                }
                            >
                                <Typography component='p' variant='body1' className={parentClasses.url}>
                                    {showEndpoint('sand')
                                    && <>{showEndpoint('sand')}</>}
                                </Typography>
                            </Tooltip>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                {!showEndpoint('sand') && (
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.sandbox.not.set'
                                            defaultMessage='-'
                                        />
                                    </>
                                )}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </>
    );
}

Endpoints.propTypes = {
    parentClasses: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({}).isRequired,
};

export default withAPI(Endpoints);
