/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import Divider from '@mui/material/Divider';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import LeftMenuItem from 'AppComponents/Shared/LeftMenuItem';
import Typography from '@mui/material/Typography';

const PREFIX = 'LeftMenu';

const classes = {
    LeftMenu: `${PREFIX}-LeftMenu`,
    leftLInkMain: `${PREFIX}-leftLInkMain`,
    content: `${PREFIX}-content`,
    contentInside: `${PREFIX}-contentInside`,
    footeremaillink: `${PREFIX}-footeremaillink`,
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    expanded: `${PREFIX}-expanded`,
    leftLInkText: `${PREFIX}-leftLInkText`,
    expandIconColor: `${PREFIX}-expandIconColor`,
    headingText: `${PREFIX}-headingText`,
    customIcon: `${PREFIX}-customIcon`
};

const StyledBox = styled(Box)((
    {
        theme
    }
) => ({
    
    [`& .${classes.LeftMenu}`]: {
        backgroundColor: theme.palette.background.leftMenu,
        width: theme.custom.leftMenuWidth,
        minHeight: `calc(100vh - ${64 + theme.custom.footer.height}px)`,
    },
    
    [`& .${classes.headingText}`]: {
        marginTop: '10px',
        marginBottom: '10px',
        fontWeight: 800,
        color: '#ffffff',
        textAlign: 'left',
        marginLeft: '8px',
    },
    [`& .${classes.customIcon}`]: {
        marginTop: (theme.custom.apis.topMenu.height - theme.custom.leftMenuIconMainSize) / 2,
    }

}));

/**
 * Left Menu of the Approval tasks page
 */
export default function LeftMenu() {

    return (
        <StyledBox className={classes.LeftMenu}>
            <nav name='secondaryNavigation' aria-label='secondary navigation'>
                <Link aria-label='ALL APIs'>
                    <div className={classes.leftLInkMain}>
                        <CustomIcon
                            className={classes.customIcon}
                            icon={<AddTaskIcon/>}
                        />
                    </div>
                </Link>
                <Typography className={classes.headingText}>
                    Subscription
                </Typography>
                <Divider/>
                <LeftMenuItem
                    text='creation'
                    route='/subscription/creation'
                    to='/subscription/creation'
                    id='left-menu-itemDesignConfigurations'
                    Icon={<AddTaskIcon/>}
                />
                <Divider/>
                <LeftMenuItem
                    text='update'
                    route='/subscription/update'
                    to='/subscription/update'
                    id='left-menu-itemDesignConfigurations'
                    Icon={<UpgradeIcon/>}
                />
                <Divider/>
            </nav>
        </StyledBox>
    );

}
