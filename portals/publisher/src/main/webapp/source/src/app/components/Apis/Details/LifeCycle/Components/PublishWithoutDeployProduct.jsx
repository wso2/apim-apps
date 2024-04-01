/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import LinkIcon from '@mui/icons-material/Link';
import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { Link as RouterLink } from 'react-router-dom';

const PREFIX = 'PublishWithoutDeployProduct';

const classes = {
    root: `${PREFIX}-root`,
    root2: `${PREFIX}-root2`,
    root3: `${PREFIX}-root3`,
    closeButton: `${PREFIX}-closeButton`
};

const StyledDialog = styled(Dialog)((
    {
        theme
    }
) => ({
    [`& .${classes.root3}`]: {
        margin: 0,
        padding: theme.spacing(2),
    },

    [`& .${classes.closeButton}`]: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    }
}));

const DialogTitle = ((props) => {
    const {
        children, onClose, ...other
    } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant='h6'>{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label='close'
                    className={classes.closeButton}
                    onClick={onClose}
                    size='large'>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = MuiDialogContent;

const DialogActions = MuiDialogActions;

/**
 *
 * @returns
 */
export default function PublishWithoutDeployProduct(props) {
    const {
        api, open, handleClose,
    } = props;

    return (
        <StyledDialog onClose={handleClose} aria-labelledby='publish-api-confirmation' open={open} fullWidth 
            maxWidth='md'>
            <DialogTitle id='itest-publish-confirmation' onClose={handleClose}>
                <FormattedMessage
                    id='Apis.Details.LifeCycle.components.confirm.publish.apiProducts.title'
                    defaultMessage='Deploy API product before publishing'
                />
            </DialogTitle>
            <Divider />
            <DialogContent
                classes={{
                    root: classes.root
                }}>
                <Box my={1}>
                    <DialogContentText id='itest-confirm-publish-text'>
                        <Typography variant='subtitle1' display='block' gutterBottom>
                            <FormattedMessage
                                id='Apis.Details.LifeCycle.components.confirm.publish.apiProducts.message'
                                defaultMessage='Deploy the API product before publishing the API'
                            />
                        </Typography>
                    </DialogContentText>
                </Box>

            </DialogContent>
            <DialogActions
                classes={{
                    root: classes.root2
                }}>
                <Button
                    variant='contained'
                    color='primary'
                    component={RouterLink}
                    to={'/apis/' + api.id + '/deployments'}
                >
                    <Box fontSize='button.fontSize' alignItems='center' display='flex' fontFamily='fontFamily'>
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.publish.content.info.deployments'
                            defaultMessage='Deployments'
                        />
                        <Box ml={0.5} mt={0.25} display='flex'>
                            <LinkIcon fontSize='small' />
                        </Box>
                    </Box>
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}