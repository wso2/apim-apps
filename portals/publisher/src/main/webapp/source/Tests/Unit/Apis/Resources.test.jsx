/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import API from 'AppData/api';
import { APIProvider } from 'AppComponents/Apis/Details/components/ApiContext';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import Resources from 'AppComponents/Apis/Details/Resources/Resources';

jest.mock('AppComponents/Shared/AppContext', () => ({
    ...jest.requireActual('AppComponents/Shared/AppContext'),
    usePublisherSettings: jest.fn(),
}));
jest.mock('AppComponents/Apis/Details/Resources/components/Operation', () => () => null);

const pendingPromise = () => new Promise(() => {});

function createAPI(isAPIProduct) {
    return {
        id: isAPIProduct ? 'api-product-id' : 'api-id',
        apiThrottlingPolicy: 'Unlimited',
        scopes: [],
        operations: [],
        endpointConfig: {},
        isAPIProduct: jest.fn(() => isAPIProduct),
        isSOAPToREST: jest.fn(() => false),
        getSwagger: jest.fn(pendingPromise),
    };
}

function renderResources(api) {
    return render(
        <IntlProvider locale='en'>
            <APIProvider value={{ api, updateAPI: jest.fn() }}>
                <Resources />
            </APIProvider>
        </IntlProvider>,
    );
}

describe('Resources AWS Lambda resource names', () => {
    beforeEach(() => {
        usePublisherSettings.mockReturnValue({ data: undefined, isLoading: true });
        jest.spyOn(API, 'getAmznResourceNames').mockImplementation(pendingPromise);
        jest.spyOn(API, 'getAllScopes').mockImplementation(pendingPromise);
        jest.spyOn(API, 'policies').mockImplementation(pendingPromise);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('does not request AWS Lambda resource names for an API Product', () => {
        renderResources(createAPI(true));

        expect(API.getAmznResourceNames).not.toHaveBeenCalled();
    });

    it('requests AWS Lambda resource names for a normal API', () => {
        renderResources(createAPI(false));

        expect(API.getAmznResourceNames).toHaveBeenCalledTimes(1);
        expect(API.getAmznResourceNames).toHaveBeenCalledWith('api-id');
    });
});
