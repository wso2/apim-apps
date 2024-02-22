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
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CardContent from '@mui/material/CardContent';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import CONSTS from 'AppData/Constants';
import type { Policy } from '../Types';
import TabPanel from '../SharedComponents/TabPanel';

const PREFIX = 'PolicyList';

const classes = {
    flowTabs: `${PREFIX}-flowTabs`,
    flowTab: `${PREFIX}-flowTab`,
    paper: `${PREFIX}-paper`,
    policyList: `${PREFIX}-policyList`
};

const StyledPaper = styled(Paper)(() => ({
    [`& .${classes.flowTabs}`]: {
        '& button': {
            minWidth: 50,
        },
    },

    [`& .${classes.flowTab}`]: {
        fontSize: 'smaller',
    },

    [`&.${classes.paper}`]: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '35%',
    },

    [`& .${classes.policyList}`]: {
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

    const [selectedTab, setSelectedTab] = useState(0); // Request flow related tab is active by default
    const gatewayType = CONSTS.GATEWAY_TYPE.synapse;

    return (
        <StyledPaper className={classes.paper} style={{ flex: '0 0 auto', marginLeft: '20px' }}>
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
        </StyledPaper>
    );
};

export default PolicyList;
