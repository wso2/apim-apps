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

import React, { FC, useEffect, useState } from 'react';
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
import { Progress } from 'AppComponents/Shared';
import General from './General';
import { PolicySpec, GlobalPolicy, Policy } from '../Types';

const PREFIX = 'PolicyConfiguringDrawer';

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
 * Renders the policy configuring drawer. (Right drawer for adding a policy)
 * @param {JSON} props - Input props from parent components.
 * @returns {TSX} - Right drawer for policy configuration.
 */
const PolicyConfiguringDrawer: FC<PolicyConfiguringDrawerProps> = ({
    policyObj,
    setDroppedPolicy,
    currentFlow,
    target,
    verb,
    allPolicies, 
}) => {

    const [drawerOpen, setDrawerOpen] = useState(!!policyObj);
    const [policySpec, setPolicySpec] = useState<PolicySpec>();

    useEffect(() => {
        /**
         * Find the right policy spec (attributes + etc) using the policy Object ID.
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

    if (!policySpec) {
        return <Progress />;
    }

    const globalPolicy: GlobalPolicy = {
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
     * Converts the PolicyObj prop of type Policy to AttachedPolicy.
     * @returns {AttachedPolicy} - Returns a policy object of type AttachedPolicy.
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
                                        id='Global.Details.Policies.PolicyConfiguringDrawer.title'
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
                <General
                    policyObj={getPolicyOfTypeAttachedPolicy()}
                    setDroppedPolicy={setDroppedPolicy}
                    currentFlow={currentFlow}
                    target={target}
                    verb={verb}
                    policySpec={policySpec}
                    globalPolicy={globalPolicy}
                    handleDrawerClose={handleDrawerClose}
                    isEditMode={false}
                />
            </Box>
        </StyledDrawer>
    );
};

export default PolicyConfiguringDrawer;
