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
import type { Policy } from './Types';
import TabPanel from './components/TabPanel';

const useStyles = makeStyles((theme: any) => ({
    headerBox: {
        display: 'flex',
    },
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
    tabContentBox: {
        overflowY: 'scroll',
        height: '50vh',
        paddingTop: '10px',
        width: '70%',
    },
}));

interface PolicyListPorps {
    policyList: Policy[];
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
 
    return (
        <Paper>
            <Card variant='outlined'>
                <CardContent>
                    <Box className={classes.headerBox}>
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
                    </Box>
                    <Box> 
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
                                id='request-tab'
                                aria-controls='request-tabpanel' 
                            />
                            <Tab
                                label={<span className={classes.flowTab}>Response</span>}
                                id='response-tab'
                                aria-controls='response-tabpanel' 
                            />
                            <Tab
                                label={<span className={classes.flowTab}>Fault</span>}
                                id='fault-tab'
                                aria-controls='fault-tabpanel'
                            />
                        </Tabs>
                        <Box className={classes.tabContentBox}>
                            <TabPanel
                                value={policyList.filter((policy) => policy.flows.includes('Request'))}
                                index={0}
                                selectedTab={selectedTab}
                            />
                            <TabPanel
                                value={policyList.filter((policy) => policy.flows.includes('Response'))}
                                index={1} 
                                selectedTab={selectedTab}
                            />
                            <TabPanel
                                value={policyList.filter((policy) => policy.flows.includes('Fault'))}
                                index={2}
                                selectedTab={selectedTab}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Paper>
    );
}

export default PolicyList;
