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

import React, { forwardRef } from 'react';
import {
    Box,
    InputBase,
} from '@mui/material';
import clsx from 'clsx';
import useTextFieldStyles from './TextInput.styles';

const TextInput = (
    props,
    ref,
) => {
    const classes = useTextFieldStyles(props);
    const {
        label,
        width,
        readOnly,
        error,
        helperText,
        rows,
        multiline,
        optional,
        loading,
        tooltip,
        inputTooltip,
        size = 'medium',
        info,
        actions,
        testId,
        variant = 'default',
        rounded = false,
        resizeIndicator = true,
        ...rest
    } = props;

    return (
        <Box width={width}>
            <Box className={classes.inputGroup}>
                <InputBase
                    ref={ref}
                    classes={{
                        root: clsx({
                            [classes.root]: true,
                            [classes.rootSmall]: size === 'small',
                            [classes.rootLarge]: size === 'large',
                            [classes.readOnlyDefault]: readOnly && variant === 'default',
                            [classes.readOnlyPlain]: readOnly && variant === 'plain',
                            [classes.multiline]: multiline,
                            [classes.multilineReadonly]: multiline && readOnly,
                            [classes.multilineResizeIndicator]:
                    multiline && !resizeIndicator,
                            [classes.rounded]: rounded,
                        }),
                        focused: classes.focused,
                        error: classes.error,
                        inputMultiline: classes.textarea,
                        input: clsx({
                            [classes.textInput]: true,
                            [classes.textInputLarge]: size === 'large',
                        }),
                        disabled: classes.textInputDisabled,
                        adornedEnd: clsx({
                            [classes.inputAdornedEnd]: true,
                            [classes.inputAdornedEndAlignTop]: multiline,
                        }),
                    }}
                    readOnly={readOnly}
                    {...rest}
                    error={error}
                    rows={rows}
                    multiline={multiline}
                    data-cyid={testId}
                />
            </Box>
        </Box>
    );
};

export default forwardRef(TextInput);
