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

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutline from '@material-ui/icons/HelpOutline';
import LaunchIcon from '@material-ui/icons/Launch';
import { Link } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { getAsyncAPIOperationScopes } from '../../../operationUtils';

/**
 *
 * Renders the security and scopes selection section in the operation collapsed page
 * @export
 * @param {*} props
 * @returns
 */
export default function OperationGovernance(props) {
    const {
        operation, operationsDispatcher, api, disableUpdate, target, verb, sharedScopes,
    } = props;
    const operationScopes = getAsyncAPIOperationScopes(operation[verb]);
    const filteredApiScopes = api.scopes.filter((sharedScope) => !sharedScope.shared);
    const intl = useIntl();
    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
    const checkedIcon = <CheckBoxIcon fontSize='small' />;

    return (
        <>
            <Grid item xs={12} md={12}>
                <Typography gutterBottom variant='subtitle1'>
                    <FormattedMessage
                        id='Apis.Details.Topics.components.operationComponents.OperationGovernance.title'
                        defaultMessage='Operation Governance'
                    />
                    <Typography style={{ marginLeft: '10px' }} gutterBottom variant='caption'>
                        <FormattedMessage
                            id='Apis.Details.Topics.components.operationComponents.OperationGovernance.subTitle'
                            defaultMessage='(Security & Scopes)'
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
                                disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
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
                                id={'Apis.Details.Topics.components.operationComponents.OperationGovernance.Security'
                                + '.tooltip'}
                                defaultMessage='This will enable/disable Application Level securities defined in the
                                Runtime Configurations page.'
                            />
                        )}
                        fontSize='small'
                        aria-label='Operation security'
                        placement='right-end'
                        interactive
                    >
                        <HelpOutline />
                    </Tooltip>
                </sup>
            </Grid>
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
                        getOptionSelected={(option, value) => option.scope.name === value.scope.name}
                        onChange={(event, newValue) => {
                            const selectedScopes = newValue.map((val) => val.scope.name);
                            operationsDispatcher({
                                action: 'scopes',
                                data: { target, verb, value: selectedScopes ? [selectedScopes] : [] },
                            });
                        }}
                        renderOption={(option, { selected }) => (
                            <>
                                <Checkbox
                                    id={verb + target + '-operation-scope-' + option.scope.name}
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.scope.name}
                            </>
                        )}
                        style={{ width: 500 }}
                        renderInput={(params) => (
                            <TextField {...params}
                                disabled={disableUpdate}
                                fullWidth
                                label={api.scopes.length !== 0 || sharedScopes ? intl.formatMessage({
                                    id: 'Apis.Details.Topics.components.operationComponents.'
                                        + 'OperationGovernance.operation.scope.label.default',
                                    defaultMessage: 'Operation scope',
                                }) : intl.formatMessage({
                                    id: 'Apis.Details.Topics.components.operationComponents.'
                                        + 'OperationGovernance.operation.scope.label.notAvailable',
                                    defaultMessage: 'No scope available',
                                })}
                                placeholder='Search scopes'
                                helperText={(
                                    <FormattedMessage
                                        id={'Apis.Details.Topics.components.operationComponents.'
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
                {
                    operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none' ? !disableUpdate && (
                        <Link
                            to={`/apis/${api.id}/scopes/create`}
                            target='_blank'
                        >
                            <Typography
                                style={{ marginLeft: '10px' }}
                                color='primary'
                                display='inline'
                                variant='caption'
                            >
                                <FormattedMessage
                                    id={'Apis.Details.Topics.components.operationComponents.'
                                    + 'OperationGovernance.operation.scope.create.new.scope'}
                                    defaultMessage='Create New Scope'
                                />
                                <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                            </Typography>
                        </Link>
                    ) : null
                }
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
    operationsDispatcher: PropTypes.func.isRequired,
    api: PropTypes.shape({ scopes: PropTypes.arrayOf(PropTypes.shape({})) }),
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})),
};

OperationGovernance.defaultProps = {
    api: { scopes: [] },
    sharedScopes: [],
    disableUpdate: false,
};
