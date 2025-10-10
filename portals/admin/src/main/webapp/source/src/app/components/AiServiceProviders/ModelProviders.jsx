/*
 *
 * Copyright (c) 2025 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
    Box, Grid, Button, TextField,
    IconButton, Tooltip,
} from '@mui/material';
import AddCircle from '@mui/icons-material/AddCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MuiChipsInput } from 'mui-chips-input';

const ModelProviders = ({
    models,
    onModelsChange,
    hasErrors,
    validating,
    providerName,
}) => {
    const intl = useIntl();

    /**
     * Gets the appropriate placeholder text based on provider name
     * @param {string} providerName - The name of the AI service provider
     * @returns {object} Object with id and defaultMessage for intl.formatMessage
     */
    const getModelPlaceholder = () => {
        if (providerName === 'AWSBedrock') {
            return {
                id: 'AiServiceProviders.ModelProviders.model.provider.models.placeholder.modelId',
                defaultMessage: 'Type model ID and press Enter',
            };
        }
        return {
            id: 'AiServiceProviders.ModelProviders.model.provider.models.placeholder',
            defaultMessage: 'Type model name and press Enter',
        };
    };

    /**
     * Handles adding a new model family.
     * Creates a new model object with a unique ID and empty multipleModelProviderSupport and values.
     */
    const handleAddProvider = () => {
        const newModel = {
            id: uuidv4(),
            name: '',
            models: [],
        };
        onModelsChange([...models, newModel]);
    };

    /**
     * Handles deleting a model family.
     * @param {*} event - The event object from the click event.
     */
    const handleProviderDelete = (event) => {
        const index = event.currentTarget.id;
        const updatedModels = models.filter((_, i) => i !== parseInt(index, 10));
        onModelsChange(updatedModels);
    };

    /**
     * Handles changes to the provider name of a model family.
     * @param {*} id - The ID of the model family.
     * @param {*} event - The event object from the change event.
     */
    const handleProviderChange = (id, event) => {
        const updatedModels = models.map((model) => {
            if (model.id === id) {
                return {
                    ...model,
                    name: event.target.value,
                };
            }
            return model;
        });
        onModelsChange(updatedModels);
    };

    return (
        <Grid item xs={12}>
            <Box flex='1'>
                <Button
                    variant='outlined'
                    onClick={handleAddProvider}
                >
                    <AddCircle sx={{ mr: 1 }} />
                    <FormattedMessage
                        id='AiServiceProviders.ModelProviders.add.model.provider'
                        defaultMessage='Add Model Provider'
                    />
                </Button>
            </Box>
            {models.map((model, index) => (
                <Grid container spacing={2} key={model.id} pt={1}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            id={index}
                            required
                            name='modelVendor'
                            label={intl.formatMessage({
                                id: 'AiServiceProviders.ModelProviders.model.provider.name',
                                defaultMessage: 'Provider Name',
                            })}
                            margin='dense'
                            variant='outlined'
                            value={model.name}
                            onChange={(e) => handleProviderChange(model.id, e)}
                            error={hasErrors('providerName', model.name, validating)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <MuiChipsInput
                            variant='outlined'
                            fullWidth
                            value={model.models}
                            onAddChip={(modelName) => {
                                const updatedModels = models.map((m) => {
                                    if (m.id === model.id) {
                                        return {
                                            ...m,
                                            models: [...m.models, modelName],
                                        };
                                    }
                                    return m;
                                });
                                onModelsChange(updatedModels);
                            }}
                            onDeleteChip={(modelName) => {
                                const updatedModels = models.map((m) => {
                                    if (m.id === model.id) {
                                        return {
                                            ...m,
                                            models: m.models.filter(
                                                (v) => v !== modelName,
                                            ),
                                        };
                                    }
                                    return m;
                                });
                                onModelsChange(updatedModels);
                            }}
                            placeholder={intl.formatMessage(getModelPlaceholder())}
                            data-testid={`ai-vendor-llm-models-${index}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='AiServiceProviders.ModelProviders.model.provider.delete'
                                    defaultMessage='Delete'
                                />
                            )}
                            placement='right-end'
                            interactive
                        >
                            <IconButton
                                id={index}
                                onClick={handleProviderDelete}
                                size='large'
                            >
                                <DeleteForeverIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

ModelProviders.propTypes = {
    models: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        values: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,
    onModelsChange: PropTypes.func.isRequired,
    hasErrors: PropTypes.func.isRequired,
    validating: PropTypes.bool.isRequired,
    providerName: PropTypes.string.isRequired,
};

export default ModelProviders;
