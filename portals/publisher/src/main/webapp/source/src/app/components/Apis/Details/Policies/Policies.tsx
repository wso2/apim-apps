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

import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Alert from 'AppComponents/Shared/Alert';
import React, { useState, useEffect, useMemo } from 'react';
import cloneDeep from 'lodash.clonedeep';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { FormattedMessage } from 'react-intl';
import { mapAPIOperations } from 'AppComponents/Apis/Details/Resources/operationUtils';
import API from 'AppData/api';
import PolicyHub from 'AppData/PolicyHub';
import CONSTS from 'AppData/Constants';
import { Progress } from 'AppComponents/Shared';
import { arrayMove } from '@dnd-kit/sortable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PolicyList from './PolicyList';
import type { ApiPolicy, Policy, PolicySpec, ApiLevelPolicy } from './Types';
import { ApiOperationContextProvider } from './ApiOperationContext';
import { uuidv4 } from './Utils';
import SaveOperationPolicies from './SaveOperationPolicies';
import PolicyPanel from './components/PolicyPanel';

const PREFIX = 'Policies';

const classes = {
    gridItem: `${PREFIX}-gridItem`,
    operationListingBox: `${PREFIX}-operationListingBox`,
    paper: `${PREFIX}-paper`,
    ccTypography: `${PREFIX}-ccTypography`,
    flowTabs: `${PREFIX}-flowTabs`,
    flowTab: `${PREFIX}-flowTab`
};

const StyledApiOperationContextProvider = styled(ApiOperationContextProvider)(() => ({
    [`& .${classes.gridItem}`]: {
        display: 'flex',
        width: '100%',
    },

    [`& .${classes.operationListingBox}`]: {
        overflowY: 'scroll',
    },

    [`& .${classes.paper}`]: {
        padding: '2px',
    },

    [`& .${classes.ccTypography}`]: {
        paddingLeft: '10px',
        marginTop: '20px',
    },

    [`& .${classes.flowTabs}`]: {
        '& button': {
            minWidth: 50,
        },
    },

    [`& .${classes.flowTab}`]: {
        fontSize: 'smaller',
    }
}));

const Configurations = require('Config');

/**
 * Renders the policy management page.
 * @returns {TSX} Policy management page to render.
 */
