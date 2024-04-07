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

import React, { useRef } from 'react';
import { PropTypes } from 'prop-types';
import Utils from 'AppData/Utils';
import {
    Box, Typography, Card, CardContent, useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';

const getColorFromLetter = (letter, colorMap, offset) => {
    let charLightColor = colorMap[letter.toLowerCase()];

    if (!charLightColor) {
        const charNumber = parseInt(letter, 10);
        if (charNumber) {
            charLightColor = colorMap[String.fromCharCode(111 + charNumber)];
        } else {
            return [null, null];
        }
    }
    const { r, g, b } = Utils.hexToRGBHash(charLightColor);
    const dark = Utils.rgbToHex(r - Math.ceil(r * offset), g - Math.ceil(offset * g),
        b - Math.ceil(offset * b));
    return [charLightColor, dark];
};

/**
 * Renders a single Chat Message view.
 * @param {JSON} props Parent props.
 * @returns {JSX} Renders single Chat Message view.
 */
function ChatMessage(props) {
    const { message, user } = props;
    const outerBoxRef = useRef(null);
    const theme = useTheme();
    const {
        colorMap, offset,
    } = theme.custom.thumbnail;

    const profileStyle = {
        width: '26px',
        height: '26px',
        backgroundColor: message.role === 'assistant' ? '#10597f' : '#6d6d6d',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        margin: '10px 10px 10px 0px',
        borderRadius: message.role === 'assistant' ? '50% 50% 50% 0' : '50% 50% 50% 0',
    };

    const messageStyle = {
        textAlign: 'left',
        justifyContent: 'flex-start',
        background: message.role === 'assistant' ? theme.palette.grey[100] : '#fff',
        color: 'black',
        borderRadius: '8px',
        overflow: 'auto',
        overflowX: 'auto',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        marginLeft: '20px',
        maxWidth: '84%',
    };

    return (
        <Box
            display='flex'
            flexDirection='column'
            alignItems='flex-start'
        >
            {message.role === 'assistant' && (
                <Box display='flex-start' alignItems='center' flexDirection='column' width='90%'>
                    <Box display='flex' alignItems='center' width='100%'>
                        <div style={profileStyle}>
                            <ChatIcon style={{ fill: '#fff', stroke: '#fff', fontSize: 'small' }} />
                        </div>
                        <Typography variant='body1' style={{ fontWeight: '500', fontSize: '12pt' }}>Assistant</Typography>
                    </Box>
                </Box>
            )}

            {message.role === 'user' && (
                <Box display='flex' alignItems='center'>
                    <div style={profileStyle}>
                        <PersonIcon style={{ fill: '#fff', stroke: '#fff', fontSize: 'large' }} />
                    </div>
                    <Typography variant='body1' fontWeight='500' fontSize='12pt'>
                        {user.charAt(0).toUpperCase() + user.slice(1)}
                    </Typography>
                </Box>
            )}
            <Box
                style={{
                    ...messageStyle,
                    maxWidth: '84%',
                }}
                ref={outerBoxRef}
                px={2}
                py={message.role === 'assistant' ? 2 : 0}
            >
                <Typography>
                    {message.content}
                </Typography>
            </Box>
            <Box display='flex-start' alignItems='center' flexDirection='column' width='90%'>
                {message.apis && (
                    <Box display='flex' flexDirection='row' flexWrap='wrap' marginLeft='20px' marginRight='16px' width='100%'>
                        {message.apis.map((api) => {
                            const [light, dark] = getColorFromLetter(api.name.substring(0, 1), colorMap, offset);
                            const background = light && `linear-gradient(to right, ${light}, ${dark})`;

                            return (
                                <a
                                    key={api.id}
                                    href={api.apiPath}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        width: '33%',
                                    }}
                                >
                                    <Card style={{
                                        margin: '10px 10px 0 0', width: '97%', height: '70px', background,
                                    }}
                                    >
                                        <CardContent style={{ wordWrap: 'break-word', alignItems: 'center', cursor: 'pointer' }}>
                                            <Typography
                                                variant='subtitle1'
                                                gutterBottom
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    margin: 0,
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {api.name}
                                            </Typography>
                                            <Typography
                                                variant='subtitle1'
                                                gutterBottom
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    fontSize: '10px',
                                                    color: '#fff',
                                                }}
                                            >
                                                Version:
                                                {api.version}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </a>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

ChatMessage.propTypes = {
    message: PropTypes.shape({
        role: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        apis: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    user: PropTypes.string.isRequired,
};
export default ChatMessage;
