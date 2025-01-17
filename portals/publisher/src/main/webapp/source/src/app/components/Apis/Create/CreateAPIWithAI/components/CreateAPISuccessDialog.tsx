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
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';

interface CreateAPISuccessDialogProps {
  dialogTitle: string;
  dialogContentText: string;
  firstDialogAction: string;
  secondDialogAction: string;
  open: boolean;
  onClose: () => void;
}

const CreateAPISuccessDialog: React.FC<CreateAPISuccessDialogProps> = ({ 
  dialogTitle, 
  dialogContentText, 
  firstDialogAction, 
  secondDialogAction, 
  open, 
  onClose 
}) => {
  const { api } = useContext(APIContext);

  const handleSecondAction = () => {
    if (secondDialogAction === 'VIEW API') {
      return;
    }
    onClose();
  };

  // Render the button with conditional navigation
  const renderSecondButton = () => {
    if (secondDialogAction === 'VIEW API') {
      return (
        <Link 
          to={`/apis`}
          style={{ textDecoration: 'none' }}
        >
          <Button 
            onClick={handleSecondAction} 
            sx={{ border: '1px solid #1C7EA7' }} 
            autoFocus
          >
            {secondDialogAction}
          </Button>
        </Link>
      );
    }
    
    return (
      <Button 
        onClick={handleSecondAction} 
        sx={{ border: '1px solid #1C7EA7' }} 
        autoFocus
      >
        {secondDialogAction}
      </Button>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      aria-labelledby="success-dialog-title" 
      aria-describedby="success-dialog-description"
    >
      <DialogTitle id="success-dialog-title">{dialogTitle}</DialogTitle>
 
      <DialogContent>
        <DialogContentText id="success-dialog-description">
          {dialogContentText}
        </DialogContentText>
      </DialogContent>
 
      <DialogActions>
        {firstDialogAction && <Button onClick={onClose} autoFocus>{firstDialogAction}</Button>}
        {renderSecondButton()}
      </DialogActions>
    </Dialog>
  );
};
   
export default CreateAPISuccessDialog;
