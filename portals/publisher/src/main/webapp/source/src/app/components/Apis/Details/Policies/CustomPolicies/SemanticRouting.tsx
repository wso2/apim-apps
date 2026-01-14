/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { FC, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import AddCircle from '@mui/icons-material/AddCircle';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { Endpoint, ModelVendor } from './Types';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CONSTS from 'AppData/Constants';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import ChipInput from 'AppComponents/Shared/ChipInput';
import LaunchIcon from '@mui/icons-material/Launch';

interface RoutingConfig {
    model: string;
    endpointId: string;
    utterances: string[];
    scorethreshold: string;
}

interface DefaultModelConfig {
    model: string;
    endpointId: string;
}

interface EnvironmentConfig {
    defaultModel: DefaultModelConfig;
    routes: RoutingConfig[];
}

interface SemanticRoutingConfig {
    production: EnvironmentConfig;
    sandbox: EnvironmentConfig;
    contentpath?: string;
}

interface PathConfig {
    contentpath: string;
}

interface SemanticRoutingProps {
    setManualPolicyConfig: React.Dispatch<React.SetStateAction<string>>;
    manualPolicyConfig: string;
    setProviderNotConfigured: React.Dispatch<React.SetStateAction<boolean>>;
}

const StyledAccordionSummary = styled(AccordionSummary)(() => ({
    minHeight: 48,
    maxHeight: 48,
    '&.Mui-expanded': {
        minHeight: 48,
        maxHeight: 48,
    },
    '& .MuiAccordionSummary-content': {
        margin: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '&.Mui-expanded': {
            margin: 0,
        }
    }
}));

const SemanticRouting: FC<SemanticRoutingProps> = ({
    setManualPolicyConfig,
    manualPolicyConfig,
    setProviderNotConfigured,
}) => {
    const [apiFromContext] = useAPI();
    const { data: settings }: any = usePublisherSettings();
    const embeddingProviderConfigured = settings?.aiApiPolicyConfiguration?.embeddingProviderConfigured;
    const [config, setConfig] = useState<SemanticRoutingConfig>({
        production: {
            defaultModel: { model: '', endpointId: '' },
            routes: [],
        },
        sandbox: {
            defaultModel: { model: '', endpointId: '' },
            routes: [],
        },
        contentpath: '',
    });
    const [modelList, setModelList] = useState<ModelVendor[]>([]);
    const [productionEndpoints, setProductionEndpoints] = useState<Endpoint[]>([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [productionEnabled, setProductionEnabled] = useState<boolean>(false);
    const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);

    // Check if embedding provider is configured and update parent component
    useEffect(() => {
        if (settings && !embeddingProviderConfigured) {
            setProviderNotConfigured(true);
        } else {
            setProviderNotConfigured(false);
        }
    }, [settings, embeddingProviderConfigured, setProviderNotConfigured]);

    const embeddingProviderNotConfiguredWarning = (
        <FormattedMessage
            id='Apis.Details.Policies.CustomPolicies.SemanticRouting.warning.embeddingProviderNotConfigured'
            defaultMessage={'Configure embedding provider in deployment.toml to enable Semantic Routing. '
                + 'For more information, refer to {docLink}'}
            values={{
                docLink: (
                    <a
                        id='semantic-routing-doc-link'
                        href='https://apim.docs.wso2.com/en/latest/deploy-and-publish/deploy-on-gateway/choreo-connect/deploy-api/deploy-rest-api-in-choreo-connect/'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        documentation
                        <LaunchIcon
                            style={{ marginLeft: '2px' }}
                            fontSize='small'
                        />
                    </a>
                ),
            }}
        />
    );

    const fetchEndpoints = () => {
        setLoading(true);
        const endpointsPromise = API.getApiEndpoints(apiFromContext.id);
        endpointsPromise
            .then((response) => {
                const endpoints = response.body.list;
                const defaultEndpoints = [];

                if (apiFromContext.endpointConfig?.production_endpoints) {
                    defaultEndpoints.push({
                        id: CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION,
                        name: 'Default Production Endpoint',
                        deploymentStage: 'PRODUCTION',
                        endpointConfig: {
                            production_endpoints: apiFromContext.endpointConfig.production_endpoints,
                            endpoint_security: apiFromContext.endpointConfig.endpoint_security
                        }
                    });
                }

                if (apiFromContext.endpointConfig?.sandbox_endpoints) {
                    defaultEndpoints.push({
                        id: CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX,
                        name: 'Default Sandbox Endpoint',
                        deploymentStage: 'SANDBOX',
                        endpointConfig: {
                            sandbox_endpoints: apiFromContext.endpointConfig.sandbox_endpoints,
                            endpoint_security: apiFromContext.endpointConfig.endpoint_security
                        }
                    });
                }

                const allEndpoints = [...defaultEndpoints, ...endpoints];
                
                const prodEndpointList = allEndpoints.filter((endpoint: Endpoint) => endpoint.deploymentStage === 'PRODUCTION');
                const sandEndpointList = allEndpoints.filter((endpoint: Endpoint) => endpoint.deploymentStage === 'SANDBOX');
                setProductionEndpoints(prodEndpointList);
                setSandboxEndpoints(sandEndpointList);

            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                setLoading(false);
            });
    }

    const fetchModelList = () => {
        const modelListPromise = API.getLLMProviderModelList(JSON.parse(apiFromContext.subtypeConfiguration.configuration).llmProviderId);
        modelListPromise
            .then((response) => {
                const vendors: ModelVendor[] = response.body.map((vendor: any) => ({
                    vendor: vendor.name,
                    values: vendor.models
                }));
                setModelList(vendors);
            }).catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        fetchModelList();
        fetchEndpoints();
    }, []);

    useEffect(() => {
        if (manualPolicyConfig !== '') {
            try {
                const parsedConfig = JSON.parse(manualPolicyConfig.replace(/\'/g, "'").replace(/'/g, '"'));
                
                // Handle path - backend expects single object with contentpath field
                let contentpath = '';
                if (parsedConfig.path && typeof parsedConfig.path === 'object') {
                    contentpath = parsedConfig.path.contentpath || '';
                }
                
                const productionConfig: EnvironmentConfig = {
                    defaultModel: parsedConfig.production?.defaultModel || { model: '', endpointId: '' },
                    routes: parsedConfig.production?.routes || [],
                };
                
                const sandboxConfig: EnvironmentConfig = {
                    defaultModel: parsedConfig.sandbox?.defaultModel || { model: '', endpointId: '' },
                    routes: parsedConfig.sandbox?.routes || [],
                };
                
                setConfig({
                    production: productionConfig,
                    sandbox: sandboxConfig,
                    contentpath: contentpath,
                });
                
                const hasProductionConfig = parsedConfig.production && parsedConfig.production.routes && parsedConfig.production.routes.length > 0;
                const hasSandboxConfig = parsedConfig.sandbox && parsedConfig.sandbox.routes && parsedConfig.sandbox.routes.length > 0;
                
                setProductionEnabled(hasProductionConfig);
                setSandboxEnabled(hasSandboxConfig);
            } catch (error) {
                console.error('Error parsing manual policy config:', error);
                // Set default empty config if parsing fails
                setConfig({
                    production: {
                        defaultModel: { model: '', endpointId: '' },
                        routes: [],
                    },
                    sandbox: {
                        defaultModel: { model: '', endpointId: '' },
                        routes: [],
                    },
                    contentpath: '',
                });
            }
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        // Convert to backend format with production/sandbox each having defaultModel and routes
        const configForBackend: any = {
            production: {
                defaultModel: config.production.defaultModel,
                routes: config.production.routes,
            },
            sandbox: {
                defaultModel: config.sandbox.defaultModel,
                routes: config.sandbox.routes,
            },
        };
        
        // Add path as single object (not array) - backend expects this format
        if (config.contentpath && config.contentpath.trim() !== '') {
            configForBackend.path = { contentpath: config.contentpath.trim() };
        }
        
        // Convert to string format expected by backend
        // Backend expects single quotes for the string representation
        const jsonString = JSON.stringify(configForBackend);
        const formattedString = jsonString.replace(/"/g, "'");
        setManualPolicyConfig(formattedString);
    }, [config, setManualPolicyConfig]);

    const handleAddProductionRoute = () => {
        const newRoute: RoutingConfig = {
            model: '',
            endpointId: '',
            utterances: [],
            scorethreshold: '0.8',
        };

        setConfig((prevConfig) => ({
            ...prevConfig,
            production: {
                ...prevConfig.production,
                routes: [...prevConfig.production.routes, newRoute],
            },
        }));
    }

    const handleProductionRouteUpdate = (index: number, field: keyof RoutingConfig, value: any) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            production: {
                ...prevConfig.production,
                routes: prevConfig.production.routes.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                ),
            },
        }));
    }

    const handleProductionRouteDelete = (index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            production: {
                ...prevConfig.production,
                routes: prevConfig.production.routes.filter((item, i) => i !== index),
            },
        }));
    }

    const handleAddSandboxRoute = () => {
        const newRoute: RoutingConfig = {
            model: '',
            endpointId: '',
            utterances: [],
            scorethreshold: '0.8',
        };

        setConfig((prevConfig) => ({
            ...prevConfig,
            sandbox: {
                ...prevConfig.sandbox,
                routes: [...prevConfig.sandbox.routes, newRoute],
            },
        }));
    }

    const handleSandboxRouteUpdate = (index: number, field: keyof RoutingConfig, value: any) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            sandbox: {
                ...prevConfig.sandbox,
                routes: prevConfig.sandbox.routes.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                ),
            },
        }));
    }

    const handleSandboxRouteDelete = (index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            sandbox: {
                ...prevConfig.sandbox,
                routes: prevConfig.sandbox.routes.filter((item, i) => i !== index),
            },
        }));
    }

    const handleDefaultModelUpdate = (env: 'production' | 'sandbox', field: keyof DefaultModelConfig, value: string) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                defaultModel: {
                    ...prevConfig[env].defaultModel,
                    [field]: value,
                },
            },
        }));
    }

    const normalizeContentPath = (path: string): string => {
        return path.replace(/'/g, '"');
    }

    const handleContentPathUpdate = (value: string) => {
        const normalizedPath = normalizeContentPath(value);
        setConfig((prevConfig) => ({
            ...prevConfig,
            contentpath: normalizedPath,
        }));
    }

    const isAddRouteDisabled = (env: 'production' | 'sandbox') => {
        if (modelList.length === 0) {
            return true;
        }
        return env === 'production' ? productionEndpoints.length === 0 : sandboxEndpoints.length === 0;
    };

    const getEndpointsUrl = () => {
        return `/apis/${apiFromContext.id}/endpoints`;
    };

    const handleProductionToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProductionEnabled(event.target.checked);
        if (!event.target.checked) {
            setConfig(prev => ({
                ...prev,
                production: {
                    defaultModel: { model: '', endpointId: '' },
                    routes: [],
                },
            }));
        }
    };

    const handleSandboxToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSandboxEnabled(event.target.checked);
        if (!event.target.checked) {
            setConfig(prev => ({
                ...prev,
                sandbox: {
                    defaultModel: { model: '', endpointId: '' },
                    routes: [],
                },
            }));
        }
    };

    const handleAccordionChange = (env: 'production' | 'sandbox') => (event: React.SyntheticEvent, expanded: boolean) => {
        if (env === 'production') {
            handleProductionToggle({ target: { checked: expanded } } as React.ChangeEvent<HTMLInputElement>);
        } else {
            handleSandboxToggle({ target: { checked: expanded } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleUtteranceAdd = (env: 'production' | 'sandbox', index: number, value: string) => {
        if (value.trim() === '') return;
        
        if (env === 'production') {
            const currentUtterances = config.production.routes[index].utterances;
            handleProductionRouteUpdate(index, 'utterances', [...currentUtterances, value.trim()]);
        } else {
            const currentUtterances = config.sandbox.routes[index].utterances;
            handleSandboxRouteUpdate(index, 'utterances', [...currentUtterances, value.trim()]);
        }
    };

    const handleUtteranceDelete = (env: 'production' | 'sandbox', routeIndex: number, utteranceIndex: number) => {
        if (env === 'production') {
            const currentUtterances = config.production.routes[routeIndex].utterances;
            handleProductionRouteUpdate(
                routeIndex, 
                'utterances', 
                currentUtterances.filter((_, i) => i !== utteranceIndex)
            );
        } else {
            const currentUtterances = config.sandbox.routes[routeIndex].utterances;
            handleSandboxRouteUpdate(
                routeIndex, 
                'utterances', 
                currentUtterances.filter((_, i) => i !== utteranceIndex)
            );
        }
    };

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }


    const renderDefaultModelCard = (env: 'production' | 'sandbox', endpoints: Endpoint[]) => {
        const envConfig = config[env];
        
        return (
            <Paper elevation={2} sx={{ padding: 2, marginTop: 2, marginBottom: 1 }}>
                <Grid container spacing={2}>
                    {/* Content Path Section */}
                    <Grid item xs={12}>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.SemanticRouting.contentpath.title'
                                defaultMessage='Content Path'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size='small'
                            fullWidth
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.contentpath'
                                    defaultMessage='Content Path'
                                />
                            }
                            value={config.contentpath || ''}
                            onChange={(e) => handleContentPathUpdate(e.target.value)}
                            placeholder="$.messages[?(@.role=='user')].content"
                            helperText="Enter JSONPath expression (e.g., $.messages[?(@.role=='user')].content)"
                        />
                    </Grid>
                    
                    {/* Default Model Section */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.SemanticRouting.defaultmodel.title'
                                defaultMessage='Default Model'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl size='small' fullWidth>
                            <InputLabel id={`default-model-label-${env}`}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.select.model'
                                    defaultMessage='Model'
                                />
                            </InputLabel>
                            <Select
                                labelId={`default-model-label-${env}`}
                                id={`default-model-${env}`}
                                value={envConfig.defaultModel.model}
                                label='Model'
                                onChange={(e) => handleDefaultModelUpdate(env, 'model', e.target.value as string)}
                            >
                                {modelList.flatMap((vendor) => 
                                    vendor.values.map((modelValue) => (
                                        <MenuItem key={modelValue} value={modelValue}>
                                            {modelValue}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl size='small' fullWidth>
                            <InputLabel id={`default-endpoint-label-${env}`}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.select.endpoint'
                                    defaultMessage='Endpoint'
                                />
                            </InputLabel>
                            <Select
                                labelId={`default-endpoint-label-${env}`}
                                id={`default-endpoint-${env}`}
                                value={envConfig.defaultModel.endpointId}
                                label='Endpoint'
                                onChange={(e) => handleDefaultModelUpdate(env, 'endpointId', e.target.value as string)}
                            >
                                {endpoints.map((endpoint) => (
                                    <MenuItem key={endpoint.id} value={endpoint.id}>
                                        {endpoint.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    const renderRoutingCard = (
        route: RoutingConfig,
        env: 'production' | 'sandbox',
        index: number,
        endpoints: Endpoint[],
        onDelete?: () => void
    ) => {
        const handleModelChange = (value: string) => {
            if (env === 'production') {
                handleProductionRouteUpdate(index, 'model', value);
            } else {
                handleSandboxRouteUpdate(index, 'model', value);
            }
        };

        const handleEndpointChange = (value: string) => {
            if (env === 'production') {
                handleProductionRouteUpdate(index, 'endpointId', value);
            } else {
                handleSandboxRouteUpdate(index, 'endpointId', value);
            }
        };

        const handleThresholdChange = (value: string) => {
            // Validate that the value is between 0 and 1
            const numValue = parseFloat(value);
            if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 1)) {
                if (env === 'production') {
                    handleProductionRouteUpdate(index, 'scorethreshold', value);
                } else {
                    handleSandboxRouteUpdate(index, 'scorethreshold', value);
                }
            }
        };

        return (
            <Paper elevation={2} sx={{ padding: 2, margin: 1, position: 'relative' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl size='small' fullWidth>
                            <InputLabel id={`model-label-${env}-${index}`}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.select.model'
                                    defaultMessage='Model'
                                />
                            </InputLabel>
                            <Select
                                labelId={`model-label-${env}-${index}`}
                                id={`model-${env}-${index}`}
                                value={route.model}
                                label='Model'
                                onChange={(e) => handleModelChange(e.target.value as string)}
                            >
                                {modelList.flatMap((vendor) => 
                                    vendor.values.map((modelValue) => (
                                        <MenuItem key={modelValue} value={modelValue}>
                                            {modelValue}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl size='small' fullWidth>
                            <InputLabel id={`endpoint-label-${env}-${index}`}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.select.endpoint'
                                    defaultMessage='Endpoint'
                                />
                            </InputLabel>
                            <Select
                                labelId={`endpoint-label-${env}-${index}`}
                                id={`endpoint-${env}-${index}`}
                                value={route.endpointId}
                                label='Endpoint'
                                onChange={(e) => handleEndpointChange(e.target.value as string)}
                            >
                                {endpoints.map((endpoint) => (
                                    <MenuItem key={endpoint.id} value={endpoint.id}>
                                        {endpoint.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size='small'
                            fullWidth
                            type='number'
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.scorethreshold'
                                    defaultMessage='Score Threshold (0-1)'
                                />
                            }
                            value={route.scorethreshold}
                            onChange={(e) => handleThresholdChange(e.target.value)}
                            inputProps={{
                                step: 0.1,
                                min: 0,
                                max: 1,
                            }}
                            helperText='Enter a value between 0 and 1 (e.g., 0.1, 0.7, 0.9)'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ChipInput
                            fullWidth
                            variant='outlined'
                            size='small'
                            id={`utterances-${env}-${index}`}
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.utterances'
                                    defaultMessage='Utterances'
                                />
                            }
                            value={route.utterances}
                            onAdd={(utterance: string) => handleUtteranceAdd(env, index, utterance)}
                            onDelete={(utterance: string) => {
                                const utteranceIndex = route.utterances.indexOf(utterance);
                                if (utteranceIndex !== -1) {
                                    handleUtteranceDelete(env, index, utteranceIndex);
                                }
                            }}
                            helperText={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.utterances.helper'
                                    defaultMessage='Enter keywords to match similarity. Press Enter to add.'
                                />
                            }
                            placeholder='Type utterance and press Enter'
                            InputProps={{
                                sx: { pt: 1 }
                            }}
                            chipRenderer={({ value, text, isFocused, isDisabled, isReadOnly, handleClick, handleDelete, className }: any, key: number) => (
                                <Chip
                                    key={key}
                                    className={className}
                                    style={{
                                        pointerEvents: isDisabled || isReadOnly ? 'none' : undefined,
                                        marginRight: '8px',
                                    }}
                                    onClick={handleClick}
                                    onDelete={handleDelete}
                                    label={text}
                                    size='small'
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                {onDelete && (
                    <Grid
                        item
                        xs={12}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: 2,
                        }}
                    >
                        <IconButton
                            color='error'
                            data-testid='route-delete'
                            onClick={onDelete}
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                )}
            </Paper>
        );
    };

    return (
        <>
            {!embeddingProviderConfigured && (
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <Alert severity='warning' sx={{ mb: 2 }}>
                        {embeddingProviderNotConfiguredWarning}
                    </Alert>
                </Grid>
            )}
            <Grid item xs={12} sx={{ pt: 1 }}>
                <Accordion 
                    expanded={productionEnabled} 
                    onChange={handleAccordionChange('production')}
                >
                    <StyledAccordionSummary
                        aria-controls='production-content'
                        id='production-header'
                    >
                        <Typography variant='subtitle2' color='textPrimary'>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.SemanticRouting.accordion.production'
                                defaultMessage='Production'
                            />
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={productionEnabled}
                                    onChange={handleProductionToggle}
                                    name="production-toggle"
                                />
                            }
                            label=""
                            sx={{ mr: -1 }}
                        />
                    </StyledAccordionSummary>
                    <AccordionDetails>
                        {modelList.length === 0 ? (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        ) : (
                            <>
                                {productionEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.SemanticRouting.no.production.endpoints'
                                            defaultMessage='No production endpoints available. Please {configureLink} first.'
                                            values={{
                                                configureLink: (
                                                    <Link to={getEndpointsUrl()}>
                                                        configure endpoints
                                                    </Link>
                                                ),
                                            }}
                                        />
                                    </Alert>
                                )}
                                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.SemanticRouting.routing.routes'
                                        defaultMessage='Routing rule'
                                    />
                                </Typography>
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    data-testid='add-production-route'
                                    sx={{ ml: 1, mb: 2 }}
                                    onClick={handleAddProductionRoute}
                                    disabled={isAddRouteDisabled('production')}
                                >
                                    <AddCircle sx={{ mr: 1 }} />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.SemanticRouting.add.route'
                                        defaultMessage='Add rule'
                                    />
                                </Button>
                                {config.production.routes.map((route, index) => 
                                    renderRoutingCard(
                                        route, 
                                        'production', 
                                        index, 
                                        productionEndpoints,
                                        () => handleProductionRouteDelete(index)
                                    )
                                )}
                                {renderDefaultModelCard('production', productionEndpoints)}
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
                <Accordion 
                    expanded={sandboxEnabled} 
                    onChange={handleAccordionChange('sandbox')}
                >
                    <StyledAccordionSummary
                        aria-controls='sandbox-content'
                        id='sandbox-header'
                    >
                        <Typography variant='subtitle2' color='textPrimary'>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.SemanticRouting.accordion.sandbox'
                                defaultMessage='Sandbox'
                            />
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sandboxEnabled}
                                    onChange={handleSandboxToggle}
                                    name="sandbox-toggle"
                                />
                            }
                            label=""
                            sx={{ mr: -1 }}
                        />
                    </StyledAccordionSummary>
                    <AccordionDetails>
                        {modelList.length === 0 ? (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        ) : (
                            <>
                                {sandboxEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.SemanticRouting.no.sandbox.endpoints'
                                            defaultMessage='No sandbox endpoints available. Please {configureLink} first.'
                                            values={{
                                                configureLink: (
                                                    <Link to={getEndpointsUrl()}>
                                                        configure endpoints
                                                    </Link>
                                                ),
                                            }}
                                        />
                                    </Alert>
                                )}
                                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.SemanticRouting.routing.routes'
                                        defaultMessage='Routing rule'
                                    />
                                </Typography>
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    data-testid='add-sandbox-route'
                                    sx={{ ml: 1, mb: 2 }}
                                    onClick={handleAddSandboxRoute}
                                    disabled={isAddRouteDisabled('sandbox')}
                                >
                                    <AddCircle sx={{ mr: 1 }} />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.SemanticRouting.add.route'
                                        defaultMessage='Add rule'
                                    />
                                </Button>
                                {config.sandbox.routes.map((route, index) => 
                                    renderRoutingCard(
                                        route, 
                                        'sandbox', 
                                        index, 
                                        sandboxEndpoints,
                                        () => handleSandboxRouteDelete(index)
                                    )
                                )}
                                {renderDefaultModelCard('sandbox', sandboxEndpoints)}
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </>
    );
}

export default SemanticRouting;
