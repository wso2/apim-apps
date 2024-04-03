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
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface ApiChatPoweredByProps {
    openConfigureKey: any;
    showSampleQueries?: boolean;
    goBack: () => void;
    disableGoBack: boolean;
    disableConfigureKey: boolean;
}

/**
 * Renders the API Chat powered by section.
 * @returns {TSX} API Chat powered by section to render.
 */
const ApiChatPoweredBy: React.FC<ApiChatPoweredByProps> = ({
    openConfigureKey,
    goBack,
    disableGoBack,
    disableConfigureKey,
}) => {
    return (
        <Box display='flex' width='100%' m={3}>
            <Box display='flex' flexDirection='column' flexGrow={1}>
                <Box display='flex'>
                    <Typography id='itest-api-details-api-chat-title' variant='h3' component='h3'>
                        <FormattedMessage
                            id='Apis.Details.ApiChat.components.ApiChatPoweredBy.apiChatMainHeader'
                            defaultMessage='API Chat'
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
                <Typography variant='body2' color='textSecondary' component='p'>
                    <FormattedMessage
                        id='Apis.Details.ApiChat.components.ApiChatPoweredBy.poweredByText'
                        defaultMessage='Powered by Azure OpenAI'
                    />
                </Typography>
            </Box>
            <Box>
                <Box display='flex' pr={4}>
                    <Box mr={3}>
                        <Button
                            startIcon={<KeyboardBackspaceIcon />}
                            id='go-back'
                            variant='text'
                            size='small'
                            onClick={goBack}
                            disabled={disableGoBack}
                        >
                            <FormattedMessage
                                id='Apis.Details.ApiChat.components.ApiChatPoweredBy.goBack'
                                defaultMessage='Go Back'
                            />
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            startIcon={<SettingsOutlinedIcon />}
                            id='view-sample-queries'
                            variant='text'
                            size='small'
                            onClick={openConfigureKey}
                            disabled={disableConfigureKey}
                        >
                            <FormattedMessage
                                id='Apis.Details.ApiChat.components.ApiChatPoweredBy.configureKey'
                                defaultMessage='Configure Key'
                            />
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ApiChatPoweredBy;
