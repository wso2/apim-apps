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
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { Endpoint, ModelData } from './Types';
import ModelCard from './ModelCard';

interface RoundRobinConfig {
    production: ModelData[];
    sandbox: ModelData[];
    suspendDuration?: number;
}

const ModelRoundRobin: FC = () => {
    const [apiFromContext] = useAPI();
    const [config, setConfig] = useState<RoundRobinConfig>({
        production: [
            { model: "gpt-4", endpointId: "8e3bd85a-e21b-4dd5-a1d2-88a539c45dc3", weight: 0.5 },
            { model: "gpt-35-turbo", endpointId: "8e3bd85a-e21b-4dd5-a1d2-88a539c45dc3" }, // No weight initially
        ],
        sandbox: [
            // { model: "gpt-4", endpointId: "8e3bd85a-e21b-4dd5-a1d2-88a539c45dc3", weight: 0.5 },
            // { model: "gpt-35-turbo", endpointId: "8e3bd85a-e21b-4dd5-a1d2-88a539c45dc3" }, // No weight initially
        ],
        suspendDuration: 60,
        // production: [],
        // sandbox: [],
        // suspendDuration: 0,
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
                const prodEndpointList = endpoints.filter((endpoint: Endpoint) => endpoint.environment === 'PRODUCTION');
                const sandEndpointList = endpoints.filter((endpoint: Endpoint) => endpoint.environment === 'SANDBOX');
                setProductionEndpoints(prodEndpointList);
                setSandboxEndpoints(sandEndpointList);

            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                setLoading(false);
            });
    }
    
    useEffect(() => {
        setModelList(['gpt-35-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini']);
        fetchEndpoints();
    }, []);

    const handleAddModel = (env: 'production' | 'sandbox') => {
        const newModel: ModelData = {
            model: '',
            endpointId: '',
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
                            id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.accordion.production'
                            defaultMessage='Production'
                        />
                    </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            data-testid='add-production-model'
                            onClick={() => handleAddModel('production')}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.Custom.Policies.model.add'
                                defaultMessage='Add'
                            />
                        </Button>
                        {config.production.map((model, index) => (
                            <ModelCard
                                key={index}
                                modelData={model}
                                modelList={modelList}
                                endpointList={productionEndpoints}
                                onUpdate={(updatedModel) => handleUpdate('production', index, updatedModel)}
                                onDelete={() => handleDelete('production', index)}
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
                                id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.accordion.sandbox'
                                defaultMessage='Sandbox'
                            />
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {config.sandbox.map((model, index) => (
                            <ModelCard
                                key={index}
                                modelData={model}
                                modelList={modelList}
                                endpointList={sandboxEndpoints}
                                onUpdate={(updatedModel) => handleUpdate('sandbox', index, updatedModel)}
                                onDelete={() => handleDelete('sandbox', index)}
                            />
                        ))}
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            data-testid='add-sandbox-model'
                            onClick={() => handleAddModel('sandbox')}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.Custom.Policies.model.add'
                                defaultMessage='Add'
                            />
                        </Button>
                    </AccordionDetails>
                </Accordion>
                <TextField
                    id='suspend-duration-production'
                    label='Suspend Duration (s)'
                    size='small'
                    sx={{ pt: 2 }}
                    // helperText={getError(spec) === '' ? spec.description : getError(spec)}
                    // error={getError(spec) !== ''}
                    variant='outlined'
                    name='suspendDuration'
                    type='number'
                    value={config.suspendDuration}
                    onChange={(e: any) => setConfig({ ...config, suspendDuration: e.target.value })}
                    // onChange={(e: any) => onInputChange(e, spec.type)}
                    fullWidth
                />
            </Grid>
        </>
    );
}

export default ModelRoundRobin;