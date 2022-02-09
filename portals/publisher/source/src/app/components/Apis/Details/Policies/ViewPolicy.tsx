/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useContext, useEffect, useState }  from 'react';
import {
    Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Alert from 'AppComponents/Shared/Alert';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import PolicyStepper from './PolicyStepper';
import type { Policy, PolicySpec } from './Types';
import ApiContext from '../components/ApiContext';

interface ViewPolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    policyObj: Policy;
}

/**
 * Renders the UI to view a policy selected from the policy list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC<ViewPolicyProps> = ({
    handleDialogClose, dialogOpen, policyObj
}) => {
    const { api } = useContext<any>(ApiContext);
    const [policyDefinitionFile, setPolicyDefinitionFile] = useState<any[]>([]);
    const [policySpec, setPolicySpec] = useState<PolicySpec|null>(null);

    useEffect(() => {
        if (dialogOpen) {
            const promisedPolicyGet = API.getOperationPolicy(policyObj.id, api.id);
            promisedPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((errorMessage) => {
                    Alert.error(JSON.stringify(errorMessage));
                });
        }
    }, [dialogOpen])
    
    const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
    }

    const toggleOpen = () => {
        handleDialogClose();
    }

    if (!policySpec) {
        return <Progress />
    }

    return (
        <>
            <Dialog
                maxWidth='md'
                open={dialogOpen}
                aria-labelledby='form-dialog-title'
                onClose={handleDialogClose}
                onClick={stopPropagation}
                fullWidth
            >
                <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    flexDirection='row'
                    px={3}
                    pt={3}
                >
                    <Box display='flex'>
                        <Typography variant='h4' component='h2'>
                            {policyObj.displayName} Policy
                        </Typography>
                    </Box>
                    <Box display='flex'>
                        <IconButton color='inherit' onClick={toggleOpen} aria-label='Close'>
                            <Icon>close</Icon>
                        </IconButton>
                    </Box>
                </Box>
                <DialogContent>
                    <DialogContentText>
                        <PolicyStepper
                            isAPI
                            onSave={toggleOpen}
                            isReadOnly
                            policyDefinitionFile={policyDefinitionFile}
                            setPolicyDefinitionFile={setPolicyDefinitionFile}
                            policySpec={policySpec}
                            setPolicySpec={setPolicySpec}
                        />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewPolicy;
