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
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import PolicyHub from 'AppData/PolicyHub';
import CONSTS from 'AppData/Constants';
import PolicyDropzone from './PolicyDropzone';
import type { AttachedPolicy, Policy, PolicySpec } from './Types';
import FlowArrow from './components/FlowArrow';
import ApiOperationContext from './ApiOperationContext';

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

const buildMigratedPolicyFallback = (policyName?: string, policyVersion?: string) => ({
    ...defaultPolicyForMigration,
    name: policyName || '',
    displayName: policyName || '',
    version: policyVersion || '',
});

const findPolicyById = (allPolicies: PolicySpec[] | null, policyId: string) => (
    allPolicies?.find((policy: PolicySpec) => policy.id === policyId) || null
);

const findPolicyByNameAndVersion = (
    allPolicies: PolicySpec[] | null,
    policyName?: string,
    policyVersion?: string,
) => (
    allPolicies?.find(
        (policy: PolicySpec) => policy.name === policyName && policy.version === policyVersion,
    ) || null
);

const getPolicyHubSpec = async (policyName?: string, policyVersion?: string) => {
    if (!policyName) {
        return null;
    }

    const policyLookupInput = policyVersion
        ? {
            name: policyName,
            version: policyVersion,
            displayName: policyName,
        }
        : {
            name: policyName,
            displayName: policyName,
        };

    return PolicyHub.getPolicySpec(policyLookupInput);
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
    ) => {
        const policyById = findPolicyById(allPolicies, policyId);
        if (policyById) {
            return policyById;
        }

        if (!isPolicyHubGateway) {
            if (!policyId) {
                return null;
            }
            try {
                const apiPolicyResponse = await API.getOperationPolicy(policyId, api.id);
                return apiPolicyResponse?.body || null;
            } catch (error) {
                console.debug('Unable to resolve attached policy as API-specific', error);
                return null;
            }
        }

        const policyByName = findPolicyByNameAndVersion(allPolicies, policyName, policyVersion);
        if (policyByName) {
            return policyByName;
        }

        const policyFromHub = await getPolicyHubSpec(policyName, policyVersion);
        if (policyFromHub) {
            return policyFromHub;
        }

        if (policyName) {
            return buildMigratedPolicyFallback(policyName, policyVersion);
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
            if (!isPolicyHubGateway && !allPolicies) {
                setRequestFlowPolicyList([]);
                setResponseFlowPolicyList([]);
                setFaultFlowPolicyList([]);
                setListOriginatedFromCommonPolicies([]);
                return;
            }
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
    }, [allPolicies, api.type, apiLevelPolicies, apiOperations, isAPILevelPolicy, isChoreoConnectEnabled,
        isPolicyHubGateway, target, verb]);

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
