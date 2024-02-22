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

import { Grid } from '@mui/material';
import React, { FC } from 'react';
import Box from '@mui/material/Box';
import type { Policy, PolicySpec } from '../Types';
import PoliciesExpansion from '../SharedComponents/PoliciesExpansion';

interface PolicySectionProps {
    allPolicies: PolicySpec[] | null;
    policyList: Policy[];
}

/**
 * Renders the policy management page (Basically the PoliciesExpansion component).
 * @returns {TSX} - Policy management page to render.
 */
const PoliciesSection: FC<PolicySectionProps> = ({
    allPolicies,
    policyList,
}) => {
    const borderColor = '';

    return (
        <Box>
            <Box m={1} p={0.1} mt={1.5} sx={{ boxShadow: 0.5, bgcolor: borderColor, borderRadius: 1}}>
                <Grid item xs={12}>
                    <Grid
                        container direction='column' justifyContent='flex-start'
                        spacing={1} alignItems='stretch'
                    >
                        <PoliciesExpansion
                            target={null}
                            verb='None'
                            allPolicies={allPolicies}
                            isChoreoConnectEnabled={false}
                            policyList={policyList}
                            isAPILevelPolicy
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default PoliciesSection;
