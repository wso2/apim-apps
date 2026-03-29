/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
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
import { Endpoint, ModelData, ModelVendor } from './Types';
import ModelCard from './ModelCard';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CONSTS from 'AppData/Constants';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import ChipInput from 'AppComponents/Shared/ChipInput';

interface RoutingConfig {
    id: string;
    vendor: string;
    model: string;
    endpointId: string;
    endpointName: string;
    utterances: string[];
    scorethreshold: string;
}

interface EnvironmentConfig {
    defaultModel: ModelData;
    routes: RoutingConfig[];
}

interface SemanticRoutingConfig {
    production: EnvironmentConfig;
    sandbox: EnvironmentConfig;
    path?: { contentpath: string };
}

interface SemanticRoutingProps {
    setManualPolicyConfig: React.Dispatch<React.SetStateAction<string>>;
    manualPolicyConfig: string;
    setIsFormValid?: React.Dispatch<React.SetStateAction<boolean>>;
    showValidationErrors?: boolean;
    setShowValidationErrors?: React.Dispatch<React.SetStateAction<boolean>>;
}

// Default empty model structure for consistent initialization
const EMPTY_MODEL: ModelData = { vendor: '', model: '', endpointId: '', endpointName: '' };

// Normalizes incomplete/legacy model objects by providing default empty strings for missing fields
const normalizeModelData = (model: any): ModelData => ({
    vendor: model?.vendor ?? '',
    model: model?.model ?? '',
    endpointId: model?.endpointId ?? '',
    endpointName: model?.endpointName ?? '',
});

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
    setIsFormValid,
    showValidationErrors = false,
    setShowValidationErrors,
}) => {
    const [apiFromContext] = useAPI();
    const [config, setConfig] = useState<SemanticRoutingConfig>({
        production: {
            defaultModel: { ...EMPTY_MODEL },
            routes: [],
        },
        sandbox: {
            defaultModel: { ...EMPTY_MODEL },
            routes: [],
        },
    });
    const [modelList, setModelList] = useState<ModelVendor[]>([]);
    const [productionEndpoints, setProductionEndpoints] = useState<Endpoint[]>([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [productionEnabled, setProductionEnabled] = useState<boolean>(false);
    const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);
    // Validates all required fields across enabled environments
    const validateForm = (): boolean => {
        if (!productionEnabled && !sandboxEnabled) {
            return false;
        }

        // Content path is required
        if (!config.path?.contentpath || config.path.contentpath.trim() === '') {
            return false;
        }

        if (productionEnabled) {
            if (!config.production.defaultModel.model || !config.production.defaultModel.endpointId) {
                return false;
            }
            // Must have at least one route
            if (config.production.routes.length === 0) {
                return false;
            }
            // Each route must have all required fields filled
            for (const route of config.production.routes) {
                const threshold = parseFloat(route.scorethreshold);
                if (!route.model || !route.endpointId || route.utterances.length === 0 ||
                    !route.scorethreshold || isNaN(threshold) || threshold < 0 || threshold > 1) {
                    return false;
                }
            }
        }

        if (sandboxEnabled) {
            if (!config.sandbox.defaultModel.model || !config.sandbox.defaultModel.endpointId) {
                return false;
            }
            if (config.sandbox.routes.length === 0) {
                return false;
            }
            for (const route of config.sandbox.routes) {
                const threshold = parseFloat(route.scorethreshold);
                if (!route.model || !route.endpointId || route.utterances.length === 0 ||
                    !route.scorethreshold || isNaN(threshold) || threshold < 0 || threshold > 1) {
                    return false;
                }
            }
        }

        return true;
    };

    // Sync form validity state with parent component on config changes
    useEffect(() => {
        if (setIsFormValid) {
            setIsFormValid(validateForm());
        }
    }, [config, productionEnabled, sandboxEnabled, setIsFormValid]);

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
                let parsedConfig;
                try {
                    parsedConfig = JSON.parse(manualPolicyConfig);
                } catch {
                    parsedConfig = JSON.parse(manualPolicyConfig.replace(/&quot;/g, '"'));
                }
                
                // Normalize parsed data for backward compatibility
                const productionConfig: EnvironmentConfig = {
                    defaultModel: normalizeModelData(parsedConfig.production?.defaultModel ?? EMPTY_MODEL),
                    routes: (parsedConfig.production?.routes || []).map((route: any) => ({
                        ...route,
                        vendor: route.vendor || '',
                        endpointName: route.endpointName || '',
                    })),
                };
                
                const sandboxConfig: EnvironmentConfig = {
                    defaultModel: normalizeModelData(parsedConfig.sandbox?.defaultModel ?? EMPTY_MODEL),
                    routes: (parsedConfig.sandbox?.routes || []).map((route: any) => ({
                        ...route,
                        vendor: route.vendor || '',
                        endpointName: route.endpointName || '',
                    })),
                };
                
                setConfig({
                    production: productionConfig,
                    sandbox: sandboxConfig,
                    path: parsedConfig.path
                        ?? (parsedConfig.contentpath ? { contentpath: parsedConfig.contentpath } : undefined),
                });
                
                const hasProductionConfig = parsedConfig.production && parsedConfig.production.routes && parsedConfig.production.routes.length > 0;
                const hasSandboxConfig = parsedConfig.sandbox && parsedConfig.sandbox.routes && parsedConfig.sandbox.routes.length > 0;
                
                setProductionEnabled(hasProductionConfig);
                setSandboxEnabled(hasSandboxConfig);
            } catch (error) {
                console.error('Error parsing manual policy config:', error);
            }
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        setManualPolicyConfig(JSON.stringify(config).replace(/"/g, '&quot;'));
    }, [config]);

    const handleAddProductionRoute = () => {
        const newRoute: RoutingConfig = {
            id: `route-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            vendor: '',
            model: '',
            endpointId: '',
            endpointName: '',
            utterances: [],
            scorethreshold: '0.8',
        };

        if (setShowValidationErrors) {
            setShowValidationErrors(false);
        }

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
            id: `route-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            vendor: '',
            model: '',
            endpointId: '',
            endpointName: '',
            utterances: [],
            scorethreshold: '0.8',
        };

        if (setShowValidationErrors) {
            setShowValidationErrors(false);
        }

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

    const handleDefaultModelUpdate = (env: 'production' | 'sandbox', updatedModel: ModelData) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                defaultModel: updatedModel,
            },
        }));
    }

    const handleRouteModelUpdate = (env: 'production' | 'sandbox', index: number, updatedModel: ModelData) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                routes: prevConfig[env].routes.map((item, i) =>
                    i === index ? {
                        ...item,
                        vendor: updatedModel.vendor,
                        model: updatedModel.model,
                        endpointId: updatedModel.endpointId,
                        endpointName: updatedModel.endpointName,
                    } : item
                ),
            },
        }));
    }

    const handleContentPathUpdate = (value: string) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            path: value.trim() !== '' ? { contentpath: value } : undefined,
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
                    defaultModel: { ...EMPTY_MODEL },
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
                    defaultModel: { ...EMPTY_MODEL },
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


    const renderContentPath = () => {
        const contentPathError = showValidationErrors
            && (!config.path?.contentpath || config.path.contentpath.trim() === '');

        return (
            <Paper elevation={2} sx={{ padding: 2, marginTop: 2, marginBottom: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.ModelRouting.contentpath.title'
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
                                    id='Apis.Details.Policies.CustomPolicies.ModelRouting.contentpath'
                                    defaultMessage='Content Path'
                                />
                            }
                            value={config.path?.contentpath || ''}
                            onChange={(e) => handleContentPathUpdate(e.target.value)}
                            placeholder="$.messages[?(@.role=='user')].content"
                            error={contentPathError}
                            helperText={contentPathError ? (
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelRouting.contentpath.required'
                                    defaultMessage='Required field is empty'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelRouting.contentpath.info'
                                    defaultMessage='The JSONPath expression used to extract content from the payload.'
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    const renderDefaultModel = (env: 'production' | 'sandbox', endpoints: Endpoint[]) => {
        const envConfig = config[env];
        const hasDefaultModelError = showValidationErrors
            && (!envConfig.defaultModel.model || !envConfig.defaultModel.endpointId);

        return (
            <>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    <FormattedMessage
                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.defaultmodel.title'
                        defaultMessage='Default Model'
                    />
                </Typography>
                <Box sx={{
                    ...(hasDefaultModelError && {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d32f2f',
                        },
                    }),
                }}>
                    <ModelCard
                        modelData={envConfig.defaultModel}
                        modelList={modelList}
                        endpointList={endpoints}
                        isWeightApplicable={false}
                        onUpdate={(updatedModel) => handleDefaultModelUpdate(env, updatedModel)}
                    />
                </Box>
                {hasDefaultModelError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1, display: 'block' }}>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.defaultmodel.required'
                            defaultMessage='Default model and endpoint selection are required'
                        />
                    </Typography>
                )}
                <Typography variant='caption' color='textSecondary' sx={{ ml: 1 }}>
                    <FormattedMessage
                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.defaultmodel.info'
                        defaultMessage='This model will be used when no routing rule matches the request.'
                    />
                </Typography>
            </>
        );
    };

    const renderRoutingCard = (
        route: RoutingConfig,
        env: 'production' | 'sandbox',
        index: number,
        endpoints: Endpoint[],
        onDelete?: () => void
    ) => {
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

        const routeModelData: ModelData = {
            vendor: route.vendor,
            model: route.model,
            endpointId: route.endpointId,
            endpointName: route.endpointName,
        };

        const hasModelError = showValidationErrors && (!route.model || !route.endpointId);

        return (
            // Single card wrapping model selection and rule fields
            <Paper elevation={2} sx={{ padding: 2, margin: 1, mb: 1.5, position: 'relative' }}>
                {/* Override ModelCard inner Paper to merge into single card */}
                <Box sx={{
                    '& > .MuiPaper-root': {
                        boxShadow: 'none',
                        margin: 0,
                        padding: 0,
                        background: 'transparent',
                    },
                    ...(hasModelError && {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d32f2f',
                        },
                    }),
                }}>
                    <ModelCard
                        modelData={routeModelData}
                        modelList={modelList}
                        endpointList={endpoints}
                        isWeightApplicable={false}
                        onUpdate={(updatedModel) => handleRouteModelUpdate(env, index, updatedModel)}
                    />
                </Box>
                {hasModelError && (
                    <Typography variant='caption' color='error' sx={{ display: 'block', mb: 1 }}>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.rule.model.required'
                            defaultMessage='Model and endpoint selection are required'
                        />
                    </Typography>
                )}
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                            helperText={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.SemanticRouting.scorethreshold.info'
                                    defaultMessage='The similarity threshold that must be met for rule enforcement.'
                                />
                            }
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
                                (showValidationErrors && route.utterances.length === 0) ? (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.SemanticRouting.utterances.required'
                                        defaultMessage='Required field is empty'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.SemanticRouting.utterances.info'
                                        defaultMessage='Enter keywords to match similarity. Press Enter to add. At least one utterance is required.'
                                    />
                                )
                            }
                            error={showValidationErrors && route.utterances.length === 0}
                            placeholder='Type utterance and press Enter'
                            blurBehavior='clear'
                            InputProps={{
                                sx: {
                                    pt: 1,
                                    flexWrap: 'wrap',
                                    '& input': {
                                        minWidth: '80px',
                                        flex: '1 1 auto',
                                    }
                                }
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
                    <Grid container justifyContent='flex-end' sx={{ mt: 1 }}>
                        <IconButton color='error' onClick={onDelete} size='small'>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                )}
            </Paper>
        );
    };

    return (
        <>
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
                                id='Apis.Details.Policies.CustomPolicies.ModelRouting.accordion.production'
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
                                    id='Apis.Details.Policies.CustomPolicies.ModelRouting.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        ) : (
                            <>
                                {productionEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.no.production.endpoints'
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
                                {renderDefaultModel('production', productionEndpoints)}
                                <Typography variant='subtitle2' sx={{ mb: 1, mt: 2 }}>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.routingrules'
                                        defaultMessage='Routing Rules'
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
                                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.add.rule'
                                        defaultMessage='Add Rule'
                                    />
                                </Button>
                                {showValidationErrors && config.production.routes.length === 0 && (
                                    <Typography variant='caption' color='error' sx={{ ml: 1, display: 'block', mb: 1 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.rules.required'
                                            defaultMessage='At least one routing rule is required'
                                        />
                                    </Typography>
                                )}
                                {config.production.routes.map((route, index) => (
                                    <React.Fragment key={route.id || `production-route-${index}`}>
                                        {renderRoutingCard(
                                            route, 
                                            'production', 
                                            index, 
                                            productionEndpoints,
                                            () => handleProductionRouteDelete(index)
                                        )}
                                    </React.Fragment>
                                ))}
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
                                id='Apis.Details.Policies.CustomPolicies.ModelRouting.accordion.sandbox'
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
                                    id='Apis.Details.Policies.CustomPolicies.ModelRouting.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        ) : (
                            <>
                                {sandboxEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.no.sandbox.endpoints'
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
                                {renderDefaultModel('sandbox', sandboxEndpoints)}
                                <Typography variant='subtitle2' sx={{ mb: 1, mt: 2 }}>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.routingrules'
                                        defaultMessage='Routing Rules'
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
                                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.add.rule'
                                        defaultMessage='Add Rule'
                                    />
                                </Button>
                                {showValidationErrors && config.sandbox.routes.length === 0 && (
                                    <Typography variant='caption' color='error' sx={{ ml: 1, display: 'block', mb: 1 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.rules.required'
                                            defaultMessage='At least one routing rule is required'
                                        />
                                    </Typography>
                                )}
                                {config.sandbox.routes.map((route, index) => (
                                    <React.Fragment key={route.id || `sandbox-route-${index}`}>
                                        {renderRoutingCard(
                                            route, 
                                            'sandbox', 
                                            index, 
                                            sandboxEndpoints,
                                            () => handleSandboxRouteDelete(index)
                                        )}
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Grid>
            <Grid item xs={12}>
                {renderContentPath()}
            </Grid>
        </>
    );
}

export default SemanticRouting;
