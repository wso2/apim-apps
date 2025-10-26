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
    Button,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import Alert from 'AppComponents/Shared/Alert';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';
import CONSTS from 'AppData/Constants';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { isRestricted } from 'AppData/AuthManager';
import GeneralEndpointConfigurations from '../GeneralEndpointConfigurations';
import EndpointCard from './EndpointCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const AIEndpoints = ({
    apiObject,
    onChangeAPI,
    llmProviderEndpointConfiguration,
}) => {
    const [productionEndpoints, setProductionEndpoints] = useState([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState([]);
    const [endpointList, setEndpointList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmSetPrimaryOpen, setConfirmSetPrimaryOpen] = useState(false);
    const [confirmRemovePrimaryOpen, setConfirmRemovePrimaryOpen] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [isUnsecured, setUnsecured] = useState(false);

    const intl = useIntl();
    const history = useHistory();
    const { updateAPI } = useContext(APIContext);

    useEffect(() => {
        if (llmProviderEndpointConfiguration) {
            const authConfig = llmProviderEndpointConfiguration?.authenticationConfiguration;
            if (authConfig?.enabled === false && authConfig?.type?.toLowerCase() === 'none') {
                setUnsecured(true);
            } else {
                setUnsecured(false);
            }
        }
    }, [llmProviderEndpointConfiguration]);

    const fetchEndpoints = () => {
        setLoading(true);
        API.getApiEndpoints(apiObject.id)
            .then((response) => {
                const endpoints = response.body.list;
                const defaultEndpoints = [];

                if (apiObject.endpointConfig?.production_endpoints) {
                    defaultEndpoints.push({
                        id: CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION,
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
                        id: CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX,
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
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.fetch.error',
                    defaultMessage: 'Something went wrong while fetching endpoints',
                }));
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchEndpoints();
    }, [apiObject.id]);

    // Open confirmation dialog and execute delete
    const handleDelete = (endpoint) => {
        setSelectedEndpoint(endpoint);
        setConfirmDeleteOpen(true);
    };

    const executeDelete = (endpoint) => {
        // Check if endpoint is primary
        if (endpoint.id === apiObject.primaryProductionEndpointId ||
            endpoint.id === apiObject.primarySandboxEndpointId) {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.delete.primary.error',
                defaultMessage: 'Cannot delete primary endpoint. Please remove primary status first.',
            }));
            return;
        }

        setIsDeleting(true);
        let deletePromise
        const isGeneralEndpoint = endpoint.id === CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION ||
            endpoint.id === CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX;

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
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.endpoint.delete.success',
                    defaultMessage: 'Endpoint deleted successfully',
                }));
            })
            .catch((error) => {
                console.error('Error deleting endpoint:', error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.endpoint.delete.error',
                    defaultMessage: 'Error deleting endpoint',
                }));
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    // Helper function to handle onChangeAPI calls
    const handleAPIChange = (endpoint, updatedApi) => {
        if (endpoint.deploymentStage === 'PRODUCTION') {
            onChangeAPI({
                action: 'set_primary_production_endpoint',
                value: updatedApi.primaryProductionEndpointId
            });
        } else {
            onChangeAPI({
                action: 'set_primary_sandbox_endpoint',
                value: updatedApi.primarySandboxEndpointId
            });
        }
    };

    // Open confirmation dialog and execute set-as-primary
    const handleSetAsPrimary = (endpoint) => {
        setSelectedEndpoint(endpoint);
        setConfirmSetPrimaryOpen(true);
    };

    const executeSetAsPrimary = (endpoint) => {
        // Create a deep copy of the API object to avoid direct mutations
        const updatedApi = {
            ...apiObject,
            [endpoint.deploymentStage === 'PRODUCTION' ?
                'primaryProductionEndpointId' : 'primarySandboxEndpointId']: endpoint.id,
        };

        updateAPI(updatedApi)
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.primary.set.success',
                    defaultMessage: 'Primary endpoint updated successfully',
                }));
                handleAPIChange(endpoint, updatedApi);
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.primary.set.error',
                    defaultMessage: 'Error setting primary endpoint',
                }));
            });
    };

    // Open confirmation dialog and execute remove-primary
    const handleRemovePrimary = (endpoint) => {
        setSelectedEndpoint(endpoint);
        setConfirmRemovePrimaryOpen(true);
    };

    const executeRemovePrimary = (endpoint) => {
        if (!apiObject.primaryProductionEndpointId || !apiObject.primarySandboxEndpointId) {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.primary.remove.error',
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
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.primary.update.success',
                    defaultMessage: 'Primary endpoint updated successfully',
                }));
                handleAPIChange(endpoint, updatedApi);
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.AIEndpoints.AIEndpoints.primary.update.error',
                    defaultMessage: 'Error updating primary endpoint',
                }));
            });
    };

    const isPrimaryEndpointSecurityConfigured = () => {
        // Helper function to parse endpointConfig if it's a string
        const parseEndpointConfig = (config) => {
            if (typeof config === 'string') {
                try {
                    return JSON.parse(config);
                } catch (error) {
                    console.error('Error parsing endpoint configuration:', error);
                    return null;
                }
            }
            return config;
        };

        // Check production primary endpoint
        if (apiObject.primaryProductionEndpointId) {
            const primaryProdEndpoint = productionEndpoints.find(
                ep => ep.id === apiObject.primaryProductionEndpointId
            );
            if (primaryProdEndpoint) {
                const parsedConfig = parseEndpointConfig(primaryProdEndpoint.endpointConfig);
                if (!parsedConfig?.endpoint_security?.production) {
                    return false;
                }
            }
        }

        // Check sandbox primary endpoint
        if (apiObject.primarySandboxEndpointId) {
            const primarySandEndpoint = sandboxEndpoints.find(
                ep => ep.id === apiObject.primarySandboxEndpointId
            );
            if (primarySandEndpoint) {
                const parsedConfig = parseEndpointConfig(primarySandEndpoint.endpointConfig);
                if (!parsedConfig?.endpoint_security?.sandbox) {
                    return false;
                }
            }
        }

        return true;
    };

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <Grid container spacing={2}>
            {/* Confirm: Delete endpoint */}
            <ConfirmDialog
                key='confirm-delete-endpoint'
                labelCancel={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.delete.cancel'
                        defaultMessage='Cancel'
                    />
                }
                title={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.delete.title'
                        defaultMessage='Confirm Delete'
                    />
                }
                message={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.delete.message'
                        defaultMessage='Are you sure you want to delete the endpoint {name}?'
                        values={{ name: selectedEndpoint?.name || '' }}
                    />
                }
                labelOk={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.delete.ok'
                        defaultMessage='Yes'
                    />
                }
                callback={(ok) => {
                    if (ok && selectedEndpoint) {
                        executeDelete(selectedEndpoint);
                    }
                    setConfirmDeleteOpen(false);
                    setSelectedEndpoint(null);
                }}
                open={confirmDeleteOpen}
            />

            {/* Confirm: Set as primary */}
            <ConfirmDialog
                key='confirm-set-primary-endpoint'
                labelCancel={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.setprimary.cancel'
                        defaultMessage='Cancel'
                    />
                }
                title={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.setprimary.title'
                        defaultMessage='Confirm Primary Endpoint Change'
                    />
                }
                message={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.setprimary.message'
                        defaultMessage='Set {name} as the primary {stage} endpoint ?'
                        values={{ name: selectedEndpoint?.name || '', 
                            stage: selectedEndpoint?.deploymentStage.toLowerCase() || '' }}
                    />
                }
                labelOk={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.setprimary.ok'
                        defaultMessage='Yes'
                    />
                }
                confirmPrimary
                callback={(ok) => {
                    if (ok && selectedEndpoint) {
                        executeSetAsPrimary(selectedEndpoint);
                    }
                    setConfirmSetPrimaryOpen(false);
                    setSelectedEndpoint(null);
                }}
                open={confirmSetPrimaryOpen}
            />

            {/* Confirm: Remove primary */}
            <ConfirmDialog
                key='confirm-remove-primary-endpoint'
                labelCancel={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.removeprimary.cancel'
                        defaultMessage='Cancel'
                    />
                }
                title={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.removeprimary.title'
                        defaultMessage='Confirm Primary Endpoint Removal'
                    />
                }
                message={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.removeprimary.message'
                        defaultMessage='Remove primary {stage} endpoint {name}?'
                        values={{ name: selectedEndpoint?.name || '', 
                            stage: selectedEndpoint?.deploymentStage.toLowerCase() || '' }}
                    />
                }
                labelOk={
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.confirm.removeprimary.ok'
                        defaultMessage='Yes'
                    />
                }
                callback={(ok) => {
                    if (ok && selectedEndpoint) {
                        executeRemovePrimary(selectedEndpoint);
                    }
                    setConfirmRemovePrimaryOpen(false);
                    setSelectedEndpoint(null);
                }}
                open={confirmRemovePrimaryOpen}
            />
            <Grid item xs={12}>
                <StyledPaper elevation={0} variant='outlined'>
                    <Typography variant='h5' component='h2' gutterBottom sx={{ mb: 3 }}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.production.endpoints.label'
                            defaultMessage='Production Endpoints'
                        />
                    </Typography>
                    {productionEndpoints.length > 0 ? (
                        productionEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                endpoint={endpoint}
                                apiObject={apiObject}
                                isPrimary={endpoint.id === apiObject.primaryProductionEndpointId}
                                isDeleting={isDeleting}
                                onDelete={handleDelete}
                                onSetPrimary={handleSetAsPrimary}
                                onRemovePrimary={handleRemovePrimary}
                                llmProviderEndpointConfiguration={llmProviderEndpointConfiguration}
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
                            id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.sandbox.endpoints.label'
                            defaultMessage='Sandbox Endpoints'
                        />
                    </Typography>
                    {sandboxEndpoints.length > 0 ? (
                        sandboxEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                endpoint={endpoint}
                                apiObject={apiObject}
                                isPrimary={endpoint.id === apiObject.primarySandboxEndpointId}
                                isDeleting={isDeleting}
                                onDelete={handleDelete}
                                onSetPrimary={handleSetAsPrimary}
                                onRemovePrimary={handleRemovePrimary}
                                llmProviderEndpointConfiguration={llmProviderEndpointConfiguration}
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
            <Grid item xs={12}>
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    disabled={
                        isRestricted(['apim:api_create', 'apim:api_publish', 'apim:api_manage'], apiObject) ||
                        (!isUnsecured && !isPrimaryEndpointSecurityConfigured())
                    }
                    endIcon={<OpenInNewIcon />}
                    onClick={() => {
                        history.push({
                            pathname: `/apis/${apiObject.id}/deployments`,
                            state: 'deploy',
                        })
                    }}
                >
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.AIEndpoints.deploy.redirect.btn'
                        defaultMessage='Go to Deployments'
                    />
                </Button>
            </Grid>
        </Grid>
    );
}

AIEndpoints.propTypes = {
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        primaryProductionEndpointId: PropTypes.string,
        primarySandboxEndpointId: PropTypes.string,
        endpointConfig: PropTypes.shape({
            production_endpoints: PropTypes.shape({
                url: PropTypes.string,
            }),
            sandbox_endpoints: PropTypes.shape({
                url: PropTypes.string,
            }),
            endpoint_security: PropTypes.shape({
                production: PropTypes.bool,
                sandbox: PropTypes.bool,
            }),
        }),
    }).isRequired,
    onChangeAPI: PropTypes.func.isRequired,
    llmProviderEndpointConfiguration: PropTypes.shape({
        authenticationConfiguration: PropTypes.shape({
            enabled: PropTypes.bool,
            type: PropTypes.string,
            parameters: PropTypes.shape({}),
        }),
    }).isRequired,
}

export default AIEndpoints;
