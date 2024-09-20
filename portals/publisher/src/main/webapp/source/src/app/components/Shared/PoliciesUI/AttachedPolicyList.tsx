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

interface AttachedPolicyListSharedBaseProps {
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

// Option 1: `listOriginatedFromCommonPolicies` and `isApiRevision` are provided
interface AttachedPolicyListWithCommonProps extends AttachedPolicyListSharedBaseProps {
    listOriginatedFromCommonPolicies: string[];
    isApiRevision: boolean;
}

// Option 2: Neither `listOriginatedFromCommonPolicies` nor `isApiRevision` are provided
interface AttachedPolicyListWithoutCommonProps extends AttachedPolicyListSharedBaseProps {
    listOriginatedFromCommonPolicies?: undefined;
    isApiRevision?: undefined;
}

// Combine the two using a union type
type AttachedPolicyListSharedProps = AttachedPolicyListWithCommonProps | AttachedPolicyListWithoutCommonProps;

const AttachedPolicyListShared: FC<AttachedPolicyListSharedProps> = (props) => {
    if ('listOriginatedFromCommonPolicies' in props) {
        return (
            <>
                <DndContext
                    sensors={props.sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={props.handleDragEnd}
                >
                    <SortableContext
                        items={props.currentPolicyList.map((item) => item.uniqueKey)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {props.policyListToDisplay.map((policy: AttachedPolicy) => (
                            <props.AttachedPolicyCard
                                key={policy.uniqueKey}
                                policyObj={policy}
                                currentPolicyList={props.currentPolicyList}
                                setCurrentPolicyList={props.setCurrentPolicyList}
                                currentFlow={props.currentFlow}
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                                listOriginatedFromCommonPolicies={props.listOriginatedFromCommonPolicies}
                                isApiRevision={props.isApiRevision}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </>
        );
    } else {
        return (
            <>
                <DndContext
                    sensors={props.sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={props.handleDragEnd}
                >
                    <SortableContext
                        items={props.currentPolicyList.map((item) => item.uniqueKey)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {props.policyListToDisplay.map((policy: AttachedPolicy) => (
                            <props.AttachedPolicyCard
                                key={policy.uniqueKey}
                                policyObj={policy}
                                currentPolicyList={props.currentPolicyList}
                                setCurrentPolicyList={props.setCurrentPolicyList}
                                currentFlow={props.currentFlow}
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </>
        );
    }
};

export default AttachedPolicyListShared;