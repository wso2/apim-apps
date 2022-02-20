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

import React, { FC, useContext } from 'react';
import {
    DndContext, 
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
} from '@dnd-kit/sortable';
import AttachedPolicyCard from './AttachedPolicyCard';
import type { AttachedPolicy, PolicySpec } from './Types';
import ApiOperationContext from './ApiOperationContext';

interface AttachedPolicyListProps {
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    policyDisplayStartDirection: string;
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
}

/**
 * Renders the Gateway selection section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Radio group for the API Gateway.
 */
const AttachedPolicyList: FC<AttachedPolicyListProps> = ({
    currentPolicyList, setCurrentPolicyList, policyDisplayStartDirection, currentFlow, target, verb,
    allPolicies
}) => {
    const reversedPolicyList = [...currentPolicyList].reverse();
    const policyListToDisplay = policyDisplayStartDirection === 'left' ? currentPolicyList : reversedPolicyList;
    const { sortApiOperations } = useContext<any>(ApiOperationContext);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        
        if (active.id !== over?.id) {
            setCurrentPolicyList((items) => {
                const oldIndex = items.findIndex(item => item.uniqueKey === active.id);
                const newIndex = items.findIndex(item => item.uniqueKey === over?.id);

                arrayMove(items, oldIndex, newIndex);
                sortApiOperations(items, target, verb, currentFlow);
            });
            // console.log('currentPolicyList ', currentPolicyList)
            // sortApiOperations(currentPolicyList, target, verb, currentFlow)
        }
    }

    return (
        <>
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={currentPolicyList.map(item => item.uniqueKey)}
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
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </>
    );
}

export default AttachedPolicyList;
