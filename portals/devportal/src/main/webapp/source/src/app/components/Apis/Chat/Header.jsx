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

import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import 'react-resizable/css/styles.css';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import Tooltip from '@mui/material/Tooltip';
import RestartAltTwoToneIcon from '@mui/icons-material/RestartAltTwoTone';
import { styled, alpha } from '@mui/material/styles';

const PREFIX = 'marketplace-assistant-chatbot-header';

const classes = {
    mainHeader: `${PREFIX}-mainHeader`,
    chatbotNameBox: `${PREFIX}-chatbotNameBox`,
    chatbotName: `${PREFIX}-chatbotName`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.chatbotNameBox}`]: {
        padding: '2px 18px 1px 10px',
        margin: '12px 0 12px auto',
        borderBottom: '2px solid #10597f',
        borderLeft: '2px solid #10597f',
        borderRight: '2px solid #10597f',
        borderRadius: '38px',
    },
    [`& .${classes.chatbotName}`]: {
        marginBottom: -5,
        fontSize: '12pt',
        fontWeight: '500',
        color: '#10597f',
    },
    [`& .${classes.mainHeader}`]: {
        borderColor: alpha(theme.palette.common.black, 0.1),
    },
}));

/**
 * Header of the Marketplace Assistant Chatbot
 *
 * @param {*} props properties
 * @returns {JSX} renders header view
 */
function Header(props) {
    const {
        toggleChatbot, toggleFullScreen, isClicked, handleReset,
    } = props;
    return (
        <Root>
            <Box
                display='flex'
                flexDirection='row'
                justifyContent='space-between'
                borderBottom={1}
                className={classes.mainHeader}
            >
                <Box>
                    <IconButton
                        onClick={toggleFullScreen}
                        style={{
                            alignSelf: 'flex-end', padding: '12px', color: '#10597f', margin: '6px 2px',
                        }}
                    >
                        {isClicked ? (
                            <FullscreenExitIcon fontSize='large' />
                        ) : (
                            <FullscreenIcon fontSize='large' />
                        )}
                    </IconButton>
                    <Tooltip title='Reset Chat' placement='right'>
                        <IconButton
                            onClick={handleReset}
                            style={{
                                alignSelf: 'flex-end', padding: '12px', color: '#10597f', margin: '6px 0',
                            }}
                        >
                            <RestartAltTwoToneIcon fontSize='large' />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box display='flex' flexDirection='column' className={classes.chatbotNameBox}>
                    <Typography variant='body1' className={classes.chatbotName}>
                        <FormattedMessage
                            id='Apis.Chat.Header.MarketplaceAssistantBanner.title'
                            defaultMessage='API Marketplace Assistant'
                        />
                    </Typography>
                    <Typography variant='caption' sx={{ textAlign: 'right', marginRight: -1 }}>
                        <FormattedMessage
                            id='Apis.Chat.Header.MarketplaceAssistantBanner.experimental'
                            defaultMessage='Experimental'
                        />
                    </Typography>
                </Box>
                <Box>
                    <IconButton
                        onClick={toggleChatbot}
                        style={{
                            alignSelf: 'flex-end', padding: '12px', color: '#10597f', margin: '6px 2px',
                        }}
                    >
                        <ExpandMoreTwoToneIcon fontSize='large' />
                    </IconButton>
                </Box>
            </Box>
        </Root>
    );
}
Header.propTypes = {
    toggleChatbot: PropTypes.func.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    isClicked: PropTypes.bool.isRequired,
    handleReset: PropTypes.func.isRequired,
};
export default Header;
