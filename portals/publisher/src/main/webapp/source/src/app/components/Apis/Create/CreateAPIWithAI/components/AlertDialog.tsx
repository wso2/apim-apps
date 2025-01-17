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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CreateAPISuccessDialog from './CreateAPISuccessDialog';
import LinearProgress from '@mui/material/LinearProgress';

interface AlertDialogProps {
  finalOutcomeCode: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ finalOutcomeCode }) => {
  const [open, setOpen] = React.useState(false);
  const [showProgress, setShowProgress] = React.useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('');
  const [dialogContentText, setDialogContentText] = React.useState('');
  const [firstDialogAction, setFirstDialogAction] = React.useState('');
  const [secondDialogAction, setSecondDialogAction] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = async () => {
    handleClose();
    setShowProgress(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/create-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: finalOutcomeCode,
        }),
      });

      setShowProgress(false);

      if (!response.ok) {
        setDialogTitle('API Creation Unsuccessful');
        setDialogContentText('API creation was unsuccessful');
        setFirstDialogAction('');
        setSecondDialogAction('CLOSE');

        throw new Error('Failed to create API');
      }

      const data = await response.json();
      console.log('API creation response:', data);

      setDialogTitle('API Creation Successful!');
      setDialogContentText('API created successfully in the Publisher Portal!');
      setFirstDialogAction('CLOSE');
      setSecondDialogAction('VIEW API');

      setSuccessDialogOpen(true);

    } catch (error) {
      setShowProgress(false);

      setDialogTitle('API Creation Unsuccessful');
      setDialogContentText('API creation was unsuccessful. Please try again.');
      setFirstDialogAction('');
      setSecondDialogAction('CLOSE');

      setSuccessDialogOpen(true);

      console.error('Error during API creation:', error);
    }
  };

  return (
    <React.Fragment>
      <Button
        variant="outlined"
        onClick={handleClickOpen}
        sx={{ backgroundColor: '#FFF' }}
      >
        Create API
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Create API"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Confirm creation of API in the Publisher Portal.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            CANCEL
          </Button>
          <Button
            onClick={handleCreate}
            sx={{
              border: '1px solid #1C7EA7'
            }}
            autoFocus
          >
            CREATE
          </Button>
        </DialogActions>
      </Dialog>

      {showProgress && (
        <Dialog 
          open={showProgress} 
          aria-labelledby="progress-dialog-title" 
          sx={{ 
            '.MuiDialog-paper': { 
              padding: '33px 55px',
            } 
          }}
        >
          <DialogTitle id="progress-dialog-title" sx={{ textAlign: 'center' }}>
            API Creation in Progress
          </DialogTitle>
          <DialogContent>
            <LinearProgress
              sx={{ 
                width: '100%',
                height: '6px'
              }} 
            />
          </DialogContent>
        </Dialog>
      )}

      <CreateAPISuccessDialog
        dialogTitle={dialogTitle}
        dialogContentText={dialogContentText}
        firstDialogAction={firstDialogAction}
        secondDialogAction={secondDialogAction}
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      />
    </React.Fragment>
  );
};

export default AlertDialog;