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
import Alert from 'AppComponents/Shared/Alert';

import { Autocomplete, Typography } from '@mui/material';

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
 * Sub component of API Create using AI Service Provider OpenAPI UI
 *
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
export default function ProvideAIOpenAPI(props) {
    const { inputsDispatcher, onValidate } = props;

    const [llmProviders, setLLMProviders] = useState(null);

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

    function handleGetLLMProviderAPIDefinitionResponse(response, newSelectedModel) {
        const apiDefinition = response.text;

        API.validateOpenAPIByInlineDefinition(apiDefinition).then((res) => {
            if (res.body.isValid) {
                inputsDispatcher({ action: 'llmProviderId', value: newSelectedModel.id });
                inputsDispatcher({ action: 'inputValue', value: apiDefinition });
                inputsDispatcher({ action: 'preSetAPI', value: res.body.info });
            } else {
                throw new Error('Invalid OpenAPI definition');
            }
            onValidate(res.body.isValid);
        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.LLMProvider.API.Definition.validation.failure.error',
                    defaultMessage: 'Error while validating the LLM Provider API Definition',
                }));
            }
            inputsDispatcher({ action: 'inputValue', value: null });
            inputsDispatcher({ action: 'isFormValid', value: false });
            onValidate(false);
        });
    };


    function reset() {
        setSelectedModel(null);
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
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.LLM.Provider.fetch.error',
                    defaultMessage: 'Something went wrong while fetching LLM Providers',
                }));
            }
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
                                noOptionsText='No AI/LLM Service Provider defined'
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
                                            <>
                                                <FormattedMessage
                                                    id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider'
                                                    defaultMessage='AI/LLM Service Provider'
                                                />
                                                <sup className={classes.mandatoryStar}>*</sup>
                                            </>
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.empty'
                                                defaultMessage='No AI/LLM Service Provider defined.'
                                            />
                                        )
                                        }
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.placeholder',
                                            defaultMessage: 'Search AI/LLM Service Provider'
                                        })}
                                        helperText={(
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.helper.text'
                                                defaultMessage='Select AI/LLM Service Provider for the API'
                                            />
                                        )}
                                        margin='dense'
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
                                noOptionsText='No AI/LLM Service Provider selected'
                                getOptionLabel={(option) =>
                                    option.apiVersion
                                }
                                value={selectedModel}
                                onChange={(e, newValue) => {
                                    setSelectedModel(newValue);
                                    if (newValue) {
                                        API.getLLMProviderAPIDefinition(newValue.id)
                                            .then((response) => {
                                                handleGetLLMProviderAPIDefinitionResponse(response, newValue);
                                            }).catch((error) => {
                                                if (error.response) {
                                                    Alert.error(error.response.body.description);
                                                } else {
                                                    Alert.error(intl.formatMessage({
                                                        id: 'Apis.Create.AIAPI.Steps.ProvideAIOpenAPI' +
                                                        '.LLMProvider.API.Definition.fetch.error',
                                                        defaultMessage: 'Something went wrong while ' +
                                                        'fetching LLM Provider API Definition',
                                                    }));
                                                }
                                            });
                                    } else {
                                        inputsDispatcher({ action: 'isFormValid', value: false });
                                    }
                                }}
                                renderOption={(options, option) => (
                                    <li {...options}>
                                        {option.apiVersion}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params}
                                        fullWidth
                                        label={llmProviders.list.length !== 0 ? (
                                            <>
                                                <FormattedMessage
                                                    id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.model'
                                                    defaultMessage='API version'
                                                />
                                                <sup className={classes.mandatoryStar}>*</sup>
                                            </>
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.model.empty'
                                                defaultMessage='No AI/LLM Service Provider selected.'
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
                                                defaultMessage='Select API version for the API'
                                            />
                                        )}
                                        margin='dense'
                                        variant='outlined'
                                        id='APIModelVersion'
                                    />
                                )}
                            />
                        </FormLabel>
                    </FormControl>
                </Grid>
                <Grid container direction='row' justifyContent='flex-end' alignItems='center'>
                    <Grid item>
                        <Typography variant='caption' display='block' gutterBottom>
                            <sup style={{ color: 'red' }}>*</sup>
                            {' '}
                            <FormattedMessage
                                id='Apis.Create.Components.DefaultAPIForm.mandatory.fields'
                                defaultMessage='Mandatory fields'
                            />
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>)}
            {!llmProviders && (
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Typography>
                            <FormattedMessage
                                id='Apis.Create.AIAPI.Steps.ProvideAIOpenAPI.AI.provider.loading'
                                defaultMessage='Loading AI/LLM Service Providers...'
                            />
                        </Typography>
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
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
