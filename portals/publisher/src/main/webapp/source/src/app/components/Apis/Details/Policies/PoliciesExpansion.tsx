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

import React, { FC, useContext, useEffect, useState } from 'react';
import PoliciesExpansionShared from 'AppComponents/Shared/PoliciesUI/PoliciesExpansion';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import PolicyDropzone from './PolicyDropzone';
import type { AttachedPolicy, Policy, PolicySpec } from './Types';
import FlowArrow from './components/FlowArrow';
import ApiOperationContext from './ApiOperationContext';

const PREFIX = 'PoliciesExpansion';

const classes = {
    flowSpecificPolicyAttachGrid: `${PREFIX}-flowSpecificPolicyAttachGrid`
};

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }: { theme: Theme }) => ({
    [`& .${classes.flowSpecificPolicyAttachGrid}`]: {
        marginTop: theme.spacing(1),
        overflowX: 'scroll',
    }
}));

const defaultPolicyForMigration = {
    id: '',
    category: 'Mediation',
    name: '',
    displayName: '',
    version: '',
    description: '',
    applicableFlows: [],
    supportedGateways: ['Synapse'],
    supportedApiTypes: [],
    policyAttributes: [],
    isAPISpecific: true,
};

interface PoliciesExpansionProps {
    target: any;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isChoreoConnectEnabled: boolean;
    policyList: Policy[];
    isAPILevelPolicy: boolean;
}

