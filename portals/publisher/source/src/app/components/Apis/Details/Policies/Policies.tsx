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
    Button, Container, Grid, IconButton, makeStyles, Tooltip, Typography,
} from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import Alert from 'AppComponents/Shared/Alert';
import React, { useState,  useReducer, useEffect, useCallback, useMemo, } from 'react';
import cloneDeep from 'lodash.clonedeep';
import Paper from '@material-ui/core/Paper';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Box from '@material-ui/core/Box';
import Banner from 'AppComponents/Shared/Banner';
import { FormattedMessage } from 'react-intl';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { Link } from 'react-router-dom';
import CONSTS from 'AppData/Constants';
import SwaggerParser from '@apidevtools/swagger-parser';
import { isRestricted } from 'AppData/AuthManager';
import Operation from 'AppComponents/Apis/Details/Resources/components/Operation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import {
    extractPathParameters, isSelectAll, mapAPIOperations, getVersion, VERSIONS,
} from 'AppComponents/Apis/Details/Resources/operationUtils';
import OperationsSelector from 'AppComponents/Apis/Details/Resources/components/OperationsSelector';
import SaveOperations from 'AppComponents/Apis/Details/Resources/components/SaveOperations';
import Icon from '@material-ui/core/Icon';
import Card from '@material-ui/core/Card';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CardContent from '@material-ui/core/CardContent';
import OperationPolicy from './OperationPolicy'
import OperationsGroup from './OperationsGroup'
import DraggablePolicyCard from './DraggablePolicyCard';

