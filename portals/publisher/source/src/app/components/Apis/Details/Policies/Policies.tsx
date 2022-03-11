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

import {
    Grid, makeStyles, Typography,
} from '@material-ui/core';
import Alert from 'AppComponents/Shared/Alert';
import React, { useState, useEffect, useMemo } from 'react';
import cloneDeep from 'lodash.clonedeep';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd';
import { FormattedMessage } from 'react-intl';
import CONSTS from 'AppData/Constants';
import { isRestricted } from 'AppData/AuthManager';
import { mapAPIOperations } from 'AppComponents/Apis/Details/Resources/operationUtils';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { arrayMove } from '@dnd-kit/sortable';
import OperationPolicy from './OperationPolicy';
import OperationsGroup from './OperationsGroup';
import PolicyList from './PolicyList';
import type { ApiPolicy, Policy, PolicySpec } from './Types';
import GatewaySelector from './GatewaySelector';
import { ApiOperationContextProvider } from './ApiOperationContext';
import { uuidv4 } from './Utils';
import SaveOperationPolicies from './SaveOperationPolicies';
import PoliciesExpansion from './PoliciesExpansion';

const useStyles = makeStyles(() => ({
    gridItem: {
        display: 'flex',
        width: '100%',
    },
    operationListingBox: {
        overflowY: 'scroll',
    },
    paper: {
        padding:'2px'
    },
    ccTypography: {
        paddingLeft:'10px', 
        marginTop:'20px'
    }
}));

/**
 * Renders the policy management page.
 * @returns {TSX} Policy management page to render.
 */
