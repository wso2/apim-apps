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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';

const showEndpoint = (api, type) => {
    if (api.advertiseInfo && api.advertiseInfo.advertised) {
        if (type === 'prod') {
            return api.advertiseInfo.apiExternalProductionEndpoint;
        }
        if (type === 'sand') {
            return api.advertiseInfo.apiExternalSandboxEndpoint;
        }
    } else if (api.endpointConfig) {
        if (type === 'prod') {
            return api.getProductionEndpoint();
        }
        if (type === 'sand') {
            return api.getSandboxEndpoint();
        }
    }
    return null;
};

/**
 *
 *
 * @param {*} props
 * @returns
 */
function Endpoints(props) {
    const { parentClasses, api } = props;
    const isPrototypedAvailable = api.endpointConfig !== null
        && api.endpointConfig.implementation_status === 'prototyped';
    const productionEndpointSecurity = api.endpointConfig && api.endpointConfig.endpoint_security
        && api.endpointConfig.endpoint_security.production.type;
    const sandboxEndpointSecurity = api.endpointConfig && api.endpointConfig.endpoint_security
        && api.endpointConfig.endpoint_security.sandbox.type;
    const authTypes = {
        NONE: 'None',
        BASIC: 'Basic Auth',
        DIGEST: 'Digest Auth',
        OAUTH: 'OAuth2',
    };

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
                        <Grid item xs={12} md={6} lg={4}>
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
                        <Grid item xs={12} md={6} lg={8}>
                            <Tooltip
                                placement='top'
                                classes={{
                                    tooltip: parentClasses.htmlTooltip,
                                }}
                                interactive
                                title={
                                    showEndpoint(api, 'prod')
                                    && <>{showEndpoint(api, 'prod')}</>
                                }
                            >
                                <Typography component='p' variant='body1' className={parentClasses.url}>
                                    {showEndpoint(api, 'prod')
                                    && <>{showEndpoint(api, 'prod')}</>}
                                </Typography>
                            </Tooltip>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                {!showEndpoint(api, 'prod') && (
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
                            <Grid item xs={12} md={6} lg={4}>
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
                            <Grid item xs={12} md={6} lg={8}>
                                <Tooltip
                                    placement='top'
                                    classes={{
                                        tooltip: parentClasses.htmlTooltip,
                                    }}
                                    interactive
                                    title={
                                        showEndpoint(api, 'sand')
                                        && <>{showEndpoint(api, 'sand')}</>
                                    }
                                >
                                    <Typography component='p' variant='body1' className={parentClasses.url}>
                                        {showEndpoint(api, 'sand')
                                        && <>{showEndpoint(api, 'sand')}</>}
                                    </Typography>
                                </Tooltip>
                                <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                    {!showEndpoint(api, 'sand') && (
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
                                <Grid item xs={12} md={6} lg={4}>
                                    {/* Sandbox Endpoint (TODO) fix the endpoint info when
                                                        it's available with the api object */}
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.endpoint.security'
                                            defaultMessage='Endpoint Security'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={8}>
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
                                <Grid item xs={12} md={6} lg={4}>
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.production.endpoint.security'
                                            defaultMessage='Production Endpoint Security'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={8}>
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
                                <Grid item xs={12} md={6} lg={4}>
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.sandbox.endpoint.security'
                                            defaultMessage='Sandbox Endpoint Security'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={8}>
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
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                <FormattedMessage
                                    id='Apis.Details.NewOverview.Endpoints.external.production.endpoint'
                                    defaultMessage='External Production Endpoint'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={8}>
                            <Tooltip
                                placement='top'
                                classes={{
                                    tooltip: parentClasses.htmlTooltip,
                                }}
                                interactive
                                title={
                                    showEndpoint(api, 'prod')
                                    && <>{showEndpoint(api, 'prod')}</>
                                }
                            >
                                <Typography component='p' variant='body1' className={parentClasses.url}>
                                    {showEndpoint(api, 'prod')
                                    && <>{showEndpoint(api, 'prod')}</>}
                                </Typography>
                            </Tooltip>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                {!showEndpoint(api, 'prod') && (
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.NewOverview.Endpoints.sandbox.not.set'
                                            defaultMessage='-'
                                        />
                                    </>
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                <FormattedMessage
                                    id='Apis.Details.NewOverview.Endpoints.external.sandbox.endpoint'
                                    defaultMessage='External Sandbox Endpoint'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={8}>
                            <Tooltip
                                placement='top'
                                classes={{
                                    tooltip: parentClasses.htmlTooltip,
                                }}
                                interactive
                                title={
                                    showEndpoint(api, 'sand')
                                    && <>{showEndpoint(api, 'sand')}</>
                                }
                            >
                                <Typography component='p' variant='body1' className={parentClasses.url}>
                                    {showEndpoint(api, 'sand')
                                    && <>{showEndpoint(api, 'sand')}</>}
                                </Typography>
                            </Tooltip>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                {!showEndpoint(api, 'sand') && (
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
