/* eslint-disable */
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

import React, { FC, useEffect, useContext, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
    Drawer,
    makeStyles,
    ListItemIcon,
    Theme,
    Typography,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { Settings, Close } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import General from './AttachedPolicyForm/General';
import type { PolicySpec, ApiPolicy, AttachedPolicy } from './Types';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import ApiOperationContext from './ApiOperationContext';
import API from 'AppData/api';

const useStyles = makeStyles((theme: Theme) => ({
    drawerPaper: {
        backgroundColor: 'white',
        width: '30%',
    },
    iconSize: {
        height: '1.2em',
        width: '1.2em',
        color: theme.palette.grey[700],
    },
}));

interface PolicyConfigurationEditDrawerProps {
    policyObj: AttachedPolicy | null;
    currentFlow: string;
    target: string;
    verb: string;
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
}

/**
 * Renders the policy configuration edit drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyConfigurationEditDrawer: FC<PolicyConfigurationEditDrawerProps> = ({
    policyObj,
    currentFlow,
    target,
    verb,
    allPolicies,
    drawerOpen,
    setDrawerOpen,
    isAPILevelPolicy,
}) => {
    const classes = useStyles();
    const { api } = useContext<any>(ApiContext);
    const { apiOperations } = useContext<any>(ApiOperationContext);
    const { apiLevelPolicies } = useContext<any>(ApiOperationContext);
    const [policySpec, setPolicySpec] = useState<PolicySpec>();

    useEffect(() => {
        (async () => {
            if (policyObj) {
                let policySpecVal = allPolicies?.find(
                    (policy: PolicySpec) => policy.name === policyObj.name,
                );

                // If this policy is a deleted common policy we need to do an API call to get the policy specification
                if (!policySpecVal) {
                    const policyResponse = await API.getOperationPolicy(
                        policyObj.id,
                        api.id,
                    );
                    policySpecVal = policyResponse.body;
                }

                setPolicySpec(policySpecVal);
                setDrawerOpen(true);
            }
        })();
    }, [policyObj]);

    const operationInAction = (!isAPILevelPolicy) ? apiOperations.find(
        (op: any) =>
            op.target === target &&
            op.verb.toLowerCase() === verb.toLowerCase(),
    ) : null;
    const operationFlowPolicy = ((isAPILevelPolicy) ? apiLevelPolicies : operationInAction.operationPolicies)[
        currentFlow
    ].find((policy: any) => policy.uuid === policyObj?.uniqueKey);

    const apiPolicy: ApiPolicy = operationFlowPolicy || {
        policyName: policyObj?.name,
        policyId: policyObj?.id,
        policyVersion: policyObj?.version,
        parameters: {},
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    return (
        <Drawer
            anchor='right'
            open={drawerOpen}
            onClose={handleDrawerClose}
            classes={{ paper: classes.drawerPaper }}
        >
            <Box role='presentation'>
                <List>
                    <ListItem key='policy-config'>
                        <ListItemIcon>
                            <Settings className={classes.iconSize} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant='subtitle2'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyConfigurationEditDrawer.title'
                                        defaultMessage='Configure {policy}'
                                        values={{
                                            policy: policyObj?.displayName + ' : ' + policyObj?.version,
                                        }}
                                    />
                                </Typography>
                            }
                        />
                        <ListItemIcon>
                            <IconButton onClick={handleDrawerClose}>
                                <Close className={classes.iconSize} />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>
                </List>
                <Divider light />
                {policySpec && (
                    <General
                        policyObj={policyObj}
                        currentFlow={currentFlow}
                        target={target}
                        verb={verb}
                        policySpec={policySpec}
                        apiPolicy={apiPolicy}
                        handleDrawerClose={handleDrawerClose}
                        isEditMode
                    />
                )}
            </Box>
        </Drawer>
    );
};

export default PolicyConfigurationEditDrawer;
