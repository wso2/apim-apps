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
import PropTypes from 'prop-types';
import {
    render, screen, fireEvent, act, waitFor, within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import toast, { Toaster } from 'react-hot-toast';
import {
    useAIGatewayRecommendationToast,
    TOAST_TYPES,
} from './AIGatewayRecommendationToast';

const AI_GATEWAY_DOCS_URL = 'https://apim.docs.wso2.com/en/latest/ai-gateway/choreo-ai-gateway/';

const Harness = ({ type }) => {
    const show = useAIGatewayRecommendationToast(type);
    return (
        <>
            <button type='button' onClick={show}>show</button>
            <button type='button'>other action</button>
            <p>plain text</p>
        </>
    );
};

Harness.propTypes = {
    type: PropTypes.string.isRequired,
};

// The outside-click listener is attached on the next macrotask after the toast opens.
const waitForListener = () => act(() => new Promise((resolve) => { setTimeout(resolve, 10); }));
const expectToastGone = (testId) => waitFor(() => {
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
}, { timeout: 3000 });

const renderWithToaster = (type) => render(
    <IntlProvider locale='en' defaultLocale='en'>
        <Toaster />
        <Harness type={type} />
    </IntlProvider>,
);

describe('AIGatewayRecommendationToast', () => {
    afterEach(() => {
        act(() => {
            toast.remove();
        });
    });

    test('shows the AI API toast with the recommendation and GET STARTED link', async () => {
        renderWithToaster(TOAST_TYPES.AI_API);
        fireEvent.click(screen.getByText('show'));

        const toastEl = await screen.findByTestId('ai-gateway-toast-aiApi');
        expect(toastEl).toHaveTextContent('Creating an AI API?');
        expect(toastEl).toHaveTextContent(
            'We recommend the Choreo AI Gateway, managed through the Choreo Agent Control Plane, '
            + 'for all new AI APIs and MCP Servers.',
        );
        expect(within(toastEl).getByText('Choreo AI Gateway', { selector: 'strong' })).toBeInTheDocument();
        expect(within(toastEl).getByText('Choreo Agent Control Plane', { selector: 'strong' }))
            .toBeInTheDocument();

        const link = screen.getByTestId('ai-gateway-toast-get-started');
        expect(link).toHaveTextContent('Get Started');
        expect(link).toHaveAttribute('href', AI_GATEWAY_DOCS_URL);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(toastEl.textContent).not.toMatch(/deprecat|end of life|EOL|\d/i);
    });

    test('shows the MCP Server toast title', async () => {
        renderWithToaster(TOAST_TYPES.MCP_SERVER);
        fireEvent.click(screen.getByText('show'));

        const toastEl = await screen.findByTestId('ai-gateway-toast-mcpServer');
        expect(toastEl).toHaveTextContent('Creating an MCP Server?');
    });

    test('does not stack duplicates while visible', async () => {
        renderWithToaster(TOAST_TYPES.AI_API);
        fireEvent.click(screen.getByText('show'));
        fireEvent.click(screen.getByText('show'));
        fireEvent.click(screen.getByText('show'));

        await screen.findByTestId('ai-gateway-toast-aiApi');
        expect(screen.getAllByTestId('ai-gateway-toast-aiApi')).toHaveLength(1);
    });

    test('can be closed and is shown again on the next trigger', async () => {
        renderWithToaster(TOAST_TYPES.AI_API);
        fireEvent.click(screen.getByText('show'));
        await screen.findByTestId('ai-gateway-toast-aiApi');

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        await expectToastGone('ai-gateway-toast-aiApi');

        fireEvent.click(screen.getByText('show'));
        expect(await screen.findByTestId('ai-gateway-toast-aiApi')).toBeInTheDocument();
    });

    test('is not closed by the click that opened it', async () => {
        renderWithToaster(TOAST_TYPES.AI_API);
        fireEvent.click(screen.getByText('show'));
        await screen.findByTestId('ai-gateway-toast-aiApi');
        await waitForListener();

        expect(screen.getByTestId('ai-gateway-toast-aiApi')).toBeVisible();
    });

    test('closes when the user clicks any other button on the page', async () => {
        renderWithToaster(TOAST_TYPES.AI_API);
        fireEvent.click(screen.getByText('show'));
        await screen.findByTestId('ai-gateway-toast-aiApi');
        await waitForListener();

        fireEvent.click(screen.getByText('other action'));
        await expectToastGone('ai-gateway-toast-aiApi');
    });

    test('stays open when the user clicks content that is not a button or link', async () => {
        renderWithToaster(TOAST_TYPES.MCP_SERVER);
        fireEvent.click(screen.getByText('show'));
        await screen.findByTestId('ai-gateway-toast-mcpServer');
        await waitForListener();

        fireEvent.click(screen.getByText('plain text'));
        await waitForListener();
        expect(screen.getByTestId('ai-gateway-toast-mcpServer')).toBeVisible();
    });

    test('fades out as soon as it is dismissed', async () => {
        renderWithToaster(TOAST_TYPES.AI_API);
        fireEvent.click(screen.getByText('show'));
        await screen.findByTestId('ai-gateway-toast-aiApi');

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.getByTestId('ai-gateway-toast-aiApi')).toHaveStyle({ opacity: '0' });
        await expectToastGone('ai-gateway-toast-aiApi');
    });
});
