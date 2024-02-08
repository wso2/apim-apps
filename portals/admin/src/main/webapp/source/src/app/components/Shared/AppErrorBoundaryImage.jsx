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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React from 'react';
import { useTheme } from '@mui/material';
import Configurations from 'Config';

const AppErrorBoundaryImage = () => {
    const theme = useTheme();
    return (
        <>
            {/* <h1>AppErrorBoundryImage</h1> */}
            <img
                src={Configurations.app.context + theme.custom.logo}
                alt={theme.custom.title}
                style={{ height: theme.custom.logoHeight, width: theme.custom.logoWidth }}
            />
        </>
    );
};

export default AppErrorBoundaryImage;
