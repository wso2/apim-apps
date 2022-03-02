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
import { makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage,  } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import { ACTIONS } from './PolicyCreateForm';

const useStyles = makeStyles((theme: Theme) => ({
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
}));

interface GeneralDetailsProps {
    displayName: string | null;
    description: string;
    applicableFlows: string[];
    dispatch?: React.Dispatch<any>;
    isViewMode: boolean;
}

/**
 * Renders the general details section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} General details of the policy.
 */
const GeneralDetails: FC<GeneralDetailsProps> = ({
    displayName, description, applicableFlows, dispatch, isViewMode
}) => {
    const classes = useStyles();

    // Validates whether atleast one flow (i.e. request, response or fault) is selected
    // True if none of the flows are selected.
    const applicableFlowsError = applicableFlows.length === 0;

    // Name validation
    const nameError = displayName === '';

    /**
     * Function to handle text field inputs
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_METADATA,
                field: event.target.name,
                value: event.target.value
            });
        }
    }

    /**
     * Function to handle applicable flows related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>)  => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_APPLICALBLE_FLOWS,
                name: event.target.name,
                checked: event.target.checked,
            });
        }
    }

    return (
        <Box display='flex' flexDirection='row' mt={1}>
            <Box width='40%'>
                <Typography color='inherit' variant='subtitle2' component='div'>
                    <FormattedMessage
                        id='Policies.PolicyCreateForm.add.policy.general.details.title'
                        defaultMessage='General Details'
                    />
                </Typography>
                <Typography color='inherit' variant='caption' component='p'>
                    <FormattedMessage
                        id='Policies.PolicyCreateForm.add.policy.general.details.description'
                        defaultMessage='Provide the name, description and applicable flows of the policy.'
                    />
                </Typography>
            </Box>
            <Box width='60%'>
                <Box component='div'>
                    <TextField
                        fullWidth
                        id='name'
                        name='displayName'
                        required
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyCreateForm.field.name'
                                    defaultMessage='Name'
                                />
                            </>
                        )}
                        error={nameError}
                        helperText={
                            nameError ? (
                                'Name is Empty'
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyCreateForm.short.description.name'
                                    defaultMessage='Enter Policy Name ( E.g.: Add Header )'
                                />
                            )
                        }
                        margin='dense'
                        variant='outlined'
                        value={displayName}
                        onChange={handleInputChange}
                        inputProps={{
                            readOnly: isViewMode,
                            style: isViewMode ? {cursor: 'auto'} : {},
                        }}
                    />
                    <TextField
                        id='name'
                        name='description'
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyCreateForm.field.description'
                                    defaultMessage='Description'
                                />
                            </>
                        )}
                        helperText={
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyCreateForm.short.description.description'
                                defaultMessage='Short description about the policy'
                            />
                        }
                        fullWidth
                        margin='dense'
                        variant='outlined'
                        value={description}
                        onChange={handleInputChange}
                        inputProps={{
                            readOnly: isViewMode,
                            style: isViewMode ? {cursor: 'auto'} : {},
                        }}
                    />
                    <Box display='flex' flexDirection='row' alignItems='center'>
                        <Typography color='inherit' variant='body1' component='div'>
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyCreateForm.field.applicable.flows'
                                defaultMessage='Applicable Flows'
                            />
                            <sup className={classes.mandatoryStar}>*</sup>
                        </Typography>
                        <Box flex='1' display='flex' flexDirection='row-reverse' justifyContent='space-around'>
                            <FormControl
                                required
                                component='fieldset'
                                variant='standard'
                                margin='normal'
                                error={applicableFlowsError}
                            >
                                <FormGroup className={classes.formGroup}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name='request'
                                                color='primary'
                                                checked={applicableFlows.includes('request')}
                                                onChange={handleChange}
                                            />
                                        }
                                        label='Request'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name='response'
                                                color='primary'
                                                checked={applicableFlows.includes('response')}
                                                onChange={handleChange}
                                            />
                                        }
                                        label='Response'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name='fault'
                                                color='primary'
                                                checked={applicableFlows.includes('fault')}
                                                onChange={handleChange}
                                            />
                                        }
                                        label='Fault'
                                    />
                                </FormGroup>
                                <FormHelperText>
                                    {applicableFlowsError ? 'Please select one or more flows' : ''}
                                </FormHelperText>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default GeneralDetails;
