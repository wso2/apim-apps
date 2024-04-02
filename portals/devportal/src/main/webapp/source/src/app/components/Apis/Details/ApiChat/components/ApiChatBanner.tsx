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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// @ts-ignore
import { app } from 'Settings';
import { styled } from '@mui/material/styles';

const PREFIX = 'ApiChatBanner';

const classes = {
    tryAiBannerCont: `${PREFIX}-tryAiBannerCont`,
    tryAiBannerImgWrap: `${PREFIX}-tryAiBannerImgWrap`,
    tryAiBannerContentWrap: `${PREFIX}-tryAiBannerContentWrap`,
    tryAiBannerContent: `${PREFIX}-tryAiBannerContent`,
    tryAiBannerTriangle: `${PREFIX}-tryAiBannerTriangle`,
};

const Root = styled('div')(({ theme }: any) => ({
    [`& .${classes.tryAiBannerCont}`]: {
        display: 'flex',
        paddingLeft: theme.spacing(1),
        gridGap: theme.spacing(1.5),
        maxWidth: theme.spacing(85),
    },
    [`& .${classes.tryAiBannerImgWrap}`]: {
        flex: `0 0 ${theme.spacing(15)}px`,
        maxWidth: theme.spacing(15),
        fontSize: theme.spacing(15),
        display: 'flex',
        alignItems: 'center',
    },
    [`& .${classes.tryAiBannerContentWrap}`]: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
    },
    [`& .${classes.tryAiBannerContent}`]: {
        background: theme.palette.grey[100],
        padding: theme.spacing(2),
        borderRadius: theme.spacing(0, 2, 2, 2),
        position: 'relative',
    },
    [`& .${classes.tryAiBannerTriangle}`]: {
        position: 'absolute',
        width: theme.spacing(3),
        height: theme.spacing(3),
        top: 0,
        left: theme.spacing(-3),
        overflow: 'hidden',
        '&:before': {
            content: '""',
            display: 'block',
            width: '200%',
            height: '200%',
            position: 'absolute',
            borderRadius: '50%',
            top: 0,
            right: 0,
            boxShadow: `${theme.spacing(2.5)} ${theme.spacing(-3.75)} 0 0 ${theme.palette.grey[100]}`,
        },
    },
}));

const ApiChatBanner: React.FC = () => {
    const intl = useIntl();
    return (
        <Root>
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
                    'Effortlessly test your APIs in natural language with our API Chat Agent powered by Azure '
                    + "OpenAI's cutting-edge language models.",
                            })}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Root>
    );
};

export default ApiChatBanner;
