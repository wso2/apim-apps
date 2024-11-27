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
import { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import AlertDialog from './AlertDialog';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import SwaggerUI from './swaggerUIChatbot/SwaggerUI';
import 'swagger-ui-react/swagger-ui.css';

interface DisplayCodeProps {
    finalOutcomeCode: string;
}
  
const DisplayCode: React.FC<DisplayCodeProps> = ({ finalOutcomeCode }) => {
  const [showCode, setShowCode] = useState(false);  // State to toggle between SwaggerUI and MonacoEditor

  // Toggle between SwaggerUI and MonacoEditor
  const handleClickOpenCode = () => {
    setShowCode((prevState) => !prevState);  // Toggle the state
  };

  const backgroundColor = showCode ? '#192738' : 'rgba(0, 0, 0, .03)';

  return (
      <Box sx={{ width: '100%', height: '85vh'}}>
        <Stack spacing={0} sx={{ height: '95%', mt: 2 }}>
          
          {/* Button to toggle view */}
          <Box sx={{ height: '12%', backgroundColor: backgroundColor, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 10 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleClickOpenCode}
                sx={{ backgroundColor: '#FFF' }}
              >
                {showCode ? 'View Swagger UI' : 'View Code'} {/* Text toggles based on view */}
              </Button>
            </Stack>
          </Box>

        {/* Conditionally render SwaggerUI or MonacoEditor based on showCode state */}
        {showCode ? (
          <Box sx={{ height: '76%', display: 'flex', backgroundColor: backgroundColor }}>
            <MonacoEditor
              width="100%"
              height="100%"
              language="yaml"
              theme="vs-dark"
              value={finalOutcomeCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </Box>
        ) : (
          <Box sx={{ height: '76%', display: 'flex', backgroundColor: backgroundColor }}>
            <SwaggerUI spec={finalOutcomeCode} />
          </Box>
        )}

        <Box sx={{ height: '12%', backgroundColor: backgroundColor, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AlertDialog finalOutcomeCode={finalOutcomeCode} />
        </Box>
      </Stack>
    </Box>
  );
};

export default DisplayCode