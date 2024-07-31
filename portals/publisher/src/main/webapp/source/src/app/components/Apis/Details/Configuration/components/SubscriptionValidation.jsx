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

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';

const SubscriptionValidation = (props) => {
    const {
        configDispatcher,
        api: {
            lifeCycleStatus,
            disableSubscriptionValidation
        },
    } = props;
    const [apiFromContext] = useAPI();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(disableSubscriptionValidation);
    const { allRevisions } = useRevisionContext();

    const isDeployed = useMemo(() => {
        if (allRevisions) {
            for (let i = 0; i < allRevisions.length; i++) {
                if (allRevisions[i].deploymentInfo.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }, [allRevisions]);

    const handleChange = (event) => {
        const val = event.target.value === 'true';
        if (val) {
            setIsOpen(true);
        } else {
            setSelectedOption(val);
            configDispatcher({ action: 'disableSubscriptionValidation', value: val });   
        }
    };

    const handleDialogYes = () => {
        setSelectedOption(true);
        configDispatcher({ action: 'disableSubscriptionValidation', value: true });
        setIsOpen(false);
    };

    const handleDialogNo = () => {
        setSelectedOption(false);
        setIsOpen(false);
    };

    const handleSelectionDisable = () => {
        // The selection should be disabled for the following scenarios
        return isDeployed || lifeCycleStatus === 'PUBLISHED';
    };

    return (
        <Grid container spacing={1} alignItems='flex-start' xs={11}>
            <Grid item>
                <Box>
                    <FormControl component='fieldset' style={{ display: 'flex' }}>
                        <FormLabel component='legend'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.subValidationDisabled.label'
                                defaultMessage='Disable Subscription Validation'
                            />
                        </FormLabel>
                        <RadioGroup
                            aria-label='Disable Subscription Validation'
                            name='disableSubscriptionValidation'
                            value={selectedOption || false}
                            onChange={handleChange}
                            style={{ display: 'flow-root' }}
                        >
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext) || handleSelectionDisable()}
                                value
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.Configuration.subValidationDisabled.yes'
                                        defaultMessage='Yes'
                                    />
                                )}
                                id='disable-sub-validation-yes'
                            />
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext) || handleSelectionDisable()}
                                value={false}
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.Configuration.subValidationDisabled.no'
                                        defaultMessage='No'
                                    />
                                )}
                                id='disable-sub-validation-no'
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Grid>
            <Grid item xs={1}>
                <Box>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.subValidationDisabled.tooltip'
                                defaultMessage={
                                    'Configure whether subscriptions are required to consume this API.'
                                    + ' If enabled, anyone with a valid token will be able to consume'
                                    + ' this API without a subscription.'
                                }
                            />
                        )}
                        aria-label='add'
                        placement='right-end'
                        interactive
                        id='disable-sub-validation-tooltip'
                    >
                        <HelpOutline />
                    </Tooltip>
                </Box>
            </Grid>
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.Configuration.subValidationDisabled.dialog.title'
                        defaultMessage='Caution!'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        <Typography variant='subtitle1' display='block' gutterBottom>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.subValidationDisabled.dialog.description'
                                defaultMessage={
                                    'Disabling subscription validation will allow anyone with a valid token'
                                    + ' to consume this API without a subscription. This is an irreversible'
                                    + ' action. You can only enable subscription validation by creating a'
                                    + ' new version of the API. Are you sure you want to proceed?'
                                }
                            />
                        </Typography>
                        <Typography variant='subtitle2' display='block' gutterBottom>
                            <b>
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.Configuration.subValidationDisabled.dialog'
                                    + '.description.question'}
                                    defaultMessage='Do you want to disable subscription validation?'
                                />
                            </b>
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color='primary'
                        variant='contained'
                        onClick={() => {
                            handleDialogYes();

                        }}
                        id='disable-sub-validation-yes-btn'
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={() => {
                            handleDialogNo();
                        }}
                        color='primary'
                    >
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

SubscriptionValidation.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
};

export default React.memo(SubscriptionValidation);
