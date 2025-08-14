/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import { styled, alpha } from '@mui/material/styles';
import { Button } from '@mui/material';

// Custom styled Button for tab navigation
const TabButton = styled(Button)(({ theme, isActive }) => ({
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: theme.spacing(2),
    height: '100%',
    border: isActive === true ? `1px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.30)',
    borderRadius: '8px',
    backgroundColor: isActive === true ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    color: isActive === true ?
        theme.palette.getContrastText(theme.custom.globalNavBar.active) :
        theme.palette.text.primary,
    boxShadow: isActive === true ?
        `0px 2px 4px ${alpha(theme.palette.primary.main, 0.2)}` :
        'none',
    '&:hover': {
        backgroundColor: isActive === true ?
            alpha(theme.palette.primary.main, 0.12) :
            theme.palette.grey[200],
        borderColor: isActive === true ?
            theme.palette.primary.main :
            'rgba(0, 0, 0, 0.30)',
    },
}));

export default TabButton;
