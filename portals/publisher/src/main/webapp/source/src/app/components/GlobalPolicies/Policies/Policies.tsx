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

import { makeStyles, Typography } from '@material-ui/core';
import Alert from 'AppComponents/Shared/Alert';
import React, { useState, useEffect, useMemo } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import PolicyList from './PolicyList';
import type { Policy, PolicySpec, ApiLevelPolicy } from './Types';
import GatewaySelector from './GatewaySelector';
import { ApiOperationContextProvider } from './ApiOperationContext';
import PolicyPanel from './components/PolicyPanel';

const Configurations = require('Config');

const useStyles = makeStyles(() => ({
    gridItem: {
        display: 'flex',
        width: '100%',
    },
    operationListingBox: {
        overflowY: 'scroll',
    },
    paper: {
        padding: '2px',
    },
    ccTypography: {
        paddingLeft: '10px',
        marginTop: '20px',
    },
    flowTabs: {
        '& button': {
            minWidth: 50,
        },
    },
    flowTab: {
        fontSize: 'smaller',
    },
}));

/**
 * Renders the policy management page.
 * @returns {TSX} Policy management page to render.
 */
const Policies: React.FC = () => {
    const classes = useStyles();
    // const [updating, setUpdating] = useState(false);
    const [policies, setPolicies] = useState<Policy[] | null>(null);
    const [allPolicies, setAllPolicies] = useState<PolicySpec[] | null>(null);
    const [isChoreoConnectEnabled, setIsChoreoConnectEnabled] = useState(false);
    const { showMultiVersionPolicies } = Configurations.apis;

    //

    // If Choreo Connect radio button is selected in GatewaySelector, it will pass 
    // value as true to render other UI changes specific to the Choreo Connect.
    const setIsChangedToCCGatewayType = (isCCEnabled: boolean) => {
        setIsChoreoConnectEnabled(isCCEnabled);
    }

    const initApiLevelPolicy: ApiLevelPolicy = {
        request: [],
        response: [],
        fault: [],
    }

    const [apiLevelPolicies, setApiLevelPolicies] = useState<any>(initApiLevelPolicy);

    useEffect(() => {
        // const currentAPIPolicies = getPolicies();
        const currentAPIPolicies = [''];
        setApiLevelPolicies(currentAPIPolicies);
    }, []);

    /**
     * Fetches all common policies & API specific policies.
     * Sets the allPolicies state: this allPolicies state is used to get policies from any given policy ID.
     * Sets the policies state: policy state is used to display the available policies that are draggable.
     */
    const fetchPolicies = () => {
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([commonPoliciesPromise]).then((response) => {
            const [commonPoliciesResponse] = response;
            const commonPolicies = commonPoliciesResponse.body.list;
            const mergedList = [...commonPolicies];

            // Get all common policies and API specific policies
            setAllPolicies(mergedList);

            let unionByPolicyDisplayName;
            if (showMultiVersionPolicies) {
                // Get the union of policies depending on the policy display name and version
                unionByPolicyDisplayName = [...mergedList
                    .reduce((map, obj) => map.set(obj.name + obj.version, obj), new Map()).values()];
            } else {
                // Get the union of policies depending on the policy display name
                unionByPolicyDisplayName = [...mergedList
                    .reduce((map, obj) => map.set(obj.name, obj), new Map()).values()];
            }
            unionByPolicyDisplayName.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))
            
            let filteredByGatewayTypeList = null;
            if (!isChoreoConnectEnabled) {
                // Get synpase gateway supported policies
                filteredByGatewayTypeList = unionByPolicyDisplayName.filter(
                    (policy: Policy) => policy.supportedGateways.includes('Synapse'));
            } else {
                // Get CC gateway supported policies
                filteredByGatewayTypeList = unionByPolicyDisplayName.filter(
                    (policy: Policy) => policy.supportedGateways.includes('ChoreoConnect'));
            }

            setPolicies(filteredByGatewayTypeList);

        }).catch((error) => {
            console.error(error);
            Alert.error('Error occurred while retrieving the policy list');
        });
    }

    const removeAPIPoliciesForGatewayChange = () => {
        setApiLevelPolicies(initApiLevelPolicy);
    }

    useEffect(() => {
        fetchPolicies();
    }, [isChoreoConnectEnabled]); 

    /**
     * To memoize the value passed into ApiOperationContextProvider
     */
    const providerValue = useMemo(
        () => ({apiLevelPolicies}),[apiLevelPolicies],);

    if (!policies) {
        return <Progress per={90} message='Loading Policies ...' />
    }

    return (
        <ApiOperationContextProvider value={providerValue}>
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
                <Box display='flex' flexDirection='row'>
                    <Box width='65%' p={1} height='115vh' className={classes.operationListingBox}>
                        <Paper className={classes.paper}>
                            <Box p={1}>
                                <Box pt={1} overflow='scroll'>
                                    <PolicyPanel
                                        isChoreoConnectEnabled={isChoreoConnectEnabled}
                                        allPolicies={allPolicies}
                                        policyList={policies}
                                    />
                                </Box>
                            </Box>
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
            </DndProvider>
        </ApiOperationContextProvider>
    );
};

export default Policies;
