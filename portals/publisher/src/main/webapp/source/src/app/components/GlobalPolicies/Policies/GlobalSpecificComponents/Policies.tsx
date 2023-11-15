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

import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Alert from 'AppComponents/Shared/Alert';
import TextField from '@material-ui/core/TextField';
import React, { useState, useEffect, useMemo, FC } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Icon from '@material-ui/core/Icon';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { FormattedMessage } from 'react-intl';
import { arrayMove } from '@dnd-kit/sortable';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import cloneDeep from 'lodash.clonedeep';
import { useHistory, Link } from 'react-router-dom';
import PolicyList from './PolicyList';
import type { Policy, PolicySpec, GlobalLevelPolicy } from '../Types';
import { GlobalPolicyContextProvider } from '../GlobalPolicyContext';
import PolicyPanel from './PolicyPanel';
import { uuidv4 } from '../Utils';

const useStyles = makeStyles((theme) => ({
    textField: {
        backgroundColor: 'white', 
    },
    titleLink: {
        color: theme.palette.primary.dark,
        marginRight: theme.spacing(1),
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },
    operationListingBox: {
        display: 'flex',
        overflowY: 'scroll',
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

interface PolicyProps {
    isCreateNew: boolean;
    policyID: string | null;
}

/**
 * Renders the Global Policy management page.
 * @param {boolean} isCreateNew This value is true if form is for create new and false for edit.
 * @param {string} policyID This value is to indentify the policy (Null if creating a new one). 
 * @returns {TSX} Policy management page to render.
 */
const Policies: FC<PolicyProps> =  ({
    isCreateNew, 
    policyID
}) => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState<Policy[] | null>(null);
    const [allPolicies, setAllPolicies] = useState<PolicySpec[] | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [appliedGatewayLabels, setAppliedGatewayLabels] = useState<string[]>([]);

    // Global Level Policy - global level policy mapping. It will be initially empty.
    const initGlobalLevelPolicy: GlobalLevelPolicy = {
        request: [],
        response: [],
        fault: [],
    }
    const getInitGlobalLevelPoliciesState = () => {
        return initGlobalLevelPolicy;
    };
    const [globalLevelPolicies, 
        setGlobalLevelPolicies] = useState<GlobalLevelPolicy>(getInitGlobalLevelPoliciesState());

    /**
     * Fetches all common policies to front-end.
     * Sets the allPolicies state: this allPolicies state is used to get policies from any given policy ID.
     * Sets the policies state: policy state is used to display the available policies that are draggable.
     */
    const fetchPolicies = () => {
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([commonPoliciesPromise]).then((response) => {
            const [commonPoliciesResponse] = response;
            const commonPolicies = commonPoliciesResponse.body.list;
            setAllPolicies(commonPolicies);

            // Sort the policies list
            commonPolicies.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))
            
            setPolicies(commonPolicies);
        }).catch((/* error */) => {
            // console.error(error);
            Alert.error('Error occurred while retrieving the policy list');
        });
    }

    // PolicyID is to identify the policy. ex: AddHeader, RemoveHeader, etc.
    // But this same policy can be used multiple times with different names/values.
    // For the frontend, we need different ids for each similar policy to uniquely identify.
    const assignUUIDs = (input: any) => {
        const inputResponse: any = cloneDeep(input);
        if (inputResponse && inputResponse.policyMapping) {
            const { request, response, fault } = inputResponse.policyMapping;    
            if (request) {
                inputResponse.policyMapping.request = request.map((item: any) => ({
                    ...item,
                    uuid: uuidv4(),
                }));
            }
            if (response) {
                inputResponse.policyMapping.response = response.map((item: any) => ({
                    ...item,
                    uuid: uuidv4(),
                }));
            }
            if (fault) {
                inputResponse.policyMapping.fault = fault.map((item: any) => ({
                    ...item,
                    uuid: uuidv4(),
                }));
            }
        }  
        return inputResponse;
    };
      
    // remove uuids from the policy mapping
    const removeUUIDs = (input: any) => {
        const inputWithoutUUIDs: any = cloneDeep(input);
        if (inputWithoutUUIDs) {
            const { request, response, fault } = inputWithoutUUIDs;
            if (request) {
                inputWithoutUUIDs.request = request.map((item: any) => {
                    const { uuid, ...rest } = item;
                    return rest;
                });
            }
            if (response) {
                inputWithoutUUIDs.response = response.map((item: any) => {
                    const { uuid, ...rest } = item;
                    return rest;
                });
            }
            if (fault) {
                inputWithoutUUIDs.fault = fault.map((item: any) => {
                    const { uuid, ...rest } = item;
                    return rest;
                });
            }
        }
        return inputWithoutUUIDs;
    };

    const fetchGlobalPolicyByID = () => {
        // // hardcoded response
        console.log("fetching global policy mapping: 'GET' '/gateway-policies/" + {policyID});
        const promisedPolicy = Promise.resolve({
            id: policyID,
            policyMapping: {
                request: [
                    {
                        policyName: "addHeader",
                        policyVersion: "v1",
                        policyId: "f10ee49b-779b-4109-843c-884f9341df91",                     
                        parameters: {
                            headerName: 'a',
                            headerValue: 'a',   
                        }
                    }
                ],
                response: [],
                fault: []
            },
            description: "Set header value to the request with item type",
            displayName: "item_type_setter",
            appliedGatewayLabels: [
                "gatewayLabel_1"
            ]
        });
        // hardcoded response ends

        promisedPolicy
            .then((response) => {
                const responseUpdated = assignUUIDs(response);      
                setGlobalLevelPolicies(responseUpdated.policyMapping);
                setDescription(responseUpdated.description);
                setName(responseUpdated.displayName);
                setAppliedGatewayLabels(responseUpdated.appliedGatewayLabels);
            })
            .catch((/* error */) => {
                // console.error(error);
                Alert.error('Error occurred while retrieving the policy');
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchPolicies();
        if (!isCreateNew){
            fetchGlobalPolicyByID();
        }
    }, []); 

    /**
     * Triggers as we click delete icon in a drag`n`droped the policy.
     * @param {string} uuid operation uuid.
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault.
     */
    const deleteGlobalOperation = (uuid: string, currentFlow: string) => {
        const newGlobalLevelPolicies: any = cloneDeep(globalLevelPolicies);
        const index = newGlobalLevelPolicies[currentFlow].map((p: any) => p.uuid).indexOf(uuid);
        newGlobalLevelPolicies[currentFlow].splice(index, 1);
        setGlobalLevelPolicies(newGlobalLevelPolicies);
    }

    /**
     * Function to rearrange the API Operation ordering.
     * @param {string} oldIndex original index of the policy.
     * @param {string} newIndex new index of the policy.
     * @param {string} currentFlow depicts which flow needs to be udpated: request, response or fault.
     */
    const rearrangeGlobalOperations = (
        oldIndex: number, newIndex: number, currentFlow: string,
    ) => { 
        const newAPIPolicies: any = cloneDeep(globalLevelPolicies);
        const policyArray = newAPIPolicies[currentFlow];
        newAPIPolicies[currentFlow] = arrayMove(policyArray, oldIndex, newIndex);
        setGlobalLevelPolicies(newAPIPolicies);   
    };

    /**
     * Triggers as we saved a drag`n`droped policy.
     * @param {any} updatedOperation Saving info as 
     * parameters: {headerName: <>, headerValue: <>}, 
     * policyId: <>,
     * policyName: <>,
     * policyVersion: <>.
     * @param {string} currentFlow Folow request/response/fault.
     */
    const updateGlobalOperations = (
        updatedOperation: any, currentFlow: string,
    ) => {
        const newGlobalLevelPolicies: any = cloneDeep(globalLevelPolicies);
        const flowPolicy = (newGlobalLevelPolicies)[currentFlow].find(
            (p: any) =>
                p.policyId === updatedOperation.policyId &&
                p.uuid === updatedOperation.uuid,
        );
        
        if (flowPolicy) {
            // Edit policy
            flowPolicy.parameters = { ...updatedOperation.parameters };
        } else {
            // Add new policy
            const uuid = uuidv4();
            (newGlobalLevelPolicies)[currentFlow].push({ ...updatedOperation, uuid }
            );
        }
        setGlobalLevelPolicies(newGlobalLevelPolicies);   
    }

    /**
     * Function to validate before saving or updating.
     * @returns {boolean} true if all the required fields are filled.
     */
    const validate = () => {
        let isValidate = true;
        if (name === '') {
            Alert.error('Policy name cannot be empty');
            isValidate = false;
        }
        if (description === '') {
            Alert.error('Policy description cannot be empty');
            isValidate = false;
        }
        if ((!globalLevelPolicies.request || globalLevelPolicies.request.length === 0) &&
            (!globalLevelPolicies.response || globalLevelPolicies.response.length === 0) &&
            (!globalLevelPolicies.fault || globalLevelPolicies.fault.length === 0)) {
            Alert.error('Policy mapping cannot be empty');
            isValidate = false;
        }
        return isValidate;
    }

    /**
     * Function to save a policy mapping.
     */
    const save = () => {
        setLoading(true);

        if (validate()){
            // call the backend API
            const policyMapping = removeUUIDs(globalLevelPolicies);
            const requestBody = {
                "id": uuidv4(),
                "policyMapping": policyMapping,
                "description": description,
                "displayName": name,
                "appliedGatewayLabels": []
            };
            const promise = API.addGatewayPoliciesToFlows(requestBody);
            promise
                .then((response) => {
                    setLoading(false);
                    if (response.status === 200 || response.status === 201) {
                        Alert.success('Policy mapping added successfully');                    
                        history.goBack();
                    }
                    else {
                        Alert.error(response.body.message);
                    }                
                })
                .catch((/* error */) => {
                    // console.error(error);
                    Alert.error('Error occurred while adding the policy mapping');
                })
        }
    }

    /**
     * Function to update a policy mapping.
     */
    const update = () => {
        setLoading(true);

        if (validate()){
            // call the backend API
            const requestBody = {
                "id": policyID,
                "policyMapping": globalLevelPolicies,
                "description": description,
                "displayName": name,
                "appliedGatewayLabels": appliedGatewayLabels
            };
            // API.putGatewayPolicies();
            console.log("Update global policy mapping: 'PUT' '/gateway-policies/" + {policyID});
            console.log("request body", requestBody);

            setLoading(false);
            history.goBack();
        }
        setLoading(false);
    }

    /**
     * To memoize the value passed into GlobalPolicyContextProvider.
     */
    const providerValue = useMemo(
        () => ({
            globalLevelPolicies,
            updateGlobalOperations,
            deleteGlobalOperation,
            rearrangeGlobalOperations
        }),
        [
            globalLevelPolicies,
            updateGlobalOperations,
            deleteGlobalOperation,
            rearrangeGlobalOperations
        ],
    );

    const handleNameChange = (event: any) => {
        setName(event.target.value);
    };
    
    const handleDescriptionChange = (event: any) => {
        setDescription(event.target.value);
    };

    if (!policies || loading) {
        return <Progress per={90} message='Loading Policies ...' />
    }

    return (
        <GlobalPolicyContextProvider value={providerValue}>
            <Box mt={3} mb={3} ml={5} mr={5}>   
                <DndProvider backend={HTML5Backend}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link to='/global-policies' className={classes.titleLink}>
                                <Typography variant='h4' component='h1'>
                                    <FormattedMessage
                                        id='globalPolicies.heading'
                                        defaultMessage='Global Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h2'>
                                {isCreateNew ? 
                                    <FormattedMessage
                                        id='globalPolicies.create.create.heading'
                                        defaultMessage='Create A New Global Policy'
                                    />
                                    : 
                                    <FormattedMessage
                                        id='globalPolicies.create.edit.heading'
                                        defaultMessage='Edit Global Policy'
                                    />
                                }
                            </Typography>
                        </div>
                    </Grid>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            required
                            id='outlined-required'
                            label='Name'
                            variant='outlined'
                            value={name}
                            onChange={handleNameChange}
                            className={classes.textField}
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            required
                            id='outlined-multiline-static'
                            label='Description'
                            multiline
                            rows={3}
                            variant='outlined'
                            value={description}
                            onChange={handleDescriptionChange}
                            className={classes.textField}
                        />
                    </Box>  
                    <Box className={classes.operationListingBox}>  
                        <Paper className={classes.paper} style={{ flex: 1 }}>
                            <Card variant='outlined'>
                                <CardContent>
                                    <Box height='100vh'>
                                        <Box pt={1} overflow='scroll'>
                                            <PolicyPanel
                                                allPolicies={allPolicies}
                                                policyList={policies}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>                              
                        </Paper>
          
                        <PolicyList
                            policyList={policies}
                            fetchPolicies={fetchPolicies}
                        />                   
                    </Box>
                </DndProvider>
                <Box mt={2}>       
                    <Button
                        style={{ width: '200px' }}
                        type='submit'
                        variant='contained'
                        color='primary'
                        onClick={() => isCreateNew? save() : update()}
                    >
                        {isCreateNew ? 
                            <FormattedMessage
                                id='Global.Details.Policies.SaveOperationPolicies.save'
                                defaultMessage='Save'
                            />
                            :
                            <FormattedMessage
                                id='Global.Details.Policies.SaveOperationPolicies.update'
                                defaultMessage='Update'
                            />
                        }
                    </Button> 
                </Box>
            </Box>
        </GlobalPolicyContextProvider>
    );
};

export default Policies;
