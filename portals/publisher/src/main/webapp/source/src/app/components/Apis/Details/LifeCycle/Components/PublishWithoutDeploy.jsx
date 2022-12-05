/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { withStyles } from '@mui/styles';
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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { Link as RouterLink } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Alert from 'AppComponents/Shared/Alert';
import Joi from '@hapi/joi';
import Collapse from '@mui/material/Collapse';

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
});

const DialogTitle = withStyles(styles)((props) => {
    const {
        children, classes, onClose, ...other
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

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

/**
 *
 * @returns
 */
export default function PublishWithoutDeploy(props) {
    const {
        classes, api, handleClick, open, handleClose,
    } = props;

    let isExternalEndpointAvailable = false;
    let availableExternalEndpoint = '';
    if (api.advertiseInfo && api.advertiseInfo.apiExternalProductionEndpoint
        && api.advertiseInfo.apiExternalProductionEndpoint.length > 0) {
        isExternalEndpointAvailable = true;
        availableExternalEndpoint = api.advertiseInfo.apiExternalProductionEndpoint;
    } else if (api.advertiseInfo && api.advertiseInfo.apiExternalSandboxEndpoint
        && api.advertiseInfo.apiExternalSandboxEndpoint.length > 0) {
        isExternalEndpointAvailable = true;
        availableExternalEndpoint = api.advertiseInfo.apiExternalSandboxEndpoint;
    }

    const [externalEndpoint, setExternalEndpoint] = useState(availableExternalEndpoint);
    const [isValidExternalEndpoint, setValidExternalEndpoint] = useState(isExternalEndpointAvailable);
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Validate external endpoint
     *
     * @param event
     */
    const handleOnChangeExternalEndpoint = (event) => {
        const { value } = event.target;
        setExternalEndpoint(value);
        const urlSchema = Joi.string().uri().empty();
        setValidExternalEndpoint(!urlSchema.validate(value).error);
    };

    const handlePublishClick = () => {
        if (externalEndpoint && externalEndpoint.length > 0) {
            const updatedAPI = {
                id: api.id,
                name: api.name,
                description: api.description,
                lifeCycleStatus: api.lifeCycleStatus,
                accessControl: api.accessControl,
                authorizationHeader: api.authorizationHeader,
                responseCachingEnabled: api.responseCachingEnabled,
                cacheTimeout: api.cacheTimeout,
                visibility: api.visibility,
                isDefaultVersion: api.isDefaultVersion,
                enableSchemaValidation: api.enableSchemaValidation,
                accessControlRoles: [...api.accessControlRoles],
                visibleRoles: [...api.visibleRoles],
                tags: [...api.tags],
                maxTps: api.maxTps,
                transport: [...api.transport],
                wsdlUrl: api.wsdlUrl,
                securityScheme: [...api.securityScheme],
                categories: [...api.categories],
                corsConfiguration: {
                    corsConfigurationEnabled: api.corsConfiguration.corsConfigurationEnabled,
                    accessControlAllowCredentials: api.corsConfiguration.accessControlAllowCredentials,
                    accessControlAllowOrigins: [...api.corsConfiguration.accessControlAllowOrigins],
                    accessControlAllowHeaders: [...api.corsConfiguration.accessControlAllowHeaders],
                    accessControlAllowMethods: [...api.corsConfiguration.accessControlAllowMethods],
                },
                additionalProperties: [...api.additionalProperties],
                type: api.type,
                advertiseInfo: {
                    advertised: true,
                    apiExternalProductionEndpoint: externalEndpoint,
                    apiExternalSandboxEndpoint: externalEndpoint,
                    originalDevPortalUrl: api.advertiseInfo.originalDevPortalUrl,
                    apiOwner: api.advertiseInfo.apiOwner,
                    vendor: api.advertiseInfo.vendor,
                },
            };
            const promisedUpdate = api.update(updatedAPI);
            promisedUpdate
                .then(() => {
                    Alert.info('API updated successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        const message = 'Something went wrong while updating the API';
                        Alert.error(message);
                    }
                    console.error(error);
                })
                .finally(() => {
                    handleClick();
                });
        }
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby='publish-api-confirmation' open={open}>
            <DialogTitle id='itest-publish-confirmation' onClose={handleClose}>
                <FormattedMessage
                    id='Apis.Details.LifeCycle.components.confirm.publish.title'
                    defaultMessage='Publish API without deployments'
                />
            </DialogTitle>
            <Divider light />
            <DialogContent>
                <Box my={1}>
                    <DialogContentText id='itest-confirm-publish-text'>
                        <Typography variant='subtitle1' display='block' gutterBottom>
                            <FormattedMessage
                                id='Apis.Details.LifeCycle.components.confirm.publish.message'
                                defaultMessage='The API will not be available for consumption unless it is deployed.'
                            />
                        </Typography>
                    </DialogContentText>
                </Box>
                <Collapse in={isExpanded}>
                    <Box>
                        <Box my={1}>
                            <DialogContentText id='itest-confirm-publish-text'>
                                <Typography variant='body1' display='block' gutterBottom>
                                    <FormattedMessage
                                        // eslint-disable-next-line max-len
                                        id='Apis.Details.LifeCycle.components.confirm.publish.message.advertise.only'
                                        // eslint-disable-next-line max-len
                                        defaultMessage={'If you want to publish as a third party API, please provide '
                                        + 'the external endpoint and press "Publish".'}
                                    />
                                </Typography>
                            </DialogContentText>
                        </Box>
                        <Box my={1}>
                            <TextField
                                fullWidth
                                id='itest-id-api-external-endpoint-input'
                                label={(
                                    <>
                                        <FormattedMessage
                                            id='Apis.Details.LifeCycle.components.externalEndpoint'
                                            defaultMessage='External Endpoint'
                                        />
                                        <sup className={classes.mandatoryStar}>*</sup>
                                    </>
                                )}
                                name='externalEndpoint'
                                value={externalEndpoint}
                                onChange={handleOnChangeExternalEndpoint}
                                helperText={!isValidExternalEndpoint && (
                                    <FormattedMessage
                                        id='Apis.Details.LifeCycle.externalEndpoint.error'
                                        defaultMessage='Invalid Endpoint URL'
                                    />
                                )}
                                error={!isValidExternalEndpoint}
                                margin='normal'
                                variant='outlined'
                            />
                        </Box>
                    </Box>
                </Collapse>
            </DialogContent>
            <DialogActions>
                {!isExpanded && (
                    <Button
                        color='primary'
                        onClick={() => setIsExpanded(!isExpanded)}
                        endIcon={<ArrowDropDownIcon />}
                    >
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.PublishWithoutDeploy.see.more'
                            defaultMessage='See more'
                        />
                    </Button>
                )}
                {isExpanded && (
                    <>
                        <Button
                            color='primary'
                            onClick={() => setIsExpanded(!isExpanded)}
                            endIcon={<ArrowDropUpIcon />}
                        >
                            <FormattedMessage
                                id='Apis.Details.LifeCycle.PublishWithoutDeploy.see.less'
                                defaultMessage='See less'
                            />
                        </Button>
                        <Button
                            variant='contained'
                            color='primary'
                            disabled={!isValidExternalEndpoint}
                            onClick={handlePublishClick}
                        >
                            <FormattedMessage
                                id='Apis.Details.LifeCycle.PublishWithoutDeploy.advertise'
                                defaultMessage='Publish'
                            />
                        </Button>
                    </>
                )}
                <Button
                    variant='contained'
                    color='primary'
                    component={RouterLink}
                    to={'/apis/' + api.id + '/deployments'}
                    id='deployments-btn'
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
        </Dialog>
    );
}