const Policies: React.FC = () => {
    const classes = useStyles();
    const [api, updateAPI] = useAPI();
    const [updating, setUpdating] = useState(false);
    const [policies, setPolicies] = useState<Policy[] | null>(null);
    const [allPolicies, setAllPolicies] = useState<PolicySpec[] | null>(null);
    const [expandedResource, setExpandedResource] = useState<string | null>(null);
    const [isChoreoConnectEnabled, setIsChoreoConnectEnabled] = useState(api.gatewayType === 'wso2/choreo-connect');

    // If Choreo Connect radio button is selected in GatewaySelector, it will pass 
    // value as true to render other UI changes specific to the Choreo Connect.
    const setIsChangedToCCGatewayType = (isCCEnabled: boolean) => {
        setIsChoreoConnectEnabled(isCCEnabled);
    }

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
            if (operation.operationPolicies) {
                const { operationPolicies } = operation;

                // Iterating through the policy list of request flow, response flow and fault flow
                for (const flow in operationPolicies) {
                    if (Object.prototype.hasOwnProperty.call(operationPolicies, flow)) {
                        const policyArray = operationPolicies[flow];
                        policyArray.forEach((policyItem: ApiPolicy) => {
                            // eslint-disable-next-line no-param-reassign
                            policyItem.uuid = uuidv4();
                        });
                    }
                }
            }
        });
        return clonedOperations;
    }

    const [apiOperations, setApiOperations] = useState<any>(getInitState);
    const [openAPISpec, setOpenAPISpec] = useState<any>(null);

    useEffect(() => {
        const currentOperations = getInitState();
        setApiOperations(currentOperations);
    }, [api]);

    /**
     * Fetches all common policies & API specific policies.
     * Sets the allPolicies state: this allPolicies state is used to get policies from any given policy ID.
     * Sets the policies state: policy state is used to display the available policies that are draggable.
     */
    const fetchPolicies = () => {
        const apiPoliciesPromise = API.getOperationPolicies(api.id);
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([apiPoliciesPromise, commonPoliciesPromise]).then((response) => {
            const [apiPoliciesResponse, commonPoliciesResponse] = response;
            const apiSpecificPolicies = apiPoliciesResponse.body.list;
            const commonPolicies = commonPoliciesResponse.body.list;
            const mergedList = [...commonPolicies, ...apiSpecificPolicies];

            // Get all common policies and API specific policies
            setAllPolicies(mergedList);

            // Get the union of policies depending on the policy display name
            const unionByPolicyDisplayName = [...mergedList
                .reduce((map, obj) => map.set(obj.name, obj), new Map()).values()];
            unionByPolicyDisplayName.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))
            
            let filteredList = null;
            if (!isChoreoConnectEnabled) {
                // Get synpase gateway supported policies
                filteredList = unionByPolicyDisplayName.filter(
                    (policy: Policy) => policy.supportedGateways.includes('Synapse'));
            } else {
                // Get CC gateway supported policies
                filteredList = unionByPolicyDisplayName.filter(
                    (policy: Policy) => policy.supportedGateways.includes('ChoreoConnect'));
            }

            setPolicies(filteredList);

        }).catch((error) => {
            console.error(error);
            Alert.error('Error occurred while retrieving the policy list');
        });
    }

    const removeAPIPoliciesForGatewayChange = () => {
        const newApiOperations: any = cloneDeep(apiOperations);
        // Set operation policies to the API object
        newApiOperations.forEach((operation: any) => {
            if (operation.operationPolicies) {
                const { operationPolicies } = operation;

                // Iterating through the policy list of request flow, response flow and fault flow
                for (const flow in operationPolicies) {
                    if (Object.prototype.hasOwnProperty.call(operationPolicies, flow)) {

                        operationPolicies[flow] = [];

                    }
                }
            }
        });
        setApiOperations(newApiOperations);
    }

    useEffect(() => {
        fetchPolicies();
    }, [isChoreoConnectEnabled])

    useEffect(() => {
        // Update the Swagger spec object when API object gets changed
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
    }, [api.id]);

    const localAPI = useMemo(
        () => ({
            id: api.id,
            operations: api.isAPIProduct() ? {} : mapAPIOperations(api.operations),
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
        let operationInAction = null;
        const newApiOperations: any = cloneDeep(apiOperations);
        if (isChoreoConnectEnabled) {
            operationInAction = newApiOperations.find((op: any) => op.target === target);
        } else {
            operationInAction = newApiOperations.find((op: any) =>
                op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
        }
        const operationFlowPolicy =
            operationInAction.operationPolicies[currentFlow].find((p: any) => (p.policyId === updatedOperation.policyId
                && p.uuid === updatedOperation.uuid));

        if (operationFlowPolicy) {
            // Edit operation policy
            operationFlowPolicy.parameters = { ...updatedOperation.parameters };
        } else {
            // Add new operation policy
            const uuid = uuidv4();
            operationInAction.operationPolicies[currentFlow].push({ ...updatedOperation, uuid });
        }

        // Finally update the state
        setApiOperations(newApiOperations);
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
            operation.operationPolicies[currentFlow].push({ ...updatedOperation, uuid });
        });

        // Finally update the state
        setApiOperations(newApiOperations);
    }

    /**
     * To delete one API Operation from the apiOperations object
     * Note that this function does not perform an API object update, rather, just a state update.
     * @param {string} uuid operation uuid
     * @param {string} target target that needs to be updated
     * @param {string} verb verb of the operation that neeeds to be updated
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault
     */
    const deleteApiOperation = (uuid: string, target: string, verb: string, currentFlow: string) => {
        const newApiOperations: any = cloneDeep(apiOperations);
        const operationInAction = newApiOperations.find((op: any) =>
            op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
        // Find the location of the element using the following logic
        /*
        [{a:'1'},{a:'2'},{a:'1'}].map( i => i.a) will output ['1', '2', '1']
        [{a:'1'},{a:'2'},{a:'1'}].map( i => i.a).indexOf('2') will output the location of '2'
        */
        const index = operationInAction.operationPolicies[currentFlow].map((p: any) => p.uuid).indexOf(uuid);
        // delete the element
        operationInAction.operationPolicies[currentFlow].splice(index, 1);

        // Finally update the state
        setApiOperations(newApiOperations);
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
        const newApiOperations: any = cloneDeep(apiOperations);
        let operationInAction = null;

        if (!isChoreoConnectEnabled) {
            operationInAction = newApiOperations.find((op: any) =>
                op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
        } else {
            operationInAction = newApiOperations.find((op: any) => op.target === target);
        }
        const policyArray = operationInAction.operationPolicies[currentFlow];
        operationInAction.operationPolicies[currentFlow] = arrayMove(policyArray, oldIndex, newIndex);
        
        // Finally update the state
        setApiOperations(newApiOperations);
    }

    /**
     * To update the API object with the attached policies on Save.
     */
    const saveApi = () => {
        setUpdating(true);
        const newApiOperations: any = cloneDeep(apiOperations);
        let getewayTypeForPolicies = "wso2/synapse";
        const getewayVendorForPolicies = "wso2";

        // Set operation policies to the API object
        newApiOperations.forEach((operation: any) => {
            if (operation.operationPolicies) {
                const { operationPolicies } = operation;

                // Iterating through the policy list of request flow, response flow and fault flow
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
            }
        });

        // Handles normal policy savings for choreo connect gateway type.
        if(isChoreoConnectEnabled) {
            getewayTypeForPolicies = "wso2/choreo-connect";
        }

        const updatePromise = updateAPI({ 
            operations: newApiOperations, 
            gatewayVendor: getewayVendorForPolicies, 
            gatewayType: getewayTypeForPolicies});
        updatePromise
            .finally(() => {
                setUpdating(false);
            });
    }

    if (!policies || !openAPISpec || updating) {
        return <Progress per={90} message='Loading Policies ...' />
    }

    return (
        <ApiOperationContextProvider
            value={{
                apiOperations,
                updateApiOperations,
                updateAllApiOperations,
                deleteApiOperation,
                rearrangeApiOperations,
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <Box mb={4}>
                    <Typography id='itest-api-details-resources-head' variant='h4' component='h2' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Policies.Policies.title'
                            defaultMessage='Policies'
                        />
                    </Typography>
                </Box>
                <Box mb={4} px={1}>
                    <GatewaySelector
                        setIsChangedToCCGatewayType={setIsChangedToCCGatewayType}
                        isChoreoConnectEnabled={isChoreoConnectEnabled}
                        removeAPIPoliciesForGatewayChange={removeAPIPoliciesForGatewayChange}
                    />
                </Box>
                {isChoreoConnectEnabled ?
                    <Box display='flex' flexDirection='row'>
                        <Box width='65%' pr={1} height='85vh' className={classes.operationListingBox}>
                            <Paper className={classes.paper}>
                                <Typography
                                    id='cc-specific-message'
                                    variant='h6'
                                    component='h2'
                                    gutterBottom
                                    className={classes.ccTypography}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Policies.Policies.cc.info.title'
                                        defaultMessage={
                                            'Choreo Connect supports resource level ' +
                                            'request and response flow policies only.'
                                        }
                                    />
                                </Typography>
                                {Object.entries(openAPISpec.paths).map(([target, verbObject]: [string, any]) => (
                                    <Grid key={target} item xs={12}>
                                        <OperationsGroup
                                            openAPI={openAPISpec}
                                            tag={target}
                                            isChoreoConnectEnabled={isChoreoConnectEnabled}
                                            verbObject={verbObject}
                                        >
                                            <Grid
                                                container
                                                direction='column'
                                                justify='flex-start'
                                                spacing={1}
                                                alignItems='stretch'
                                            >
                                                <PoliciesExpansion
                                                    target={target}
                                                    verb='get'
                                                    allPolicies={allPolicies}
                                                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                                                    policyList={policies}
                                                />
                                            </Grid>
                                        </OperationsGroup>
                                    </Grid>
                                ))}
                            </Paper>
                        </Box>
                        <Box width='35%' pl={1}>
                            <PolicyList
                                policyList={policies}
                                fetchPolicies={fetchPolicies}
                                isChoreoConnectEnabled={isChoreoConnectEnabled}
                            />
                        </Box>
                    </Box>
                    :
                    <Box display='flex' flexDirection='row'>
                        <Box width='65%' p={1} height='115vh' className={classes.operationListingBox}>
                            <Paper className={classes.paper}>
                                {Object.entries(openAPISpec.paths).map(([target, verbObject]: [string, any]) => (

                                    <Grid key={target} item xs={12}>
                                        <OperationsGroup
                                            openAPI={openAPISpec}
                                            tag={target}
                                            isChoreoConnectEnabled={isChoreoConnectEnabled}
                                            verbObject={null}
                                        >
                                            <Grid
                                                container
                                                direction='column'
                                                justify='flex-start'
                                                spacing={1}
                                                alignItems='stretch'
                                            >
                                                {Object.entries(verbObject).map(([verb, operation]) => {
                                                    return CONSTS.HTTP_METHODS.includes(verb) ? (
                                                        <Grid
                                                            key={`${target}/${verb}`}
                                                            item className={classes.gridItem}
                                                        >
                                                            <OperationPolicy
                                                                target={target}
                                                                verb={verb}
                                                                highlight
                                                                operation={operation}
                                                                api={localAPI}
                                                                disableUpdate={isRestricted(['apim:api_create'], api)}
                                                                expandedResource={expandedResource}
                                                                setExpandedResource={setExpandedResource}
                                                                policyList={policies}
                                                                allPolicies={allPolicies}
                                                                isChoreoConnectEnabled={isChoreoConnectEnabled}
                                                            />
                                                        </Grid>
                                                    ) : null;
                                                })}
                                            </Grid>
                                        </OperationsGroup>
                                    </Grid>
                                ))}
                            </Paper>
                        </Box>
                        <Box width='35%' p={1}>
                            <PolicyList
                                policyList={policies}
                                fetchPolicies={fetchPolicies}
                                isChoreoConnectEnabled={isChoreoConnectEnabled}
                            />
                        </Box>
                    </Box>
                }
            </DndProvider>
            <SaveOperationPolicies
                saveApi={saveApi}
                updating={updating}
            />
        </ApiOperationContextProvider>
    );
};

export default Policies;
