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

import React, { useState, FC } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CardContent from '@material-ui/core/CardContent';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import CONSTS from 'AppData/Constants';
import type { Policy } from '../Types';
import TabPanel from '../SharedComponents/TabPanel';

const useStyles = makeStyles(() => ({
    flowTabs: {
        '& button': {
            minWidth: 50,
        },
    },
    flowTab: {
        fontSize: 'smaller',
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '35%',
    },
    policyList: {
        overflowY: 'auto', 
        maxHeight: '100%', 
        paddingRight: '20px'
    }
}));

interface PolicyListPorps {
    policyList: Policy[];
    fetchPolicies: () => void;
}

/**
 * Renders the local policy list.
 * @param {JSON} props - Input props from parent components.
 * @returns {TSX} - List of policies local to the API segment.
 */
const PolicyList: FC<PolicyListPorps> = ({policyList, fetchPolicies}) => {
    const classes = useStyles();
    const [selectedTab, setSelectedTab] = useState(0); // Request flow related tab is active by default
    const gatewayType = CONSTS.GATEWAY_TYPE.synapse;

    return (
        <Paper className={classes.paper} style={{ flex: '0 0 auto', marginLeft: '20px' }}>
            <Card variant='outlined'>
                <CardContent>
                    <Box height='100vh'>
                        <div className={classes.policyList}>
                            <Box display='flex'>
                                <Typography variant='subtitle2'>
                                    <FormattedMessage
                                        id='Global.Details.Policies.PolicyList.title'
                                        defaultMessage='Policy List'
                                    />
                                </Typography>
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
                                        label={<span className={classes.flowTab}>
                                            <FormattedMessage
                                                id='Request.Details.Policies.PolicyList.Title'
                                                defaultMessage='Request'
                                            />
                                        </span>}
                                        id='request-tab'
                                        aria-controls='request-tabpanel'
                                    />
                                    <Tab
                                        label={<span className={classes.flowTab}>
                                            <FormattedMessage
                                                id='Response.Details.Policies.PolicyList.Title'
                                                defaultMessage='Response'
                                            />
                                        </span>}
                                        id='response-tab'
                                        aria-controls='response-tabpanel'
                                    />
                                    <Tab
                                        label={<span className={classes.flowTab}>
                                            <FormattedMessage
                                                id='Fault.Details.Policies.PolicyList.Title'
                                                defaultMessage='Fault'
                                            />
                                        </span>}
                                        id='fault-tab'
                                        aria-controls='fault-tabpanel'
                                    />
                                </Tabs>
                                <Box pt={1} overflow='scroll'>
                                    <TabPanel
                                        policyList={policyList.filter(
                                            (policy) =>
                                                policy.applicableFlows.includes(
                                                    'request',
                                                ) &&
                                                policy.supportedGateways.includes(
                                                    gatewayType,
                                                ),
                                        )}
                                        index={0}
                                        selectedTab={selectedTab}
                                        fetchPolicies={fetchPolicies}
                                    />
                                    <TabPanel
                                        policyList={policyList.filter(
                                            (policy) =>
                                                policy.applicableFlows.includes(
                                                    'response',
                                                ) &&
                                                policy.supportedGateways.includes(
                                                    gatewayType,
                                                ),
                                        )}
                                        index={1}
                                        selectedTab={selectedTab}
                                        fetchPolicies={fetchPolicies}
                                    />
                                    <TabPanel
                                        policyList={policyList.filter((policy) =>
                                            policy.applicableFlows.includes('fault'),
                                        )}
                                        index={2}
                                        selectedTab={selectedTab}
                                        fetchPolicies={fetchPolicies}
                                    />
                                </Box>
                            </Box>
                        </div>
                    </Box>
                </CardContent>
            </Card>
        </Paper>
    );
};

export default PolicyList;
