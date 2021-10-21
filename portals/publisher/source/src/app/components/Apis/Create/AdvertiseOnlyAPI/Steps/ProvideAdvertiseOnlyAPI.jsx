/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CheckIcon from '@material-ui/icons/Check';

import APIValidation from 'AppData/APIValidation';
import Wsdl from 'AppData/Wsdl';
import Banner from 'AppComponents/Shared/Banner';
import DropZoneLocal, { humanFileSize } from 'AppComponents/Shared/DropZoneLocal';
import MenuItem from '@material-ui/core/MenuItem';
import API from 'AppData/api';

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
export default function ProvideAdvertiseOnlyAPI(props) {
    const { apiInputs, inputsDispatcher, onValidate } = props;
    const isFileInput = apiInputs.inputType === 'file';
    const classes = useStyles();
    // If valid value is `null` else an error object will be there
    const [isValid, setValidity] = useState();
    const [isValidating, setIsValidating] = useState(false);
    const [apiType, setApiType] = useState(apiInputs.type);
    const [validationErrors, setValidationErrors] = useState([]);
    const [acceptTypes, setAcceptTypes] = useState('.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.json,application/json,'
        + '.yaml,.yml,.wsdl,.graphql,text/plain');

    const apiTypes = [
        {
            name: 'rest',
            displayName: 'REST',
            description: 'REST API',
            value: 'HTTP',
        },
        {
            name: 'soap',
            displayName: 'SOAP',
            description: 'SOAP API',
            value: 'SOAP',
        },
        {
            name: 'graphql',
            displayName: 'GraphQL',
            description: 'GraphQL API',
            value: 'GraphQL',
        },
        {
            name: 'async',
            displayName: 'Async',
            description: 'Async APIs such as WebSocket, MQTT, AMQP etc.',
            value: 'Async',
        },
    ];

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
                setValidity({ ...isValid, file: null });
            } else {
                setValidity({ ...isValid, url: null });
            }
            success = true;
        } else if (type === 'file') {
            setValidity({ ...isValid, file: { message: 'WSDL content validation failed!' } });
        } else {
            setValidity({ ...isValid, url: { message: 'Invalid WSDL URL!' } });
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
            setValidity({ ...isValid, file: { message } });
        } else {
            setValidity({ ...isValid, url: { message } });
        }
        setIsValidating(false);
    }

    /**
     * Handle the change of API types
     *
     * @param {*} event
     */
    function handleOnChangeForApiType(event) {
        const { name: action, value } = event.target;
        setApiType(value);
        if (value === 'REST') {
            setAcceptTypes('.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.json,application/json,.yaml');
        } else if (value === 'SOAP') {
            setAcceptTypes('.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.wsdl');
        } else if (value === 'GraphQL') {
            setAcceptTypes('.graphql,text/plain');
        } else if (value === 'Async') {
            setAcceptTypes('.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.json,application/json,.yaml,.yml');
        } else {
            setAcceptTypes('.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.json,application/json,.yaml,.yml,.wsdl,.graphql'
                + ',text/plain');
        }
        inputsDispatcher({ action, value });
    }

    /**
     * Trigger the onValidate call back after validating WSDL url from the state.
     * Do the validation state aggregation and call the onValidate method with aggregated value
     * @param {Object} state Validation state object
     */
    function validateUrl(state) {
        if (state === null) {
            setIsValidating(true);
            if (apiType === 'REST') {
                API.validateOpenAPIByUrl(apiInputs.inputValue, { returnContent: true }).then((response) => {
                    const {
                        body: { isValid: isValidURL, info, content },
                    } = response;
                    if (isValidURL) {
                        info.content = content;
                        inputsDispatcher({ action: 'preSetAPI', value: info });
                        setValidity({ ...isValid, url: null });
                    } else {
                        setValidity({ ...isValid, url: { message: 'OpenAPI content validation failed!' } });
                    }
                    onValidate(isValidURL);
                    setIsValidating(false);
                }).catch((error) => {
                    setValidity({ url: { message: error.message } });
                    onValidate(false);
                    setIsValidating(false);
                    console.error(error);
                });
            } else if (apiType === 'SOAP') {
                Wsdl.validateUrl(apiInputs.inputValue).then((response) => {
                    handleWSDLValidationResponse(response, 'url');
                }).catch((error) => {
                    handleWSDLValidationErrorResponse(error, 'url');
                });
            } else if (apiType === 'GraphQL') {
                setValidity({ ...isValid, url: state });
                onValidate(false);
            } else if (apiType === 'Async') {
                API.validateAsyncAPIByUrl(apiInputs.inputValue, { returnContent: true }).then((response) => {
                    const {
                        body: {
                            isValid: isValidURL, info, content, errors,
                        },
                    } = response;
                    if (isValidURL) {
                        info.content = content;
                        inputsDispatcher({ action: 'preSetAPI', value: info });
                        setValidity({ ...isValid, url: null });
                    } else {
                        setValidity({ ...isValid, url: { message: 'AsyncAPI content validation failed!' } });
                        setValidationErrors(errors);
                    }
                    onValidate(isValidURL);
                    setIsValidating(false);
                }).catch((error) => {
                    setValidity({ url: { message: error.message } });
                    onValidate(false);
                    setIsValidating(false);
                    console.error(error);
                });
            } else {
                setValidity({ ...isValid, url: state });
                onValidate(false);
            }
        } else {
            setValidity({ ...isValid, url: state });
            onValidate(false);
        }
    }

    function validateOpenAPIDefinition(file) {
        let validFile;
        API.validateOpenAPIByFile(file)
            .then((response) => {
                const {
                    body: { isValid: isValidFile, info },
                } = response;
                if (isValidFile) {
                    validFile = file;
                    inputsDispatcher({ action: 'preSetAPI', value: info });
                    setValidity({ ...isValid, file: null });
                } else {
                    setValidity({ ...isValid, file: { message: 'OpenAPI content validation failed!' } });
                }
            })
            .catch((error) => {
                setValidity({ ...isValid, file: { message: 'OpenAPI content validation failed!' } });
                console.error(error);
            })
            .finally(() => {
                setIsValidating(false); // Stop the loading animation
                onValidate(validFile !== null); // If there is a valid file then validation has passed
                // If the given file is valid , we set it as the inputValue else set `null`
                inputsDispatcher({ action: 'inputValue', value: validFile });
            });
    }

    function validateGraphQLSchema(file) {
        let validFile;
        API.validateGraphQLFile(file)
            .then((response) => {
                const {
                    body: { isValid: isValidFile, graphQLInfo },
                } = response;
                if (isValidFile) {
                    validFile = file;
                    inputsDispatcher({ action: 'graphQLInfo', value: graphQLInfo });
                    setValidity({ ...isValid, file: null });
                } else {
                    setValidity({ ...isValid, file: { message: 'GraphQL content validation failed!' } });
                }
            })
            .catch((error) => {
                setValidity({ ...isValid, file: { message: 'GraphQL content validation failed!' } });
                console.error(error);
            })
            .finally(() => {
                setIsValidating(false); // Stop the loading animation
                onValidate(validFile !== null); // If there is a valid file then validation has passed
                // If the given file is valid , we set it as the inputValue else set `null`
                inputsDispatcher({ action: 'inputValue', value: validFile });
            });
    }

    function validateWSDLDefinition(file) {
        Wsdl.validateFileOrArchive(file)
            .then((response) => {
                if (handleWSDLValidationResponse(response, 'file')) {
                    inputsDispatcher({ action: 'inputValue', value: file });
                }
            }).catch((error) => {
                handleWSDLValidationErrorResponse(error, 'file');
            });
    }

    function validateAsyncAPIDefinition(file) {
        let validFile;
        API.validateAsyncAPIByFile(file)
            .then((response) => {
                const {
                    body: { isValid: isValidFile, info, errors },
                } = response;
                if (isValidFile) {
                    validFile = file;
                    inputsDispatcher({ action: 'preSetAPI', value: info });
                    setValidity({ ...isValid, file: null });
                } else {
                    // eslint-disable-next-line max-len
                    setValidity({ ...isValid, file: { message: 'AsyncAPI content validation failed! ' } });
                    setValidationErrors(errors);
                }
            })
            .catch((error) => {
                setValidity({ ...isValid, file: { message: 'AsyncAPI content validation failed!' } });
                console.error(error);
            })
            .finally(() => {
                setIsValidating(false); // Stop the loading animation
                onValidate(validFile !== null); // If there is a valid file then validation has passed
                // If the given file is valid , we set it as the inputValue else set `null`
                inputsDispatcher({ action: 'inputValue', value: validFile });
            });
    }

    /**
     *
     *
     * @param {*} files
     */
    function onDrop(files) {
        setIsValidating(true);
        // Why `files.pop()` below is , We only handle one AsyncAPI file at a time,
        // So if use provide multiple, We would only
        // accept the first file. This information is shown in the dropdown helper text
        const file = files.pop();
        if (apiType === 'REST') {
            validateOpenAPIDefinition(file);
        } else if (apiType === 'SOAP') {
            validateWSDLDefinition(file);
        } else if (apiType === 'GraphQL') {
            validateGraphQLSchema(file);
        } else if (apiType === 'Async') {
            validateAsyncAPIDefinition(file);
        } else {
            setValidity({ ...isValid });
            onValidate(false);
        }
    }

    /**
     *  Render uploaded API Definition list
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

    /**
     * Render file upload UI.
     *
     */
    function renderFileUpload() {
        if (apiInputs.inputValue) {
            return renderUploadedList();
        }
        return (
            <DropZoneLocal
                error={isValid && isValid.file}
                onDrop={onDrop}
                files={apiInputs.inputValue}
                accept={acceptTypes}
            >
                {isValidating ? (<CircularProgress />)
                    : ([
                        <FormattedMessage
                            id='Apis.Create.AdvertiseOnlyAPI.Steps.ProvideAdvertiseOnlyAPI.Input.file.dropzone'
                            defaultMessage='Drag & Drop API Definition file/archive {break} or {break} Browse files'
                            values={{ break: <br /> }}
                        />,
                        <Button
                            color='primary'
                            variant='contained'
                        >
                            <FormattedMessage
                                id='Apis.Create.AdvertiseOnlyAPI.Steps.ProvideAdvertiseOnlyAPI.Input.file.upload'
                                defaultMessage='Browse File to Upload'
                            />
                        </Button>,
                    ])}
            </DropZoneLocal>
        );
    }

    function renderFileLabel(type) {
        if (type === 'file') {
            return (
                <FormattedMessage
                    id='Apis.Create.AdvertiseOnlyAPI.Steps.ProvideAdvertiseOnlyAPI.api.file.archive'
                    defaultMessage='API Definition File/Archive'
                />
            );
        } else {
            return (
                <FormattedMessage
                    id='Apis.Create.AdvertiseOnlyAPI.Steps.ProvideAdvertiseOnlyAPI.api.url.label'
                    defaultMessage='API Definition URL'
                />
            );
        }
    }

    let urlStateEndAdornment = null;
    if (isValidating) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <CircularProgress />
            </InputAdornment>
        );
    } else if (isValid && isValid.url) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <ErrorOutlineIcon fontSize='large' color='error' />
            </InputAdornment>
        );
    } else if (isValid && !isValid.url) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <CheckIcon fontSize='large' color='primary' />
            </InputAdornment>
        );
    }

    return (
        <>
            <Grid container spacing={5}>
                <Grid item md={11}>
                    <TextField
                        select
                        fullWidth
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Create.AdvertiseOnlyAPI.Steps.ProvideAdvertiseOnlyAPI.api.type'
                                    defaultMessage='API Type'
                                />
                                <sup className={classes.mandatoryStar}>*</sup>
                            </>
                        )}
                        value={apiType}
                        name='type'
                        SelectProps={{
                            multiple: false,
                            renderValue: (selected) => (selected),
                        }}
                        margin='normal'
                        variant='outlined'
                        InputProps={{
                            id: 'itest-id-apitypes-input',
                        }}
                        onChange={handleOnChangeForApiType}
                    >
                        {apiTypes.map((apiProtocol) => (
                            <MenuItem
                                dense
                                disableGutters={false}
                                id={apiProtocol.name}
                                key={apiProtocol.name}
                                value={apiProtocol.displayName}
                            >
                                <ListItemText primary={apiProtocol.displayName} secondary={apiProtocol.description} />
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                {
                    apiType !== 'GraphQL' && (
                        <Grid item md={11}>
                            <FormControl component='fieldset'>
                                <FormLabel component='legend'>
                                    <>
                                        <sup className={classes.mandatoryStar}>*</sup>
                                        {' '}
                                        <FormattedMessage
                                            id='Apis.Create.AdvertiseOnlyAPI.Steps.ProvideAdvertiseOnlyAPI.Input.type'
                                            defaultMessage='Input Type'
                                        />
                                    </>
                                </FormLabel>
                                <RadioGroup
                                    aria-label='Input type'
                                    value={apiInputs.inputType}
                                    onChange={(event) => inputsDispatcher({
                                        action: 'inputType',
                                        value: event.target.value,
                                    })}
                                >
                                    <FormControlLabel
                                        value='url'
                                        control={<Radio color='primary' />}
                                        label={renderFileLabel('url')}
                                    />
                                    <FormControlLabel
                                        value='file'
                                        control={<Radio color='primary' />}
                                        label={renderFileLabel('file')}
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    )
                }

                {isValid && isValid.file
                    && (
                        <Grid item md={11}>
                            <Banner
                                onClose={() => setValidity({ file: null })}
                                disableActions
                                dense
                                paperProps={{ elevation: 1 }}
                                type='error'
                                message={isValid.file.message}
                                errors={validationErrors}
                            />
                        </Grid>
                    )}
                <Grid item md={11}>
                    {(isFileInput || apiType === 'GraphQL') ? renderFileUpload()
                        : (
                            <TextField
                                autoFocus
                                id='outlined-full-width'
                                label='API Definition URL'
                                placeholder='Enter API Definition URL'
                                fullWidth
                                margin='normal'
                                variant='outlined'
                                onChange={({ target: { value } }) => inputsDispatcher({
                                    action: 'inputValue',
                                    value,
                                })}
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
                                    (isValid && isValid.url && isValid.url.message) || 'Click away to validate the URL'
                                }
                                error={isValid && Boolean(isValid.url)}
                                disabled={isValidating}
                            />
                        )}

                </Grid>
            </Grid>
        </>
    );
}

ProvideAdvertiseOnlyAPI.defaultProps = {
    onValidate: () => { },
};
ProvideAdvertiseOnlyAPI.propTypes = {
    apiInputs: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
        mode: PropTypes.string,
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
