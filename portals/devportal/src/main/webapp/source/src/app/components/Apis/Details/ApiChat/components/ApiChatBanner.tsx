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
import { useIntl } from 'react-intl';
import { Box, Typography } from '@material-ui/core';
// @ts-ignore
import { app } from 'Settings';
import { useStyles } from '../ApiChat.styles';

const ApiChatBanner: React.FC = () => {
    const classes = useStyles();
    const intl = useIntl();
    return (
        <Box className={classes.tryAiBannerCont}>
            <Box className={classes.tryAiBannerImgWrap}>
                <img
                    alt='API Chat'
                    src={`${app.context}/site/public/images/ai/ApiChat.svg`}
                />
            </Box>
            <Box className={classes.tryAiBannerContentWrap}>
                <Box className={classes.tryAiBannerContent}>
                    <Box className={classes.tryAiBannerTriangle} />
                    <Typography variant='h5'>
                        {intl.formatMessage({
                            id: 'Apis.Details.ApiChat.components.ApiChatBanner.apiChatMainTextHeader',
                            defaultMessage: 'Your API is now equipped with an Intelligent Agent!',
                        })}
                    </Typography>
                    <Typography variant='caption'>
                        {intl.formatMessage({
                            id: 'Apis.Details.ApiChat.components.ApiChatBanner.apiChatMainTextContent',
                            defaultMessage:
                'Effortlessly engage with your APIs in natural language with our API Chat Agent powered by Azure '
                + "OpenAI's cutting-edge language models.",
                        })}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ApiChatBanner;
