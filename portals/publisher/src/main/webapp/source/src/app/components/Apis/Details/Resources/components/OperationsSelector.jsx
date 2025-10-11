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
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import isEmpty from 'lodash.isempty';
import IconButton from '@mui/material/IconButton';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Tooltip from '@mui/material/Tooltip';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import LockIcon from '@mui/icons-material//Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import { useIntl } from 'react-intl';
/**
 *
 *
 * @param {*} props
 * @returns
 */
export default function OperationsSelector(props) {
    const {
        selectedOperations, setSelectedOperation, operations, enableSecurity, disableSecurity, componentValidator,
    } = props;
    const [apiFromContext] = useAPI();
    const intl = useIntl();

    const getAllowedScopes = () => {
        if (apiFromContext.apiType && apiFromContext.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_manage', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create'];
        }
    };
    const isAccessRestricted = () => isRestricted(getAllowedScopes(), apiFromContext);

    // TODO: Following logic introduce a limitation in showing `indeterminate` icon state if user
    // select all -> unchecked one operation -> recheck same operation again ~tmkb
    const isIndeterminate = !isEmpty(selectedOperations);
    /**
     *
     *
     * @param {*} event
     */
    function handleSelector() {
        setSelectedOperation(isIndeterminate ? {} : operations);
    }

    let operationCount = 0;
    let operationWithSecurityCount = 0;

    Object.entries(operations).forEach(([, verbObj]) => {
        Object.entries(verbObj).forEach(([verbKey, operation]) => {
            // Skip the "parameters" array
            if (verbKey === 'parameters') {
                return;
            }
    
            if (operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none') {
                operationWithSecurityCount++;
            }
            operationCount++;
        });
    });

    return (
        <Grid container direction='row' justifyContent='space-between' alignItems='center'>
            <Grid item />
            <Grid item>
                <Box mr={17.25} display='flex'>
                    { (operationWithSecurityCount === 0)
                    && (
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'Apis.Details.Resources.Components.Operations.title.enable.security.all',
                                defaultMessage: 'Enable security for all',
                            })}
                        >
                            <div>
                                <IconButton
                                    disabled={isAccessRestricted()}
                                    onClick={enableSecurity}
                                    aria-label='enable security for all'
                                    size='large'
                                >
                                    <LockOpenIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}
                    { (componentValidator.includes('operationSecurity') && 
                    (operationWithSecurityCount === operationCount))
                    && (
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'Apis.Details.Resources.Components.Operations.title.disable.security.all',
                                defaultMessage: 'Disable security for all',
                            })}
                        >
                            <div>
                                <IconButton
                                    disabled={isAccessRestricted()}
                                    onClick={disableSecurity}
                                    aria-label='disable security for all'
                                    size='large'
                                >
                                    <LockIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}
                    { (componentValidator.includes('operationSecurity') && 
                    operationWithSecurityCount !== 0 && operationWithSecurityCount !== operationCount)
                    && (
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'Apis.Details.Resources.Components.Operations.title.enable.security.all',
                                defaultMessage: 'Enable security for all',
                            })}
                        >
                            <div>
                                <IconButton
                                    disabled={isAccessRestricted()}
                                    onClick={enableSecurity}
                                    aria-label='enable security for all'
                                    size='large'
                                >
                                    <LockOpenTwoToneIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}
                    <Tooltip title={isIndeterminate
                        ? intl.formatMessage({
                            id: 'Apis.Details.Resources.Components.Operations.tooltip.clear.selections',
                            defaultMessage: 'Clear selections',
                        })
                        : intl.formatMessage({
                            id: 'Apis.Details.Resources.Components.Operations.tooltip.delete.selections',
                            defaultMessage: 'Mark all for delete',
                        })}
                    >
                        <div>
                            <IconButton
                                disabled={isAccessRestricted()}
                                onClick={handleSelector}
                                aria-label='Mark all for delete'
                                size='large'
                            >
                                {isIndeterminate ? <ClearAllIcon /> : <DeleteSweepIcon />}
                            </IconButton>
                        </div>
                    </Tooltip>
                </Box>
            </Grid>
        </Grid>
    );
}

OperationsSelector.defaultProps = {};

OperationsSelector.propTypes = {
    selectedOperations: PropTypes.shape({}).isRequired,
    setSelectedOperation: PropTypes.func.isRequired,
    operations: PropTypes.shape({}).isRequired,
};
