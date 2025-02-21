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

import React, { useState, useEffect, useContext } from 'react';
import {
    Grid,
    Paper,
    Typography,
    styled,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import Alert from 'AppComponents/Shared/Alert';
import GeneralEndpointConfigurations from './GeneralEndpointConfigurations';
import EndpointCard from './EndpointCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const AIEndpoints = ({
    apiObject,
}) => {
    const [productionEndpoints, setProductionEndpoints] = useState([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState([]);
    const [endpointList, setEndpointList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const intl = useIntl();
    const { updateAPI } = useContext(APIContext);

    const fetchEndpoints = () => {
        setLoading(true);
        API.getApiEndpoints(apiObject.id)
            .then((response) => {
                const endpoints = response.body.list;
                const defaultEndpoints = [];

                if (apiObject.endpointConfig?.production_endpoints) {
                    defaultEndpoints.push({
                        id: `${apiObject.id}--PRODUCTION`,
                        name: 'Default Production Endpoint',
                        deploymentStage: 'PRODUCTION',
                        endpointConfig: {
                            production_endpoints: apiObject.endpointConfig.production_endpoints,
                            endpoint_security: apiObject.endpointConfig.endpoint_security
                        }
                    });
                }

                if (apiObject.endpointConfig?.sandbox_endpoints) {
                    defaultEndpoints.push({
                        id: `${apiObject.id}--SANDBOX`,
                        name: 'Default Sandbox Endpoint',
                        deploymentStage: 'SANDBOX',
                        endpointConfig: {
                            sandbox_endpoints: apiObject.endpointConfig.sandbox_endpoints,
                            endpoint_security: apiObject.endpointConfig.endpoint_security
                        }
                    });
                }

                const allEndpoints = [...endpoints, ...defaultEndpoints];
                const prodEndpointList = allEndpoints.filter(ep => ep.deploymentStage === 'PRODUCTION');
                const sandEndpointList = allEndpoints.filter(ep => ep.deploymentStage === 'SANDBOX');

                setProductionEndpoints(prodEndpointList);
                setSandboxEndpoints(sandEndpointList);

                const endpointUrlList = [
                    ...prodEndpointList.map(ep => ep.endpointConfig?.production_endpoints),
                    ...sandEndpointList.map(ep => ep.endpointConfig?.sandbox_endpoints)
                ].filter(Boolean);
                setEndpointList(endpointUrlList);
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.fetch.error',
                    defaultMessage: 'Something went wrong while fetching endpoints',
                }));
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchEndpoints();
    }, []);

    const handleDelete = (endpoint) => {
        // Check if endpoint is primary
        if (endpoint.id === apiObject.primaryProductionEndpointId ||
            endpoint.id === apiObject.primarySandboxEndpointId) {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Endpoints.endpoint.delete.primary.error',
                defaultMessage: 'Cannot delete primary endpoint. Please remove primary status first.',
            }));
            return;
        }

        setIsDeleting(true);
        const isGeneralEndpoint =
            endpoint.id === `${apiObject.id}--PRODUCTION` ||
            endpoint.id === `${apiObject.id}--SANDBOX`;

        let deletePromise;
        if (isGeneralEndpoint) {
            const updatedApi = { ...apiObject };
            const isProduction = endpoint.deploymentStage === 'PRODUCTION';

            // Update endpoint configuration by deleting the property
            delete updatedApi.endpointConfig[isProduction ? 'production_endpoints' : 'sandbox_endpoints'];

            // Clean up security configuration
            if (updatedApi.endpointConfig.endpoint_security) {
                delete updatedApi.endpointConfig.endpoint_security[isProduction ? 'production' : 'sandbox'];
                if (!updatedApi.endpointConfig.endpoint_security.production &&
                    !updatedApi.endpointConfig.endpoint_security.sandbox) {
                    delete updatedApi.endpointConfig.endpoint_security;
                }
            }

            deletePromise = updateAPI(updatedApi);
        } else {
            deletePromise = API.deleteApiEndpoint(apiObject.id, endpoint.id);
        }

        deletePromise
            .then(() => {
                if (endpoint.deploymentStage === 'PRODUCTION') {
                    setProductionEndpoints(prev => prev.filter(ep => ep.id !== endpoint.id));
                } else {
                    setSandboxEndpoints(prev => prev.filter(ep => ep.id !== endpoint.id));
                }


                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.delete.success',
                    defaultMessage: 'Endpoint deleted successfully',
                }));
            })
            .catch((error) => {
                console.error('Error deleting endpoint:', error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.delete.error',
                    defaultMessage: 'Error deleting endpoint',
                }));
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleSetAsPrimary = (endpoint) => {
        // Create a deep copy of the API object to avoid direct mutations
        const updatedApi = {
            ...apiObject,
            [endpoint.deploymentStage === 'PRODUCTION' ?
                'primaryProductionEndpointId' : 'primarySandboxEndpointId']: endpoint.id,
        };

        updateAPI(updatedApi)
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.primary.set.success',
                    defaultMessage: 'Primary endpoint updated successfully',
                }));
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.primary.set.error',
                    defaultMessage: 'Error setting primary endpoint',
                }));
            });
    };

    const handleRemovePrimary = (endpoint) => {
        if (!apiObject.primaryProductionEndpointId || !apiObject.primarySandboxEndpointId) {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Endpoints.endpoint.primary.remove.error',
                defaultMessage: 'At least one endpoint has to be a primary endpoint.',
            }));
            return;
        }

        const updatedApi = {
            ...apiObject,
            [endpoint.deploymentStage === 'PRODUCTION' ?
                'primaryProductionEndpointId' : 'primarySandboxEndpointId']: null,
        };

        updateAPI(updatedApi)
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.primary.update.success',
                    defaultMessage: 'Primary endpoint updated successfully',
                }));
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.primary.update.error',
                    defaultMessage: 'Error updating primary endpoint',
                }));
            });
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
                            id='Apis.Details.Endpoints.AIEndpoints.production.endpoints.label'
                            defaultMessage='Production Endpoints'
                        />
                    </Typography>
                    {productionEndpoints.map((endpoint) => (
                        <EndpointCard
                            key={endpoint.id}
                            endpoint={endpoint}
                            apiObject={apiObject}
                            isPrimary={endpoint.id === apiObject.primaryProductionEndpointId}
                            isDeleting={isDeleting}
                            onDelete={handleDelete}
                            onSetPrimary={handleSetAsPrimary}
                            onRemovePrimary={handleRemovePrimary}
                        />
                    ))}
                </StyledPaper>
            </Grid>
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Typography variant='h5' component='h2' gutterBottom sx={{ mb: 3 }}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.sandbox.endpoints.label'
                            defaultMessage='Sandbox Endpoints'
                        />
                    </Typography>
                    {sandboxEndpoints.map((endpoint) => (
                        <EndpointCard
                            key={endpoint.id}
                            endpoint={endpoint}
                            apiObject={apiObject}
                            isPrimary={endpoint.id === apiObject.primarySandboxEndpointId}
                            isDeleting={isDeleting}
                            onDelete={handleDelete}
                            onSetPrimary={handleSetAsPrimary}
                            onRemovePrimary={handleRemovePrimary}
                        />
                    ))}
                </StyledPaper>
            </Grid>
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Typography variant='h5' component='h2' gutterBottom sx={{ mb: 3 }}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.general.config.header'
                            defaultMessage='General Endpoint Configurations'
                        />
                    </Typography>
                    <GeneralEndpointConfigurations endpointList={endpointList} />
                </StyledPaper>
            </Grid>
        </Grid>
    );
}

export default AIEndpoints;
