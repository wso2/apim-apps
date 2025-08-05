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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MCPPlayground from '@wso2-org/mcp-playground';

const MCPTryOut = ({
    api, accessToken, authorizationHeader, securitySchemeType,
}) => {
    const [token, setToken] = useState('');

    useEffect(() => {
        if (securitySchemeType === 'API-KEY') {
            setToken(accessToken);
        } else if (securitySchemeType === 'BASIC') {
            setToken('Basic ' + accessToken);
        } else if (securitySchemeType === 'TEST') {
            setToken(accessToken);
        } else if (api.advertiseInfo && api.advertiseInfo.advertised) {
            if (authorizationHeader) {
                setToken(accessToken);
            }
        } else {
            setToken('Bearer ' + accessToken);
        }
    }, [securitySchemeType, authorizationHeader, accessToken]);

    return (
        <MCPPlayground
            url={api.endpointURLs[0].URLs.https || api.endpointURLs[0].URLs.http}
            token={token}
            headerName={authorizationHeader}
            shouldSetHeaderNameExternally
        />
    );
};

MCPTryOut.propTypes = {
    api: PropTypes.shape({
        context: PropTypes.string.isRequired,
    }).isRequired,
    accessToken: PropTypes.string.isRequired,
    authorizationHeader: PropTypes.string.isRequired,
    securitySchemeType: PropTypes.string.isRequired,
};

export default MCPTryOut;