const PoliciesExpansion: FC<PoliciesExpansionProps> = ({
    target,
    verb,
    allPolicies,
    isChoreoConnectEnabled,
    policyList,
    isAPILevelPolicy,
}) => {
    // Policies attached for each request, response and fault flow
    const [requestFlowPolicyList, setRequestFlowPolicyList] = useState<AttachedPolicy[]>([]);
    const [responseFlowPolicyList, setResponseFlowPolicyList] = useState<AttachedPolicy[]>([]);
    const [faultFlowPolicyList, setFaultFlowPolicyList] = useState<AttachedPolicy[]>([]);

    // Droppable policy identifier list for each request, response and fault flow
    const [requestFlowDroppablePolicyList, setRequestFlowDroppablePolicyList] = useState<string[]>([]);
    const [responseFlowDroppablePolicyList, setResponseFlowDroppablePolicyList] = useState<string[]>([]);
    const [faultFlowDroppablePolicyList, setFaultFlowDroppablePolicyList] = useState<string[]>([]);

    const { apiOperations } = useContext<any>(ApiOperationContext);
    const { apiLevelPolicies } = useContext<any>(ApiOperationContext);
    const { api } = useContext<any>(APIContext);

    useEffect(() => {
        const requestList = [];
        const responseList = [];
        const faultList = [];
        for (const policy of policyList) {
            if (policy.applicableFlows.includes('request')) {
                requestList.push(`policyCard-${policy.id}`);
            }
            if (policy.applicableFlows.includes('response')) {
                responseList.push(`policyCard-${policy.id}`);
            }
            if (policy.applicableFlows.includes('fault')) {
                faultList.push(`policyCard-${policy.id}`);
            }
        }
        setRequestFlowDroppablePolicyList(requestList);
        setResponseFlowDroppablePolicyList(responseList);
        setFaultFlowDroppablePolicyList(faultList);
    }, [policyList]);

    useEffect(() => {
        (async () => {
            
            const operationInAction = (!isAPILevelPolicy) ? apiOperations.find(
                (op: any) =>
                    op.target === target &&
                    op.verb.toLowerCase() === verb.toLowerCase(),
            ) : null;
            const apiPolicies = (isAPILevelPolicy) ? apiLevelPolicies : null;

            // Populate request flow attached policy list
            const requestFlowList: AttachedPolicy[] = [];
            const requestFlow = (isAPILevelPolicy) ? apiPolicies.request : operationInAction.operationPolicies.request;
            for (const requestFlowAttachedPolicy of requestFlow) {
                const { policyId, policyName, policyVersion, uuid } =
                    requestFlowAttachedPolicy;
                if (policyId === null) {
                    // Handling migration flow
                    requestFlowList.push({
                        ...defaultPolicyForMigration,
                        name: policyName,
                        displayName: policyName,
                        applicableFlows: ['request'],
                        uniqueKey: uuid,
                    });
                } else {
                    const policyObj = allPolicies?.find(
                        (policy: PolicySpec) => 
                            policy.name === policyName && 
                            policy.version === policyVersion,
                    );
                    if (policyObj) {
                        requestFlowList.push({ ...policyObj, uniqueKey: uuid });
                    } else {
                        try {
                            // eslint-disable-next-line no-await-in-loop
                            const policyResponse = await API.getOperationPolicy(
                                policyId,
                                api.id,
                            );
                            if (policyResponse)
                                requestFlowList.push({
                                    ...policyResponse.body,
                                    uniqueKey: uuid,
                                });
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
            setRequestFlowPolicyList(requestFlowList);

            // Populate response flow attached policy list
            const responseFlowList: AttachedPolicy[] = [];
            const responseFlow = isAPILevelPolicy ? apiPolicies.response : operationInAction.operationPolicies.response;
            for (const responseFlowAttachedPolicy of responseFlow) {
                const { policyId, policyName, policyVersion, uuid } =
                    responseFlowAttachedPolicy;
                if (policyId === null) {
                    // Handling migration flow
                    responseFlowList.push({
                        ...defaultPolicyForMigration,
                        name: policyName,
                        displayName: policyName,
                        applicableFlows: ['response'],
                        uniqueKey: uuid,
                    });
                } else {
                    const policyObj = allPolicies?.find(
                        (policy: PolicySpec) => 
                            policy.name === policyName && 
                            policy.version === policyVersion,
                    );
                    if (policyObj) {
                        responseFlowList.push({ ...policyObj, uniqueKey: uuid });
                    } else {
                        try {
                            // eslint-disable-next-line no-await-in-loop
                            const policyResponse = await API.getOperationPolicy(
                                policyId,
                                api.id,
                            );
                            if (policyResponse)
                                responseFlowList.push({
                                    ...policyResponse.body,
                                    uniqueKey: uuid,
                                });
                        } catch (error) {
                            console.error(error);
                        }
                    }   
                }
            }
            setResponseFlowPolicyList(responseFlowList);

            if (!isChoreoConnectEnabled) {
                // Populate fault flow attached policy list
                const faultFlowList: AttachedPolicy[] = [];
                const faultFlow = isAPILevelPolicy ? apiPolicies.fault : operationInAction.operationPolicies.fault;
                for (const faultFlowAttachedPolicy of faultFlow) {
                    const { policyId, policyName, policyVersion, uuid } =
                        faultFlowAttachedPolicy;
                    if (policyId === null) {
                        // Handling migration flow
                        faultFlowList.push({
                            ...defaultPolicyForMigration,
                            name: policyName,
                            displayName: policyName,
                            applicableFlows: ['fault'],
                            uniqueKey: uuid,
                        });
                    } else {
                        const policyObj = allPolicies?.find(
                            (policy: PolicySpec) => 
                                policy.name === policyName && 
                                policy.version === policyVersion,
                        );
                        if (policyObj) {
                            faultFlowList.push({ ...policyObj, uniqueKey: uuid });
                        } else {
                            try {
                                // eslint-disable-next-line no-await-in-loop
                                const policyResponse = await API.getOperationPolicy(
                                    policyId,
                                    api.id,
                                );
                                if (policyResponse)
                                    faultFlowList.push({
                                        ...policyResponse.body,
                                        uniqueKey: uuid,
                                    });
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                }
                setFaultFlowPolicyList(faultFlowList);
            }
        })();
    }, [apiOperations, apiLevelPolicies]);

    return (
        <PoliciesExpansionShared
            target={target}
            verb={verb}
            allPolicies={allPolicies}
            isChoreoConnectEnabled={isChoreoConnectEnabled}
            isAPILevelPolicy={isAPILevelPolicy}
            requestFlowPolicyList={requestFlowPolicyList}
            setRequestFlowPolicyList={setRequestFlowPolicyList}
            requestFlowDroppablePolicyList={requestFlowDroppablePolicyList}
            responseFlowPolicyList={responseFlowPolicyList}
            setResponseFlowPolicyList={setResponseFlowPolicyList}
            responseFlowDroppablePolicyList={responseFlowDroppablePolicyList}
            faultFlowPolicyList={faultFlowPolicyList}
            setFaultFlowPolicyList={setFaultFlowPolicyList}
            faultFlowDroppablePolicyList={faultFlowDroppablePolicyList}
            FlowArrow={FlowArrow}
            PolicyDropzone={PolicyDropzone}
        />
    );
};

export default PoliciesExpansion;
