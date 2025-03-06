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
import { styled } from '@mui/material/styles';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { Endpoint, ModelData } from './Types';
import ModelCard from './ModelCard';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CONSTS from 'AppData/Constants';

interface RoundRobinConfig {
    production: ModelData[];
    sandbox: ModelData[];
    suspendDuration?: number;
}

interface ModelRoundRobinProps {
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

const ModelRoundRobin: FC<ModelRoundRobinProps> = ({
    setManualPolicyConfig,
    manualPolicyConfig,
}) => {
    const [apiFromContext] = useAPI();
    const [config, setConfig] = useState<RoundRobinConfig>({
        production: [],
        sandbox: [],
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
            
            setProductionEnabled(parsedConfig.production.length > 0);
            setSandboxEnabled(parsedConfig.sandbox.length > 0);
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        setManualPolicyConfig(JSON.stringify(config).replace(/"/g, "'"));
    }, [config]);

    const handleAddModel = (env: 'production' | 'sandbox') => {
        const newModel: ModelData = {
            model: '',
            endpointId: '',
            endpointName: '',
        };

        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: [...prevConfig[env], newModel],
        }));
    }

    const handleUpdate = (env: 'production' | 'sandbox', index: number, updatedModel: ModelData) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: prevConfig[env].map((item, i) => (i === index ? updatedModel : item)),
        }));
    }

    const handleDelete = (env: 'production' | 'sandbox', index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: prevConfig[env].filter((item, i) => i !== index),
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
                production: [],
            }));
        }
    };

    const handleSandboxToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSandboxEnabled(event.target.checked);
        if (!event.target.checked) {
            setConfig(prev => ({
                ...prev,
                sandbox: [],
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
                                id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.accordion.production'
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
                                    id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        )}
                        {productionEndpoints.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.no.production.endpoints'
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
                        <Button
                            variant='outlined'
                            color='primary'
                            data-testid='add-production-model'
                            sx={{ ml: 1 }}
                            onClick={() => handleAddModel('production')}
                            disabled={isAddModelDisabled('production')}
                        >
                            <AddCircle sx={{ mr: 1 }} />
                            <FormattedMessage
                                id='Apis.Details.Policies.Custom.Policies.model.add'
                                defaultMessage='Add Model'
                            />
                        </Button>
                        {config.production.map((model, index) => (
                            <ModelCard
                                key={index}
                                modelData={model}
                                modelList={modelList}
                                endpointList={productionEndpoints}
                                isWeightApplicable={false}
                                onUpdate={(updatedModel) => handleUpdate('production', index, updatedModel)}
                                onDelete={() => handleDelete('production', index)}
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
                                id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.accordion.sandbox'
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
                                    id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.no.models'
                                    defaultMessage='No models available. Please configure models for the LLM provider.'
                                />
                            </Alert>
                        )}
                        {sandboxEndpoints.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.no.sandbox.endpoints'
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
                        <Button
                            variant='outlined'
                            color='primary'
                            data-testid='add-sandbox-model'
                            sx={{ ml: 1 }}
                            onClick={() => handleAddModel('sandbox')}
                            disabled={isAddModelDisabled('sandbox')}
                        >
                            <AddCircle sx={{ mr: 1 }} />
                            <FormattedMessage
                                id='Apis.Details.Policies.Custom.Policies.model.add'
                                defaultMessage='Add Model'
                            />
                        </Button>
                        {config.sandbox.map((model, index) => (
                            <ModelCard
                                key={index}
                                modelData={model}
                                modelList={modelList}
                                endpointList={sandboxEndpoints}
                                isWeightApplicable={false}
                                onUpdate={(updatedModel) => handleUpdate('sandbox', index, updatedModel)}
                                onDelete={() => handleDelete('sandbox', index)}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
                <TextField
                    id='suspend-duration-production'
                    label='Suspend Duration (s)'
                    size='small'
                    sx={{ mt: 2 }}
                    variant='outlined'
                    name='suspendDuration'
                    type='number'
                    value={config.suspendDuration}
                    onChange={(e: any) => setConfig({ ...config, suspendDuration: e.target.value })}
                    fullWidth
                />
            </Grid>
        </>
    );
}

export default ModelRoundRobin;
