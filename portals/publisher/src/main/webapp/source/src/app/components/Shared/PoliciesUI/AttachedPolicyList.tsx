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

import React, { FC } from 'react';
import {
    DndContext,
    closestCenter,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    horizontalListSortingStrategy,
    SortableContext,
} from '@dnd-kit/sortable';
import type { AttachedPolicy, PolicySpec } from './Types';

interface AttachedPolicyListSharedProps {
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void;
    policyListToDisplay: AttachedPolicy[];
    AttachedPolicyCard: any;
}

const AttachedPolicyListShared: FC<AttachedPolicyListSharedProps> = ({
    currentPolicyList,
    setCurrentPolicyList,
    currentFlow,
    target,
    verb,
    allPolicies,
    isAPILevelPolicy,
    sensors,
    handleDragEnd,
    policyListToDisplay,
    AttachedPolicyCard,
}) => {
    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={currentPolicyList.map((item) => item.uniqueKey)}
                    strategy={horizontalListSortingStrategy}
                >
                    {policyListToDisplay.map((policy: AttachedPolicy) => (
                        <AttachedPolicyCard
                            key={policy.uniqueKey}
                            policyObj={policy}
                            currentPolicyList={currentPolicyList}
                            setCurrentPolicyList={setCurrentPolicyList}
                            currentFlow={currentFlow}
                            target={target}
                            verb={verb}
                            allPolicies={allPolicies}
                            isAPILevelPolicy={isAPILevelPolicy}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </>
    );
};

export default AttachedPolicyListShared;