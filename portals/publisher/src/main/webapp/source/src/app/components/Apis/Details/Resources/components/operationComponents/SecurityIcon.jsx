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
import { IconButton, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { FormattedMessage } from 'react-intl';

/**
 * Security icon component for operations
 * @param {Object} props - Component props
 * @param {Object} props.operation - Operation object
 * @param {Array} props.componentValidator - Component validator array
 * @returns {JSX.Element|null} Security icon or null
 */
const SecurityIcon = ({ operation, componentValidator }) => {
    if (!componentValidator.includes('operationSecurity')) {
        return null;
    }

    const isSecurityEnabled = operation['x-auth-type'] && 
        operation['x-auth-type'].toLowerCase() !== 'none';

    return (
        <Tooltip
            title={
                isSecurityEnabled ? (
                    <FormattedMessage
                        id='Apis.Details.Resources.components.Operation.disable.security.when.used.in.api.products'
                        defaultMessage='Security enabled'
                    />
                ) : (
                    <FormattedMessage
                        id='Apis.Details.Resources.components.enabled.security'
                        defaultMessage='No security'
                    />
                )
            }
            aria-label={(
                <FormattedMessage
                    id='Apis.Details.Resources.components.Operation.security.operation'
                    defaultMessage='Security '
                />
            )}
        >
            <IconButton aria-label='Security' size='large'>
                {isSecurityEnabled ? (
                    <LockIcon fontSize='small' />
                ) : (
                    <LockOpenIcon fontSize='small' />
                )}
            </IconButton>
        </Tooltip>
    );
};

SecurityIcon.propTypes = {
    operation: PropTypes.shape({
        'x-auth-type': PropTypes.string,
    }).isRequired,
    componentValidator: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SecurityIcon;