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

import React, { FC, useContext } from 'react';
import {
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import AttachedPolicyListShared from 'AppComponents/Shared/PoliciesUI/AttachedPolicyList';
import AttachedPolicyCard from './AttachedPolicyCard';

import type { AttachedPolicy, PolicySpec } from '../Types';
import GlobalPolicyContext from '../GlobalPolicyContext';


interface AttachedPolicyListProps {
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    policyDisplayStartDirection: string;
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
}

/**
 * Renders the Gateway selection section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Radio group for the API Gateway.
 */
const AttachedPolicyList: FC<AttachedPolicyListProps> = ({
    currentPolicyList,
    setCurrentPolicyList,
    policyDisplayStartDirection,
    currentFlow,
    target,
    verb,
    allPolicies,
    isAPILevelPolicy,
}) => {
    const reversedPolicyList = [...currentPolicyList].reverse();
    const policyListToDisplay = (policyDisplayStartDirection === 'left') ? currentPolicyList : reversedPolicyList;
    const { rearrangeGlobalOperations } = useContext<any>(GlobalPolicyContext);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const policyListCopy = [...currentPolicyList];
            const oldIndex = policyListCopy.findIndex(
                (item) => item.uniqueKey === active.id,
            );
            const newIndex = policyListCopy.findIndex(
                (item) => item.uniqueKey === over?.id,
            );

            rearrangeGlobalOperations(
                oldIndex,
                newIndex,
                currentFlow,
            );
        }
    };

    return (
        <AttachedPolicyListShared
            currentPolicyList={currentPolicyList}
            setCurrentPolicyList={setCurrentPolicyList}
            currentFlow={currentFlow}
            target={target}
            verb={verb}
            allPolicies={allPolicies}
            isAPILevelPolicy={isAPILevelPolicy}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            policyListToDisplay={policyListToDisplay}
            AttachedPolicyCard={AttachedPolicyCard}
        />
    );
};

export default AttachedPolicyList;
