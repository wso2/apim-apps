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
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';

interface RoutingRuleConfig {
    id: string;
    name: string;
    context: string;
    vendor: string;
    model: string;
    endpointId: string;
    endpointName: string;
}

interface EnvironmentConfig {
    defaultModel: ModelData;
    routingrules: RoutingRuleConfig[];
}

interface IntelligentModelRoutingConfig {
    production: EnvironmentConfig;
    sandbox: EnvironmentConfig;
    contentPath: { path: string };
}

interface IntelligentModelRoutingProps {
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

const IntelligentModelRouting: FC<IntelligentModelRoutingProps> = ({
    setManualPolicyConfig,
    manualPolicyConfig,
    setIsFormValid,
    showValidationErrors = false,
    setShowValidationErrors,
}) => {
    const [apiFromContext] = useAPI();
    const [config, setConfig] = useState<IntelligentModelRoutingConfig>({
        production: {
            defaultModel: { ...EMPTY_MODEL },
            routingrules: [],
        },
        sandbox: {
            defaultModel: { ...EMPTY_MODEL },
            routingrules: [],
        },
        contentPath: { path: '' },
    });
    const [modelList, setModelList] = useState<ModelVendor[]>([]);
    const [productionEndpoints, setProductionEndpoints] = useState<Endpoint[]>([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [productionEnabled, setProductionEnabled] = useState<boolean>(false);
    const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);
    const validateForm = (): boolean => {
        if (!productionEnabled && !sandboxEnabled) {
            return false;
        }

        // Content path is required
        if (!config.contentPath?.path || config.contentPath.path.trim() === '') {
            return false;
        }

        if (productionEnabled) {
            if (!config.production.defaultModel.model || !config.production.defaultModel.endpointId) {
                return false;
            }
            if (config.production.routingrules.length === 0) {
                return false;
            }
            for (const rule of config.production.routingrules) {
                if (!rule.model || !rule.endpointId || !rule.name?.trim() || !rule.context?.trim()) {
                    return false;
                }
            }
        }

        if (sandboxEnabled) {
            if (!config.sandbox.defaultModel.model || !config.sandbox.defaultModel.endpointId) {
                return false;
            }
            if (config.sandbox.routingrules.length === 0) {
                return false;
            }
            for (const rule of config.sandbox.routingrules) {
                if (!rule.model || !rule.endpointId || !rule.name?.trim() || !rule.context?.trim()) {
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
                    routingrules: (parsedConfig.production?.routingrules || []).map((rule: any) => ({
                        ...rule,
                        vendor: rule.vendor || '',
                        endpointName: rule.endpointName || '',
                    })),
                };
                
                const sandboxConfig: EnvironmentConfig = {
                    defaultModel: normalizeModelData(parsedConfig.sandbox?.defaultModel ?? EMPTY_MODEL),
                    routingrules: (parsedConfig.sandbox?.routingrules || []).map((rule: any) => ({
                        ...rule,
                        vendor: rule.vendor || '',
                        endpointName: rule.endpointName || '',
                    })),
                };
                
                setConfig({
                    production: productionConfig,
                    sandbox: sandboxConfig,
                    contentPath: parsedConfig.contentPath
                        ?? (parsedConfig.path ? { path: parsedConfig.path } : { path: '' }),
                });
                
                const hasProductionConfig = parsedConfig.production && parsedConfig.production.routingrules && parsedConfig.production.routingrules.length > 0;
                const hasSandboxConfig = parsedConfig.sandbox && parsedConfig.sandbox.routingrules && parsedConfig.sandbox.routingrules.length > 0;
                
                setProductionEnabled(hasProductionConfig);
                setSandboxEnabled(hasSandboxConfig);
            } catch (error) {
                console.error('Error parsing manual policy config:', error);
            }
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        const configToSave = {
            ...config,
            production: {
                ...config.production,
                routingrules: config.production.routingrules.map(({ id: _id, ...rest }) => rest),
            },
            sandbox: {
                ...config.sandbox,
                routingrules: config.sandbox.routingrules.map(({ id: _id, ...rest }) => rest),
            },
        };
        setManualPolicyConfig(JSON.stringify(configToSave).replace(/"/g, '&quot;'));
    }, [config]);

    const handleAddProductionRule = () => {
        const newRule: RoutingRuleConfig = {
            id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            name: '',
            context: '',
            vendor: '',
            model: '',
            endpointId: '',
            endpointName: '',
        };

        if (setShowValidationErrors) {
            setShowValidationErrors(false);
        }

        setConfig((prevConfig) => ({
            ...prevConfig,
            production: {
                ...prevConfig.production,
                routingrules: [...prevConfig.production.routingrules, newRule],
            },
        }));
    }

    const handleProductionRuleUpdate = (index: number, field: keyof RoutingRuleConfig, value: string) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            production: {
                ...prevConfig.production,
                routingrules: prevConfig.production.routingrules.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                ),
            },
        }));
    }

    const handleProductionRuleDelete = (index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            production: {
                ...prevConfig.production,
                routingrules: prevConfig.production.routingrules.filter((item, i) => i !== index),
            },
        }));
    }

    const handleAddSandboxRule = () => {
        const newRule: RoutingRuleConfig = {
            id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            name: '',
            context: '',
            vendor: '',
            model: '',
            endpointId: '',
            endpointName: '',
        };

        if (setShowValidationErrors) {
            setShowValidationErrors(false);
        }

        setConfig((prevConfig) => ({
            ...prevConfig,
            sandbox: {
                ...prevConfig.sandbox,
                routingrules: [...prevConfig.sandbox.routingrules, newRule],
            },
        }));
    }

    const handleSandboxRuleUpdate = (index: number, field: keyof RoutingRuleConfig, value: string) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            sandbox: {
                ...prevConfig.sandbox,
                routingrules: prevConfig.sandbox.routingrules.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                ),
            },
        }));
    }

    const handleSandboxRuleDelete = (index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            sandbox: {
                ...prevConfig.sandbox,
                routingrules: prevConfig.sandbox.routingrules.filter((item, i) => i !== index),
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

    const handleRuleModelUpdate = (env: 'production' | 'sandbox', index: number, updatedModel: ModelData) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                routingrules: prevConfig[env].routingrules.map((item, i) =>
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
            contentPath: { path: value },
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
                    routingrules: [],
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
                    routingrules: [],
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


    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }


    const renderContentPath = () => {
        const contentPathError = showValidationErrors
            && (!config.contentPath?.path || config.contentPath.path.trim() === '');

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
                            value={config.contentPath.path || ''}
                            onChange={(e) => handleContentPathUpdate(e.target.value)}
                            placeholder="$.contents[*].parts[*].text"
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

    const renderRuleCard = (
        rule: RoutingRuleConfig,
        env: 'production' | 'sandbox',
        index: number,
        endpoints: Endpoint[],
        onDelete?: () => void
    ) => {
        const handleNameChange = (value: string) => {
            if (env === 'production') {
                handleProductionRuleUpdate(index, 'name', value);
            } else {
                handleSandboxRuleUpdate(index, 'name', value);
            }
        };

        const handleContextChange = (value: string) => {
            if (env === 'production') {
                handleProductionRuleUpdate(index, 'context', value);
            } else {
                handleSandboxRuleUpdate(index, 'context', value);
            }
        };

        const ruleModelData: ModelData = {
            vendor: rule.vendor,
            model: rule.model,
            endpointId: rule.endpointId,
            endpointName: rule.endpointName,
        };

        const hasModelError = showValidationErrors && (!rule.model || !rule.endpointId);

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
                        modelData={ruleModelData}
                        modelList={modelList}
                        endpointList={endpoints}
                        isWeightApplicable={false}
                        onUpdate={(updatedModel) => handleRuleModelUpdate(env, index, updatedModel)}
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
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.name'
                                    defaultMessage='Rule Name'
                                />
                            }
                            value={rule.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            inputProps={{ maxLength: 50 }}
                            placeholder='e.g., code-generation'
                            helperText={(showValidationErrors && !rule.name) ? (
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.name.required'
                                    defaultMessage='Required field is empty'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.name.info'
                                    defaultMessage='For identification, provide a unique name'
                                />
                            )}
                            error={showValidationErrors && !rule.name}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size='small'
                            fullWidth
                            multiline
                            rows={2}
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.context'
                                    defaultMessage='Context'
                                />
                            }
                            value={rule.context}
                            onChange={(e) => handleContextChange(e.target.value)}
                            placeholder='Describe the context for this rule'
                            helperText={(showValidationErrors && !rule.context) ? (
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.context.required'
                                    defaultMessage='Required field is empty'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.context.info'
                                    defaultMessage='Provide a description of when this rule should be used'
                                />
                            )}
                            error={showValidationErrors && !rule.context}
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
            <Grid item xs={12}>
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
                                    data-testid='add-production-rule'
                                    sx={{ ml: 1, mb: 2 }}
                                    onClick={handleAddProductionRule}
                                    disabled={isAddRouteDisabled('production')}
                                >
                                    <AddCircle sx={{ mr: 1 }} />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.add.rule'
                                        defaultMessage='Add Rule'
                                    />
                                </Button>
                                {showValidationErrors && config.production.routingrules.length === 0 && (
                                    <Typography variant='caption' color='error' sx={{ ml: 1, display: 'block', mb: 1 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.rules.required'
                                            defaultMessage='At least one routing rule is required'
                                        />
                                    </Typography>
                                )}
                                {config.production.routingrules.map((rule, index) => (
                                    <React.Fragment key={rule.id || `production-rule-${index}`}>
                                        {renderRuleCard(
                                            rule, 
                                            'production', 
                                            index, 
                                            productionEndpoints,
                                            () => handleProductionRuleDelete(index)
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
                                    data-testid='add-sandbox-rule'
                                    sx={{ ml: 1, mb: 2 }}
                                    onClick={handleAddSandboxRule}
                                    disabled={isAddRouteDisabled('sandbox')}
                                >
                                    <AddCircle sx={{ mr: 1 }} />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ModelRouting.add.rule'
                                        defaultMessage='Add Rule'
                                    />
                                </Button>
                                {showValidationErrors && config.sandbox.routingrules.length === 0 && (
                                    <Typography variant='caption' color='error' sx={{ ml: 1, display: 'block', mb: 1 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ModelRouting.rules.required'
                                            defaultMessage='At least one routing rule is required'
                                        />
                                    </Typography>
                                )}
                                {config.sandbox.routingrules.map((rule, index) => (
                                    <React.Fragment key={rule.id || `sandbox-rule-${index}`}>
                                        {renderRuleCard(
                                            rule, 
                                            'sandbox', 
                                            index, 
                                            sandboxEndpoints,
                                            () => handleSandboxRuleDelete(index)
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

export default IntelligentModelRouting;
