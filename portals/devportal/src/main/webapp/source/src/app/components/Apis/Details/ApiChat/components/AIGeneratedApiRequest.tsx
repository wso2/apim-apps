/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect } from 'react';

interface AIGeneratedApiRequestProps {
    spec: any;
    api: any;
    accessTokenProvider: any;
    authorizationHeader: string;
    securitySchemeType: string;
}

interface ApiRequestObject {
    url: string;
    credentials: string,
    headers: any;
    method: string;
}

const AIGeneratedApiRequest: React.FC<AIGeneratedApiRequestProps> = ({
    api,
    spec,
    accessTokenProvider,
    authorizationHeader,
    securitySchemeType,
}) => {
    const generateRequestInterceptor = (req: ApiRequestObject, accessToken: string) => {
        const { url } = req;
        const { context } = api;
        const patternToCheck = `${context}/*`;
        if (securitySchemeType === 'API-KEY') {
            req.headers[authorizationHeader] = accessToken;
        } else if (securitySchemeType === 'BASIC') {
            req.headers[authorizationHeader] = 'Basic ' + accessToken;
        } else if (securitySchemeType === 'TEST') {
            req.headers[authorizationHeader] = accessToken;
        } else if (api.advertiseInfo && api.advertiseInfo.advertised && authorizationHeader !== '') {
            req.headers[authorizationHeader] = accessToken;
        } else {
            req.headers[authorizationHeader] = 'Bearer ' + accessToken;
        }
        if (url.endsWith(patternToCheck)) {
            req.url = url.substring(0, url.length - 2);
        } else if (url.includes(patternToCheck + '?')) { // Check for query parameters.
            const splitTokens = url.split('/*?');
            req.url = splitTokens.length > 1 ? splitTokens[0] + '?' + splitTokens[1] : splitTokens[0];
        }
        return req;
    };

    useEffect(() => {
        const accessToken = accessTokenProvider();
        if (accessToken) {
            const temp = generateRequestInterceptor(
                {
                    url: 'https://localhost:8243/pizzashack/1.0.0/menu',
                    credentials: 'same-origin',
                    headers: {
                        accept: 'application/json',
                    },
                    method: 'GET',
                },
                accessToken,
            );
            console.log(spec.servers[0].url);
            console.log(temp);
        }
    });

    return <div />;
};

export default AIGeneratedApiRequest;
