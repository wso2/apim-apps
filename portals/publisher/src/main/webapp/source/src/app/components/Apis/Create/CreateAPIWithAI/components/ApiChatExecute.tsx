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

// import React from 'react';
// import { useIntl, FormattedMessage } from 'react-intl';
// import Button from '@mui/material/Button';
// import { Box, Typography } from '@mui/material';
// import Send from '@mui/icons-material/SendOutlined';
// import { styled } from '@mui/system';
// import TextInput from './TextInput/TextInput';

// const PREFIX = 'ApiChatExecute';

// const classes = {
//     tryAiBottom: `${PREFIX}-tryAiBottom`,
//     tryAiBottomInner: `${PREFIX}-tryAiBottomInner`,
//     reExecuteWrap: `${PREFIX}-reExecuteWrap`,
//     tryAiBottomTextInputWrap: `${PREFIX}-tryAiBottomTextInputWrap`,
//     disclaimerText: `${PREFIX}-disclaimerText`,
// };

// const Root = styled('div')(({ theme }) => ({
//     [`& .${classes.tryAiBottom}`]: {
//         position: 'sticky',
//         left: 0,
//         right: 0,
//         marginLeft: theme.spacing(-1),
//         marginRight: theme.spacing(-1),
//     },
//     [`& .${classes.tryAiBottomInner}`]: {
//         // padding: theme.spacing(3, 1),
//         padding: theme.spacing(0.25, 1),
//     },
//     [`& .${classes.reExecuteWrap}`]: {
//         marginTop: theme.spacing(2),
//         marginBottom: theme.spacing(2),
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     [`& .${classes.tryAiBottomTextInputWrap}`]: {
//         maxWidth: '100%',
//         overflow: 'hidden',
//     },
//     [`& .${classes.disclaimerText}`]: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
// }));

// const ExecuteQuery = styled(Send)({
//     transform: 'rotate(-40deg)',
//     marginBottom: '5px',
// });

// interface ApiChatExecuteProps {
//     // isAgentRunning: boolean;
//     // isAgentTerminating: boolean;
//     lastQuery: string;
//     // handleStopAndReExecute: () => Promise<void>;
//     inputQuery: string;
//     handleQueryChange: (
//       event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
//     ) => void;
//     // isEnrichingSpec: boolean;
//     // specEnrichmentError: string;
//     handleExecute: () => Promise<void>;
//     // isExecuteDisabled: boolean;
// }

// /**
//  * Renders the API Chat Execute component.
//  * @returns {TSX} API Chat Execute component.
//  */
// const ApiChatExecute: React.FC<ApiChatExecuteProps> = ({
//     // isAgentRunning,
//     // isAgentTerminating,
//     lastQuery,
//     // handleStopAndReExecute,
//     inputQuery,
//     handleQueryChange,
//     // isEnrichingSpec,
//     // specEnrichmentError,
//     handleExecute,
//     // isExecuteDisabled,
// }) => {
//     const intl = useIntl();
//     const QUERY_CHARACTER_LIMIT = 500;

//     return (
//         <Root>
//             <Box className={classes.tryAiBottom}>
//                 <Box className={classes.tryAiBottomInner}>
//                     {/* {(isAgentRunning || lastQuery) && (
//                         <Box className={classes.reExecuteWrap}>
//                             <Button
//                                 variant='outlined'
//                                 onClick={handleStopAndReExecute}
//                                 id='stop-reexecute-button'
//                                 disabled={specEnrichmentError !== '' || isAgentTerminating}
//                             >
//                                 {isAgentRunning ? (
//                                     <FormattedMessage
//                                         id='Apis.Details.ApiChat.components.ApiChatExecute.stopButton.label'
//                                         defaultMessage='Stop Execution'
//                                     />
//                                 ) : (
//                                     <FormattedMessage
//                                         id='Apis.Details.ApiChat.components.ApiChatExecute.rexecuteButton.label'
//                                         defaultMessage='Re-execute'
//                                     />
//                                 )}
//                             </Button>
//                         </Box>
//                     )} */}
//                     <Box className={classes.tryAiBottomTextInputWrap} pl={2}>
//                         <TextInput
//                             fullWidth
//                             name='query'
//                             value={inputQuery}
//                             placeholder={intl.formatMessage({
//                                 id: 'Apis.Details.ApiChat.components.ApiChatExecute.queryInput.placeholder',
//                                 defaultMessage: 'Type the test scenario here...',
//                             })}
//                             onChange={handleQueryChange}
//                             testId='nl-query-input'
//                             // disabled={isAgentRunning || isEnrichingSpec || specEnrichmentError !== ''
//                             //     || isExecuteDisabled}
//                             multiline
//                             sx={{
//                                 '& .TextInput-textarea': {
//                                     resize: 'none',
//                                 },
//                             }}
//                             resizeIndicator={false}
//                             onKeyPress={(event: { key: string; preventDefault: () => void; }) => {
//                                 if (event.key === 'Enter') {
//                                     event.preventDefault();
//                                     handleExecute();
//                                 }
//                             }}
//                             endAdornment={(
//                                 <Button
//                                     variant='contained'
//                                     color='primary'
//                                     onClick={handleExecute}
//                                     // onClick={() => handleSubmit(inputQuery)}
//                                     id='run-agent-button'
//                                     startIcon={<ExecuteQuery />}
//                                     sx={{
//                                         marginLeft: 1,
//                                     }}
//                                 >
//                                     <FormattedMessage
//                                         id='Apis.Details.ApiChat.components.ApiChatExecute.executeButton.label'
//                                         defaultMessage='Execute'
//                                     />
//                                 </Button>
//                             )}
//                             inputProps={{
//                                 maxLength: QUERY_CHARACTER_LIMIT,
//                             }}
//                         />
//                         <Box display='flex' justifyContent='flex-end' mt={1} mr={2}>
//                             <Typography variant='caption'>
//                                 {inputQuery.length}
//                                 /
//                                 {QUERY_CHARACTER_LIMIT}
//                             </Typography>
//                         </Box>
//                         <Box className={classes.disclaimerText}>
//                             <Typography variant='body2' color='textSecondary' component='p'>
//                                 {intl.formatMessage({
//                                     id: 'Apis.Details.ApiChat.components.ApiChatExecute.disclaimer.label',
//                                     defaultMessage:
//                     'It is prudent to exercise a degree of caution and thoughtfulness, as language models'
//                     + ' may exhibit some degree of unpredictability at times.',
//                                 })}
//                             </Typography>
//                         </Box>
//                     </Box>
//                 </Box>
//             </Box>
//         </Root>
//     );
// };

// export default ApiChatExecute;



import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import Send from '@mui/icons-material/SendOutlined';
import { styled } from '@mui/system';
import TextInput from './TextInput/TextInput';
import { createPortal } from 'react-dom';

const PREFIX = 'ApiChatExecute';

// Initialize CHARACTERS with an empty array, which will be populated dynamically
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

// const MentionMenu = ({
//     chars,
//     index,
//     top,
//     left,
//     complete,
// }: {
//     chars: string[];
//     index: number;
//     top: number;
//     left: number;
//     complete: (index: number) => void;
// }) => {
//     return (
//         <div
//             style={{
//                 position: 'fixed',
//                 top: top,
//                 left: left,
//                 width: '250px',
//                 fontSize: '14px',
//                 border: 'solid 1px #E0E0E0',
//                 borderRadius: '8px',
//                 background: 'white',
//                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                 cursor: 'pointer',
//                 zIndex: 1000,
//                 overflow: 'hidden',
//             }}
//         >
//             {chars.map((c, i) => (
//                 <div
//                     key={c}
//                     style={{
//                         padding: '10px 15px',
//                         transition: 'background-color 0.2s ease',
//                         ...(index === i 
//                             ? {
//                                 color: 'white',
//                                 background: '#2A6AD3',
//                             } 
//                             : {
//                                 '&:hover': {
//                                     backgroundColor: '#F5F5F5',
//                                 }
//                             }
//                         ),
//                     }}
//                     onMouseDown={(e) => {
//                         e.preventDefault();
//                         complete(i);
//                     }}
//                 >
//                     {c}
//                 </div>
//             ))}
//         </div>
//     );
// };

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
                top: top,
                left: left + 100,
                width: '250px',
                maxHeight: '100px',
                fontSize: '14px',
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
}

