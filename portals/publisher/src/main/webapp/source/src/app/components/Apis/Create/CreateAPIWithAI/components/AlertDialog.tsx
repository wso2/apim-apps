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
import { Button, CircularProgress, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import API from 'AppData/api';

interface AlertDialogProps {
  sessionId: string;
  loading?: boolean;
  taskStatus: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ sessionId, loading = false, taskStatus}) => {
  const [showProgress, setShowProgress] = React.useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('');
  const [dialogContentText, setDialogContentText] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const intl = useIntl();
  const history = useHistory();

    
  async function genPayload(sessionId: any) { 
      try {
          const genPayloadDesignAssistant = new API();
          const response = await genPayloadDesignAssistant.payloadGenAPIDesignAssistant(sessionId);
          if (!response || typeof response !== 'object') {
              throw new Error("Invalid response received from API.");
          }
          return response;
      } catch (error) {
          console.error("Error in sendQuery:", error);
          throw error;
      }
  }

  function createAPI(data: any) {
    const apiData = {
      ...data
    };
    const newAPI = new API(apiData);
    const promisedCreatedAPI = newAPI
        .saveAPIDesignAssistant()
    return promisedCreatedAPI.then((response:any) => {
         console.log(response.body)
    });
  }

  const handleCreate = async () => {
    setShowProgress(true);
  
    try {
      const payloadResponse = await genPayload(sessionId);
      const { generatedPayload } = payloadResponse;
      const parsedPayload = JSON.parse(generatedPayload);
      
      createAPI(parsedPayload);
      setSuccess(true);
      history.push(`/apis`);

    } catch (error) {

      setDialogTitle('API Creation Unsuccessful');
      setDialogContentText('API creation was unsuccessful. Please try again.');
      setSuccess(false);

      console.error('Error during API creation:', error);
    }
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        onClick={handleCreate}
        sx={{ marginRight: '10px', minWidth: '120px',  height: '35px', display: 'flex', gap:1, alignItems: 'center'}}  
        disabled={loading || taskStatus == ''}
      >
        {intl.formatMessage({
          id: 'Apis.Create.Default.APICreateDefault.create.btn',
          defaultMessage: 'Create API'
        })}
        {' '}
        {showProgress &&  <CircularProgress size={16} color='inherit'/> }
      </Button>

      {!success && (
        <Dialog 
          open={successDialogOpen} 
          aria-labelledby="success-dialog-title" 
          aria-describedby="success-dialog-description"
          sx={{ 
            '.MuiDialog-paper': { 
              padding: '33px 55px',
            } 
          }}
        >
          <DialogTitle id="success-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="success-dialog-description">
              {dialogContentText}
            </DialogContentText>
        </DialogContent>
        </Dialog>
      )}

    </React.Fragment>
  );
};

export default AlertDialog;