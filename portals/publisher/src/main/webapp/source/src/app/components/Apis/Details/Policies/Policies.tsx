/*
 * Copyright (c) 2022-2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { FormattedMessage } from 'react-intl';
import cloneDeep from 'lodash.clonedeep';
import { arrayMove } from '@dnd-kit/sortable';

import Alert from 'AppComponents/Shared/Alert';
import { Progress } from 'AppComponents/Shared';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { mapAPIOperations } from 'AppComponents/Apis/Details/Resources/operationUtils';
import API from 'AppData/api';
import type { ApiPolicy, Policy, PolicySpec, ApiLevelPolicy } from './Types';
import { ApiOperationContextProvider } from './ApiOperationContext';
import { uuidv4 } from './Utils';
import PolicyList from './PolicyList';
import PolicyPanel from './components/PolicyPanel';
import SaveOperationPolicies from './SaveOperationPolicies';

const PREFIX = 'Policies';

const classes = {
    gridItem: `${PREFIX}-gridItem`,
    operationListingBox: `${PREFIX}-operationListingBox`,
    paper: `${PREFIX}-paper`,
    ccTypography: `${PREFIX}-ccTypography`,
    flowTabs: `${PREFIX}-flowTabs`,
    flowTab: `${PREFIX}-flowTab`,
};

const StyledApiOperationContextProvider = styled(ApiOperationContextProvider)(() => ({
    [`& .${classes.gridItem}`]: { display: 'flex', width: '100%' },
    [`& .${classes.operationListingBox}`]: { overflowY: 'scroll' },
    [`& .${classes.paper}`]: { padding: '2px' },
    [`& .${classes.ccTypography}`]: { paddingLeft: '10px', marginTop: '20px' },
    [`& .${classes.flowTabs}`]: {
        '& button': { minWidth: 50 },
    },
    [`& .${classes.flowTab}`]: { fontSize: 'smaller' },
}));

const Configurations = require('Config');

/**
 * Policy management page.
 */
