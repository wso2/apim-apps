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
import React, { useState, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { FormattedMessage, useIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
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
import API from 'AppData/api';
import DropZoneLocal, { humanFileSize } from 'AppComponents/Shared/DropZoneLocal';
import Banner from 'AppComponents/Shared/Banner';
import { debounce, FormControlLabel, InputAdornment, Radio, RadioGroup, TextField } from '@mui/material';
import APIValidation from 'AppData/APIValidation';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const PREFIX = 'ProvideGraphQL';
const DEBOUNCE_DELAY_MS = 750;
const classes = {
    mandatoryStar: `${PREFIX}-mandatoryStar`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
    }
}));

/**
 * Sub component of API Create using GraphQL UI, This is handling the taking input of GraphQL file or URL from the user
 * In the create API using GraphQL wizard first step out of 2 steps
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
export default function ProvideGraphQL(props) {
    const { apiInputs, inputsDispatcher, onValidate } = props;
    const { inputType, inputValue } = apiInputs;
    const isURLInput = inputType === ProvideGraphQL.INPUT_TYPES.URL || inputType === '';
    const isFileInput = inputType === ProvideGraphQL.INPUT_TYPES.FILE;
    const isEndpointInput = inputType === ProvideGraphQL.INPUT_TYPES.ENDPOINT;
    const intl = useIntl();
    // If valid value is `null`,that means valid, else an error object will be there
    const [isValid, setValidity] = useState({ file: null });
    const [isValidating, setIsValidating] = useState(false);
    /**
     *
     *
     * @param {*} files
     */
    function onDrop(files) {
        setIsValidating(true);

        // Why `files.pop()` below is , We only handle one graphQL file at a time,
        // So if use provide multiple, We would only
        // accept the first file. This information is shown in the dropdown helper text
        const file = files.pop();
        let validFile = null;
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

    function reset() {
        inputsDispatcher({ action: 'importingContent', value: null });
        inputsDispatcher({ action: 'inputValue', value: null });
        inputsDispatcher({ action: 'isFormValid', value: false });
        inputsDispatcher({ action: 'endpoint', value: '' });
        inputsDispatcher({ action: 'isValid', value: null });
    }

    const isInvalidURL = Boolean(isValid.url);
    let urlStateEndAdornment = null;
    if (isValidating) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <CircularProgress />
            </InputAdornment>
        );
    } else if (isValid.url !== undefined) {
        if (isInvalidURL) {
            urlStateEndAdornment = (
                <InputAdornment position='end'>
                    <ErrorOutlineIcon fontSize='large' color='error' />
                </InputAdornment>
            );
        } else {
            urlStateEndAdornment = (
                <InputAdornment position='end' id='url-validated'>
                    <CheckIcon fontSize='large' color='primary' />
                </InputAdornment>
            );
        }
    }

    const debouncedValidateURLOrEndpoint = useCallback(
        debounce((newURL) => {
            const handleResponse = (response) => {
                const {
                    body: { graphQLInfo },
                } = response;
                const isValidURL = response.body.isValid;
                if (isValidURL) {
                    inputsDispatcher({ action: 'graphQLInfo', value: graphQLInfo });
                    setValidity({ isValidURL, file: null });
                } else {
                    let errorMessage;
                    if (inputType === ProvideGraphQL.INPUT_TYPES.ENDPOINT) {
                        errorMessage = 'Error occurred while generating GraphQL schema from endpoint';
                    } else if (inputType === ProvideGraphQL.INPUT_TYPES.URL) {
                        errorMessage = 'Error occurred while retrieving GraphQL schema from url';
                    }
                    setValidity({
                        isValidURL,
                        file: { message: errorMessage }
                    });
                }
                onValidate(isValidURL);
                setIsValidating(false);
            };

            const handleError = (error) => {
                setValidity({ url: { message: error.message } });
                onValidate(false);
                setIsValidating(false);
                console.error(error);
            }
            
            const validationFunction = inputType === ProvideGraphQL.INPUT_TYPES.URL
                ? () => API.validateGraphQL(newURL)
                : () => API.validateGraphQL(newURL, { useIntrospection: true });

            validationFunction()
                .then(handleResponse)
                .catch(handleError);

            if(inputType === ProvideGraphQL.INPUT_TYPES.ENDPOINT){
                inputsDispatcher({ action: 'endpoint', value: newURL });
            }
        }, DEBOUNCE_DELAY_MS),
        [inputType],
    );

    function validateURL(value) {
        const state = APIValidation.url.required().validate(value).error;
        if (state === null) {
            setIsValidating(true);
            debouncedValidateURLOrEndpoint(apiInputs.inputValue);
        } else {
            setValidity({ ...isValid, url: state });
            onValidate(false);
        }
    }

    useEffect(() => {
        if (inputValue && inputType === ProvideGraphQL.INPUT_TYPES.FILE) {
            onDrop([inputValue]);
        }
    }, [inputType, inputValue]);

    useEffect(() => {
        reset();
    }, [inputType]);

    const accept = '.graphql,text/plain';
    return (
        <Root>
            <Grid container>
                <Grid item xs={12} sx={{ mb: 2 }}>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>
                            <>
                                <sup className={classes.mandatoryStar}>*</sup>
                                {' '}
                                <FormattedMessage
                                    id='Apis.Create.GraphQL.Steps.ProvideGraphQL.Input.type'
                                    defaultMessage='Input Type'
                                />
                            </>
                        </FormLabel>
                        <RadioGroup
                            aria-label='Input Source'
                            value={apiInputs.inputType === '' ? 'url' : apiInputs.inputType}
                            onChange={(event) => {
                                inputsDispatcher({ action: 'inputType', value: event.target.value });
                                setValidity({ file: null });
                            }}
                        >
                            <FormControlLabel
                                disabled={isValidating}
                                value={ProvideGraphQL.INPUT_TYPES.FILE}
                                control={<Radio color='primary' />}
                                label={intl.formatMessage({
                                    id: 'Apis.Create.GraphQL.create.api.form.file.label',
                                    defaultMessage: 'GraphQL File/Archive',
                                })}
                                aria-label='GraphQL File/Archive'
                                id='graphql-file-select-radio'
                            />
                            <FormControlLabel
                                disabled={isValidating}
                                value={ProvideGraphQL.INPUT_TYPES.URL}
                                control={<Radio color='primary' />}
                                label={intl.formatMessage({
                                    id: 'Apis.Create.GraphQL.create.api.form.url.label',
                                    defaultMessage: 'GraphQL SDL URL',
                                })}
                                id='graphql-url-select-radio'
                            />
                            <FormControlLabel
                                disabled={isValidating}
                                value={ProvideGraphQL.INPUT_TYPES.ENDPOINT}
                                control={<Radio color='primary' />}
                                label={intl.formatMessage({
                                    id: 'Apis.Create.GraphQL.create.api.form.endpoint.label',
                                    defaultMessage: 'GraphQL Endpoint',
                                })}
                                aria-label='GraphQL Endpoint'
                                id='graphql-endpoint-select-radio'
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                {isValid.file
                    && (
                        <Grid item md={12} sx={{ mb: 2}}>
                            <Banner
                                onClose={() => setValidity({ file: null })}
                                disableActions
                                dense
                                paperProps={{ elevation: 1 }}
                                type='error'
                                message={isValid.file.message}
                            />
                        </Grid>
                    )}
                <Grid item md={12}>
                    {isFileInput && (
                        <>
                            {apiInputs.inputValue ? (
                                <List data-testid='uploaded-list-graphql'>
                                    <ListItem
                                        key={apiInputs.inputValue.path}
                                        data-testid='uploaded-list-content-graphql'
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                <InsertDriveFile />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={`
                                                ${apiInputs.inputValue.path} - 
                                                ${humanFileSize(apiInputs.inputValue.size)}`
                                            }
                                            data-testid={'file-input-' + apiInputs.inputValue.path}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge='end'
                                                aria-label='delete'
                                                onClick={() => {
                                                    inputsDispatcher({ action: 'inputValue', value: null });
                                                    inputsDispatcher({ action: 'isFormValid', value: false });
                                                }}
                                                data-testid='btn-delete-imported-file'
                                                size='large'>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            ) : (
                                <DropZoneLocal
                                    error={isValid.file}
                                    onDrop={onDrop}
                                    files={apiInputs.inputValue}
                                    accept={accept}
                                    ariaLabel='GraphQL file upload'
                                >
                                    {isValidating ? (<CircularProgress />)
                                        : ([
                                            <FormattedMessage
                                                id='Apis.Create.GraphQL.Steps.ProvideGraphQL.Input.file.dropzone'
                                                defaultMessage={'Drag & Drop files here {break} or {break} '
                                                    + 'Browse files{break}({accept})'}
                                                values={{ break: <br />, accept }}
                                            />,
                                            <Button
                                                color='primary'
                                                variant='contained'
                                                data-testid='browse-to-upload-btn'
                                                sx={{ mt: 1 }}
                                            >
                                                <FormattedMessage
                                                    id='Apis.Create.GraphQL.Steps.ProvideGraphQL.Input.file.upload'
                                                    defaultMessage='Browse File to Upload'
                                                />
                                            </Button>,
                                        ]
                                        )}
                                </DropZoneLocal>
                            )}
                        </>
                    )}
                    {isURLInput && (
                        <TextField
                            autoFocus
                            id='outlined-full-width-url'
                            label={intl.formatMessage({
                                id: 'Apis.Create.GraphQL.create.api.url.label',
                                defaultMessage: 'GraphQL SDL URL',
                            })}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Create.GraphQL.create.api.url.placeholder',
                                defaultMessage: 'Enter GraphQL SDL URL',
                            })}
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
                                    validateURL(value);
                                },
                                endAdornment: urlStateEndAdornment,
                            }}
                            // 'Give the URL of GraphQL endpoint'
                            helperText={(isValid.url && isValid.url.message)
                                || (
                                    <FormattedMessage
                                        id='Apis.Create.GraphQL.create.api.url.helper.text'
                                        defaultMessage='Click away to validate the URL'
                                    />
                                )}
                            error={isInvalidURL}
                            data-testid='graphql-add-form-url'
                        />
                    )}
                    {isEndpointInput && (
                        <TextField
                            autoFocus
                            id='outlined-full-width-endpoint'
                            label={intl.formatMessage({
                                id: 'Apis.Create.GraphQL.create.api.endpoint.label',
                                defaultMessage: 'GraphQL Endpoint',
                            })}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Create.GraphQL.create.api.endpoint.placeholder',
                                defaultMessage: 'Enter GraphQL Endpoint',
                            })}
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
                                    validateURL(value);
                                },
                                endAdornment: urlStateEndAdornment,
                            }}
                            helperText={(isValid.url && isValid.url.message)
                                || (
                                    <FormattedMessage
                                        id='Apis.Create.GraphQL.create.api.url.helper.text'
                                        defaultMessage='Click away to validate the URL'
                                    />
                                )}
                            error={isInvalidURL}
                            data-testid='graphql-add-form-endpoint'
                        />
                    )}
                </Grid>
            </Grid>
        </Root>
    );
}

ProvideGraphQL.defaultProps = {
    onValidate: () => {},
};

ProvideGraphQL.INPUT_TYPES = {
    URL: 'url',
    ENDPOINT: 'endpoint',
    FILE: 'file',
};

ProvideGraphQL.propTypes = {
    apiInputs: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
        inputValue: PropTypes.string
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
