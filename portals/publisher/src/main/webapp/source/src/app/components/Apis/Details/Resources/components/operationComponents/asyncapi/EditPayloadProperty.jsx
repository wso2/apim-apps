/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';

const useStyles = makeStyles((theme) => ({
    form: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        width: 'fit-content',
    },
    formControl: {
        marginTop: theme.spacing(2),
        minWidth: 120,
    },
    formControlLabel: {
        marginTop: theme.spacing(1),
    },
}));

/**
 * Edit payload properties according to the AsyncAPI spec.
 * @export
 * @returns
 */
export default function EditPayloadProperty(props) {
    const {
        operationsDispatcher, target, verb, editingProperty, setEditingProperty,
    } = props;

    /**
     * Payload property reducer
     *
     * @param {*} currentProperty
     * @param {*} paramAction
     */
    function propertyActionReducer(currentProperty, paramAction) {
        const { action, value } = paramAction;
        const nextProperty = currentProperty.schema
            ? { ...currentProperty, schema: { ...currentProperty.schema } } : { ...currentProperty };
        switch (action) {
            case 'type':
            case 'description':
                nextProperty[action] = value;
                break;
            default:
                break;
        }
        return nextProperty;
    }

    const [property, propertyActionDispatcher] = useReducer(propertyActionReducer, editingProperty);
    const classes = useStyles();

    const handleClose = () => {
        setEditingProperty(null);
    };

    const handelDone = () => {
        operationsDispatcher({ action: 'payloadProperty', data: { target, verb, value: property } });
        handleClose();
    };

    const getSupportedDataTypes = () => {
        return ['integer', 'string', 'long', 'double', 'float'];
    };

    const isEditing = property !== null;
    if (!isEditing) {
        return null;
    }
    return (
        <Dialog fullWidth maxWidth='md' open={isEditing} onClose={handleClose} aria-labelledby='edit-property'>
            <DialogTitle id='edit-property'>
                <Typography variant='h6'>
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.EditPayloadProperty.title'
                        defaultMessage='Edit'
                    />
                    {' '}
                    <Typography display='inline' variant='subtitle1'>
                        {property.name}
                    </Typography>
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container direction='row' spacing={2} justifyContent='flex-start' alignItems='center'>
                    <Grid item md={6}>
                        <FormControl
                            required
                            fullWidth
                            margin='dense'
                            variant='outlined'
                            className={classes.formControl}
                        >
                            <InputLabel required id='edit-property-type'>
                                <FormattedMessage
                                    id={'Apis.Details.Topics.components.operationComponents.EditPayloadProperty'
                                    + '.data.type'}
                                    defaultMessage='Data Type'
                                />
                            </InputLabel>

                            <Select
                                value={property.type}
                                onChange={
                                    ({ target: { name, value } }) => propertyActionDispatcher({ action: name, value })
                                }
                                inputProps={{
                                    name: 'type',
                                    id: 'edit-property-type',
                                }}
                                MenuProps={{
                                    getContentAnchorEl: null,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                }}
                            >
                                {getSupportedDataTypes().map((dataType) => (
                                    <MenuItem value={dataType} dense>
                                        {dataType}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                <FormattedMessage
                                    id={'Apis.Details.Topics.components.operationComponents.EditPayloadProperty.'
                                    + 'select.data.type'}
                                    defaultMessage='Select the Data Type'
                                />
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item md={6} />
                    <Grid item md={12}>
                        <TextField
                            value={property.description}
                            fullWidth
                            label={(
                                <FormattedMessage
                                    id={'Apis.Details.Topics.components.operationComponents.EditPayloadProperty'
                                    + '.description'}
                                    defaultMessage='Description'
                                />
                            )}
                            multiline
                            disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                            rows='4'
                            name='description'
                            margin='normal'
                            variant='outlined'
                            onChange={({ target: { name, value } }) => {
                                propertyActionDispatcher({ action: name, value });
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button size='small' onClick={handleClose} color='primary'>
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.EditPayloadProperty.close'
                        defaultMessage='Close'
                    />
                </Button>
                <Button
                    size='small'
                    onClick={handelDone}
                    variant='contained'
                    color='primary'
                >
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.EditPayloadProperty.done'
                        defaultMessage='Done'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

EditPayloadProperty.propTypes = {
    operationsDispatcher: PropTypes.func.isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    editingProperty: PropTypes.shape({}).isRequired,
    setEditingProperty: PropTypes.func.isRequired,
};
