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

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DangerousIcon from '@mui/icons-material/Dangerous';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled, alpha } from '@mui/material/styles';
import { CircularProgress, Typography } from '@mui/material';
import MonacoEditor from 'react-monaco-editor';
import xmlFormat from 'xml-formatter';
import Utils from 'AppData/Utils';
import CustomIcon from 'AppComponents/Shared/CustomIcon';

const PREFIX = 'ApiChatResponse';

const classes = {
    finalOutcomeContent: `${PREFIX}-finalOutcomeContent`,
    lastQueryWrap: `${PREFIX}-lastQueryWrap`,
    queryProcessLoader: `${PREFIX}-queryProcessLoader`,
    responseBannerContentWrap: `${PREFIX}-responseBannerContentWrap`,
    responseBannerContent: `${PREFIX}-responseBannerContent`,
    responseBannerTriangle: `${PREFIX}-responseBannerTriangle`,
    queryBannerTriangle: `${PREFIX}-queryBannerTriangle`,
    queryBannerContent: `${PREFIX}-queryBannerContent`,
    queryBannerContentWrap: `${PREFIX}-queryBannerContentWrap`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.finalOutcomeContent}`]: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        textAlign: 'justify',
    },
    [`& .${classes.lastQueryWrap}`]: {
        margin: theme.spacing(1, 4),
    },
    [`& .${classes.queryProcessLoader}`]: {
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
    },
    [`& .${classes.responseBannerContentWrap}`]: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
    },
    [`& .${classes.queryBannerContentWrap}`]: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    [`& .${classes.responseBannerContent}`]: {
        width: '100%',
        background: theme.palette.grey[100],
        padding: theme.spacing(2),
        borderRadius: theme.spacing(0, 2, 2, 2),
        position: 'relative',
    },
    [`& .${classes.queryBannerContent}`]: {
        background: `${alpha(theme.palette.primary.main, 0.1)}`,
        padding: theme.spacing(2),
        borderRadius: theme.spacing(2, 0, 2, 2),
        position: 'relative',
    },
    [`& .${classes.queryBannerTriangle}`]: {
        color: 'red',
        position: 'absolute',
        width: theme.spacing(33),
        height: theme.spacing(33),
        top: 0,
        right: theme.spacing(-2),
        overflow: 'hidden',
        '&:before': {
            content: '""',
            display: 'block',
            width: '200%',
            height: '200%',
            position: 'absolute',
            borderRadius: '50%',
            top: 0,
            left: 0,
        },
    },
    [`& .${classes.responseBannerTriangle}`]: {
        position: 'absolute',
        width: theme.spacing(3),
        height: theme.spacing(3),
        top: 0,
        left: theme.spacing(-2),
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
        },
    },
}));

interface ApiChatResponseProps {
    lastQuery: string;
    executionResults: any;
    finalOutcome: string;
    isAgentRunning: boolean;
    isAgentTerminating: boolean;
    isExecutionError: boolean;
}

/**
 * Renders the API Chat results view.
 * @returns {TSX} API Chat results view to render.
 */
const ApiChatResponse: React.FC<ApiChatResponseProps> = ({
    lastQuery,
    executionResults,
    finalOutcome,
    isAgentRunning,
    isAgentTerminating,
    isExecutionError,
}) => {
    const [user, setUser] = useState('You');

    useEffect(() => {
        const loggedInUser = Utils.getUser();
        if (loggedInUser) {
            setUser(loggedInUser);
        }
    }, []);

    /**
     * Renders the execution result body.
     *
     * @param {any} executionResult Execution result to render.
     * @returns {JSX.Element} Execution result body to render.
     */
    const renderExecutionResultBody = (executionResult: any) => {
        const contentType = executionResult.headers.get('Content-Type');
        if (contentType.includes('application/json') && executionResult.body !== '') {
            return (
                <MonacoEditor
                    width='100%'
                    height='200'
                    language='json'
                    value={JSON.stringify(executionResult.body, null, 2)}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }}
                />
            );
        } else if (contentType.includes('application/xml') && executionResult.body !== '') {
            const formattedMessage = xmlFormat(executionResult.body);
            return (
                <MonacoEditor
                    width='100%'
                    height='200'
                    language='xml'
                    value={formattedMessage}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }}
                />
            );
        } else {
            return (
                <Typography variant='body1'>
                    {executionResult.body}
                </Typography>
            );
        }
    };

    return (
        <Root>
            <Box maxHeight='60%' overflow='auto' className={classes.lastQueryWrap}>
                <Paper>
                    <Grid justifyContent='flex-end' container>
                        <Tooltip
                            title={user.toUpperCase()}
                            aria-label={user.toUpperCase()}
                            placement='bottom'
                        >
                            <AccountCircleIcon fontSize='large' sx={{ color: '#10597f', marginRight: 2 }} />
                        </Tooltip>
                    </Grid>
                    <Box className={classes.queryBannerContentWrap} ml={6} mr={6} mt={-1}>
                        <Box className={classes.queryBannerContent}>
                            <Box className={classes.queryBannerTriangle} />
                            <Typography variant='body1' align='left'>
                                {lastQuery}
                            </Typography>
                        </Box>
                    </Box>
                    <CustomIcon width={50} height={50} icon='api-chat' />
                    <Box className={classes.responseBannerContentWrap} ml={6} mr={6} mt={-2.5}>
                        <Box className={classes.responseBannerContent}>
                            <Box className={classes.responseBannerTriangle} />
                            {executionResults.length !== 0 && (
                                <Typography variant='body1' mb={2}>
                                    <FormattedMessage
                                        id='Apis.Details.ApiChat.components.ApiChatResponse.executionResults'
                                        defaultMessage='Certainly! Here are the results of the API calls I executed on your behalf:'
                                    />
                                </Typography>
                            )}
                            {executionResults.map((executionResult: any) => {
                                return (
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <>
                                                {(executionResult.code >= 200 && executionResult.code < 300) ? (
                                                    <Chip
                                                        icon={<CheckCircleIcon color='success' />}
                                                        label={executionResult.code}
                                                        color='success'
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<DangerousIcon color='error' />}
                                                        label={executionResult.code}
                                                        color='error'
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                )}
                                                <Typography variant='body1' ml={2} sx={{ alignContent: 'center' }}>
                                                    {'Executed ' + executionResult.method + ' ' + executionResult.path}
                                                </Typography>
                                            </>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant='body1'>
                                                {renderExecutionResultBody(executionResult)}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                            {!isAgentRunning && lastQuery && finalOutcome && !isExecutionError && (
                                <>
                                    {executionResults.length === 0 ? (
                                        <Box display='flex'>
                                            <Typography variant='body1'>
                                                {finalOutcome}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box display='flex' justifyContent='center' className={classes.finalOutcomeContent}>
                                            <Typography variant='body1'>
                                                {finalOutcome}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}
                            {lastQuery && !finalOutcome && (
                                <>
                                    <Box className={classes.queryProcessLoader}>
                                        {isAgentTerminating ? (
                                            <>
                                                <CircularProgress size={20} />
                                                <Typography variant='body1' sx={{ paddingLeft: '5px' }}>
                                                    <FormattedMessage
                                                        id='Apis.Details.ApiChat.components.ApiChatResponse.terminatingMessage'
                                                        defaultMessage='Execution is terminating...'
                                                    />
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <CircularProgress size={20} />
                                                <Typography variant='body1' sx={{ paddingLeft: '5px' }}>
                                                    <FormattedMessage
                                                        id='Apis.Details.ApiChat.components.ApiChatResponse.loadingMessage'
                                                        defaultMessage='Loading next execution step...'
                                                    />
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Root>
    );
};

export default ApiChatResponse;
