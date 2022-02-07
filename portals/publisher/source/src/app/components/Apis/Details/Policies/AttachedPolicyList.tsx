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
import update from 'immutability-helper';
import AttachedPolicyCard from './AttachedPolicyCard';
import type { Policy } from './Types';

interface AttachedPolicyListProps {
    currentPolicyList: Policy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
    policyDisplayStartDirection: string;
    currentFlow: string;
}

/**
 * Renders the Gateway selection section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Radio group for the API Gateway.
 */
const AttachedPolicyList: FC<AttachedPolicyListProps> = ({
    currentPolicyList, setCurrentPolicyList, policyDisplayStartDirection, currentFlow
}) => {
    const reversedPolicyList = [...currentPolicyList].reverse();
    const policyListToDisplay = policyDisplayStartDirection === 'left' ? currentPolicyList : reversedPolicyList;

    const movePolicyCard = (dragIndex: number, hoverIndex: number) => {
        const dragItem = currentPolicyList[dragIndex];
        setCurrentPolicyList(
            update(currentPolicyList, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragItem],
                ],
            }),
        )
    }

    return (
        <>
            {policyListToDisplay.map((policy: Policy, index: number) => (
                <AttachedPolicyCard
                    key={policy.id}
                    index={index}
                    policyObj={policy}
                    movePolicyCard={movePolicyCard}
                    currentPolicyList={currentPolicyList}
                    setCurrentPolicyList={setCurrentPolicyList}
                    currentFlow={currentFlow}
                />
            ))}
        </>
    );
}

export default AttachedPolicyList;
