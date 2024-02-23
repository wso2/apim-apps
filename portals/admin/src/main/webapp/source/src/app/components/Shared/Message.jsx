/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { amber, green } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import WarningIcon from '@mui/icons-material/Warning';
const PREFIX = 'Message';

const classes = {
    root: `${PREFIX}-root`,
    success: `${PREFIX}-success`,
    error: `${PREFIX}-error`,
    info: `${PREFIX}-info`,
    warning: `${PREFIX}-warning`,
    icon: `${PREFIX}-icon`,
    iconVariant: `${PREFIX}-iconVariant`,
    message: `${PREFIX}-message`,
};

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
    [`& .${classes.root}`]: {
        position: 'relative' /* Overriding the default Snackbar root properties to stack messages */,
        padding: '5px' /* To add some space between messages when stacking messages */,
    },

    [`& .${classes.success}`]: {
        backgroundColor: green[600],
    },

    [`& .${classes.error}`]: {
        backgroundColor: theme.palette.error.dark,
    },

    [`& .${classes.info}`]: {
        backgroundColor: theme.palette.primary.main,
    },

    [`& .${classes.warning}`]: {
        backgroundColor: amber[700],
    },

    [`& .${classes.icon}`]: {
        fontSize: 20,
    },

    [`& .${classes.iconVariant}`]: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },

    [`& .${classes.message}`]: {
        display: 'flex',
        alignItems: 'center',
    },
}));

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};
function MySnackbarContentWrapper(props) {
    const {
        className, message, onClose, variant, ...other
    } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={clsx(classes[variant], className)}
            aria-describedby='client-snackbar'
            message={(
                <span id='client-snackbar' className={classes.message}>
                    <Icon className={clsx(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            )}
            action={[
                <IconButton
                    key='close'
                    aria-label='close'
                    color='inherit'
                    onClick={onClose}
                    size='large'
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
}

MySnackbarContentWrapper.propTypes = {
    className: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired,
};

export default function Message(props) {
    const { message, handleClose, type } = props;
    return (
        <StyledSnackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open
            classes={{ root: classes.root }}
            onClose={handleClose}
        >
            <MySnackbarContentWrapper onClose={handleClose} variant={type} message={message} />
        </StyledSnackbar>
    );
}
Message.propTypes = {
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    handleClose: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
};
