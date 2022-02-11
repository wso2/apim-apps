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
import React, { useState, useEffect, useMemo, } from 'react';
import cloneDeep from 'lodash.clonedeep';
import Paper from '@material-ui/core/Paper';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Box from '@material-ui/core/Box';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd';
import { FormattedMessage } from 'react-intl';
import CONSTS from 'AppData/Constants';
import { isRestricted } from 'AppData/AuthManager';
import { mapAPIOperations } from 'AppComponents/Apis/Details/Resources/operationUtils';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import OperationPolicy from './OperationPolicy';
import OperationsGroup from './OperationsGroup';
import PolicyList from './PolicyList';
import type { Policy } from './Types';
import GatewaySelector from './GatewaySelector';
import { ApiOperationContextProvider } from './ApiOperationContext';

const useStyles = makeStyles(() => ({
    head: {
        fontWeight: 200,
    },
    gridItem: {
        display: 'flex',
        width: '100%',
    },
    operationListingBox: {
        overflowY: 'scroll',
    },
}));

interface IProps {
    disableUpdate: any;
}

/**
 * Renders the policy management page.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy management page to render.
 */
const Policies: React.FC<IProps> = ({ disableUpdate }) => {
    const classes = useStyles();
    const [api, updateAPI] = useAPI();
    const [updating, setUpdating] = useState(false);
    const [policies, setPolicies] = useState<Policy[] | null>(null);
    const [expandedResource, setExpandedResource] = useState(false);
    const [commonPolicyIdList, setCommonPolicyIdList] = useState<string[] | undefined>([]);
    // This is what we use to set to the api object ()
    const [apiOperations, setApiOperations] = useState<any>(cloneDeep(api.operations));
    const [openAPISpec, setOpenAPISpec] = useState<any>(null);

    const fetchPolicies = () => {
        const apiPoliciesPromise = API.getOperationPolicies(api.id);
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([apiPoliciesPromise, commonPoliciesPromise]).then((response) => {
            const [apiPoliciesResponse, commonPoliciesResponse] = response;
            const apiSpecificPolicies = apiPoliciesResponse.body.list;
            const commonPolicies = commonPoliciesResponse.body.list;

            // Returns the union of policies depending on the policy display name
            const mergedList = [...apiSpecificPolicies, ...commonPolicies];
            const unionByPolicyDisplayName = [...mergedList
                .reduce((map, obj) => map.set(obj.displayName, obj), new Map()).values()];
            setPolicies(unionByPolicyDisplayName);

            // Maintain the common policy ID list to identify which policies are not API specific
            setCommonPolicyIdList(commonPolicies.map((policy: Policy) => policy.id));
        }).catch((error) => {
            console.log(error);
            Alert.error('Error occurred while retrieving the policy list');
        });
    }

    useEffect(() => {
        fetchPolicies();
    }, [])

    useEffect(() => {
        // Update the Swagger spec object when API object gets changed
        api.getSwagger()
            .then((response: any) => {
                setOpenAPISpec(response.body);
            })
            .catch((error: any) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                }
                console.error(error);
            });
    }, [api.id]);

    const localAPI = useMemo(
        () => ({
            id: api.id,
            operations: api.isAPIProduct() ? {} : mapAPIOperations(api.operations),
        }),
        [api],
    );

    const updateApiOperations = (updatedOperation: any, target: string, verb: string,
        currentFlow: string) => {
        setUpdating(true);
        const newApiOperations: any = cloneDeep(apiOperations);
        const operationInAction = newApiOperations.find((op: any) =>
            op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
        const operationFlowPolicy =
            operationInAction.operationPolicies[currentFlow].find((p: any) => p.policyId === updatedOperation.policyId);

        // If operationFlowPolicy is not found. We can add it.
        // or else we can update the parameters.
        if (operationFlowPolicy) {
            operationFlowPolicy.parameters = { ...updatedOperation.parameters };
        } else {
            operationInAction.operationPolicies[currentFlow].push(updatedOperation);
        }
        const updatePromise = updateAPI({ operations: newApiOperations});
        updatePromise
            .finally(() => {
                setUpdating(false);
            });
        // Finally update the state
        setApiOperations(newApiOperations);
    }

    if (!policies || !openAPISpec || updating) {
        return <Progress />
    }

    return (
        <ApiOperationContextProvider value={{ apiOperations, updateApiOperations }}>
            <DndProvider backend={HTML5Backend}>
                <Box mb={4}>
                    <Typography id='itest-api-details-resources-head' variant='h4' component='h2' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Policies.title'
                            defaultMessage='Policies'
                        />
                    </Typography>
                </Box>
                <Box mb={4}>
                    <GatewaySelector />
                </Box>
                <Box display='flex' flexDirection='row'>
                    <Box width='65%' pr={1} height='85vh' className={classes.operationListingBox}>
                        <Paper>
                            {Object.entries(openAPISpec.paths).map(([target, verbObject]: [string, any]) => (
                                <Grid key={target} item xs={12}>
                                    <OperationsGroup openAPI={openAPISpec} tag={target}>
                                        <Grid
                                            container
                                            direction='column'
                                            justify='flex-start'
                                            spacing={1}
                                            alignItems='stretch'
                                        >
                                            {Object.entries(verbObject).map(([verb, operation]) => {
                                                return CONSTS.HTTP_METHODS.includes(verb) ? (
                                                    <Grid key={`${target}/${verb}`} item className={classes.gridItem}>
                                                        <OperationPolicy
                                                            target={target}
                                                            verb={verb}
                                                            highlight
                                                            operation={operation}
                                                            api={localAPI}
                                                            disableUpdate={
                                                                disableUpdate || isRestricted(['apim:api_create'], api)
                                                            }
                                                            expandedResource={expandedResource}
                                                            setExpandedResource={setExpandedResource}
                                                            policyList={policies}
                                                        />
                                                    </Grid>
                                                ) : null;
                                            })}
                                        </Grid>
                                        {/* <Grid
                                        style={{ marginTop: '25px' }}
                                        container
                                        direction='row'
                                        justify='space-between'
                                        alignItems='center'
                                    >
                                        <Grid item>
                                            <SaveOperations
                                                operationsDispatcher={operationsDispatcher}
                                                updateOpenAPI={updateOpenAPI}
                                                // api={api}
                                            />
                                        </Grid>
                                    </Grid> */}
                                    </OperationsGroup>
                                </Grid>
                            ))}
                        </Paper>
                    </Box>
                    <Box width='35%' pl={1}>
                        {commonPolicyIdList && (
                            <PolicyList
                                policyList={policies}
                                commonPolicyIdList={commonPolicyIdList}
                                fetchPolicies={fetchPolicies}
                            />
                        )}
                    </Box>
                </Box>
            </DndProvider>
        </ApiOperationContextProvider>
    );
};

export default Policies;
