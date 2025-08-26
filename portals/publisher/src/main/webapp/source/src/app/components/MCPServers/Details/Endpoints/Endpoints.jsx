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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import PropTypes from 'prop-types';
import { Progress } from 'AppComponents/Shared';
import MCPServer from 'AppData/MCPServer';
import Alert from 'AppComponents/Shared/Alert';
import AddCircle from '@mui/icons-material/AddCircle';
import GeneralEndpointConfigurations from 'AppComponents/Apis/Details/Endpoints/GeneralEndpointConfigurations';
import EndpointCard from './EndpointCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const Endpoints = ({
    apiObject,
    endpointConfiguration,
    history,
}) => {
    const [productionEndpoints, setProductionEndpoints] = useState([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState([]);
    const [endpointList, setEndpointList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        endpointType: null,
        endpoint: null,
    });

    const intl = useIntl();

    const fetchEndpoints = () => {
        setLoading(true);
        MCPServer.getMCPServerEndpoints(apiObject.id)
            .then((response) => {
                const endpoints = response.body;
                
                // Filter endpoints based on their configuration
                const filteredProductionEndpoints = endpoints.filter(ep => {
                    const config = typeof ep.endpointConfig === 'string'
                        ? JSON.parse(ep.endpointConfig)
                        : ep.endpointConfig;
                    return config?.production_endpoints && config.production_endpoints.url;
                });
                
                const filteredSandboxEndpoints = endpoints.filter(ep => {
                    const config = typeof ep.endpointConfig === 'string'
                        ? JSON.parse(ep.endpointConfig)
                        : ep.endpointConfig;
                    return config?.sandbox_endpoints && config.sandbox_endpoints.url;
                });

                setProductionEndpoints(filteredProductionEndpoints);
                setSandboxEndpoints(filteredSandboxEndpoints);

                // Create endpoint URL list for general configurations
                const endpointUrlList = [
                    ...filteredProductionEndpoints.map(ep => {
                        const config = typeof ep.endpointConfig === 'string'
                            ? JSON.parse(ep.endpointConfig)
                            : ep.endpointConfig;
                        return config?.production_endpoints;
                    }),
                    ...filteredSandboxEndpoints.map(ep => {
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
                    id: 'MCPServers.Details.Endpoints.Endpoints.fetch.error',
                    defaultMessage: 'Something went wrong while fetching endpoints',
                }));
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchEndpoints();
    }, []);

    const handleDelete = (endpointType, endpoint) => {
        // Show confirmation dialog first
        setDeleteConfirmation({
            open: true,
            endpointType,
            endpoint,
        });
    };

    const confirmDelete = () => {
        const { endpointType, endpoint } = deleteConfirmation;
        setIsDeleting(true);
        setDeleteConfirmation({ open: false, endpointType: null, endpoint: null });
        
        try {
            // Get the current endpoint configuration
            let endpointConfig;
            if (typeof endpoint.endpointConfig === 'string') {
                endpointConfig = JSON.parse(endpoint.endpointConfig);
            } else {
                endpointConfig = endpoint.endpointConfig;
            }

            // Validate that the endpoint configuration exists
            if (!endpointConfig) {
                throw new Error('Invalid endpoint configuration');
            }

            // Create a copy of the configuration to modify
            const updatedEndpointConfig = { ...endpointConfig };

            // Remove the specified endpoint type and its security
            if (endpointType === 'PRODUCTION') {
                delete updatedEndpointConfig.production_endpoints;
                if (updatedEndpointConfig.endpoint_security) {
                    delete updatedEndpointConfig.endpoint_security.production;
                }
            } else if (endpointType === 'SANDBOX') {
                delete updatedEndpointConfig.sandbox_endpoints;
                if (updatedEndpointConfig.endpoint_security) {
                    delete updatedEndpointConfig.endpoint_security.sandbox;
                }
            } else {
                throw new Error('Invalid endpoint type');
            }

            // Prepare the update payload
            const updatePayload = {
                ...endpoint,
                endpointConfig: JSON.stringify(updatedEndpointConfig)
            };

            const deletePromise = MCPServer.updateMCPServerBackend(apiObject.id, endpoint.id, updatePayload);

            deletePromise
                .then(() => {
                    Alert.success(intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.Endpoints.endpoint.delete.success',
                        defaultMessage: 'Endpoint deleted successfully',
                    }));
                    fetchEndpoints();
                })
                .catch((error) => {
                    console.error('Error deleting endpoint:', error);
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Details.Endpoints.Endpoints.endpoint.delete.error',
                        defaultMessage: 'Error deleting endpoint',
                    }));
                })
                .finally(() => {
                    setIsDeleting(false);
                });
        } catch (error) {
            console.error('Error preparing delete operation:', error);
            Alert.error(intl.formatMessage({
                id: 'MCPServers.Details.Endpoints.Endpoints.endpoint.delete.error',
                defaultMessage: 'Error deleting endpoint',
            }));
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 3 }}>
                        <Typography variant='h5' component='h2'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.production.endpoint.label'
                                defaultMessage='Production Endpoint'
                            />
                        </Typography>
                        {productionEndpoints.length === 0 && (
                            <Button
                                variant='outlined'
                                color='primary'
                                size='small'
                                disabled={isRestricted(['apim:api_create'], apiObject)}
                                onClick={() => {
                                    // Determine which endpoint to update based on existing endpoints
                                    let targetEndpointId = null;
                                    
                                    // If there are sandbox endpoints but no production endpoints,
                                    // update the first sandbox endpoint to add production
                                    if (sandboxEndpoints.length > 0 && productionEndpoints.length === 0) {
                                        targetEndpointId = sandboxEndpoints[0].id;
                                    }
                                    // If neither exist, create a new endpoint
                                    else {
                                        targetEndpointId = 'new';
                                    }
                                    
                                    const baseUrl = `/mcp-servers/${apiObject.id}/endpoints`;
                                    const url = targetEndpointId === 'new' 
                                        ? `${baseUrl}/create`
                                        : `${baseUrl}/create/${targetEndpointId}/PRODUCTION`;
                                    
                                    history.push(url);
                                }}
                                sx={{ marginLeft: 1 }}
                            >
                                <AddCircle sx={{ marginRight: 1 }} />
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.add.new.endpoint'
                                    defaultMessage='Add Production Endpoint'
                                />
                            </Button>
                        )}
                    </Box>
                    {productionEndpoints.length > 0 ? (
                        productionEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                apiObject={apiObject}
                                endpoint={endpoint}
                                isDeleting={isDeleting}
                                onDelete={() => handleDelete('PRODUCTION', endpoint)}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 3 }}>
                        <Typography variant='h5' component='h2'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.sandbox.endpoint.label'
                                defaultMessage='Sandbox Endpoint'
                            />
                        </Typography>
                        {sandboxEndpoints.length === 0 && (
                            <Button
                                variant='outlined'
                                color='primary'
                                size='small'
                                disabled={isRestricted(['apim:api_create'], apiObject)}
                                onClick={() => {
                                    // Determine which endpoint to update based on existing endpoints
                                    let targetEndpointId = null;
                                    
                                    // If there are production endpoints but no sandbox endpoints, 
                                    // update the first production endpoint to add sandbox
                                    if (productionEndpoints.length > 0 && sandboxEndpoints.length === 0) {
                                        targetEndpointId = productionEndpoints[0].id;
                                    }
                                    // If neither exist, create a new endpoint
                                    else {
                                        targetEndpointId = 'new';
                                    }
                                    
                                    const baseUrl = `/mcp-servers/${apiObject.id}/endpoints`;
                                    const url = targetEndpointId === 'new' 
                                        ? `${baseUrl}/create`
                                        : `${baseUrl}/create/${targetEndpointId}/SANDBOX`;
                                    
                                    history.push(url);
                                }}
                                sx={{ marginLeft: 1 }}
                            >
                                <AddCircle sx={{ marginRight: 1 }} />
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.add.new.endpoint'
                                    defaultMessage='Add Sandbox Endpoint'
                                />
                            </Button>
                        )}
                    </Box>
                    {sandboxEndpoints.length > 0 ? (
                        sandboxEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                apiObject={apiObject}
                                endpoint={endpoint}
                                isDeleting={isDeleting}
                                onDelete={() => handleDelete('SANDBOX', endpoint)}
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
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmation.open}
                onClose={() => setDeleteConfirmation({ open: false, endpointType: null, endpoint: null })}
                aria-labelledby='delete-confirmation-dialog-title'
            >
                <DialogTitle id='delete-confirmation-dialog-title'>
                    <FormattedMessage
                        id='MCPServers.Details.Endpoints.Endpoints.delete.confirmation.title'
                        defaultMessage='Confirm Delete'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='MCPServers.Details.Endpoints.Endpoints.delete.confirmation.message'
                            defaultMessage={
                                'Are you sure you want to delete the {endpointType} endpoint? ' +
                                'This action cannot be undone.'
                            }
                            values={{
                                endpointType: deleteConfirmation.endpointType?.toLowerCase() || 'selected'
                            }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteConfirmation({ open: false, endpointType: null, endpoint: null })}
                        color='primary'
                    >
                        <FormattedMessage
                            id='MCPServers.Details.Endpoints.Endpoints.delete.confirmation.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color='primary'
                        variant='contained'
                        disabled={isDeleting}
                    >
                        <FormattedMessage
                            id='MCPServers.Details.Endpoints.Endpoints.delete.confirmation.delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}

Endpoints.propTypes = {
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        apiType: PropTypes.string,
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
    history: PropTypes.shape({}).isRequired,
}

export default Endpoints;
