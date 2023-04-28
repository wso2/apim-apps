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

import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import DraggablePolicyCard from '../DraggablePolicyCard';
import PoliciesSection from '../PoliciesSection';
import type { Policy, PolicySpec } from '../Types';

interface PolicyPanelProps {
    children?: React.ReactNode;
    index: number;
    selectedTab: number;
    openAPISpec: any;
    isChoreoConnectEnabled: boolean;
    isAPILevelGranularitySelected: boolean;
    allPolicies: PolicySpec[] | null;
    policyList: Policy[];
    api: any;
    expandedResource: string | null;
    setExpandedResource: React.Dispatch<React.SetStateAction<string | null>>;
    fetchPolicies: () => void;
}

/**
 * Tab panel component to render content of a particular tab.
 * Renders the available policy list under the relevant flow related tab (i.e. request, response or fault).
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Tab panel.
 */
const PolicyPanel: FC<PolicyPanelProps> = ({
    index,
    selectedTab,
    openAPISpec,
    isChoreoConnectEnabled,
    isAPILevelGranularitySelected,
    allPolicies,
    policyList,
    api,
    expandedResource,
    setExpandedResource,
    fetchPolicies,
}) => {
    const flowNames = ['request', 'response', 'fault'];
    const currentFlow = flowNames[index];

    return (
        <div
            role='tabpanel'
            hidden={selectedTab !== index}
            id={`${currentFlow}-tabpanel`}
            aria-labelledby={`${currentFlow}-tab`}
        >
            <Box py={1} px={3}>
                <PoliciesSection
                    openAPISpec={openAPISpec}
                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                    isAPILevelGranularitySelected={isAPILevelGranularitySelected}
                    allPolicies={allPolicies}
                    policyList={policyList}
                    api={api}
                    expandedResource={expandedResource}
                    setExpandedResource={setExpandedResource}
                    fetchPolicies={fetchPolicies}
                />
            </Box>
        </div>
    );
};

export default PolicyPanel;
