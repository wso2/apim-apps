/* eslint-disable */
/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface ApiChatPoweredByProps {
    showSampleQueries?: boolean;
}

/**
 * Renders the API Chat powered by section.
 * @returns {TSX} API Chat powered by section to render.
 */
const ApiChatPoweredBy: React.FC<ApiChatPoweredByProps> = ({
}) => {
    return (
        <Box display='flex' width='100%' m={3}>
            <Box display='flex' flexDirection='column' flexGrow={1}>
                <Box display='flex'>
                    <Typography
                        id='itest-api-details-api-chat-title'
                        component='h3'
                        sx={{ fontSize: '2rem', fontWeight: 'bold' }}
                    >
                        <FormattedMessage
                            id='Apis.Details.ApiChat.components.ApiChatPoweredBy.apiChatMainHeader'
                            defaultMessage='API Design Assistant'
                        />
                    </Typography>
                    <Chip
                        label='Experimental'
                        variant='outlined'
                        size='small'
                        color='primary'
                        sx={{
                            ml: 1,
                        }}
                    />
                </Box>
            </Box>
            <Box>
                <Box display='flex' pr={4}>
                </Box>
            </Box>
        </Box>
    );
};

export default ApiChatPoweredBy;
