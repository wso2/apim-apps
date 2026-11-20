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
import {
    render, screen, fireEvent, act, waitFor,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import AIAPIMenu from './AIAPIMenu';

const theme = createTheme({ custom: { landingPage: { menu: { primary: '#0B78F0' } } } });

const mountMenu = ({ isCreateMenu = false } = {}) => {
    const location = { current: null };
    render(
        <IntlProvider locale='en' defaultLocale='en'>
            <ThemeProvider theme={theme}>
                <MemoryRouter initialEntries={['/apis/create']}>
                    <Toaster />
                    <AIAPIMenu icon='/ai-api.svg' isCreateMenu={isCreateMenu} />
                    <Route
                        path='*'
                        render={({ location: loc }) => {
                            location.current = loc;
                            return null;
                        }}
                    />
                </MemoryRouter>
            </ThemeProvider>
        </IntlProvider>,
    );
    return location;
};

describe('AIAPIMenu AI Gateway recommendation toast', () => {
    afterEach(() => {
        act(() => {
            toast.remove();
        });
    });

    test('does not show the toast before the AI API card is clicked', () => {
        mountMenu();
        expect(screen.queryByTestId('ai-gateway-toast-aiApi')).not.toBeInTheDocument();
    });

    test('shows the AI API toast when the AI API card is clicked', async () => {
        mountMenu();
        fireEvent.click(screen.getByText('AI API'));

        const toastEl = await screen.findByTestId('ai-gateway-toast-aiApi');
        expect(toastEl).toHaveTextContent('Creating an AI API?');
    });

    test('after closing the toast, following Create AI API does not show it again', async () => {
        const route = mountMenu();
        fireEvent.click(screen.getByText('AI API'));
        await screen.findByTestId('ai-gateway-toast-aiApi');

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        await waitFor(() => {
            expect(screen.queryByTestId('ai-gateway-toast-aiApi')).not.toBeInTheDocument();
        }, { timeout: 3000 });

        fireEvent.click(screen.getByText('Create AI API'));
        expect(route.current.pathname).toBe('/apis/create/ai-api');
        expect(screen.queryByTestId('ai-gateway-toast-aiApi')).not.toBeInTheDocument();
    });

    test('clicking Create AI API while the toast is open closes it and continues the flow', async () => {
        const route = mountMenu();
        fireEvent.click(screen.getByText('AI API'));
        await screen.findByTestId('ai-gateway-toast-aiApi');
        // The outside-click listener is attached on the next macrotask after the toast opens.
        await act(() => new Promise((resolve) => { setTimeout(resolve, 10); }));

        fireEvent.click(screen.getByText('Create AI API'));
        expect(route.current.pathname).toBe('/apis/create/ai-api');
        await waitFor(() => {
            expect(screen.queryByTestId('ai-gateway-toast-aiApi')).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test('does not show the toast for the create-menu variant', () => {
        mountMenu({ isCreateMenu: true });
        fireEvent.click(screen.getByText('Create AI API'));
        expect(screen.queryByTestId('ai-gateway-toast-aiApi')).not.toBeInTheDocument();
    });
});
