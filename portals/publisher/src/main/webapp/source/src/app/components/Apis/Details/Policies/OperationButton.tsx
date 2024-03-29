/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { FC } from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { Theme } from '@mui/material';

interface OperationButtonProps {
    verb: string;
}

const getStyles = (verb: string) => {
}

const OperationButton: FC<OperationButtonProps> = ({ verb }) => {
    const theme:any = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[verb];
    return (
        <Button
            disableFocusRipple
            variant='contained'
            aria-label={'HTTP verb ' + verb}
            size='small'
            sx={{
                backgroundColor,
                width: theme.spacing(12),
                color: theme.palette.getContrastText(backgroundColor),
            }}
        >
            {verb}
        </Button>
    );
};

export default OperationButton;
