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

import React, { FC, useEffect, useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
    Drawer,
    ListItemIcon,
    Theme,
    Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Settings, Close } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import General from './General';
import type { PolicySpec, GlobalPolicy, AttachedPolicy } from '../Types';
import GlobalPolicyContext from '../GlobalPolicyContext';

const PREFIX = 'PolicyConfigurationEditDrawer';

const classes = {
    drawerPaper: `${PREFIX}-drawerPaper`,
    iconSize: `${PREFIX}-iconSize`
};

const StyledDrawer = styled(Drawer)(({ theme }: { theme: Theme }) => ({
    [`& .${classes.drawerPaper}`]: {
        backgroundColor: 'white',
        width: '30%',
    },

    [`& .${classes.iconSize}`]: {
        height: '1.2em',
        width: '1.2em',
        color: theme.palette.grey[700],
    }
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
 * Renders the policy configuration edit drawer. (Right drawer for editing an added policy).
 * @param {JSON} props - Input props from parent components.
 * @returns {TSX} - Right drawer for policy configuration.
 */
const PolicyConfigurationEditDrawer: FC<PolicyConfigurationEditDrawerProps> = ({
    policyObj,
    currentFlow,
    target,
    verb,
    allPolicies,
    drawerOpen,
    setDrawerOpen,
}) => {

    const { globalLevelPolicies } = useContext<any>(GlobalPolicyContext);
    const [policySpec, setPolicySpec] = useState<PolicySpec>();

    useEffect(() => {
        /**
         * Find the right policy spec (attributes + etc) using the policy Object ID.
         * If the policy is already deleted from common policies, it will not be found in Policy Section.
         */
        if (policyObj) {
            setPolicySpec(
                allPolicies?.find(
                    (policy: PolicySpec) => policy.id === policyObj.id,
                ),
            );
            setDrawerOpen(true);
        }
    }, [policyObj]);

    /**
     * Find the editing operation flow policy
     */
    const operationFlowPolicy = (globalLevelPolicies)[
        currentFlow
    ].find((policy: any) => policy.uuid === policyObj?.uniqueKey);

    const globalPolicy: GlobalPolicy = operationFlowPolicy || {
        policyName: policyObj?.name,
        policyId: policyObj?.id,
        policyVersion: policyObj?.version,
        parameters: {},
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    return (
        <StyledDrawer
            anchor='right'
            open={drawerOpen}
            onClose={handleDrawerClose}
            classes={{ paper: classes.drawerPaper }}
            sx={{ zIndex: 1300}}
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
                                        id='Global.Details.Policies.PolicyConfigurationEditDrawer.title'
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
                <Divider />
                {policySpec && (
                    <General
                        policyObj={policyObj}
                        currentFlow={currentFlow}
                        target={target}
                        verb={verb}
                        policySpec={policySpec}
                        globalPolicy={globalPolicy}
                        handleDrawerClose={handleDrawerClose}
                        isEditMode
                    />
                )}
            </Box>
        </StyledDrawer>
    );
};

export default PolicyConfigurationEditDrawer;
