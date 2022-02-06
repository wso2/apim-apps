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

import React, { useEffect, useState }  from 'react';
import {
    Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import PolicyStepper from './PolicyStepper';
import type { Policy, PolicyDefinition } from './Types';

interface ViewPolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    policyObj: Policy;
}

const DummyDefaultPolicyDefinition = {
    policyCategory: 'Mediation',
    policyName: 'Add Header',
    policyDisplayName: 'Add Header',
    policyDescription: '',
    multipleAllowed: false,
    applicableFlows: ['Request', 'Response', 'Fault'],
    supportedGateways: ['Synapse'],
    supportedApiTypes: ['REST'],
    policyAttributes: [],
};


/**
 * Renders the UI to view a policy selected from the policy list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC<ViewPolicyProps> = ({
    handleDialogClose, dialogOpen, policyObj
}) => {
    const [policyDefinition, setPolicyDefinition] = useState<PolicyDefinition>(DummyDefaultPolicyDefinition);

    useEffect(() => {
        setPolicyDefinition(DummyDefaultPolicyDefinition);
    }, [])
    
    const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
    }

    const toggleOpen = () => {
        handleDialogClose();
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
                            View {policyObj.name} Policy
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
                            policyDefinition={policyDefinition}
                            setPolicyDefinition={setPolicyDefinition}
                        />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewPolicy;
