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

import { Box } from '@mui/material';
import React, { FC } from 'react';
import PoliciesSection from './PoliciesSection';
import type { Policy, PolicySpec } from '../Types';

interface PolicyPanelProps {
    children?: React.ReactNode;
    allPolicies: PolicySpec[] | null;
    policyList: Policy[];
}

/**
 * Renders the policy section of the policy management page.
 * This inculdes the dropping zone. The policies are rendered in the PoliciesSection component.
 * @param {JSON} props - Input props from parent components.
 * @returns {TSX} - Policy Panel.
 */
const PolicyPanel: FC<PolicyPanelProps> = ({
    allPolicies,
    policyList,
}) => {

    return (
        <Box py={1} px={3}>
            <PoliciesSection
                allPolicies={allPolicies}
                policyList={policyList}
            />
        </Box>
    );
};

export default PolicyPanel;
