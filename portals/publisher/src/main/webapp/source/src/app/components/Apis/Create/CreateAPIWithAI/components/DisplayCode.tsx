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
import { Editor as MonacoEditor } from '@monaco-editor/react';
import AlertDialog from './AlertDialog';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

interface DisplayCodeProps {
    finalOutcomeCode: string;
}
  
const DisplayCode: React.FC<DisplayCodeProps> = ({ finalOutcomeCode }) => {
    return (
        <Box sx={{ width: '100%', height: '85vh'}}>
          <Stack spacing={0} sx={{ height: '95%', mt: 2 }}>
            
            <Box sx={{ height: '12%', backgroundColor: '#192738', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Stack direction="row" spacing={2}></Stack>
                    {/* <Box sx={{ backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        Item 1.1
                    </Box>
                    <Box sx={{ backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        Item 1.2
                    </Box>                     */}
            </Box>
            
            <Box sx={{ height: '76%', display: 'flex' }}>
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
            
            <Box sx={{ height: '12%', backgroundColor: '#192738', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <AlertDialog 
                finalOutcomeCode = {finalOutcomeCode}
              />
            </Box>
            
          </Stack>
        </Box>
      );
};

export default DisplayCode