const ApiChatExecute: React.FC<ApiChatExecuteProps> = ({
    lastQuery,
    inputQuery,
    handleQueryChange,
    handleExecute,
    paths = [],
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
    
    // State to store dynamic characters from paths
    const [dynamicCharacters, setDynamicCharacters] = useState<string[]>([]);

    // Update dynamic characters when paths prop changes
    useEffect(() => {
        // Transform paths to match existing format (add '/' if not present)
        const transformedPaths = paths.map(path => 
            path.startsWith('/') ? path : `/${path}`
        );
        setDynamicCharacters(transformedPaths);
    }, [paths]);

    const MAX_LIST_LENGTH = 8;
    const MENTION_REG = /\B\/([\-+\w]*)$/;

    // const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    //     const value = event.target.value;
    //     handleQueryChange(event);

    //     // Check for mention trigger
    //     if (textareaRef.current) {
    //         const selectionStart = textareaRef.current.selectionStart;
    //         const textBeforeCursor = value.slice(0, selectionStart);
    //         const match = textBeforeCursor.match(MENTION_REG);

    //         if (match) {
    //             const rect = textareaRef.current.getBoundingClientRect();
    //             const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight, 10);
    //             setMentionPos({
    //                 top: rect.top + lineHeight * (textBeforeCursor.split('\n').length),
    //                 left: rect.left + (match.index || 0),
    //                 caret: selectionStart
    //             });
    //             setMentionIndex(0);
    //         } else {
    //             setMentionPos(null);
    //             setMentionIndex(0);
    //         }
    //     }
    // };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const value = event.target.value;
        handleQueryChange(event);
    
        // Check for mention trigger
        if (textareaRef.current) {
            const selectionStart = textareaRef.current.selectionStart;
            const textBeforeCursor = value.slice(0, selectionStart);
            const match = textBeforeCursor.match(MENTION_REG);
    
            if (match) {
                const rect = textareaRef.current.getBoundingClientRect();
                
                setMentionPos({
                    // Position at the top of the text input
                    top: rect.top - 80, // Adjust height of menu (150px)
                    left: rect.left + 20, // Slight right offset
                    caret: selectionStart
                });
                setMentionIndex(0);
            } else {
                setMentionPos(null);
                setMentionIndex(0);
            }
        }
    };

    // const filteredCharacters = useMemo(() => {
    //     if (!mentionPos) return [];
    //     const targetText = inputQuery.slice(0, mentionPos.caret);
    //     const match = targetText.match(MENTION_REG);
    //     const name = match?.[1] ?? "";
        
    //     return dynamicCharacters.filter((c) =>
    //         // Remove the '/' from the beginning of the command when filtering
    //         c.slice(1).toLowerCase().startsWith(name.toLowerCase())
    //     ).slice(0, MAX_LIST_LENGTH);
    // }, [inputQuery, mentionPos, dynamicCharacters]);

    const filteredCharacters = useMemo(() => {
        if (!mentionPos) return [];
        const targetText = inputQuery.slice(0, mentionPos.caret);
        const match = targetText.match(MENTION_REG);
        const name = match?.[1] ?? "";
        
        return dynamicCharacters
            .filter((c) =>
                // Remove the '/' from the beginning of the command when filtering
                c.slice(1).toLowerCase().startsWith(name.toLowerCase())
            )
            .slice(0, MAX_LIST_LENGTH)
            // Remove the leading slash for display
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

        // Optional: Move cursor to the end of the input
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
                    <Box className={classes.tryAiBottomTextInputWrap} pl={2}>
                        <TextInput
                            ref={textareaRef}
                            fullWidth
                            name='query'
                            value={inputQuery}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Details.ApiChat.components.ApiChatExecute.queryInput.placeholder',
                                defaultMessage: 'Type the test scenario here...',
                            })}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            testId='nl-query-input'
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





