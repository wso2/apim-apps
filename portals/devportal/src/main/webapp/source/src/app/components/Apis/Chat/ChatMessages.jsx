import React, { useRef, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Box, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import Loader from './Loader';

/**
 * Renders Chat Messages view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Chat Messages view.
 */
function ChatMessages(props) {
    const {
        messages, loading, onSend, user,
    } = props;
    const messagesEndRef = useRef(null);

    // eslint-disable-next-line max-len
    const subjectLine = 'AI Assistant can make mistakes. Consider checking important information.';

    const style = {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#567189',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        margin: '10px 10px 10px 0px',
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <Box
            maxHeight='100%'
            display='flex'
            flexDirection='column'
            marginLeft='5%'
            // marginRight='5%'
        >
            <Box
                display='flex'
                justifyContent='center'
                overflow='auto'
            >
                <Box
                    maxWidth='1320px'
                    width='100%'
                >
                    {messages.map((message, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Box key={index} my={1}>
                            <ChatMessage message={message} user={user} />
                        </Box>
                    ))}

                    {loading && (
                        <Box
                            display='flex'
                            flexDirection='column'
                            alignItems='flex-start'
                        >
                            <Box display='flex' alignItems='center'>
                                <div style={style}>
                                    <ChatIcon fontSize='small' style={{ fill: '#fff', stroke: '#fff' }} />
                                </div>
                                <Typography variant='body1' style={{ fontWeight: '500', fontSize: '12pt' }}>Assistant</Typography>
                            </Box>
                            <Box
                                textAlign='left'
                                bgcolor='#fff'
                                borderRadius='10px'
                                justifyContent='flex-start'
                                px={3}
                                marginLeft='18px'
                                style={{
                                    maxWidth: '30px',
                                }}
                            >
                                <Loader />
                            </Box>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>
            </Box>

            <Box
                display='flex'
                justifyContent='center'
            >
                <Box
                    mt={1.5}
                    mb={0.5}
                    width='100%'
                    maxWidth='1380px'
                    marginRight='5%'
                >
                    <ChatInput onSend={onSend} />
                </Box>

            </Box>
            <Box mb={1}>
                <Typography
                    color='#64686e'
                    variant='body2'
                    fontSize='8pt'
                    textAlign='center'
                    lineHeight='1.4'
                    marginRight='5%'
                >
                    {subjectLine}
                </Typography>
            </Box>
        </Box>
    );
}

ChatMessages.propTypes = {
    messages: PropTypes.instanceOf(Array).isRequired,
    loading: PropTypes.bool.isRequired,
    onSend: PropTypes.func.isRequired,
    user: PropTypes.string.isRequired,
};
export default ChatMessages;
