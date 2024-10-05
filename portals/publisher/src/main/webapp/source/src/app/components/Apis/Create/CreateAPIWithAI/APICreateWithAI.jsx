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
    const [finalOutcome, setFinalOutcome] = useState('');
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
        // setExecutionResults(() => {
        //     return [];
        // });
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
            setFinalOutcome(text);              // setFinalOutcome('');

            // const lines = text.split('\n'); // Split the text by newline characters and set the outcome line by line
            // setFinalOutcome(lines.join('\n'));  // This will join them back with newline chars for rendering

        } catch (error) {
            console.error('Error:', error);
            setFinalOutcome('An error occurred while fetching the data.');
        }
    };


    // const { body } = response;
    // switch (body.taskStatus) {
    //     case 'IN_PROGRESS':
    //         sendSubsequentRequest(requestId, body.resource);
    //         break;
    //     case 'COMPLETED':
    //         if (body.result && body.result !== '') {
    //             setFinalOutcome(body.result);
    //         } else {
    //             setFinalOutcome(
    //                 intl.formatMessage({
    //                     id: 'Apis.Details.ApiChat.ApiChat.initialRequest.finalOutcome.taskCompletedOneItr',
    //                     defaultMessage: 'Task completed in 1 iteration.',
    //                 }),
    //             );
    //         }
    //         setIsAgentRunning(false);
    //         break;
    //     default:
    //         setIsExecutionError(true);
    //         setFinalOutcome(
    //             intl.formatMessage({
    //                 id: 'Apis.Details.ApiChat.components.finalOutcome.taskExecutionDefault',
    //                 defaultMessage: 'An error occurred during query execution.',
    //             }),
    //         );
    //         setIsAgentRunning(false);
    // }

    return (
        <div>
            <ApiChatPoweredBy/>
            <ApiChatBanner/>
            <h1>testing UI changes for the text display</h1>
            <ApiChatResponse
                lastQuery={lastQuery}
                executionResults={executionResults}
                finalOutcome={finalOutcome}
            />
            {/* {(isAgentRunning || lastQuery || finalOutcome) && (
                <ApiChatResponse
                    lastQuery={lastQuery}
                    executionResults={executionResults}
                    finalOutcome={finalOutcome}
                />
            )} */}          
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
