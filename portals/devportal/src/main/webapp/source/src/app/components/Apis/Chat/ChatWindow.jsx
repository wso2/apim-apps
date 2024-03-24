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

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Api from 'AppData/api';
import {
    Container, Box,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import ChatMessages from './ChatMessages';
import Header from './Header';

/**
 * Renders Chat Messages view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Chat Window view.
 */
function ChatWindow(props) {
    const {
        toggleChatbot, toggleClearChatbot, messages, setMessages, introMessage, user,
    } = props;

    const [loading, setLoading] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [apiLimitExceeded, setApiLimitExceeded] = useState(false);
    const [apisCount, setApisCount] = useState(0);
    const responseRef = useRef([]);

    const pathName = window.location.pathname;
    const { search, origin } = window.location;

    const [, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const toggleFullScreen = (e) => {
        e.preventDefault();
        setIsClicked(!isClicked);
    };

    const apiCall = (query) => {
        setLoading(true);

        const restApi = new Api();
        const messagesWithoutApis = messages.slice(-10).map(({ apis, ...message }) => message);

        restApi.marketplaceAssistantExecute(query, messagesWithoutApis)
            .then((result) => {
                const { apis } = result.body;

                const apiPaths = apis.map((api) => {
                    return { apiPath: `${origin}${pathName}/${api.apiId}/overview${search}`, name: api.apiName };
                });
                responseRef.current = [...responseRef.current, { role: 'assistant', content: result.body.response, apis: apiPaths }];
                setMessages(responseRef.current);
                return result.body;
            }).catch((error) => {
                let content;
                try {
                    switch (error.response.status) {
                        case 401: // Unauthorized
                            content = 'Unauthorized access. Please login to continue.';
                            break;
                        case 429: // Token limit exceeded
                            content = 'Token Limit is exceeded. Please try again later.';
                            break;
                        default:
                            content = 'Something went wrong. Please try again later.';
                            break;
                    }
                } catch (err) {
                    content = 'Something went wrong. Please try again later.';
                }

                const errorMessage = { role: 'assistant', content };
                responseRef.current = [...responseRef.current, errorMessage];
                setMessages(responseRef.current);

                throw error;
            }).finally(() => {
                setLoading(false);
            });
    };

    const handleClear = () => {
        setMessages([introMessage]);
        toggleClearChatbot();
    };

    const handleSend = async (message) => {
        responseRef.current = [...responseRef.current, { role: 'user', content: message.content.trim() }];
        setMessages(responseRef.current);
        apiCall(message.content);
    };

    const handleReset = () => {
        responseRef.current = [introMessage];
        setMessages([introMessage]);
    };

    useEffect(() => {
        responseRef.current = messages;
        const restApi = new Api();

        restApi
            .getMarketplaceAssistantApiCount()
            .then((data) => {
                const apiCount = data.body.count;
                const apiLimit = data.body.limit;
                setApisCount(apiCount);
                if (apiCount >= apiLimit) {
                    setApiLimitExceeded(true);
                }
            })
            .catch((error) => {
                console.error(error);
            });
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
                    {apiLimitExceeded ? (
                        <Alert severity='warning' style={{ borderRadius: '0px', zIndex: 2999, padding: '0 10px 0 10px' }}>
                            You have reached your maximum number of apis. The answers will be limited to the first 1000 apis.
                        </Alert>
                    ) : (
                        <Alert severity='info' style={{ borderRadius: '0px', zIndex: 2999, padding: '0 10px 0 10px' }}>
                            {`The Assistant is using ${apisCount} apis to provide answers.`}
                        </Alert>
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
};
export default ChatWindow;
