/*
 * Copyright (c) 2025, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import * as React from 'react';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

/**
 * Renders a Permission list
 * @class Environments
 * @extends {React.Component}
 */
export default function SimplePopper(props) {
    const {
        type,
        roles,
    } = props;

    let msg = '';
    if (type === 'PUBLIC') {
        msg = 'No Visibility Restrictions!';
    } else if (type === 'ALLOW') {
        msg = 'Allowed for : ' + roles.toString();
    } else {
        msg = 'Denied for : ' + roles.toString();
    }

    const displayType = type === 'ALLOW' || type === 'DENY' ? 'RESTRICTED' : type;

    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const openPopover = Boolean(anchorEl);

    return (
        <div>
            <Chip
                size='small'
                label={displayType}
                sx={{ cursor: 'default' }}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            />
            <Popover
                id='mouse-over-popover'
                sx={{ pointerEvents: 'none' }}
                open={openPopover}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Typography
                    sx={{
                        p: 1,
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid #ccc',
                        maxWidth: '300px',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                    }}
                >
                    {msg}
                </Typography>
            </Popover>
        </div>
    );
}
