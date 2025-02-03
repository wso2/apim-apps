/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
// import { FormattedMessage } from 'react-intl';
import EndpointTextField from './EndpointTextField';
// import GenericEndpoint from '../GenericEndpoint';

const EndpointSection = () => {
    return (
        <div>
            <EndpointTextField />
            {/* <GenericEndpoint
                autoFocus
                name={(
                    <FormattedMessage
                        id='Apis.Details.Endpoints.MultiEndpointComponents.EndpointSection.endpoint.header'
                        defaultMessage= 
                    />
                )}
                className={classes.
                    defaultEndpointWrapper}
                endpointURL={getEndpoints
                (
                    'sandbox_endpoints'
                )}
                type=''
                index={0}
                category='sandbox_endpoints'
                editEndpoint={editEndpoint}
                esCategory='sandbox'
                setAdvancedConfigOpen=
                    {toggleAdvanceConfig}
                setESConfigOpen=
                    {toggleEndpointSecurityConfig}
                apiId={api.id}
            />
            {endpointCategory.sandbox &&
                    api.subtypeConfiguration?.subtype === 'AIAPI' &&
                    (apiKeyParamConfig.authHeader || apiKeyParamConfig.authQueryParameter) &&
                    (<AIEndpointAuth
                        api={api}
                        saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                        apiKeyParamConfig={apiKeyParamConfig}
                    />)} */}
        </div>
    );
};

export default EndpointSection; 