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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { SubscriptionPoliciesManage } from '../../../src/app/components/Apis/Details/Subscriptions/SubscriptionPoliciesManage';

jest.mock('AppData/api', () => ({
    __esModule: true,
    default: {
        policies: jest.fn(),
        asyncAPIPolicies: jest.fn(),
        CONSTS: {
            APIProduct: 'APIProduct',
        },
    },
}));

jest.mock('AppData/MCPServer', () => ({
    __esModule: true,
    default: {
        CONSTS: {
            MCP: 'MCP',
        },
    },
}));

jest.mock('AppData/AuthManager', () => ({
    isRestricted: jest.fn(() => false),
}));

jest.mock('Config', () => ({
    __esModule: true,
    default: {
        app: {
            subscriptionPolicyLimit: 25,
        },
    },
}));

const API = require('AppData/api').default;

const baseProps = {
    classes: {},
    api: {
        type: 'HTTP',
        apiType: 'API',
        securityScheme: [],
        policies: [],
        subtypeConfiguration: {},
    },
    intl: {
        formatMessage: jest.fn(),
    },
    policies: [],
    setPolices: jest.fn(),
    subValidationDisablingAllowed: false,
};

function renderComponent(props = {}) {
    return render(
        <IntlProvider locale='en'>
            <SubscriptionPoliciesManage {...baseProps} {...props} />
        </IntlProvider>,
    );
}

function createPolicies(start, count) {
    return Array.from({ length: count }, (_, index) => ({
        displayName: `Plan${start + index}`,
        description: `Description ${start + index}`,
    }));
}

describe('SubscriptionPoliciesManage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders pagination and fetches the next page for regular APIs', async () => {
        API.policies
            .mockResolvedValueOnce({
                body: {
                    list: createPolicies(1, 25),
                    count: 25,
                    pagination: { total: 30 },
                },
            })
            .mockResolvedValueOnce({
                body: {
                    list: createPolicies(26, 5),
                    count: 5,
                    pagination: { total: 30 },
                },
            });

        renderComponent();

        await screen.findByTestId('policy-checkbox-plan1');
        expect(screen.getByText('Rows per page:')).toBeInTheDocument();
        expect(API.policies).toHaveBeenCalledWith('subscription', 25, false, undefined, undefined);

        fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

        await waitFor(() => {
            expect(API.policies).toHaveBeenLastCalledWith('subscription', 25, false, undefined, 25);
        });
        await screen.findByTestId('policy-checkbox-plan26');
    });

    it('resets to the first page when rows per page changes', async () => {
        API.policies
            .mockResolvedValueOnce({
                body: {
                    list: createPolicies(1, 25),
                    count: 25,
                    pagination: { total: 30 },
                },
            })
            .mockResolvedValueOnce({
                body: {
                    list: createPolicies(1, 10),
                    count: 10,
                    pagination: { total: 30 },
                },
            });

        renderComponent();

        await screen.findByTestId('policy-checkbox-plan1');
        fireEvent.mouseDown(screen.getByLabelText('Rows per page:'));
        fireEvent.click(await screen.findByRole('option', { name: '10' }));

        await waitFor(() => {
            expect(API.policies).toHaveBeenLastCalledWith('subscription', 10, false, undefined, undefined);
        });
    });

    it('paginates async API policies on the async policy path', async () => {
        API.asyncAPIPolicies
            .mockResolvedValueOnce({
                body: {
                    list: createPolicies(1, 26),
                },
            })
            .mockResolvedValueOnce({
                body: {
                    list: createPolicies(26, 15),
                },
            });

        renderComponent({
            api: {
                ...baseProps.api,
                type: 'WS',
            },
        });

        await screen.findByTestId('policy-checkbox-plan1');
        expect(API.asyncAPIPolicies).toHaveBeenCalledWith(26, undefined);
        expect(API.policies).not.toHaveBeenCalled();
        expect(screen.getByText('Rows per page:')).toBeInTheDocument();
        expect(screen.queryByTestId('policy-checkbox-plan26')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

        await waitFor(() => {
            expect(API.asyncAPIPolicies).toHaveBeenLastCalledWith(26, 25);
        });
        await screen.findByTestId('policy-checkbox-plan26');
    });
});
