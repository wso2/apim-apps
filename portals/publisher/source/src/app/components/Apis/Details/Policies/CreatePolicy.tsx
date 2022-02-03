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

import React  from 'react';
import {
    Box,
    Dialog, DialogContent, DialogContentText, Icon, IconButton, Typography,
} from '@material-ui/core';
import { FormattedMessage} from 'react-intl';
import PolicyStepper from './components/PolicyStepper';

interface CreatePolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
}

/**
 * Renders the create policy view.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Create policy page.
 */
const CreatePolicy: React.FC<CreatePolicyProps> = ({
    handleDialogClose, dialogOpen
}) => {
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
                            <FormattedMessage
                                id='Policies.CreatePolicy.listing.heading'
                                defaultMessage='Create New Policy'
                            />
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
                        />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CreatePolicy;
