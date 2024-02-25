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

import React, { useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import { Box, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface ConfigureKeyDrawerProps {
    isDrawerOpen: boolean;
    updateDrawerOpen: (isOpen: boolean) => void;
}

const ConfigureKeyDrawer: React.FC<ConfigureKeyDrawerProps> = ({
    isDrawerOpen,
    updateDrawerOpen,
}) => {
    useEffect(() => {
        updateDrawerOpen(isDrawerOpen);
    }, [isDrawerOpen]);

    const handleDrawerClose = () => {
        updateDrawerOpen(false);
    };

    return (
        <Drawer
            title='Configure Key'
            anchor='right'
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            id='api-chat-configure-key-drawer'
            PaperProps={{
                sx: { width: '30%', borderRadius: 1 },
            }}
        >
            <Box p={2}>
                <Typography variant='h6'>
                    <FormattedMessage
                        id='Apis.Details.ApiChat.components.ConfigureKeyDrawer.title'
                        defaultMessage='Configure Key'
                    />
                </Typography>
            </Box>
        </Drawer>
    );
};

export default ConfigureKeyDrawer;
