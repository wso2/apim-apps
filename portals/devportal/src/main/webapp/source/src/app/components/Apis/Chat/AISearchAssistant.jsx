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
import { Box } from '@mui/material';
import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import Settings from 'Settings';
import User from 'AppData/User';
import Utils from 'AppData/Utils';
import ChatBotIcon from './ChatIcon';
import ChatWindow from './ChatWindow';

/**
 * Renders AI Search Assistant view.
 *
 * @returns {JSX} renders Chat Icon view.
 */
function AISearchAssistant() {
    const { settings: { marketplaceAssistantEnabled } } = useSettingsContext();

    const [showChatbot, setShowChatbot] = useState(true);
    const [messages, setMessages] = useState('');
    const [chatbotDisabled, setChatbotDisabled] = useState(!marketplaceAssistantEnabled);
    const [user, setUser] = useState('You');

    const introMessage = {
        role: 'assistant',
        content: 'Hi there! I\'m Marketplace Assistant. I can help you with finding APIs '
            + 'and providing information related to APIs. How can I help you?',
    };

    const getUser = (environmentName = Utils.getCurrentEnvironment().label) => {
        const userData = localStorage.getItem(`${User.CONST.LOCALSTORAGE_USER}_${environmentName}`);
        const partialToken = Utils.getCookie(User.CONST.WSO2_AM_TOKEN_1, environmentName);
        const refreshToken = Utils.getCookie(User.CONST.WSO2_AM_REFRESH_TOKEN_1, environmentName);

        const isLoginCookie = Utils.getCookie('IS_LOGIN', 'DEFAULT');
        if (isLoginCookie) {
            Utils.deleteCookie('IS_LOGIN', Settings.app.context, 'DEFAULT');
            localStorage.removeItem(`${User.CONST.LOCALSTORAGE_USER}_${environmentName}`);
            return null;
        }
        if (!(userData && (partialToken || refreshToken))) {
            return null;
        }

        return User.fromJson(JSON.parse(userData), environmentName);
    };

    useEffect(() => {
        const messagesJSON = localStorage.getItem('messages');
        const loadedMessages = JSON.parse(messagesJSON);
        setMessages(loadedMessages);
    }, []);

    const toggleChatbot = () => {
        setShowChatbot(!showChatbot);
    };

    const handleDisableChatbot = () => {
        setChatbotDisabled(true);
        setMessages([introMessage]);
    };

    useEffect(() => {
        const messagesJSON = JSON.stringify(messages);
        localStorage.setItem('messages', messagesJSON);
    }, [messages]);

    useEffect(() => {
        try {
            const { name } = getUser();
            setUser(name);
            const messagesJSON = localStorage.getItem('messages');
            const loadedMessages = JSON.parse(messagesJSON);
            if (loadedMessages) {
                setMessages(loadedMessages);
            } else {
                setMessages([introMessage]);
                localStorage.setItem('messages', JSON.stringify([introMessage]));
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
                    />
                )
            )}
        </Box>
    );
}

export default AISearchAssistant;
