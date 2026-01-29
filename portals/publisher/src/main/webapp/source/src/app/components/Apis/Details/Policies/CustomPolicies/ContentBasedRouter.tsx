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
import { styled } from '@mui/material/styles';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { Endpoint, ModelData, ModelVendor } from './Types';
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

interface Condition {
    type: string;
    key: string;
    operator: string;
    value: string;
}

interface RoutingRule {
    condition: Condition;
    target: ModelData;
}

interface ContentBasedRouterConfig {
    production: RoutingRule[];
    sandbox: RoutingRule[];
}

interface ContentBasedRouterProps {
    setManualPolicyConfig: React.Dispatch<React.SetStateAction<string>>;
    manualPolicyConfig: string;
}

const CONDITION_TYPES = [
    { value: 'QUERY_PARAMETER', label: 'Query Parameter' },
    { value: 'HEADER', label: 'Header' },
];

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

interface RoutingRuleCardProps {
    rule: RoutingRule;
    modelList: ModelVendor[];
    endpointList: Endpoint[];
    onUpdate: (updatedRule: RoutingRule) => void;
    onDelete: () => void;
}

const RoutingRuleCard: FC<RoutingRuleCardProps> = ({
    rule,
    modelList,
    endpointList,
    onUpdate,
    onDelete,
}) => {
    const { condition, target } = rule;

    const handleConditionChange = (field: keyof Condition, value: string) => {
        const updatedCondition = { ...condition, [field]: value };
        onUpdate({ ...rule, condition: updatedCondition });
    };

    const handleTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const updatedTarget = { ...target, [name]: value };

        if (name === 'endpointId') {
            const selectedEndpoint = endpointList.find((endpoint) => endpoint.id === value);
            if (selectedEndpoint) {
                updatedTarget.endpointName = selectedEndpoint.name;
            }
        }

        onUpdate({ ...rule, target: updatedTarget });
    };

    return (
        <Paper elevation={2} sx={{ padding: 2, margin: 1, position: 'relative' }}>
            <Typography variant='subtitle2' color='textPrimary' sx={{ mb: 1.5 }}>
                <FormattedMessage
                    id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.condition'
                    defaultMessage='Condition'
                />
            </Typography>
            <TextField
                id='condition-key'
                label='Key'
                size='small'
                variant='outlined'
                value={condition.key}
                onChange={(e) => handleConditionChange('key', e.target.value)}
                fullWidth
                sx={{ mb: 1.5 }}
            />
            <TextField
                id='condition-value'
                label='Value'
                size='small'
                variant='outlined'
                value={condition.value}
                onChange={(e) => handleConditionChange('value', e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <Typography variant='subtitle2' color='textPrimary' sx={{ mb: 1.5 }}>
                <FormattedMessage
                    id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.target'
                    defaultMessage='Target'
                />
            </Typography>
            <Grid item xs={12}>
                {modelList.length === 1 ? (
                    <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                        <InputLabel id='model-label'>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.select.model'
                                defaultMessage='Model'
                            />
                        </InputLabel>
                        <Select
                            labelId='model-label'
                            id='model'
                            value={target.model}
                            label='Model'
                            name='model'
                            onChange={(e: any) => handleTargetChange(e)}
                        >
                            {modelList[0].values.map((modelValue) => (
                                <MenuItem key={modelValue} value={modelValue}>
                                    {modelValue}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <>
                        <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                            <InputLabel id='vendor-label'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.select.provider'
                                    defaultMessage='Provider'
                                />
                            </InputLabel>
                            <Select
                                labelId='vendor-label'
                                id='vendor'
                                value={target.vendor}
                                label='Provider'
                                name='vendor'
                                onChange={(e: any) => handleTargetChange(e)}
                            >
                                {modelList.map((vendorItem) => (
                                    <MenuItem key={vendorItem.vendor} value={vendorItem.vendor}>
                                        {vendorItem.vendor}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                            <InputLabel id='model-label'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.select.model'
                                    defaultMessage='Model'
                                />
                            </InputLabel>
                            <Select
                                labelId='model-label'
                                id='model'
                                value={target.model}
                                label='Model'
                                name='model'
                                onChange={(e: any) => handleTargetChange(e)}
                            >
                                {modelList
                                    .find((modelEntry) => modelEntry.vendor === target.vendor)
                                    ?.values.map((modelValue) => (
                                        <MenuItem key={modelValue} value={modelValue}>
                                            {modelValue}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </>
                )}
                <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                    <InputLabel id='endpoint-label'>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.select.endpoint'
                            defaultMessage='Endpoint'
                        />
                    </InputLabel>
                    <Select
                        labelId='endpoint-label'
                        id='endpoint'
                        value={target.endpointId}
                        label='Endpoint'
                        name='endpointId'
                        onChange={(e: any) => handleTargetChange(e)}
                    >
                        {endpointList.map((endpoint) => (
                            <MenuItem key={endpoint.id} value={endpoint.id}>
                                {endpoint.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid
                item
                xs={12}
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <IconButton
                    color='error'
                    data-testid='routing-rule-delete'
                    onClick={onDelete}
                    size="small"
                >
                    <DeleteIcon />
                </IconButton>
            </Grid>
        </Paper>
    );
};

const ContentBasedRouter: FC<ContentBasedRouterProps> = ({
    setManualPolicyConfig,
    manualPolicyConfig,
}) => {
    const [apiFromContext] = useAPI();
    const [config, setConfig] = useState<ContentBasedRouterConfig>({
        production: [],
        sandbox: [],
    });
    const [modelList, setModelList] = useState<ModelVendor[]>([]);
    const [productionEndpoints, setProductionEndpoints] = useState<Endpoint[]>([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [productionEnabled, setProductionEnabled] = useState<boolean>(false);
    const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);
    const [conditionType, setConditionType] = useState<string>('QUERY_PARAMETER');

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
                            production_endpoints:
                                apiFromContext.endpointConfig.production_endpoints,
                            endpoint_security: apiFromContext.endpointConfig.endpoint_security,
                        }
                    });
                }

                if (apiFromContext.endpointConfig?.sandbox_endpoints) {
                    defaultEndpoints.push({
                        id: CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX,
                        name: 'Default Sandbox Endpoint',
                        deploymentStage: 'SANDBOX',
                        endpointConfig: {
                            sandbox_endpoints:
                                apiFromContext.endpointConfig.sandbox_endpoints,
                            endpoint_security: apiFromContext.endpointConfig.endpoint_security,
                        }
                    });
                }

                const allEndpoints = [...defaultEndpoints, ...endpoints];

                const prodEndpointList = allEndpoints.filter(
                    (endpoint: Endpoint) => endpoint.deploymentStage === 'PRODUCTION',
                );
                const sandEndpointList = allEndpoints.filter(
                    (endpoint: Endpoint) => endpoint.deploymentStage === 'SANDBOX',
                );
                setProductionEndpoints(prodEndpointList);
                setSandboxEndpoints(sandEndpointList);

            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                setLoading(false);
            });
    }

    const fetchModelList = () => {
        const llmProviderId = JSON.parse(apiFromContext.subtypeConfiguration.configuration).llmProviderId;
        const modelListPromise = API.getLLMProviderModelList(llmProviderId);
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
            const parsedConfig = JSON.parse(manualPolicyConfig.replace(/'/g, '"'));
            setConfig(parsedConfig);

            setProductionEnabled(parsedConfig.production.length > 0);
            setSandboxEnabled(parsedConfig.sandbox.length > 0);

            // Extract condition type from existing rules (they should all have the same type)
            const firstRule = parsedConfig.production[0] || parsedConfig.sandbox[0];
            if (firstRule?.condition?.type) {
                setConditionType(firstRule.condition.type);
            }
        }
    }, [manualPolicyConfig]);

    useEffect(() => {
        setManualPolicyConfig(JSON.stringify(config).replace(/"/g, "'"));
    }, [config]);

    const handleConditionTypeChange = (newType: string) => {
        setConditionType(newType);
        // Update all existing rules with the new type
        setConfig((prevConfig) => ({
            production: prevConfig.production.map((rule) => ({
                ...rule,
                condition: { ...rule.condition, type: newType },
            })),
            sandbox: prevConfig.sandbox.map((rule) => ({
                ...rule,
                condition: { ...rule.condition, type: newType },
            })),
        }));
    };

    const handleAddRule = (env: 'production' | 'sandbox') => {
        const newRule: RoutingRule = {
            condition: {
                type: conditionType,
                key: '',
                operator: 'EQUALS',
                value: '',
            },
            target: {
                vendor: '',
                model: '',
                endpointId: '',
                endpointName: '',
            },
        };

        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: [...prevConfig[env], newRule],
        }));
    }

    const handleUpdate = (
        env: 'production' | 'sandbox',
        index: number,
        updatedRule: RoutingRule,
    ) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: prevConfig[env].map((item, i) => (i === index ? updatedRule : item)),
        }));
    }

    const handleDelete = (env: 'production' | 'sandbox', index: number) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [env]: prevConfig[env].filter((_, i) => i !== index),
        }));
    }

    const isAddRuleDisabled = (env: 'production' | 'sandbox') => {
        if (modelList.length === 0) {
            return true;
        }
        return env === 'production'
            ? productionEndpoints.length === 0
            : sandboxEndpoints.length === 0;
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

    const handleAccordionChange = (env: 'production' | 'sandbox') => (
        _event: React.SyntheticEvent,
        expanded: boolean,
    ) => {
        if (env === 'production') {
            handleProductionToggle(
                { target: { checked: expanded } } as React.ChangeEvent<HTMLInputElement>,
            );
        } else {
            handleSandboxToggle(
                { target: { checked: expanded } } as React.ChangeEvent<HTMLInputElement>,
            );
        }
    };

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <>
            <Grid item xs={12}>
                <FormControl size='small' fullWidth sx={{ mb: 2 }}>
                    <InputLabel id='condition-type-label'>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.condition.type'
                            defaultMessage='Condition Type'
                        />
                    </InputLabel>
                    <Select
                        labelId='condition-type-label'
                        id='condition-type'
                        value={conditionType}
                        label='Condition Type'
                        onChange={(e) => handleConditionTypeChange(e.target.value)}
                    >
                        {CONDITION_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                                id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.accordion.production'
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
                                    id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.no.models'
                                    defaultMessage={
                                        'No models available. Please configure models for the LLM provider.'
                                    }
                                />
                            </Alert>
                        ) : (
                            <>
                                {productionEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.no.production.endpoints'
                                            defaultMessage={
                                                'No production endpoints available. Please {configureLink} first.'
                                            }
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
                                    data-testid='add-production-rule'
                                    sx={{ ml: 1 }}
                                    onClick={() => handleAddRule('production')}
                                    disabled={isAddRuleDisabled('production')}
                                >
                                    <AddCircle sx={{ mr: 1 }} />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.add.rule'
                                        defaultMessage='Add Routing Rule'
                                    />
                                </Button>
                                {config.production.map((rule, index) => (
                                    <RoutingRuleCard
                                        key={index}
                                        rule={rule}
                                        modelList={modelList}
                                        endpointList={productionEndpoints}
                                        onUpdate={(updatedRule) =>
                                            handleUpdate('production', index, updatedRule)
                                        }
                                        onDelete={() => handleDelete('production', index)}
                                    />
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
                                id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.accordion.sandbox'
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
                                    id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.no.models'
                                    defaultMessage={
                                        'No models available. Please configure models for the LLM provider.'
                                    }
                                />
                            </Alert>
                        ) : (
                            <>
                                {sandboxEndpoints.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.no.sandbox.endpoints'
                                            defaultMessage={
                                                'No sandbox endpoints available. Please {configureLink} first.'
                                            }
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
                                    data-testid='add-sandbox-rule'
                                    sx={{ ml: 1 }}
                                    onClick={() => handleAddRule('sandbox')}
                                    disabled={isAddRuleDisabled('sandbox')}
                                >
                                    <AddCircle sx={{ mr: 1 }} />
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ContentBasedRouter.add.rule'
                                        defaultMessage='Add Routing Rule'
                                    />
                                </Button>
                                {config.sandbox.map((rule, index) => (
                                    <RoutingRuleCard
                                        key={index}
                                        rule={rule}
                                        modelList={modelList}
                                        endpointList={sandboxEndpoints}
                                        onUpdate={(updatedRule) =>
                                            handleUpdate('sandbox', index, updatedRule)
                                        }
                                        onDelete={() => handleDelete('sandbox', index)}
                                    />
                                ))}
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </>
    );
}

export default ContentBasedRouter;
