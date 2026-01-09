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
import LaunchIcon from '@mui/icons-material/Launch';
// import Chip from '@mui/material/Chip';
// import Box from '@mui/material/Box';

interface RoutingRuleConfig {
    name: string;
    context: string;
    model: string;
    endpointId: string;
}

interface DefaultModelConfig {
    model: string;
    endpointId: string;
}

interface ContentPathConfig {
    path: string;
}

interface EnvironmentConfig {
    defaultModel: DefaultModelConfig;
    routingrules: RoutingRuleConfig[];
}

interface IntelligentModelRoutingConfig {
    production: EnvironmentConfig;
    sandbox: EnvironmentConfig;
    contentPath: ContentPathConfig;
}

interface IntelligentModelRoutingProps {
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

const IntelligentModelRouting: FC<IntelligentModelRoutingProps> = ({
    setManualPolicyConfig,
    manualPolicyConfig,
    setProviderNotConfigured,
}) => {
    const [apiFromContext] = useAPI();
    const { data: settings }: any = usePublisherSettings();
    const llmProviderConfigured = settings?.aiApiConfiguration?.llmProviderConfigured;
    const [config, setConfig] = useState<IntelligentModelRoutingConfig>({
        production: {
            defaultModel: { model: '', endpointId: '' },
            routingrules: [],
        },
        sandbox: {
            defaultModel: { model: '', endpointId: '' },
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

    // Check if LLM provider is configured and update parent component
    useEffect(() => {
        if (settings && !llmProviderConfigured) {
            setProviderNotConfigured(true);
        } else {
            setProviderNotConfigured(false);
        }
    }, [settings, llmProviderConfigured, setProviderNotConfigured]);

    const llmProviderNotConfiguredWarning = (
        <FormattedMessage
            id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.warning.llmProviderNotConfigured'
            defaultMessage={'Configure Classifier LLM provider in deployment.toml to enable Intelligent Model Routing. '
                + 'For more information, refer to {docLink}'}
            values={{
                docLink: (
                    <a
                        id='intelligent-model-routing-doc-link'
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
                
                const productionConfig: EnvironmentConfig = {
                    defaultModel: parsedConfig.production?.defaultModel || { model: '', endpointId: '' },
                    routingrules: parsedConfig.production?.routingrules || [],
                };
                
                const sandboxConfig: EnvironmentConfig = {
                    defaultModel: parsedConfig.sandbox?.defaultModel || { model: '', endpointId: '' },
                    routingrules: parsedConfig.sandbox?.routingrules || [],
                };
                
                setConfig({
                    production: productionConfig,
                    sandbox: sandboxConfig,
                    contentPath: parsedConfig.contentPath || { path: '' },
                });
                
                const hasProductionConfig = parsedConfig.production && parsedConfig.production.routingrules && parsedConfig.production.routingrules.length > 0;
                const hasSandboxConfig = parsedConfig.sandbox && parsedConfig.sandbox.routingrules && parsedConfig.sandbox.routingrules.length > 0;
                
                setProductionEnabled(hasProductionConfig);
                setSandboxEnabled(hasSandboxConfig);
            } catch (error) {
                console.error('Error parsing manual policy config:', error);
                setConfig({
                    production: {
                        defaultModel: { model: '', endpointId: '' },
                        routingrules: [],
                    },
                    sandbox: {
                        defaultModel: { model: '', endpointId: '' },
                        routingrules: [],
                    },
                    contentPath: { path: '' },
                });
            }
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        const configForBackend = {
            production: config.production,
            sandbox: config.sandbox,
            contentPath: config.contentPath,
        };
        
        const jsonString = JSON.stringify(configForBackend);
        const formattedString = jsonString.replace(/"/g, "'");
        setManualPolicyConfig(formattedString);
    }, [config, setManualPolicyConfig]);

    const handleAddProductionRule = () => {
        const newRule: RoutingRuleConfig = {
            name: '',
            context: '',
            model: '',
            endpointId: '',
        };

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
            name: '',
            context: '',
            model: '',
            endpointId: '',
        };

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
                    defaultModel: { model: '', endpointId: '' },
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
                    defaultModel: { model: '', endpointId: '' },
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
        return (
            <Paper elevation={2} sx={{ padding: 2, marginTop: 2, marginBottom: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.contentpath.title'
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
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.contentpath'
                                    defaultMessage='Content Path'
                                />
                            }
                            value={config.contentPath.path || ''}
                            onChange={(e) => handleContentPathUpdate(e.target.value)}
                            placeholder="$.contents[*].parts[*].text"
                            helperText="Enter JSONPath expression (e.g., $.contents[*].parts[*].text)"
                        />
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    const renderDefaultModel = (env: 'production' | 'sandbox', endpoints: Endpoint[]) => {
        const envConfig = config[env];
        
        return (
            <Paper elevation={2} sx={{ padding: 2, marginTop: 2, marginBottom: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.defaultmodel.title'
                                defaultMessage='Default Model'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl size='small' fullWidth>
                            <InputLabel id={`default-model-label-${env}`}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.select.model'
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
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.select.endpoint'
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

        const handleModelChange = (value: string) => {
            if (env === 'production') {
                handleProductionRuleUpdate(index, 'model', value);
            } else {
                handleSandboxRuleUpdate(index, 'model', value);
            }
        };

        const handleEndpointChange = (value: string) => {
            if (env === 'production') {
                handleProductionRuleUpdate(index, 'endpointId', value);
            } else {
                handleSandboxRuleUpdate(index, 'endpointId', value);
            }
        };

        return (
            <Paper elevation={2} sx={{ padding: 2, margin: 1, position: 'relative' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl size='small' fullWidth>
                            <InputLabel id={`model-label-${env}-${index}`}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.select.model'
                                    defaultMessage='Model'
                                />
                            </InputLabel>
                            <Select
                                labelId={`model-label-${env}-${index}`}
                                id={`model-${env}-${index}`}
                                value={rule.model}
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
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.select.endpoint'
                                    defaultMessage='Endpoint'
                                />
                            </InputLabel>
                            <Select
                                labelId={`endpoint-label-${env}-${index}`}
                                id={`endpoint-${env}-${index}`}
                                value={rule.endpointId}
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
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.rule.name'
                                    defaultMessage='Rule Name'
                                />
                            }
                            value={rule.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder='e.g., code-generation'
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
                            helperText='Provide a description of when this rule should be used'
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
                            mt: 1,
                        }}
                    >
                        <IconButton
                            color='error'
                            data-testid='rule-delete'
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
            {!llmProviderConfigured && (
                <Grid item xs={12}>
                    <Alert severity='warning' sx={{ mb: 2 }}>
                        {llmProviderNotConfiguredWarning}
                    </Alert>
                </Grid>
            )}
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
                                id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.accordion.production'
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
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        ) : (
                            <>
                                {productionEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.no.production.endpoints'
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
                                        id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.routingrules'
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
                                        id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.add.rule'
                                        defaultMessage='Add Rule'
                                    />
                                </Button>
                                {config.production.routingrules.map((rule, index) => 
                                    renderRuleCard(
                                        rule, 
                                        'production', 
                                        index, 
                                        productionEndpoints,
                                        () => handleProductionRuleDelete(index)
                                    )
                                )}
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
                                id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.accordion.sandbox'
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
                                    id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        ) : (
                            <>
                                {sandboxEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.no.sandbox.endpoints'
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
                                        id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.routingrules'
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
                                        id='Apis.Details.Policies.CustomPolicies.IntelligentModelRouting.add.rule'
                                        defaultMessage='Add Rule'
                                    />
                                </Button>
                                {config.sandbox.routingrules.map((rule, index) => 
                                    renderRuleCard(
                                        rule, 
                                        'sandbox', 
                                        index, 
                                        sandboxEndpoints,
                                        () => handleSandboxRuleDelete(index)
                                    )
                                )}
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