const Policies: React.FC = () => {
    const [api, updateAPI] = useAPI();

    // ✅ Read-only if API is a revision or published
    const isReadOnly =
        api?.isRevision ||
        api?.workflowStatus === 'PUBLISHED' ||
        api?.lifeCycleStatus === 'PUBLISHED';

    const [updating, setUpdating] = useState(false);
    const [apiPolicies, setApiPolicies] = useState<Policy[] | null>(null);
    const [commonPolicies, setCommonPolicies] = useState<Policy[] | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [allPolicies, setAllPolicies] = useState<PolicySpec[] | null>(null);
    const [expandedResource, setExpandedResource] = useState<string | null>(null);
    const [isChoreoConnectEnabled, setIsChoreoConnectEnabled] = useState(api.gatewayType !== 'wso2/synapse');
    const [selectedTab, setSelectedTab] = useState(api.type === 'GRAPHQL' || api.apiPolicies != null ? 0 : 1);
    const [gateway, setGateway] = useState<string>('');

    const { showMultiVersionPolicies } = Configurations.apis;

    const apiLevelTab = 0;
    const operationLevelTab = 1;

    const initApiLevelPolicy: ApiLevelPolicy = { request: [], response: [], fault: [] };

    const getInitPolicyState = (policyList: any) => {
        for (const flow in policyList) {
            if (Object.prototype.hasOwnProperty.call(policyList, flow)) {
                policyList[flow].forEach((policyItem: ApiPolicy) => {
                    policyItem.uuid = uuidv4();
                });
            }
        }
    };

    const getInitState = () => {
        const clonedOperations = cloneDeep(api.operations);
        clonedOperations.forEach((operation: any) => {
            if (operation.operationPolicies) getInitPolicyState(operation.operationPolicies);
        });
        return clonedOperations;
    };

    const getInitAPILevelPoliciesState = () => {
        const clonedAPIPolicies = cloneDeep(api.apiPolicies);
        if (api.apiPolicies != null) getInitPolicyState(clonedAPIPolicies);
        return clonedAPIPolicies || initApiLevelPolicy;
    };

    const [apiOperations, setApiOperations] = useState<any>(getInitState);
    const [apiLevelPolicies, setApiLevelPolicies] = useState<any>(getInitAPILevelPoliciesState);
    const [openAPISpec, setOpenAPISpec] = useState<any>(null);

    useEffect(() => {
        setApiOperations(getInitState());
        setApiLevelPolicies(getInitAPILevelPoliciesState());
    }, [api]);

    /**
     * Fetch all common and API-specific policies.
     */
    const fetchPolicies = () => {
        const apiPoliciesPromise = API.getOperationPolicies(api.id);
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([apiPoliciesPromise, commonPoliciesPromise])
            .then(([apiPoliciesResponse, commonPoliciesResponse]) => {
                const apiSpecificPoliciesList = apiPoliciesResponse.body.list;
                const commonPoliciesList = commonPoliciesResponse.body.list;
                const mergedList = [...commonPoliciesList, ...apiSpecificPoliciesList];
                setAllPolicies(mergedList);

                const mapByName = (list: Policy[]) =>
                    [
                        ...list.reduce(
                            (map: Map<string, Policy>, obj: Policy) =>
                                map.set(showMultiVersionPolicies ? obj.name + obj.version : obj.name, obj),
                            new Map(),
                        ).values(),
                    ].sort((a, b) => a.name.localeCompare(b.name));

                const apiPolicyByName = mapByName(apiSpecificPoliciesList);
                const commonPolicyByName = mapByName(commonPoliciesList);

                let gatewayType = 'Synapse';
                if (api.gatewayType === 'wso2/apk') gatewayType = 'ChoreoConnect';
                else if (api.gatewayType === 'AWS') gatewayType = 'AWS';
                else if (api.gatewayType === 'Azure') gatewayType = 'Azure';
                setGateway(gatewayType);

                const filterByGateway = (list: Policy[]) =>
                    list.filter((p) => p.supportedGateways.includes(gatewayType));

                const apiGatewayPolicies = filterByGateway(apiPolicyByName);
                const commonGatewayPolicies = filterByGateway(commonPolicyByName);

                const filterByAPIType = (list: Policy[]) =>
                    list.filter((p) =>
                        p.supportedApiTypes.some((item: any) => {
                            if (typeof item === 'string') return item === api.type;
                            if (typeof item === 'object')
                                return item.apiType === api.type && item.subType === api.subtypeConfiguration?.subtype;
                            return false;
                        }),
                    );

                const filteredApiPolicies = filterByAPIType(apiGatewayPolicies);
                const filteredCommonPolicies = filterByAPIType(commonGatewayPolicies);
                const combined = [...filteredCommonPolicies, ...filteredApiPolicies].sort((a, b) =>
                    a.name.localeCompare(b.name),
                );

                setApiPolicies(filteredApiPolicies);
                setCommonPolicies(filteredCommonPolicies);
                setPolicies(combined);
            })
            .catch((error) => {
                console.error(error);
                Alert.error('Error occurred while retrieving the policy list');
            });
    };

    useEffect(() => {
        fetchPolicies();
        if (isChoreoConnectEnabled) setSelectedTab(1);
    }, [isChoreoConnectEnabled]);

    useEffect(() => {
        if (api.type !== 'WS') {
            api.getSwagger()
                .then((response: any) => {
                    const retrievedSpec = response.body;
                    setOpenAPISpec(retrievedSpec);
                    const [target, verbObject]: [string, any] = Object.entries(retrievedSpec.paths)[0];
                    const verb = Object.keys(verbObject)[0];
                    setExpandedResource(verb + target);
                })
                .catch((error: any) => {
                    console.error(error);
                    if (error.response) Alert.error(error.response.body.description);
                });
        } else {
            api.getAsyncAPIDefinition(api.id)
                .then((response: any) => {
                    const retrievedSpec = response.body;
                    setOpenAPISpec(retrievedSpec);
                    const target = Object.keys(retrievedSpec.channels)[0];
                    setExpandedResource(target);
                })
                .catch((error: any) => {
                    console.error(error);
                    if (error.response) Alert.error(error.response.body.description);
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

    const providerValue = useMemo(
        () => ({
            apiOperations,
            apiLevelPolicies,
            updateApiOperations: () => {},
            updateAllApiOperations: () => {},
            deleteApiOperation: () => {},
            rearrangeApiOperations: () => {},
        }),
        [apiOperations, apiLevelPolicies],
    );

    if (!apiPolicies || !commonPolicies || !openAPISpec || updating) {
        return <Progress per={90} message="Loading Policies ..." />;
    }

    // ✅ Read-only Mode — disable UI
    if (isReadOnly) {
        return (
            <Box p={3}>
                <MuiAlert severity="info">
                    <FormattedMessage
                        id="Apis.Details.Policies.Policies.readonly"
                        defaultMessage="This API revision is read-only. Policy editing and attachment are disabled."
                    />
                </MuiAlert>
            </Box>
        );
    }

    const renderPolicyTabs = () => (
        <Tabs
            value={selectedTab}
            onChange={(e, tab) => setSelectedTab(tab)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="Policies local to API"
            className={classes.flowTabs}
        >
            <Tab
                label={
                    <span className={classes.flowTab}>
                        <FormattedMessage
                            id="Apis.Details.Policies.Policies.api.level.policies"
                            defaultMessage="API Level Policies"
                        />
                    </span>
                }
                id="api-level-policies-tab"
                aria-controls="api-level-policies-tabpanel"
            />
            <Tab
                label={
                    <span className={classes.flowTab}>
                        <FormattedMessage
                            id="Apis.Details.Policies.Policies.operation.level.policies"
                            defaultMessage="Operation Level Policies"
                        />
                    </span>
                }
                id="operation-level-policies-tab"
                aria-controls="operation-level-policies-tabpanel"
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
                    <Typography id="itest-api-details-resources-head" variant="h4" component="h2" gutterBottom>
                        <FormattedMessage id="Apis.Details.Policies.Policies.title" defaultMessage="Policies" />
                    </Typography>
                </Box>
                <Box display="flex" flexDirection="row">
                    <Box width="65%" p={1} className={classes.operationListingBox}>
                        <Paper className={classes.paper}>
                            <Box p={1}>
                                {renderPolicyTabs()}
                                <Box pt={1} overflow="scroll">
                                    {renderPolicyPanels()}
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                    <Box width="35%" p={1}>
                        <PolicyList
                            apiPolicyList={apiPolicies}
                            commonPolicyList={commonPolicies}
                            fetchPolicies={fetchPolicies}
                            isChoreoConnectEnabled={isChoreoConnectEnabled}
                            gatewayType={gateway}
                            apiType={api.type}
                        />
                    </Box>
                </Box>
            </DndProvider>
            <SaveOperationPolicies saveApi={() => {}} updating={updating} />
        </StyledApiOperationContextProvider>
    );
};

export default Policies;
