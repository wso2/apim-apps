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
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import type { AttachedPolicy, PolicySpec } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
    flowSpecificPolicyAttachGrid: {
        marginTop: theme.spacing(1),
        overflowX: 'scroll',
    },
}));

interface PoliciesExpansionSharedProps {
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

const PoliciesExpansionShared: FC<PoliciesExpansionSharedProps> = ({
    target,
    verb,
    allPolicies,
    isChoreoConnectEnabled,
    isAPILevelPolicy,
    requestFlowPolicyList,
    setRequestFlowPolicyList,
    requestFlowDroppablePolicyList,
    responseFlowPolicyList,
    setResponseFlowPolicyList,
    responseFlowDroppablePolicyList,
    faultFlowPolicyList,
    setFaultFlowPolicyList,
    faultFlowDroppablePolicyList,
    FlowArrow,
    PolicyDropzone
}) => {
    const classes = useStyles();

    return (
        <ExpansionPanelDetails>
            <Grid
                spacing={2}
                container
                direction='row'
                justify='flex-start'
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
                        <FlowArrow arrowDirection='left' />
                        <PolicyDropzone
                            policyDisplayStartDirection='left'
                            currentPolicyList={requestFlowPolicyList}
                            setCurrentPolicyList={setRequestFlowPolicyList}
                            droppablePolicyList={requestFlowDroppablePolicyList}
                            currentFlow='request'
                            target={target}
                            verb={verb}
                            allPolicies={allPolicies}
                            isAPILevelPolicy={isAPILevelPolicy}
                        />
                    </Box>
                    <Box className={classes.flowSpecificPolicyAttachGrid} data-testid='drop-policy-zone-response'>
                        <Typography variant='subtitle2' align='left'>
                            <FormattedMessage
                                id='Apis.Details.Policies.PoliciesExpansion.response.flow.title'
                                defaultMessage='Response Flow'
                            />
                        </Typography>
                        <FlowArrow arrowDirection='right' />
                        <PolicyDropzone
                            policyDisplayStartDirection='right'
                            currentPolicyList={responseFlowPolicyList}
                            setCurrentPolicyList={setResponseFlowPolicyList}
                            droppablePolicyList={
                                responseFlowDroppablePolicyList
                            }
                            currentFlow='response'
                            target={target}
                            verb={verb}
                            allPolicies={allPolicies}
                            isAPILevelPolicy={isAPILevelPolicy}
                        />
                    </Box>
                    {!isChoreoConnectEnabled && (
                        <Box className={classes.flowSpecificPolicyAttachGrid}>
                            <Typography variant='subtitle2' align='left'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PoliciesExpansion.fault.flow.title'
                                    defaultMessage='Fault Flow'
                                />
                            </Typography>
                            <FlowArrow arrowDirection='right' />
                            <PolicyDropzone
                                policyDisplayStartDirection='right'
                                currentPolicyList={faultFlowPolicyList}
                                setCurrentPolicyList={setFaultFlowPolicyList}
                                droppablePolicyList={
                                    faultFlowDroppablePolicyList
                                }
                                currentFlow='fault'
                                target={target}
                                verb={verb}
                                allPolicies={allPolicies}
                                isAPILevelPolicy={isAPILevelPolicy}
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </ExpansionPanelDetails>
    );
};

export default PoliciesExpansionShared;