const useStyles = makeStyles((theme: any) => ({
    root: {
        paddingTop: 0,
        paddingLeft: 0,
    },
    buttonProgress: {
        position: 'relative',
        margin: theme.spacing(1),
    },
    headline: { paddingTop: theme.spacing(1.25), paddingLeft: theme.spacing(2.5) },
    heading: {
        flexGrow: 1,
        marginTop: 10,
        '& table td:nth-child(2)': {
            'word-break': 'break-word',
        },
        '& table td button span, & table th': {
            'white-space': 'nowrap',
        },
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    mainTitle: {
        paddingLeft: 0,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    content: {
        margin: `${theme.spacing(2)}px 0 ${theme.spacing(2)}px 0`,
    },
    head: {
        fontWeight: 200,
    },
    addPolicyBtn: {
        marginLeft: 'auto',
    },
    flowTabs: {
        '& button': {
            minWidth: 50,
        }
    },
    flowTab: {
        fontSize: 'smaller',
    },
    gridItem: {
        display: 'flex',
        width: '100%',
    },
    policyListBox: {
        position: 'fixed',
        right: '20',
    }
}));

interface Policy {
    id: number;
    name: string;
    description: string;
    flows: string[];
}

interface IStatePolicy {
    policy: Policy[];
}

interface IProps {
    disableUpdate: any;
}

interface Iverb {
    verbObject: Record<string, {code: string}>
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: any;
  }

/**
 * Renders the policy management page.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy management page to render.
 */
const Policies: React.FC<IProps> = ({ disableUpdate }) => {
    const classes = useStyles();
    const [api, updateAPI] = useAPI();
    const createUrl = `/apis/${api.id}/policies/create`;
    const viewUrl = `/apis/${api.id}/policies/view`;
    // const { policies } = api;
    const [selectedTab, setSelectedTab] = useState(0); // Request flow related tab is active by default
    const [policies, setPolicies] = useState <IStatePolicy['policy']>([
        {
            id: 1,
            name: 'Add Header',
            description: 'With this policy, user can add a new header to the request',
            flows: ['Request', 'Response', 'Fault'],
        },
        {
            id: 2,
            name: 'Rewrite HTTP Method',
            description: 'User should be able to change the HTTP method of a resource',
            flows: ['Request'],
        },
    ]);

    const [pageError, setPageError] = useState(false);
    const [resolvedSpec, setResolvedSpec] = useState({});
    const [markedOperations, setSelectedOperation] = useState({});
    const [expandedResource, setExpandedResource] = useState(false);
    const [requestFlowPolicies, setRequestFlowPolicies] = useState<Array<Policy>>([]);
    const [responseFlowPolicies, setResponseFlowPolicies] = useState<Array<Policy>>([]);
    const [faultFlowPolicies, setFaultFlowPolicies] = useState<Array<Policy>>([]);


    useEffect(() => {
        // {Object.values(policies).map((policy: Policy) => (

        // ))}
    }, [policies])

    /**
     *
     * **** NOTE: This reducer function needs to be a pure JS function, Mean we cant refer to external states, or
     * variables within the `operationsReducer` function. Please avoid making external references.
     * We need to remove already used `openAPISpec`,`setSecurityDefScopes` etc.
     * Source : https://github.com/facebook/react/issues/16295#issuecomment-610098654
     * @param {Object} currentOperations Current state
     * @param {Object} operationAction action and payload
     * @return {Object} next next state
     */
    function operationsReducer(currentOperations: any, operationAction: any) {
        // Please read the note above before updating the reducer
        const { action, data } = operationAction;
        const { target, verb, value } = data || {};
        let updatedOperation;
        let addedOperations;
        if (target && verb) {
            updatedOperation = cloneDeep(currentOperations[target][verb]);
        } else {
            addedOperations = cloneDeep(currentOperations);
        }
        let newData = {};
        if (action === 'removeAllSecurity') {
            newData = cloneDeep(openAPISpec.paths);
        }
        if (action === 'init') {
            newData = data || openAPISpec.paths;
        }
        switch (action) {
            case 'init':
                setSelectedOperation({});
                return data || openAPISpec.paths;
            case 'description':
            case 'summary':
                updatedOperation[action] = value;
                break;
            case 'parameter':
                if (updatedOperation.parameters) {
                    // Get the index to check whether the same parameter exists.
                    const index = updatedOperation.parameters.findIndex(
                        (e:any) => e.in === value.in && e.name === value.name,
                    );
                    if (index === -1) { // Parameter with name and in does not exists.
                        if (value.in === 'body') {
                            // Get the index of existing body param.
                            // This replaces if a new body parameter is added when another one exists.
                            const bodyIndex = updatedOperation.parameters.findIndex((parameter: any) => {
                                return parameter.in === 'body';
                            });
                            if (bodyIndex !== -1) {
                                updatedOperation.parameters[bodyIndex] = value;
                            } else {
                                updatedOperation.parameters.push(value);
                            }
                        } else {
                            updatedOperation.parameters.push(value);
                        }
                    } else {
                        updatedOperation.parameters[index] = value;
                    }
                } else {
                    updatedOperation.parameters = [value];
                }
                break;
            case 'requestBody':
                updatedOperation[action] = value;
                break;
            default:
                return currentOperations;
        }
        return { ...currentOperations, [target]: { ...currentOperations[target], [verb]: updatedOperation } };
    }
    const [operations, operationsDispatcher] = useReducer(operationsReducer, {});
    const [openAPISpec, setOpenAPISpec] = useState<any>({});

    function resolveAndUpdateSpec(rawSpec: any) {
        /*
         * Deep copying the spec.
         * Otherwise it will resolved to the original parameter passed (rawSpec) to the validate method.
         * We will not alter the provided spec.
         */
        const specCopy = cloneDeep(rawSpec);
        /*
        * Used SwaggerParser.validate() because we can get the errors as well.
        */
        SwaggerParser.validate(specCopy, (err, result: any) => {
            // setResolvedSpec(() => {
            //     const errors = err ? [err] : [];
            //     return {
            //         spec: result,
            //         errors,
            //     };
            // });
            setResolvedSpec(result);
        });
        operationsDispatcher({ action: 'init', data: rawSpec.paths });
        setOpenAPISpec(rawSpec);
    }

    /**
     *
     * Save the OpenAPI changes using REST API, type parameter is required to
     * identify the locally created data structured, i:e type `operation` will assume that `data` contains the
     * object structure of locally created operation object which is a combination of REST API
     * response `operations` field and OpenAPI spec operation information
     * @param {String} type Type of data object
     * @param {Object} data Data object
     * @returns {Promise|null} A promise object which resolve to Swagger PUT response body.
     */
    function updateOpenAPI(type: any) {
        const copyOfOperations = cloneDeep(operations);
        // switch (type) {
        //     case 'save':
        //         if (isSelectAll(markedOperations, copyOfOperations)) {
        //             const message = 'At least one operation is required for the API';
        //             Alert.warning(message);
        //             return Promise.reject(new Error(message));
        //         }
        //         for (const [target, verbs] of Object.entries(markedOperations)) {
        //             for (const verb of Object.keys(verbs)) {
        //                 delete copyOfOperations[target][verb];
        //                 if (isEmpty(copyOfOperations[target])) {
        //                     delete copyOfOperations[target];
        //                 }
        //             }
        //         }
        //         // TODO: use better alternative (optimize performance) to identify newly added operations ~tmkb
        //         for (const [, verbs] of Object.entries(copyOfOperations)) {
        //             for (const [, verbInfo] of Object.entries(verbs)) {
        //                 if (verbInfo['x-wso2-new']) {
        //                     delete verbInfo['x-wso2-new'];
        //                 }
        //             }
        //         }
        //         break;
        //     default:
        //         return Promise.reject(new Error('Unsupported resource operation!'));
        // }
        // updateSecurityDefinition(copyOfOperations);
        // setSpecScopesFromSecurityDefScopes();
        // if (apiThrottlingPolicy !== api.apiThrottlingPolicy) {
        //     return updateAPI({ apiThrottlingPolicy })
        //         .catch((error) => {
        //             console.error(error);
        //             Alert.error('Error while updating the API');
        //         })
        //         .then(() => updateSwagger({ ...openAPISpec, paths: copyOfOperations }));
        // } else {
        //     return updateSwagger({ ...openAPISpec, paths: copyOfOperations });
        // }
    }

    /**
     * Renders the available policy list under the relevant flow related tab (i.e. request, response or fault)
     * @param {JSON} props Input props
     * @returns {TSX} Tab panel to render
     */
    function TabPanel(props: TabPanelProps) {
        const { children, value, index} = props;

        return (
            <div
                role='tabpanel'
                hidden={selectedTab !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
            >
                {selectedTab === index && (
                    value.map((singlePolicy: Policy) => {
                        return (
                            <DraggablePolicyCard
                                policyObj={singlePolicy}
                            />
                        );
                    })
                )}
            </div>
        );
    }

    useEffect(() => {
        // Update the Swagger spec object when API object gets changed
        api.getSwagger()
            .then((response: any) => {
                resolveAndUpdateSpec(response.body);
            })
            .catch((error: any) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                    setPageError(error.response.body);
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
    
    return (
        <>
            <Box mb={4}>
                <Typography id='itest-api-details-resources-head' variant='h4' component='h2' gutterBottom>
                    <FormattedMessage
                        id='Apis.Details.Policies.title'
                        defaultMessage='Policies'
                    />
                </Typography>
            </Box>
            <Grid container direction='row' justify='flex-start' spacing={2} alignItems='stretch'>
                <Grid item xs={8}>
                    <Paper>
                        {Object.entries(operations).map(([target, verbObject]:[string, any]) => (
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
                                                        operationsDispatcher={operationsDispatcher}
                                                        spec={openAPISpec}
                                                        operation={operation}
                                                        api={localAPI}
                                                        disableUpdate={
                                                            disableUpdate || isRestricted(['apim:api_create'], api)
                                                        }
                                                        expandedResource={expandedResource}
                                                        setExpandedResource={setExpandedResource}
                                                    />
                                                </Grid>
                                            ) : null;
                                        })}
                                    </Grid>
                                </OperationsGroup>
                            </Grid>
                        ))}
                    </Paper>
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
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Box maxHeight='40vh' className={classes.policyListBox}>
                            <Card variant='outlined'>
                                <CardContent>
                                    <Grid container>
                                        <Typography variant='subtitle2'>
                                            Policy List
                                        </Typography>
                                        <Button
                                            // onClick={toggleAddPolicyPopup}
                                            disabled={false}
                                            variant='outlined'
                                            color='primary'
                                            size='small'
                                            className={classes.addPolicyBtn}
                                        >
                                            <AddCircle className={classes.buttonIcon} />
                                            <FormattedMessage
                                                id='Apis.Details.Policies.APIPolicyList.new.policy'
                                                defaultMessage='Add New Policy'
                                            />
                                        </Button>
                                    </Grid>
                                    <Grid container>
                                        <Tabs
                                            value={selectedTab}
                                            onChange={(event, tab) => setSelectedTab(tab)}
                                            indicatorColor='primary'
                                            textColor='primary'
                                            variant='standard'
                                            aria-label='Policies local to API'
                                            className={classes.flowTabs}
                                        >
                                            <Tab 
                                                label={<span className={classes.flowTab}>Request</span>}
                                                id='simple-tab-0'
                                                aria-controls='simple-tabpanel-0' 
                                            />
                                            <Tab
                                                label={<span className={classes.flowTab}>Response</span>}
                                                id='simple-tab-1'
                                                aria-controls='simple-tabpanel-1' 
                                            />
                                            <Tab
                                                label={<span className={classes.flowTab}>Fault</span>}
                                                id='simple-tab-2'
                                                aria-controls='simple-tabpanel-2'
                                            />
                                        </Tabs>
                                        <Grid container>
                                            <TabPanel value={policies} index={0} />
                                            <TabPanel value={policies} index={1} />
                                            <TabPanel value={policies} index={2} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default Policies;
