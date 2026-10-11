/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

import Utils from "@support/utils";

/**
 * Mocks the actual tool invocation (tools/call) with a canned success result, leaving
 * initialize/notifications/tools-list to pass through untouched - the gateway answers
 * those directly from the MCP server's own stored metadata, never touching the backend.
 * tools/call is the only step that would otherwise reach the (placeholder, unreachable)
 * backend URL, so intercepting just that call here means no real backend is ever needed.
 */
function mockToolCallSuccess() {
    cy.intercept('POST', '**/mcp', (req) => {
        if (req.body && req.body.method === 'tools/call') {
            req.reply({
                statusCode: 200,
                body: {
                    jsonrpc: '2.0',
                    id: req.body.id,
                    result: {
                        content: [{ type: 'text', text: JSON.stringify({ mockToolResult: 'success-verified' }) }],
                        isError: false,
                    },
                },
            });
        } else {
            req.continue();
        }
    }).as('mcpToolCall');
}

describe("publisher-023-06 : MCP Server Publisher Playground", () => {
    const { publisher, password } = Utils.getUserInfo();
    let mcpId;
    let sourceApiId;

    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("MCP Playground connects to an MCP server and invokes a tool", () => {
        Utils.createMockToolMcpServer().then(({ mcpId: createdId, sourceApiId: createdSrcId }) => {
            mcpId = createdId;
            sourceApiId = createdSrcId;

            mockToolCallSuccess();

            // Navigate to the publisher MCP playground.
            cy.visit(`/publisher/mcp-servers/${mcpId}/mcp-playground`, { timeout: 30000 });

            // Wait until the Connect button is enabled. The playground auto-generates an
            // internal key on load; the button stays active once the key is ready.
            cy.contains('button', 'Connect', { timeout: 30000 }).should('not.be.disabled');

            // The MCPPlayground component (G8) propagates the token from the parent
            // TryOutConsole into its own internal state via a useEffect. The button
            // becomes enabled once TryOutConsole's apiKey is set, but G8's internal
            // token state lags one render behind (the useEffect fires after the paint).
            // If Connect is clicked in that window, the connect closure runs with
            // token=undefined — no Internal-Key header is sent and the gateway returns
            // 401, silently failing. 1 second is not enough when preceding specs have
            // loaded the browser (heavier JS context slows React scheduling), so we
            // wait 3 seconds to ensure the second render has settled before clicking.
            cy.wait(3000);

            // Click Connect and wait for the MCP session to be established.
            cy.contains('button', 'Connect').should('not.be.disabled').click();

            // "Disconnect" appearing confirms the connection is live.
            cy.contains('button', 'Disconnect', { timeout: 60000 }).should('be.visible');

            // Tools are not fetched automatically — click "List Tools" to retrieve them.
            cy.contains('button', 'List Tools', { timeout: 15000 }).click();

            cy.contains(Utils.getMockToolName(), { timeout: 15000 }).click();

            // The Run Tool button is enabled for the selected tool.
            cy.contains('button', 'Run Tool', { timeout: 15000 }).should('not.be.disabled').click();

            // The mocked tools/call response should render as a successful result.
            cy.wait('@mcpToolCall');
            cy.contains('Tool Result', { timeout: 30000 }).should('be.visible');
            cy.contains('success-verified', { timeout: 15000 }).should('be.visible');
        });
    });

    afterEach(() => {
        if (mcpId) {
            Utils.deleteMCPServer(mcpId);
            mcpId = null;
        }
        if (sourceApiId) {
            Utils.deleteAPI(sourceApiId);
            sourceApiId = null;
        }
    });
});
