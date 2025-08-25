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

import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    styled,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Progress } from 'AppComponents/Shared';
import MCPServer from 'AppData/MCPServer';
import Alert from 'AppComponents/Shared/Alert';
import GeneralEndpointConfigurations from 'AppComponents/Apis/Details/Endpoints/GeneralEndpointConfigurations';
import EndpointCard from './EndpointCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const Endpoints = ({
    apiObject,
    endpointConfiguration,
}) => {
    const [productionEndpoints, setProductionEndpoints] = useState([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState([]);
    const [endpointList, setEndpointList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const intl = useIntl();

    const fetchEndpoints = () => {
        setLoading(true);
        MCPServer.getMCPServerEndpoints(apiObject.id)
            .then((response) => {
                const endpoints = response.body;
                setProductionEndpoints(endpoints);                    
                setSandboxEndpoints(endpoints);

                const endpointUrlList = [
                    ...endpoints.map(ep => {
                        const config = typeof ep.endpointConfig === 'string'
                            ? JSON.parse(ep.endpointConfig)
                            : ep.endpointConfig;
                        return config?.production_endpoints;
                    }),
                    ...endpoints.map(ep => {
                        const config = typeof ep.endpointConfig === 'string'
                            ? JSON.parse(ep.endpointConfig)
                            : ep.endpointConfig;
                        return config?.sandbox_endpoints;
                    })
                ].filter(Boolean);
                setEndpointList(endpointUrlList);
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.fetch.error',
                    defaultMessage: 'Something went wrong while fetching endpoints',
                }));
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchEndpoints();
    }, []);

    const handleDelete = () => {
        console.log('TODO: Delete endpoint');
        setIsDeleting(false);
        // const deletePromise = MCPServer.updateMCPServerBackend(apiObject.id, endpoint.id, backendBody);

        // deletePromise
        //     .then(() => {
        //         Alert.success(intl.formatMessage({
        //             id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.endpoint.delete.success',
        //             defaultMessage: 'Endpoint deleted successfully',
        //         }));
        //     })
        //     .catch((error) => {
        //         console.error('Error deleting endpoint:', error);
        //         Alert.error(intl.formatMessage({
        //             id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.endpoint.delete.error',
        //             defaultMessage: 'Error deleting endpoint',
        //         }));
        //     })
        //     .finally(() => {
        //         setIsDeleting(false);
        //     });
    };

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Typography variant='h5' component='h2' gutterBottom sx={{ mb: 3 }}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.production.endpoint.label'
                            defaultMessage='Production Endpoint'
                        />
                    </Typography>
                    {productionEndpoints.length > 0 ? (
                        productionEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                apiObject={apiObject}
                                endpoint={endpoint}
                                isDeleting={isDeleting}
                                onDelete={handleDelete}
                                endpointConfiguration={endpointConfiguration}
                                endpointType='PRODUCTION'
                            />
                        ))
                    ) : (
                        <Typography variant='body1'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.no.production.endpoints'
                                defaultMessage='No production endpoints configured'
                            />
                        </Typography>
                    )}
                </StyledPaper>
            </Grid>
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Typography variant='h5' component='h2' gutterBottom sx={{ mb: 3 }}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.sandbox.endpoint.label'
                            defaultMessage='Sandbox Endpoint'
                        />
                    </Typography>
                    {sandboxEndpoints.length > 0 ? (
                        sandboxEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                apiObject={apiObject}
                                endpoint={endpoint}
                                isDeleting={isDeleting}
                                onDelete={handleDelete}
                                endpointConfiguration={endpointConfiguration}
                                endpointType='SANDBOX'
                            />
                        ))
                    ) : (
                        <Typography variant='body1'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.no.sandbox.endpoints'
                                defaultMessage='No sandbox endpoints configured'
                            />
                        </Typography>
                    )}
                </StyledPaper>
            </Grid>
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Typography variant='h5' component='h2' gutterBottom sx={{ mb: 3 }}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.general.config.header'
                            defaultMessage='General Endpoint Configurations'
                        />
                    </Typography>
                    <GeneralEndpointConfigurations endpointList={endpointList} />
                </StyledPaper>
            </Grid>
        </Grid>
    );
}

Endpoints.propTypes = {
    apiObject: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    endpointConfiguration: PropTypes.shape({
        production_endpoints: PropTypes.arrayOf(PropTypes.shape({
            url: PropTypes.string,
        })),
        sandbox_endpoints: PropTypes.arrayOf(PropTypes.shape({
            url: PropTypes.string,
        })),
        endpoint_type: PropTypes.string,
        endpoint_security: PropTypes.shape({
            production: PropTypes.shape({}),
            sandbox: PropTypes.shape({}),
        }),
    }).isRequired,
}

export default Endpoints;
