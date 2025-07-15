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

const ModelFamily = ({
    models,
    onModelsChange,
    hasErrors,
    validating,
}) => {
    const intl = useIntl();

    /**
     * Handles adding a new model family.
     * Creates a new model object with a unique ID and empty vendor and values.
     */
    const handleAddProvider = () => {
        const newModel = {
            id: uuidv4(),
            vendor: '',
            values: [],
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
                    vendor: event.target.value,
                };
            }
            return model;
        });
        onModelsChange(updatedModels);
    };

    return (
        <Box component='div' m={1}>
            <Grid container>
                <Grid item xs={12}>
                    <Box flex='1'>
                        <Button
                            variant='outlined'
                            onClick={handleAddProvider}
                        >
                            <AddCircle sx={{ mr: 1 }} />
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.add.provider'
                                defaultMessage='Add Provider'
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
                                        id: 'AiVendors.ModelFamily.provider.name',
                                        defaultMessage: 'Provider Name',
                                    })}
                                    margin='dense'
                                    variant='outlined'
                                    value={model.vendor}
                                    onChange={(e) => handleProviderChange(model.id, e)}
                                    error={hasErrors('providerName', model.vendor, validating)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <MuiChipsInput
                                    variant='outlined'
                                    fullWidth
                                    value={model.values}
                                    onAddChip={(modelName) => {
                                        const updatedModels = models.map((m) => {
                                            if (m.id === model.id) {
                                                return {
                                                    ...m,
                                                    values: [...m.values, modelName],
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
                                                    values: m.values.filter(
                                                        (v) => v !== modelName,
                                                    ),
                                                };
                                            }
                                            return m;
                                        });
                                        onModelsChange(updatedModels);
                                    }}
                                    placeholder={intl.formatMessage({
                                        id: 'AiVendors.ModelFamily.provider.models.placeholder',
                                        defaultMessage: 'Type Model name and press Enter',
                                    })}
                                    data-testid={`ai-vendor-llm-models-${index}`}
                                />
                            </Grid>
                            <Grid item xs={12} sm={1}>
                                <Tooltip
                                    title={(
                                        <FormattedMessage
                                            id='AiVendors.ModelFamily.provider.delete'
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
            </Grid>
        </Box>
    );
};

ModelFamily.propTypes = {
    models: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        values: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,
    onModelsChange: PropTypes.func.isRequired,
    hasErrors: PropTypes.func.isRequired,
    validating: PropTypes.bool.isRequired,
};

export default ModelFamily;
