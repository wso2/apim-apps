/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React, { useState, useReducer } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import MoodIcon from '@mui/icons-material/Mood';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import FaceIcon from '@mui/icons-material/Face';
import Alert from 'AppComponents/Shared/Alert';
import Configurations from 'Config';

/**
 *
 *
 * @export
 * @returns
 */
export default function FeedbackForm() {
    const [open, setOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    /**
     *
     *
     * @param {*} state
     * @param {*} action
     */
    function feedbackData(state, action) {
        const { type, data } = action;
        switch (type) {
            case 'message':
            case 'score':
                return { ...state, [type]: data };
            case 'clear':
                return {};
            default:
                return state;
        }
    }

    const [feedback, feedbackDispatcher] = useReducer(feedbackData, {});
    /**
     *
     *
     * @param {*} event
     */
    function onClose() {
        setOpen(false);
        feedbackDispatcher({ type: 'clear' });
    }
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    /**
     *
     *
     */
    function handleSubmit() {
        setIsSending(true);
        const check = Date.now();
        const { score = -1, message = '' } = feedback;
        const data = { check, score, message };
        const response = fetch(Configurations.app.feedback.serviceURL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        response.finally(() => {
            Alert.info('Thank you for the feedback.');
            setIsSending(false);
            onClose();
        });
    }
    return (
        <>
            <Tooltip title='Send feedback'>
                <Button onClick={() => setOpen(true)} size='small'>
                    <FeedbackIcon />
                </Button>
            </Tooltip>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
                fullScreen={fullScreen}
                aria-labelledby='feedback-form-title'
            >
                <DialogTitle>Send feedback</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} direction='row' justify='flex-start' alignItems='flex-start'>
                        <Grid item md={12}>
                            <ButtonGroup disabled={isSending} size='medium' aria-label='available feedback scores'>
                                <Tooltip title='Good'>
                                    <IconButton
                                        onClick={() => feedbackDispatcher({ type: 'score', data: 1 })}
                                        color={feedback.score === 1 ? 'primary' : 'default'}
                                        aria-label='delete'
                                    >
                                        <MoodIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Neutral'>
                                    <IconButton
                                        onClick={() => feedbackDispatcher({ type: 'score', data: 2 })}
                                        color={feedback.score === 2 ? 'primary' : 'default'}
                                        aria-label='delete'
                                    >
                                        <FaceIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Bad'>
                                    <IconButton
                                        onClick={() => feedbackDispatcher({ type: 'score', data: 3 })}
                                        color={feedback.score === 3 ? 'primary' : 'default'}
                                        aria-label='delete'
                                    >
                                        <MoodBadIcon />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>
                        </Grid>
                        <Grid item xs={12}>
                            <DialogContentText>Type your message below</DialogContentText>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                disabled={isSending}
                                onChange={({ target: { value } }) => feedbackDispatcher(
                                    { type: 'message', data: value },
                                )}
                                label='Message'
                                variant='outlined'
                                placeholder='Describe your issue or share your ideas'
                                multiline
                                autoFocus
                                rowsMax='10'
                                fullWidth
                                value={feedback.message}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button disabled={isSending} onClick={onClose}>
                        CANCEL
                    </Button>
                    <Button
                        disabled={isSending || !(feedback.score || feedback.message)}
                        onClick={handleSubmit}
                        color='primary'
                    >
                        SEND
                        {isSending && <CircularProgress size={24} />}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
