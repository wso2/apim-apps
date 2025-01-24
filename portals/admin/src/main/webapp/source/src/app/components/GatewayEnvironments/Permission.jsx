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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';

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
    const [anchorEl, setAnchorEl] = React.useState(null);

    let msg = roles.toString();
    if (type === 'PUBLIC') {
        msg = 'No Visibility Restrictions!';
    }

    const handleClick = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;

    return (
        <div>
            <Button aria-describedby={id} type='button' onClick={handleClick}>
                {type}
            </Button>
            <Popper id={id} open={open} anchorEl={anchorEl}>
                <Box sx={{
                    fontFamily: 'sans-serif',
                    border: 'lightgray 1px solid',
                    p: 1,
                    fontSize: '12px',
                    padding: '8px',
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderRadius: '4px',
                }}
                >
                    {msg}
                </Box>
            </Popper>
        </div>
    );
}
