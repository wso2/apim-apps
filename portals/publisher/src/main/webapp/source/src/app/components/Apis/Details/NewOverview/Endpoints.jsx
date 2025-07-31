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

/**
 * Get the endpoint security type based on the endpoint configuration and environment type.
 * @param {*} endpointConfig endpoint configuration
 * @param {*} type type of endpoint ('prod' or 'sand')
 * @returns {string|null} the endpoint security type or null if not available
 */
const getEndpointSecurity = (endpointConfig, type) => {
    if (type === 'prod') {
        return endpointConfig && endpointConfig.endpoint_security
            && endpointConfig.endpoint_security.production
            && endpointConfig.endpoint_security.production.type;
    } else if (type === 'sand') {
        return endpointConfig && endpointConfig.endpoint_security
            && endpointConfig.endpoint_security.sandbox
            && endpointConfig.endpoint_security.sandbox.type;
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
    const isPrototypedAvailable = api.endpointConfig !== null
        && api.endpointConfig.implementation_status === 'prototyped'
        && api.lifeCycleStatus === 'PROTOTYPED';
    
    const [productionEndpointSecurity, setProductionEndpointSecurity] = useState(null);
    const [sandboxEndpointSecurity, setSandboxEndpointSecurity] = useState(null);
    const [endpointConfig, setEndpointConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const intl = useIntl();
    const authTypes = {
        NONE: 'None',
        BASIC: 'Basic Auth',
        DIGEST: 'Digest Auth',
        OAUTH: 'OAuth2',
    };

    useEffect(() => {
        if (api.type === MCPServer.CONSTS.MCP) {
            setLoading(true);
            MCPServer.getMCPServerEndpoints(api.id)
                .then((response) => {
                    const fetchedEndpoints = response.body;

                    if (fetchedEndpoints && fetchedEndpoints.length > 0) {
                        const { endpointConfig: endpointConfiguration } = fetchedEndpoints[0];
                        try {
                            const parsedConfig = JSON.parse(endpointConfiguration);
                            setEndpointConfig(parsedConfig);
                        } catch (error) {
                            console.error('Error parsing endpoint configuration:', error);
                            setEndpointConfig(null);
                        }
                        setProductionEndpointSecurity(getEndpointSecurity(endpointConfiguration, 'prod'));
                        setSandboxEndpointSecurity(getEndpointSecurity(endpointConfiguration, 'sand'));
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
        } else {
            setEndpointConfig(api.endpointConfig);
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
        } else if (api.type === MCPServer.CONSTS.MCP) {
            if (endpointType === 'prod') {
                return getProductionEndpoint(endpointConfig);
            }
            if (endpointType === 'sand') {
                return getSandboxEndpoint(endpointConfig);
            }
        } else if (api.endpointConfig) {
            if (endpointType === 'prod') {
                return api.getProductionEndpoint();
            }
            if (endpointType === 'sand') {
                return api.getSandboxEndpoint();
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
