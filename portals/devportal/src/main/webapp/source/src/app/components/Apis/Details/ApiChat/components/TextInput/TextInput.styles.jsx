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

import { alpha } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export const useTextFieldStyles = makeStyles((theme) => ({
    root: {
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
    rootSmall: {
        minHeight: theme.spacing(4),
    },
    rootLarge: {
        minHeight: theme.spacing(7),
        borderRadius: 12,
        padding: theme.spacing(1, 1, 1, 3),
    },
    textInput: (props) => ({
        minHeight: theme.spacing(2.5),
        padding: theme.spacing(0.125, 0),
        fontSize: theme.typography[props.typography || 'body1'].fontSize,
        fontWeight: theme.typography[props.typography || 'body1'].fontWeight,
        lineHeight: theme.typography[props.typography || 'body1'].lineHeight,
    }),
    textInputLarge: (props) => ({
        fontSize: theme.typography[props.typography || 'overline'].fontSize,
        fontWeight: theme.typography[props.typography || 'overline'].fontWeight,
        lineHeight: theme.typography[props.typography || 'overline'].lineHeight,
    }),
    textInputDisabled: {
        '&:hover': {
            borderColor: theme.palette.grey[100],
        },
    },
    inputAdornedEnd: {
        '& .MuiInputAdornment-root': {
            marginRight: theme.spacing(-1),
        },
    },
    inputAdornedEndAlignTop: {
        '& .MuiInputAdornment-root': {
            alignSelf: 'flex-end',
            height: 'auto',
            marginBottom: theme.spacing(0.25),
        },
    },
    multiline: {},
    multilineReadonly: {},
    multilineResizeIndicator: {},
    rounded: {
        borderRadius: theme.spacing(2.5),
    },
    focused: {
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
    error: {
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
    readOnlyDefault: {
        boxShadow: `0 0 0 1px ${alpha(
            theme.palette.common.black,
            0.05,
        )}, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.05)}`,
        border: 'none',
        backgroundColor: theme.palette.secondary.light,
    },
    readOnlyPlain: {
        boxShadow: 'none',
        border: 'none',
        backgroundColor: theme.palette.common.white,
        paddingLeft: 0,
        paddingRight: 0,
    },
    formLabel: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing(0.5),
    },
    formLabelAction: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
    },
    formLabelInfo: {
        marginLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
    formOptional: {
        color: theme.palette.grey[200],
        fontSize: theme.spacing(1.4),
        marginLeft: theme.spacing(1),
    },
    formLabelTooltip: {
        marginLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
    inputGroup: {
        position: 'relative',
    },
    tooltipIcon: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.secondary.main,
        cursor: 'help',
        fontSize: theme.spacing(1.75),
    },
    textarea: {
        resize: 'both',
    },
    copyToClipboardInput: {
        backgroundColor: theme.palette.secondary.light,
        border: `1px solid ${theme.palette.grey[100]}`,
        boxShadow: 'none',
        paddingRight: theme.spacing(5),
    },
    textInputInfoIcon: {
        display: 'flex',
        alignItems: 'center',
        fontSize: theme.spacing(1.75),
    },
}));

export default useTextFieldStyles;
