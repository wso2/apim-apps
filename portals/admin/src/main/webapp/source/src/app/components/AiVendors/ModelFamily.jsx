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
    Box, Grid, Button, Table, TableBody, TableRow, TableCell, TextField,
    IconButton, Tooltip,
} from '@mui/material';
import AddCircle from '@mui/icons-material/AddCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MuiChipsInput } from 'mui-chips-input';

const ModelFamily = ({ models, onModelsChange }) => {
    const intl = useIntl();

    /**
     * Handles adding a new model family.
     * Creates a new model object with a unique ID and empty vendor and values.
     */
    const handleAddModelFamily = () => {
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
    const handleDeleteModelFamily = (event) => {
        const index = event.currentTarget.id;
        const updatedModels = models.filter((_, i) => i !== parseInt(index, 10));
        onModelsChange(updatedModels);
    };

    /**
     * Handles changes to the vendor name of a model family.
     * @param {*} id - The ID of the model family.
     * @param {*} event - The event object from the change event.
     */
    const handleVendorChange = (id, event) => {
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
        <Box component='div' m={1}>
            <Grid item xs={12}>
                <Box flex='1'>
                    <Button
                        variant='outlined'
                        onClick={handleAddModelFamily}
                    >
                        <AddCircle sx={{ mr: 1 }} />
                        <FormattedMessage
                            id='AiVendors.AddEditAiVendor.model.family.add'
                            defaultMessage='Add Model Family'
                        />
                    </Button>
                </Box>
                <Table>
                    <TableBody>
                        {models.map((model, index) => (
                            <TableRow>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        required
                                        id={index}
                                        name='modelVendor'
                                        label={intl.formatMessage({
                                            id: 'AiVendors.AddEditAiVendor.vendor.name',
                                            defaultMessage: 'Model Vendor',
                                        })}
                                        margin='dense'
                                        variant='outlined'
                                        value={model.name}
                                        onChange={(e) => handleVendorChange(model.id, e)}
                                    />
                                </TableCell>
                                <TableCell>
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
                                            id: 'AiVendors.AddEditAiVendor.vendor.models.placeholder',
                                            defaultMessage: 'Type Model name and press Enter',
                                        })}
                                        data-testid={`ai-vendor-llm-models-${index}`}
                                        helperText={(
                                            <div style={{ position: 'absolute', marginTop: '10px' }}>
                                                {intl.formatMessage({
                                                    id: 'AiVendors.AddEditAiVendor.vendor.models.help',
                                                    defaultMessage: 'Type available models and press enter/'
                                                        + 'return to add them.',
                                                })}
                                            </div>
                                        )}
                                    />
                                </TableCell>
                                <TableCell align='right'>
                                    <Tooltip
                                        title={(
                                            <FormattedMessage
                                                id='AiVendors.AddEditAiVendor.vendor.delete'
                                                defaultMessage='Delete'
                                            />
                                        )}
                                        placement='right-end'
                                        interactive
                                    >
                                        <IconButton
                                            id={index}
                                            onClick={handleDeleteModelFamily}
                                            size='large'
                                        >
                                            <DeleteForeverIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
};

export default ModelFamily;
