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
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import DeletePolicyShared from 'AppComponents/Shared/PoliciesUI/DeletePolicy';

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
    policyId,
    policyName,
    fetchPolicies,
}) => {
    const { api } = useContext<any>(ApiContext);
    const [open, setOpen] = useState(false);
    const setOpenLocal = setOpen; // Need to copy this to access inside the promise.then
    const toggleOpen = () => {
        setOpen(!open);
    };

    const handleDelete = () => {
        const promisedCommonPolicyDelete = API.deleteOperationPolicy(
            api.id,
            policyId,
        );
        promisedCommonPolicyDelete
            .then(() => {
                Alert.info(`${policyName} policy deleted successfully!`);
                setOpenLocal(!open);
                fetchPolicies();
            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error occurred while deleteting policy');
                setOpenLocal(!open);
            });
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <DeletePolicyShared
            policyId={policyId}
            policyName={policyName}
            toggleOpen={toggleOpen}
            handleClose={handleClose}
            open={open}
            handleDelete={handleDelete}
        />
    );
};

export default DeletePolicy;
