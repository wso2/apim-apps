/* eslint-disable */
/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';

const AICreateWithAI = () => {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      const text = await response.text();
      console.log(text);
      setResponseText(text); // or data.generatedText
    } catch (error) {
      console.error('Error:', error);
      setResponseText('An error occurred while fetching the data.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topContainer}>
        <div style={styles.leftTop}>
          <h3>Response from AI:</h3>
          <p>{responseText}</p>
        </div>
        <div style={styles.rightTop}>
          <h3>Your Input:</h3>
          <p>{inputText}</p>
        </div>
      </div>
      <textarea
        style={styles.textarea}
        placeholder="Enter your text here"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button style={styles.button} onClick={handleSubmit}>Submit</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
  },
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80%', // Adjust width as needed
    marginBottom: '20px',
  },
  leftTop: {
    flex: 1,
    textAlign: 'left',
  },
  rightTop: {
    flex: 1,
    textAlign: 'right',
  },
  textarea: {
    width: '400px',
    height: '150px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007BFF',
    color: 'white',
  },
};

export default AICreateWithAI;

