/*
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';

/**
 * Component for toggling security for all topics/operations
 * in WebSocket, SSE, and WebSub APIs.
 *
 * @param {*} props
 * @returns
 */
export default function TopicsOperationsSelector(props) {
    const {
        operations, enableSecurity, disableSecurity,
    } = props;
    const [apiFromContext] = useAPI();

    let operationCount = 0;
    let operationWithSecurityCount = 0;

    // Count total operations and operations with security enabled
    Object.entries(operations).forEach(([, channelObj]) => {
        // Check the channel-level x-auth-type
        // If x-auth-type doesn't exist or is not 'none', security is enabled
        if (!channelObj['x-auth-type'] || channelObj['x-auth-type'].toLowerCase() !== 'none') {
            // If security is enabled at channel level, count all verbs (subscribe/publish) in this channel
            if (channelObj.subscribe) {
                operationWithSecurityCount++;
            }
            if (channelObj.publish) {
                operationWithSecurityCount++;
            }
        }
        // Count total operations
        if (channelObj.subscribe) {
            operationCount++;
        }
        if (channelObj.publish) {
            operationCount++;
        }
    });

    return operationCount > 0 && (
        <Grid container direction='row' justify='flex-end' alignItems='center'>
            <Grid item>
                <Box mr={2} my={1} display='flex'>
                    {(operationWithSecurityCount === 0)
                    && (
                        <Tooltip
                            title='Enable security for all'
                        >
                            <div>
                                <IconButton
                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                    onClick={enableSecurity}
                                    aria-label='enable security for all'
                                    size='large'
                                >
                                    <LockOpenIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}
                    {(operationWithSecurityCount === operationCount)
                    && (
                        <Tooltip
                            title='Disable security for all'
                        >
                            <div>
                                <IconButton
                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                    onClick={disableSecurity}
                                    aria-label='disable security for all'
                                    size='large'
                                >
                                    <LockIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}
                    {(operationWithSecurityCount !== 0 && operationWithSecurityCount !== operationCount)
                    && (
                        <Tooltip
                            title='Enable security for all'
                        >
                            <div>
                                <IconButton
                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                    onClick={enableSecurity}
                                    aria-label='enable security for all'
                                    size='large'
                                >
                                    <LockOpenTwoToneIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}

TopicsOperationsSelector.defaultProps = {};

TopicsOperationsSelector.propTypes = {
    operations: PropTypes.shape({}).isRequired,
    enableSecurity: PropTypes.func.isRequired,
    disableSecurity: PropTypes.func.isRequired,
};
