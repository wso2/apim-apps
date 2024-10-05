/* eslint-disable */
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
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import ApiChatPoweredBy from './components/ApiChatPoweredBy';
import ApiChatBanner from './components/ApiChatBanner';
import ApiChatExecute from './components/ApiChatExecute';
import ApiChatResponse from './components/ApiChatResponse';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';

/**
 * Renders the Create API with AI UI.
 * @returns {JSX} Create API with AI page to render.
 */
const ApiCreateWithAI = () => {
    const [inputQuery, setInputQuery] = useState('');
    const [lastQuery, setLastQuery] = useState('');
    const [finalOutcome, setFinalOutcome] = useState(''); // add setFinalOutcome logic
    const [executionResults, setExecutionResults] = useState([]);

    // const abortControllerRef = useRef(new AbortController());

    const handleQueryChange = (event) => {
        const { value } = event.target;
        setInputQuery(value);
    };

    const handleExecute = async () => {
        if (inputQuery.length !== 0) {
            // abortControllerRef.current = new AbortController();
            const query = inputQuery;
            setInputQuery('');
            setLastQuery(inputQuery);
            sendInitialRequest(query);
        }
    };

    const sendInitialRequest = async (query) => {
        try {
            console.log(query);
            const response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: query }),
            });
    
            const text = await response.text();
            console.log(text);
            // You can set the response to state here if needed
            // setResponseText(text); // or data.generatedText
        } catch (error) {
            console.error('Error:', error);
            // Optionally, handle the error by setting a response state
            // setResponseText('An error occurred while fetching the data.');
        }
    };

    // const sendInitialRequest = (query) => {
    //     setIsExecutionError(false);
    //     setExecutionResults(() => {
    //         return [];
    //     });
    //     if (query.length < 1) {
    //         setFinalOutcome(
    //             intl.formatMessage({
    //                 id: 'Apis.Details.ApiChat.components.finalOutcome.noQuery',
    //                 defaultMessage: 'An invalid query is provided.',
    //             }),
    //         );
    //         return;
    //     }
    //     setIsAgentRunning(true);
    //     setFinalOutcome('');
    //     const requestId = Utils.generateUUID();
    //     const executePromise = apiClient.runAiAgentInitialIteration(
    //         api.id,
    //         requestId,
    //         query,
    //         enrichedSpec,
    //     );
    //     executePromise.then((response) => {
    //         const { data } = response;
    //         if (response.status === 201) {
    //             if (abortControllerRef.current.signal.aborted) {
    //                 return;
    //             }
    //             if (data.code) {
    //                 setIsExecutionError(true);
    //                 setExecutionErrorMessage(data.code);
    //                 setIsAgentRunning(false);
    //             } else {
    //                 const { body } = response;
    //                 switch (body.taskStatus) {
    //                     case 'IN_PROGRESS':
    //                         sendSubsequentRequest(requestId, body.resource);
    //                         break;
    //                     case 'COMPLETED':
    //                         if (body.result && body.result !== '') {
    //                             setFinalOutcome(body.result);
    //                         } else {
    //                             setFinalOutcome(
    //                                 intl.formatMessage({
    //                                     id: 'Apis.Details.ApiChat.ApiChat.initialRequest.finalOutcome.taskCompletedOneItr',
    //                                     defaultMessage: 'Task completed in 1 iteration.',
    //                                 }),
    //                             );
    //                         }
    //                         setIsAgentRunning(false);
    //                         break;
    //                     default:
    //                         setIsExecutionError(true);
    //                         setFinalOutcome(
    //                             intl.formatMessage({
    //                                 id: 'Apis.Details.ApiChat.components.finalOutcome.taskExecutionDefault',
    //                                 defaultMessage: 'An error occurred during query execution.',
    //                             }),
    //                         );
    //                         setIsAgentRunning(false);
    //                 }
    //             }
    //         } else {
    //             setIsExecutionError(true);
    //             setExecutionErrorMessage(response?.data?.code);
    //             setIsAgentRunning(false);
    //         }
    //     }).catch((error) => {
    //         setIsExecutionError(true);
    //         const statusCode = error?.response?.status;
    //         if (statusCode === 401) { // Hanlde on-prem key vaidation failed scenario
    //             setExecutionErrorMessage(getUnauthorizedErrorMessage());
    //         } else if (statusCode === 429) { // Handle throttled out scenario
    //             setExecutionErrorMessage(getTooManyRequestsErrorMessage());
    //         } else if (statusCode === 504) { // Handle gateway timeout scenario
    //             setExecutionErrorMessage(getGatewayTimeoutErrorMessage());
    //         } else {
    //             const errorMessage = error?.response?.data || 'An error occurred during query execution.';
    //             setExecutionErrorMessage(errorMessage);
    //         }
    //         setIsAgentRunning(false);
    //     });
    // };

    return (
        <div>
            <ApiChatPoweredBy/>
            <ApiChatBanner/>
            <h1>test5</h1>
            <div>
                <Typography variant='body1'>
                    <FormattedMessage
                        id='Apis.Details.ApiChat.warning.notSignedIn'
                        defaultMessage='You must sign in if you wish to interact with API Chat bot.'
                    />
                </Typography>
            </div>
            <ApiChatResponse
                lastQuery={lastQuery}
                executionResults={executionResults}
                finalOutcome={finalOutcome}
            />
            <ApiChatExecute
                lastQuery={lastQuery}
                inputQuery={inputQuery}
                handleExecute={handleExecute}
                handleQueryChange={handleQueryChange}
            />
        </div>
    );
};

export default ApiCreateWithAI;
