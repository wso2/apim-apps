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
import { FormattedMessage, useIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Drawer, makeStyles, ListItemIcon, Theme, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { Settings, Close } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import { Alert, Progress } from 'AppComponents/Shared';
import GeneralEdit from './PolicyForm/GeneralEdit';
import { PolicySpec, ApiPolicy, AttachedPolicy, Policy } from './Types';
import ApiOperationContext, { useApiOperationContext } from "./ApiOperationContext";

const useStyles = makeStyles((theme: Theme) => ({
    drawerPaper: {
        backgroundColor: 'white',
        width: '30%',
    },
    actionsBox: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
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
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    allPolicies: PolicySpec[] | null;
}

/**
 * Renders the policy configuration edit drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyConfigurationEditDrawer: FC<PolicyConfigurationEditDrawerProps> = ({
    policyObj, currentFlow, target, verb, setCurrentPolicyList, allPolicies, drawerOpen, setDrawerOpen
}) => {
    const classes = useStyles();
    const { apiOperations } = useContext<any>(ApiOperationContext);
    const [policySpec, setPolicySpec] = useState<PolicySpec>();

    useEffect(() => {
        if (policyObj) {
            setPolicySpec(allPolicies?.find((policy: PolicySpec) => policy.id === policyObj.id));
            setDrawerOpen(true);
        }
    }, [policyObj]);

    const operationInAction = apiOperations.find((op: any) =>
        op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
    const operationFlowPolicy =
        operationInAction.operationPolicies[currentFlow].find((p: any) => p.uuid === policyObj?.uniqueKey);

    const apiPolicy: ApiPolicy = operationFlowPolicy || {
        policyName: policyObj?.name,
        policyId: policyObj?.id,
        parameters: {}
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    }

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
                        <ListItemText primary={(
                            <Typography variant='subtitle2'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyConfigurationEditDrawer.title'
                                    defaultMessage='Configure {policy} Policy'
                                    values={{ policy: policyObj?.displayName }}
                                />
                            </Typography>
                        )}
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
                    <GeneralEdit
                        policyObj={policyObj}
                        currentFlow={currentFlow}
                        target={target}
                        verb={verb}
                        policySpec={policySpec}
                        apiPolicy={apiPolicy}
                        handleDrawerClose={handleDrawerClose}
                    />
                )}
            </Box>
        </Drawer>
    );
}

export default PolicyConfigurationEditDrawer;
