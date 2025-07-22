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
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import FormControl from '@mui/material/FormControl';
import { ACTIONS } from './PolicyCreateForm';
import { ApiTypeObject } from '../Types';

const PREFIX = 'GeneralDetails';

const classes = {
    mandatoryStar: `${PREFIX}-mandatoryStar`,
    formGroup: `${PREFIX}-formGroup`
};

const StyledBox = styled(Box)(({ theme }: { theme: Theme }) => ({
    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },

    [`& .${classes.formGroup}`]: {
        display: 'flex',
        flexDirection: 'row',
    }
}));

interface GeneralDetailsProps {
    displayName: string | null;
    version: string | null;
    description: string;
    applicableFlows: string[];
    supportedApiTypes: string[] | ApiTypeObject[];
    dispatch?: React.Dispatch<any>;
    isViewMode: boolean;
    isLocalToAPI: boolean;
}

/**
 * Renders the general details section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} General details of the policy.
 */
const GeneralDetails: FC<GeneralDetailsProps> = ({
    displayName,
    version,
    description,
    applicableFlows,
    supportedApiTypes,
    dispatch,
    isViewMode,
    isLocalToAPI
}) => {

    const intl = useIntl();
    // Validates whether atleast one flow (i.e. request, response or fault) is selected
    // True if none of the flows are selected.
    const applicableFlowsError = applicableFlows.length === 0;

    // Validates whether atleast one Api Type (i.e. HTTP, SOAP or SOAPTOREST) is selected
    // True if none of the API types are selected.
    const supportedApiTypesError = supportedApiTypes.length === 0;

    // Name validation
    const nameError = displayName === '';

    // Version validation
    const versionError = version === '';

    /**
     * Function to handle text field inputs
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_METADATA,
                field: event.target.name,
                value: event.target.value,
            });
        }
    };

    /**
     * Function to handle applicable flows related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_APPLICALBLE_FLOWS,
                name: event.target.name,
                checked: event.target.checked,
            });
        }
    };

    /**
     * Function to handle supported Api Type related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleApiTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        if (dispatch) {
            if (name === 'WS' && checked) {
                dispatch({
                    type: ACTIONS.SET_SUPPORTED_API_TYPES,
                    payload: ['WS'],
                });
                dispatch({
                    type: ACTIONS.SET_APPLICABLE_FLOWS,
                    payload: ['request']
                });
            } else if (name === 'WS' && !checked) {
                dispatch({
                    type: ACTIONS.REMOVE_SUPPORTED_API_TYPE,
                    payload: 'WS',
                });
            } else if (isWebsocketSelected) {
                // Don't allow other types to be selected while WS is selected
                return;
            } else {
                dispatch({
                    type: ACTIONS.UPDATE_SUPPORTED_API_TYPES,
                    name,
                    checked,
                });
            }
        }
    };

    const isWebsocketSelected =
        Array.isArray(supportedApiTypes) &&
        supportedApiTypes.every((item) => typeof item === 'string') &&
        supportedApiTypes.includes('WS');

    return (
        <StyledBox display='flex' flexDirection='row' mt={1}>
            <Box width='40%'>
                <Typography color='inherit' variant='subtitle2' component='div'>
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyForm.GeneralDetails.title'
                        defaultMessage='General Details'
                    />
                </Typography>
                <Typography color='inherit' variant='caption' component='p'>
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyForm.GeneralDetails.description'
                        defaultMessage='Provide the name, description and applicable flows of the policy.'
                    />
                </Typography>
            </Box>
            <Box width='60%'>
                <Box component='div'>
                    <TextField
                        fullWidth
                        id='name'
                        data-testid='displayname'
                        name='displayName'
                        required
                        label={
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.name.label'
                                    defaultMessage='Name'
                                />
                            </>
                        }
                        error={nameError}
                        helperText={
                            nameError ? (
                                'Name is Empty'
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.name.helperText'
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
                            style: isViewMode ? { cursor: 'auto' } : {},
                        }}
                    />
                    <TextField
                        fullWidth
                        type='number'
                        id='version'
                        data-testid='version'
                        name='version'
                        required
                        label={
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.version.label'
                                    defaultMessage='Version'
                                />
                            </>
                        }
                        error={versionError}
                        helperText={
                            versionError ? (
                                'Version is Empty'
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.version.helperText'
                                    defaultMessage='Enter Policy Version ( E.g.: v1 )'
                                />
                            )
                        }
                        margin='dense'
                        variant='outlined'
                        value={
                            isViewMode && version ? (
                                version.replace('v', '')
                            ) : (
                                version
                            )
                        }
                        onChange={handleInputChange}
                        inputProps={{
                            readOnly: isViewMode,
                            style: isViewMode ? { cursor: 'auto' } : {},
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position='start'>v</InputAdornment>,
                        }}
                    />
                    <TextField
                        id='name'
                        data-testid='description'
                        name='description'
                        label={
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.description.label'
                                    defaultMessage='Description'
                                />
                            </>
                        }
                        helperText={
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.description.helperText'
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
                            style: isViewMode ? { cursor: 'auto' } : {},
                        }}
                    />
                    <Box display='flex' flexDirection='row' alignItems='center'>
                        <Typography
                            color='inherit'
                            variant='body1'
                            component='div'
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.applicable.flows.label'
                                defaultMessage='Applicable Flows'
                            />
                            <sup className={classes.mandatoryStar}>*</sup>
                        </Typography>
                        <Box
                            flex='1'
                            display='flex'
                            flexDirection='row-reverse'
                            justifyContent='space-around'
                        >
                            <FormControl
                                required
                                component='fieldset'
                                variant='standard'
                                margin='normal'
                                error={applicableFlowsError}
                            >
                                <FormGroup className={classes.formGroup}>
                                    {!isWebsocketSelected ? (
                                        <>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name='request'
                                                        color='primary'
                                                        checked={applicableFlows.includes(
                                                            'request',
                                                        )}
                                                        onChange={handleChange}
                                                    />
                                                }
                                                label={intl.formatMessage({
                                                    id: 'Apis.Details.Policies.PolicyForm.GeneralDetails.form.flow.type.request',
                                                    defaultMessage: 'Request',
                                                })}
                                                data-testid='request-flow'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name='response'
                                                        color='primary'
                                                        checked={applicableFlows.includes(
                                                            'response',
                                                        )}
                                                        onChange={handleChange}
                                                    />
                                                }
                                                label={intl.formatMessage({
                                                    id: 'Apis.Details.Policies.PolicyForm.GeneralDetails.form.flow.type.response',
                                                    defaultMessage: 'Response',
                                                })}
                                                data-testid='response-flow'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name='fault'
                                                        color='primary'
                                                        id='fault-select-check-box'
                                                        checked={applicableFlows.includes(
                                                            'fault',
                                                        )}
                                                        onChange={handleChange}
                                                    />
                                                }
                                                label={intl.formatMessage({
                                                    id: 'Apis.Details.Policies.PolicyForm.GeneralDetails.form.flow.type.fault',
                                                    defaultMessage: 'Fault',
                                                })}
                                                data-testid='fault-flow'
                                            />
                                        </>
                                    ):(
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name='fault'
                                                    color='primary'
                                                    id='fault-select-check-box'
                                                    checked={true}
                                                    onChange={handleChange}
                                                    disabled={true}
                                                />
                                            }
                                            label={intl.formatMessage({
                                                id: 'Apis.Details.Policies.PolicyForm.GeneralDetails.form.flow.type.inbound',
                                                defaultMessage: 'Inbound Handshake',
                                            })}
                                            data-testid='inbound-flow'
                                        />
                                    )}
                                </FormGroup>
                                <FormHelperText>
                                    {applicableFlowsError
                                        ? 'Please select one or more flows'
                                        : ''}
                                </FormHelperText>
                            </FormControl>
                        </Box>
                    </Box>
                    {!isLocalToAPI && (
                        <Box display='flex' flexDirection='row' alignItems='center'>
                            <Typography
                                color='inherit'
                                variant='body1'
                                component='div'
                            >
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.GeneralDetails.form.supported.api.label'
                                    defaultMessage='Supported API Types'
                                />
                                <sup className={classes.mandatoryStar}>*</sup>
                            </Typography>
                            <Box
                                flex='1'
                                display='flex'
                                flexDirection='row-reverse'
                                justifyContent='space-around'
                            >
                                <FormControl
                                    required
                                    component='fieldset'
                                    variant='standard'
                                    margin='normal'
                                    error={supportedApiTypesError}
                                >
                                    <FormGroup className={classes.formGroup} sx={{paddingLeft:'22px'}}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name='HTTP'
                                                    color='primary'
                                                    checked={
                                                        Array.isArray(supportedApiTypes) &&
                                                        supportedApiTypes.some(
                                                            item =>
                                                                (typeof item === 'string' && item === 'HTTP') ||
                                                                (typeof item === 'object' && item !== null && item.apiType === 'HTTP')
                                                        )                                            
                                                    }
                                                    id='http-select-check-box'
                                                    onChange={handleApiTypeChange}
                                                    disabled={isWebsocketSelected}
                                                />
                                            }
                                            label='HTTP'
                                            data-testid='http-type'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name='SOAP'
                                                    color='primary'
                                                    checked={
                                                        Array.isArray(supportedApiTypes) &&
                                                        supportedApiTypes.every(item => typeof item === 'string') &&
                                                        supportedApiTypes.includes('SOAP')
                                                    }
                                                    id='soap-select-check-box'
                                                    onChange={handleApiTypeChange}
                                                    disabled={isWebsocketSelected}
                                                />
                                            }
                                            label='SOAP'
                                            data-testid='soap-type'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name='SOAPTOREST'
                                                    color='primary'
                                                    checked={
                                                        Array.isArray(supportedApiTypes) &&
                                                        supportedApiTypes.every(item => typeof item === 'string') &&
                                                        supportedApiTypes.includes('SOAPTOREST')
                                                    }
                                                    id='soaptorest-select-check-box'
                                                    onChange={handleApiTypeChange}
                                                    disabled={isWebsocketSelected}
                                                />
                                            }
                                            label='SOAPTOREST'
                                            data-testid='soaptorest-flow'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name='GRAPHQL'
                                                    color='primary'
                                                    checked={
                                                        Array.isArray(supportedApiTypes) &&
                                                        supportedApiTypes.every(item => typeof item === 'string') &&
                                                        supportedApiTypes.includes('GRAPHQL')
                                                    }
                                                    id='graphql-select-check-box'
                                                    onChange={handleApiTypeChange}
                                                    disabled={isWebsocketSelected}
                                                />
                                            }
                                            label='GRAPHQL'
                                            data-testid='graphql-type'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name='WS'
                                                    color='primary'
                                                    checked={isWebsocketSelected}
                                                    id='ws-select-check-box'
                                                    onChange={handleApiTypeChange}
                                                />
                                            }
                                            label='WEBSOCKET'
                                            data-testid='ws-flow'
                                        />
                                    </FormGroup>
                                    <FormHelperText>
                                        {supportedApiTypesError
                                            ? 'Please select one or more API Types'
                                            : ''}
                                    </FormHelperText>
                                </FormControl>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </StyledBox>
    );
};

export default React.memo(GeneralDetails);
