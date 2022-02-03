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
import { FormattedMessage } from 'react-intl';
import MuiAlert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import TextField from '@material-ui/core/TextField';

const ExternalEndpoint = (props) => {
    const {
        classes, apiInputs, inputsDispatcher, isValidExternalEndpoint, setValidExternalEndpoint, validateEndpoint,
    } = props;
    const handleOnChangeExternalEndpoint = (event) => {
        const { name: action, value } = event.target;
        setValidExternalEndpoint(validateEndpoint(value));
        inputsDispatcher({ action, value });
    };
    return (
        <>
            <TextField
                fullWidth
                id='itest-id-api-external-endpoint-input'
                label={(
                    <>
                        <FormattedMessage
                            id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.externalEndpoint'
                            defaultMessage='External Endpoint'
                        />
                        <sup className={classes.mandatoryStar}>*</sup>
                    </>
                )}
                name='externalEndpoint'
                value={apiInputs.externalEndpoint}
                onChange={handleOnChangeExternalEndpoint}
                helperText={
                    !isValidExternalEndpoint && (
                        <div style={{ marginTop: '10px' }}>
                            <FormattedMessage
                                id={'Apis.Create.AsyncAPI.ApiCreateAsyncAPI'
                                + '.externalEndpoint.error'}
                                defaultMessage='Invalid Endpoint URL'
                            />
                        </div>
                    )
                }
                error={!isValidExternalEndpoint}
                margin='normal'
                variant='outlined'
            />
            <MuiAlert severity='warning' className={classes.externalEndpointWarning}>
                <AlertTitle>
                    <FormattedMessage
                        id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.advertiseOnly.warning.title'
                        defaultMessage='"Other" type streaming APIs will be created as third party APIs.'
                    />
                </AlertTitle>
                <FormattedMessage
                    id='Apis.Create.AsyncAPI.ApiCreateAsyncAPI.advertiseOnly.warning'
                    defaultMessage={'API Manager only supports the streaming APIs of types'
                    + ' WebSocket, SSE and WebSub. Please create one of the supported types'
                    + ' if you want to deploy it in the gateway.'}
                />
            </MuiAlert>
        </>
    );
};

export default ExternalEndpoint;
