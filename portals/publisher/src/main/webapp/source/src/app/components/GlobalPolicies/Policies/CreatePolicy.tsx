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

import React, { useContext, useState } from 'react';
import API from 'AppData/api.js';
import Alert from 'AppComponents/Shared/Alert';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import CreatePolicyShared from 'AppComponents/Shared/PoliciesUI/CreatePolicy';
import type { CreatePolicySpec } from './Types';
import PolicyCreateForm from './PolicyForm/PolicyCreateForm';

interface CreatePolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    fetchPolicies: () => void;
}

/**
 * Renders the UI to create a new policy.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy create UI.
 */
const CreatePolicy: React.FC<CreatePolicyProps> = ({
    handleDialogClose,
    dialogOpen,
    fetchPolicies,
}) => {
    const { api } = useContext<any>(ApiContext);
    const [saving, setSaving] = useState(false);
    const [synapsePolicyDefinitionFile, setSynapsePolicyDefinitionFile] = useState<any[]>([]);
    const [ccPolicyDefinitionFile, setCcPolicyDefinitionFile] = useState<any[]>([]);

    const savePolicy = (
        policySpecContent: CreatePolicySpec,
        synapsePolicyDefinition: any,
        ccPolicyDefinition: any,
    ) => {
        setSaving(true);
        const promisedCommonPolicyAdd = API.addOperationPolicy(
            policySpecContent,
            api.id,
            synapsePolicyDefinition,
            ccPolicyDefinition,
        );
        promisedCommonPolicyAdd
            .then(() => {
                Alert.info('Policy created successfully!');
                setSynapsePolicyDefinitionFile([]);
                setCcPolicyDefinitionFile([]);
                handleDialogClose();
                fetchPolicies();
            })
            .catch((error) => {
                handleDialogClose();
                console.error(error);
                Alert.error('Something went wrong while creating policy');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const onSave = (policySpecification: CreatePolicySpec) => {
        const synapseFile = synapsePolicyDefinitionFile.length !== 0 ? synapsePolicyDefinitionFile : null;
        const ccFile = ccPolicyDefinitionFile.length !== 0 ? ccPolicyDefinitionFile : null;
        savePolicy(
            policySpecification,
            synapseFile,
            ccFile,
        );
        handleDialogClose();
    };

    const stopPropagation = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        e.stopPropagation();
    };

    return (
        <CreatePolicyShared
            handleDialogClose={handleDialogClose}
            dialogOpen={dialogOpen}
            stopPropagation={stopPropagation}
            onSave={onSave}
            synapsePolicyDefinitionFile={synapsePolicyDefinitionFile}
            setSynapsePolicyDefinitionFile={setSynapsePolicyDefinitionFile}
            ccPolicyDefinitionFile={ccPolicyDefinitionFile}
            setCcPolicyDefinitionFile={setCcPolicyDefinitionFile}
            saving={saving}
            PolicyCreateForm={PolicyCreateForm}
        />
    );
};

export default CreatePolicy;
