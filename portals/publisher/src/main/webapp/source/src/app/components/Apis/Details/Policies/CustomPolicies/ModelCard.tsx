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

import { FormattedMessage, useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel, Paper } from '@mui/material';
import { Endpoint, ModelData } from './Types';

interface ModelCardProps {
    modelData: ModelData;
    modelList: string[];
    endpointList: Endpoint[];
    onUpdate: (updatedModel: ModelData) => void;
    onDelete: () => void;
}

const ModelCard: FC<ModelCardProps> = ({
    modelData,
    modelList,
    endpointList,
    onUpdate,
    onDelete,
}) => {
    const { model, endpointId, weight } = modelData;
    const [useWeight, setUseWeight] = useState(weight !== undefined);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const updatedModel = { ...modelData, [name]: name === "weight" ? parseFloat(value) : value };

        // Remove weight if it is not used
        if (!useWeight && name === "weight") {
            delete updatedModel.weight;
        }

        onUpdate(updatedModel);
    }

    const handleIsWeightedChange = () => {
        setUseWeight(!useWeight);

        if (useWeight) {
            const { weight, ...updatedModel } = modelData;
            onUpdate(updatedModel);
        } else {
            onUpdate({ ...modelData, weight: 0.5 });
        }
    }

    return (
        <>
            <Paper elevation={2}>
                <FormControl size='small' sx={{ width: '100%', margin: '10px 0' }}>
                    <InputLabel id='model-label'>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.select.model'
                            defaultMessage='Model'
                        />
                    </InputLabel>
                    <Select
                        labelId='model-label'
                        id='model'
                        value={model || ''}
                        label='Model'
                        onChange={(e: any) => handleChange(e)}
                    >
                        <MenuItem value=''>
                            <em>None</em>
                        </MenuItem>
                        {modelList.map((model) => (
                            <MenuItem key={model} value={model}>{model}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size='small' sx={{ width: '100%', margin: '10px 0' }}>
                    <InputLabel id='endpoint-label'>
                        <FormattedMessage
                            id='Apis.Details.Policies.CustomPolicies.ModelRoundRobin.select.endpoint'
                            defaultMessage='Endpoint'
                        />
                    </InputLabel>
                    <Select
                        labelId='endpoint-label'
                        id='endpoint'
                        value={endpointId || ''}
                        label='Ednpoint'
                        onChange={(e: any) => handleChange(e)}
                    >
                        <MenuItem value=''>
                            <em>None</em>
                        </MenuItem>
                        {endpointList.map((endpoint) => (
                            <MenuItem key={endpoint.id} value={endpoint.id}>{endpoint.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            size='small'
                            checked={useWeight}
                            onChange={handleIsWeightedChange}
                            sx={{ margin: '10px 0' }}
                        />
                    }
                    label='Is Weighted?'
                />
                {useWeight && (
                    <TextField
                        id='weight-production'
                        label='Weight'
                        size='small'
                        // helperText={getError(spec) === '' ? spec.description : getError(spec)}
                        // error={getError(spec) !== ''}
                        variant='outlined'
                        name='Weight'
                        type='number'
                        value={weight}
                        sx={{ width: '100%', margin: '10px 0' }}
                        onChange={(e: any) => handleChange(e)}
                        fullWidth
                    />
                )}
                <Button
                    variant='outlined'
                    type='submit'
                    color='primary'
                    data-testid='policy-attached-details-save'
                    onAbort={onDelete}
                >
                    <FormattedMessage
                        id='Apis.Details.Policies.Custom.Policies.Modelcard.delete'
                        defaultMessage='Delete'
                    />
                </Button>
            </Paper>
        </>
    );
}

export default ModelCard;
