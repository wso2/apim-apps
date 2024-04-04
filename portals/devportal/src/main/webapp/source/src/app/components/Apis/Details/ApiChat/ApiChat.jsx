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

import React, {
    useEffect,
    useState,
    useContext,
    useRef,
} from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import { FormattedMessage, useIntl } from 'react-intl';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Api from 'AppData/api';
import { CircularProgress, Typography } from '@mui/material';
import Utils from 'AppData/Utils';
import AuthManager from 'AppData/AuthManager';
import ApiChatPoweredBy from './components/ApiChatPoweredBy';
import ApiChatBanner from './components/ApiChatBanner';
import ApiChatExecute from './components/ApiChatExecute';
import ConfigureKeyDrawer from './components/ConfigureKeyDrawer';
import SampleQueryCard from './components/SampleQueryCard';
import ApiChatResponse from './components/ApiChatResponse';

const PREFIX = 'ApiChat';

const classes = {
    tryWithAiMain: `${PREFIX}-tryWithAiMain`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.tryWithAiMain}`]: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '85vh',
        marginRight: theme.spacing(6),
        marginLeft: theme.spacing(2),
    },
}));

/**
 * Renders the API Chat UI.
 * @returns {JSX} API Chat page to render.
 */
const ApiChat = () => {
    const [configureKeyDrawerOpen, setConfigureKeyDrawerOpen] = useState(false);
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const [isEnrichingSpec, setIsEnrichingSpec] = useState(false);
    const [specEnrichmentError, setSpecEnrichmentError] = useState('');
    const [specEnrichmentErrorLevel, setSpecEnrichmentErrorLevel] = useState('');
    const [enrichedSpec, setEnrichedSpec] = useState({});
    const [sampleQueries, setSampleQueries] = useState([]);
    const [inputQuery, setInputQuery] = useState('');
    const [lastQuery, setLastQuery] = useState('');
    const [finalOutcome, setFinalOutcome] = useState('');
    const [executionResults, setExecutionResults] = useState([]);
    const [isExecutionError, setIsExecutionError] = useState(false);
    const [isAgentTerminating, setIsAgentTerminating] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [securityScheme, setSecurityScheme] = useState(null);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [selectedEnvironment, setSelectedEnvironment] = useState(null);

    const user = AuthManager.getUser();
    const apiClient = new Api();
    const { api } = useContext(ApiContext);
    const { settings: { apiChatEnabled, aiAuthTokenProvided } } = useSettingsContext();
    const abortControllerRef = useRef(new AbortController());
    const intl = useIntl();

    const setEnrichmentError = (errorCode) => {
        switch (errorCode) {
            case 'INVALID_SPECIFICATION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.invalidSpecificationError',
                        defaultMessage:
                            'The OpenAPI specification could not be parsed. Ensure you are using a valid specification.',
                    }),
                );
                break;
            case 'INVALID_RESOURCE_PATH':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.invalidResourcePathError',
                        defaultMessage:
                            'The OpenAPI specification contain unsupported resource path definitions.',
                    }),
                );
                break;
            case 'UNSUPPORTED_MEDIA_TYPE':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.unsupportedMediaTypeError',
                        defaultMessage:
                            'The OpenAPI specification includes non-JSON input types which are not currently supported.',
                    }),
                );
                break;
            case 'UNSUPPORTED_SPECIFICATION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.unsupportedSpecificationError',
                        defaultMessage:
                            'The OpenAPI specification includes components that are currently not supported.',
                    }),
                );
                break;
            case 'LLM':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.llmError',
                        defaultMessage: 'Failed to load API Chat.',
                    }),
                );
                break;
            case 'TOKEN_LIMIT_EXCEEDED':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.tokenLimitExceededError',
                        defaultMessage:
                            'The OpenAPI specification exceeds the maximum limit.',
                    }),
                );
                break;
            case 'STACK_OVERFLOW':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.stackOverflowError',
                        defaultMessage:
                            'The OpenAPI specification could not be parsed due to a cyclic reference or the excessive length of the'
                            + ' specification.',
                    }),
                );
                break;
            case 'CONTENT_POLICY_VIOLATION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.contentViolationError',
                        defaultMessage:
                            'The content in the OpenAPI specification violates the Azure OpenAI content policy.',
                    }),
                );
                break;
            case 'LLM_CONNECTION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.llmConnectionError',
                        defaultMessage: 'There was an error connecting to Azure OpenAI.',
                    }),
                );
                break;
            case 'GENERIC':
            default:
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.specEnrichmentError.genericError',
                        defaultMessage: 'An error occurred when loading API Chat.',
                    }),
                );
                break;
        }
    };

    const setExecutionErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'LLM':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.llmError',
                        defaultMessage:
                            'An error occurred during query execution. Try again.',
                    }),
                );
                break;
            case 'CACHING':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.cachingError',
                        defaultMessage:
                            'An error occurred during query execution. Try again later.',
                    }),
                );
                break;
            case 'RESPONSE_PARSING':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.responseParsingError',
                        defaultMessage:
                            'An error occurred while attempting to extract the API response.',
                    }),
                );
                break;
            case 'API_COMMUNICATION':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.apiCommunicationError',
                        defaultMessage:
                            'An error occurred while attempting to establish a connection with your API.',
                    }),
                );
                break;
            case 'TOKEN_LIMIT_EXCEEDED':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.tokenLimitExceededError',
                        defaultMessage:
                            'Execution has been terminated due to exceeding the token limit.',
                    }),
                );
                break;
            case 'INVALID_COMMAND':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.invalidCommandError',
                        defaultMessage: 'An invalid query is provided.',
                    }),
                );
                break;
            case 'CONTENT_POLICY_VIOLATION':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.contentViolationError',
                        defaultMessage:
                            'Your query seems to contain inappropriate content. Please try again with a different query.',
                    }),
                );
                break;
            case 'LLM_CONNECTION':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.llmConnectionError',
                        defaultMessage: 'There was an error connecting to Azure OpenAI.',
                    }),
                );
                break;
            case 'GENERIC':
            default:
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.finalOutcome.genericError',
                        defaultMessage: 'An error occurred during query execution.',
                    }),
                );
                break;
        }
    };

    useEffect(() => {
        if (abortControllerRef.current.signal.aborted) {
            setIsAgentTerminating(true);
        }
    }, [abortControllerRef.current.signal.aborted]);

    useEffect(() => {
        if (isAgentTerminating) {
            setTimeout(() => {
                setIsAgentTerminating(false);
                setIsAgentRunning(false);
            }, 2000);
        }
    }, [isAgentTerminating]);

    const getUnauthorizedErrorMessage = () => {
        return intl.formatMessage({
            id: 'Apis.Details.ApiChat.components.onPremKeyInvalid.error',
            defaultMessage: 'Provided token is invalid. Please use a valid token to start testing.',
        });
    };

    const getTooManyRequestsErrorMessage = () => {
        return intl.formatMessage({
            id: 'Apis.Details.ApiChat.components.throttledOut.error',
            defaultMessage: 'Your request has been throttled out. Please reach out to the administrator for assistance.',
        });
    };

    const getGatewayTimeoutErrorMessage = () => {
        return intl.formatMessage({
            id: 'Apis.Details.ApiChat.components.gatewayTimeout.error',
            defaultMessage: 'The request has timed out. Please try again later.',
        });
    };

    useEffect(() => {
        if (api && api.id && apiChatEnabled && aiAuthTokenProvided && user) {
            setIsEnrichingSpec(true);
            setSpecEnrichmentError('');
            setSpecEnrichmentErrorLevel('');
            const requestId = Utils.generateUUID();
            const enrichSpecPromise = apiClient.enrichOpenApiSpecification(api.id, requestId);
            enrichSpecPromise
                .then((response) => {
                    const { body, status } = response;
                    if (status !== 201) {
                        setIsEnrichingSpec(false);
                        setEnrichmentError(body.code);
                        setSpecEnrichmentErrorLevel('warning');
                    } else {
                        setEnrichedSpec(body.apiSpec);
                        setSampleQueries(body.queries);
                        setIsEnrichingSpec(false);
                    }
                }).catch((error) => {
                    setIsEnrichingSpec(false);
                    const statusCode = error?.response?.status;
                    if (statusCode === 401) { // Hanlde on-prem key vaidation failed scenario
                        setSpecEnrichmentError(getUnauthorizedErrorMessage());
                        setSpecEnrichmentErrorLevel('error');
                    } else if (statusCode === 429) { // Handle throttled out scenario
                        setSpecEnrichmentError(getTooManyRequestsErrorMessage());
                        setSpecEnrichmentErrorLevel('error');
                    } else if (statusCode === 504) { // Handle gateway timeout scenario
                        setSpecEnrichmentError(getGatewayTimeoutErrorMessage());
                        setSpecEnrichmentErrorLevel('error');
                    } else {
                        setEnrichmentError(
                            error?.response?.body?.code || 'GENERIC',
                        );
                        setSpecEnrichmentErrorLevel(error?.response?.body?.level === 'WARN' ? 'warning' : 'error');
                    }
                });
        }
    }, []);

    const handleOpenConfigureKey = () => {
        setConfigureKeyDrawerOpen(true);
    };

    const authTokenNotProvidedWarning = (
        <FormattedMessage
            id='Apis.Details.ApiChat.warning.authTokenMissing'
            defaultMessage={'You must provide a token to start testing. To obtain one, '
                + 'follow the steps provided under {apiChatDocLink} '}
            values={{
                apiChatDocLink: (
                    <a
                        id='api-chat-doc-link'
                        href='https://apim.docs.wso2.com/en/4.3.0/consume/invoke-apis/invoke-apis-using-tools/test-apis-with-apichat/'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Test APIs with API Chat
                        <LaunchIcon
                            style={{ marginLeft: '2px' }}
                            fontSize='small'
                        />
                    </a>
                ),
            }}
        />
    );

    const apiAccessTokenNotFoundWarning = (
        <FormattedMessage
            id='Apis.Details.ApiChat.warning.apiAccessTokenNotFound'
            defaultMessage='You must provide an API access token. Configure one by navigating to {configureKeyLink}'
            values={{
                configureKeyLink: (
                    <Link
                        onClick={() => {
                            setConfigureKeyDrawerOpen(true);
                        }}
                    >
                        Configure Key
                        <LaunchIcon
                            style={{ marginLeft: '2px' }}
                            fontSize='small'
                        />
                    </Link>
                ),
            }}
        />
    );

    const handleGoBack = () => {
        setLastQuery('');
        setExecutionResults([]);
        setFinalOutcome('');
    };

    const handleConfigChange = ({
        newAccessToken, newSecurityScheme, newUsername, newPassword, newSelectedEnvironment,
    }) => {
        if (newAccessToken !== undefined) setAccessToken(newAccessToken);
        if (newSecurityScheme !== undefined) setSecurityScheme(newSecurityScheme);
        if (newUsername !== undefined) setUsername(newUsername);
        if (newPassword !== undefined) setPassword(newPassword);
        if (newSelectedEnvironment !== undefined) setSelectedEnvironment(newSelectedEnvironment);
    };

    const getEnvironmentURLs = (endpointURLs, environmentName) => {
        const environment = endpointURLs.find((env) => env.environmentName === environmentName);
        return environment ? environment.URLs : {};
    };

    const invokeAPI = async (generatedRequest) => {
        const { method, path, inputs } = generatedRequest;
        const { parameters, requestBody } = inputs || {};
        const usedKeys = [];
        const resolvedPath = Object.entries(parameters || {}).reduce((acc, [key, value]) => {
            if (acc.includes(`{${key}}`)) {
                usedKeys.push(key);
                return acc.replace(`{${key}}`, encodeURIComponent(value));
            }
            return acc;
        }, path);
        const remainingParameters = Object.keys(parameters || {}).reduce((acc, key) => {
            if (!usedKeys.includes(key)) {
                acc[key] = parameters[key];
            }
            return acc;
        }, {});

        const queryString = new URLSearchParams(remainingParameters).toString();
        const fullPath = queryString ? `${resolvedPath}?${queryString}` : resolvedPath;
        const environmentURLs = getEnvironmentURLs(api.endpointURLs, selectedEnvironment);
        const url = `${environmentURLs.https}${fullPath}`;

        const headers = {
            'Content-Type': 'application/json',
        };

        if (securityScheme === 'OAUTH') {
            headers.Authorization = `Bearer ${accessToken}`;
        } else if (securityScheme === 'BASIC') {
            headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
        } else if (securityScheme === 'API-KEY') {
            headers.ApiKey = accessToken;
        }

        const fetchOptions = {
            method,
            headers,
            ...(method !== 'GET' && requestBody !== null && { body: JSON.stringify(requestBody) }),
        };

        try {
            const response = await fetch(url, fetchOptions);
            const contentType = response.headers.get('Content-Type');

            // Check if response is JSON
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json().catch(() => ({}));
                return {
                    code: response.status,
                    path: fullPath,
                    headers: response.headers,
                    body: data, // Return the JSON data
                };
            }

            // Check if response is XML
            if (contentType && contentType.includes('application/xml')) {
                const text = await response.text();
                return {
                    code: response.status,
                    path: fullPath,
                    headers: response.headers,
                    body: text, // Return the XML data
                };
            }

            // If response is neither JSON nor XML
            const text = await response.text().catch(() => 'Unable to render this Content-Type');
            return {
                code: response.status,
                path: fullPath,
                headers: response.headers,
                body: text,
            };
        } catch (error) {
            return {
                code: 500,
                path: fullPath,
                headers: {},
                body: {
                    description: 'API invocation failed',
                    error: error.message,
                },
            };
        }
    };

    const sendSubsequentRequest = async (requestId, resource) => {
        const executionResponseForAiAgent = await invokeAPI(resource);
        setExecutionResults((prevState) => {
            return [
                ...prevState,
                {
                    ...executionResponseForAiAgent,
                    method: resource.method,
                },
            ];
        });
        const executePromise = apiClient.runAiAgentSubsequentIterations(
            api.id,
            requestId,
            executionResponseForAiAgent,
        );
        executePromise.then((response) => {
            const { data } = response;
            if (response.status === 201) {
                if (abortControllerRef.current.signal.aborted) {
                    return;
                }
                if (data.code) {
                    setIsExecutionError(true);
                    setExecutionErrorMessage(data.code);
                    setIsAgentRunning(false);
                } else {
                    const { body } = response;
                    switch (body.taskStatus) {
                        case 'IN_PROGRESS':
                            sendSubsequentRequest(requestId, body.resource);
                            break;
                        case 'COMPLETED':
                            if (body.result && body.result !== '') {
                                setFinalOutcome(body.result);
                            } else {
                                setFinalOutcome(
                                    intl.formatMessage({
                                        id: 'Apis.Details.ApiChat.ApiChat.subsequentRequset.finalOutcome.taskCompleted',
                                        defaultMessage: 'Task completed',
                                    }),
                                );
                            }
                            setIsAgentRunning(false);
                            break;
                        default:
                            setIsExecutionError(true);
                            setFinalOutcome(
                                intl.formatMessage({
                                    id: 'Apis.Details.ApiChat.components.finalOutcome.taskExecutionDefault',
                                    defaultMessage: 'An error occurred during query execution.',
                                }),
                            );
                            setIsAgentRunning(false);
                    }
                }
            } else {
                setIsExecutionError(true);
                setExecutionErrorMessage(response?.data?.code);
                setIsAgentRunning(false);
            }
        }).catch((error) => {
            setIsExecutionError(true);
            const statusCode = error?.response?.status;
            if (statusCode === 401) { // Hanlde on-prem key vaidation failed scenario
                setExecutionErrorMessage(getUnauthorizedErrorMessage());
            } else if (statusCode === 429) { // Handle throttled out scenario
                setExecutionErrorMessage(getTooManyRequestsErrorMessage());
            } else if (statusCode === 504) { // Handle gateway timeout scenario
                setExecutionErrorMessage(getGatewayTimeoutErrorMessage());
            } else {
                const errorMessage = error?.response?.data || 'An error occurred during query execution.';
                setExecutionErrorMessage(errorMessage);
            }
            setIsAgentRunning(false);
        });
    };

    const sendInitialRequest = (query) => {
        setIsExecutionError(false);
        setExecutionResults(() => {
            return [];
        });
        if (query.length < 1) {
            setFinalOutcome(
                intl.formatMessage({
                    id: 'Apis.Details.ApiChat.components.finalOutcome.noQuery',
                    defaultMessage: 'An invalid query is provided.',
                }),
            );
            return;
        }
        setIsAgentRunning(true);
        setFinalOutcome('');
        const requestId = Utils.generateUUID();
        const executePromise = apiClient.runAiAgentInitialIteration(
            api.id,
            requestId,
            query,
            enrichedSpec,
        );
        executePromise.then((response) => {
            const { data } = response;
            if (response.status === 201) {
                if (abortControllerRef.current.signal.aborted) {
                    return;
                }
                if (data.code) {
                    setIsExecutionError(true);
                    setExecutionErrorMessage(data.code);
                    setIsAgentRunning(false);
                } else {
                    const { body } = response;
                    switch (body.taskStatus) {
                        case 'IN_PROGRESS':
                            sendSubsequentRequest(requestId, body.resource);
                            break;
                        case 'COMPLETED':
                            if (body.result && body.result !== '') {
                                setFinalOutcome(body.result);
                            } else {
                                setFinalOutcome(
                                    intl.formatMessage({
                                        id: 'Apis.Details.ApiChat.ApiChat.initialRequest.finalOutcome.taskCompletedOneItr',
                                        defaultMessage: 'Task completed in 1 iteration.',
                                    }),
                                );
                            }
                            setIsAgentRunning(false);
                            break;
                        default:
                            setIsExecutionError(true);
                            setFinalOutcome(
                                intl.formatMessage({
                                    id: 'Apis.Details.ApiChat.components.finalOutcome.taskExecutionDefault',
                                    defaultMessage: 'An error occurred during query execution.',
                                }),
                            );
                            setIsAgentRunning(false);
                    }
                }
            } else {
                setIsExecutionError(true);
                setExecutionErrorMessage(response?.data?.code);
                setIsAgentRunning(false);
            }
        }).catch((error) => {
            setIsExecutionError(true);
            const statusCode = error?.response?.status;
            if (statusCode === 401) { // Hanlde on-prem key vaidation failed scenario
                setExecutionErrorMessage(getUnauthorizedErrorMessage());
            } else if (statusCode === 429) { // Handle throttled out scenario
                setExecutionErrorMessage(getTooManyRequestsErrorMessage());
            } else if (statusCode === 504) { // Handle gateway timeout scenario
                setExecutionErrorMessage(getGatewayTimeoutErrorMessage());
            } else {
                const errorMessage = error?.response?.data || 'An error occurred during query execution.';
                setExecutionErrorMessage(errorMessage);
            }
            setIsAgentRunning(false);
        });
    };

    const handleStopAndReExecute = () => {
        if (isAgentRunning) {
            abortControllerRef.current.abort();
            setFinalOutcome(
                intl.formatMessage({
                    id: 'Apis.Details.ApiChat.components.finalOutcome.executionTerminated',
                    defaultMessage: 'Execution was terminated.',
                }),
            );
            setExecutionResults([]);
            setIsAgentRunning(false);
        } else {
            abortControllerRef.current = new AbortController();
            const query = lastQuery;
            sendInitialRequest(query);
        }
    };

    const handleCopyClick = (sampleQuery) => {
        if (!isAgentRunning) {
            setInputQuery(sampleQuery);
        }
        navigator.clipboard.writeText(sampleQuery);
    };

    const handleQueryChange = (event) => {
        const { value } = event.target;
        setInputQuery(value);
    };

    const handleExecute = async () => {
        if (inputQuery.length !== 0) {
            abortControllerRef.current = new AbortController();
            const query = inputQuery;
            setInputQuery('');
            setLastQuery(inputQuery);
            sendInitialRequest(query);
        }
    };

    const handleExecuteSampleQuery = async (query) => {
        if (!isAgentRunning) {
            abortControllerRef.current = new AbortController();
            setInputQuery('');
            setLastQuery(query);
            sendInitialRequest(query);
        }
    };

    return (
        <Root>
            <Box className={classes.tryWithAiMain}>
                <Box sx={{ flexGrow: 1 }}>
                    {apiChatEnabled && aiAuthTokenProvided && (
                        <ConfigureKeyDrawer
                            isDrawerOpen={configureKeyDrawerOpen}
                            updateDrawerOpen={setConfigureKeyDrawerOpen}
                            onConfigChange={handleConfigChange}
                        />
                    )}
                    <ApiChatPoweredBy
                        openConfigureKey={handleOpenConfigureKey}
                        goBack={handleGoBack}
                        disableGoBack={isAgentRunning || lastQuery === ''}
                        disableConfigureKey={!apiChatEnabled || !aiAuthTokenProvided || specEnrichmentError}
                    />
                    {(isAgentRunning || lastQuery || finalOutcome) && (
                        <ApiChatResponse
                            lastQuery={lastQuery}
                            executionResults={executionResults}
                            finalOutcome={finalOutcome}
                            isAgentRunning={isAgentRunning}
                            isAgentTerminating={isAgentTerminating}
                            isExecutionErro={isExecutionError}
                        />
                    )}
                    {!lastQuery && (
                        <ApiChatBanner />
                    )}
                    {!isAgentRunning && !lastQuery && !finalOutcome && sampleQueries && sampleQueries.length > 0 && (
                        <Box display='flex' ml={3} mt={3}>
                            <Grid container direction='row' spacing={3}>
                                {sampleQueries && sampleQueries.map((queryData) => {
                                    const gridVal = sampleQueries.length === 2 ? 6 : 4;
                                    return (
                                        <Grid
                                            key={queryData.scenario}
                                            item
                                            xs={12}
                                            md={gridVal}
                                        >
                                            <SampleQueryCard
                                                onExecuteClick={handleExecuteSampleQuery}
                                                disabled={
                                                    !apiChatEnabled
                                            || !aiAuthTokenProvided
                                            || !securityScheme
                                            || !(securityScheme && (accessToken || password))
                                                }
                                                queryData={queryData}
                                                onCopyClick={handleCopyClick}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    )}
                </Box>
                <Box>
                    <Box display='flex' alignItems='center' flexDirection='column' marginTop={1}>
                        {/* Handle prepare call executing scenario */}
                        {isEnrichingSpec && (
                            <Box display='flex' justifyContent='center'>
                                <CircularProgress size={20} />
                                <Typography variant='body1' sx={{ paddingLeft: '5px' }}>
                                    <FormattedMessage
                                        id='Apis.Details.ApiChat.ApiChat.loadingSpecEnrichmentMessage'
                                        defaultMessage='We are in the process of preparing the API specification for API Chat.'
                                    />
                                </Typography>
                            </Box>
                        )}
                        {/* Handle prepare call failed scenario */}
                        {specEnrichmentError && specEnrichmentErrorLevel && (
                            <Alert severity={specEnrichmentErrorLevel}>
                                <Typography variant='body1'>
                                    {specEnrichmentError}
                                </Typography>
                            </Alert>
                        )}
                        {/* Handle auth token not provided scenario */}
                        {!aiAuthTokenProvided && (
                            <Alert severity='warning'>
                                <Typography variant='body1'>
                                    {authTokenNotProvidedWarning}
                                </Typography>
                            </Alert>
                        )}
                        {/* Handle not logged in scenario */}
                        {!user && (
                            <Alert severity='info'>
                                <Typography variant='body1'>
                                    <FormattedMessage
                                        id='Apis.Details.ApiChat.warning.notSignedIn'
                                        defaultMessage='You must sign in if you wish to interact with API Chat bot.'
                                    />
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                    <Box display='flex' alignItems='center' flexDirection='column' marginTop={1}>
                        {(!securityScheme || !(securityScheme && (accessToken || password)))
                        && aiAuthTokenProvided && user && !specEnrichmentError && !isEnrichingSpec && (
                            <Alert severity='warning'>
                                <Typography variant='body1'>
                                    {apiAccessTokenNotFoundWarning}
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                    <Box sx={{ ml: 7, mr: 7 }}>
                        <ApiChatExecute
                            isAgentRunning={isAgentRunning}
                            isAgentTerminating={isAgentTerminating}
                            lastQuery={lastQuery}
                            handleStopAndReExecute={handleStopAndReExecute}
                            inputQuery={inputQuery}
                            handleQueryChange={handleQueryChange}
                            isEnrichingSpec={isEnrichingSpec}
                            specEnrichmentError={specEnrichmentError}
                            handleExecute={handleExecute}
                            isExecuteDisabled={
                                !apiChatEnabled
                            || !aiAuthTokenProvided
                            || !securityScheme
                            || !(securityScheme && (accessToken || password))
                            }
                        />
                    </Box>
                </Box>
            </Box>
        </Root>
    );
};

export default ApiChat;
