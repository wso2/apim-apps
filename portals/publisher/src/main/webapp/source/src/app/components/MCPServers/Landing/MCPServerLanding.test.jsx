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
import { render, screen, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import MCPServerLanding from './index';

// The create cards are not under test here; stub them to keep the test focused on the landing behaviour.
jest.mock('./MCPFromOpenAPIDefinition', () => () => <div>Import API Definition</div>);
jest.mock('./MCPFromExistingAPI', () => () => <div>Start from Existing API</div>);
jest.mock('./MCPFromMCPServerURL', () => () => <div>Proxy Existing MCP Server</div>);
jest.mock('AppComponents/Shared', () => ({ useBackNavigation: () => jest.fn() }));

const theme = createTheme({
    custom: {
        landingPage: {
            icons: {
                mcpServerFromScratchIcon: '', mcpServerFromExistingApiIcon: '', mcpServerProxyIcon: '',
            },
        },
    },
});

const renderAt = (path) => render(
    <IntlProvider locale='en' defaultLocale='en'>
        <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={[path]}>
                <Toaster />
                <MCPServerLanding />
            </MemoryRouter>
        </ThemeProvider>
    </IntlProvider>,
);

describe('MCPServerLanding AI Gateway recommendation toast', () => {
    afterEach(() => {
        act(() => {
            toast.remove();
        });
    });

    test('shows the MCP Server toast on the landing page (MCP Server tab selected)', async () => {
        renderAt('/');
        const toastEl = await screen.findByTestId('ai-gateway-toast-mcpServer');
        expect(toastEl).toHaveTextContent('Creating an MCP Server?');
        expect(screen.getByText('Import API Definition')).toBeInTheDocument();
    });

    test('shows the MCP Server toast on the create MCP Server page', async () => {
        renderAt('/mcp-servers/create');
        expect(await screen.findByTestId('ai-gateway-toast-mcpServer')).toBeInTheDocument();
        expect(screen.getByText('Create a new MCP Server')).toBeInTheDocument();
    });

    test('does not show the toast on the MCP Server listing page', async () => {
        renderAt('/mcp-servers');
        expect(await screen.findByText('Import API Definition')).toBeInTheDocument();
        expect(screen.queryByTestId('ai-gateway-toast-mcpServer')).not.toBeInTheDocument();
        expect(screen.queryByTestId('ai-gateway-toast-aiApi')).not.toBeInTheDocument();
    });
});
