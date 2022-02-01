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

import React, { useState, useEffect, FC } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { AddCircle } from '@material-ui/icons';
import { Button, makeStyles } from '@material-ui/core';
import DraggablePolicyCard from './DraggablePolicyCard';

const useStyles = makeStyles((theme: any) => ({
    flowTabs: {
        '& button': {
            minWidth: 50,
        }
    },
    flowTab: {
        fontSize: 'smaller',
    },
    addPolicyBtn: {
        marginLeft: 'auto',
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    tabContentGrid: {
        overflowY: 'scroll',
        height: '50vh',
        paddingTop: '10px',
    }
}));

interface Policy {
    id: number;
    name: string;
    flows: string[];
}

interface PolicyListPorps {
    policyList: Policy[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: any;
}

/**
 * Renders the local policy list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyList: FC<PolicyListPorps> = ({
    policyList
}) => {
    const classes = useStyles();
    const [selectedTab, setSelectedTab] = useState(0); // Request flow related tab is active by default
    const [requestFlowPolicyList, setRequestFlowPolicyList] = useState<Array<Policy>>([]);
    const [responseFlowPolicyList, setResponseFlowPolicyList] = useState<Array<Policy>>([]);
    const [faultFlowPolicyList, setFaultFlowPolicyList] = useState<Array<Policy>>([]);


    useEffect(() => {
        // for (const policy of policyList) {
            
        // }
        // policyList.filter()
        Object.values(policyList).map((policy: Policy) => {
            if (policy.flows.includes('Request')) {
                requestFlowPolicyList.push(policy);
            }
            if (policy.flows.includes('Response')) {
                responseFlowPolicyList.push(policy);
            }
            if (policy.flows.includes('Fault')) {
                faultFlowPolicyList.push(policy);
            }
        })
    }, [policyList]);

    // Create sperate component
    /**
     * Renders the available policy list under the relevant flow related tab (i.e. request, response or fault)
     * @param {JSON} props Input props
     * @returns {TSX} Tab panel to render
     */
    function TabPanel(props: TabPanelProps) {
        const { value, index} = props;
        const flowNames = ['Request', 'Response', 'Fault'];

        return (
            <div
                role='tabpanel'
                hidden={selectedTab !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
            >
                {selectedTab === index && (
                    value?.map((singlePolicy: Policy) => {
                        return (
                            <DraggablePolicyCard
                                policyObj={singlePolicy}
                                showCopyIcon
                                currentFlow={flowNames[index]}
                            />
                        );
                    })
                )}
            </div>
        );
    }

    return (
        <Paper>
            {/* <Box> */}
            <Card variant='outlined'>
                <CardContent>
                    <Grid container>
                        <Typography variant='subtitle2'>
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyList.title'
                                defaultMessage='Policy List'
                            />
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
                    {/* use Box instead of Grid */}
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
                        <Grid container className={classes.tabContentGrid}>
                            {/* // usefilter */}
                            <TabPanel value={requestFlowPolicyList} index={0} />
                            <TabPanel value={responseFlowPolicyList} index={1} />
                            <TabPanel value={faultFlowPolicyList} index={2} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* </Box> */}
        </Paper>
    );
}

export default PolicyList;
