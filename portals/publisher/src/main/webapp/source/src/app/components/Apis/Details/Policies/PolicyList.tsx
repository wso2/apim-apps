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
import { isRestricted } from 'AppData/AuthManager';
import { AddCircle } from '@mui/icons-material';
import { Button , Theme } from '@mui/material';
import CONSTS from 'AppData/Constants';
import type { Policy } from './Types';
import TabPanel from './components/TabPanel';
import CreatePolicy from './CreatePolicy';

const PREFIX = 'PolicyList';

const classes = {
    flowTabs: `${PREFIX}-flowTabs`,
    flowTab: `${PREFIX}-flowTab`,
    addPolicyBtn: `${PREFIX}-addPolicyBtn`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    paperPosition: `${PREFIX}-paperPosition`
};

const StyledPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
    [`& .${classes.flowTabs}`]: {
        '& button': {
            minWidth: 50,
        },
    },

    [`& .${classes.flowTab}`]: {
        fontSize: 'smaller',
    },

    [`& .${classes.addPolicyBtn}`]: {
        marginLeft: 'auto',
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`&.${classes.paperPosition}`]: {
        // position: 'fixed',
    }
}));

interface PolicyListPorps {
    apiPolicyList: Policy[];
    commonPolicyList: Policy[];
    fetchPolicies: () => void;
    isChoreoConnectEnabled: boolean;
    gatewayType: string;
    apiType: string;
}

/**
 * Renders the local policy list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyList: FC<PolicyListPorps> = ({apiPolicyList, commonPolicyList, fetchPolicies, isChoreoConnectEnabled, 
    gatewayType, apiType}) => {

    const [selectedTab, setSelectedTab] = useState(0); // Request flow related tab is active by default
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleAddPolicy = () => {
        setDialogOpen(true);
    };

    const handleAddPolicyClose = () => {
        setDialogOpen(false);
    };

    return (
        <StyledPaper className={classes.paperPosition}>
            <Card variant='outlined'>
                <CardContent>
                    <Box display='flex'>
                        <Typography variant='subtitle2'>
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyList.title'
                                defaultMessage='Policy List'
                            />
                        </Typography>
                        {!isChoreoConnectEnabled && (
                            <Button
                                onClick={handleAddPolicy}
                                disabled={isRestricted(['apim:api_create', 'apim:api_publish'])}
                                variant='outlined'
                                color='primary'
                                data-testid='add-new-api-specific-policy'
                                size='small'
                                className={classes.addPolicyBtn}
                            >
                                <AddCircle className={classes.buttonIcon} />
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyList.add.new.policy'
                                    defaultMessage='Add New Policy'
                                />
                            </Button>
                        )}
                    </Box>
                    <Box>
                        {apiType === 'WS' ? (
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
                                    label={
                                        <span className={classes.flowTab}>
                                            <FormattedMessage
                                                id='Apis.Details.Policies.PolicyList.add.inbound.tab'
                                                defaultMessage='Inbound Handshake'
                                            />
                                        </span>
                                    }
                                    id='request-tab'
                                    aria-controls='request-tabpanel'
                                />
                            </Tabs>
                        ) : (
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
                                    label={
                                        <span className={classes.flowTab}>
                                            <FormattedMessage
                                                id='Apis.Details.Policies.PolicyList.add.request.tab'
                                                defaultMessage='Request'
                                            />
                                        </span>
                                    }
                                    id='request-tab'
                                    aria-controls='request-tabpanel'
                                />
                                <Tab
                                    label={
                                        <span className={classes.flowTab}>
                                            <FormattedMessage
                                                id='Apis.Details.Policies.PolicyList.add.response.tab'
                                                defaultMessage='Response'
                                            />
                                        </span>
                                    }
                                    id='response-tab'
                                    aria-controls='response-tabpanel'
                                />
                                {!isChoreoConnectEnabled && (
                                    <Tab
                                        label={
                                            <span className={classes.flowTab}>
                                                <FormattedMessage
                                                    id='Apis.Details.Policies.PolicyList.add.fault.tab'
                                                    defaultMessage='Fault'
                                                />
                                            </span>
                                        }
                                        id='fault-tab'
                                        aria-controls='fault-tabpanel'
                                    />)
                                }
                            </Tabs>
                        )}
                        {apiType === 'WS' ? (
                            <Box height='55vh' pt={1} overflow='scroll'>
                                <TabPanel
                                    commonPolicyList={commonPolicyList.filter(
                                        (policy) =>
                                            policy.applicableFlows.includes(
                                                'request',
                                            ) &&
                                            policy.supportedGateways.includes(
                                                gatewayType,
                                            ),
                                    )}
                                    apiPolicyList={apiPolicyList.filter(
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
                                    isReadOnly={isRestricted(['apim:api_create', 'apim:api_publish', 'apim:api_manage'])}
                                />
                            </Box>
                        ) : (
                            <Box height='55vh' pt={1} overflow='scroll'>
                                <TabPanel
                                    commonPolicyList={commonPolicyList.filter(
                                        (policy) =>
                                            policy.applicableFlows.includes(
                                                'request',
                                            ) &&
                                            policy.supportedGateways.includes(
                                                gatewayType,
                                            ),
                                    )}
                                    apiPolicyList={apiPolicyList.filter(
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
                                    isReadOnly={isRestricted(['apim:api_create', 'apim:api_publish', 'apim:api_manage'])}
                                />
                                <TabPanel
                                    commonPolicyList={commonPolicyList.filter(
                                        (policy) =>
                                            policy.applicableFlows.includes(
                                                'response',
                                            ) &&
                                            policy.supportedGateways.includes(
                                                gatewayType,
                                            ),
                                    )}
                                    apiPolicyList={apiPolicyList.filter(
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
                                    isReadOnly={isRestricted(['apim:api_create', 'apim:api_publish', 'apim:api_manage'])}
                                />
                                {!isChoreoConnectEnabled && (
                                    <TabPanel
                                        commonPolicyList={commonPolicyList.filter(
                                            (policy) =>
                                                policy.applicableFlows.includes(
                                                    'fault',
                                                ) &&
                                                policy.supportedGateways.includes(
                                                    gatewayType,
                                                ),
                                        )}
                                        apiPolicyList={apiPolicyList.filter(
                                            (policy) =>
                                                policy.applicableFlows.includes(
                                                    'fault',
                                                ) &&
                                                policy.supportedGateways.includes(
                                                    gatewayType,
                                                ),
                                            )}
                                        index={2}
                                        selectedTab={selectedTab}
                                        fetchPolicies={fetchPolicies}
                                        isReadOnly={isRestricted(['apim:api_create', 'apim:api_publish', 'apim:api_manage'])}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
            <CreatePolicy
                dialogOpen={dialogOpen}
                handleDialogClose={handleAddPolicyClose}
                fetchPolicies={fetchPolicies}
            />
        </StyledPaper>
    );
};

export default PolicyList;
