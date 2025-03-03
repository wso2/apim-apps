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
import { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SwaggerUI from './swaggerUIChatbot/SwaggerUI';
import { Typography } from '@mui/material';
import { FormattedMessage, injectIntl } from 'react-intl';
import 'swagger-ui-react/swagger-ui.css';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';

interface DisplayCodeProps {
  finalOutcomeCode: string;
  apiType: string;
  sessionId: string;
}

const DisplayCode: React.FC<DisplayCodeProps> = ({ finalOutcomeCode, apiType, sessionId }) => {
  const [showCode, setShowCode] = useState(false);

  const handleDownload = () => {
    const fileExtension = apiType === 'GraphQL' ? 'graphql' : 'yaml';
    const blob = new Blob([finalOutcomeCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-source.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%', height: '85vh' }}>
      <Stack spacing={0} sx={{ height: '100%', mt: 2 }}>
        <Box
          sx={{
            height: '5%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            paddingRight: '0px',
            paddingBottom: '10px',
          }}
        >
            {apiType === 'REST' && (

                  <FormControlLabel
                  label={
                    <Typography sx={{ fontSize: 16}} >
                      View Source
                    </Typography>
                  }
                  control={
                      <Switch
                        checked={showCode}
                        onChange={() => setShowCode((prevState) => !prevState)}
                      />
                  }
                  labelPlacement='start'
                  sx={{ marginRight: '20px' }}
                  />
            )}
            <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={handleDownload}
                sx={{ marginRight: '0px', minWidth: '100px', height: '35px', px: 2, }}
            >
                Download
                <CloudDownloadRounded sx={{ marginLeft: '8px' }} />
            </Button>
        </Box>

        {apiType === 'REST' ? (
            <Box sx={{ height: '100%', display: 'flex', flex:1, minHeight: 0}}>
               { showCode ? (
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
              ) : (
                <Box sx={{ width: '100%', height: '100%', overflow: 'auto', flex: 1 }}>
                  <SwaggerUI spec={finalOutcomeCode} />
                </Box>
              )}
            </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flex:1, minHeight: 0 }}>
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
        )}

        <Box
          sx={{
            height: '5%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
        </Box>
      </Stack>
    </Box>
  );
};

export default DisplayCode;
