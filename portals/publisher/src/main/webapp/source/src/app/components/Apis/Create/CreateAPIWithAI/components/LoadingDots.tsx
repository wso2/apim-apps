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
import React from 'react';

const LoadingDots: React.FC = () => {
  const dotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    backgroundColor: '#374d70',
    borderRadius: '50%',
    animation: 'loading-dots 1.4s infinite ease-in-out',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'left',
    gap: '10px',
  };

  const dotsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '5px',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#34445e',
    fontWeight: '600',
    marginLeft: '16px',
    fontFamily: 'Arial, sans-serif',
  };

  const keyframesStyle = `
    @keyframes loading-dots {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
  `;

  return (
    <>
      <style>
        {keyframesStyle}
      </style>
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginLeft: '16px' }}>
        <span style={textStyle}>Generating a response</span>
        <div style={dotsStyle}>
          <span style={{ ...dotStyle, animationDelay: '-0.32s' }}></span>
          <span style={{ ...dotStyle, animationDelay: '-0.16s' }}></span>
          <span style={{ ...dotStyle, animationDelay: '0s' }}></span>
        </div>
      </div>
    </>
  );
};

export default LoadingDots;
