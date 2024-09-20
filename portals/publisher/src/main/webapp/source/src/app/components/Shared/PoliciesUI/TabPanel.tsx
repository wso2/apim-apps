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

interface TabPanelSharedBaseProps {
    children?: React.ReactNode;
    currentFlow: string;
    index: number;
    selectedTab: number;
    fetchPolicies: () => void;
    DraggablePolicyCard: any;
}

// Option 1: Either `policyList` is passed...
interface TabPanelPolicyListProps extends TabPanelSharedBaseProps {
    policyList: Policy[];  // Mandatory
    commonPolicyList?: never; // Not allowed
    apiPolicyList?: never;    // Not allowed
}

// Option 2: ...or both `commonPolicyList` and `apiPolicyList` are passed
interface TabPanelCommonApiPolicyListProps extends TabPanelSharedBaseProps {
    policyList?: never;      // Not allowed
    commonPolicyList: Policy[]; // Mandatory
    apiPolicyList: Policy[];    // Mandatory
}

// Combine the two using a union type
type TabPanelSharedProps = TabPanelPolicyListProps | TabPanelCommonApiPolicyListProps;

const TabPanelShared: FC<TabPanelSharedProps> = (props) => {
    if ('policyList' in props) {
        return (
            <div
                role='tabpanel'
                hidden={props.selectedTab !== props.index}
                id={`${props.currentFlow}-tabpanel`}
                aria-labelledby={`${props.currentFlow}-tab`}
            >
                <Box py={1} px={3}>
                {props.selectedTab === props.index &&
                    props.policyList?.map((singlePolicy: Policy) => {
                        return (
                            <props.DraggablePolicyCard
                                key={singlePolicy.id}
                                policyObj={singlePolicy}
                                showCopyIcon
                                isLocalToAPI={singlePolicy.isAPISpecific}
                                fetchPolicies={props.fetchPolicies}
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
                hidden={props.selectedTab !== props.index}
                id={`${props.currentFlow}-tabpanel`}
                aria-labelledby={`${props.currentFlow}-tab`}
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
                        <Box py={1} px={3} width='100%' alignItems='center'>
                            {props.selectedTab === props.index && (
                                <>
                                    {(props.commonPolicyList && props.commonPolicyList.length > 0) ? (
                                        props.commonPolicyList.map((singlePolicy: Policy) => {
                                            return (
                                                <props.DraggablePolicyCard
                                                    key={singlePolicy.id}
                                                    policyObj={singlePolicy}
                                                    showCopyIcon
                                                    isLocalToAPI={singlePolicy.isAPISpecific}
                                                    fetchPolicies={props.fetchPolicies}
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
                        <Box py={1} px={3} width='100%' alignItems='center'>
                            {props.selectedTab === props.index && (
                                <>                                               
                                    {(props.apiPolicyList && props.apiPolicyList.length > 0) ? (
                                        props.apiPolicyList.map((singlePolicy: Policy) => {
                                            return (
                                                <props.DraggablePolicyCard
                                                    key={singlePolicy.id}
                                                    policyObj={singlePolicy}
                                                    showCopyIcon
                                                    isLocalToAPI={singlePolicy.isAPISpecific}
                                                    fetchPolicies={props.fetchPolicies}
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