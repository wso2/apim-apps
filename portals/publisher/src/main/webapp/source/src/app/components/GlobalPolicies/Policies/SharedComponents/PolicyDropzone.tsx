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

import React, { FC, useState } from 'react';
import { useDrop } from 'react-dnd';
import PolicyDropzoneShared from 'AppComponents/Shared/PoliciesUI/PolicyDropzone';
import type { AttachedPolicy, Policy, PolicySpec } from '../Types';
import AttachedPolicyList from './AttachedPolicyList';
import PolicyConfiguringDrawer from '../GlobalSpecificComponents/PolicyConfiguringDrawer';

interface PolicyDropzoneProps {
    policyDisplayStartDirection: string;
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    droppablePolicyList: string[];
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
}

/**
 * Renders the dropzone which accepts policy cards that are dragged and dropped.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyDropzone: FC<PolicyDropzoneProps> = ({
    policyDisplayStartDirection,
    currentPolicyList,
    setCurrentPolicyList,
    droppablePolicyList,
    currentFlow,
    target,
    verb,
    allPolicies,
    isAPILevelPolicy,
}) => {
    const [droppedPolicy, setDroppedPolicy] = useState<Policy | null>(null);

    /**
     * React DnD Library has been used here.
     * Drop handler for the dropzone.
     * This will set the dropped policy to the state.
     * This data will be sent to the lower level components.
     */
    const [{ canDrop }, drop] = useDrop({
        accept: droppablePolicyList,
        drop: (item: any) => setDroppedPolicy(item.droppedPolicy),
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <PolicyDropzoneShared
            policyDisplayStartDirection={policyDisplayStartDirection}
            currentPolicyList={currentPolicyList}
            setCurrentPolicyList={setCurrentPolicyList}
            currentFlow={currentFlow}
            target={target}
            verb={verb}
            allPolicies={allPolicies}
            isAPILevelPolicy={isAPILevelPolicy}
            drop={drop}
            canDrop={canDrop}
            droppedPolicy={droppedPolicy}
            setDroppedPolicy={setDroppedPolicy}
            AttachedPolicyList={AttachedPolicyList}
            PolicyConfiguringDrawer={PolicyConfiguringDrawer}
        />
    );
};

export default PolicyDropzone;
