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
import LaunchIcon from '@material-ui/icons/Launch';
import { makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import DraggablePolicyCard from './DraggablePolicyCard';


const useStyles = makeStyles((theme: any) => ({
    policyListPaper: {
        // maxHeight: '35vh',
        // overflow: 'auto',
        marginBottom: theme.spacing(2),
    },
    flowTabs: {
        '& button': {
            minWidth: 50,
        }
    },
    flowTab: {
        fontSize: 'smaller',
    },
    link: {
        color: theme.palette.primary.dark,
        marginLeft: theme.spacing(2),
        display: 'inline',
    },
    managePolicyTemplatesLink: {
        marginLeft: 'auto',
    },
    tabContentGrid: {
        overflowY: 'scroll',
        height: '25vh',
    }
}));

interface Policy {
    id: number;
    name: string;
    flows: string[];
}

interface PolicyTemplateListPorps {
    policyList: Policy[];
    setDroppedPolicy: React.Dispatch<React.SetStateAction<Policy>>;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: any;
}

/**
 * Renders the policy template list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of globally maintained shared policies.
 */
const PolicyTemplateList: FC<PolicyTemplateListPorps> = ({
    policyList, setDroppedPolicy
}) => {
    const classes = useStyles();
    const [selectedTab, setSelectedTab] = useState(0); // Request flow related tab is active by default
    const [requestFlowPolicyList, setRequestFlowPolicyList] = useState<Array<Policy>>([]);
    const [responseFlowPolicyList, setResponseFlowPolicyList] = useState<Array<Policy>>([]);
    const [faultFlowPolicyList, setFaultFlowPolicyList] = useState<Array<Policy>>([]);

    useEffect(() => {
        // eslint-disable-next-line array-callback-return
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

    /**
     * Renders the available policy list under the relevant flow related tab (i.e. request, response or fault)
     * @param {JSON} props Input props
     * @returns {TSX} Tab panel to render
     */
    function TabPanel(props: TabPanelProps) {
        const { value, index} = props;

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
                                setDroppedPolicy={setDroppedPolicy}
                            />
                        );
                    })
                )}
            </div>
        );
    }

    return (
        <Paper className={classes.policyListPaper} >
            <Box>
                <Card variant='outlined'>
                    <CardContent>
                        <Grid container>
                            <Typography variant='subtitle2'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyTemplateList.title'
                                    defaultMessage='Policy Templates'
                                />
                            </Typography>
                            <Link to='/policy-templates' className={classes.managePolicyTemplatesLink}>
                                <Typography className={classes.link} variant='caption'>
                                    Manage Policy Templates
                                    <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                                </Typography>
                            </Link>
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
                            <Grid container className={classes.tabContentGrid}>
                                <TabPanel value={requestFlowPolicyList} index={0} />
                                <TabPanel value={responseFlowPolicyList} index={1} />
                                <TabPanel value={faultFlowPolicyList} index={2} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Paper>
    );
}

export default PolicyTemplateList;
