/* eslint-disable */
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
import * as React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const LinearDeterminate = () => {
  const [progress, setProgress] = React.useState(0);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [iterationCompleted, setIterationCompleted] = React.useState(false);

  // const messages = [
  //   "Analyzing your request...",
  //   "Processing your input...",
  //   "Generating the result...",
  //   "Hold on tight...",
  //   "Almost there..."
  // ];

  const messages = [
    "We're diving into your request...",
    "Just a moment while we process your input...",
    "Crafting the perfect response for you...",
    "Hang tight, great things are on the way...",
    "Finalizing your results..."
  ];


  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          setIterationCompleted(true); // Mark the iteration as completed
          return 0; // Reset progress
        }
        const diff = Math.random() * 10; // Increase the progress increment size
        return Math.min(oldProgress + diff, 100);
      });
    }, 400); // Decrease the update interval to 300ms

    return () => {
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    if (iterationCompleted) {
      // Update the message only after a full iteration of progress
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      setIterationCompleted(false); // Reset the flag for the next iteration
    }
  }, [iterationCompleted, messages.length]);

  return (
    <Box
      sx={{
        width: '80%',
        // height: '80%',
        bgcolor: '#ffffff', // Light blue background
        padding: 2, // Add padding for spacing
        borderRadius: 2, // Optional: Rounded corners for aesthetics
        // border: '2px solid', // Set border width and style
        // borderColor: '#1c5299', // Border color
        // display: 'flex', // Enable Flexbox for content alignment
        flexDirection: 'column', // Stack content vertically
        // alignItems: 'center', // Center content horizontally within the Box
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

export default LinearDeterminate