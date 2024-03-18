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
// useContext, useState, useRef, useMemo, useEffect,
// import { Box } from '@material-ui/core';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
// import API from 'AppData/api';
// import { AxiosError } from 'axios';
// import cloneDeep from 'lodash.clonedeep';
// import API from 'AppData/api';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
// import { FormattedMessage } from 'react-intl';
// import Alert from 'AppComponents/Shared/Alert';
import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import { FormattedMessage, useIntl } from 'react-intl';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';
import Api from 'AppData/api';
import { app } from 'Settings';
import { CircularProgress, Typography } from '@mui/material';
import Utils from 'AppData/Utils';
import Progress from 'AppComponents/Shared/Progress';
import Input from '@mui/material/Input';
import ApiChatPoweredBy from './components/ApiChatPoweredBy';
import ApiChatBanner from './components/ApiChatBanner';
import ApiChatExecute from './components/ApiChatExecute';
import ConfigureKeyDrawer from './components/ConfigureKeyDrawer';
import SampleQueryCard from './components/SampleQueryCard';
// @ts-ignore
// import SamplePrepareResponse from './data/mockData.json';
// import ApiChatApi from './data/ApiChatApi';
// import ResultsHeading, {
//     ExecutionResult,
// } from './components/ResultsHeading';
// import { ApiContext } from '../ApiContext';

const PREFIX = 'ApiChat';

