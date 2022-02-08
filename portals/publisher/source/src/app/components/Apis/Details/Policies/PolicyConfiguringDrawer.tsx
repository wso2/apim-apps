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

import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Drawer, makeStyles, ListItemIcon } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { Settings, Close } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import General from './PolicyForm/General';
import { Policy } from './Types';

const useStyles = makeStyles(() => ({
    drawerPaper: {
        backgroundColor: 'white',
    },
    actionsBox: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
    },
}));

interface PolicyConfiguringDrawerProps {
    policyObj: Policy;
    drawerOpen: boolean;
    toggleDrawer: Function;

}

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyConfiguringDrawer: FC<PolicyConfiguringDrawerProps> = ({
    policyObj, drawerOpen, toggleDrawer
}) => {
    const classes = useStyles();
    // eslint-disable-next-line no-console
    console.log(policyObj);
    return (
        <Drawer
            anchor='right'
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            classes={{ paper: classes.drawerPaper }}
        >
            <Box role='presentation'>
                <List>
                    <ListItem key='policy-config'>
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary='Configure' />
                        <ListItemIcon>
                            <IconButton onClick={toggleDrawer(false)}>
                                <Close />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>
                </List>
                <Divider />
                <General />
            </Box>
        </Drawer>
    );
}

export default PolicyConfiguringDrawer;