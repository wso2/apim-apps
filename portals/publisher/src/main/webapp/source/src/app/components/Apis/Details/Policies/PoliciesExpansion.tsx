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
import PolicyHub from 'AppData/PolicyHub';
import CONSTS from 'AppData/Constants';
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
    const [listOriginatedFromCommonPolicies, setListOriginatedFromCommonPolicies] = useState<string[]>([]);
    const isPolicyHubGateway = api.gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform;

    const resolvePolicySpec = async (
        policyId: string,
        policyName?: string,
        policyVersion?: string,
        isCommonPolicy = false,
    ) => {
        const policyById = allPolicies?.find((policy: PolicySpec) => policy.id === policyId);
        if (policyById) {
            return policyById;
        }

        if (isPolicyHubGateway) {
            const policyByName = allPolicies?.find(
                (policy: PolicySpec) => policy.name === policyName && policy.version === policyVersion,
            );
            if (policyByName) {
                return policyByName;
            }

            if (policyName && policyVersion) {
                const policy = await PolicyHub.getPolicySpec({
                    name: policyName,
                    version: policyVersion,
                    displayName: policyName,
                });
                if (policy) {
                    return policy;
                }
            }

            if (policyName) {
                const policy = await PolicyHub.getPolicySpec({
                    name: policyName,
                    displayName: policyName,
                });
                if (policy) {
                    return policy;
                }
                return {
                    ...defaultPolicyForMigration,
                    name: policyName,
                    displayName: policyName,
                    version: policyVersion || '',
                };
            }

            return null;
        }

        if (policyId) {
            const policyResponse = isCommonPolicy
                ? await API.getCommonOperationPolicy(policyId)
                : await API.getOperationPolicy(policyId, api.id);
            return policyResponse?.body || null;
        }
        return null;
    };

    const buildAttachedPoliciesForFlow = async (
        attachedPolicies: any[],
        flowName: 'request' | 'response' | 'fault' | 'hub',
        originatedFromCommonPolicies: string[],
    ) => {
        const flowPolicies: AttachedPolicy[] = [];
        for (const attachedPolicy of attachedPolicies) {
            const { policyId, policyName, policyVersion, uuid } = attachedPolicy;
            if (policyId === null) {
                flowPolicies.push({
                    ...defaultPolicyForMigration,
                    name: policyName,
                    displayName: policyName,
                    applicableFlows: [flowName],
                    uniqueKey: uuid,
                });
                continue;
            }
            try {
                let policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId) || null;
                const isCommonPolicy = Boolean(!policyObj && !isPolicyHubGateway && policyId);
                if (isCommonPolicy) {
                    originatedFromCommonPolicies.push(policyId);
                }
                if (!policyObj) {
                    // eslint-disable-next-line no-await-in-loop
                    policyObj = await resolvePolicySpec(
                        policyId,
                        policyName,
                        policyVersion,
                        isCommonPolicy,
                    );
                }
                if (policyObj) {
                    flowPolicies.push({ ...policyObj, uniqueKey: uuid });
                }
            } catch (error) {
                console.error(error);
            }
        }
        return flowPolicies;
    };

    useEffect(() => {
        const requestList = [];
        const responseList = [];
        const faultList = [];
        for (const policy of policyList) {
            if (isPolicyHubGateway) {
                requestList.push(`policyCard-${policy.id}`);
                continue;
            }
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
    }, [policyList, isPolicyHubGateway]);

    useEffect(() => {
        (async () => {
            const operationInAction = (!isAPILevelPolicy) ? apiOperations.find(
                (op: any) =>
                    api.type === 'WS'
                        ? op.target === target
                        : op.target === target && op.verb.toLowerCase() === verb.toLowerCase(),
            ) : null;
            const originatedFromCommonPolicies : string[] = [];
            if (isPolicyHubGateway) {
                const hubPolicies = isAPILevelPolicy
                    ? (apiLevelPolicies || [])
                    : (operationInAction?.operationHubPolicies || []);
                const hubPolicyList = await buildAttachedPoliciesForFlow(
                    hubPolicies,
                    'hub',
                    originatedFromCommonPolicies,
                );
                setRequestFlowPolicyList(hubPolicyList);
                setResponseFlowPolicyList([]);
                setFaultFlowPolicyList([]);
            } else {
                const apiPolicies = (isAPILevelPolicy) ? apiLevelPolicies : null;
                const requestFlow = (isAPILevelPolicy) ? apiPolicies.request : operationInAction.operationPolicies.request;
                const requestFlowList = await buildAttachedPoliciesForFlow(
                    requestFlow,
                    'request',
                    originatedFromCommonPolicies,
                );
                setRequestFlowPolicyList(requestFlowList);
                const responseFlow = isAPILevelPolicy ? apiPolicies.response : operationInAction.operationPolicies.response;
                const responseFlowList = await buildAttachedPoliciesForFlow(
                    responseFlow,
                    'response',
                    originatedFromCommonPolicies,
                );
                setResponseFlowPolicyList(responseFlowList);

                if (!isChoreoConnectEnabled) {
                    const faultFlow = isAPILevelPolicy ? apiPolicies.fault : operationInAction.operationPolicies.fault;
                    const faultFlowList = await buildAttachedPoliciesForFlow(
                        faultFlow,
                        'fault',
                        originatedFromCommonPolicies,
                    );
                    setFaultFlowPolicyList(faultFlowList);
                }
            }
            setListOriginatedFromCommonPolicies(originatedFromCommonPolicies);
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
            listOriginatedFromCommonPolicies={listOriginatedFromCommonPolicies}
            isApiRevision={api.isRevision}
            apiType={api.type}
            isPolicyHubGateway={isPolicyHubGateway}
        />
    );
};

export default PoliciesExpansion;
