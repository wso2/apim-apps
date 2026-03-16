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
import TabPanelShared from 'AppComponents/Shared/PoliciesUI/TabPanel';
import DraggablePolicyCard from '../DraggablePolicyCard';
import type { Policy } from '../Types';

// Flow names moved outside component to avoid recreation on each render
const FLOW_NAMES = ['request', 'response', 'fault'] as const;

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    commonPolicyList?: Policy[];
    apiPolicyList?: Policy[];
    policyList?: Policy[];
    selectedTab: number;
    fetchPolicies: () => void;
    isReadOnly?: boolean;
    hideViewButton?: boolean;
}

/**
 * Tab panel component to render content of a particular tab.
 * Renders the available policy list under the relevant flow related tab (i.e. request, response or fault).
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Tab panel.
 */
const TabPanel: FC<TabPanelProps> = ({
    index,
    commonPolicyList,
    apiPolicyList,
    policyList,
    selectedTab,
    fetchPolicies,
    isReadOnly = false,
    hideViewButton = false,
}) => {
    const currentFlow = FLOW_NAMES[index] ?? 'request';

    return (
        <TabPanelShared
            selectedTab={selectedTab}
            index={index}
            currentFlow={currentFlow}
            policyList={policyList}
            commonPolicyList={commonPolicyList}
            apiPolicyList={apiPolicyList}
            fetchPolicies={fetchPolicies}
            DraggablePolicyCard={DraggablePolicyCard}
            isReadOnly={isReadOnly}
            hideViewButton={hideViewButton}
        />
    );
};

export default TabPanel;
