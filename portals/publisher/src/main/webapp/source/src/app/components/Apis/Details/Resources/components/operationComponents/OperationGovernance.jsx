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
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useIntl, FormattedMessage } from 'react-intl';
import { getOperationScopes } from '../../operationUtils';

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

/**
 *
 * Renders the security , throttling policies and scopes selection section in the operation collapsed page
 * @export
 * @param {*} props
 * @returns
 */
export default function OperationGovernance(props) {
    const {
        operation, operationsDispatcher, operationRateLimits, api, disableUpdate, spec, target, verb, sharedScopes,
        setFocusOperationLevel,
    } = props;
    const operationScopes = getOperationScopes(operation, spec);
    const isOperationRateLimiting = api.apiThrottlingPolicy === null;
    const filteredApiScopes = api.scopes.filter((sharedScope) => !sharedScope.shared);
    const intl = useIntl();
    const scrollToTop = () => {
        setFocusOperationLevel(true);
        document.querySelector('#react-root').scrollTop = 195;
    };
    return (
        <>
            <Grid item xs={12} md={12}>
                <Typography gutterBottom variant='subtitle1'>
                    <FormattedMessage
                        id='Apis.Details.Resources.components.operationComponents.OperationGovernance.title'
                        defaultMessage='Operation Governance'
                    />
                    <Typography style={{ marginLeft: '10px' }} gutterBottom variant='caption'>
                        <FormattedMessage
                            id='Apis.Details.Resources.components.operationComponents.OperationGovernance.subTitle'
                            defaultMessage='(Security, Rate Limiting & Scopes)'
                        />
                    </Typography>
                    <Divider variant='middle' />
                </Typography>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={11}>
                <FormControl disabled={disableUpdate} component='fieldset'>
                    <FormControlLabel
                        control={(
                            <Switch
                                data-testid={'security-' + verb + target}
                                checked={operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none'}
                                onChange={({ target: { checked } }) => operationsDispatcher({
                                    action: 'authType',
                                    data: { target, verb, value: checked },
                                })}
                                size='small'
                                color='primary'
                            />
                        )}
                        label='Security'
                        labelPlacement='start'
                    />
                </FormControl>
                <sup style={{ marginLeft: '10px' }}>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id={'Apis.Details.Resources.components.operationComponents.OperationGovernance.Security'
                                + '.tooltip'}
                                defaultMessage='This will enable/disable Application Level securities defined in the
                                Runtime Configurations page.'
                            />
                        )}
                        fontSize='small'
                        placement='right-end'
                        interactive
                    >
                        <HelpOutline />
                    </Tooltip>
                </sup>
            </Grid>
            <Grid item md={1} />
            <Grid item md={5}>
                <Box display='flex' flexDirection='row' alignItems='flex-start'>
                    <TextField
                        select
                        fullWidth={!isOperationRateLimiting}
                        SelectProps={{
                            autoWidth: true,
                            IconComponent: isOperationRateLimiting ? ArrowDropDownIcon : 'span',
                        }}
                        disabled={disableUpdate || !isOperationRateLimiting}
                        label={
                            isOperationRateLimiting
                                ? intl.formatMessage({
                                    id: 'Apis.Details.Resources.components.operationComponents.'
                                + 'OperationGovernance.rate.limiting.policy',
                                    defaultMessage: 'Rate limiting policy',
                                })
                                : (
                                    <div>
                                        <FormattedMessage
                                            id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.governed.by'}
                                            defaultMessage='Rate limiting is governed by '
                                        />
                                        <Box
                                            fontWeight='fontWeightBold'
                                            display='inline'
                                            color='primary.main'
                                            cursor='pointer'
                                        >
                                            <FormattedMessage
                                                id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.API.level'}
                                                defaultMessage='API Level'
                                            />
                                        </Box>
                                    </div>
                                )
                        }
                        value={
                            isOperationRateLimiting
                            && operation['x-throttling-tier']
                                ? operation['x-throttling-tier']
                                : ''
                        }
                        onChange={({ target: { value } }) => operationsDispatcher({
                            action: 'throttlingPolicy',
                            data: { target, verb, value },
                        })}
                        helperText={
                            isOperationRateLimiting
                                ? intl.formatMessage({
                                    id: 'Apis.Details.Resources.components.operationComponents.'
                                + 'OperationGovernance.rate.limiting.policy.select',
                                    defaultMessage: 'Select a rate limit policy for this operation',
                                })
                                : (
                                    <span>
                                        <FormattedMessage
                                            id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.helperText.section1'}
                                            defaultMessage='Use '
                                        />
                                        <Box fontWeight='fontWeightBold' display='inline' color='primary.main'>
                                            <FormattedMessage
                                                id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.helperText.section2'}
                                                defaultMessage='Operation Level'
                                            />
                                        </Box>
                                        <FormattedMessage
                                            id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.helperText.section3'}
                                            defaultMessage=' rate limiting to '
                                        />
                                        <b>
                                            <FormattedMessage
                                                id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.helperText.section4'}
                                                defaultMessage='enable'
                                            />
                                        </b>
                                        <FormattedMessage
                                            id={'Apis.Details.Resources.components.operationComponents.'
                            + 'OperationGovernance.rate.limiting.helperText.section5'}
                                            defaultMessage=' rate limiting per operation'
                                        />
                                    </span>
                                )
                        }
                        margin='dense'
                        variant='outlined'
                        id={verb + target + '-operation_throttling_policy'}
                    >
                        {operationRateLimits.map((rateLimit) => (
                            <MenuItem
                                key={rateLimit.name}
                                value={rateLimit.name}
                                id={verb + target + '-operation_throttling_policy-' + rateLimit.name}
                            >
                                {rateLimit.displayName}
                            </MenuItem>
                        ))}
                    </TextField>
                    {!isOperationRateLimiting && (
                        <Button onClick={scrollToTop}>
                            <FormattedMessage
                                id={
                                    'Apis.Details.Resources.components.operationComponents.'
                                    + 'OperationGovernance.rate.limiting.button.text'
                                }
                                defaultMessage='Change rate limiting level'
                            />
                            <ExpandLessIcon />
                        </Button>
                    )}
                </Box>
            </Grid>
            <Grid item md={6} />
            <Grid item md={1} />
            <Grid item md={7}>
                {operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none' ? (
                    <Autocomplete
                        multiple
                        limitTags={5}
                        id={verb + target + '-operation-scope-autocomplete'}
                        options={[...filteredApiScopes, ...sharedScopes]}
                        groupBy={(option) => option.shared ? 'Shared Scopes' : 'API Scopes'}
                        noOptionsText='No scopes available'
                        disableCloseOnSelect
                        value={operationScopes.map((scope) => ({ scope: { name: scope } }))}
                        getOptionLabel={(option) => option.scope.name}
                        isOptionEqualToValue={(option, value) => option.scope.name === value.scope.name}
                        onChange={(event, newValue) => {
                            const selectedScopes = newValue.map((val) => val.scope.name);
                            operationsDispatcher({
                                action: 'scopes',
                                data: { target, verb, value: selectedScopes ? [selectedScopes] : [] },
                            });
                        }}
                        renderOption={(listOfOptions, option, { selected }) => (
                            <li {...listOfOptions}>
                                <Checkbox
                                    id={verb + target + '-operation-scope-' + option.scope.name}
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.scope.name}
                            </li>
                        )}
                        style={{ width: 500 }}
                        renderInput={(params) => (
                            <TextField {...params}
                                disabled={disableUpdate}
                                fullWidth
                                label={api.scopes.length !== 0 || sharedScopes ? intl.formatMessage({
                                    id: 'Apis.Details.Resources.components.operationComponents.'
                                        + 'OperationGovernance.operation.scope.label.default',
                                    defaultMessage: 'Operation scope',
                                }) : intl.formatMessage({
                                    id: 'Apis.Details.Resources.components.operationComponents.'
                                        + 'OperationGovernance.operation.scope.label.notAvailable',
                                    defaultMessage: 'No scope available',
                                })}
                                placeholder='Search scopes'
                                helperText={(
                                    <FormattedMessage
                                        id={'Apis.Details.Resources.components.operationComponents.'
                                            + 'OperationGovernance.operation.scope.helperText'}
                                        defaultMessage='Select a scope to control permissions to this operation'
                                    />
                                )}
                                margin='dense'
                                variant='outlined'
                                id={verb + target + '-operation-scope-select'} />
                        )}
                    />
                ) : null}
            </Grid>
            <Grid item md={3} style={{ marginTop: '14px' }}>
                { operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none' ? !disableUpdate && (
                    <Link to={`/apis/${api.id}/scopes/create`} target='_blank'>
                        <Typography style={{ marginLeft: '10px' }} color='primary' display='inline' variant='caption'>
                            <FormattedMessage
                                id={'Apis.Details.Resources.components.operationComponents.'
                                + 'OperationGovernance.operation.scope.create.new.scope'}
                                defaultMessage='Create New Scope'
                            />
                            <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                        </Typography>
                    </Link>
                ) : null}
            </Grid>
            <Grid item md={1} />
        </>
    );
}

OperationGovernance.propTypes = {
    disableUpdate: PropTypes.bool,
    operation: PropTypes.shape({
        target: PropTypes.string.isRequired,
        verb: PropTypes.string.isRequired,
    }).isRequired,
    spec: PropTypes.shape({}).isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    operationRateLimits: PropTypes.arrayOf(PropTypes.shape({})),
    api: PropTypes.shape({ scopes: PropTypes.arrayOf(PropTypes.shape({})) }),
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})),
};

OperationGovernance.defaultProps = {
    operationRateLimits: [],
    api: { scopes: [] },
    sharedScopes: [],
    disableUpdate: false,
};
