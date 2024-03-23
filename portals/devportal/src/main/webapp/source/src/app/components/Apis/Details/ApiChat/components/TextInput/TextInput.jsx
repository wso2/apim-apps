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
import { styled, alpha } from '@mui/material/styles';

const PREFIX = 'TextInput';

const classes = {
    root: `${PREFIX}-root`,
    rootSmall: `${PREFIX}-rootSmall`,
    rootLarge: `${PREFIX}-rootLarge`,
    readOnlyDefault: `${PREFIX}-readOnlyDefault`,
    readOnlyPlain: `${PREFIX}-readOnlyPlain`,
    multiline: `${PREFIX}-multiline`,
    multilineReadonly: `${PREFIX}-multilineReadonly`,
    multilineResizeIndicator: `${PREFIX}-multilineResizeIndicator`,
    rounded: `${PREFIX}-rounded`,
    focused: `${PREFIX}-focused`,
    error: `${PREFIX}-error`,
    textInput: `${PREFIX}-textInput`,
    textInputLarge: `${PREFIX}-textInputLarge`,
    textInputDisabled: `${PREFIX}-textInputDisabled`,
    inputAdornedEnd: `${PREFIX}-inputAdornedEnd`,
    inputAdornedEndAlignTop: `${PREFIX}-inputAdornedEndAlignTop`,
    textarea: `${PREFIX}-textarea`,
    inputGroup: `${PREFIX}-inputGroup`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(1.5, 1.5),
        width: '100%',
        minHeight: theme.spacing(5),
        backgroundColor: theme.palette.common.white,
        border: `1px solid ${theme.palette.grey[100]}`,
        boxShadow: `0 1px 2px -1px ${alpha(
            theme.palette.common.black,
            0.08,
        )}, 0 -3px 9px 0 ${alpha(theme.palette.common.black, 0.04)} inset`,
        borderRadius: 5,
        '&$multiline': {
            height: 'auto',
            resize: 'auto',
        },
        '&$multilineReadonly': {
            height: 'auto',
            resize: 'none',
            '& $textarea': {
                height: 'auto',
                resize: 'none',
            },
        },
        '&$multilineResizeIndicator': {
            height: 'auto',
            resize: 'none',
            '& $textarea': {
                height: 'auto',
                resize: 'none',
            },
        },
        '&$rounded': {
            paddingLeft: theme.spacing(2),
        },
        '&:hover': {
            borderColor: theme.palette.grey[100],
        },
    },
    [`& .${classes.rootSmall}`]: {
        minHeight: theme.spacing(4),
    },
    [`& .${classes.rootLarge}`]: {
        minHeight: theme.spacing(7),
        borderRadius: 12,
        padding: theme.spacing(1, 1, 1, 3),
    },
    [`& .${classes.readOnlyDefault}`]: {
        boxShadow: `0 0 0 1px ${alpha(
            theme.palette.common.black,
            0.05,
        )}, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.05)}`,
        border: 'none',
        backgroundColor: theme.palette.secondary.light,
    },
    [`& .${classes.readOnlyPlain}`]: {
        boxShadow: 'none',
        border: 'none',
        backgroundColor: theme.palette.common.white,
        paddingLeft: 0,
        paddingRight: 0,
    },
    [`& .${classes.multiline}`]: {
    },
    [`& .${classes.multilineReadonly}`]: {
    },
    [`& .${classes.multilineResizeIndicator}`]: {
    },
    [`& .${classes.rounded}`]: {
        borderRadius: theme.spacing(2.5),
    },
    [`& .${classes.focused}`]: {
        borderColor: theme.palette.primary.light,
        borderWidth: 1,
        boxShadow: `0 -3px 9px 0 ${alpha(
            theme.palette.common.black,
            0.04,
        )} inset, 0 0 0 2px ${theme.palette.grey[100]}`,
        '&:hover': {
            borderColor: theme.palette.primary.light,
        },
    },
    [`& .${classes.error}`]: {
        background: theme.palette.error.light,
        borderColor: theme.palette.error.main,
        boxShadow: `0 0 0 1px ${theme.palette.error.light}, inset 0 2px 2px ${alpha(
            theme.palette.error.light,
            0.07,
        )}`,
        '&:hover': {
            borderColor: theme.palette.error.main,
        },
    },
    [`& .${classes.textInput}`]: {
        minHeight: theme.spacing(2.5),
        padding: theme.spacing(0.125, 0),
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.typography.body1.fontWeight,
        lineHeight: theme.typography.body1.lineHeight,
    },
    [`& .${classes.textInputLarge}`]: {
        fontSize: theme.typography.overline.fontSize,
        fontWeight: theme.typography.overline.fontWeight,
        lineHeight: theme.typography.overline.lineHeight,
    },
    [`& .${classes.textInputDisabled}`]: {
        '&:hover': {
            borderColor: theme.palette.grey[100],
        },
    },
    [`& .${classes.inputAdornedEnd}`]: {
        '& .MuiInputAdornment-root': {
            marginRight: theme.spacing(-1),
        },
    },
    [`& .${classes.inputAdornedEndAlignTop}`]: {
        '& .MuiInputAdornment-root': {
            alignSelf: 'flex-end',
            height: 'auto',
            marginBottom: theme.spacing(0.25),
        },
    },
    [`& .${classes.textarea}`]: {
        resize: 'both',
    },
    [`& .${classes.inputGroup}`]: {
        position: 'relative',
    },
}));

const TextInput = (
    props,
    ref,
) => {
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
        <Root>
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
        </Root>
    );
};

export default forwardRef(TextInput);
