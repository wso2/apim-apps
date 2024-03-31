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
import { useIntl, FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import Send from '@mui/icons-material/SendOutlined';
import { styled } from '@mui/system';
import TextInput from './TextInput/TextInput';

const PREFIX = 'ApiChatExecute';

const classes = {
    tryAiBottom: `${PREFIX}-tryAiBottom`,
    tryAiBottomInner: `${PREFIX}-tryAiBottomInner`,
    reExecuteWrap: `${PREFIX}-reExecuteWrap`,
    tryAiBottomTextInputWrap: `${PREFIX}-tryAiBottomTextInputWrap`,
    disclaimerText: `${PREFIX}-disclaimerText`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.tryAiBottom}`]: {
        position: 'sticky',
        left: 0,
        right: 0,
        marginLeft: theme.spacing(-1),
        marginRight: theme.spacing(-1),
    },
    [`& .${classes.tryAiBottomInner}`]: {
        padding: theme.spacing(3, 1),
    },
    [`& .${classes.reExecuteWrap}`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    [`& .${classes.tryAiBottomTextInputWrap}`]: {
        maxWidth: '100%',
        overflow: 'hidden',
    },
    [`& .${classes.disclaimerText}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const ExecuteQuery = styled(Send)({
    transform: 'rotate(-40deg)',
    marginBottom: '5px',
});

interface ApiChatExecuteProps {
    isAgentRunning: boolean;
    isAgentTerminating: boolean;
    lastQuery: string;
    handleStopAndReExecute: () => Promise<void>;
    inputQuery: string;
    handleQueryChange: (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void;
    isEnrichingSpec: boolean;
    specEnrichmentError: string;
    handleExecute: () => Promise<void>;
    isExecuteDisabled: boolean;
}

/**
 * Renders the API Chat Execute component.
 * @returns {TSX} API Chat Execute component.
 */
const ApiChatExecute: React.FC<ApiChatExecuteProps> = ({
    isAgentRunning,
    isAgentTerminating,
    lastQuery,
    handleStopAndReExecute,
    inputQuery,
    handleQueryChange,
    isEnrichingSpec,
    specEnrichmentError,
    handleExecute,
    isExecuteDisabled,
}) => {
    const intl = useIntl();
    const QUERY_CHARACTER_LIMIT = 500;

    return (
        <Root>
            <Box className={classes.tryAiBottom}>
                <Box className={classes.tryAiBottomInner}>
                    {(isAgentRunning || lastQuery) && (
                        <Box className={classes.reExecuteWrap}>
                            <Button
                                variant='outlined'
                                onClick={handleStopAndReExecute}
                                id='stop-reexecute-button'
                                disabled={specEnrichmentError !== '' || isAgentTerminating}
                            >
                                {isAgentRunning ? (
                                    <FormattedMessage
                                        id='Apis.Details.ApiChat.components.ApiChatExecute.stopButton.label'
                                        defaultMessage='Stop Execution'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.ApiChat.components.ApiChatExecute.rexecuteButton.label'
                                        defaultMessage='Re-execute'
                                    />
                                )}
                            </Button>
                        </Box>
                    )}
                    <Box className={classes.tryAiBottomTextInputWrap} pl={2}>
                        <TextInput
                            fullWidth
                            name='query'
                            value={inputQuery}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Details.ApiChat.components.ApiChatExecute.queryInput.placeholder',
                                defaultMessage: 'Type the test scenario here...',
                            })}
                            onChange={handleQueryChange}
                            testId='nl-query-input'
                            disabled={isAgentRunning || isEnrichingSpec || specEnrichmentError !== ''
                                || isExecuteDisabled}
                            multiline
                            sx={{
                                '& .TextInput-textarea': {
                                    resize: 'none',
                                },
                            }}
                            resizeIndicator={false}
                            onKeyPress={(event: { key: string; preventDefault: () => void; }) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleExecute();
                                }
                            }}
                            endAdornment={(
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={handleExecute}
                                    id='run-agent-button'
                                    startIcon={<ExecuteQuery />}
                                    sx={{
                                        marginLeft: 1,
                                    }}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.ApiChat.components.ApiChatExecute.executeButton.label'
                                        defaultMessage='Execute'
                                    />
                                </Button>
                            )}
                            inputProps={{
                                maxLength: QUERY_CHARACTER_LIMIT,
                            }}
                        />
                        <Box display='flex' justifyContent='flex-end' mt={1} mr={2}>
                            <Typography variant='caption'>
                                {inputQuery.length}
                                /
                                {QUERY_CHARACTER_LIMIT}
                            </Typography>
                        </Box>
                        <Box className={classes.disclaimerText}>
                            <Typography variant='body2' color='textSecondary' component='p'>
                                {intl.formatMessage({
                                    id: 'Apis.Details.ApiChat.components.ApiChatExecute.disclaimer.label',
                                    defaultMessage:
                    'It is prudent to exercise a degree of caution and thoughtfulness, as language models'
                    + ' may exhibit some degree of unpredictability at times.',
                                })}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Root>
    );
};

export default ApiChatExecute;
