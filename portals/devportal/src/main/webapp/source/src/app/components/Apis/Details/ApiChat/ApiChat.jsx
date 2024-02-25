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

import React, { useState } from 'react';
// useContext, useState, useRef, useMemo, useEffect,
// import { Box } from '@material-ui/core';
import Box from '@mui/material/Box';
// import { useIntl } from 'react-intl';
// import API from 'AppData/api';
// import { AxiosError } from 'axios';
// import cloneDeep from 'lodash.clonedeep';
// import API from 'AppData/api';
// import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
// import { FormattedMessage } from 'react-intl';
// import Alert from 'AppComponents/Shared/Alert';
import useStyles from './ApiChat.styles';
import ApiChatPoweredBy from './components/ApiChatPoweredBy';
import ApiChatBanner from './components/ApiChatBanner';
import ApiChatExecute from './components/ApiChatExecute';
import ConfigureKeyDrawer from './components/ConfigureKeyDrawer';
// import SamplePrepareResponse from './data/mockData.json';
// import ApiChatApi from './data/ApiChatApi';
// import ResultsHeading, {
//     ExecutionResult,
// } from './components/ResultsHeading';
// import { ApiContext } from '../ApiContext';

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
    const classes = useStyles();
    // const intl = useIntl();
    const [configureKeyDrawerOpen, setConfigureKeyDrawerOpen] = useState(true);

    // const [resultView, setResultView] = useState<string | null>('summary');
    // const [expandedPanel, setExpandedPanel] = useState<number[] | false>(false);
    // const [inputQuery, setInputQuery] = useState<string>('');
    // const [lastQuery, setLastQuery] = useState<string>('');
    // const [executionResults, setExecutionResults] = useState<ExecutionResult[]>(
    //   []
    // );
    // const [isExecutionError, setIsExecutionError] = useState<boolean>(false);
    // const [finalOutcome, setFinalOutcome] = useState<string>('');
    // const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
    // const [isAgentTerminating, setIsAgentTerminating] = useState<boolean>(false);
    // const [isEnrichingSpec, setIsEnrichingSpec] = useState<boolean>(false);
    // const [specEnrichmentError, setSpecEnrichmentError] = useState<string>('');
    // const [specEnrichmentErrorLevel, setSpecEnrichmentErrorLevel] = useState<string>('');
    // const [taskData, setTaskData] = useState<Task>();
    // const [enrichedSpec, setEnrichedSpec] = useState<JSON>();
    // const [sampleQueries, setSampleQueries] = useState<SampleQuery[]>([]);
    // const [trackingId, setTrackingId] = useState<string>('');

    // const isTokenExpired = useRef(false);
    // const abortControllerRef = useRef(new AbortController());

    // const { api } = useContext(ApiContext);
    // const [selectedEndpoint, setSelectedEndpoint] = useState((api.endpointURLs && api.endpointURLs.length > 0)
    //     ? api.endpointURLs[0]
    //     : null);
    // const selectedEndpoint = (api.endpointURLs && api.endpointURLs.length > 0)
    //     ? api.endpointURLs[0]
    //     : null;
    // const [swagger, setSwagger] = useState();
    // const apiEndpoint = selectedEndpoint ? selectedEndpoint.URLs.https
    //   || selectedEndpoint.URLs.http : '';

    // useEffect(() => {
    //     const restApi = new API();
    //     restApi.getSwaggerByAPIIdAndEnvironment(api.id, selectedEndpoint.environmentName)
    //         .then((swaggerResponse) => {
    //             setSwagger(swaggerResponse.obj);
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //             Alert.error(
    //                 <FormattedMessage
    //                     id='Apis.Details.ApiChat.ApiChat.errorFetchingSwagger'
    //                     defaultMessage='Error while fetching the API definition'
    //                 />,
    //             );
    //         });
    // }, []);

    // useEffect(() => {
    //     // const healthStatusPromise = pingApiChatApi();
    //     const healthStatusPromise = ApiChatApi.pingApiChatApi();
    //     healthStatusPromise
    //         .then((healthStatusResponse: any) => {
    //             console.log('healthStatusResponse');
    //             console.log(healthStatusResponse);
    //         })
    //         .catch((error: any) => {
    //             console.error('ERRORRRR ' + error);
    //             Alert.error(
    //                 <FormattedMessage
    //                     id='Apis.Details.Policies.AttachedPolicyCard.apiSpecificPolicy.download.error'
    //                     defaultMessage='Something went wrong while downloading the policy'
    //                 />,
    //             );
    //         });
    // }, []);

    // const isExpandAllDisabled =
    //   expandedPanel && expandedPanel.length === executionResults.length;
    // const isCollapseAllDisabled =
    //   expandedPanel === false || expandedPanel.length === 0;

    // const handleTokenRegenerate = () => {
    //   getTestJwt({
    //     apiId,
    //     environment: envType,
    //   });
    // };

    // useEffect(() => {
    //   if (envType) {
    //     getTestJwt({ apiId, environment: envType });
    //     const selectedEnv = environments.find(
    //       (env) => env.name === selectedTestEnvironment
    //     );
    //     if (selectedEnv) {
    //       setSelectedEnvId(selectedEnv.id);
    //     }
    //   }
    // }, [apiId, envType, selectedTestEnvironment]);

    // useEffect(() => {
    //   onTokenGenerate(generatedToken?.apikey || "");
    // }, [generatedToken]);

    // const setEnrichmentError = (errorCode: string) => {
    //   switch (errorCode) {
    //     case "INVALID_SPECIFICATION":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.invalidSpecificationError",
    //           defaultMessage:
    //             "The OpenAPI specification could not be parsed. Ensure you are using a valid specification.",
    //         })
    //       );
    //       break;
    //     case "INVALID_RESOURCE_PATH":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.invalidResourcePathError",
    //           defaultMessage:
    //             "The OpenAPI specification contain unsupported resource path definitions.",
    //         })
    //       );
    //       break;
    //     case "UNSUPPORTED_MEDIA_TYPE":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.unsupportedMediaTypeError",
    //           defaultMessage:
    //             "The OpenAPI specification includes non-JSON input types which are not currently supported.",
    //         })
    //       );
    //       break;
    //     case "UNSUPPORTED_SPECIFICATION":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.unsupportedSpecificationError",
    //           defaultMessage:
    //             "The OpenAPI specification includes components that are currently not supported.",
    //         })
    //       );
    //       break;
    //     case "LLM":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.llmError",
    //           defaultMessage: "Failed to load API Chat.",
    //         })
    //       );
    //       break;
    //     case "TOKEN_LIMIT_EXCEEDED":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.tokenLimitExceededError",
    //           defaultMessage:
    //             "The OpenAPI specification exceeds the maximum limit.",
    //         })
    //       );
    //       break;
    //     case "STACK_OVERFLOW":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.stackOverflowError",
    //           defaultMessage:
    //             "The OpenAPI specification could not be parsed due to a cyclic reference or the excessive length of the" +
    //             " specification.",
    //         })
    //       );
    //       break;
    //     case "CONTENT_POLICY_VIOLATION":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.contentViolationError",
    //           defaultMessage:
    //             "The content in the OpenAPI specification violates the Azure OpenAI content policy.",
    //         })
    //       );
    //       break;
    //     case "LLM_CONNECTION":
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.llmConnectionError",
    //           defaultMessage: "There was an error connecting to Azure OpenAI.",
    //         })
    //       );
    //       break;
    //     case "GENERIC":
    //     default:
    //       setSpecEnrichmentError(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.specEnrichmentError.genericError",
    //           defaultMessage: "An error occurred when loading API Chat.",
    //         })
    //       );
    //       break;
    //   }
    // };

    // const enrichSpec = async () => {
    //   setIsEnrichingSpec(true);
    //   setSpecEnrichmentError("");
    //   setSpecEnrichmentErrorLevel("");
    //   setTrackingId("");
    //   if (swagger) {
    //     const requestId = generateUUID();
    //     setTrackingId(requestId);
    //     try {
    //       const response = await enrichOpenApiSpecification(
    //         swagger,
    //         gatewayUrl.get(selectedEnvId) || "",
    //         requestId
    //       );
    //       const { data } = response;
    //       if (data.code) {
    //         setIsEnrichingSpec(false);
    //         setEnrichmentError(data.code);
    //         setSpecEnrichmentErrorLevel(data.level || "WARN");
    //       } else {
    //         setEnrichedSpec(data.apiSpec);
    //         setSampleQueries(data.queries);
    //         setIsEnrichingSpec(false);
    //       }
    //     } catch (error) {
    //       setIsEnrichingSpec(false);
    //       setEnrichmentError((error as AxiosError).response?.data?.code);
    //       setSpecEnrichmentErrorLevel(
    //         (error as AxiosError).response?.data?.level || "ERROR"
    //       );
    //     }
    //   }
    // };

    // useEffect(() => {
    //   enrichSpec();
    // }, [swagger]);

    // const handleGoBack = () => {
    //   setLastQuery("");
    //   setExecutionResults([]);
    //   setFinalOutcome("");
    // };

    // const handleCopyClick = (sampleQuery: string) => {
    //   if (!isAgentRunning) {
    //     setInputQuery(sampleQuery);
    //   }
    //   copy(sampleQuery);
    // };

    // const handleQueryChange = (
    //   event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    // ) => {
    //   const { value } = event.target;
    //   setInputQuery(value);
    // };

    // const handleToggleResultView = (
    //   event: React.MouseEvent<HTMLElement>,
    //   newView: string | null
    // ) => {
    //   setResultView(newView);
    // };

    // const handleShowMoreDetails = (panel: number) => {
    //   setResultView("json");
    //   setExpandedPanel([panel]);
    // };

    // const handlePanelChange =
    //   (panel: number) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    //     setExpandedPanel(
    //       isExpanded
    //         ? [...(expandedPanel || []), panel]
    //         : (expandedPanel || []).filter((id) => id !== panel)
    //     );
    //   };

    // const handleExpandAll = () => {
    //   setExpandedPanel(executionResults.map((item) => item.id));
    // };

    // const handleCollapseAll = () => {
    //   setExpandedPanel(false);
    // };

    // useEffect(() => {
    //   if (executionResults.length > 0) {
    //     setExpandedPanel([executionResults[executionResults.length - 1].id]);
    //   }
    // }, []);

    // const setExecutionErrorMessage = (errorCode: string) => {
    //   switch (errorCode) {
    //     case "LLM":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.llmError",
    //           defaultMessage:
    //             "An error occurred during query execution. Try again.",
    //         })
    //       );
    //       break;
    //     case "CACHING":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.cachingError",
    //           defaultMessage:
    //             "An error occurred during query execution. Try again later.",
    //         })
    //       );
    //       break;
    //     case "RESPONSE_PARSING":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.responseParsingError",
    //           defaultMessage:
    //             "An error occurred while attempting to extract the API response.",
    //         })
    //       );
    //       break;
    //     case "API_COMMUNICATION":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.apiCommunicationError",
    //           defaultMessage:
    //             "An error occurred while attempting to establish a connection with your API.",
    //         })
    //       );
    //       break;
    //     case "TOKEN_LIMIT_EXCEEDED":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.tokenLimitExceededError",
    //           defaultMessage:
    //             "Execution has been terminated due to exceeding the token limit.",
    //         })
    //       );
    //       break;
    //     case "INVALID_COMMAND":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.invalidCommandError",
    //           defaultMessage: "An invalid query is provided.",
    //         })
    //       );
    //       break;
    //     case "CONTENT_POLICY_VIOLATION":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.contentViolationError",
    //           defaultMessage:
    //             "Your query seems to contain inappropriate content. Please try again with a different query.",
    //         })
    //       );
    //       break;
    //     case "LLM_CONNECTION":
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.llmConnectionError",
    //           defaultMessage: "There was an error connecting to Azure OpenAI.",
    //         })
    //       );
    //       break;
    //     case "GENERIC":
    //     default:
    //       setFinalOutcome(
    //         intl.formatMessage({
    //           id: "Apis.Details.ApiChat.finalOutcome.genericError",
    //           defaultMessage: "An error occurred during query execution.",
    //         })
    //       );
    //       break;
    //   }
    // };

    // const sendInitialRequest = async (query: string) => {
    //   setIsExecutionError(false);
    //   setExecutionResults([]);
    //   setTrackingId("");
    //   setExpandedPanel([]);
    //   setResultView("summary");
    //   if (query.length < 1) {
    //     setFinalOutcome(
    //       intl.formatMessage({
    //         id: "Apis.Details.ApiChat.finalOutcome.noQuery",
    //         defaultMessage: "An invalid query is provided.",
    //       })
    //     );
    //     return;
    //   }
    //   setIsAgentRunning(true);
    //   setFinalOutcome("");
    //   const requestId = generateUUID();
    //   setTrackingId(requestId);
    //   try {
    //     const response = await runAiAgentInitialIteration(
    //       token,
    //       query,
    //       enrichedSpec,
    //       gatewayUrl.get(selectedEnvId) || "",
    //       requestId
    //     );
    //     const { data } = response;
    //     if (response.status === 200 || response.status === 201) {
    //       if (abortControllerRef.current.signal.aborted) {
    //         return;
    //       }
    //       if (data.code) {
    //         setIsExecutionError(true);
    //         setExecutionErrorMessage(data.code);
    //         setIsAgentRunning(false);
    //       } else {
    //         switch (data.taskStatus) {
    //           case TaskStatus.EXPIRED_TOKEN:
    //             setTaskData({
    //               taskStatus: data.taskStatus,
    //               iteration: 0,
    //             });
    //             isTokenExpired.current = true;
    //             handleTokenRegenerate();
    //             break;
    //           case TaskStatus.IN_PROGRESS:
    //             if (data.result) {
    //               const outputPayload = data.result.output.body;
    //               try {
    //                 data.result.output.body = JSON.parse(outputPayload);
    //               } catch (error) {
    //                 data.result.output.body = outputPayload;
    //               }
    //             }
    //             if (!abortControllerRef.current.signal.aborted) {
    //               setExecutionResults([
    //                 {
    //                   id: 1,
    //                   result: JSON.stringify(data.result, null, 2),
    //                 },
    //               ]);
    //               setTaskData({
    //                 taskStatus: data.taskStatus,
    //                 iteration: 1,
    //               });
    //             }
    //             break;
    //           case TaskStatus.COMPLETED:
    //             if (data.result && data.result !== "") {
    //               setFinalOutcome(data.result);
    //             } else {
    //               setFinalOutcome(
    //                 intl.formatMessage({
    //                   id: "Apis.Details.ApiChat.finalOutcome.taskCompletedOneItr",
    //                   defaultMessage: "Task completed in 1 iteration.",
    //                 })
    //               );
    //             }
    //             setIsAgentRunning(false);
    //             break;
    //           default:
    //             setIsExecutionError(true);
    //             setFinalOutcome(
    //               intl.formatMessage({
    //                 id: "Apis.Details.ApiChat.finalOutcome.taskExecutionDefault",
    //                 defaultMessage: "An error occurred during query execution.",
    //               })
    //             );
    //             setIsAgentRunning(false);
    //         }
    //       }
    //     } else {
    //       setIsExecutionError(true);
    //       setExecutionErrorMessage(response?.data?.code);
    //       setIsAgentRunning(false);
    //     }
    //   } catch (error) {
    //     setIsExecutionError(true);
    //     setExecutionErrorMessage((error as AxiosError).response?.data?.code);
    //     setIsAgentRunning(false);
    //   }
    // };

    // const continueExecution = async (newToken: boolean) => {
    //   try {
    //     const response = await runAiAgentSubsequentIterations(
    //       token,
    //       newToken,
    //       gatewayUrl.get(selectedEnvId) || "",
    //       trackingId
    //     );
    //     const { data } = response;
    //     const iteration = taskData?.iteration || 0;
    //     if (response.status === 200 || response.status === 201) {
    //       if (abortControllerRef.current.signal.aborted) {
    //         return;
    //       }
    //       if (data.code) {
    //         setIsExecutionError(true);
    //         setExecutionErrorMessage(data.code);
    //         setIsAgentRunning(false);
    //       } else {
    //         switch (data.taskStatus) {
    //           case TaskStatus.EXPIRED_TOKEN:
    //             setTaskData({
    //               taskStatus: data.taskStatus,
    //               iteration,
    //             });
    //             isTokenExpired.current = true;
    //             handleTokenRegenerate();
    //             break;
    //           case TaskStatus.IN_PROGRESS:
    //             isTokenExpired.current = false;
    //             if (data.result) {
    //               const outputPayload = data.result.output.body;
    //               try {
    //                 data.result.output.body = JSON.parse(outputPayload);
    //               } catch (error) {
    //                 data.result.output.body = outputPayload;
    //               }
    //             }
    //             if (!abortControllerRef.current.signal.aborted) {
    //               setExecutionResults([
    //                 ...executionResults,
    //                 {
    //                   id: iteration + 1,
    //                   result: JSON.stringify(data.result, null, 2),
    //                 },
    //               ]);
    //               setTaskData({
    //                 taskStatus: data.taskStatus,
    //                 iteration: iteration + 1,
    //               });
    //             }
    //             break;
    //           case TaskStatus.COMPLETED:
    //             if (data.result && data.result !== "") {
    //               setFinalOutcome(data.result);
    //             } else {
    //               setFinalOutcome(
    //                 intl.formatMessage(
    //                   {
    //                     id: "Apis.Details.ApiChat.finalOutcome.taskCompleted",
    //                     defaultMessage:
    //                       "Task completed in {iteration} iteration(s).",
    //                   },
    //                   { iteration }
    //                 )
    //               );
    //             }
    //             setIsAgentRunning(false);
    //             break;
    //           case TaskStatus.TERMINATED:
    //             setFinalOutcome(
    //               intl.formatMessage({
    //                 id: "Apis.Details.ApiChat.finalOutcome.maxItrReachedSubsequent",
    //                 defaultMessage:
    //                   "Resource execution limit for the query was exceeded.",
    //               })
    //             );
    //             setIsAgentRunning(false);
    //             break;
    //           default:
    //             setIsExecutionError(true);
    //             setFinalOutcome(
    //               intl.formatMessage({
    //                 id: "Apis.Details.ApiChat.finalOutcome.taskExecutionDefaultSubsequent",
    //                 defaultMessage: "An error occurred during query execution.",
    //               })
    //             );
    //             setIsAgentRunning(false);
    //         }
    //       }
    //     } else {
    //       setIsExecutionError(true);
    //       setExecutionErrorMessage(response?.data?.code);
    //     }
    //   } catch (error) {
    //     setIsExecutionError(true);
    //     setExecutionErrorMessage((error as AxiosError).response?.data?.code);
    //     setIsAgentRunning(false);
    //   }
    // };

    // useEffect(() => {
    //   if (
    //     (taskData?.taskStatus === TaskStatus.IN_PROGRESS ||
    //       taskData?.taskStatus === TaskStatus.EXPIRED_TOKEN) &&
    //     isAgentRunning
    //   ) {
    //     continueExecution(true);
    //   }
    // }, [token]);

    // useEffect(() => {
    //   if (!isTokenExpired.current) {
    //     if (taskData?.taskStatus === TaskStatus.IN_PROGRESS && isAgentRunning) {
    //       continueExecution(false);
    //     } else {
    //       setIsAgentRunning(false);
    //     }
    //   }
    // }, [taskData]);

    // useEffect(() => {
    //   if (abortControllerRef.current.signal.aborted) {
    //     setIsAgentTerminating(true);
    //   }
    // }, [abortControllerRef.current.signal.aborted]);

    // useEffect(() => {
    //   if (isAgentTerminating) {
    //     setTimeout(() => {
    //       setIsAgentTerminating(false);
    //       setIsAgentRunning(false);
    //     }, 2000);
    //   }
    // }, [isAgentTerminating]);

    // const handleExecute = async () => {
    //   abortControllerRef.current = new AbortController();
    //   const query = inputQuery;
    //   setInputQuery("");
    //   setLastQuery(inputQuery);
    //   await sendInitialRequest(query);
    // };

    // const handleExecuteSampleQuery = async (query: string) => {
    //   if (!isAgentRunning) {
    //     abortControllerRef.current = new AbortController();
    //     setInputQuery("");
    //     setLastQuery(query);
    //     await sendInitialRequest(query);
    //   }
    // };

    // const handleStopAndReExecute = async () => {
    //   if (isAgentRunning) {
    //     abortControllerRef.current.abort();
    //     setFinalOutcome(
    //       intl.formatMessage({
    //         id: "Apis.Details.ApiChat.finalOutcome.executionTerminated",
    //         defaultMessage: "Execution was terminated.",
    //       })
    //     );
    //   } else {
    //     abortControllerRef.current = new AbortController();
    //     const query = lastQuery;
    //     await sendInitialRequest(query);
    //   }
    // };

    const handleOpenConfigureKey = () => {
        setConfigureKeyDrawerOpen(true);
    };

    return (
    // <Box className={classes.tryAiViewer}>
    //     <SampleQueriesDrawer
    //         onClose={sampleQueriesDrawer.closeDrawer}
    //         open={sampleQueriesDrawer.isOpen}
    //         sampleQueries={sampleQueries}
    //         onExecuteClick={handleExecuteSampleQuery}
    //         onCopyClick={handleCopyClick}
    //         queriesDisabled={isAgentRunning}
    //     />
    //     <Box className={classes.tryAiViewerCard}>
    //         <Card
    //             boxShadow='none'
    //             fullHeight
    //             testId='try-with-ai'
    //             bgColor='secondary'
    //         >
    //             <Box className={classes.tryWithAiMain}>
    //                 <TryAIPoweredBy
    //                     openSampleQueries={handleOpenSampleQueries}
    //                     showSampleQueries={
    //                         lastQuery !== '' || isAgentRunning || finalOutcome !== ''
    //                     }
    //                     goBack={handleGoBack}
    //                     disableGoBack={isAgentRunning}
    //                 />
    //                 {!lastQuery && (
    //                     <Box my={3}>
    //                         <TryAIBanner />
    //                     </Box>
    //                 )}
    //                 {!isAgentRunning && !lastQuery && !finalOutcome && (
    //                     <Box className={classes.sampleQueries}>
    //                         <Grid container direction='row' spacing={3}>
    //                             {sampleQueries
    //               && sampleQueries.map((queryData) => {
    //                   const gridVal = sampleQueries.length === 2 ? 6 : 4;
    //                   return (
    //                       <Grid
    //                           key={queryData.scenario}
    //                           item
    //                           xs={12}
    //                           md={gridVal}
    //                       >
    //                           <SampleQueryCard
    //                               onExecuteClick={handleExecuteSampleQuery}
    //                               disabled={isAgentRunning}
    //                               queryData={queryData}
    //                               onCopyClick={handleCopyClick}
    //                               boxShadow='dark'
    //                           />
    //                       </Grid>
    //                   );
    //               })}
    //                         </Grid>
    //                     </Box>
    //                 )}
    //                 {(isAgentRunning || lastQuery || finalOutcome) && (
    //                     <Box className={classes.finalOutcome}>
    //                         <Box className={classes.lastQueryWrap}>
    //                             <CopyToClipboard
    //                                 value={lastQuery}
    //                                 testId='last-query'
    //                                 multiline
    //                                 component='card'
    //                             />
    //                         </Box>
    //                         <Box className={classes.resultCard}>
    //                             <Card fullHeight testId='results-card'>
    //                                 <CardContent fullHeight>
    //                                     <ResultsHeading
    //                                         executionResults={executionResults}
    //                                         handleExpandAll={handleExpandAll}
    //                                         isExpandAllDisabled={isExpandAllDisabled}
    //                                         handleCollapseAll={handleCollapseAll}
    //                                         isCollapseAllDisabled={isCollapseAllDisabled}
    //                                         resultView={resultView}
    //                                         handleToggleResultView={handleToggleResultView}
    //                                     />

    //                                     {executionResults.map((executionResult, index) => {
    //                                         const isLastItem = index === executionResults.length - 1;
    //                                         const shouldExpand = isLastItem
    //                     && executionResult.result !== null
    //                     && isAgentRunning;
    //                                         const accordionExpanded = shouldExpand
    //                     || (expandedPanel === false
    //                         ? false
    //                         : expandedPanel.includes(executionResult.id));
    //                                         const jsonResult = JSON.parse(executionResult.result);
    //                                         const isJsonObject = (jsonResult
    //                       && jsonResult.output
    //                       && typeof jsonResult.output.body === 'object')
    //                     || Array.isArray(jsonResult.output.body);

    //                                         return (
    //                                             <>
    //                                                 {executionResult.result !== null && (
    //                                                     <Accordion
    //                                                         bordered
    //                                                         key={executionResult.id}
    //                                                         expanded={accordionExpanded}
    //                                                         onChange={handlePanelChange(executionResult.id)}
    //                                                         testId={`result-iteration-${executionResult.id}`}
    //                                                     >
    //                                                         <AccordionSummary
    //                                                             aria-controls='panel1a-content'
    //                                                             testId={`result-iteration-${executionResult.id}-header`}
    //                                                         >
    //                                                             <Box className={classes.executeTitleCont}>
    //                                                                 <Box
    //                                                                     display='flex'
    //                                                                     alignItems='center'
    //                                                                     mr={1}
    //                                                                 >
    //                                                                     {jsonResult.output.code >= 200
    //                                 && jsonResult.output.code < 300 ? (
    //                                     <SuccessFilled fontSize='small' />
    //                                                                         ) : (
    //                                                                             <ErrorFilled fontSize='small' />
    //                                                                         )}
    //                                                                 </Box>
    //                                                                 <Box className={classes.executeTitleWrap}>
    //                                                                     <Typography
    //                                                                         variant='h5'
    //                                                                         className={clsx({
    //                                                                             [classes.executeTitle]:
    //                                       !accordionExpanded,
    //                                                                             [classes.executeTitleExpand]:
    //                                       accordionExpanded,
    //                                                                         })}
    //                                                                     >
    //                                                                         {intl.formatMessage(
    //                                                                             {
    //                                                                                 id: 'Apis.Details.ApiChat.resultsAccordionHeader',
    //                                                                                 defaultMessage:
    //                                         'Executed {httpMethod} {httpPath}',
    //                                                                             },
    //                                                                             {
    //                                                                                 httpMethod:
    //                                         jsonResult.resource.method,
    //                                                                                 httpPath: jsonResult.output.path,
    //                                                                             },
    //                                                                         )}
    //                                                                     </Typography>
    //                                                                 </Box>
    //                                                             </Box>
    //                                                         </AccordionSummary>
    //                                                         <AccordionDetails
    //                                                             testId={`result-iteration-${executionResult.id}-details`}
    //                                                         >
    //                                                             {resultView === 'summary' && (
    //                                                                 <Box
    //                                                                     className={classes.preCodeViewContainer}
    //                                                                 >
    //                                                                     {isJsonObject ? (
    //                                                                         <JsonViewer
    //                                                                             displayDataTypes={false}
    //                                                                             displayObjectSize={false}
    //                                                                             src={jsonResult.output.body}
    //                                                                             maxHeight='100%'
    //                                                                             name={false}
    //                                                                             enableClipboard={false}
    //                                                                         />
    //                                                                     ) : (
    //                                                                         <Typography
    //                                                                             className={classes.wrappedTypography}
    //                                                                         >
    //                                                                             {JSON.stringify(
    //                                                                                 JSON.parse(executionResult.result)
    //                                                                                     .output.body,
    //                                                                             )}
    //                                                                         </Typography>
    //                                                                     )}
    //                                                                     <Button
    //                                                                         variant='link'
    //                                                                         testId='show-more-details-button'
    //                                                                         onClick={() => handleShowMoreDetails(
    //                                                                             executionResult.id,
    //                                                                         )}
    //                                                                     >
    //                                                                         {intl.formatMessage({
    //                                                                             id: 'Apis.Details.ApiChat.moreDetailsButton',
    //                                                                             defaultMessage: 'More Details',
    //                                                                         })}
    //                                                                     </Button>
    //                                                                 </Box>
    //                                                             )}
    //                                                             {resultView === 'json' && (
    //                                                                 <Box
    //                                                                     className={classes.preCodeViewContainer}
    //                                                                 >
    //                                                                     <JsonViewer
    //                                                                         displayDataTypes={false}
    //                                                                         displayObjectSize={false}
    //                                                                         src={rearrangeData(jsonResult)}
    //                                                                         maxHeight='100%'
    //                                                                         name={false}
    //                                                                     />
    //                                                                 </Box>
    //                                                             )}
    //                                                         </AccordionDetails>
    //                                                     </Accordion>
    //                                                 )}
    //                                             </>
    //                                         );
    //                                     })}
    //                                     {!isAgentRunning && finalOutcome && (
    //                                         <Box
    //                                             className={
    //                                                 isExecutionError
    //                                                     ? classes.finalOutcomeError
    //                                                     : classes.finalOutcomeMessage
    //                                             }
    //                                         >
    //                                             <Typography variant='body2'>
    //                                                 {finalOutcome}
    //                                             </Typography>
    //                                             {isExecutionError && trackingId && (
    //                                                 <TrackingId trackingId={trackingId} />
    //                                             )}
    //                                         </Box>
    //                                     )}
    //                                     {isAgentRunning && (
    //                                         <Box className={classes.queryProcessLoader}>
    //                                             {isAgentTerminating ? (
    //                                                 <CircleLoaderMessage
    //                                                     message={(
    //                                                         <FormattedMessage
    //                                                             id='Apis.Details.ApiChat.terminatingExecutionMessage'
    //                                                             defaultMessage='Execution is terminating...'
    //                                                         />
    //                                                     )}
    //                                                 />
    //                                             ) : (
    //                                                 <CircleLoaderMessage
    //                                                     message={(
    //                                                         <FormattedMessage
    //                                                             id='Apis.Details.ApiChat.loadingExecutionMessage'
    //                                                             defaultMessage='Loading next execution step...'
    //                                                         />
    //                                                     )}
    //                                                 />
    //                                             )}
    //                                         </Box>
    //                                     )}
    //                                 </CardContent>
    //                             </Card>
    //                         </Box>
    //                     </Box>
    //                 )}
    //                 {isEnrichingSpec && (
    //                     <Box className={classes.queryProcessLoader}>
    //                         <CircleLoaderMessage
    //                             message={(
    //                                 <FormattedMessage
    //                                     id='Apis.Details.ApiChat.loadingSpecEnrichmentMessage'
    //                                     defaultMessage='We are in the process of preparing the API specification
    //                   for API Chat.'
    //                                 />
    //                             )}
    //                         />
    //                     </Box>
    //                 )}
    //                 {!isEnrichingSpec && !enrichedSpec && (
    //                     <Box marginTop='auto'>
    //                         {specEnrichmentErrorLevel === 'ERROR' ? (
    //                             <Notification color='error' testId='enrich-spec-failed-error'>
    //                                 <Box display='flex' alignItems='center' gridGap={8}>
    //                                     <Box>
    //                                         <Typography variant='body2'>
    //                                             {specEnrichmentError}
    //                                         </Typography>
    //                                     </Box>
    //                                     <Button
    //                                         variant='link'
    //                                         testId='retry-enrich-spec-button'
    //                                         onClick={enrichSpec}
    //                                         size='tiny'
    //                                     >
    //                                         {intl.formatMessage({
    //                                             id: 'Apis.Details.ApiChat.apiSpecEnrichFailedTryAgainLink',
    //                                             defaultMessage: 'Try Again',
    //                                         })}
    //                                     </Button>
    //                                 </Box>
    //                                 <TrackingId trackingId={trackingId} />
    //                             </Notification>
    //                         ) : (
    //                             <Notification
    //                                 color='warning'
    //                                 icon='info'
    //                                 testId='enrich-spec-failed-warning'
    //                             >
    //                                 <Box display='flex' alignItems='center' gridGap={8}>
    //                                     <Typography variant='body2'>
    //                                         {specEnrichmentError}
    //                                     </Typography>
    //                                 </Box>
    //                                 <TrackingId trackingId={trackingId} />
    //                             </Notification>
    //                         )}
    //                     </Box>
    //                 )}
    //             </Box>
    //         </Card>
    //     </Box>
    //     <TryAIExecute
    //         isAgentRunning={isAgentRunning}
    //         isAgentTerminating={isAgentTerminating}
    //         lastQuery={lastQuery}
    //         handleStopAndReExecute={handleStopAndReExecute}
    //         enrichedSpec={enrichedSpec}
    //         inputQuery={inputQuery}
    //         handleQueryChange={handleQueryChange}
    //         isEnrichingSpec={isEnrichingSpec}
    //         handleExecute={handleExecute}
    //     />
    // </Box>
        <>
            <Box className={classes.tryWithAiMain} sx={{ mr: 5 }}>
                <ConfigureKeyDrawer
                    isDrawerOpen={configureKeyDrawerOpen}
                    updateDrawerOpen={setConfigureKeyDrawerOpen}
                />
                {/* onClose={sampleQueriesDrawer.closeDrawer}
                    open={sampleQueriesDrawer.isOpen}
                    sampleQueries={sampleQueries}
                    onExecuteClick={handleExecuteSampleQuery}
                    onCopyClick={handleCopyClick}
                    queriesDisabled={isAgentRunning}
                /> */}
                <ApiChatPoweredBy
                    showSampleQueries
                    openConfigureKey={handleOpenConfigureKey}
                    goBack={() => {}}
                    disableGoBack={false}
                    // openSampleQueries={handleOpenSampleQueries}
                    // showSampleQueries={
                    //     lastQuery !== '' || isAgentRunning || finalOutcome !== ''
                    // }
                    // goBack={handleGoBack}
                    // disableGoBack={isAgentRunning}
                />
                <ApiChatBanner />
                <ApiChatExecute
                    isAgentRunning
                    isAgentTerminating={false}
                    lastQuery='Hello World'
                    handleStopAndReExecute={() => {}}
                    // enrichedSpec
                    inputQuery='New Query'
                    handleQueryChange={() => {}}
                    isEnrichingSpec={false}
                    handleExecute={() => {}}
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
        </>
    );
};

export default ApiChat;
