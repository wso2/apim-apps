/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import React, { useEffect, useState } from 'react';
import API from 'AppData/api.js';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { FormattedMessage, useIntl } from 'react-intl';
import { Autocomplete } from '@mui/material';
import YAML from 'js-yaml';

import {
    getLinterResultsFromContent
} from "../../../Details/APIDefinition/Linting/Linting";
import ValidationResults from '../../OpenAPI/Steps/ValidationResults';

const PREFIX = 'ProvideAIOpenAPI';

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
 * Sub component of API Create using AI Provider OpenAPI UI
 *
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
export default function ProvideAIOpenAPI(props) {
    const { apiInputs, inputsDispatcher, onValidate, onLinterLineSelect } = props;
    const { inputValue } = apiInputs;

    // If valid value is `null`,that means valid, else an error object will be there
    const [isValid, setValidity] = useState({});
    const [validationErrors, setValidationErrors] = useState([]);
    const [isValidating, setIsValidating] = useState(false);

    const [llmProviders, setLLMProviders] = useState(null);
    // If valid value is `null`,that means valid, else an error object will be there
    const [linterResults, setLinterResults] = useState([]);
    const [isLinting, setIsLinting] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);

    const intl = useIntl();

    function getUniqueProviderList(llmProvidersResponse) {
        if (!llmProvidersResponse) {
            return [];
        }
        const uniqueProviders = [];
        llmProvidersResponse.list.forEach((provider) => {
            if (!uniqueProviders.includes(provider.name)) {
                uniqueProviders.push(provider.name);
            }
        });
        return uniqueProviders;
    }

    function lint(content) {
        // Validate and linting
        setIsLinting(true);
        getLinterResultsFromContent(content).then((results) => {
            if (results) {
                setLinterResults(results);
            } else {
                setLinterResults([]);
            }
        }).finally(() => { setIsLinting(false); });
    }

    function hasJSONStructure(definition) {
        if (typeof definition !== 'string') return false;
        try {
            const result = JSON.parse(definition);
            return result && typeof result === 'object';
        } catch (err) {
            console.log("API definition is in not in JSON format");
            return false;
        }
    }

    function onReceivingAPIdefinition(apiDefinition) {
        setIsValidating(true);
        let validFile = null;
        API.validateOpenAPIByInlineDefinition(apiDefinition)
            .then((response) => {
                const {
                    body: { isValid: isValidFile, info, errors },
                } = response;
                if (isValidFile) {
                    validFile = apiDefinition;
                    inputsDispatcher({ action: 'preSetAPI', value: info });
                    setValidity({ ...isValid, file: null });
                } else {
                    setValidity({
                        ...isValid, file: {
                            message: intl.formatMessage({
                                id: 'Apis.Create.OpenAPI.create.api.openapi.content.validation.failed',
                                defaultMessage: 'OpenAPI content validation failed!'
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
                            id: 'Apis.Create.OpenAPI.create.api.openapi.content.validation.failed',
                            defaultMessage: 'OpenAPI content validation failed!'
                        })
                    }
                });
                console.error(error);
            })
            .finally(() => {
                setIsValidating(false); // Stop the loading animation
                onValidate(validFile !== null); // If there is a valid file then validation has passed
                // If the given file is valid , we set it as the inputValue else set `null`
                inputsDispatcher({ action: 'inputValue', value: apiDefinition });
            });
        inputsDispatcher({ action: 'importingContent', value: apiDefinition });
    }

    function handleGetLLMProviderByIdResponse(response) {
        const {
            body: {
                name,
                apiVersion,
                apiDefinition,
            },
        } = response;
        let formattedContent;
        if (hasJSONStructure(apiDefinition)) {
            formattedContent = JSON.stringify(JSON.parse(apiDefinition), null, 2);
        } else {
            formattedContent = JSON.stringify(YAML.load(apiDefinition), null, 2);
        }
        lint(formattedContent);
        inputsDispatcher({ action: 'llmProviderName', value: name });
        inputsDispatcher({ action: 'llmProviderApiVersion', value: apiVersion });
        onReceivingAPIdefinition(formattedContent);
        onValidate(apiDefinition !== null);
    }


    function reset() {
        setSelectedModel(null);
        setIsLinting(false);
        setLinterResults([]);
        setValidationErrors([]);
        inputsDispatcher({ action: 'importingContent', value: null });
        inputsDispatcher({ action: 'inputValue', value: null });
        inputsDispatcher({ action: 'isFormValid', value: false });
    }

    useEffect(() => {
        reset();
    }, [selectedProvider]);

    useEffect(() => {
        API.getLLMProviders().then((response) => {
            setLLMProviders(response.body);
        }).catch((error) => {
            console.error(error);
        });
    }, []);

    return (
        <Root>
            {llmProviders && (<Grid container>
                <Grid item xs={12} sx={{ mb: 2 }}>
                    <FormControl component='fieldset' sx={{ width: '100%' }}>
                        <FormLabel component='legend' sx={{ width: '100%' }}>
                            <Autocomplete
                                fullWidth
                                id='AI-providers-autocomplete'
                                options={getUniqueProviderList(llmProviders)}
                                noOptionsText='No API Provider defined'
                                value={selectedProvider}
                                onChange={(e, newValue) => {
                                    setSelectedProvider(newValue);
                                }}
                                renderOption={(options, provider) => (
                                    <li {...options}>
                                        {provider}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params}
                                        fullWidth
                                        label={llmProviders.list.length !== 0 ? (
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider'
                                                defaultMessage='API Provider'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.empty'
                                                defaultMessage='No API Provider defined.'
                                            />
                                        )
                                        }
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.placeholder',
                                            defaultMessage: 'Search AI API Provider'
                                        })}
                                        helperText={(
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.helper.text'
                                                defaultMessage='Select AI API Provider for the API'
                                            />
                                        )}
                                        margin='normal'
                                        variant='outlined'
                                        id='APIProvider'
                                    />
                                )}
                            />
                        </FormLabel>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ mb: 2 }}>
                    <FormControl component='fieldset' sx={{ width: '100%' }}>
                        <FormLabel component='legend' sx={{ width: '100%' }}>
                            <Autocomplete
                                fullWidth
                                id='AI-model-autocomplete'
                                options={llmProviders.list.filter((model) => model.name === selectedProvider)}
                                noOptionsText='No API Provider selected'
                                getOptionLabel={(option) =>
                                    option.apiVersion + ' - ' + option.description
                                }
                                value={selectedModel}
                                onChange={(e, newValue) => {
                                    setSelectedModel(newValue);
                                    if (newValue) {
                                        API.getLLMProviderById(newValue.id).then((response) => {
                                            handleGetLLMProviderByIdResponse(response);
                                        }).catch((error) => {
                                            console.error(error);
                                        });
                                    }
                                }}
                                renderOption={(options, option) => (
                                    <li {...options}>
                                        {option.apiVersion + ' - ' + option.description}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params}
                                        fullWidth
                                        label={llmProviders.list.length !== 0 ? (
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.model'
                                                defaultMessage='API version'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.model.empty'
                                                defaultMessage='No API Provider selected.'
                                            />
                                        )
                                        }
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.model.placeholder',
                                            defaultMessage: 'Search API version'
                                        })}
                                        helperText={(
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.model.helper'
                                                defaultMessage='Select API Model version for the API'
                                            />
                                        )}
                                        margin='normal'
                                        variant='outlined'
                                        id='APIModelVersion'
                                    />
                                )}
                            />
                        </FormLabel>
                    </FormControl>
                </Grid>
                <ValidationResults
                    inputValue={inputValue}
                    isValidating={isValidating}
                    isLinting={isLinting}
                    validationErrors={validationErrors}
                    linterResults={linterResults}
                    onLinterLineSelect={onLinterLineSelect}
                />
                <Grid item xs={2} md={5} />
            </Grid>)}
            {!llmProviders && (
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <FormattedMessage
                            id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.empty'
                            defaultMessage='Loading API Providers...'
                        />
                    </Grid>
                </Grid>
            )}
        </Root>
    );
}

ProvideAIOpenAPI.defaultProps = {
    onValidate: () => { },
};

ProvideAIOpenAPI.propTypes = {
    apiInputs: PropTypes.shape({
        type: PropTypes.string,
        inputValue: PropTypes.string,
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
