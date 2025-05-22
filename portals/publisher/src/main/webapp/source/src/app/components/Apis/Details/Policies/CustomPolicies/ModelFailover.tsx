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
import { Endpoint, ModelData } from './Types';
import ModelCard from './ModelCard';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CONSTS from 'AppData/Constants';

interface ModelConfig {
    targetModel: ModelData;
    fallbackModels: ModelData[];
}

interface FailoverConfig {
    production: ModelConfig;
    sandbox: ModelConfig;
    requestTimeout?: number;
    suspendDuration?: number;
}

interface ModelFailoverProps {
    setManualPolicyConfig: React.Dispatch<React.SetStateAction<string>>;
    manualPolicyConfig: string;
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

const ModelFailover: FC<ModelFailoverProps> = ({
    setManualPolicyConfig,
    manualPolicyConfig,
}) => {
    const [apiFromContext] = useAPI();
    const [config, setConfig] = useState<FailoverConfig>({
        production: {
            targetModel: {
                model: '',
                endpointId: '',
                endpointName: '',
            },
            fallbackModels: [],
        },
        sandbox: {
            targetModel: {
                model: '',
                endpointId: '',
                endpointName: '',
            },
            fallbackModels: [],
        },
        requestTimeout: undefined,
        suspendDuration: undefined,
    });
    const [modelList, setModelList] = useState<string[]>([]);
    const [productionEndpoints, setProductionEndpoints] = useState<Endpoint[]>([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [productionEnabled, setProductionEnabled] = useState<boolean>(false);
    const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);

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
                
                // Filter endpoints based on endpoint type
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
                setModelList(response.body);
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
            const parsedConfig = JSON.parse(manualPolicyConfig.replace(/'/g, '"'));
            setConfig(parsedConfig);
            
            // Set toggle states based on whether there's any configuration
            const hasProductionConfig = parsedConfig.production.targetModel.model !== '' 
                || parsedConfig.production.fallbackModels.length > 0;
            const hasSandboxConfig = parsedConfig.sandbox.targetModel.model !== '' 
                || parsedConfig.sandbox.fallbackModels.length > 0;
            
            setProductionEnabled(hasProductionConfig);
            setSandboxEnabled(hasSandboxConfig);
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        setManualPolicyConfig(JSON.stringify(config).replace(/"/g, "'"));
    }, [config]);

    const handleAddFallbackModel = (env: 'production' | 'sandbox') => {
        const newModel: ModelData = {
            model: '',
            endpointId: '',
            endpointName: '',
        };

        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                fallbackModels: [...prevConfig[env].fallbackModels, newModel],
            },
        }));
    }

    const handleTargetModelUpdate = (env: 'production' | 'sandbox', index: number, updatedTargetModel: ModelData) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                targetModel: updatedTargetModel,
            },
        }));
    }

    const handleFallbackModelUpdate = (env: 'production' | 'sandbox', index: number, updatedModel: ModelData) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                fallbackModels: prevConfig[env].fallbackModels.map((item, i) => (i === index ? updatedModel : item)),
            },
        }));
    }

    const handleFallbackModelDelete = (env: 'production' | 'sandbox', index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: {
                ...prevConfig[env],
                fallbackModels: prevConfig[env].fallbackModels.filter((item, i) => i !== index),
            },
        }));
    }

    const isAddModelDisabled = (env: 'production' | 'sandbox') => {
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
                    targetModel: {
                        model: '',
                        endpointId: '',
                        endpointName: '',
                    },
                    fallbackModels: [],
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
                    targetModel: {
                        model: '',
                        endpointId: '',
                        endpointName: '',
                    },
                    fallbackModels: [],
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
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.accordion.production'
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
                        {modelList.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelFailover.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        )}
                        {productionEndpoints.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelFailover.no.production.endpoints'
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
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.target.model'
                                defaultMessage='Target Model'
                            />
                        </Typography>
                        <ModelCard
                            modelData={config.production.targetModel}
                            modelList={modelList}
                            endpointList={productionEndpoints}
                            isWeightApplicable={false}
                            onUpdate={(updatedTargetModel) => handleTargetModelUpdate('production', 0, updatedTargetModel)}
                        />
                        <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.fallback.models'
                                defaultMessage='Fallback Models'
                            />
                        </Typography>
                        <Button
                            variant='outlined'
                            color='primary'
                            data-testid='add-production-model'
                            sx={{ ml: 1, mb: 2 }}
                            onClick={() => handleAddFallbackModel('production')}
                            disabled={isAddModelDisabled('production')}
                        >
                            <AddCircle sx={{ mr: 1 }} />
                            <FormattedMessage
                                id='Apis.Details.Policies.Custom.Policies.model.add'
                                defaultMessage='Add Fallback Model'
                            />
                        </Button>
                        {config.production.fallbackModels.map((model, index) => (
                            <ModelCard
                                key={index}
                                modelData={model}
                                modelList={modelList}
                                endpointList={productionEndpoints}
                                isWeightApplicable={false}
                                onUpdate={(updatedModel) => handleFallbackModelUpdate('production', index, updatedModel)}
                                onDelete={() => handleFallbackModelDelete('production', index)}
                            />
                        ))}
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
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.accordion.sandbox'
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
                        {modelList.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelFailover.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        )}
                        {sandboxEndpoints.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelFailover.no.sandbox.endpoints'
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
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.target.model'
                                defaultMessage='Target Model'
                            />
                        </Typography>
                        <ModelCard
                            modelData={config.sandbox.targetModel}
                            modelList={modelList}
                            endpointList={sandboxEndpoints}
                            isWeightApplicable={false}
                            onUpdate={(updatedTargetModel) => handleTargetModelUpdate('sandbox', 0, updatedTargetModel)}
                        />
                        <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.fallback.models'
                                defaultMessage='Fallback Models'
                            />
                        </Typography>
                        <Button
                            variant='outlined'
                            color='primary'
                            data-testid='add-sandbox-model'
                            sx={{ ml: 1, mb: 2 }}
                            onClick={() => handleAddFallbackModel('sandbox')}
                            disabled={isAddModelDisabled('sandbox')}
                        >
                            <AddCircle sx={{ mr: 1 }} />
                            <FormattedMessage
                                id='Apis.Details.Policies.Custom.Policies.model.add'
                                defaultMessage='Add Fallback Model'
                            />
                        </Button>
                        {config.sandbox.fallbackModels.map((model, index) => (
                            <ModelCard
                                key={index}
                                modelData={model}
                                modelList={modelList}
                                endpointList={sandboxEndpoints}
                                isWeightApplicable={false}
                                onUpdate={(updatedModel) => handleFallbackModelUpdate('sandbox', index, updatedModel)}
                                onDelete={() => handleFallbackModelDelete('sandbox', index)}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
                <Grid container mt={2}>
                    <Grid item xs={6} pr={1}>
                        <TextField
                            id='request-timeout'
                            label='Request Timeout (s)'
                            size='small'
                            variant='outlined'
                            name='requestTimeout'
                            type='number'
                            value={config.requestTimeout}
                            onChange={(e: any) => setConfig({ ...config, requestTimeout: e.target.value })}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} pl={1}>
                        <TextField
                            id='suspend-duration'
                            label='Suspend Duration (s)'
                            size='small'
                            variant='outlined'
                            name='suspendDuration'
                            type='number'
                            value={config.suspendDuration}
                            onChange={(e: any) => setConfig({ ...config, suspendDuration: e.target.value })}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}

export default ModelFailover;
