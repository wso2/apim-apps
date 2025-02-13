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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import SubscriptionTabMenu from './SubscriptionTabMenu.jsx';


const PREFIX = 'subscription';

const classes = {
    mainTitle: `${PREFIX}-mainTitle`,
};

const StyledBox = styled(Box)(() => ({
    [`& .${classes.mainTitle}`]: {
        paddingTop: 15,
        paddingLeft: 25,
    }
}));

const Subscription = () => {
    return (
        <StyledBox>
            <Typography variant='h4' className={classes.mainTitle}>
                <FormattedMessage
                    id='Task.title'
                    defaultMessage='Tasks'
                />
            </Typography>
            <SubscriptionTabMenu />
        </StyledBox>
    );
};

export default Subscription;
