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
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CreateAPISuccessDialog from './CreateAPISuccessDialog';
import LinearProgress from '@mui/material/LinearProgress';
import { useHistory } from 'react-router-dom';
import YAML from 'js-yaml';
import API from 'AppData/api';

interface AlertDialogProps {
  sessionId: string;
  spec: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ sessionId, spec }) => {
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

  async function validateGraphQLSchema(definition: any) { 
    try {
      const response = await API.validateGraphQLFile(definition);
      return response.obj;
    } catch (error) {
        console.error("Error validating the GraphQL schema: ", error);
        throw error;
    }
  }

  async function validateOpenAPIDefinition(definition: any) { 
    try {
      const response = await API.validateOpenAPIByFile(definition);
      return response.obj;
    } catch (error) {
        console.error("Error validating the GraphQL schema: ", error);
        throw error;
    }
  }

  async function validateAsyncAPIDefinition(definition: any) { 
    try {
      const response = await API.validateAsyncAPIByFile(definition);
      return response.obj;
    } catch (error) {
        console.error("Error validating the GraphQL schema: ", error);
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
    handleClose();
    setShowProgress(true);

    try {
      const protocolKeys = {
        WS: 'WebSocket',
        SSE: 'SSE',
        WEBSUB: 'WebSub',
        ASYNC: 'Other'
      };
      const payloadResponse = await genPayload(sessionId);
      const { generatedPayload } = payloadResponse;
      const parsedPayload = JSON.parse(generatedPayload);

      type ProtocolTypes = typeof protocolKeys;
      const protocolKey: keyof ProtocolTypes = parsedPayload.type;
      let definition = null;
      let validationResponse = null;
      let graphQLInfo = null;
      if (parsedPayload && parsedPayload.type == 'GRAPHQL') {
        const blobGraphql = new Blob([spec], { type: 'text/plain' });
        definition = new File([blobGraphql], 'modifiedContent.graphql', { type: 'text/plain;charset=utf-8' });
        validationResponse = await validateGraphQLSchema(definition);
        if (validationResponse && validationResponse.isValid) {
          graphQLInfo = validationResponse.graphQLInfo;
        } else {
          setShowProgress(false);

          setDialogTitle('API Creation Unsuccessful');
          setDialogContentText('API creation was unsuccessful. Please try again.');
          setFirstDialogAction('');
          setSecondDialogAction('CLOSE');

          setSuccessDialogOpen(true);

          console.error("The provided API definition is invalid. Please try again.");
          return;
        }
      } else if (parsedPayload && parsedPayload.type == 'HTTP') {
        YAML.load(spec);
        const blobYaml = new Blob([spec], { type: 'text/yaml' });
        definition = new File([blobYaml], 'modifiedContent.yaml', { type: 'text/yaml;charset=utf-8' });
        validationResponse = await validateOpenAPIDefinition(definition);
        if (validationResponse && !validationResponse.isValid) {
          setShowProgress(false);

          setDialogTitle('API Creation Unsuccessful');
          setDialogContentText('API creation was unsuccessful. Please try again.');
          setFirstDialogAction('');
          setSecondDialogAction('CLOSE');

          setSuccessDialogOpen(true);

          console.error("The provided API definition is invalid. Please try again.");
          return;
        }
      } else if (parsedPayload && (parsedPayload.type == 'SSE' || parsedPayload.type == 'WS' 
        || parsedPayload.type == 'WEBSUB' || parsedPayload.type == 'WEBHOOK' || parsedPayload.type == 'ASYNC')) {
          YAML.load(spec);
          const blobYaml = new Blob([spec], { type: 'text/yaml' });
          definition = new File([blobYaml], 'modifiedContent.yaml', { type: 'text/yaml;charset=utf-8' });
          validationResponse = await validateAsyncAPIDefinition(definition);
          if (validationResponse && !validationResponse.isValid) {
            setShowProgress(false);

            setDialogTitle('API Creation Unsuccessful');
            setDialogContentText('API creation was unsuccessful. Please try again.');
            setFirstDialogAction('');
            setSecondDialogAction('CLOSE');

            setSuccessDialogOpen(true);

            console.error("The provided API definition is invalid. Please try again.");
            return;
          }
      }
      
      const data = { name: parsedPayload.name, version: parsedPayload.version, context: parsedPayload.context, 
        gatewayType: parsedPayload.gatewayType, gatewayVendor: parsedPayload.gatewayVendor, protocol: protocolKeys[protocolKey], 
        asyncTransportProtocols: parsedPayload.type, source: 'DesignAssistant', file: definition, graphQLInfo: graphQLInfo };

      if (parsedPayload && parsedPayload.type == 'HTTP') {
        history.push('/apis/create/openapi', data);
      } else if (parsedPayload && (parsedPayload.type == 'SSE' || parsedPayload.type == 'WS' 
        || parsedPayload.type == 'WEBSUB' || parsedPayload.type == 'WEBHOOK' || parsedPayload.type == 'ASYNC')) {
        history.push('/apis/create/asyncapi', data);
      } else if (parsedPayload && parsedPayload.type == 'GRAPHQL') {
        history.push('/apis/create/graphQL', data);
      } else {
        createAPI(parsedPayload);
      }

      setShowProgress(false);
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