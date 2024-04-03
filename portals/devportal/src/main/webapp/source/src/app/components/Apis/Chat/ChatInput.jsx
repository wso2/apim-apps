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
    TextField, Snackbar, Typography, Box,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';

/**
 * Renders Chat Input view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Chat Input view.
 */
function ChatInput(props) {
    const { onSend, loading } = props;
    const [content, setContent] = useState('');
    const [notificationOpen, setNotificationOpen] = useState(false);
    const QUERY_CHARACTER_LIMIT = 500;

    const { settings: { marketplaceAssistantEnabled, aiAuthTokenProvided } } = useSettingsContext();

    const handleChange = (e) => {
        let { value } = e.target;
        if (value.length > QUERY_CHARACTER_LIMIT) {
            value = value.slice(0, QUERY_CHARACTER_LIMIT);
        }
        setContent(value);
    };

    const handleSend = () => {
        if (content) {
            onSend({ role: 'user', content });
            setContent('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!loading) {
                handleSend();
            }
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
                        borderRadius: 10, padding: 18, paddingRight: 4,
                    },
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton
                                aria-label='marketplace-chat-message'
                                onClick={handleSend}
                                disabled={loading}
                            >
                                <SendIcon color='primary' />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box display='flex' justifyContent='flex-end' mt={1} mr={1}>
                <Typography variant='caption'>
                    {content.length}
                    /
                    {QUERY_CHARACTER_LIMIT}
                </Typography>
            </Box>
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
    loading: PropTypes.bool.isRequired,
};
export default ChatInput;