const classes = {
    tryWithAiMain: `${PREFIX}-tryWithAiMain`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.tryWithAiMain}`]: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(1),
    },
}));

// enum TaskStatus {
//   EXPIRED_TOKEN = 'EXPIRED_TOKEN',
//   IN_PROGRESS = 'IN_PROGRESS',
//   COMPLETED = 'COMPLETED',
//   TERMINATED = 'TERMINATED',
// }

// interface Task {
//   taskStatus: TaskStatus;
//   iteration: number;
// }

// interface IncomingData {
//   resource: {
//     inputs: {
//       requestBody: any;
//     };
//   };
//   output: {
//     code: number;
//     headers: { [key: string]: any };
//     body: any;
//   };
// }

// interface RearrangedData {
//   inputs: {
//     requestBody: any;
//   };
//   output: {
//     code: number;
//     headers: { [key: string]: any };
//     body: any;
//   };
// }

// /**
//  * Rearranges the incoming data to a format that can be used by the UI.
//  * @param {JSON} initialData Incoming data from the API.
//  * @returns {JSON} Rearranged data.
//  */
// function rearrangeData(initialData) {
//     const rearrangedData = {
//         inputs: {
//             requestBody: initialData.resource.inputs.requestBody,
//         },
//         output: {
//             code: initialData.output.code,
//             headers: initialData.output.headers,
//             body: initialData.output.body,
//         },
//     };
//     return rearrangedData;
// }

// export interface SampleQuery {
//   scenario: string;
//   query: string;
// }

/**
 * Renders the API Chat UI.
 * @returns {JSX} API Chat page to render.
 */
const ApiChat = () => {
    // const intl = useIntl();
    const [configureKeyDrawerOpen, setConfigureKeyDrawerOpen] = useState(false);
    // const [testAccessToken, setTestAccessToken] = useState('');
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const [agentAvailabilityStatus, setAgentAvailabilityStatus] = useState('PENDING'); // 'PENDING' | 'ACTIVE' | 'INACTIVE'
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
    // const [request, setRequest] = useState({});
    // const [isAgentTerminating, setIsAgentTerminating] = useState(false);

    const apiClient = new Api();
    const { api } = useContext(ApiContext);
    const { settings: { isApiChatEnabled, isAIFeatureAuthTokenProvided } } = useSettingsContext();
    const abortControllerRef = useRef(new AbortController());
    const intl = useIntl();

    useEffect(() => {
        if (isApiChatEnabled === true && isAIFeatureAuthTokenProvided) {
            const isApiChatAvailablePromise = apiClient.pingApiChatApi();
            isApiChatAvailablePromise.then((response) => {
                if (response.status === 200) {
                    setAgentAvailabilityStatus('ACTIVE');
                } else {
                    setAgentAvailabilityStatus('INACTIVE');
                }
            }).catch((error) => {
                console.log(error);
                setAgentAvailabilityStatus('INACTIVE');
            });
        } else {
            setAgentAvailabilityStatus('INACTIVE');
        }
    }, [isApiChatEnabled]);

    const setEnrichmentError = (errorCode) => {
        switch (errorCode) {
            case 'INVALID_SPECIFICATION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.invalidSpecificationError',
                        defaultMessage:
                  'The OpenAPI specification could not be parsed. Ensure you are using a valid specification.',
                    }),
                );
                break;
            case 'INVALID_RESOURCE_PATH':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.invalidResourcePathError',
                        defaultMessage:
                  'The OpenAPI specification contain unsupported resource path definitions.',
                    }),
                );
                break;
            case 'UNSUPPORTED_MEDIA_TYPE':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.unsupportedMediaTypeError',
                        defaultMessage:
                  'The OpenAPI specification includes non-JSON input types which are not currently supported.',
                    }),
                );
                break;
            case 'UNSUPPORTED_SPECIFICATION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.unsupportedSpecificationError',
                        defaultMessage:
                  'The OpenAPI specification includes components that are currently not supported.',
                    }),
                );
                break;
            case 'LLM':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.llmError',
                        defaultMessage: 'Failed to load API Chat.',
                    }),
                );
                break;
            case 'TOKEN_LIMIT_EXCEEDED':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.tokenLimitExceededError',
                        defaultMessage:
                  'The OpenAPI specification exceeds the maximum limit.',
                    }),
                );
                break;
            case 'STACK_OVERFLOW':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.stackOverflowError',
                        defaultMessage:
                  'The OpenAPI specification could not be parsed due to a cyclic reference or the excessive length of the'
                  + ' specification.',
                    }),
                );
                break;
            case 'CONTENT_POLICY_VIOLATION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.contentViolationError',
                        defaultMessage:
                  'The content in the OpenAPI specification violates the Azure OpenAI content policy.',
                    }),
                );
                break;
            case 'LLM_CONNECTION':
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.llmConnectionError',
                        defaultMessage: 'There was an error connecting to Azure OpenAI.',
                    }),
                );
                break;
            case 'GENERIC':
            default:
                setSpecEnrichmentError(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.specEnrichmentError.genericError',
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
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.llmError',
                        defaultMessage:
                  'An error occurred during query execution. Try again.',
                    }),
                );
                break;
            case 'CACHING':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.cachingError',
                        defaultMessage:
                  'An error occurred during query execution. Try again later.',
                    }),
                );
                break;
            case 'RESPONSE_PARSING':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.responseParsingError',
                        defaultMessage:
                  'An error occurred while attempting to extract the API response.',
                    }),
                );
                break;
            case 'API_COMMUNICATION':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.apiCommunicationError',
                        defaultMessage:
                  'An error occurred while attempting to establish a connection with your API.',
                    }),
                );
                break;
            case 'TOKEN_LIMIT_EXCEEDED':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.tokenLimitExceededError',
                        defaultMessage:
                  'Execution has been terminated due to exceeding the token limit.',
                    }),
                );
                break;
            case 'INVALID_COMMAND':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.invalidCommandError',
                        defaultMessage: 'An invalid query is provided.',
                    }),
                );
                break;
            case 'CONTENT_POLICY_VIOLATION':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.contentViolationError',
                        defaultMessage:
                  'Your query seems to contain inappropriate content. Please try again with a different query.',
                    }),
                );
                break;
            case 'LLM_CONNECTION':
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.llmConnectionError',
                        defaultMessage: 'There was an error connecting to Azure OpenAI.',
                    }),
                );
                break;
            case 'GENERIC':
            default:
                setFinalOutcome(
                    intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.genericError',
                        defaultMessage: 'An error occurred during query execution.',
                    }),
                );
                break;
        }
    };

    useEffect(() => {
        if (api.id && agentAvailabilityStatus === 'ACTIVE') {
            setIsAgentRunning(true);
            setIsEnrichingSpec(true);
            setSpecEnrichmentError('');
            setSpecEnrichmentErrorLevel('');
            const requestId = Utils.generateUUID();
            const enrichSpecPromise = apiClient.enrichOpenApiSpecification(requestId, api.id);
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
                    setEnrichmentError(
                        error?.response?.body?.code,
                        // error?.response?.body?.message || 'Error encountered while preparing the API specification for API Chat.',
                    );
                    setSpecEnrichmentErrorLevel(error?.response?.body?.level === 'WARN' ? 'warning' : 'error');
                });
            setIsAgentRunning(false);
        }
    }, [agentAvailabilityStatus]);

    const handleOpenConfigureKey = () => {
        setConfigureKeyDrawerOpen(true);
    };

    const authTokenNotProvidedWarning = (
        <FormattedMessage
            id='Apis.Details.ApiChat.warning.authTokenMissing'
            defaultMessage={'You must provide an auth token to start testing. To obtain one, '
            + 'follow the steps provided under {apiChatDocLink} '}
            values={{
                apiChatDocLink: (
                    <Link
                        onClick={() => {
                            window.location.href = 'https://apim.docs.wso2.com/en/latest/get-started/overview/';
                        }}
                    >
                        Test APIs with API Chat
                        <LaunchIcon
                            style={{ marginLeft: '2px' }}
                            fontSize='small'
                        />
                    </Link>
                ),
            }}
        />
    );

    while (agentAvailabilityStatus === 'PENDING') {
        return <Progress />;
    }

    if (agentAvailabilityStatus === 'INACTIVE' && isAIFeatureAuthTokenProvided) {
        return (
            <>
                <Box display='flex' justifyContent='space-evenly' mt={20}>
                    <img
                        alt='API Chat'
                        src={`${app.context}/site/public/images/ai/ApiChatNotAvailable.svg`}
                    />
                </Box>
                <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    <FormattedMessage
                        id='Apis.Details.ApiChat.ApiChatNotAvailable'
                        defaultMessage='API Chat is not available at the moment. Please try again later.'
                    />
                </Typography>
            </>
        );
    }

    const handleGoBack = () => {
        setLastQuery('');
        setExecutionResults([]);
        setFinalOutcome('');
    };

    const getDummyApiInvocationResult = (generatedRequest) => {
        const responseCode = generatedRequest.method === 'POST' ? 201 : 200;
        return {
            code: responseCode,
            path: generatedRequest.path,
            headers: {},
            body: {
                description: 'API invocation successful',
            },
        };
    };

    const sendSubsequentRequest = async (requestId, resource) => {
        const dummyResponse = getDummyApiInvocationResult(resource);
        const executePromise = apiClient.runAiAgentSubsequentIterations(
            requestId,
            dummyResponse,
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
                                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.taskCompletedOneItr',
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
                                    id: 'modules.testComponent.TryWithAIViewer.finalOutcome.taskExecutionDefault',
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
            setExecutionErrorMessage((error).response?.data?.code);
            setIsAgentRunning(false);
        });
    };

    const sendInitialRequest = async (query) => {
        setIsExecutionError(false);
        setExecutionResults([]);
        // setTrackingId('');
        // setExpandedPanel([]);
        // setResultView('summary');
        if (query.length < 1) {
            setFinalOutcome(
                intl.formatMessage({
                    id: 'modules.testComponent.TryWithAIViewer.finalOutcome.noQuery',
                    defaultMessage: 'An invalid query is provided.',
                }),
            );
            return;
        }
        setIsAgentRunning(true);
        setFinalOutcome('');
        const requestId = Utils.generateUUID();
        const executePromise = apiClient.runAiAgentInitialIteration(
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
                            console.log(body.resource);
                            sendSubsequentRequest(requestId, body.resource);
                            break;
                        case 'COMPLETED':
                            if (body.result && body.result !== '') {
                                setFinalOutcome(body.result);
                            } else {
                                setFinalOutcome(
                                    intl.formatMessage({
                                        id: 'modules.testComponent.TryWithAIViewer.finalOutcome.taskCompletedOneItr',
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
                                    id: 'modules.testComponent.TryWithAIViewer.finalOutcome.taskExecutionDefault',
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
            setExecutionErrorMessage((error).response?.data?.code);
            setIsAgentRunning(false);
        });
    };

    const handleStopAndReExecute = async () => {
        if (isAgentRunning) {
            abortControllerRef.current.abort();
            setFinalOutcome(
                intl.formatMessage({
                    id: 'modules.testComponent.TryWithAIViewer.finalOutcome.executionTerminated',
                    defaultMessage: 'Execution was terminated.',
                }),
            );
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

    // useEffect(() => {
    //     if (abortControllerRef.current.signal.aborted) {
    //         setIsAgentTerminating(true);
    //     }
    // }, [abortControllerRef.current.signal.aborted]);

    // useEffect(() => {
    //     if (isAgentTerminating) {
    //         setTimeout(() => {
    //             setIsAgentTerminating(false);
    //             setIsAgentRunning(false);
    //         }, 2000);
    //     }
    // }, [isAgentTerminating]);

    const handleExecute = async () => {
        abortControllerRef.current = new AbortController();
        const query = inputQuery;
        setInputQuery('');
        setLastQuery(inputQuery);
        sendInitialRequest(query);
    };

    const handleExecuteSampleQuery = async (query) => {
        if (!isAgentRunning) {
            abortControllerRef.current = new AbortController();
            setInputQuery('');
            setLastQuery(query);
            sendInitialRequest(query);
        }
    };

    // useEffect(() => {
    //     if (executionResults.length > 0) {
    //         setExpandedPanel([executionResults[executionResults.length - 1].id]);
    //     }
    // }, []);

    return (
        <Root>
            <Box className={classes.tryWithAiMain} sx={{ mr: 5 }}>
                {isAIFeatureAuthTokenProvided && (
                    <ConfigureKeyDrawer
                        isDrawerOpen={configureKeyDrawerOpen}
                        updateDrawerOpen={setConfigureKeyDrawerOpen}
                    />
                )}
                <ApiChatPoweredBy
                    openConfigureKey={handleOpenConfigureKey}
                    goBack={handleGoBack}
                    disableGoBack={isAgentRunning || lastQuery === ''}
                    // openSampleQueries={handleOpenSampleQueries}
                    // showSampleQueries={
                    //     lastQuery !== '' || isAgentRunning || finalOutcome !== ''
                    // }
                />
                {!lastQuery && (
                    <ApiChatBanner />
                )}
                {!isAgentRunning && !lastQuery && !finalOutcome && sampleQueries && sampleQueries.length > 0
                    ? (
                        <Box display='flex' margin={5}>
                            <Grid container direction='row' spacing={3}>
                                {sampleQueries
                                && sampleQueries.map((queryData) => {
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
                                                // disabled={isAgentRunning}
                                                queryData={queryData}
                                                onCopyClick={handleCopyClick}
                                                // boxShadow='dark'
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    ) : (
                        <Box display='flex' alignItems='center' flexDirection='column' marginTop={20}>
                            {/* Handle prepare call executing scenario */}
                            {isEnrichingSpec && (
                                <Box display='flex' justifyContent='center'>
                                    <CircularProgress size={20} />
                                    <Typography variant='body1' sx={{ paddingLeft: '5px' }}>
                                        <FormattedMessage
                                            id='Apis.Details.ApiChat.ApiChat.loadingSpecEnrichmentMessage'
                                            defaultMessage='We are in the process of preparing the API specification
                                    for API Chat.'
                                        />
                                    </Typography>
                                </Box>
                            )}
                            {/* Handle prepare call failed scenario */}
                            {specEnrichmentError && specEnrichmentErrorLevel && (
                                <Alert severity={specEnrichmentErrorLevel}>
                                    {specEnrichmentError}
                                </Alert>
                            )}
                            {/* Handle auth token not provided scenario */}
                            {(!isAIFeatureAuthTokenProvided || !isApiChatEnabled) && (
                                <Alert severity='warning'>
                                    {authTokenNotProvidedWarning}
                                </Alert>
                            )}
                        </Box>
                    )}
                {'executionResults ' + executionResults + 'isExecutionError >> '
                + isExecutionError + 'finalOutcomee >> ' + finalOutcome}
                {(isAgentRunning || lastQuery || finalOutcome) && (
                    <Input
                        disableUnderline
                        defaultValue={lastQuery}
                    />
                )}
                <ApiChatExecute
                    isAgentRunning={isAgentRunning}
                    isAgentTerminating={false}
                    lastQuery={lastQuery}
                    handleStopAndReExecute={handleStopAndReExecute}
                    enrichedSpec={enrichedSpec}
                    inputQuery={inputQuery}
                    handleQueryChange={handleQueryChange}
                    isEnrichingSpec={isEnrichingSpec}
                    handleExecute={handleExecute}
                    // isAgentRunning={isAgentRunning}
                    // isAgentTerminating={isAgentTerminating}
                    // lastQuery={lastQuery}
                    // handleStopAndReExecute={handleStopAndReExecute}
                    // enrichedSpec={enrichedSpec}
                    // inputQuery={inputQuery}
                    // handleQueryChange={handleQueryChange}
                    // isEnrichingSpec={isEnrichingSpec}
                    // handleExecute={handleExecute}
                />
            </Box>
        </Root>
    );
};

export default ApiChat;
