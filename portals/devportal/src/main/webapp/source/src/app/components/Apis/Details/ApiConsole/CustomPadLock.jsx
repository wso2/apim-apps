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

import React, { useMemo } from 'react';
import 'swagger-ui-react/swagger-ui.css';
import LockIcon from '@material-ui/icons//Lock';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import { FormattedMessage } from 'react-intl';
import LockOpenIcon from '@material-ui/icons/LockOpen';

/**
 *
 *
 * @export
 * @param {*} spec
 * @param {*} resourcePath
 * @returns
 */
function isSecurityEnabled(spec, resourcePath) {
    const operation = resourcePath.reduce((a, v) => a[v], spec);
    return operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none';
}

/**
 *
 * Handles the resource level lock icon
 * @export
 * @param {*} BaseLayout
 * @param {*} props
 * @param {*} spec
 * @returns
 */
function CustomPadLock(props) {
    const {
        BaseLayout, oldProps, spec,
    } = props;
    const securityEnabled = useMemo(() => isSecurityEnabled(spec, oldProps.specPath), []);

    return (
        <div>
            <Grid container direction='row' justify='space-between' alignItems='center'>
                <Grid item md={11}>
                    <BaseLayout {...oldProps} />
                </Grid>
                <Grid item justify='flex-end' alignItems='right'>
                    <Tooltip
                        title={
                            (securityEnabled)
                                ? (
                                    <FormattedMessage
                                        id={'Apis.Details.Resources.components.Operation.disable.security'
                                            + '.when.used.in.api.products'}
                                        defaultMessage='Security enabled'
                                    />
                                )
                                : (
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
                        <IconButton
                            aria-label='Security'
                        >
                            {(securityEnabled)
                                ? <LockIcon fontSize='small' />
                                : <LockOpenIcon fontSize='small' />}
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </div>
    );
}

export default React.memo(CustomPadLock);
