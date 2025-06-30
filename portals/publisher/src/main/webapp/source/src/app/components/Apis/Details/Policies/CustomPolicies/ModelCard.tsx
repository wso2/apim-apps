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

import React, { FC, useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Paper, IconButton, Box, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Endpoint, ModelData, ModelVendor } from './Types';

interface ModelCardProps {
    modelData: ModelData;
    modelList: ModelVendor[];
    endpointList: Endpoint[];
    isWeightApplicable: boolean;
    onUpdate: (updatedModel: ModelData) => void;
    onDelete?: () => void;
}

const ModelCard: FC<ModelCardProps> = ({
    modelData,
    modelList,
    endpointList,
    isWeightApplicable,
    onUpdate,
    onDelete,
}) => {
    const { vendor, model, endpointId, weight } = modelData;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const updatedModel = { ...modelData, [name]: name === "weight" ? parseFloat(value) : value };

        if (name === 'endpointId') {
            const selectedEndpoint = endpointList.find((endpoint) => endpoint.id === value);
            if (selectedEndpoint) {
                updatedModel.endpointName = selectedEndpoint.name;
            }
        }

        onUpdate(updatedModel);
    }

    return (
        <>
            <Paper elevation={2} sx={{ padding: 2, margin: 1, position: 'relative' }}>
                <Grid item xs={12}>
                    {modelList.length === 1 ? (
                        <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                            {/* If there's only one vendor, we can directly show the model selection */}
                            <InputLabel id='model-label'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.select.model'
                                    defaultMessage='Model'
                                />
                            </InputLabel>
                            <Select
                                labelId='model-label'
                                id='model'
                                value={model}
                                label='Model'
                                name='model'
                                onChange={(e: any) => handleChange(e)}
                            >
                                {modelList[0].values.map((modelValue) => (
                                    <MenuItem key={modelValue} value={modelValue}>{modelValue}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <>
                            <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                                <InputLabel id='vendor-label'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.select.provider'
                                        defaultMessage='Provider'
                                    />
                                </InputLabel>
                                <Select
                                    labelId='vendor-label'
                                    id='vendor'
                                    value={vendor}
                                    label='Provider'
                                    name='vendor'
                                    onChange={(e: any) => handleChange(e)}
                                >
                                    {modelList.map((vendor) => (
                                        <MenuItem key={vendor.vendor} value={vendor.vendor}>
                                            {vendor.vendor}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                                <InputLabel id='model-label'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.select.model'
                                        defaultMessage='Model'
                                    />
                                </InputLabel>
                                <Select
                                    labelId='model-label'
                                    id='model'
                                    value={model}
                                    label='Model'
                                    name='model'
                                    onChange={(e: any) => handleChange(e)}
                                >
                                    {modelList.find((modelEntry) => modelEntry.vendor === vendor)?.values.map((modelValue) => (
                                        <MenuItem key={modelValue} value={modelValue}>{modelValue}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}
                    <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                        <InputLabel id='endpoint-label'>
                            <FormattedMessage
                                id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.select.endpoint'
                                defaultMessage='Endpoint'
                            />
                        </InputLabel>
                        <Select
                            labelId='endpoint-label'
                            id='endpoint'
                            value={endpointId}
                            label='Endpoint'
                            name='endpointId'
                            onChange={(e: any) => handleChange(e)}
                        >
                            {endpointList.map((endpoint) => (
                                <MenuItem key={endpoint.id} value={endpoint.id}>{endpoint.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {isWeightApplicable && (
                        <FormControl size='small' fullWidth sx={{ mb: 1.5 }}>
                            <TextField
                                id='endpoint-weight'
                                label='Weight'
                                size='small'
                                variant='outlined'
                                name='weight'
                                type='number'
                                value={weight}
                                onChange={(e: any) => handleChange(e)}
                                fullWidth
                            />
                        </FormControl>
                    )}
                </Grid>
                {onDelete && (
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
                            data-testid='policy-attached-details-delete'
                            onClick={onDelete}
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                )}
            </Paper>
        </>
    );
}

export default ModelCard;
