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
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import ApiChatPoweredBy from './components/ApiChatPoweredBy';
import ApiChatBanner from './components/ApiChatBanner';
import ApiChatExecute from './components/ApiChatExecute';
import ApiChatResponse from './components/ApiChatResponse';
import SampleQueryCard from './components/SampleQueryCard';
import LinearDeterminate from './components/LinearDeterminate';
import AlertDialog from './components/AlertDialog';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import DisplayCode from './components/DisplayCode';
import WelcomeMessage from './components/WelcomeMessage';

/**
 * Renders the Create API with AI UI.
 * @returns {JSX} Create API with AI page to render.
 */
const ApiCreateWithAI = () => {
    const [inputQuery, setInputQuery] = useState('');
    const [lastQuery, setLastQuery] = useState('');
    const [finalOutcome, setFinalOutcome] = useState('');
    const [finalOutcomeCode, setFinalOutcomeCode] = useState('');
    const [executionResults, setExecutionResults] = useState([]);
    const [messages, setMessages] = useState([]);
    const [taskId, setTaskId] = useState('');
    const [taskStatus, setTaskStatus] = useState('');
    const [isSuggestion, setIsSuggestion] = useState('');
    const [selectedTitles, setSelectedTitles] = useState([]);
    
    const handleQueryChange = (event) => {
        const { value } = event.target;
        setInputQuery(value);
    };

    const handleExecute = async () => {
        if (inputQuery.length !== 0) {
            const query = inputQuery;
            setInputQuery('');
            setLastQuery(inputQuery);
            setTaskStatus('IN_PROGRESS');

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'user', content: query }
            ]);

            sendInitialRequest(query);
        }
    };


    const handleExecuteSampleQuery = async (query) => {
        setInputQuery('');
        setLastQuery(query);
        setTaskStatus('IN_PROGRESS');

        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: query }
        ]);

        sendInitialRequest(query);
    };

    const generateTaskId = () => {
        return `task-${Date.now()}`;
    };

    const handleSelectedTitles = (titles) => { 
        const titlesString = "Modify this API to include the following features as well:\n" + 
        titles.map(title => `- ${title}`).join('\n');
        setSelectedTitles(titlesString); 
        setLastQuery(titlesString);
        setTaskStatus('IN_PROGRESS');

        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: titlesString }
        ]);

        sendInitialRequest(titlesString);
    };

    const sendInitialRequest = async (query) => {
        setFinalOutcome('');

        const newTaskId = 1728534776568;
        // const newTaskId = `task-${Date.now()}`;
        setTaskId(newTaskId);
        console.log(newTaskId);

        try {
            console.log("Sending to backend:", query);
            
            const response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: query,
                    task_id: newTaskId
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // const jsonResponse = await response.text();
            // setFinalOutcome(<pre>{text}</pre>);

            const jsonResponse = await response.json();

            // const openApiSpec = jsonResponse.openapispec;
            // const suggestions = jsonResponse.suggestions;
            // const isSuggestions = jsonResponse.isSuggestions;

            // setFinalOutcome(suggestions);
            // setFinalOutcomeCode(openApiSpec);
            // setIsSuggestion(isSuggestions);
            // setTaskStatus(state);

            // if (suggestions) {
            //     setMessages((prevMessages) => [
            //         ...prevMessages,
            //         { role: 'system', content: suggestions }
            //     ]);
            // }

            const backendResponse = jsonResponse.backendResponse;
            const isSuggestions = jsonResponse.isSuggestions;
            const code = jsonResponse.code;
            const state = jsonResponse.state;

            setFinalOutcome(backendResponse);
            setIsSuggestion(isSuggestions);
            setFinalOutcomeCode(code);
            setTaskStatus(state);

            if (backendResponse) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: 'system', content: backendResponse, suggestions: isSuggestions }
                ]);
            }

        } catch (error) {
            console.error('Error:', error);
            setFinalOutcome('An error occurred while fetching the data.');

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'system', content: 'An error occurred while fetching the response to your query. Please try again.', isSuggestions: false }
            ]);

            setTaskStatus('ERROR');
        }
    };

    // padding: theme.spacing(1),
    // textAlign: 'center',
    // height: '100%',
    // justifyContent: 'center',
    // backgroundColor: '#1A2027',

    return (
        <div>
            <Stack
                direction="row"
                spacing={1}
                sx={{ width: '100%', height: '80vh' }}
            >
                <Box 
                    sx={{
                        flex: 6,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack direction="column" spacing={1} sx={{ width: '100%', height: '100%' }}>
                        <Box><ApiChatPoweredBy sx={{ textAlign: 'left', alignItems: 'flex-start' }} /></Box>
                        {!lastQuery && (
                            <Box>
                                <WelcomeMessage/>
                                <Stack 
                                    direction="row" 
                                    spacing={7} 
                                    justifyContent="center"
                                    marginTop= '40px'
                                >
                                    <SampleQueryCard onExecuteClick={handleExecuteSampleQuery} queryHeading={'Invoke an action to create a REST API'} queryData={'Create an API for a banking transaction'} sx={{ textAlign: 'left' }} />
                                    <SampleQueryCard onExecuteClick={handleExecuteSampleQuery} queryHeading={'Invoke an action to create an Async API'} queryData={'Create an API for a hospital database'} sx={{ textAlign: 'left' }} />
                                </Stack>
                            </Box>
                        )}
                        <Box sx={{ flexGrow: 1, textAlign: 'left', overflowY: 'auto', overflowX: 'auto' }}>
                            {(lastQuery || finalOutcome) && (
                                // <ApiChatResponse
                                //     lastQuery={lastQuery}
                                //     executionResults={executionResults}
                                //     finalOutcome={finalOutcome}
                                //     isSuggestion={isSuggestion}
                                //     onTitlesSelected={handleSelectedTitles}
                                // />
                                <ApiChatResponse 
                                    messages={messages} 
                                    // isSuggestion={isSuggestion}
                                    onTitlesSelected={handleSelectedTitles}
                                />
                            )}
                        </Box>
                        <Box>
                            <ApiChatExecute
                                    lastQuery={lastQuery}
                                    inputQuery={inputQuery}
                                    handleExecute={handleExecute}
                                    handleQueryChange={handleQueryChange}
                            />
                        </Box>
                    </Stack>
                </Box>
                <Box 
                    sx={{
                        flex: 4,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'left',
                        borderLeft: '1px solid #cccfdb',
                        paddingLeft: '10px',
                        backgroundColor: '#fff',
                        width:'100'
                    }}
                >
                    {taskStatus === 'IN_PROGRESS' ? (
                        <LinearDeterminate />
                    ) : taskStatus === 'COMPLETE' ? (
                        <DisplayCode 
                            finalOutcomeCode={finalOutcomeCode}
                        />
                    ) : (
                        !lastQuery && <ApiChatBanner />
                    )}
                </Box>
            </Stack>
        </div>
    );
};

export default ApiCreateWithAI;
