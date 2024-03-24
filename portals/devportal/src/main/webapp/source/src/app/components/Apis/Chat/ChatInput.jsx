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
import { useSettingsContext } from 'AppComponents/Shared/SettingsContext';
import {
    TextField, Snackbar,
} from '@mui/material';

/**
 * Renders Chat Input view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Chat Input view.
 */
function ChatInput(props) {
    const { onSend } = props;
    const [content, setContent] = useState('');
    const [notificationOpen, setNotificationOpen] = useState(false);

    const { settings: { marketplaceAssistantEnabled, aiAuthTokenProvided } } = useSettingsContext();

    const handleChange = (e) => {
        const { value } = e.target;
        if (value.length > 4000) {
            setNotificationOpen(true);
            return;
        }
        setContent(value);
    };

    const handleSend = () => {
        if (!content) {
            setNotificationOpen(true);
            return;
        }
        onSend({ role: 'user', content });
        setContent('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.keyCode === 13 && e.shiftKey) {
            e.preventDefault();
            setContent(`${content}\n`);
        }
    };

    const handleCloseNotification = () => {
        setNotificationOpen(false);
    };

    return (
        <div>
            <TextField
                placeholder='Type a message...'
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                fullWidth
                multiline
                size='small'
                maxRows={12}
                disabled={(marketplaceAssistantEnabled && !aiAuthTokenProvided) || !marketplaceAssistantEnabled}
                InputProps={{
                    style: {
                        borderRadius: 10, padding: 18,
                    },
                }}
            />
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={notificationOpen}
                autoHideDuration={500}
                onClose={handleCloseNotification}
                message='Please enter a message'
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    transform: 'translate(50%, 50%)',
                    marginBottom: '300px',
                }}
            />
        </div>
    );
}

ChatInput.propTypes = {
    onSend: PropTypes.func.isRequired,
};
export default ChatInput;
