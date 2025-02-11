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
import * as React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const LinearDeterminate = () => {
  const [progress, setProgress] = React.useState(0);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [iterationCompleted, setIterationCompleted] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  const messages = [
    "We're diving into your request...",
    "Just a moment while we process your input...",
    "Crafting the perfect response for you...",
    "Hang tight, great things are on the way...",
    "Finalizing your results..."
  ];

  React.useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          setIterationCompleted(true);
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 400);

    return () => {
      clearInterval(timer);
    };
  }, [isComplete]);

  React.useEffect(() => {
    if (iterationCompleted) {
      if (messageIndex === messages.length - 1) {
        setIsComplete(true);
        setProgress(100);
      } else {
        setMessageIndex(prevIndex => prevIndex + 1);
      }
      setIterationCompleted(false);
    }
  }, [iterationCompleted, messageIndex, messages.length]);

  return (
    <Box
      sx={{
        width: '80%',
        bgcolor: '#ffffff',
        padding: 2,
        borderRadius: 2,
        flexDirection: 'column',
      }}
    >
      <LinearProgress variant="determinate" value={progress} />
      <Typography
        variant="body2"
        sx={{ 
          color: '#1c5299', 
          textAlign: 'center', 
          marginTop: 2,
          fontSize: '1rem'
        }}
      >
        {messages[messageIndex]}
      </Typography>
    </Box>
  );
};

export default LinearDeterminate;
