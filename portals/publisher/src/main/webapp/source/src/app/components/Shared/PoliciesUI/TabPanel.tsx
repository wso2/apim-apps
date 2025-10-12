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

import { Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import React, { FC } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import type { Policy } from './Types';

interface TabPanelSharedProps {
    children?: React.ReactNode;
    currentFlow: string;
    index: number;
    selectedTab: number;
    fetchPolicies: () => void;
    DraggablePolicyCard: any;
    policyList?: Policy[];  
    commonPolicyList?: Policy[]; 
    apiPolicyList?: Policy[];
    isReadOnly?: boolean;
}

const TabPanelShared: FC<TabPanelSharedProps> = ({
    selectedTab,
    index,
    currentFlow,
    policyList,
    commonPolicyList,
    apiPolicyList,
    fetchPolicies,
    DraggablePolicyCard,
    isReadOnly = false,
}) => {
    if (policyList != undefined) {
        return (
            <div
                role='tabpanel'
                hidden={selectedTab !== index}
                id={`${currentFlow}-tabpanel`}
                aria-labelledby={`${currentFlow}-tab`}
            >
                <Box py={1} px={3}>
                {selectedTab === index &&
                    policyList?.map((singlePolicy: Policy) => {
                        return (
                            <DraggablePolicyCard
                                key={singlePolicy.id}
                                policyObj={singlePolicy}
                                showCopyIcon
                                isLocalToAPI={singlePolicy.isAPISpecific}
                                fetchPolicies={fetchPolicies}
                                isReadOnly={isReadOnly}
                            />
                        );
                    })}
                </Box>
            </div>
        );
    } else {
        return (
            <div
                role='tabpanel'
                hidden={selectedTab !== index}
                id={`${currentFlow}-tabpanel`}
                aria-labelledby={`${currentFlow}-tab`}
            >
                <Accordion id='tabPanel-common-policies'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant='subtitle1'>
                            <FormattedMessage
                                id='Apis.Details.Policies.Components.TabPanel.Components.Common.Policy.List'
                                defaultMessage='Common Policies'
                            />
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box py={1} px={3} sx={{
                                                maxWidth: "90%", // Set a maximum width for the accordion
                                                margin: "0 auto",  // Center the accordion horizontally
                                            }} alignItems='center'>
                            {selectedTab === index && (
                                <>
                                    {(commonPolicyList && commonPolicyList.length > 0) ? (
                                        commonPolicyList.map((singlePolicy: Policy) => {
                                            return (
                                                <DraggablePolicyCard
                                                    key={singlePolicy.id}
                                                    policyObj={singlePolicy}
                                                    showCopyIcon
                                                    isLocalToAPI={singlePolicy.isAPISpecific}
                                                    fetchPolicies={fetchPolicies}
                                                    isReadOnly={isReadOnly}
                                                />
                                            );
                                        })
                                    ) : (
                                        <Typography variant='body2' color='textSecondary' align='left'>
                                            No Policies Found
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion id='tabPanel-api-policies'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant='subtitle1'>
                            <FormattedMessage
                                id='Apis.Details.Policies.Components.TabPanel.Components.API.Policy.List'
                                defaultMessage='API Policies'
                            />
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box py={1} px={3} sx={{
                                                maxWidth: "90%", // Set a maximum width for the accordion
                                                margin: "0 auto",  // Center the accordion horizontally
                                            }} alignItems='center'>
                            {selectedTab === index && (
                                <>                                               
                                    {(apiPolicyList && apiPolicyList.length > 0) ? (
                                        apiPolicyList.map((singlePolicy: Policy) => {
                                            return (
                                                <DraggablePolicyCard
                                                    key={singlePolicy.id}
                                                    policyObj={singlePolicy}
                                                    showCopyIcon
                                                    isLocalToAPI={singlePolicy.isAPISpecific}
                                                    fetchPolicies={fetchPolicies}
                                                    isReadOnly={isReadOnly}
                                                />
                                            );
                                        })
                                    ): (
                                        <Typography variant='body2' color='textSecondary' align='left'>
                                            No Policies Found
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </div>
        );
    }
}

export default TabPanelShared;
