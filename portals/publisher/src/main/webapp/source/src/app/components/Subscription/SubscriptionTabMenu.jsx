/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useHistory, useLocation } from 'react-router-dom';
import SubscriptionCreation from './SubscriptionCreation/SubscriptionCreation.jsx';
import SubscriptionUpdate from './SubscriptionUpdate/SubscriptionUpdate.jsx';

const PREFIX = 'SubscriptionTabMenu';

const classes = {
    SubscriptionTabMenu: `${PREFIX}-SubscriptionTabMenu`,
    tabIcon: `${PREFIX}-tabIcon`,
    headingText: `${PREFIX}-headingText`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.SubscriptionTabMenu}`]: {
        backgroundColor: theme.palette.background.default,
        width: '100%',
    },
}));

/**
 * Tab Menu for Subscription tasks page
 */
export default function SubscriptionTabMenu() {
    const history = useHistory();
    const location = useLocation();
    
    // Set initial tab based on the URL path
    const initialTab = location.pathname.includes('update') ? 'update' : 'creation';
    const [currentTab, setCurrentTab] = useState(initialTab); 

    // Update current tab when location changes
    useEffect(() => {
        const newTab = location.pathname.includes('update') ? 'update' : 'creation';
        setCurrentTab(newTab);
    }, [location.pathname]);

    // Handler for tab change
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        // Update the URL path when tab is changed
        history.push(`/subscription/${newValue}`);
    };

    return (
        <StyledBox className={classes.SubscriptionTabMenu}>
            <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                indicatorColor='primary' 
                textColor='primary'
                sx={{ paddingLeft: 1 }}
            >
                <Tab
                    label='Subscription Creation'
                    value='creation'
                    icon={<CustomIcon className={classes.tabIcon} icon={<AddTaskIcon />} />}
                />
                <Tab
                    label='Subscription Update'
                    value='update'
                    icon={<CustomIcon className={classes.tabIcon} icon={<AddTaskIcon />} />}
                />
            </Tabs>
            {currentTab === 'creation' && <SubscriptionCreation />}
            {currentTab === 'update' && <SubscriptionUpdate />}
        </StyledBox>
    );
}
