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

interface CreateAPISuccessDialogProps {
  dialogTitle: string;
  dialogContentText: string;
  firstDialogAction: string;
  secondDialogAction: string;
  open: boolean;
  onClose: () => void;
}
  
  const CreateAPISuccessDialog: React.FC<CreateAPISuccessDialogProps> = ({ dialogTitle, dialogContentText, firstDialogAction, secondDialogAction, open, onClose }) => {
    // const handleCreate = async () => {
    //   try {
    //     const response = await fetch('http://127.0.0.1:5000/createapiinportal', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         text: finalOutcomeCode, // Send finalOutcomeCode to the endpoint
    //       }),
    //     });
  
    //     if (!response.ok) {
    //       throw new Error('Failed to create API');
    //     }
  
    //     const data = await response.json();
    //     console.log('API creation response:', data);
    //   } catch (error) {
    //     console.error('Error during API creation:', error);
    //   } finally {
    //     handleClose(); // Close the dialog after the request completes
    //   }
    // };


    return (
      <Dialog open={open} onClose={onClose} aria-labelledby="success-dialog-title" aria-describedby="success-dialog-description">
        <DialogTitle id="success-dialog-title">{dialogTitle}</DialogTitle>
  
        <DialogContent>
          <DialogContentText id="success-dialog-description">
            {dialogContentText}
          </DialogContentText>
        </DialogContent>
  
        <DialogActions>
          {firstDialogAction && <Button onClick={onClose} autoFocus>{firstDialogAction}</Button>}
          <Button onClick={onClose} sx={{ border: '1px solid #1C7EA7' }} autoFocus>{secondDialogAction}</Button>
        </DialogActions>
      </Dialog>
    );
};
    
export default CreateAPISuccessDialog