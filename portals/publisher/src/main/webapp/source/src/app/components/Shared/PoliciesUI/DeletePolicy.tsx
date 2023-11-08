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

import React, { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';

interface DeletePolicySharedProps {
    policyId: string;
    policyName: string;
    toggleOpen: () => void;
    handleClose: () => void;
    open: boolean;
    handleDelete: () => void;
}

const DeletePolicyShared: FC<DeletePolicySharedProps> = ({
    policyId,
    policyName,
    toggleOpen,
    handleClose,
    open,
    handleDelete
}) => {
    return (
        <>
            <Tooltip
                placement='top'
                title={
                    <FormattedMessage
                        id='Apis.Details.Policies.DeletePolicy.delete.title'
                        defaultMessage='Delete'
                    />
                }
            >
                <IconButton
                    onClick={toggleOpen}
                    aria-label={'delete ' + policyName}
                >
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
            <Dialog
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Apis.Details.Policies.DeletePolicy.delete.confirm'
                        defaultMessage='Confirm Delete'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Apis.Details.Policies.DeletePolicy.delete.confirm.content'
                            defaultMessage='Are you sure you want to delete {policy} policy ?'
                            values={{ policy: policyName }}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        id={'cancel-delete-' + policyId}
                        onClick={handleClose}
                        color='primary'
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.DeletePolicy.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        id={'delete-' + policyId}
                        onClick={handleDelete}
                        color='primary'
                        variant='outlined'
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.DeletePolicy.confirm'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default DeletePolicyShared;
