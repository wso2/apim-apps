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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Api from 'AppData/api';
import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import {
    Container, Box,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import ChatMessages from './ChatMessages';
import Header from './Header';
import findBestMatchingAnswer from './SimilaritySearch';

/**
 * Renders Chat Messages view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Chat Window view.
 */
function ChatWindow(props) {
    const {
        toggleChatbot, toggleClearChatbot, messages, setMessages, introMessage, user, loading, responseRef, apiCall,
    } = props;

    const [isClicked, setIsClicked] = useState(false);
    const [apiLimitExceeded, setApiLimitExceeded] = useState(false);
    const [apisCount, setApisCount] = useState(null);
    const [limit, setLimit] = useState(null);

    const { settings: { marketplaceAssistantEnabled, aiAuthTokenProvided } } = useSettingsContext();

    const [, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const toggleFullScreen = (e) => {
        e.preventDefault();
        setIsClicked(!isClicked);
    };

    const handleClear = () => {
        setMessages([introMessage]);
        toggleClearChatbot();
    };

    const handleSend = async (message) => {
        responseRef.current = [...responseRef.current, { role: 'user', content: message.content.trim() }];
        setMessages(responseRef.current);

        const query = message.content.trim().toLowerCase();

        const response = findBestMatchingAnswer(query);
        if (response) {
            responseRef.current = [...responseRef.current, { role: 'assistant', content: response.trim() }];
            setMessages(responseRef.current);
        } else {
            apiCall(message.content);
        }
    };

    const handleReset = () => {
        responseRef.current = [introMessage];
        setMessages([introMessage]);
    };

    useEffect(() => {
        responseRef.current = messages;

        if (marketplaceAssistantEnabled && aiAuthTokenProvided) {
            const restApi = new Api();
            restApi
                .getMarketplaceAssistantApiCount()
                .then((data) => {
                    const apiCount = data.body.count;
                    const apiLimit = data.body.limit;
                    setApisCount(apiCount);
                    setLimit(apiLimit);
                    if (apiCount >= apiLimit - 50) {
                        setApiLimitExceeded(true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (

        <ResizableBox
            width={isClicked ? window.innerWidth : 500}
            height={window.innerHeight - 64}
            minConstraints={[500, window.innerHeight]}
            maxConstraints={[window.innerWidth, window.innerHeight - 64]}
            resizeHandles={['w']}
            style={{
                position: 'fixed',
                bottom: 1,
                right: 0,
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
                zIndex: 1200,
            }}
            handle={(
                <span
                    style={{
                        width: '4px',
                        cursor: 'ew-resize',
                        minWidth: '4px',
                    }}
                />
            )}
        >
            <Container
                maxWidth={false}
                style={{
                    padding: 0,
                    backgroundColor: '#fff',
                    border: '0px solid #808e96',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    margin: '4px 4px 4px 0',
                }}
            >
                <Box
                    display='flex'
                    flexDirection='column'
                    style={{
                        height: '100%',
                    }}
                >
                    <Header
                        toggleChatbot={toggleChatbot}
                        toggleFullScreen={toggleFullScreen}
                        handleClear={handleClear}
                        handleReset={handleReset}
                        isClicked={isClicked}
                    />
                    {/* Alert to show API count info */}
                    {marketplaceAssistantEnabled && aiAuthTokenProvided && apiLimitExceeded && (
                        (apisCount >= limit) ? (
                            <Alert severity='error' style={{ borderRadius: '0px', zIndex: 2999, padding: '0 10px 0 10px' }}>
                                {`You are reached your maximum limit (${limit} apis) for API usage.`}
                            </Alert>
                        ) : (
                            <Alert severity='warning' style={{ borderRadius: '0px', zIndex: 2999, padding: '0 10px 0 10px' }}>
                                {`You are approaching your maximum limit for API usage. You can utilize up to ${limit} APIs.
                                    Currently, you have utilized ${apisCount} APIs.`}
                            </Alert>
                        )
                    )}

                    <Box
                        flexGrow={1}
                        display='flex'
                        overflow='auto'
                        flexDirection='column'
                        justifyContent='flex-end'
                    >
                        <ChatMessages
                            messages={messages}
                            loading={loading}
                            onSend={handleSend}
                            onReset={handleReset}
                            user={user}
                        />
                    </Box>
                </Box>
            </Container>
        </ResizableBox>
    );
}

ChatWindow.propTypes = {
    toggleChatbot: PropTypes.func.isRequired,
    toggleClearChatbot: PropTypes.func.isRequired,
    messages: PropTypes.instanceOf(Array).isRequired,
    setMessages: PropTypes.func.isRequired,
    introMessage: PropTypes.shape({
        role: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
    }).isRequired,
    user: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    responseRef: PropTypes.shape({
        current: PropTypes.arrayOf(PropTypes.shape({
            role: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
        })).isRequired,
    }).isRequired,
    apiCall: PropTypes.func.isRequired,
};
export default ChatWindow;
