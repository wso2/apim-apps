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

import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import Api from 'AppData/api';
import Utils from 'AppData/Utils';
import ChatBotIcon from './ChatIcon';
import ChatWindow from './ChatWindow';

/**
 * Renders AI Search Assistant view.
 *
 * @returns {JSX} renders Chat Icon view.
 */
function AISearchAssistant() {
    const { settings: { marketplaceAssistantEnabled, aiAuthTokenProvided } } = useSettingsContext();

    const [showChatbot, setShowChatbot] = useState(true);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState(null);
    const [chatbotDisabled, setChatbotDisabled] = useState(!marketplaceAssistantEnabled);
    const [user, setUser] = useState('You');
    const responseRef = useRef([]);

    const introMessage = {
        role: 'assistant',
        content: 'Hello! I\'m here to assist you in discovering and obtaining information about APIs.'
        + ' How can I help you?',
    };

    const pathName = window.location.pathname;
    const { search, origin } = window.location;

    const apiCall = (query) => {
        setLoading(true);

        if (marketplaceAssistantEnabled && aiAuthTokenProvided) {
            const restApi = new Api();
            const messagePayload = messages.slice(-10).map(({ apis, ...message }) => {
                if (!apis) {
                    return message;
                }
                const apiList = apis.map((api) => ({ apiName: api.name, version: api.version }));
                return { role: message.role, content: JSON.stringify({ response: message.content, apis: apiList }) };
            });

            restApi.marketplaceAssistantExecute(query, messagePayload)
                .then((result) => {
                    const { apis } = result.body;

                    const apiPaths = apis.map((api) => {
                        return { apiPath: `${origin}${pathName}/${api.apiId}/overview${search}`, name: api.apiName, version: api.version };
                    });
                    responseRef.current = [...responseRef.current, { role: 'assistant', content: result.body.response, apis: apiPaths }];
                    setMessages(responseRef.current);
                    return result.body;
                }).catch((error) => {
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
                            default:
                                content = 'Apologies for the inconvenience. It seems that something went wrong with the'
                                + ' Marketplace Assistant. Please try again later.';
                                break;
                        }
                    } catch (err) {
                        content = 'Apologies for the inconvenience. It seems that something went wrong with the'
                        + ' Marketplace Assistant. Please try again later.';
                    }

                    const errorMessage = { role: 'assistant', content };
                    responseRef.current = [...responseRef.current, errorMessage];
                    setMessages(responseRef.current);

                    throw error;
                }).finally(() => {
                    setLoading(false);
                });
        }
    };

    const toggleChatbot = () => {
        setShowChatbot(!showChatbot);
    };

    const handleDisableChatbot = () => {
        setChatbotDisabled(true);
        setMessages([introMessage]);
    };

    useEffect(() => {
        if (messages) {
            const messagesJSON = JSON.stringify({ messages, timestamp: Date.now() });
            localStorage.setItem('messages', messagesJSON);
        }
    }, [messages]);

    useEffect(() => {
        try {
            const loggedInUser = Utils.getUser();
            if (loggedInUser) {
                setUser(loggedInUser);
            }
            const storedData = localStorage.getItem('messages');
            if (storedData) {
                const { messages: storedMessages, timestamp } = JSON.parse(storedData);
                if (Date.now() - timestamp > 60 * 60 * 1000) {
                    setMessages([introMessage]);
                    localStorage.setItem('messages',
                        JSON.stringify({ messages: [introMessage], timestamp: Date.now() }));
                } else {
                    setMessages(storedMessages);
                }
            } else {
                setMessages([introMessage]);
                localStorage.setItem('messages', JSON.stringify({ messages: [introMessage], timestamp: Date.now() }));
            }
        } catch (error) {
            console.error('Error loading messages from localStorage:', error);
        }
    }, []);

    return (
        <Box>
            {!chatbotDisabled && (
                showChatbot ? (
                    <Box position='absolute' bottom={24} right={24}>
                        <ChatBotIcon
                            toggleChatbot={toggleChatbot}
                            handleDisableChatbot={handleDisableChatbot}
                            chatbotDisabled={chatbotDisabled}
                        />
                    </Box>
                ) : (
                    <ChatWindow
                        toggleChatbot={toggleChatbot}
                        messages={messages}
                        setMessages={setMessages}
                        introMessage={introMessage}
                        user={user}
                        loading={loading}
                        responseRef={responseRef}
                        apiCall={apiCall}
                    />
                )
            )}
        </Box>
    );
}

export default AISearchAssistant;
