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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { makeStyles } from '@mui/styles';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckIcon from '@mui/icons-material/Check';

import APIValidation from 'AppData/APIValidation';
import Wsdl from 'AppData/Wsdl';
import Banner from 'AppComponents/Shared/Banner';
import DropZoneLocal, { humanFileSize } from 'AppComponents/Shared/DropZoneLocal';

const useStyles = makeStyles((theme) => ({
    mandatoryStar: {
        color: theme.palette.error.main,
    },
}));

/**
 * Sub component of API Create using WSDL UI, This is handling the taking input of WSDL file or URL from the user
 * In the create API using WSDL wizard first step out of 2 steps
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
export default function ProvideWSDL(props) {
    const { apiInputs, inputsDispatcher, onValidate } = props;
    const isFileInput = apiInputs.inputType === 'file';
    const isGenerateRESTAPI = apiInputs.type === 'SOAPTOREST';
    const classes = useStyles();
    const [isError, setValidity] = useState(); // If valid value is `null` else an error object will be there
    const [isValidating, setIsValidating] = useState(false);
    const isCreateMode = apiInputs.mode === 'create';

    /**
     * Handles WSDL validation response and returns the state.
     *
     * @param {*} response WSDL validation response
     * @param {string} type of the input; file or url
     * @returns {boolean} validation status
     */
    function handleWSDLValidationResponse(response, type) {
        const isWSDLValid = response.body.isValid;
        let success = false;
        if (isWSDLValid) {
            if (type === 'file') {
                setValidity({ ...isError, file: null });
            } else {
                setValidity({ ...isError, url: null });
            }
            success = true;
        } else if (type === 'file') {
            setValidity({ ...isError, file: { message: 'WSDL content validation failed!' } });
        } else {
            setValidity({ ...isError, url: { message: 'Invalid WSDL URL!' } });
        }
        onValidate(isWSDLValid);
        setIsValidating(false);
        return success;
    }

    /**
     * Handles WSDL validation error response.
     *
     * @param error {*} error object
     * @param type {string} file/url type
     */
    function handleWSDLValidationErrorResponse(error, type) {
        let message = 'Error occurred during validation';
        if (error.response && error.response.body.description) {
            message = error.response.body.description;
        }
        if (type === 'file') {
            setValidity({ ...isError, file: { message } });
        } else {
            setValidity({ ...isError, url: { message } });
        }
        setIsValidating(false);
    }

    /**
     * Trigger the onValidate call back after validating WSDL url from the state.
     * Do the validation state aggregation and call the onValidate method with aggregated value
     * @param {Object} state Validation state object
     */
    function validateUrl(state) {
        if (state === null) {
            setIsValidating(true);
            Wsdl.validateUrl(apiInputs.inputValue).then((response) => {
                handleWSDLValidationResponse(response, 'url');
            }).catch((error) => {
                handleWSDLValidationErrorResponse(error, 'url');
            });
        } else {
            setValidity({ ...isError, url: state });
            onValidate(false);
        }
    }

    /**
     * Trigger the provided onValidate callback after validating the provided WSDL file.
     * Do the validation state aggregation and call the onValidate method with aggregated value
     * @param {*} file WSDL file or archive
     * @param {Object} state Validation state object
     */
    function validateFileOrArchive(file, state = null) {
        if (state === null) {
            setIsValidating(true);
            Wsdl.validateFileOrArchive(file).then((response) => {
                if (handleWSDLValidationResponse(response, 'file')) {
                    inputsDispatcher({ action: 'inputValue', value: file });
                }
            }).catch((error) => {
                handleWSDLValidationErrorResponse(error, 'file');
            });
        } else {
            setValidity({ ...isError, file: state });
            onValidate(false);
        }
    }

    /**
     *
     *
     * @param {*} files
     */
    function onDrop(files) {
        // Why `files[0]` below is , We only handle one wsdl file at a time, So if use provide multiple, We would only
        // accept the first file. This information is shown in the dropdown helper text
        validateFileOrArchive(files[0]);
    }

    /**
     *  Render uploaded WSDL schema list
     */
    function renderUploadedList() {
        return (
            <List>
                <ListItem key={apiInputs.inputValue.path}>
                    <ListItemAvatar>
                        <Avatar>
                            <InsertDriveFile />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={`${apiInputs.inputValue.path} - ${humanFileSize(apiInputs.inputValue.size)}`}
                    />
                    <ListItemSecondaryAction>
                        <IconButton
                            edge='end'
                            aria-label='delete'
                            onClick={() => {
                                inputsDispatcher({ action: 'inputValue', value: null });
                                inputsDispatcher({ action: 'isFormValid', value: false });
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        );
    }

    const dropBoxControlLabel = isGenerateRESTAPI ? (
        <FormattedMessage
            id='Apis.Create.WSDL.Steps.ProvideWSDL.Input.file.dropzone'
            defaultMessage='Drag & Drop WSDL file {break} -or-'
            values={{ break: <br /> }}
        />
    ) : (
        <FormattedMessage
            id='Apis.Create.WSDL.Steps.ProvideWSDL.Input.file.archive.dropzone'
            defaultMessage='Drag & Drop WSDL file/archive {break} -or-'
            values={{ break: <br /> }}
        />
    );

    /**
     * Render file upload UI.
     *
     */
    function renderFileUpload() {
        if (apiInputs.inputValue) {
            return renderUploadedList();
        }
        // TODO: Pass message saying accepting only one file ~tmkb
        return (
            <DropZoneLocal
                error={isError && isError.file}
                onDrop={onDrop}
                files={apiInputs.inputValue}
                accept='.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.wsdl'
            >
                {isValidating ? (<CircularProgress />)
                    : (
                        <>
                            { dropBoxControlLabel }
                            <Button
                                color='primary'
                                variant='contained'
                            >
                                <FormattedMessage
                                    id='Apis.Create.WSDL.Steps.ProvideWSDL.Input.file.upload'
                                    defaultMessage='Browse File to Upload'
                                />
                            </Button>
                        </>
                    )}
            </DropZoneLocal>
        );
    }

    let urlStateEndAdornment = null;
    if (isValidating) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <CircularProgress />
            </InputAdornment>
        );
    } else if (isError && isError.url) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <ErrorOutlineIcon fontSize='large' color='error' />
            </InputAdornment>
        );
    } else if (isError && !isError.url) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <CheckIcon fontSize='large' color='primary' />
            </InputAdornment>
        );
    }

    return (
        <>
            <Grid container spacing={5}>
                {isCreateMode
                && (
                    <Grid item md={12}>
                        <FormControl component='fieldset'>
                            <FormLabel component='legend'>
                                <>
                                    <sup className={classes.mandatoryStar}>*</sup>
                                    {' '}
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.Steps.ProvideWSDL.implementation.type'
                                        defaultMessage='Implementation Type'
                                    />
                                </>
                            </FormLabel>
                            <RadioGroup
                                aria-label='Implementation type'
                                value={apiInputs.type ? apiInputs.type : 'SOAP'}
                                onChange={
                                    (event) => {
                                        inputsDispatcher({ action: 'type', value: event.target.value });
                                        inputsDispatcher({ action: 'isFormValid', value: false });
                                        inputsDispatcher({ action: 'inputValue', value: null });
                                        inputsDispatcher({ action: 'inputType', value: 'url' });
                                    }
                                }
                            >
                                <FormControlLabel
                                    value='SOAP'
                                    control={<Radio color='primary' />}
                                    label={(
                                        <FormattedMessage
                                            id='Apis.Create.WSDL.Steps.ProvideWSDL.passthrough.label'
                                            defaultMessage='Pass Through'
                                        />
                                    )}
                                />
                                <FormControlLabel
                                    value='SOAPTOREST'
                                    control={<Radio color='primary' />}
                                    label={(
                                        <FormattedMessage
                                            id='Apis.Create.WSDL.Steps.ProvideWSDL.SOAPtoREST.label'
                                            defaultMessage='Generate REST APIs'
                                        />
                                    )}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                )}
                <Grid item md={12}>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>
                            <>
                                <sup className={classes.mandatoryStar}>*</sup>
                                {' '}
                                <FormattedMessage
                                    id='Apis.Create.WSDL.Steps.ProvideWSDL.Input.type'
                                    defaultMessage='Input Type'
                                />
                            </>
                        </FormLabel>
                        <RadioGroup
                            aria-label='Input type'
                            value={apiInputs.inputType}
                            onChange={(event) => inputsDispatcher({ action: 'inputType', value: event.target.value })}
                        >
                            <FormControlLabel
                                value='url'
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.Steps.ProvideWSDL.url.label'
                                        defaultMessage='WSDL URL'
                                    />
                                )}
                            />
                            <FormControlLabel
                                value='file'
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.Steps.ProvideWSDL.file.label.wsdl.file.archive'
                                        defaultMessage='WSDL File/Archive'
                                    />
                                )}
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                {isError && isError.file
                    && (
                        <Grid item md={11}>
                            <Banner
                                onClose={() => setValidity({ file: null })}
                                disableActions
                                dense
                                paperProps={{ elevation: 1 }}
                                type='error'
                                message={isError.file.message}
                            />
                        </Grid>
                    )}
                <Grid item md={11}>
                    {isFileInput ? renderFileUpload()
                        : (
                            <TextField
                                autoFocus
                                id='outlined-full-width'
                                label='WSDL URL'
                                placeholder='Enter WSDL URL'
                                fullWidth
                                margin='normal'
                                variant='outlined'
                                onChange={({ target: { value } }) => inputsDispatcher({ action: 'inputValue', value })}
                                value={apiInputs.inputValue}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    onBlur: ({ target: { value } }) => {
                                        validateUrl(APIValidation.url.required().validate(value).error);
                                    },
                                    endAdornment: urlStateEndAdornment,
                                }}
                                helperText={
                                    (isError && isError.url && isError.url.message) || 'Click away to validate the URL'
                                }
                                error={isError && Boolean(isError.url)}
                                disabled={isValidating}
                            />
                        )}

                </Grid>
            </Grid>
        </>
    );
}

ProvideWSDL.defaultProps = {
    onValidate: () => { },
};
ProvideWSDL.propTypes = {
    apiInputs: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
        mode: PropTypes.string,
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
