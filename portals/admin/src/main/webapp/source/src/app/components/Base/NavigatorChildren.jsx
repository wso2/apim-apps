/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useEffect } from 'react';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

/**
 * Render a list
 * @param {JSON} props .
 * @returns {JSX} Header AppBar components.
 */
function NavigatorChildren(props) {
    const { settings, isSuperTenant, user: { _scopes } } = useAppContext();
    const isSuperAdmin = isSuperTenant && _scopes.includes('apim:admin_settings');
    const istransactionCounterEnabled = settings.transactionCounterEnable;
    const [open, setOpen] = React.useState(true);
    const { navChildren, navText, classes } = props;
    const handleClick = () => {
        setOpen(!open);
    };

    const [navigationChildren, setNavigationChildren] = React.useState(navChildren); // Corrected useState syntax

    useEffect(() => {
        let filteredNavChildren = [...navChildren]; // Start with the original array
        if (isSuperTenant) {
            filteredNavChildren = filteredNavChildren.filter((menu) => menu.id !== 'Tenant Theme');
        }
        if (!isSuperTenant) {
            filteredNavChildren = filteredNavChildren.filter((menu) => menu.id !== 'Custom Policies');
        }
        if (!isSuperAdmin || !istransactionCounterEnabled) {
            filteredNavChildren = filteredNavChildren.filter((menu) => menu.id !== 'Usage Report');
        }
        setNavigationChildren(filteredNavChildren); // Set the filtered array once
    }, [isSuperTenant, isSuperAdmin, navChildren]);

    return (
        <>
            <ListItem className={classes.categoryHeader} button onClick={handleClick}>
                <ListItemText
                    classes={{
                        primary: classes.categoryHeaderPrimary,
                    }}
                >
                    {navText}
                </ListItemText>
                {open ? <ExpandLess /> : <ExpandMore />}

            </ListItem>
            <Collapse in={open} timeout='auto' unmountOnExit>
                {navigationChildren && navigationChildren.map(({
                    id: childId, displayText, icon, path, active,
                }) => (
                    <Link
                        component={RouterLink}
                        to={path || '/'}
                        style={{ textDecoration: 'none' }}
                        data-testid={childId + '-child-link'}
                        key={childId}
                        underline='hover'
                    >
                        <ListItem
                            key={childId}
                            button
                            className={clsx(classes.item, active && classes.itemActiveItem)}
                        >
                            <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>
                            <ListItemText
                                classes={{
                                    primary: classes.itemPrimary,
                                }}
                            >
                                {displayText}
                            </ListItemText>
                        </ListItem>
                    </Link>
                ))}
            </Collapse>
            <Divider className={classes.divider} />
        </>
    );
}

Navigator.NavigatorChildren = {
    classes: PropTypes.shape({}).isRequired,
    navChildren: PropTypes.arrayOf(JSON).isRequired,
    navId: PropTypes.number.isRequired,
    navText: PropTypes.string.isRequired,
};

export default NavigatorChildren;
