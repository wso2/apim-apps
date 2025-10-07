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
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { FormattedMessage, useIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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

import Banner from 'AppComponents/Shared/Banner';
import APIValidation from 'AppData/APIValidation';
import API from 'AppData/api';
import DropZoneLocal, { humanFileSize } from 'AppComponents/Shared/DropZoneLocal';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import Chip from '@mui/material/Chip';
import SolaceEventAPIProductFetcher from 'AppComponents/Apis/Create/AsyncAPI/SolaceEventAPIProductFetcher';
import Alert from 'AppComponents/Shared/Alert';
import APIClientFactory from "AppData/APIClientFactory";
import Utils from 'AppData/Utils';

const PREFIX = 'ProvideAsyncAPI';

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
 * Sub component of API Create using AsyncAPI UI, This is handling the taking input of WSDL file or URL from the user
 * In the create API using AsyncAPI wizard first step out of 2 steps
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
export default function ProvideAsyncAPI(props) {
    const { apiInputs, inputsDispatcher, onValidate } = props;
    const isFileInput = apiInputs.inputType === 'file';
    const { inputType, inputValue } = apiInputs;

    // If valid value is `null`,that means valid, else an error object will be there
    const [isValid, setValidity] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [gatewayVendor, setGatewayVendor] = useState('wso2');
    const intl = useIntl();
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
        let validFile = null;
        API.validateAsyncAPIByFile(file)
            .then((response) => {
                const {
                    body: { isValid: isValidFile, info, errors },
                } = response;
                setGatewayVendor(info.gatewayVendor);
                if (isValidFile) {
                    validFile = file;
                    inputsDispatcher({ action: 'preSetAPI', value: info });
                    setValidity({ ...isValid, file: null });
                } else {
                    // eslint-disable-next-line max-len
                    setValidity({
                        ...isValid, file: {
                            message: intl.formatMessage({
                                id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.content.'
                                    + 'validation.failed',
                                defaultMessage: 'AsyncAPI content validation failed! ',
                            })
                        }
                    });
                    setValidationErrors(errors);
                }
            })
            .catch((error) => {
                setValidity({
                    ...isValid, file: {
                        message: intl.formatMessage({
                            id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.content.'
                                + 'validation.failed',
                            defaultMessage: 'AsyncAPI content validation failed! ',
                        })
                    }
                });
                console.error(error);
            })
            .finally(() => {
                setIsValidating(false); // Stop the loading animation
                onValidate(validFile !== null); // If there is a valid file then validation has passed
                // If the given file is valid , we set it as the inputValue else set `null`
                inputsDispatcher({ action: 'inputValue', value: validFile });
            });
    }

    function handleSolaceEventApiSelect(solaceEventApiProductId, solacePlanId, solaceEventApiId) {
        setIsValidating(true);
        const apiClient =
            new APIClientFactory().getAPIClient(Utils.getCurrentEnvironment(), Utils.CONST.API_CLIENT).client;
        apiClient.then((client) => {
            const params = {
                eventApiProductId: solaceEventApiProductId,
                planId: solacePlanId,
                eventApiId: solaceEventApiId
            };
            const jsonString = JSON.stringify(params);
            const urlEncodedString = encodeURIComponent(jsonString);
            client.apis['Integrated APIs'].getIntegratedApiDefinition({
                vendor: 'solace',
                params: {
                    params: urlEncodedString
                }
            })
                .then((response) => {
                    const asyncApiPayload = response.body;
                    const asyncTransportProtocols = [];
                    if (asyncApiPayload.servers) {
                        Object.values(asyncApiPayload.servers).forEach((server) => {
                            asyncTransportProtocols.push(server.protocol);
                        });
                    }

                    const info = {
                        asyncAPIVersion: asyncApiPayload.asyncapi,
                        gatewayVendor: "solace",
                        name: asyncApiPayload.info.title,
                        version: asyncApiPayload.info.version,
                        context: asyncApiPayload.info.title.replace(/[&/\\#,+()$~%.'":*?<>{}\s]/g, '').toLowerCase(),
                        asyncTransportProtocols
                    }
                    inputsDispatcher({action: 'preSetAPI', value: info});
                })
                .catch((error) => {
                    Alert.error("Error loading Event API Async API");
                    console.error("Error loading Event API Async API", error);
                })
                .finally(() => {
                    setIsValidating(false);
                })
        });
    }

    /**
     * Trigger the provided onValidate call back on each input validation run
     * Do the validation state aggregation and call the onValidate method with aggregated value
     * @param {Object} state Validation state object returned from Joi `.validate()` method
     */
    function validateURL(value) {
        const state = APIValidation.url.required().validate(value).error;
        // State `null` means URL is valid, We do backend validation only in valid URLs
        if (state === null) {
            setIsValidating(true);
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
                    setValidity({
                        ...isValid, url: {
                            message: intl.formatMessage({
                                id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.content.'
                                    + 'validation.failed',
                                defaultMessage: 'AsyncAPI content validation failed! ',
                            })
                        }
                    });
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
            // Valid URL string
            // TODO: Handle catch network or api call failures ~tmkb
        } else {
            setValidity({ ...isValid, url: state });
            onValidate(false);
        }
    }

    useEffect(() => {
        if (inputValue) {
            if (inputType === ProvideAsyncAPI.INPUT_TYPES.FILE) {
                onDrop([inputValue]);
            } else if (inputType === ProvideAsyncAPI.INPUT_TYPES.URL) {
                validateURL(inputValue);
            }
        }
    }, [inputType, inputValue]);

    // TODO: Use validation + input to separate component that can be share with wsdl,swagger,graphql URL inputs ~tmkb
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
                <InputAdornment position='end'>
                    <CheckIcon fontSize='large' color='primary' />
                </InputAdornment>
            );
        }
    }

    let asyncApiInput = null;
    if (isFileInput) {
        asyncApiInput = (
            <>
                {apiInputs.inputValue ? (
                    <List>
                        <ListItem key={apiInputs.inputValue.path}>
                            <ListItemAvatar>
                                <Avatar>
                                    <InsertDriveFile/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${apiInputs.inputValue.path} -
                                    ${humanFileSize(apiInputs.inputValue.size)}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge='end'
                                    aria-label='delete'
                                    onClick={() => {
                                        inputsDispatcher({action: 'inputValue', value: null});
                                        inputsDispatcher({action: 'isFormValid', value: false});
                                    }}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                ) : (
                    <DropZoneLocal
                        error={isValid.file}
                        onDrop={onDrop}
                        files={apiInputs.inputValue}
                        accept='.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.json,application/json,.yaml,.yml'
                    >
                        {/* eslint-disable */}
                        {isValidating ? (<CircularProgress/>) :
                            ([<FormattedMessage
                                    id='Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.Input.file.dropzone'
                                    defaultMessage='Drag & Drop AsyncAPI File here {break} or {break} Browse files'
                                    values={{break: <br/>}}
                                />,
                                    <Button
                                        color='primary'
                                        variant='contained'
                                    >
                                        <FormattedMessage
                                            id='Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.Input.file.upload'
                                            defaultMessage='Browse File to Upload'
                                        />
                                    </Button>,]
                            )}
                        {/* eslint-enable */}
                    </DropZoneLocal>
                )}
            </>
        );
    } else if (apiInputs.inputType === 'solaceEventApiProductId') {
        asyncApiInput = <SolaceEventAPIProductFetcher
            apiInputs={apiInputs}
            inputsDispatcher={inputsDispatcher}
            onSolaceEventApiSelect={handleSolaceEventApiSelect}
        />;
    } else {
        asyncApiInput = (
            <TextField
                autoFocus
                id='outlined-full-width'
                label='AsyncAPI URL'
                placeholder='Enter AsyncAPI URL'
                fullWidth
                margin='normal'
                variant='outlined'
                onChange={({target: {value}}) => inputsDispatcher({action: 'inputValue', value})}
                value={apiInputs.inputValue}
                InputLabelProps={{
                    shrink: true,
                }}
                InputProps={{
                    onBlur: ({target: {value}}) => {
                        validateURL(value);
                    },
                    endAdornment: urlStateEndAdornment,
                }}
                // 'Give the URL of AsyncAPI endpoint'
                helperText={(isValid.url && isValid.url.message) || 'Click away to validate the URL'}
                error={isInvalidURL}
            />
        );
    }

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
                                    id='Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.Input.type'
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
                                data-testid='input-asyncapi-url'
                                value={ProvideAsyncAPI.INPUT_TYPES.URL}
                                control={<Radio color='primary' />}
                                label={intl.formatMessage({
                                    id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.url.label',
                                    defaultMessage: 'AsyncAPI URL',
                                })}
                            />
                            <FormControlLabel
                                data-testid='input-asyncapi-file'
                                value={ProvideAsyncAPI.INPUT_TYPES.FILE}
                                control={<Radio color='primary' />}
                                label={intl.formatMessage({
                                    id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.file.label',
                                    defaultMessage: 'AsyncAPI File',
                                })}
                            />
                            <FormControlLabel
                                data-testid='input-asyncapi-solace'
                                value={ProvideAsyncAPI.INPUT_TYPES.SOLACE_EVENT_API_PRODUCT_ID}
                                control={<Radio color='primary' />}
                                label={intl.formatMessage({
                                    id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.solace.label',
                                    defaultMessage: 'Solace Event API',
                                })}
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                {isValid.file
                && (
                    <Grid item md={12}>
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
                <Grid item xs={12}>
                    {asyncApiInput}
                </Grid>
                { gatewayVendor === 'solace' && (
                    <Grid item xs={10} md={11}>
                        <Chip
                            data-testid='solace-api-label'
                            label={intl.formatMessage({
                                id: 'Apis.Create.AsyncAPI.Steps.ProvideAsyncAPI.solace.api.label',
                                defaultMessage: 'Identified as Solace Event Portal API',
                            })}
                            icon={<CheckCircleSharpIcon style={{ color: 'green' }} />}
                            variant='outlined'
                            style={{ color: 'green' }}
                        />
                    </Grid>
                )}
                <Grid item xs={2} md={5} />
            </Grid>
        </Root>
    );
}

ProvideAsyncAPI.defaultProps = {
    onValidate: () => { },
};
ProvideAsyncAPI.INPUT_TYPES = {
    URL: 'url',
    FILE: 'file',
    SOLACE_EVENT_API_PRODUCT_ID: 'solaceEventApiProductId',
};
ProvideAsyncAPI.propTypes = {
    apiInputs: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
        inputValue: PropTypes.string,
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