const Policies: React.FC = () => {

    const [api, updateAPI] = useAPI();
    const [updating, setUpdating] = useState(false);
    const [apiPolicies, setApiPolicies] = useState<Policy[] | null>(null);
    const [commonPolicies, setCommonPolicies] = useState<Policy[] | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [allPolicies, setAllPolicies] = useState<PolicySpec[] | null>(null);
    const [expandedResource, setExpandedResource] = useState<string | null>(null);
    const isChoreoConnectGateway = (gatewayType: string) => (
        gatewayType === 'wso2/apk' || gatewayType === CONSTS.GATEWAY_TYPE.choreoConnect
    );
    const [isChoreoConnectEnabled, setIsChoreoConnectEnabled] = useState(isChoreoConnectGateway(api.gatewayType));
    const { showMultiVersionPolicies } = Configurations.apis;
    const [selectedTab, setSelectedTab] = useState(
        api.type === 'GRAPHQL' || api.apiPolicies != null || api.apiHubPolicies != null ? 0 : 1,
    );
    const [gateway, setGateway] = useState<string>("");
    const isPolicyHubGateway = api.gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform;

    // If Choreo Connect radio button is selected in GatewaySelector, it will pass 
    // value as true to render other UI changes specific to the Choreo Connect.
    const setIsChangedToCCGatewayType = (isCCEnabled: boolean) => {
        setIsChoreoConnectEnabled(isCCEnabled);
    }

    // Tabs
    const apiLevelTab = 0;
    const operationLevelTab = 1;

    const initApiLevelPolicy: ApiLevelPolicy = {
        request: [],
        response: [],
        fault: [],
    };

    const getInitPolicyListState = (policyList: any[] | null | undefined) => {
        const clonedPolicyList = cloneDeep(policyList) || [];
        clonedPolicyList.forEach((policyItem: ApiPolicy) => {
            policyItem.uuid = uuidv4();
        });
        return clonedPolicyList;
    };

    const getInitPolicyState = (policyList: any) => {
        // Iterating through the policy list of request flow, response flow and fault flow
        for (const flow in policyList) {
            if (Object.prototype.hasOwnProperty.call(policyList, flow)) {
                const policyArray = policyList[flow];
                policyArray.forEach((policyItem: ApiPolicy) => {
                    // eslint-disable-next-line no-param-reassign
                    policyItem.uuid = uuidv4();
                });
            }
        }
    }

    const isApiTypeSupported = (supportedApiTypes: any[]) => {
        return supportedApiTypes.some((item: any) => {
            if (typeof item === 'string') {
                return item === api.type;
            }
            if (typeof item === 'object') {
                return item.apiType === api.type && item.subType === api.subtypeConfiguration?.subtype;
            }
            return false;
        });
    };

    /**
     * Function to get the initial state of all the operation policies from the API object.
     * We are setting a unique ID for all the operation policies solely for UI specific operations.
     * We use this UUID for edit and delete operations.
     * Before saving to backend, we are removing this UUID.
     * @returns {Object} The operations object which is cloned from the API object with an additional UUID.
     */
    const getInitState = () => {
        const clonedOperations = cloneDeep(api.operations);
        clonedOperations.forEach((operation: any) => {
            if (isPolicyHubGateway) {
                operation.operationHubPolicies = getInitPolicyListState(operation.operationHubPolicies);
            } else if (operation.operationPolicies) {
                getInitPolicyState(operation.operationPolicies);
            }
        });
        return clonedOperations;
    }

    const getInitAPILevelPoliciesState = () => {
        if (isPolicyHubGateway) {
            return getInitPolicyListState(api.apiHubPolicies);
        }
        const clonedAPIPolicies = cloneDeep(api.apiPolicies);
        if (clonedAPIPolicies) {
            getInitPolicyState(clonedAPIPolicies);
        }
        return clonedAPIPolicies || initApiLevelPolicy;
    };

    const [apiOperations, setApiOperations] = useState<any>(getInitState);
    const [apiLevelPolicies, setApiLevelPolicies] = useState<any>(getInitAPILevelPoliciesState);
    const [openAPISpec, setOpenAPISpec] = useState<any>(null);

    useEffect(() => {
        const currentOperations = getInitState();
        setApiOperations(currentOperations);

        const currentAPIPolicies = getInitAPILevelPoliciesState();
        setApiLevelPolicies(currentAPIPolicies);
    }, [api]);

    /**
     * Fetches all common policies & API specific policies.
     * Sets the allPolicies state: this allPolicies state is used to get policies from any given policy ID.
     * Sets the policies state: policy state is used to display the available policies that are draggable.
     */
    const fetchPolicies = () => {
        if (isPolicyHubGateway) {
            setGateway(CONSTS.GATEWAY_TYPE.apiPlatform);
            PolicyHub.listAllPolicySpecs()
                .then((policySpecs: PolicySpec[]) => {
                    const filteredPolicySpecs = policySpecs.filter(
                        (policy: PolicySpec) => isApiTypeSupported(policy.supportedApiTypes),
                    );
                    const filteredPolicies: Policy[] = filteredPolicySpecs.map((policySpec: PolicySpec) => ({
                        ...policySpec,
                        isAPISpecific: Boolean(policySpec.isAPISpecific),
                        supportedApiTypes: policySpec.supportedApiTypes as Policy['supportedApiTypes'],
                    }));

                    setAllPolicies(policySpecs);
                    setApiPolicies([]);
                    setCommonPolicies(filteredPolicies);
                    setPolicies(filteredPolicies);
                })
                .catch((error) => {
                    console.error(error);
                    Alert.error('Error occurred while retrieving the policy list');
                });
            return;
        }

        const apiPoliciesPromise = API.getOperationPolicies(api.id);
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([apiPoliciesPromise, commonPoliciesPromise]).then((response) => {
            const [apiPoliciesResponse, commonPoliciesResponse] = response;
            const apiSpecificPoliciesList = apiPoliciesResponse.body.list;
            const commonPoliciesList = commonPoliciesResponse.body.list;
            const mergedList = [...commonPoliciesList, ...apiSpecificPoliciesList];

            // Get all common policies and API specific policies
            setAllPolicies(mergedList);

            let apiPolicyByPolicyDisplayName;
            let commonPolicyByPolicyDisplayName;
            // Get the union of policies depending on the policy display name and version
            apiPolicyByPolicyDisplayName = [...apiSpecificPoliciesList
                .reduce((map: Map<string, Policy>, obj: Policy) => 
                    map.set((showMultiVersionPolicies ? obj.name + obj.version : obj.name), obj), 
                    new Map()).values()];

            commonPolicyByPolicyDisplayName = [...commonPoliciesList
                .reduce((map: Map<string, Policy>, obj: Policy) => 
                    map.set((showMultiVersionPolicies ? obj.name + obj.version : obj.name), obj), 
                    new Map()).values()];

            apiPolicyByPolicyDisplayName.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))
            
            commonPolicyByPolicyDisplayName.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))

            let gatewayType;
            if (api.gatewayType === "wso2/apk") {
                // Get CC gateway supported policies
                gatewayType = 'ChoreoConnect';
            } else if (api.gatewayType === "Azure") {
                gatewayType = 'Azure';
            } else {
                // Get synpase gateway supported policies
                gatewayType = 'Synapse';
            }
            setGateway(gatewayType);

            let filteredApiPolicyByGatewayTypeList = null;
            let filteredCommonPolicyByGatewayTypeList = null;
            
            // Get relevant gateway supported policies
            filteredApiPolicyByGatewayTypeList = apiPolicyByPolicyDisplayName.filter(
                (policy: Policy) => policy.supportedGateways.includes(gatewayType));
            filteredCommonPolicyByGatewayTypeList = commonPolicyByPolicyDisplayName.filter(
                (policy: Policy) => policy.supportedGateways.includes(gatewayType));

            let filteredApiPoliciesByAPITypeList = [];
            let filteredCommonPoliciesByAPITypeList = [];

            if (api.type === "HTTP" || api.type === "SOAP" || api.type === "SOAPTOREST" || api.type === "GRAPHQL" || api.type === "WS") {
                // Get API policies based on the API type
                filteredApiPoliciesByAPITypeList = filteredApiPolicyByGatewayTypeList.filter((policy: Policy) => {
                    return isApiTypeSupported(policy.supportedApiTypes);
                });

                // Get common policies based on the API type
                filteredCommonPoliciesByAPITypeList = filteredCommonPolicyByGatewayTypeList.filter((policy: Policy) => {
                    return isApiTypeSupported(policy.supportedApiTypes);
                });
            }

            setApiPolicies(filteredApiPoliciesByAPITypeList);
            setCommonPolicies(filteredCommonPoliciesByAPITypeList);
            const combinedPolicyList = [...filteredCommonPoliciesByAPITypeList, ...filteredApiPoliciesByAPITypeList];
            combinedPolicyList.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))
            setPolicies(combinedPolicyList);

        }).catch((error) => {
            console.error(error);
            Alert.error('Error occurred while retrieving the policy list');
        });
    }

    const removeAPIPoliciesForGatewayChange = () => {
        const newApiOperations: any = cloneDeep(apiOperations);
        // Set operation policies to the API object
        newApiOperations.forEach((operation: any) => {
            if (isPolicyHubGateway) {
                operation.operationHubPolicies = [];
            } else if (operation.operationPolicies) {
                const { operationPolicies } = operation;
                for (const flow in operationPolicies) {
                    if (Object.prototype.hasOwnProperty.call(operationPolicies, flow)) {
                        operationPolicies[flow] = [];
                    }
                }
            }
        });
        setApiOperations(newApiOperations);
        setApiLevelPolicies(isPolicyHubGateway ? [] : initApiLevelPolicy);
    }

    useEffect(() => {
        fetchPolicies();
        if (isChoreoConnectEnabled) {
            setSelectedTab(1);
        }
    }, [isChoreoConnectEnabled, api.gatewayType, api.type]);

    useEffect(() => {
        setIsChoreoConnectEnabled(isChoreoConnectGateway(api.gatewayType));
    }, [api.gatewayType]);

    useEffect(() => {
        // Update the Swagger spec object when API object gets changed
        if (api.type != 'WS'){
            api.getSwagger()
                .then((response: any) => {
                    const retrievedSpec = response.body;
                    setOpenAPISpec(retrievedSpec);

                    // To expand the first operation by default on page render
                    const [target, verbObject]: [string, any] = Object.entries(retrievedSpec.paths)[0];
                    const verb = Object.keys(verbObject)[0]
                    setExpandedResource(verb + target)
                })
                .catch((error: any) => {
                    console.error(error);
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    }
                });
        } else {
            api.getAsyncAPIDefinition(api.id)
                .then((response: any) => {
                    const retrievedSpec = response.body;
                    setOpenAPISpec(retrievedSpec);            

                    // The verb (subscribe/publish) is ignored for websocket apis
                    const target = Object.keys(retrievedSpec.channels)[0];
                    setExpandedResource(target)
                })
                .catch((error: any) => {
                    console.error(error);
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    }
                });
        }
    }, [api.id]);

    const localAPI = useMemo(
        () => ({
            id: api.id,
            operations: api.isAPIProduct() ? {} : mapAPIOperations(api.operations),
            type: api.type,
        }),
        [api],
    );

    /**
     * To update the API Operations object and maintain the current state of attached policies.
     * Note that this function does not perform an API object update, rather, just a state update.
     * @param {any} updatedOperation updated operation of API object
     * @param {string} target target that needs to be updated
     * @param {string} verb verb of the operation that neeeds to be updated
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault
     */
    const updateApiOperations = (
        updatedOperation: any, target: string, verb: string, currentFlow: string,
    ) => {
        const newApiOperations: any = cloneDeep(apiOperations);
        const newApiLevelPolicies: any = cloneDeep(apiLevelPolicies);

        // For websocket APIs, as the verb is ignored, at most two operations (sub and pub) have the same target path
        // For other API types, the target + verb combination is unique
        const operationInAction =
            selectedTab === operationLevelTab
                ? newApiOperations.filter(
                    (op: any) =>
                        api.type === 'WS'
                            ? op.target === target
                            : op.target === target && op.verb.toLowerCase() === verb.toLowerCase(),
                )
                : null;

        if (selectedTab === apiLevelTab) {
            if (isPolicyHubGateway && currentFlow === 'hub') {
                const existingPolicy = newApiLevelPolicies.find(
                    (p: any) =>
                        p.policyId === updatedOperation.policyId &&
                        p.uuid === updatedOperation.uuid,
                );

                if (existingPolicy) {
                    existingPolicy.parameters = { ...updatedOperation.parameters };
                } else {
                    const uuid = uuidv4();
                    newApiLevelPolicies.push({
                        ...updatedOperation,
                        uuid,
                    });
                }
            } else {
                const flow = newApiLevelPolicies[currentFlow];
                const existingPolicy = flow.find(
                    (p: any) =>
                        p.policyId === updatedOperation.policyId &&
                        p.uuid === updatedOperation.uuid,
                );

                if (existingPolicy) {
                    existingPolicy.parameters = { ...updatedOperation.parameters };
                } else {
                    const uuid = uuidv4();
                    flow.push({
                        ...updatedOperation,
                        uuid,
                    });
                }
            }
            setApiLevelPolicies(newApiLevelPolicies);
        } else {
            operationInAction.forEach((op: any) => {
                if (isPolicyHubGateway && currentFlow === 'hub') {
                    const operationHubPolicies = op.operationHubPolicies || [];
                    const existingPolicy = operationHubPolicies.find(
                        (p: any) =>
                            p.policyId === updatedOperation.policyId &&
                            p.uuid === updatedOperation.uuid,
                    );

                    if (existingPolicy) {
                        existingPolicy.parameters = { ...updatedOperation.parameters };
                    } else {
                        op.operationHubPolicies = [
                            ...operationHubPolicies,
                            { ...updatedOperation, uuid: uuidv4() },
                        ];
                    }
                } else {
                    const flow = op.operationPolicies?.[currentFlow];
                    if (!flow) return;

                    const existingPolicy = flow.find(
                        (p: any) =>
                            p.policyId === updatedOperation.policyId &&
                            p.uuid === updatedOperation.uuid,
                    );

                    if (existingPolicy) {
                        existingPolicy.parameters = { ...updatedOperation.parameters };
                    } else {
                        flow.push({
                            ...updatedOperation,
                            uuid: uuidv4(),
                        });
                    }
                }
            });
            setApiOperations(newApiOperations);
        }
    }

    /**
     * To update all API Operations with the provided policy.
     * Note that this function does not perform an API object update, rather, just a state update.
     * @param {any} updatedOperation updated operation of API object
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault
     */
    const updateAllApiOperations = (updatedOperation: any, currentFlow: string) => {
        const newApiOperations: any = cloneDeep(apiOperations);

        // Add attached policy to the same flow of all the operations
        newApiOperations.forEach((operation: any) => {
            const uuid = uuidv4();
            if (isPolicyHubGateway && currentFlow === 'hub') {
                operation.operationHubPolicies = operation.operationHubPolicies || [];
                operation.operationHubPolicies.push({ ...updatedOperation, uuid });
            } else {
                operation.operationPolicies[currentFlow].push({ ...updatedOperation, uuid });
            }
        });

        // Finally update the state
        setApiOperations(newApiOperations);
    }

    const getOperationPolicies = (operation: any, currentFlow: string) => {
        if (isPolicyHubGateway && currentFlow === 'hub') {
            operation.operationHubPolicies = operation.operationHubPolicies || [];
            return operation.operationHubPolicies;
        }

        return operation.operationPolicies[currentFlow];
    };

    const removePolicyByUuid = (policyList: any[], uuid: string) => {
        const index = policyList.findIndex((policy: any) => policy.uuid === uuid);
        if (index !== -1) {
            policyList.splice(index, 1);
        }
    };

    const removePolicyById = (policyList: any[], policyId: string) => {
        const index = policyList.findIndex((policy: any) => policy.policyId === policyId);
        if (index !== -1) {
            policyList.splice(index, 1);
        }
    };

    const removeApiLevelPolicy = (uuid: string, currentFlow: string) => {
        const newApiLevelPolicies: any = cloneDeep(apiLevelPolicies);
        const policyList = isPolicyHubGateway && currentFlow === 'hub'
            ? newApiLevelPolicies
            : newApiLevelPolicies[currentFlow];
        removePolicyByUuid(policyList, uuid);
        setApiLevelPolicies(newApiLevelPolicies);
    };

    const removeSharedOperationPolicy = (operationInAction: any[], uuid: string, currentFlow: string) => {
        const referencePolicy = getOperationPolicies(operationInAction[0], currentFlow)
            .find((policy: any) => policy.uuid === uuid);

        if (!referencePolicy) {
            return;
        }

        operationInAction.forEach((operation: any) => {
            removePolicyById(getOperationPolicies(operation, currentFlow), referencePolicy.policyId);
        });
    };

    const removeSingleOperationPolicy = (operationInAction: any[], uuid: string, currentFlow: string) => {
        operationInAction.forEach((operation: any) => {
            removePolicyByUuid(getOperationPolicies(operation, currentFlow), uuid);
        });
    };

    /**
     * To delete one API Operation from the apiOperations object
     * Note that this function does not perform an API object update, rather, just a state update.
     * @param {string} uuid operation uuid
     * @param {string} target target that needs to be updated
     * @param {string} verb verb of the operation that neeeds to be updated
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault
     */
    const deleteApiOperation = (uuid: string, target: string, verb: string, currentFlow: string) => {

        if (selectedTab === apiLevelTab) {
            removeApiLevelPolicy(uuid, currentFlow);
        } else {
            const newApiOperations: any = cloneDeep(apiOperations);
            const operationInAction = newApiOperations.filter(
                (op: any) =>
                    api.type === 'WS'
                        ? op.target === target
                        : op.target === target && op.verb.toLowerCase() === verb.toLowerCase(),
            )
            // Find the location of the element using the following logic
            /*
            [{a:'1'},{a:'2'},{a:'1'}].map( i => i.a) will output ['1', '2', '1']
            [{a:'1'},{a:'2'},{a:'1'}].map( i => i.a).indexOf('2') will output the location of '2'
            */
            if (operationInAction.length > 1) {
                removeSharedOperationPolicy(operationInAction, uuid, currentFlow);
            } else {
                removeSingleOperationPolicy(operationInAction, uuid, currentFlow);
            }

            // Finally update the state
            setApiOperations(newApiOperations);
        }
    }

    /**
     * Function to rearrange the API Operation ordering
     * @param {string} oldIndex original index of the policy
     * @param {string} newIndex new index of the policy
     * @param {string} target target that needs to be updated
     * @param {string} verb verb of the operation that neeeds to be updated
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault
     */
    const rearrangeApiOperations = (
        oldIndex: number, newIndex: number, target: string, verb: string, currentFlow: string,
    ) => {
        if (selectedTab === apiLevelTab) {
            const newAPIPolicies: any = cloneDeep(apiLevelPolicies);
            if (isPolicyHubGateway && currentFlow === 'hub') {
                setApiLevelPolicies(arrayMove(newAPIPolicies, oldIndex, newIndex));
            } else {
                const policyArray = newAPIPolicies[currentFlow];
                newAPIPolicies[currentFlow] = arrayMove(policyArray, oldIndex, newIndex);
                setApiLevelPolicies(newAPIPolicies);
            }
        } else {
            const newApiOperations: any = cloneDeep(apiOperations);
            const operationInAction = newApiOperations.filter(
                (op: any) =>
                    api.type === 'WS'
                        ? op.target === target
                        : op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
            operationInAction.forEach((operation: any) => {
                if (isPolicyHubGateway && currentFlow === 'hub') {
                    operation.operationHubPolicies = arrayMove(
                        operation.operationHubPolicies || [],
                        oldIndex,
                        newIndex,
                    );
                } else {
                    const policyArray = operation.operationPolicies[currentFlow];
                    operation.operationPolicies[currentFlow] = arrayMove(policyArray, oldIndex, newIndex);
                }
                });
            setApiOperations(newApiOperations);
        }
    };

    const deletePolicyUuid = (operationPolicies: any) => {
        if (Array.isArray(operationPolicies)) {
            operationPolicies.forEach((policyItem: ApiPolicy) => {
                if (policyItem.uuid) {
                    delete policyItem.uuid;
                }
            });
            return;
        }

        for (const flow in operationPolicies) {
            if (Object.prototype.hasOwnProperty.call(operationPolicies, flow)) {
                const policyArray = operationPolicies[flow];
                policyArray.forEach((policyItem: ApiPolicy) => {
                    if (policyItem.uuid) {
                        // eslint-disable-next-line no-param-reassign
                        delete policyItem.uuid;
                    }
                });
            }
        }
    };

    /**
     * To update the API object with the attached policies on Save.
     */
    const saveApi = () => {
        setUpdating(true);
        const newApiOperations: any = cloneDeep(apiOperations);
        const newApiLevelPolicies: any = cloneDeep(apiLevelPolicies);

        deletePolicyUuid(newApiLevelPolicies);
        // Set operation policies to the API object
        newApiOperations.forEach((operation: any) => {
            if (isPolicyHubGateway) {
                deletePolicyUuid(operation.operationHubPolicies || []);
            } else if (operation.operationPolicies) {
                const { operationPolicies } = operation;
                deletePolicyUuid(operationPolicies);
            }
        });

        const updatedApiPayload: any = api.toJSON ? api.toJSON() : cloneDeep(api);

        updatedApiPayload.operations = newApiOperations;
        updatedApiPayload.gatewayVendor = api.gatewayVendor;
        updatedApiPayload.gatewayType = api.gatewayType;

        if (isPolicyHubGateway) {
            updatedApiPayload.apiHubPolicies = newApiLevelPolicies;
            updatedApiPayload.apiPolicies = initApiLevelPolicy;
        } else {
            updatedApiPayload.apiPolicies = newApiLevelPolicies;
        }

        const updatePromise = updateAPI(updatedApiPayload);
        updatePromise
            .catch((error: any) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error('Error occurred while updating the policies');
                }
            })
            .finally(() => {
                setUpdating(false);
            });
    };

    const handleTabChange = (tab: number) => {
        setSelectedTab(tab);
    };

    /**
     * To memoize the value passed into ApiOperationContextProvider
     */
    const providerValue = useMemo(
        () => ({
            apiOperations,
            apiLevelPolicies,
            updateApiOperations,
            updateAllApiOperations,
            deleteApiOperation,
            rearrangeApiOperations,
        }),
        [
            apiOperations,
            apiLevelPolicies,
            updateApiOperations,
            updateAllApiOperations,
            deleteApiOperation,
            rearrangeApiOperations,
        ],
    );

    if (!apiPolicies || !commonPolicies || !openAPISpec || updating) {
        return <Progress per={90} message='Loading Policies ...' />
    }

    const renderPolicyTabs = () => (
        <Tabs
            value={selectedTab}
            onChange={(event, tab) =>
                handleTabChange(tab)
            }
            indicatorColor='primary'
            textColor='primary'
            variant='fullWidth'
            aria-label='Policies local to API'
            className={classes.flowTabs}
        >
            <Tab
                label={
                    <span className={classes.flowTab}>
                        <FormattedMessage
                            id='Apis.Details.Policies.Policies.api.level.policies'
                            defaultMessage='API Level Policies'
                        />
                    </span>
                }
                id='api-level-policies-tab'
                aria-controls='api-level-policies-tabpanel'
            />
            <Tab
                label={
                    <span className={classes.flowTab}>
                        <FormattedMessage
                            id='Apis.Details.Policies.Policies.operation.level.policies'
                            defaultMessage='Operation Level Policies'
                        />
                    </span>
                }
                id='operation-level-policies-tab'
                aria-controls='operation-level-policies-tabpanel'
                disabled={api.type === 'GRAPHQL'}
            />
        </Tabs>
    );

    const renderPolicyPanels = () => (
        <>
            <PolicyPanel
                index={apiLevelTab}
                selectedTab={selectedTab}
                openAPISpec={openAPISpec}
                isChoreoConnectEnabled={isChoreoConnectEnabled}
                isAPILevelTabSelected
                allPolicies={allPolicies}
                policyList={policies}
                api={localAPI}
                expandedResource={expandedResource}
                setExpandedResource={setExpandedResource}
            />
            {api.type !== 'GRAPHQL' && (
                <PolicyPanel
                    index={operationLevelTab}
                    selectedTab={selectedTab}
                    openAPISpec={openAPISpec}
                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                    isAPILevelTabSelected={false}
                    allPolicies={allPolicies}
                    policyList={policies}
                    api={localAPI}
                    expandedResource={expandedResource}
                    setExpandedResource={setExpandedResource}
                />
            )}
        </>
    );

    return (
        <StyledApiOperationContextProvider value={providerValue}>
            <DndProvider backend={HTML5Backend} context={window}>
                <Box mb={4}>
                    <Typography id='itest-api-details-resources-head' variant='h4' component='h2' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Policies.Policies.title'
                            defaultMessage='Policies'
                        />
                    </Typography>
                </Box>
                {/* {(api.type === 'HTTP') && (
                    <Box mb={4} px={1}>
                        <GatewaySelector
                            setIsChangedToCCGatewayType={setIsChangedToCCGatewayType}
                            isChoreoConnectEnabled={isChoreoConnectEnabled}
                            removeAPIPoliciesForGatewayChange={removeAPIPoliciesForGatewayChange}
                        />
                    </Box>
                )} */}
                <Box display='flex' flexDirection='row'>
                    <Box width='65%' p={1} className={classes.operationListingBox}>
                        <Paper className={classes.paper}>
                            <Box p={1}>
                                {renderPolicyTabs()}
                                <Box pt={1} overflow='scroll'>
                                    {renderPolicyPanels()}
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                    <Box width='35%' p={1}>
                        <PolicyList
                            apiPolicyList={apiPolicies}
                            commonPolicyList={commonPolicies}
                            fetchPolicies={fetchPolicies}
                            isChoreoConnectEnabled={isChoreoConnectEnabled}
                            isPolicyHubGateway={isPolicyHubGateway}
                            gatewayType={gateway}
                            apiType={api.type}
                            apiSubType={api.subtypeConfiguration?.subtype}
                        />
                    </Box>
                </Box>
            </DndProvider>
            <SaveOperationPolicies
                saveApi={saveApi}
                updating={updating}
            />
        </StyledApiOperationContextProvider>
    );
};

export default Policies;
