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
import PropTypes from 'prop-types';
import Fab from '@mui/material/Fab';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

/**
 * Renders Chat Icon view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Chat Icon view.
 */
function ChatBotIcon(props) {
    const { toggleChatbot, handleDisableChatbot, chatbotDisabled } = props;
    const [showCloseButton, setShowCloseButton] = useState(false);

    const handleMouseEnter = () => {
        setShowCloseButton(true);
    };

    const handleMouseLeave = () => {
        setShowCloseButton(false);
    };

    const handleCloseIconClick = () => {
        setShowCloseButton(false);
        handleDisableChatbot();
    };

    return (
        <>
            <div
                style={{ position: 'fixed', bottom: 20, right: 30 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {chatbotDisabled ? null : (
                    <Tooltip title='Open Chat' placement='left'>
                        <Fab color='primary' aria-label='chat' onClick={toggleChatbot} style={{ boxShadow: 'none' }}>
                            <ChatIcon />
                        </Fab>
                    </Tooltip>
                )}
                {showCloseButton && (
                    <Tooltip
                        title='Disable chat'
                        placement='left'
                    >
                        <Fab
                            color='secondary'
                            variant='round'
                            aria-label='close'
                            onClick={handleCloseIconClick}
                            style={{
                                position: 'absolute',
                                top: -18,
                                right: -18,
                                width: 34,
                                height: 16,
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                            }}
                        >
                            <CloseIcon fontSize='medium' style={{ fill: '#000', stroke: '#000' }} />
                        </Fab>
                    </Tooltip>
                )}
            </div>
        </>
    );
}

ChatBotIcon.propTypes = {
    toggleChatbot: PropTypes.func.isRequired,
    handleDisableChatbot: PropTypes.func.isRequired,
    chatbotDisabled: PropTypes.bool.isRequired,
};
export default ChatBotIcon;
