/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import type { Policy, PolicySpec } from './Types';

interface ViewPolicySharedProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    policyObj: Policy;
    isLocalToAPI: boolean;
    stopPropagation: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    toggleOpen: () => void;
    policySpec: PolicySpec;
    PolicyViewForm: any;
}

const ViewPolicyShared: React.FC<ViewPolicySharedProps> = ({
    handleDialogClose,
    dialogOpen,
    policyObj,
    stopPropagation,
    toggleOpen,
    policySpec,
    PolicyViewForm
}) => {
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
                            {policyObj.displayName}
                        </Typography>
                    </Box>
                    <Box display='flex'>
                        <IconButton
                            color='inherit'
                            onClick={toggleOpen}
                            aria-label='Close'
                        >
                            <Icon>close</Icon>
                        </IconButton>
                    </Box>
                </Box>
                <DialogContent>
                    <Box my={2}>
                        <DialogContentText>
                            <PolicyViewForm
                                policySpec={policySpec}
                                onDone={toggleOpen}
                            />
                        </DialogContentText>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewPolicyShared;
