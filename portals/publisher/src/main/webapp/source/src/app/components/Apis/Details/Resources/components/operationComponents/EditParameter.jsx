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
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import { capitalizeFirstLetter } from 'AppData/stringFormatter';
import {
    getSupportedDataTypes,
    getDataFormats,
    iff,
} from 'AppComponents/Apis/Details/Resources/components/operationComponents/parameterUtils';
import { FormattedMessage } from 'react-intl';

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
    subtleText: {
        color: theme.palette.grey[400],
    },
}));

/**
 *
 *
 * @export
 * @returns
 */
export default function EditParameter(props) {
    const {
        operationsDispatcher, target, verb, editingParameter, setEditingParameter, version,
    } = props;
    /**
     *
     *
     * @param {*} currentParameter
     * @param {*} paramAction
     */
    function parameterActionReducer(currentParameter, paramAction) {
        const { action, value } = paramAction;
        const nextParameter = currentParameter.schema
            ? { ...currentParameter, schema: { ...currentParameter.schema } } : { ...currentParameter };
        switch (action) {
            case 'description':
            case 'required':
                nextParameter[action] = value;
                break;
            case 'type':
                if (nextParameter.schema) {
                    nextParameter.schema[action] = value;
                } else {
                    nextParameter[action] = value;
                }
                break;
            case 'format':
                if (nextParameter.schema) {
                    if (value) {
                        nextParameter.schema[action] = value;
                    } else {
                        delete nextParameter.schema[action];
                    }
                } else if (value) {
                    nextParameter[action] = value;
                } else {
                    delete nextParameter[action];
                }
                break;
            default:
                break;
        }
        return nextParameter;
    }
    const [parameter, parameterActionDispatcher] = useReducer(parameterActionReducer, editingParameter);
    const classes = useStyles();

    const handleClose = () => {
        setEditingParameter(null);
    };

    /**
     *
     *
     */
    function handelDone() {
        operationsDispatcher({ action: 'parameter', data: { target, verb, value: parameter } });
        handleClose();
    }
    const isEditing = parameter !== null;
    if (!isEditing) {
        return null;
    }
    return (
        <Dialog fullWidth maxWidth='md' open={isEditing} onClose={handleClose} aria-labelledby='edit-parameter'>
            <DialogTitle disableTypography id='edit-parameter'>
                <Typography variant='h6'>
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.EditParameter.title'
                        defaultMessage='Edit'
                    />
                    {' '}
                    <Typography display='inline' variant='subtitle1'>
                        {capitalizeFirstLetter(parameter.in)}
                        {' '}
                        :
                        {parameter.name}
                    </Typography>
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container direction='row' spacing={2} justify='flex-start' alignItems='center'>
                    <Grid item md={6}>
                        <TextField
                            value={capitalizeFirstLetter(parameter.in)}
                            disabled
                            fullWidth
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.operationComponents.EditParameter.type'
                                    defaultMessage='Parameter Type'
                                />
                            )}
                            margin='dense'
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            value={parameter.name}
                            disabled
                            fullWidth
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.operationComponents.EditParameter.name'
                                    defaultMessage='Name'
                                />
                            )}
                            margin='dense'
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item md={12}>
                        <TextField
                            value={parameter.description}
                            fullWidth
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.operationComponents.EditParameter.description'
                                    defaultMessage='Description'
                                />
                            )}
                            multiline
                            rows='4'
                            name='description'
                            margin='normal'
                            variant='outlined'
                            onChange={({ target: { name, value } }) => {
                                parameterActionDispatcher({ action: name, value });
                            }}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <FormControl
                            required
                            fullWidth
                            margin='dense'
                            variant='outlined'
                            className={classes.formControl}
                        >
                            <InputLabel required id='edit-parameter-type'>
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.operationComponents.EditParameter.data.type'
                                    defaultMessage='Data Type'
                                />
                            </InputLabel>

                            <Select
                                value={parameter.schema ? parameter.schema.type : parameter.type}
                                onChange={
                                    ({ target: { name, value } }) => parameterActionDispatcher({ action: name, value })
                                }
                                inputProps={{
                                    name: 'type',
                                    id: 'edit-parameter-type',
                                }}
                                MenuProps={{
                                    getContentAnchorEl: null,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                }}
                            >
                                {getSupportedDataTypes(version, parameter.in).map((dataType) => (
                                    <MenuItem value={dataType} dense>
                                        {capitalizeFirstLetter(dataType)}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                <FormattedMessage
                                    id={'Apis.Details.Resources.components.operationComponents.EditParameter.'
                                        + 'select.schema.data.type'}
                                    defaultMessage='Select the Schema Type'
                                />
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item md={6}>
                        <FormControl
                            fullWidth
                            margin='dense'
                            variant='outlined'
                            className={classes.formControl}
                            disabled={parameter.schema
                                ? iff(
                                    parameter.schema.type === 'boolean' || parameter.schema.type === 'object',
                                    true,
                                    false,
                                )
                                : iff(
                                    parameter.type === 'boolean' || parameter.type === 'object',
                                    true,
                                    false,
                                )}
                        >
                            <InputLabel id='edit-parameter-format'>
                                <FormattedMessage
                                    id={'Apis.Details.Resources.components.operationComponents.EditParameter.'
                                        + 'data.format'}
                                    defaultMessage='Data Format'
                                />
                            </InputLabel>
                            <Select
                                value={parameter.schema ? parameter.schema.format : parameter.format}
                                onChange={
                                    ({ target: { name, value } }) => parameterActionDispatcher({ action: name, value })
                                }
                                inputProps={{
                                    name: 'format',
                                    id: 'edit-parameter-format',
                                }}
                                MenuProps={{
                                    getContentAnchorEl: null,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                }}
                            >
                                <MenuItem value='' dense className={classes.subtleText}>
                                    <FormattedMessage
                                        id={'Apis.Details.Resources.components.operationComponents.EditParameter.'
                                            + 'select.format.of.data.type.none.option'}
                                        defaultMessage='No Data Type'
                                    />
                                </MenuItem>
                                {getDataFormats(
                                    parameter.schema ? parameter.schema.type : parameter.type,
                                ).map((dataType) => (
                                    <MenuItem value={dataType} dense>
                                        {capitalizeFirstLetter(dataType)}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                <FormattedMessage
                                    id={'Apis.Details.Resources.components.operationComponents.EditParameter.'
                                        + 'select.format.of.data.type'}
                                    defaultMessage='Select the Format of Data Type'
                                />
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <FormControl component='fieldset'>
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={parameter.required}
                                        onChange={(
                                            { target: { name, checked } },
                                        ) => parameterActionDispatcher({ action: name, value: checked })}
                                        value={parameter.required}
                                        inputProps={{
                                            name: 'required',
                                        }}
                                    />
                                )}
                                label={(
                                    <FormattedMessage
                                        id={'Apis.Details.Resources.components.operationComponents.EditParameter.'
                                            + 'required'}
                                        defaultMessage='Required'
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid container direction='row' justify='flex-end' alignItems='center'>
                        <DialogContentText>
                            <FormattedMessage
                                id={'Apis.Details.Resources.components.operationComponents.EditParameter.'
                                    + 'use.done.button.to.persist.changes'}
                                defaultMessage='Use DONE button in the page to persist changes'
                            />
                        </DialogContentText>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button size='small' onClick={handleClose} color='primary'>
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.EditParameter.close'
                        defaultMessage='Close'
                    />
                </Button>
                <Button size='small' onClick={handelDone} variant='contained' color='primary'>
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.EditParameter.done'
                        defaultMessage='Done'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

EditParameter.propTypes = {
    operationsDispatcher: PropTypes.func.isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    editingParameter: PropTypes.shape({}).isRequired,
    setEditingParameter: PropTypes.func.isRequired,
    version: PropTypes.string.isRequired,
};
