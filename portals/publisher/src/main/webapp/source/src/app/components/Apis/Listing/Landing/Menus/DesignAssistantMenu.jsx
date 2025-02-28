/* eslint-disable */
/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import { Box, Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { app } from 'Settings';
import { isRestricted } from 'AppData/AuthManager';
import { styled } from '@mui/material/styles';

const PREFIX = 'DesignAssistantMenu';

const classes = {
    root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`&`]: {
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        border: '1px solid #e5e5e5',
        backgroundColor: '#fff',
        padding: theme.spacing(3),
        borderRadius: theme.spacing(1),
    },
}));

const DesignAssistantMenu = () => {

    return (
        <StyledBox>
            <Box
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                <img
                    alt='API Design Assistant'
                    src={`${app.context}/site/public/images/ai/APIchatassistantImageWithColour.svg`}
                    style={{ width: '90px', height: 'auto' }}
                />
                <Box p={2} border={0} borderRadius={2}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant='h6' sx={{ color: '#1a3c73', textAlign: 'center', mt: 2 }}>
                        Not sure which API to create?<br />
                        We got you!
                    </Typography>
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/apis/design-assistant'
                        sx={{ whiteSpace: 'nowrap', mt: 2 }}
                    >
                        <FormattedMessage
                            id='Apis.Listing.components.TopMenu.create.api.with.ai'
                            defaultMessage='Create API with AI'
                        />
                        <img 
                            alt='API Design Assistant'
                            src={`${app.context}/site/public/images/ai/DesignAssistant.svg`}
                            style={{ marginLeft: 8, width: 15, height: 15 }}
                        />
                    </Button>
                </Box>
            </Box>
        </StyledBox>
    );
};

export default DesignAssistantMenu;
