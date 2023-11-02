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

import React, { FC, useEffect, useState } from 'react';
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
import { Progress } from 'AppComponents/Shared';
import General from './AttachedPolicyForm/General';
import { PolicySpec, ApiPolicy, Policy } from './Types';

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

interface PolicyConfiguringDrawerProps {
    policyObj: Policy | null;
    setDroppedPolicy: React.Dispatch<React.SetStateAction<Policy | null>>;
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
}

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyConfiguringDrawer: FC<PolicyConfiguringDrawerProps> = ({
    policyObj,
    setDroppedPolicy,
    currentFlow,
    target,
    verb,
    allPolicies, 
}) => {
    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState(!!policyObj);
    const [policySpec, setPolicySpec] = useState<PolicySpec>();

    useEffect(() => {
        if (policyObj) {
            setPolicySpec(
                allPolicies?.find(
                    (policy: PolicySpec) => policy.id === policyObj.id,
                ),
            );
            setDrawerOpen(true);
        }
    }, [policyObj]);

    if (!policySpec) {
        return <Progress />;
    }

    const apiPolicy: ApiPolicy = {
        policyName: policyObj?.name,
        policyId: policyObj?.id,
        policyVersion: policyObj?.version,
        parameters: {},
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setDroppedPolicy(null);
    };

    /**
     * Converts the PolicyObj prop of type Policy to AttachedPolicy
     * @returns {AttachedPolicy} Returns a policy object of type AttachedPolicy
     */
    const getPolicyOfTypeAttachedPolicy = () => {
        if (policyObj) {
            return {
                id: policyObj?.id,
                name: policyObj?.name,
                displayName: policyObj?.displayName,
                version: policyObj?.version,
                applicableFlows: policyObj?.applicableFlows,
                uniqueKey: '',
            };
        } else {
            return null;
        }
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
                                        id='Apis.Details.Policies.PolicyConfiguringDrawer.title'
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
                <General
                    policyObj={getPolicyOfTypeAttachedPolicy()}
                    setDroppedPolicy={setDroppedPolicy}
                    currentFlow={currentFlow}
                    target={target}
                    verb={verb}
                    policySpec={policySpec}
                    apiPolicy={apiPolicy}
                    handleDrawerClose={handleDrawerClose}
                    isEditMode={false}
                />
            </Box>
        </Drawer>
    );
};

export default PolicyConfiguringDrawer;
