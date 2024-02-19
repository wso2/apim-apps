import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Settings from 'Settings';
import queryString from 'query-string';
import User from 'AppData/User';
import Utils from 'AppData/Utils';
import ChatBotIcon from './ChatIcon';
import ChatWindow from './ChatWindow';

/**
 * Renders AI Search Assistant view..
 * @returns {JSX} renders Chat Icon view.
 */
function AISearchAssistant() {
    const introMessage = {
        role: 'assistant',
        // eslint-disable-next-line max-len
        content: 'Hi there! I\'m Marketplace Assistant. I can help you with finding APIs and providing information related to APIs. How can I help you?',
    };
    const [user, setUser] = useState('You');

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

    const getMessages = () => {
        const messagesJSON = localStorage.getItem('messages');
        const loadedMessages = JSON.parse(messagesJSON);
        return loadedMessages;
    };

    const [showChatbot, setShowChatbot] = useState(true);
    const [messages, setMessages] = useState(getMessages);
    const [chatbotDisabled, setChatbotDisabled] = useState(false);
    const [tenantDomain, setTenantDomain] = useState('carbon.super');

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

    useEffect(() => {
        if (window.location.search) {
            const { tenant } = queryString.parse(window.location.search);
            setTenantDomain(tenant);
        } else {
            const { app: { customUrl: { tenantDomain: customUrlEnabledDomain } } } = Settings;
            let tenantID = '';
            if (customUrlEnabledDomain !== 'null') {
                tenantID = customUrlEnabledDomain;
                setTenantDomain(tenantID);
            }
        }
    }, []);

    let content;

    if (chatbotDisabled) {
        content = null;
    } else if (showChatbot) {
        content = (
            <Box position='absolute' bottom={24} right={24}>
                <ChatBotIcon toggleChatbot={toggleChatbot} handleDisableChatbot={handleDisableChatbot} chatbotDisabled={chatbotDisabled} />
            </Box>
        );
    } else {
        content = (
            <ChatWindow
                toggleChatbot={toggleChatbot}
                messages={messages}
                setMessages={setMessages}
                tenantDomain={tenantDomain}
                introMessage={introMessage}
                user={user}
            />
        );
    }

    return <div>{content}</div>;
}

export default AISearchAssistant;
