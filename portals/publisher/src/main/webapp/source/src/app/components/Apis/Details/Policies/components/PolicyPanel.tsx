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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Box } from '@mui/material';
import React, { FC } from 'react';
import PoliciesSection from '../PoliciesSection';
import type { Policy, PolicySpec } from '../Types';

interface PolicyPanelProps {
    children?: React.ReactNode;
    index: number;
    selectedTab: number;
    openAPISpec: any;
    isChoreoConnectEnabled: boolean;
    isAPILevelTabSelected: boolean;
    allPolicies: PolicySpec[] | null;
    policyList: Policy[];
    api: any;
    expandedResource: string | null;
    setExpandedResource: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Tab panel component to render content of a particular tab.
 * Renders the policy section under the relevant tab (i.e. API Level or Operation Level).
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Tab panel.
 */
const PolicyPanel: FC<PolicyPanelProps> = ({
    index,
    selectedTab,
    openAPISpec,
    isChoreoConnectEnabled,
    isAPILevelTabSelected,
    allPolicies,
    policyList,
    api,
    expandedResource,
    setExpandedResource,
}) => {
    const tabs = ['api-level', 'operation-level'];
    const currentTab = tabs[index];

    return (
        <div
            role='tabpanel'
            hidden={selectedTab !== index}
            id={`${currentTab}-tabpanel`}
            aria-labelledby={`${currentTab}-tab`}
        >
            <Box py={1} px={3} sx={{ height: '100vh' }}>
                <PoliciesSection
                    openAPISpec={openAPISpec}
                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                    isAPILevelTabSelected={isAPILevelTabSelected}
                    allPolicies={allPolicies}
                    policyList={policyList}
                    api={api}
                    expandedResource={expandedResource}
                    setExpandedResource={setExpandedResource}
                />
            </Box>
        </div>
    );
};

export default PolicyPanel;
