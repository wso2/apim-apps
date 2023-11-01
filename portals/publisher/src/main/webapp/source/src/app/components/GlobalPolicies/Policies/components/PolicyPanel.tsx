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

import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import PoliciesSection from '../PoliciesSection';
import type { Policy, PolicySpec } from '../Types';

interface PolicyPanelProps {
    children?: React.ReactNode;
    isChoreoConnectEnabled: boolean;
    allPolicies: PolicySpec[] | null;
    policyList: Policy[];
}

/**
 * Tab panel component to render content of a particular tab.
 * Renders the policy section under the relevant tab (i.e. API Level or Operation Level).
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Tab panel.
 */
const PolicyPanel: FC<PolicyPanelProps> = ({
    isChoreoConnectEnabled,
    allPolicies,
    policyList,
}) => {

    return (
        <Box py={1} px={3}>
            <PoliciesSection
                isChoreoConnectEnabled={isChoreoConnectEnabled}
                allPolicies={allPolicies}
                policyList={policyList}
            />
        </Box>
    );
};

export default PolicyPanel;
