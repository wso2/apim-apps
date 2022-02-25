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

import React, { useState, FC, useContext } from 'react';
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
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';

interface DeletePolicyProps {
    policyId: string;
    policyName: string;
    fetchPolicies: () => void;
}

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const DeletePolicy: FC<DeletePolicyProps> = ({
    policyId, policyName, fetchPolicies
}) => {
    const { api } = useContext<any>(ApiContext);
    const [open, setOpen] = useState(false);
    const setOpenLocal = setOpen; // Need to copy this to access inside the promise.then
    const toggleOpen = () => {
        setOpen(!open);
    };

    const deleteOperationPolicy = () => {
        const promisedCommonPolicyDelete = API.deleteOperationPolicy(api.id, policyId);
        promisedCommonPolicyDelete
            .then(() => {
                Alert.info(`${policyName} policy deleted successfully!`);
                setOpenLocal(!open);
                fetchPolicies();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error('Error occurred while deleteting policy');
                setOpenLocal(!open);
            });
    };
    
    const handleDelete = () => {
        deleteOperationPolicy();
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <>
            <Tooltip
                placement='top'
                title={
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyList.Policy.Delete'
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
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Policies.Delete.Delete.policy.delete.confirm'
                        defaultMessage='Confirm Delete'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Policies.Delete.Delete.policy.label.ok.confirm'
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
                            id='Policies.Delete.Delete.policy.listing.label.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        id={'delete-' + policyId}
                        onClick={handleDelete}
                        color='primary'
                    >
                        <FormattedMessage
                            id='Policies.Delete.Delete.policy.listing.label.ok.yes'
                            defaultMessage='Yes'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default DeletePolicy;
