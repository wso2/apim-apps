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
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import type { AttachedPolicy, PolicySpec } from './Types';

const PREFIX = 'PoliciesExpansionShared';

const classes = {
    flowSpecificPolicyAttachGrid: `${PREFIX}-flowSpecificPolicyAttachGrid`
};

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }: { theme: Theme }) => ({
    [`& .${classes.flowSpecificPolicyAttachGrid}`]: {
        marginTop: theme.spacing(1),
        overflowX: 'scroll',
    }
}));

interface PoliciesExpansionSharedBaseProps {
    target: any;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isChoreoConnectEnabled: boolean;
    isAPILevelPolicy: boolean;
    requestFlowPolicyList: AttachedPolicy[];
    setRequestFlowPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    requestFlowDroppablePolicyList: string[];
    responseFlowPolicyList: AttachedPolicy[];
    setResponseFlowPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    responseFlowDroppablePolicyList: string[];
    faultFlowPolicyList: AttachedPolicy[];
    setFaultFlowPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    faultFlowDroppablePolicyList: string[];
    FlowArrow: any;
    PolicyDropzone: any;
}

// Option 1: `listOriginatedFromCommonPolicies` and `isApiRevision` are provided
interface PoliciesWithCommonProps extends PoliciesExpansionSharedBaseProps {
    listOriginatedFromCommonPolicies: string[];
    isApiRevision: boolean;
}

// Option 2: Neither `listOriginatedFromCommonPolicies` nor `isApiRevision` are provided
interface PoliciesWithoutCommonProps extends PoliciesExpansionSharedBaseProps {
    listOriginatedFromCommonPolicies?: undefined;
    isApiRevision?: undefined;
}

// Combine the two using a union type
type PoliciesExpansionSharedProps = PoliciesWithCommonProps | PoliciesWithoutCommonProps;

const PoliciesExpansionShared: FC<PoliciesExpansionSharedProps> = (props) => {
    if ('listOriginatedFromCommonPolicies' in props) {
        // Props were passed, use `listOriginatedFromCommonPolicies` and `isApiRevision`
        return (
            <StyledAccordionDetails>
                <Grid
                    spacing={2}
                    container
                    direction='row'
                    justifyContent='flex-start'
                    alignItems='flex-start'
                >
                    <Grid item xs={12} md={12}>
                        <Box className={classes.flowSpecificPolicyAttachGrid} data-testid='drop-policy-zone-request'>
                            <Typography variant='subtitle2' align='left'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PoliciesExpansion.request.flow.title'
                                    defaultMessage='Request Flow'
                                />
                            </Typography>
                            <props.FlowArrow arrowDirection='left' />
                            <props.PolicyDropzone
                                policyDisplayStartDirection='left'
                                currentPolicyList={props.requestFlowPolicyList}
                                setCurrentPolicyList={props.setRequestFlowPolicyList}
                                droppablePolicyList={props.requestFlowDroppablePolicyList}
                                currentFlow='request'
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                                listOriginatedFromCommonPolicies={props.listOriginatedFromCommonPolicies}
                                isApiRevision={props.isApiRevision}
                            />
                        </Box>
                        <Box className={classes.flowSpecificPolicyAttachGrid} data-testid='drop-policy-zone-response'>
                            <Typography variant='subtitle2' align='left'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PoliciesExpansion.response.flow.title'
                                    defaultMessage='Response Flow'
                                />
                            </Typography>
                            <props.FlowArrow arrowDirection='right' />
                            <props.PolicyDropzone
                                policyDisplayStartDirection='right'
                                currentPolicyList={props.responseFlowPolicyList}
                                setCurrentPolicyList={props.setResponseFlowPolicyList}
                                droppablePolicyList={
                                    props.responseFlowDroppablePolicyList
                                }
                                currentFlow='response'
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                                listOriginatedFromCommonPolicies={props.listOriginatedFromCommonPolicies}
                                isApiRevision={props.isApiRevision}
                            />
                        </Box>
                        {!props.isChoreoConnectEnabled && (
                            <Box className={classes.flowSpecificPolicyAttachGrid}>
                                <Typography variant='subtitle2' align='left'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PoliciesExpansion.fault.flow.title'
                                        defaultMessage='Fault Flow'
                                    />
                                </Typography>
                                <props.FlowArrow arrowDirection='right' />
                                <props.PolicyDropzone
                                    policyDisplayStartDirection='right'
                                    currentPolicyList={props.faultFlowPolicyList}
                                    setCurrentPolicyList={props.setFaultFlowPolicyList}
                                    droppablePolicyList={
                                        props.faultFlowDroppablePolicyList
                                    }
                                    currentFlow='fault'
                                    target={props.target}
                                    verb={props.verb}
                                    allPolicies={props.allPolicies}
                                    isAPILevelPolicy={props.isAPILevelPolicy}
                                    listOriginatedFromCommonPolicies={props.listOriginatedFromCommonPolicies}
                                    isApiRevision={props.isApiRevision}
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </StyledAccordionDetails>
        );
    } else {
        return (
            <StyledAccordionDetails>
                <Grid
                    spacing={2}
                    container
                    direction='row'
                    justifyContent='flex-start'
                    alignItems='flex-start'
                >
                    <Grid item xs={12} md={12}>
                        <Box className={classes.flowSpecificPolicyAttachGrid} data-testid='drop-policy-zone-request'>
                            <Typography variant='subtitle2' align='left'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PoliciesExpansion.request.flow.title'
                                    defaultMessage='Request Flow'
                                />
                            </Typography>
                            <props.FlowArrow arrowDirection='left' />
                            <props.PolicyDropzone
                                policyDisplayStartDirection='left'
                                currentPolicyList={props.requestFlowPolicyList}
                                setCurrentPolicyList={props.setRequestFlowPolicyList}
                                droppablePolicyList={props.requestFlowDroppablePolicyList}
                                currentFlow='request'
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                            />
                        </Box>
                        <Box className={classes.flowSpecificPolicyAttachGrid} data-testid='drop-policy-zone-response'>
                            <Typography variant='subtitle2' align='left'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PoliciesExpansion.response.flow.title'
                                    defaultMessage='Response Flow'
                                />
                            </Typography>
                            <props.FlowArrow arrowDirection='right' />
                            <props.PolicyDropzone
                                policyDisplayStartDirection='right'
                                currentPolicyList={props.responseFlowPolicyList}
                                setCurrentPolicyList={props.setResponseFlowPolicyList}
                                droppablePolicyList={
                                    props.responseFlowDroppablePolicyList
                                }
                                currentFlow='response'
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                            />
                        </Box>
                        {!props.isChoreoConnectEnabled && (
                            <Box className={classes.flowSpecificPolicyAttachGrid}>
                                <Typography variant='subtitle2' align='left'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PoliciesExpansion.fault.flow.title'
                                        defaultMessage='Fault Flow'
                                    />
                                </Typography>
                                <props.FlowArrow arrowDirection='right' />
                                <props.PolicyDropzone
                                    policyDisplayStartDirection='right'
                                    currentPolicyList={props.faultFlowPolicyList}
                                    setCurrentPolicyList={props.setFaultFlowPolicyList}
                                    droppablePolicyList={
                                        props.faultFlowDroppablePolicyList
                                    }
                                    currentFlow='fault'
                                    target={props.target}
                                    verb={props.verb}
                                    allPolicies={props.allPolicies}
                                    isAPILevelPolicy={props.isAPILevelPolicy}
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </StyledAccordionDetails>
        );
    }
};

export default PoliciesExpansionShared;
