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

import React, { useEffect, useState } from 'react';
import Alert from 'AppComponents/Shared/Alert';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import ViewPolicyShared from 'AppComponents/Shared/PoliciesUI/ViewPolicy';
import type { Policy, PolicySpec } from './Types';
import PolicyViewForm from './PolicyForm/PolicyViewForm';

interface ViewPolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    policyObj: Policy;
    isLocalToAPI: boolean;
}

/**
 * Renders the UI to view a policy selected from the policy list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC<ViewPolicyProps> = ({
    handleDialogClose,
    dialogOpen,
    policyObj,
    isLocalToAPI,
}) => {
    const [policySpec, setPolicySpec] = useState<PolicySpec | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dialogOpen && !isLocalToAPI) {
            const promisedCommonPolicyGet = API.getCommonOperationPolicy(
                policyObj.id,
            );
            promisedCommonPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((error) => {
                    console.error(error);
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while retrieving policy details');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [dialogOpen]);

    const stopPropagation = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        e.stopPropagation();
    };

    const toggleOpen = () => {
        handleDialogClose();
    };

    if (loading) {
        return <Progress />;
    }

    if (!policySpec) {
        return <></>;
    }

    return (
        <ViewPolicyShared
            handleDialogClose={handleDialogClose}
            dialogOpen={dialogOpen}
            policyObj={policyObj}
            isLocalToAPI={isLocalToAPI}
            stopPropagation={stopPropagation}
            toggleOpen={toggleOpen}
            policySpec={policySpec}
            PolicyViewForm={PolicyViewForm}
        />
    );
};

export default ViewPolicy;
