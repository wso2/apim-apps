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
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import Send from '@mui/icons-material/SendOutlined';
import { styled } from '@mui/system';
import TextInput from './TextInput/TextInput';
import { createPortal } from 'react-dom';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';

const PREFIX = 'ApiChatExecute';

const CHARACTERS: string[] = []; 

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
        padding: theme.spacing(0.25, 1),
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

const MentionMenu = ({
    chars,
    index,
    top,
    left,
    complete,
}: {
    chars: string[];
    index: number;
    top: number;
    left: number;
    complete: (index: number) => void;
}) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: top + 120,
                left: left + 100,
                width: '250px',
                maxHeight: '100px',
                fontSize: '14px',
                fontFamily: 'Open Sans',
                border: 'solid 1px #E0E0E0',
                borderRadius: '8px',
                background: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 1000,
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            {chars.map((c, i) => (
                <div
                    key={c}
                    style={{
                        padding: '10px 15px',
                        transition: 'background-color 0.2s ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        ...(index === i 
                            ? {
                                color: 'white',
                                background: '#2A6AD3',
                            } 
                            : {
                                '&:hover': {
                                    backgroundColor: '#F5F5F5',
                                }
                            }
                        ),
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        complete(i);
                    }}
                >
                    {c}
                </div>
            ))}
        </div>
    );
};

interface ApiChatExecuteProps {
    lastQuery: string;
    inputQuery: string;
    handleQueryChange: (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void;
    handleExecute: () => Promise<void>;
    paths?: string[]; 
    loading?: boolean;
}

const ApiChatExecute: React.FC<ApiChatExecuteProps> = ({
    lastQuery,
    inputQuery,
    handleQueryChange,
    handleExecute,
    paths = [],
    loading = false,
}) => {
    const intl = useIntl();
    const QUERY_CHARACTER_LIMIT = 500;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mentionPos, setMentionPos] = useState<{
        top: number;
        left: number;
        caret: number;
    } | null>(null);
    const [mentionIndex, setMentionIndex] = useState<number>(0);
    const [dynamicCharacters, setDynamicCharacters] = useState<string[]>([]);
    const { data: settings }: any = usePublisherSettings();
    const aiAuthTokenProvided = settings?.aiAuthTokenProvided;
    const designAssistantEnabled = settings?.designAssistantEnabled;

    useEffect(() => {
        const transformedPaths = paths.map(path => 
            path.startsWith('/') ? path : `/${path}`
        );
        setDynamicCharacters(transformedPaths);
    }, [paths]);

    const MAX_LIST_LENGTH = 8;
    const MENTION_REG = /\B\/([\-+\w]*)$/;

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const value = event.target.value;
        handleQueryChange(event);
    
        if (textareaRef.current) {
            const selectionStart = textareaRef.current.selectionStart;
            const textBeforeCursor = value.slice(0, selectionStart);
            const match = textBeforeCursor.match(MENTION_REG);
    
            if (match) {
                const rect = textareaRef.current.getBoundingClientRect();
                
                setMentionPos({
                    top: rect.top - 80,
                    left: rect.left + 20,
                    caret: selectionStart
                });
                setMentionIndex(0);
            } else {
                setMentionPos(null);
                setMentionIndex(0);
            }
        }
    };

    const filteredCharacters = useMemo(() => {
        if (!mentionPos) return [];
        const targetText = inputQuery.slice(0, mentionPos.caret);
        const match = targetText.match(MENTION_REG);
        const name = match?.[1] ?? "";
        
        return dynamicCharacters
            .filter((c) =>
                c.slice(1).toLowerCase().startsWith(name.toLowerCase())
            )
            .slice(0, MAX_LIST_LENGTH)
            .map(c => c.slice(1));
    }, [inputQuery, mentionPos, dynamicCharacters]);

    const completeMention = (i: number) => {
        if (!textareaRef.current || !mentionPos) return;

        const selected = filteredCharacters[i];
        const match = inputQuery.slice(0, mentionPos.caret).match(MENTION_REG);

        const newValue = inputQuery + (match ? selected : '');

        handleQueryChange({ 
            target: { 
                value: newValue 
            } 
        } as React.ChangeEvent<HTMLTextAreaElement>);

        setMentionPos(null);
        setMentionIndex(0);

        if (textareaRef.current) {
            const newLength = newValue.length;
            textareaRef.current.setSelectionRange(newLength, newLength);
        }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!mentionPos || !filteredCharacters.length) return;

        switch (event.code) {
            case "ArrowUp":
                event.preventDefault();
                const nextIndex = mentionIndex <= 0 ? filteredCharacters.length - 1 : mentionIndex - 1;
                setMentionIndex(nextIndex);
                break;
            case "ArrowDown":
                event.preventDefault();
                const prevIndex = mentionIndex >= filteredCharacters.length - 1 ? 0 : mentionIndex + 1;
                setMentionIndex(prevIndex);
                break;
            case "Enter":
                event.preventDefault();
                completeMention(mentionIndex);
                break;
            case "Escape":
                event.preventDefault();
                setMentionPos(null);
                setMentionIndex(0);
                break;
        }
    };

    return (
        <Root>
            <Box className={classes.tryAiBottom}>
                <Box className={classes.tryAiBottomInner}>
                    <Box className={classes.tryAiBottomTextInputWrap} pl={2} pr={2}>
                        <TextInput
                            ref={textareaRef}
                            fullWidth
                            name='query'
                            value={inputQuery}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Details.ApiChat.components.ApiChatExecute.queryInput.placeholder',
                                defaultMessage: 'Describe your API design requirements...',
                            })}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            testId='nl-query-input'
                            multiline
                            disabled={!aiAuthTokenProvided||!designAssistantEnabled}
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
                                    disabled={loading}
                                >
                                <ExecuteQuery />
                                </Button>
                            )}
                            inputProps={{
                                maxLength: QUERY_CHARACTER_LIMIT,
                            }}
                        />
                        <Box display='flex' justifyContent='flex-end' mt={1} mr={2} >
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

            {mentionPos && filteredCharacters.length > 0 && createPortal(
                <MentionMenu
                    top={mentionPos.top}
                    left={mentionPos.left}
                    chars={filteredCharacters}
                    index={mentionIndex}
                    complete={completeMention}
                />,
                document.body
            )}
        </Root>
    );
};

export default ApiChatExecute;
