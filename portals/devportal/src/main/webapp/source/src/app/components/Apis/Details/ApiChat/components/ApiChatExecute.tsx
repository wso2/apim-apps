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

/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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
        bottom: 0,
        left: 0,
        right: 0,
        marginLeft: theme.spacing(-1),
        marginRight: theme.spacing(-1),
    },
    [`& .${classes.tryAiBottomInner}`]: {
        padding: theme.spacing(3, 1),
    },
    [`& .${classes.reExecuteWrap}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    [`& .${classes.tryAiBottomTextInputWrap}`]: {
        maxWidth: '100%',
        overflow: 'hidden',
    },
    [`& .${classes.disclaimerText}`]: {
        marginTop: theme.spacing(1),
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
    enrichedSpec: JSON | undefined;
    inputQuery: string;
    handleQueryChange: (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void;
    isEnrichingSpec: boolean;
    handleExecute: () => Promise<void>;
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
    enrichedSpec,
    inputQuery,
    handleQueryChange,
    isEnrichingSpec,
    handleExecute,
}) => {
    const intl = useIntl();

    return (
        <Root>
            <Box className={classes.tryAiBottom}>
                <p>{isAgentTerminating}</p>
                <Box className={classes.tryAiBottomInner}>
                    {(isAgentRunning || lastQuery) && (
                        <Box className={classes.reExecuteWrap}>
                            <Button
                                color='secondary'
                                variant='outlined'
                                size='small'
                                onClick={handleStopAndReExecute}
                                id='stop-reexecute-button'
                                disabled={!enrichedSpec || isAgentTerminating}
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
                    <Box className={classes.tryAiBottomTextInputWrap}>
                        <TextInput
                            fullWidth
                            size='small'
                            name='query'
                            value={inputQuery}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Details.ApiChat.components.ApiChatExecute.queryInput.placeholder',
                                defaultMessage: 'Send Query',
                            })}
                            onChange={handleQueryChange}
                            testId='nl-query-input'
                            disabled={isAgentRunning || isEnrichingSpec || !enrichedSpec}
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
                                    disabled={
                                        isAgentRunning
                                    || isEnrichingSpec
                                    || !enrichedSpec
                                    || inputQuery.length === 0
                                    }
                                    id='run-agent-button'
                                    startIcon={<ExecuteQuery />}
                                >
                                    <FormattedMessage
                                        id='modules.testComponent.TryWithAIViewer.TryWithAIViews.TryAIExecute.executeButton.label'
                                        defaultMessage='Execute'
                                    />
                                </Button>
                            )}
                        />
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
