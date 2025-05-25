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
import { styled } from '@mui/material/styles';
import 'swagger-ui-react/swagger-ui.css';
import LockIcon from '@mui/icons-material/Lock';
import {
    IconButton, Tooltip, Grid, Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const StyledTableCell = styled(TableCell)(() => ({
    color: 'white',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingTop: '0',
    textAlign: 'left',
}));

const StyledScopeCell = styled(TableCell)(() => ({
    color: 'white',
    padding: '0',
    textAlign: 'left',
    borderBottom: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

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
 *
 * @export
 * @param {*} spec
 * @param {*} resourcePath
 * @returns
 */
function getScopesForOperation(spec, resourcePath) {
    const operation = resourcePath.reduce((a, v) => a[v], spec);
    const security = operation.security || [];
    const scopes = [];

    security.forEach((auth) => {
        Object.values(auth).forEach((scopeList) => {
            scopes.push(...scopeList);
        });
    });
    return scopes;
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
    const scopes = useMemo(() => getScopesForOperation(spec, oldProps.specPath), []);

    return (
        <div>
            <Grid container direction='row' justifyContent='space-between' alignItems='center'>
                <Grid item md={11}>
                    <BaseLayout {...oldProps} />
                </Grid>
                <Grid item justifyContent='flex-end' alignItems='right'>
                    <Tooltip
                        title={(
                            <Table size='small'>
                                <TableBody>
                                    <TableRow>
                                        <StyledTableCell>
                                            <FormattedMessage
                                                id='Apis.Details.Resources.components.Operation.security'
                                                defaultMessage='Security'
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {securityEnabled
                                                ? (
                                                    <FormattedMessage
                                                        id='Apis.Details.Resources.components.Operation.security.enabled'
                                                        defaultMessage='Enabled'
                                                    />
                                                )
                                                : (
                                                    <FormattedMessage
                                                        id='Apis.Details.Resources.components.Operation.security.disabled'
                                                        defaultMessage='Disabled'
                                                    />
                                                )}
                                        </StyledTableCell>
                                    </TableRow>
                                    {securityEnabled && (
                                        <TableRow>
                                            <StyledTableCell>
                                                <FormattedMessage
                                                    id='Apis.Details.Resources.components.Operation.scopes'
                                                    defaultMessage='Scopes'
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell style={{ maxWidth: 100, paddingRight: 0 }}>
                                                {scopes.length > 0 && (
                                                    scopes.map((scope, index) => (
                                                    // eslint-disable-next-line react/no-array-index-key
                                                        <TableRow key={index}>
                                                            <StyledScopeCell style={{ maxWidth: 100 }}>
                                                                {scope}
                                                            </StyledScopeCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </StyledTableCell>
                                        </TableRow>
                                    )}

                                </TableBody>
                            </Table>
                        )}
                        aria-label={(
                            <FormattedMessage
                                id='Apis.Details.Resources.components.Operation.security.operation'
                                defaultMessage='Security '
                            />
                        )}
                    >
                        <IconButton aria-label='Security' size='large'>
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
