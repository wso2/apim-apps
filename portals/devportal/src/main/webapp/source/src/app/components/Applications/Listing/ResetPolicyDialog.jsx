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

import React, { useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';

const ResetThrottlePolicyDialog = (props) => {
    const { handleResetThrottlePolicy, isResetOpen, toggleResetConfirmation } = props;
    const [user, setUser] = useState('');
    const [step, setStep] = useState(1);
    const [isUserValid, setIsUserValid] = useState(true);
    const intl = useIntl();

    const validateName = (value) => {
        if (!value || value.trim() === '') {
            setIsUserValid(false);
            return Promise.reject(new Error(intl.formatMessage({
                id: 'Applications.Listing.ResetPolicyDialog.dialog.user.required',
                defaultMessage: 'Application name is required',
            })));
        }
        setIsUserValid(true);
        return Promise.resolve(true);
    };
    const handleUserChange = (event) => {
        setUser(event.target.value);
        validateName(event.target.value);
    };

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleReset = () => {
        if (user !== '') {
            handleResetThrottlePolicy(user);
            toggleResetConfirmation();
            setUser('');
            setStep(1);
        }
    };

    return (
        <Dialog
            open={isResetOpen}
            transition={Slide}
            role='alertdialog'
        >
            {step === 1
                ? (
                    <>
                        <DialogTitle>
                            <FormattedMessage
                                id='Applications.Listing.ResetPolicyDialog.dialog.title'
                                defaultMessage='Reset Application Throttle Policy'
                            />
                            <Tooltip
                                interactive
                                title={(
                                    <FormattedMessage
                                        id='Applications.Listing.ResetPolicyDialog.dialog.text.description.tooltip'
                                        defaultMessage={'Check the username properly before submitting since User will not be '
                                                        + 'validated. Only a Policy Reset Request will be generated for the specified user'}
                                    />
                                )}
                                placement='right'
                                style={{ marginLeft: '20px', maxWidth: 500 }}
                            >
                                <IconButton style={{ marginLeft: '10px' }}>
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <FormattedMessage
                                    id='Applications.Listing.ResetPolicyDialog.dialog.text.description'
                                    defaultMessage='Enter the user of the application'
                                />
                            </DialogContentText>
                            <TextField
                                autoFocus
                                type='text'
                                value={user}
                                onChange={handleUserChange}
                                id='application-name'
                                margin='normal'
                                variant='outlined'
                                required
                                fullWidth
                                label={intl.formatMessage({
                                    defaultMessage: 'User',
                                    id: 'Applications.Listing.ResetPolicyDialog.dialog.user',
                                })}
                                name='user'
                                error={!isUserValid}
                                inputProps={{
                                    maxLength: 70,
                                    alt: intl.formatMessage({
                                        defaultMessage: 'Required',
                                        id: 'Applications.Listing.ResetPolicyDialog.dialog.required.alt',
                                    }),
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={toggleResetConfirmation}>
                                <FormattedMessage
                                    id='Applications.Listing.ResetPolicyDialog.dialog.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                            <Button
                                id='next-button'
                                size='small'
                                variant='outlined'
                                color='primary'
                                onClick={handleNext}
                                disabled={!user}
                            >
                                <FormattedMessage
                                    id='Applications.Listing.ResetPolicyDialog.dialog.next'
                                    defaultMessage='Next'
                                />
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogTitle>
                            <FormattedMessage
                                id='Applications.Listing.ResetPolicyDialog.dialog.confirmation.title'
                                defaultMessage='Confirm Reset'
                            />
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <FormattedMessage
                                    id='Applications.Listing.ResetPolicyDialog.dialog.confirmation.text'
                                    defaultMessage='Are you sure you want to reset the throttle policy for user {user}?'
                                    values={{ user }}
                                />
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleBack}>
                                <FormattedMessage
                                    id='Applications.Listing.ResetPolicyDialog.dialog.back'
                                    defaultMessage='Back'
                                />
                            </Button>
                            <Button
                                id='reset-button'
                                size='small'
                                variant='outlined'
                                color='primary'
                                onClick={handleReset}
                            >
                                <FormattedMessage
                                    id='Applications.Listing.ResetPolicyDialog.dialog.reset'
                                    defaultMessage='Reset'
                                />
                            </Button>
                        </DialogActions>
                    </>
                )}
        </Dialog>
    );
};

ResetThrottlePolicyDialog.propTypes = {
    handleResetThrottlePolicy: PropTypes.func.isRequired,
    isResetOpen: PropTypes.bool.isRequired,
    toggleResetConfirmation: PropTypes.func.isRequired,
};

export default ResetThrottlePolicyDialog;