// import React, { useState, useMemo, useRef } from 'react';
// import { useIntl, FormattedMessage } from 'react-intl';
// import Button from '@mui/material/Button';
// import { Box, Typography } from '@mui/material';
// import Send from '@mui/icons-material/SendOutlined';
// import { styled } from '@mui/system';
// import TextInput from './TextInput/TextInput';
// import { createPortal } from 'react-dom';

// const PREFIX = 'ApiChatExecute';

// const CHARACTERS = [
//   '/patient',
//   '/patient {patientID}', 
//   '/doctor',
//   '/nurse',
//   '/save'
// ]; // Example list of characters/users

// const classes = {
//     tryAiBottom: `${PREFIX}-tryAiBottom`,
//     tryAiBottomInner: `${PREFIX}-tryAiBottomInner`,
//     reExecuteWrap: `${PREFIX}-reExecuteWrap`,
//     tryAiBottomTextInputWrap: `${PREFIX}-tryAiBottomTextInputWrap`,
//     disclaimerText: `${PREFIX}-disclaimerText`,
// };

// const Root = styled('div')(({ theme }) => ({
//     [`& .${classes.tryAiBottom}`]: {
//         position: 'sticky',
//         left: 0,
//         right: 0,
//         marginLeft: theme.spacing(-1),
//         marginRight: theme.spacing(-1),
//     },
//     [`& .${classes.tryAiBottomInner}`]: {
//         padding: theme.spacing(0.25, 1),
//     },
//     [`& .${classes.reExecuteWrap}`]: {
//         marginTop: theme.spacing(2),
//         marginBottom: theme.spacing(2),
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     [`& .${classes.tryAiBottomTextInputWrap}`]: {
//         maxWidth: '100%',
//         overflow: 'hidden',
//     },
//     [`& .${classes.disclaimerText}`]: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
// }));

// const ExecuteQuery = styled(Send)({
//     transform: 'rotate(-40deg)',
//     marginBottom: '5px',
// });

// const MentionMenu = ({
//     chars,
//     index,
//     top,
//     left,
//     complete,
// }: {
//     chars: string[];
//     index: number;
//     top: number;
//     left: number;
//     complete: (index: number) => void;
// }) => {
//     return (
//         <div
//             style={{
//             //     position: 'fixed',
//             //     top: top,
//             //     left: left,
//             //     fontSize: '12px',
//             //     border: 'solid 1px gray',
//             //     borderRadius: '3px',
//             //     background: 'white',
//             //     cursor: 'pointer',
//             //     zIndex: 1000,
//             // }}
//                 position: 'fixed',
//                 top: top,
//                 left: left,
//                 width: '250px', // Increased width
//                 fontSize: '14px', // Slightly larger font
//                 border: 'solid 1px #E0E0E0', // Softer border color
//                 borderRadius: '8px', // More rounded corners
//                 background: 'white',
//                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // Added subtle shadow
//                 cursor: 'pointer',
//                 zIndex: 1000,
//                 overflow: 'hidden', // Ensure rounded corners are respected
//             }}
//         >
//             {chars.map((c, i) => (
//                 <div
//                     key={c}
//                     style={{
//                     //     padding: '4px',
//                     //     ...(index === i && {
//                     //         color: 'white',
//                     //         background: '#2A6AD3',
//                     //     }),
//                     // }}
//                         padding: '10px 15px', // Increased padding
//                         transition: 'background-color 0.2s ease', // Smooth hover effect
//                         ...(index === i 
//                             ? {
//                                 color: 'white',
//                                 background: '#2A6AD3',
//                             } 
//                             : {
//                                 '&:hover': {
//                                     backgroundColor: '#F5F5F5', // Light gray on hover
//                                 }
//                             }
//                         ),
//                     }}
//                     onMouseDown={(e) => {
//                         e.preventDefault();
//                         complete(i);
//                     }}
//                 >
//                     {c}
//                 </div>
//             ))}
//         </div>
//     );
// };

// interface ApiChatExecuteProps {
//     lastQuery: string;
//     inputQuery: string;
//     handleQueryChange: (
//       event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
//     ) => void;
//     handleExecute: () => Promise<void>;
// }

// const ApiChatExecute: React.FC<ApiChatExecuteProps> = ({
//     lastQuery,
//     inputQuery,
//     handleQueryChange,
//     handleExecute,
// }) => {
//     const intl = useIntl();
//     const QUERY_CHARACTER_LIMIT = 500;
//     const textareaRef = useRef<HTMLTextAreaElement>(null);
//     const [mentionPos, setMentionPos] = useState<{
//         top: number;
//         left: number;
//         caret: number;
//     } | null>(null);
//     const [mentionIndex, setMentionIndex] = useState<number>(0);

//     const MAX_LIST_LENGTH = 8;
//     // const MENTION_REG = /\B@([\-+\w]*)$/;
//     const MENTION_REG = /\B\/([\-+\w]*)$/;

//     const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
//         const value = event.target.value;
//         handleQueryChange(event);

//         // Check for mention trigger
//         if (textareaRef.current) {
//             const selectionStart = textareaRef.current.selectionStart;
//             const textBeforeCursor = value.slice(0, selectionStart);
//             const match = textBeforeCursor.match(MENTION_REG);

//             if (match) {
//                 const rect = textareaRef.current.getBoundingClientRect();
//                 const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight, 10);
//                 setMentionPos({
//                     top: rect.top + lineHeight * (textBeforeCursor.split('\n').length),
//                     left: rect.left + (match.index || 0),
//                     caret: selectionStart
//                 });
//                 setMentionIndex(0);
//             } else {
//                 setMentionPos(null);
//                 setMentionIndex(0);
//             }
//         }
//     };

//     // const filteredCharacters = useMemo(() => {
//     //     if (!mentionPos) return [];
//     //     const targetText = inputQuery.slice(0, mentionPos.caret);
//     //     const match = targetText.match(MENTION_REG);
//     //     const name = match?.[1] ?? "";
//     //     return CHARACTERS.filter((c) =>
//     //         c.toLowerCase().startsWith(name.toLowerCase())
//     //     ).slice(0, MAX_LIST_LENGTH);
//     // }, [inputQuery, mentionPos]);

//     const filteredCharacters = useMemo(() => {
//         if (!mentionPos) return [];
//         const targetText = inputQuery.slice(0, mentionPos.caret);
//         const match = targetText.match(MENTION_REG);
//         const name = match?.[1] ?? "";
        
//         return CHARACTERS.filter((c) =>
//             // Remove the '/' from the beginning of the command when filtering
//             c.slice(1).toLowerCase().startsWith(name.toLowerCase())
//         ).slice(0, MAX_LIST_LENGTH);
//     }, [inputQuery, mentionPos]);

//     // const completeMention = (i: number) => {
//     //     if (!textareaRef.current || !mentionPos) return;

//     //     const selected = filteredCharacters[i];
//     //     const match = inputQuery.slice(0, mentionPos.caret).match(MENTION_REG);
        
//     //     if (match) {
//     //         const newValue = 
//     //             inputQuery.slice(0, mentionPos.caret - match[1].length - 1) + 
//     //             `${selected} ` + 
//     //             inputQuery.slice(mentionPos.caret);
            
//     //         handleQueryChange({ 
//     //             target: { 
//     //                 value: newValue 
//     //             } 
//     //         } as React.ChangeEvent<HTMLTextAreaElement>);
//     //     }

//     //     setMentionPos(null);
//     //     setMentionIndex(0);
//     // };


//     const completeMention = (i: number) => {
//         if (!textareaRef.current || !mentionPos) return;
    
//         const selected = filteredCharacters[i];
//         const match = inputQuery.slice(0, mentionPos.caret).match(MENTION_REG);
        
//         const newValue = inputQuery + (match ? ` ${selected} ` : '');
        
//         handleQueryChange({ 
//             target: { 
//                 value: newValue 
//             } 
//         } as React.ChangeEvent<HTMLTextAreaElement>);
    
//         setMentionPos(null);
//         setMentionIndex(0);
    
//         // Optional: Move cursor to the end of the input
//         if (textareaRef.current) {
//             const newLength = newValue.length;
//             textareaRef.current.setSelectionRange(newLength, newLength);
//         }
//     };

    
//     const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
//         if (!mentionPos || !filteredCharacters.length) return;

//         switch (event.code) {
//             case "ArrowUp":
//                 event.preventDefault();
//                 const nextIndex = mentionIndex <= 0 ? filteredCharacters.length - 1 : mentionIndex - 1;
//                 setMentionIndex(nextIndex);
//                 break;
//             case "ArrowDown":
//                 event.preventDefault();
//                 const prevIndex = mentionIndex >= filteredCharacters.length - 1 ? 0 : mentionIndex + 1;
//                 setMentionIndex(prevIndex);
//                 break;
//             case "Enter":
//                 event.preventDefault();
//                 completeMention(mentionIndex);
//                 break;
//             case "Escape":
//                 event.preventDefault();
//                 setMentionPos(null);
//                 setMentionIndex(0);
//                 break;
//         }
//     };

//     return (
//         <Root>
//             <Box className={classes.tryAiBottom}>
//                 <Box className={classes.tryAiBottomInner}>
//                     <Box className={classes.tryAiBottomTextInputWrap} pl={2}>
//                         <TextInput
//                             ref={textareaRef}
//                             fullWidth
//                             name='query'
//                             value={inputQuery}
//                             placeholder={intl.formatMessage({
//                                 id: 'Apis.Details.ApiChat.components.ApiChatExecute.queryInput.placeholder',
//                                 defaultMessage: 'Type the test scenario here...',
//                             })}
//                             onChange={handleInputChange}
//                             onKeyDown={handleKeyDown}
//                             testId='nl-query-input'
//                             multiline
//                             sx={{
//                                 '& .TextInput-textarea': {
//                                     resize: 'none',
//                                 },
//                             }}
//                             resizeIndicator={false}
//                             onKeyPress={(event: { key: string; preventDefault: () => void; }) => {
//                                 if (event.key === 'Enter') {
//                                     event.preventDefault();
//                                     handleExecute();
//                                 }
//                             }}
//                             endAdornment={(
//                                 <Button
//                                     variant='contained'
//                                     color='primary'
//                                     onClick={handleExecute}
//                                     id='run-agent-button'
//                                     startIcon={<ExecuteQuery />}
//                                     sx={{
//                                         marginLeft: 1,
//                                     }}
//                                 >
//                                     <FormattedMessage
//                                         id='Apis.Details.ApiChat.components.ApiChatExecute.executeButton.label'
//                                         defaultMessage='Execute'
//                                     />
//                                 </Button>
//                             )}
//                             inputProps={{
//                                 maxLength: QUERY_CHARACTER_LIMIT,
//                             }}
//                         />
//                         <Box display='flex' justifyContent='flex-end' mt={1} mr={2}>
//                             <Typography variant='caption'>
//                                 {inputQuery.length}
//                                 /
//                                 {QUERY_CHARACTER_LIMIT}
//                             </Typography>
//                         </Box>
//                         <Box className={classes.disclaimerText}>
//                             <Typography variant='body2' color='textSecondary' component='p'>
//                                 {intl.formatMessage({
//                                     id: 'Apis.Details.ApiChat.components.ApiChatExecute.disclaimer.label',
//                                     defaultMessage:
//                     'It is prudent to exercise a degree of caution and thoughtfulness, as language models'
//                     + ' may exhibit some degree of unpredictability at times.',
//                                 })}
//                             </Typography>
//                         </Box>
//                     </Box>
//                 </Box>
//             </Box>

//             {mentionPos && filteredCharacters.length > 0 && createPortal(
//                 <MentionMenu
//                     top={mentionPos.top}
//                     left={mentionPos.left}
//                     chars={filteredCharacters}
//                     index={mentionIndex}
//                     complete={completeMention}
//                 />,
//                 document.body
//             )}
//         </Root>
//     );
// };

// export default ApiChatExecute;
