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

import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from 'AppComponents/Shared/Alert';
import TextField from '@mui/material/TextField';
import React, { useState, useEffect, useMemo, FC } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useIntl, FormattedMessage } from 'react-intl';
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

const styles = {
    textField: {
        backgroundColor: 'white', 
    },

    titleLink: (theme : any) => ({
        color: 'primary.dark',
        marginRight: theme.spacing(1),
    }),

    titleWrapper: (theme : any) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    }),

    operationListingBox: {
        display: 'flex',
        overflowY: 'scroll',
    },

    paper: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },

    button: {
        width: '200px'
    }
};

const StyledDiv = styled('div')({});
const StyledLink = styled(Link)({});

interface PolicyProps {
    isCreateNew: boolean;
    policyID: string | null;
    disabled: boolean;
}

/**
 * Renders the Global Policy management page.
 * @param {boolean} isCreateNew - This value is true if form is for create new and false for edit.
 * @param {string} policyID - This value is to indentify the policy (Null if creating a new one). 
 * @param {boolean} disabled - This value is to disable the form (True if viewing the policy).
 * @returns {TSX} - Policy management page to render.
 */
const Policies: FC<PolicyProps> =  ({
    isCreateNew, 
    policyID,
    disabled,
}) => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState<Policy[] | null>(null);
    const [allPolicies, setAllPolicies] = useState<PolicySpec[] | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [appliedGatewayLabels, setAppliedGatewayLabels] = useState<string[]>([]);
    const intl = useIntl();

    /**
     * Global level policy mapping. It will be initially empty.
     */
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
     * Fetches all common policies to front-end to show in the Policy List.
     */
    const fetchPolicies = () => {
        const commonPoliciesPromise = API.getCommonOperationPolicies();
        Promise.all([commonPoliciesPromise]).then((response) => {
            const [commonPoliciesResponse] = response;
            const commonPolicies = commonPoliciesResponse.body.list;
            /**
             * Similar to policies in Global Policies scenario.
             * But as we are reusing PoliciesExpansion, both PolicySpec[] and Policy[] types are required.
             */
            setAllPolicies(commonPolicies);

            commonPolicies.sort(
                (a: Policy, b: Policy) => a.name.localeCompare(b.name))
            
            setPolicies(commonPolicies);
        }).catch(() => {
            Alert.error(intl.formatMessage({
                id: 'Error.Retrieve.Policy.List',
                defaultMessage: 'Error occurred while retrieving the policy list',
            }));
        });
    }

    /**
     * Assign UUIDs to the input.
     * Each Policy operation requires a uuid to identify (Since two operations can have same policy ID).
     * This requires for the UI so assigning this is required after getting data from the backend. 
     * @param {any} input - Policy List.
     * @returns {any} - Policy list which has UUIDs for each operations.
     */
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
      
    /**
     * Remove UUIDs from the input.
     * Each Policy operation has a uuid to identify (Since two operations can have same policy ID).
     * This requires for the UI so removing this is required before sending to backend to overcome backend validation.
     * @param {any} input - Global Level Policies which has UUIDs for each operations.
     * @returns {any} - Global Level Policies which does not have UUIDs for each operations.
     */
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

    /**
     * If this is the editng page (isCreateNew:False), fetching the data from backend.
     */
    const fetchGlobalPolicyByID = () => {
        setLoading(true);
        const gatewayPolicyMappingId = String(policyID);

        /**
         * Backend Call and handle the response.
         */
        const promisedPolicy = API.getGatewayPolicyMappingContentByPolicyMappingId(gatewayPolicyMappingId);
        promisedPolicy
            .then((response) => {
                const responseUpdated = assignUUIDs(response.body);      
                setGlobalLevelPolicies(responseUpdated.policyMapping);
                setDescription(responseUpdated.description);
                setName(responseUpdated.displayName);
                setAppliedGatewayLabels(responseUpdated.appliedGatewayLabels);
            })
            .catch(() => {
                Alert.error(intl.formatMessage({
                    id: 'Error.Retrieve.Policy',
                    defaultMessage: 'Error occurred while retrieving the policy',
                }));
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchPolicies();
        if (!isCreateNew && policyID){
            fetchGlobalPolicyByID();
        }
    }, []); 

    /**
     * A Context Operation for Policy Panel UI.
     * Triggers as we click delete icon in a drag`n`droped the policy.
     * @param {string} uuid - Operation uuid.
     * @param {string} currentFlow - Which flow needs to be udpated: request, response or fault.
     */
    const deleteGlobalOperation = (uuid: string, currentFlow: string) => {
        const newGlobalLevelPolicies: any = cloneDeep(globalLevelPolicies);
        const index = newGlobalLevelPolicies[currentFlow].map((p: any) => p.uuid).indexOf(uuid);
        newGlobalLevelPolicies[currentFlow].splice(index, 1);
        setGlobalLevelPolicies(newGlobalLevelPolicies);
    }

    /**
     * A Context Operation for Policy Panel UI.
     * Function to rearrange the API Operation ordering.
     * @param {string} oldIndex - Original index of the policy.
     * @param {string} newIndex - New index of the policy.
     * @param {string} currentFlow - Which flow needs to be udpated: request, response or fault.
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
     * A Context Operation for Policy Panel UI.
     * Triggers as we saved a drag`n`droped policy or edit a already dragged one.
     * @param {any} updatedOperation - Saved info as parameters: {headerName: <>, headerValue: <>}, policyId: <>, etc.
     * @param {string} currentFlow - Folow request/response/fault.
     */
    const updateGlobalOperations = (
        updatedOperation: any, currentFlow: string,
    ) => {
        const newGlobalLevelPolicies: any = cloneDeep(globalLevelPolicies);
        /**
        * Check whether the policy operation already exists.
        */
        const flowPolicy = (newGlobalLevelPolicies)[currentFlow].find(
            (p: any) =>
                p.policyId === updatedOperation.policyId &&
                p.uuid === updatedOperation.uuid,
        );
        
        if (flowPolicy) {
            /**
            * Edit the already dragged and dropped policy.
            */
            flowPolicy.parameters = { ...updatedOperation.parameters };
        } else {
            /**
            * Save the newly dragged and dropped policy.
            */
            const uuid = uuidv4();
            (newGlobalLevelPolicies)[currentFlow].push({ ...updatedOperation, uuid });
        }
        setGlobalLevelPolicies(newGlobalLevelPolicies);   
    }

    /**
     * Function to validate before saving or updating.
     * @returns {boolean} - True if all the required fields are filled.
     */
    const validate = () => {
        let isValidate = true;
        if (name === '') {
            Alert.error(intl.formatMessage({
                id: 'Policy.Name.Cannot.Be.Empty',
                defaultMessage: 'Policy name cannot be empty',
            }));
            isValidate = false;
        }
        if (description === '') {
            Alert.error(intl.formatMessage({
                id: 'Policy.Description.Cannot.Be.Empty',
                defaultMessage: 'Policy description cannot be empty',
            }));
            isValidate = false;
        }
        if ((!globalLevelPolicies.request || globalLevelPolicies.request.length === 0) &&
            (!globalLevelPolicies.response || globalLevelPolicies.response.length === 0) &&
            (!globalLevelPolicies.fault || globalLevelPolicies.fault.length === 0)) {
            Alert.error(intl.formatMessage({
                id: 'Policy.Mapping.Cannot.Be.Empty',
                defaultMessage: 'Policy mapping cannot be empty',
            }));
            isValidate = false;
        }
        return isValidate;
    }

    /**
     * Function to save a policy mapping.
     * Triggers if we click save button.
     */
    const save = () => {
        setLoading(true);

        if (validate()){
            /**
             * Remove UUIDs before sending to backend.
             * If not, as backend is not expecting UUIDs, backend validation will fail.
             */
            const policyMapping = removeUUIDs(globalLevelPolicies);

            /**
             * Backend Call and handle the response.
             */
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
                        Alert.success(intl.formatMessage({
                            id: 'Policy.Mapping.Added.Successfully',
                            defaultMessage: 'Policy mapping added successfully',
                        }));                 
                        history.goBack();
                    }
                    else {
                        Alert.error(intl.formatMessage({
                            id: 'Adding.Policy.Mapping.Error',
                            defaultMessage: 'Error occurred while adding the policy mapping',
                        })); 
                    }                
                })
                .catch(() => {
                    Alert.error(intl.formatMessage({
                        id: 'Adding.Policy.Mapping.Error',
                        defaultMessage: 'Error occurred while adding the policy mapping',
                    }));    
                })
        }
        setLoading(false);
    }

    /**
     * Function to update a policy mapping.
     * Triggers if we click update button.
     */
    const update = () => {
        setLoading(true);

        if (validate()){
            /**
             * Remove UUIDs before sending to backend.
             * If not, as backend is not expecting UUIDs, backend validation will fail.
             */
            const policyMapping = removeUUIDs(globalLevelPolicies);

            /**
             * Backend Call and handle the response.
             */
            const requestBody = {
                "id": policyID,
                "policyMapping": policyMapping,
                "description": description,
                "displayName": name,
                "appliedGatewayLabels": appliedGatewayLabels
            };
            const gatewayPolicyMappingId = String(policyID);
            const promise = API.updateGatewayPoliciesToFlows(gatewayPolicyMappingId, requestBody);
            promise
                .then((response) => {
                    if (response.status === 200 || response.status === 201) {
                        setLoading(false);
                        Alert.success(intl.formatMessage({
                            id: 'Policy.Mapping.Update.Success',
                            defaultMessage: 'Policy mapping updated successfully',
                        }));                  
                        history.goBack();
                    }
                    else {
                        Alert.error(intl.formatMessage({
                            id: 'Policy.Mapping.Update.Error',
                            defaultMessage: 'Error occurred while updating the policy mapping',
                        })); 
                    }                
                })
                .catch(() => {
                    Alert.error(intl.formatMessage({
                        id: 'Policy.Mapping.Update.Error',
                        defaultMessage: 'Error occurred while updating the policy mapping',
                    }));  
                })
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

    /**
     * Handle Name field changes.
     * @param {any} event changing event.
     */
    const handleNameChange = (event: any) => {
        setName(event.target.value);
    };
    
    /**
     * Handle Description field changes.
     * @param {any} event changing event.
     */
    const handleDescriptionChange = (event: any) => {
        setDescription(event.target.value);
    };

    /**
     * Loading screen if loading is true or there is no policies yet.
     */
    if (!policies || loading) {
        return <Progress per={90} message='Loading Policies ...' />
    }

    return (
        <GlobalPolicyContextProvider value={providerValue}>
            <Box mt={3} mb={3} ml={5} mr={5}>   
                <DndProvider backend={HTML5Backend}>
                    {/**
                    * Breadcrumb Navigation.
                    */}
                    <Grid item md={12}>
                        <StyledDiv sx={styles.titleWrapper}>
                            <StyledLink to='/global-policies' sx={styles.titleLink}>
                                <Typography variant='h4' component='h1'>
                                    <FormattedMessage
                                        id='globalPolicies.heading'
                                        defaultMessage='Global Policies'
                                    />
                                </Typography>
                            </StyledLink>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h2'>
                                {isCreateNew ? 
                                    <FormattedMessage
                                        id='globalPolicies.create.create.heading'
                                        defaultMessage='Create a new global policy'
                                    />
                                    : 
                                    <FormattedMessage
                                        id='globalPolicies.create.edit.heading'
                                        defaultMessage='Edit global policy'
                                    />
                                }
                            </Typography>
                        </StyledDiv>
                    </Grid>

                    {/**
                    * Name & Description Fields.
                    */}
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            required
                            id='outlined-required'
                            label={intl.formatMessage({
                                id: 'Polcies.TextField.Name',
                                defaultMessage: 'Name',
                            })}
                            variant='outlined'
                            value={name}
                            onChange={handleNameChange}
                            sx={styles.textField}
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            required
                            id='outlined-multiline-static'
                            label={intl.formatMessage({
                                id: 'Polcies.TextField.Description',
                                defaultMessage: 'Description',
                            })}
                            multiline
                            rows={3}
                            variant='outlined'
                            value={description}
                            onChange={handleDescriptionChange}
                            sx={styles.textField}
                        />
                    </Box>  
                    
                    <Box sx={styles.operationListingBox}>  
                        {/**
                        * Left side panel where we can drop policies.
                        */}
                        <Paper sx={styles.paper}>
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
          
                        {/**
                        * Right side policy list.
                        */}
                        <PolicyList
                            policyList={policies}
                            fetchPolicies={fetchPolicies}
                        />                   
                    </Box>
                </DndProvider>

                {/**
                * Edit & Save buttons.
                */}
                <Box mt={2}>      
                    <Button
                        sx={styles.button}
                        type='submit'
                        variant='contained'
                        color='primary'
                        data-testid= 'policy-mapping-save-or-update-button'
                        disabled={disabled}
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
