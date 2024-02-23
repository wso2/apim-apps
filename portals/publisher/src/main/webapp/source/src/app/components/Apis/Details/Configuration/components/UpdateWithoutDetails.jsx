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

import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import API from 'AppData/api';
import Joi from '@hapi/joi';

/**
 *
 * @returns
 */
export default function UpdateWithoutDetails(props) {
    const {
        classes,
        api,
        apiConfig: {
            endpointConfig,
            policies,
        },
        handleClick,
        open,
        handleClose,
    } = props;

    let availableEndpoint = '';
    let endpointType = 'PRODUCTION';
    if (endpointConfig) {
        if (endpointConfig.production_endpoints) {
            availableEndpoint = endpointConfig.production_endpoints.url;
            endpointType = 'PRODUCTION';
        } else if (endpointConfig.sandbox_endpoints) {
            availableEndpoint = endpointConfig.sandbox_endpoints.url;
            endpointType = 'SANDBOX';
        }
    } else if (api.advertiseInfo && api.advertiseInfo.apiExternalProductionEndpoint) {
        availableEndpoint = api.advertiseInfo.apiExternalProductionEndpoint;
        endpointType = 'PRODUCTION';
    } else if (api.advertiseInfo && api.advertiseInfo.apiExternalSandboxEndpoint) {
        availableEndpoint = api.advertiseInfo.apiExternalSandboxEndpoint;
        endpointType = 'SANDBOX';
    }

    const [endpointUrl, setEndpointUrl] = useState(availableEndpoint);
    const [isValidEndpoint, setValidEndpoint] = useState(availableEndpoint !== '');
    const [availableTiers, setAvailableTiers] = useState([]);

    useEffect(() => {
        if (policies.length > 0) {
            setAvailableTiers(policies);
        } else {
            const isAsyncAPI = (api.type === 'WS' || api.type === 'WEBSUB' || api.type === 'SSE'
                || api.type === 'ASYNC');
            if (isAsyncAPI) {
                API.asyncAPIPolicies().then((response) => {
                    if (response.body.list && response.body.list.length > 0) {
                        setAvailableTiers([response.body.list[0].policyName]);
                    }
                });
            } else {
                API.policies('subscription').then((response) => {
                    if (response.body.list && response.body.list.length > 0) {
                        setAvailableTiers([response.body.list[0].name]);
                    }
                });
            }
        }
    }, [endpointConfig, policies]);

    /**
     * Validate external endpoint
     *
     * @param event
     */
    const handleOnChangeEndpoint = (event) => {
        const { value } = event.target;
        setEndpointUrl(value);
        const urlSchema = Joi.string().uri().empty();
        setValidEndpoint(!urlSchema.validate(value).error);
    };

    const handleSave = () => {
        handleClick(availableTiers, endpointUrl, endpointType);
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby='update-api-confirmation' 
            data-testid='itest-update-api-confirmation' open={open}>
            <MuiDialogTitle disableTypography className={classes.dialogTitle}>
                <Typography variant='h6'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.UpdateWithoutDetails.dialog.title'
                        defaultMessage='Restore to a Regular API'
                    />
                </Typography>
                {handleClose ? (
                    <IconButton
                        aria-label='close'
                        className={classes.closeButton}
                        onClick={handleClose}
                        size='large'>
                        <CloseIcon />
                    </IconButton>
                ) : null}
            </MuiDialogTitle>
            <Divider light />
            <MuiDialogContent>
                <Box my={1}>
                    <DialogContentText id='itest-confirm-update-text'>
                        <Typography variant='subtitle1' display='block' gutterBottom>
                            <FormattedMessage
                                id='Apis.Details.Configuration.UpdateWithoutDetails.confirm.update.message'
                                defaultMessage={'This API is currently published and by changing to a regular API, '
                                + 'it will not be available for consumption since it has no active deployments.'}
                            />
                        </Typography>
                    </DialogContentText>
                </Box>
                {availableTiers.length > 0 && (
                    <Box my={1}>
                        <Grid container direction='row'>
                            <Grid>
                                <Typography variant='subtitle1' display='block' gutterBottom>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.UpdateWithoutDetails.tier.message'
                                        defaultMessage='Business Plans: '
                                    />
                                </Typography>
                            </Grid>
                            <Grid>
                                <div className={classes.tierList}>
                                    {availableTiers.map((tierName) => (
                                        <Chip label={tierName} />
                                    ))}
                                </div>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                <Box my={1}>
                    <TextField
                        fullWidth
                        id='itest-id-api-endpoint-input'
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.UpdateWithoutDetails.endpoint'
                                    defaultMessage='Endpoint'
                                />
                                <sup className={classes.mandatoryStar}>*</sup>
                            </>
                        )}
                        name='endpoint'
                        value={endpointUrl}
                        onChange={handleOnChangeEndpoint}
                        helperText={
                            !isValidEndpoint && (
                                <div style={{ marginTop: '10px' }}>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.UpdateWithoutDetails.endpoint.error'
                                        defaultMessage='Invalid Endpoint URL'
                                    />
                                </div>
                            )
                        }
                        error={!isValidEndpoint}
                        margin='normal'
                        variant='outlined'
                    />
                </Box>
            </MuiDialogContent>
            <MuiDialogActions>
                <Button
                    disabled={!isValidEndpoint}
                    variant='contained'
                    color='primary'
                    className={classes.btnSpacing}
                    onClick={handleSave}
                >
                    <FormattedMessage
                        id='Apis.Details.Configuration.UpdateWithoutDetails.continue'
                        defaultMessage='Continue'
                    />
                </Button>
                <Button
                    onClick={handleClose}
                    aria-label='Cancel'
                >
                    <FormattedMessage
                        id='Apis.Details.Configuration.UpdateWithoutDetails.cancel'
                        defaultMessage='Cancel'
                    />
                </Button>
            </MuiDialogActions>
        </Dialog>
    );
}
