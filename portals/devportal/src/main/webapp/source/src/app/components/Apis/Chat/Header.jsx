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
import 'react-resizable/css/styles.css';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import Tooltip from '@mui/material/Tooltip';
import RestartAltTwoToneIcon from '@mui/icons-material/RestartAltTwoTone';
import { styled } from '@mui/material/styles';

const PREFIX = 'marketplace-assistant-chatbot-header';

const classes = {
    chatbotName: `${PREFIX}-chatbotName`,
    betaChip: `${PREFIX}-betaChip`,
};

const Root = styled('div')(() => ({
    [`& .${classes.chatbotName}`]: {
        variant: 'body1',
        fontSize: '12pt',
        fontWeight: '500',
        color: '#000',
        padding: '5px 8px 3px 8px',
        margin: '12px 0 12px 0',
    },
    [`& .${classes.betaChip}`]: {
        variant: 'body1',
        fontSize: '7pt',
        color: '#fff',
        padding: '2px 4px 0px 4px',
        margin: '10px 0 28px 0',
        backgroundColor: '#297d9e',
        borderRadius: '6px',
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
                borderColor='#808e96'
            >
                <Box>
                    <IconButton
                        onClick={toggleFullScreen}
                        style={{ alignSelf: 'flex-end', padding: '12px' }}
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
                            style={{ alignSelf: 'flex-end', padding: '12px' }}
                        >
                            <RestartAltTwoToneIcon fontSize='large' />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box display='flex'>
                    <Typography className={classes.chatbotName}>
                        AI Assistant
                    </Typography>
                    <Typography className={classes.betaChip}>
                        Beta
                    </Typography>
                    <IconButton
                        onClick={toggleChatbot}
                        style={{ alignSelf: 'flex-end', padding: '12px', marginRight: '6px' }}
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
