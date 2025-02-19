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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import AddCircle from '@mui/icons-material/AddCircle';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { Endpoint, ModelData } from './Types';
import ModelCard from './ModelCard';

interface ModelConfig {
    targetModel: ModelData;
    fallbackModels: ModelData[];
}

interface FailoverConfig {
    production: ModelConfig;
    sandbox: ModelConfig;
    requestTimeout: number;
    suspendDuration: number;
}

interface ModelFailoverProps {
    setManualPolicyConfig: React.Dispatch<React.SetStateAction<string>>;
    manualPolicyConfig: string;
}

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
            },
            fallbackModels: [],
        },
        sandbox: {
            targetModel: {
                model: '',
                endpointId: '',
            },
            fallbackModels: [],
        },
        requestTimeout: 0,
        suspendDuration: 0,
    });
    const [modelList, setModelList] = useState<string[]>([]);
    const [productionEndpoints, setProductionEndpoints] = useState<Endpoint[]>([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchEndpoints = () => {
        setLoading(true);
        const endpointsPromise = API.getApiEndpoints(apiFromContext.id);
        endpointsPromise
            .then((response) => {
                const endpoints = response.body.list;
                
                // Filter endpoints based on endpoint type
                const prodEndpointList = endpoints.filter((endpoint: Endpoint) => endpoint.deploymentStage === 'PRODUCTION');
                const sandEndpointList = endpoints.filter((endpoint: Endpoint) => endpoint.deploymentStage === 'SANDBOX');
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
            setConfig(JSON.parse(manualPolicyConfig.replace(/'/g, '"')));
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        setManualPolicyConfig(JSON.stringify(config).replace(/"/g, "'"));
    }, [config]);

    const handleAddFallbackModel = (env: 'production' | 'sandbox') => {
        const newModel: ModelData = {
            model: '',
            endpointId: '',
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

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <>
            <Grid item xs={12}>
                <Accordion defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='production-content'
                        id='production-header'
                    >
                    <Typography variant='subtitle2' color='textPrimary'>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ModelFailover.accordion.production'
                            defaultMessage='Production'
                        />
                    </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ModelCard
                            modelData={config.production.targetModel}
                            modelList={modelList}
                            endpointList={productionEndpoints}
                            isWeightApplicable={false}
                            onUpdate={(updatedTargetModel) => handleTargetModelUpdate('production', 0, updatedTargetModel)}
                            onDelete={() => {}}
                        />
                        <Button
                            variant='outlined'
                            color='primary'
                            data-testid='add-production-model'
                            sx={{ ml: 1 }}
                            onClick={() => handleAddFallbackModel('production')}
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
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='sandbox-content'
                        id='sandbox-header'
                    >
                        <Typography variant='subtitle2' color='textPrimary'>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.ModelFailover.accordion.sandbox'
                                defaultMessage='Sandbox'
                            />
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ModelCard
                            modelData={config.sandbox.targetModel}
                            modelList={modelList}
                            endpointList={productionEndpoints}
                            isWeightApplicable={false}
                            onUpdate={(updatedTargetModel) => handleTargetModelUpdate('sandbox', 0, updatedTargetModel)}
                            onDelete={() => {}}
                        />
                        <Button
                            variant='outlined'
                            color='primary'
                            data-testid='add-sandbox-model'
                            sx={{ ml: 1 }}
                            onClick={() => handleAddFallbackModel('sandbox')}
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
                <TextField
                    id='request-timeout'
                    label='Request Timeout (s)'
                    size='small'
                    sx={{ pt: 2, mt: 2 }}
                    // helperText={getError(spec) === '' ? spec.description : getError(spec)}
                    // error={getError(spec) !== ''}
                    variant='outlined'
                    name='requestTimeout'
                    type='number'
                    value={config.requestTimeout}
                    onChange={(e: any) => setConfig({ ...config, requestTimeout: e.target.value })}
                    fullWidth
                />
                <TextField
                    id='suspend-duration'
                    label='Suspend Duration (s)'
                    size='small'
                    sx={{ pt: 2, mt: 2 }}
                    // helperText={getError(spec) === '' ? spec.description : getError(spec)}
                    // error={getError(spec) !== ''}
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

export default ModelFailover;
