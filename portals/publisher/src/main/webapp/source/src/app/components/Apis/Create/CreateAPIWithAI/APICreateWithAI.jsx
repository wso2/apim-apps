/*eslint-disable*/
/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import ApiChatBanner from './components/ApiChatBanner';
import ApiChatExecute from './components/ApiChatExecute';
import ApiChatResponse from './components/ApiChatResponse';
import SampleQueryCard from './components/SampleQueryCard';
import DisplayCode from './components/DisplayCode';
import AlertDialog from './components/AlertDialog';
import WelcomeMessage from './components/WelcomeMessage';
import LoadingDots from './components/LoadingDots';
import { useHistory } from 'react-router-dom';
import API from 'AppData/api';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { FormattedMessage } from 'react-intl';
import LaunchIcon from '@mui/icons-material/Launch';
import Alert from '@mui/material/Alert';
import findBestMatchingAnswer from './components/SimilaritySearch';

/**
 * Renders the Create API with AI UI.
 * @returns {JSX} Create API with AI page to render.
 */
const ApiCreateWithAI = () => {
    const [sessionId, setSessionId] = useState(null);
    const [inputQuery, setInputQuery] = useState('');
    const [lastQuery, setLastQuery] = useState('');
    const [finalOutcome, setFinalOutcome] = useState('');
    const [apiType, setApiType] = useState('');
    const [finalOutcomeCode, setFinalOutcomeCode] = useState('');
    const [executionResults, setExecutionResults] = useState([]);
    const [messages, setMessages] = useState([]);
    const [taskId, setTaskId] = useState('');
    const [taskStatus, setTaskStatus] = useState('');
    const [loading, setLoading] = useState(false); 
    const [isSuggestion, setIsSuggestion] = useState('');
    const [selectedTitles, setSelectedTitles] = useState([]);
    const [paths, setPaths] = useState([]);
    const [apiTypeSuggestion, setApiTypeSuggestion] = useState('');
    const [missingValues, setMissingValues] = useState('');
    const history = useHistory();
    const [lastRenderedComponent, setLastRenderedComponent] = useState(<ApiChatBanner />);
    const { data: settings, isLoading } = usePublisherSettings();
    const [specEnrichmentError, setSpecEnrichmentError] = useState('');
    const [specEnrichmentErrorLevel, setSpecEnrichmentErrorLevel] = useState('');
    const [multiGateway, setMultiGateway] = useState([]);

    const gatewayDetails = {
        'wso2/synapse': {
            value: 'wso2/synapse',
            name: 'Universal Gateway',
            description: 'API gateway embedded in APIM runtime.',
            isNew: false
        },
        'wso2/apk': {
            value: 'wso2/apk',
            name: 'Kubernetes Gateway',
            description: 'API gateway running on Kubernetes.',
            isNew: false
        },
        'AWS': {
            value: 'AWS',
            name: 'AWS Gateway',
            description: 'API gateway offered by AWS cloud.',
            isNew: true
        }
    };

    const chatContainerRef = useRef(null);
    useEffect(() => {
        if (chatContainerRef.current) {
            const element = chatContainerRef.current;
            element.scrollTop = element.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (taskStatus === 'COMPLETE') {
            setLastRenderedComponent(
                <DisplayCode 
                    finalOutcomeCode={finalOutcomeCode}
                    apiType={apiType}
                    sessionId={sessionId}
                />
            );
        } else if (taskStatus === null) {
            setLastRenderedComponent(<ApiChatBanner />);
        }
    }, [taskStatus]);

    useEffect(() => {
        if (!isLoading) {
            const apiTypes = settings.gatewayFeatureCatalog.apiTypes;
            const data = settings.gatewayTypes;
            const gatewayTypes = data.map(item => {
                if (item === "Regular") return "wso2/synapse";
                if (item === "APK") return "wso2/apk";
                return item;
            });
            setMultiGateway(apiTypes?.rest.filter(t=>gatewayTypes.includes(t)).map(type => gatewayDetails[type]));

        }
    }, [isLoading]);

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
                { role: 'user', content: query },
            ]);

            if (!sessionId) {
                const newSessionId = generateSessionId();
                setSessionId(newSessionId);
                sendInitialRequest(query, newSessionId);
            } else {
                sendInitialRequest(query, sessionId);
            }
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

        if (!sessionId) {
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);
            sendInitialRequest(query, newSessionId);
        } else {
            sendInitialRequest(query, sessionId);
        }
    };

    const generateSessionId = () => {
        const uuid = (function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        })();
    
        const dateTime = new Date().toISOString();
        const sessionId = `${uuid}-${dateTime}`;
        const encodedSessionId = btoa(sessionId);
        const modifiedSessionId = encodedSessionId.slice(0, -2);
    
        return encodedSessionId;
    };
    
    const authTokenNotProvidedWarning = (
        <FormattedMessage
            id='Apis.Details.ApiChat.warning.authTokenMissing'
            defaultMessage={'You must provide a token to start using API Design Assistant. To obtain one, '
                + 'follow the steps provided under {apiAiChatDocLink} '}
            values={{
                apiAiChatDocLink: (
                    <a
                        id='api-chat-doc-link'
                        href='https://apim.docs.wso2.com/en/4.5.0/design/create-api/create-api-with-ai/'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Create APIs with AI
                        <LaunchIcon
                            style={{ marginLeft: '2px' }}
                            fontSize='small'
                        />
                    </a>
                ),
            }}
        />
    );

    const handleSelectedTitles = (titles) => { 
        const titlesString = 'Modify this API to include the following features as well:\n' + 
        titles.map(title => `- ${title}`).join('\n');
        setSelectedTitles(titlesString); 
        setLastQuery(titlesString);
        setTaskStatus('IN_PROGRESS');

        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: titlesString }
        ]);

        sendInitialRequest(titlesString, sessionId);
    };
    
    async function sendQuery(query, sessionId) { 
        try {
            const queryDesignAssistant = new API();
            const response = await queryDesignAssistant.sendChatAPIDesignAssistant(query, sessionId);
    
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response received from API.');
            }
    
            return response;
        } catch (error) {
            console.error('Error in sendQuery:', error);
            throw error;
        }
    }
    
    const sendInitialRequest = async (query, currentSessionId) => {
        setFinalOutcome('');
        setLoading(true);

        try {
            const queryText = query.trim().toLowerCase();
            const response = findBestMatchingAnswer(queryText);

            if (response) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: 'system', content: response, suggestions: false }
                ]);
            } else {
                const jsonResponse = await sendQuery(query, currentSessionId);
                
                const {
                    backendResponse,
                    isSuggestions,
                    typeOfApi,
                    code,
                    paths,
                    apiTypeSuggestion,
                    missingValues,
                    state
                } = jsonResponse;

                setFinalOutcome(backendResponse);
                setIsSuggestion(isSuggestions);
                setApiType(typeOfApi);
                setFinalOutcomeCode(code);
                setPaths(paths);
                setApiTypeSuggestion(apiTypeSuggestion);
                setMissingValues(missingValues);
                setTaskStatus(state);

                if (backendResponse) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: 'system', content: backendResponse, suggestions: isSuggestions }
                    ]);
                }

                if (apiTypeSuggestion) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: 'system', content: apiTypeSuggestion, suggestions: false }
                    ]);
                }

                if (missingValues) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: 'system', content: missingValues, suggestions: false }
                    ]);
                }
            }

        } catch (error) {
            console.error('Error:', error);

            let content;
            try {
                switch (error.response.status) {
                    case 401: // Unauthorized
                        content = 'Apologies for the inconvenience. It appears that your token is invalid or expired. Please'
                        + ' provide a valid token or upgrade your subscription plan.';
                        break;
                    case 429: // Token limit exceeded
                        content = 'Apologies for the inconvenience. It appears that the token limit has been exceeded.';
                        break;
                    case 504: // Handle gateway timeout scenario
                        content = 'Apologies for the inconvenience. The request has timed out. Please try again.';
                        break;
                    default:
                        content = 'Apologies for the inconvenience. It seems that something went wrong with the'
                        + ' API Design Assistant. Please try again.';
                        break;
                }

            } catch (err) {
                content = 'Apologies for the inconvenience. It seems that something went wrong with the'
                + ' API Design Assistant. Please try again.';
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'system', content: content, isSuggestions: false }
            ]);

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            history.goBack();
        } else {
            history.push('/apis');
        }

    };
    
    return (
        <div>
            <Stack 
                direction='column' 
                sx={{ width: '100%', height: 'calc(100vh - 99px)', minHeight: 'calc(100vh - 99px)' }}>
                <Box sx={{
                    display: 'flex',
                    flex: 9,
                    flexDirection: 'row',
                    paddingTop:'10px',
                    marginTop:'10px',
                    overflow: 'auto',
                }}>
                    <Stack
                        direction='row'
                        sx={{ width: '100%', height: '100%', overflow: 'auto' }}
                    >
                        <Box 
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                paddingTop:'10px',
                                paddingBottom:'10px',
                                marginLeft: '20px',
                                borderLeft: '1px solid #dee0e8',
                                borderBottom: '1px solid #dee0e8',
                                borderTop: '1px solid #dee0e8',
                                borderRight: '1px solid #dee0e8',
                                minwidth:'50%'
                            }}
                        >
                            <Stack
                                direction='column' 
                                sx={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
                            >
                                {!lastQuery && (
                                    <Box>
                                        <WelcomeMessage/>
                                        <Stack 
                                            direction="column" 
                                            spacing={2} 
                                            justifyContent="center"
                                            sx={{ 
                                                width: '420px', 
                                                display: 'flex', 
                                                marginTop: '40px', 
                                                marginLeft: 'auto', 
                                                marginRight: 'auto', 
                                                marginBottom: '0' 
                                            }}
                                        >
                                            <SampleQueryCard 
                                                onExecuteClick={handleExecuteSampleQuery} 
                                                queryHeading='Create an API for a banking transaction' 
                                                sx={{ textAlign: 'left' }} 
                                            />
                                            <SampleQueryCard 
                                                onExecuteClick={handleExecuteSampleQuery} 
                                                queryHeading='Create a GraphQL API to query patient data' 
                                                sx={{ textAlign: 'left' }} 
                                            />  
                                            <SampleQueryCard 
                                                onExecuteClick={handleExecuteSampleQuery} 
                                                queryHeading='Create an API for live sports scores' 
                                                sx={{ textAlign: 'left' }} 
                                            />                                          
                                        </Stack>
                                    </Box>
                                )}
                                <Box 
                                    ref={chatContainerRef} 
                                    sx={{ 
                                        flexGrow: 1, 
                                        textAlign: 'left', 
                                        overflowY: 'auto', 
                                        overflowX: 'auto', 
                                        scrollBehavior: 'smooth' }}
                                >
                                    {(lastQuery || finalOutcome) && (
                                        <ApiChatResponse 
                                            messages={messages} 
                                            onTitlesSelected={handleSelectedTitles}
                                            taskStatus={taskStatus}
                                        />
                                    )}
                                    {loading && <LoadingDots />}
                                </Box>
                                <Box>
                                    <Box 
                                        display='flex' 
                                        alignItems='center' 
                                        flexDirection='column' 
                                        marginTop={1} 
                                        marginBottom={2}
                                    >
                                        {/* Handle prepare call failed scenario */}
                                        {specEnrichmentError && specEnrichmentErrorLevel && (
                                            <Alert severity={specEnrichmentErrorLevel}>
                                                <Typography variant='body1'>
                                                    {specEnrichmentError}
                                                </Typography>
                                            </Alert>
                                        )}
                                        {/* Handle auth token not provided scenario */}
                                        {settings && !settings?.aiAuthTokenProvided && (
                                            <Alert severity='warning'>
                                                <Typography variant='body1'>
                                                    {authTokenNotProvidedWarning}
                                                </Typography>
                                            </Alert>
                                        )}
                                    </Box>
                                    <Box>
                                        <ApiChatExecute
                                            lastQuery={lastQuery}
                                            inputQuery={inputQuery}
                                            handleExecute={handleExecute}
                                            handleQueryChange={handleQueryChange}
                                            paths={paths} 
                                            loading={loading}
                                        />
                                    </Box>
                                </Box>
                                
                            </Stack>
                        </Box>
                        <Box 
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'left',
                                borderLeft: '1px solid #dee0e8',
                                borderRight: '1px solid #dee0e8',
                                borderBottom: '1px solid #dee0e8',
                                borderTop: '1px solid #dee0e8',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                backgroundColor: '#fff',
                                marginRight: '20px',
                                minwidth:'50%',
                                overflowY: 'hidden',
                                overflowX: 'hidden'
                            }}
                        >
                            {lastRenderedComponent}
                        </Box>
                    </Stack>
                </Box>
                <Box
                    sx={{ 
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding:'10px 20px',
                    }}
                >
                    <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={handleBack}
                        sx={{ marginRight: '10px', minWidth: '100px',  height: '35px',}}
                    >
                        Cancel
                    </Button>
                    <AlertDialog 
                        sessionId={sessionId}
                        loading={loading}
                        taskStatus={taskStatus}
                        spec={finalOutcomeCode}
                        apiType={apiType}
                        settings={settings}
                        multiGateway={multiGateway}
                    />
                </Box>
            </Stack>
        </div>
    );
};

export default ApiCreateWithAI;
