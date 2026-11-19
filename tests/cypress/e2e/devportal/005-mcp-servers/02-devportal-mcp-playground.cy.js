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

const largeTimeout = { timeout: Cypress.env('largeTimeout') || 30000 };

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

describe("devportal-005-02 : DevPortal MCP Playground — connect and invoke a tool", () => {
    const { publisher, developer, password } = Utils.getUserInfo();
    const appName = Utils.generateName();
    const appDescription = 'Test app for MCP Playground';
    let mcpId;
    let sourceApiId;

    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("MCP Playground connects and invokes a tool after subscribing", () => {
        Utils.createMockToolMcpServer().then(({ mcpId: createdId, sourceApiId: createdSrcId }) => {
            mcpId = createdId;
            sourceApiId = createdSrcId;

            mockToolCallSuccess();

            // Switch to the DevPortal as the developer user.
            cy.logoutFromPublisher();
            cy.loginToDevportal(developer, password);

            // Create an application and subscribe to the MCP server.
            cy.createApp(appName, appDescription);
            cy.visit(`/devportal/mcp-servers/${mcpId}/overview?tenant=carbon.super`, largeTimeout);
            cy.get('#left-menu-credentials', largeTimeout).click();
            cy.get('#application-subscribe', largeTimeout).click();
            cy.get('.MuiAutocomplete-popper li', largeTimeout).contains(appName).click();
            cy.get('#subscribe-to-api-btn').click();
            cy.get('#subscription-table td', largeTimeout).contains(appName).should('exist');

            // Generate production OAuth keys for the application so that
            // "GET TEST KEY" in the playground Configuration drawer can issue a token.
            cy.get(`#${appName}-PK`).click();
            cy.get('#generate-keys').click();
            cy.get('[data-testid="create-secret-button"]', largeTimeout).should('be.visible').and('not.be.disabled').click();
            // The generated secret is only shown once, in this dialog — capture it now,
            // since "GET TEST KEY" below re-prompts for the consumer secret (multiple secrets mode).
            cy.get('[data-testid="secret-dialog-close"]', { timeout: 30000 }).should('be.visible');
            cy.get('#bootstrap-input').invoke('val').then((generatedSecret) => {
                Cypress.env('consumerSecret', generatedSecret);
            });
            cy.get('[data-testid="secret-dialog-close"]').click();
            cy.get('#consumer-key', largeTimeout).should('exist');

            // Navigate to the MCP Playground.
            cy.visit(`/devportal/mcp-servers/${mcpId}/overview?tenant=carbon.super`, largeTimeout);
            cy.contains('button', /try out/i, largeTimeout).click();
            cy.url({ timeout: 15000 }).should('match', /mcp-playground/);

            // The Connect button is disabled until an access token is configured.
            // Open the Configuration drawer and generate a test token.
            cy.get('[data-testid="configuration-button"]', largeTimeout).should('be.visible').click();
            cy.get('#api-chat-configure-key-drawer', largeTimeout).should('be.visible');

            // Wait for TryOutController to load subscriptions and key state, then generate a token.
            cy.get('#gen-test-key', { timeout: 30000 }).should('not.be.disabled').click();
            // Multiple-secrets mode re-prompts for the consumer secret before issuing the token.
            cy.get('#consumerSecretInput', { timeout: 30000 }).should('be.visible').clear().then(($input) => {
                const secretToType = Cypress.env('consumerSecret');
                expect(secretToType, 'consumerSecret should be set before generating the test key').to.exist;
                cy.wrap($input).type(secretToType);
            });
            cy.get('[role="dialog"]').contains('button', 'Generate').should('not.be.disabled').click();
            cy.get('#accessTokenInput', { timeout: 30000 }).invoke('val').should('not.be.empty');

            // Close the drawer — the token is now wired to the playground.
            cy.get('[data-testid="key-details-save"]').click();

            // Connect to the MCP server.
            cy.contains('button', 'Connect', largeTimeout).should('not.be.disabled').click();
            cy.contains('button', 'Disconnect', { timeout: 30000 }).should('be.visible');

            // Tools are not fetched automatically — click "List Tools" to retrieve them.
            cy.contains('button', 'List Tools', { timeout: 15000 }).click();

            cy.contains(Utils.getMockToolName(), { timeout: 15000 }).click();
            cy.contains('button', 'Run Tool', { timeout: 15000 }).should('not.be.disabled').click();

            // The mocked tools/call response should render as a successful result.
            cy.wait('@mcpToolCall');
            cy.contains('Tool Result', { timeout: 30000 }).should('be.visible');
            cy.contains('success-verified', { timeout: 15000 }).should('be.visible');
        });
    });

    afterEach(() => {
        const baseUrl = Cypress.config().baseUrl;
        const { carbonUsername, carbonPassword } = Utils.getUserInfo();

        // Deletes the MCP server and source API via admin Basic Auth. logoutFromPublisher()
        // only ends the publisher app's own session, not the underlying SSO session, so
        // re-visiting /publisher auto-authenticates as whoever is still logged in
        // (developer) instead of showing a fresh login form - cy.loginToPublisher would
        // silently fail here. Basic Auth sidesteps the cookie/session dance entirely.
        //
        // Deleting the application doesn't synchronously clear its subscription record -
        // an active subscription blocks MCP server deletion with a 409 for a short window
        // after the app delete - so retry a few times with a short wait to absorb that
        // propagation delay before giving up.
        const deleteMcpServerWithRetry = (idToDelete, retriesLeft) => {
            if (retriesLeft === undefined) retriesLeft = 5;
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/am/publisher/v4/mcp-servers/${idToDelete}`,
                auth: { username: carbonUsername, password: carbonPassword },
                failOnStatusCode: false,
            }).then((resp) => {
                if (resp.status === 409 && retriesLeft > 0) {
                    cy.wait(2000);
                    deleteMcpServerWithRetry(idToDelete, retriesLeft - 1);
                }
            });
        };

        const deleteApiResources = () => {
            if (mcpId) {
                deleteMcpServerWithRetry(mcpId);
                mcpId = null;
            }
            if (sourceApiId) {
                cy.request({
                    method: 'DELETE',
                    url: `${baseUrl}/api/am/publisher/v4/apis/${sourceApiId}`,
                    auth: { username: carbonUsername, password: carbonPassword },
                    failOnStatusCode: false,
                });
                sourceApiId = null;
            }
        };

        // cy.request() only carries the browser's cookies, not the SPA's own bearer-token
        // auth, so it can't authenticate against the devportal API as the developer.
        // Obtain a real developer OAuth token via DCR + password grant instead.
        cy.request({
            method: 'POST',
            url: `${baseUrl}/client-registration/v0.17/register`,
            auth: { username: 'developer', password: 'test123' },
            body: {
                clientName: 'cleanup-tmp', owner: 'developer', grantType: 'password client_credentials', saasApp: true,
            },
            failOnStatusCode: false,
        }).then((dcrResp) => {
            const { clientId, clientSecret } = dcrResp.body || {};
            if (!clientId) {
                deleteApiResources();
                return;
            }
            cy.request({
                method: 'POST',
                url: `${baseUrl}/oauth2/token`,
                auth: { username: clientId, password: clientSecret },
                form: true,
                body: {
                    grant_type: 'password', username: 'developer', password: 'test123', scope: 'apim:subscribe',
                },
                failOnStatusCode: false,
            }).then((tokenResp) => {
                const devToken = tokenResp.body && tokenResp.body.access_token;
                if (!devToken) {
                    deleteApiResources();
                    return;
                }
                cy.request({
                    method: 'GET',
                    url: `${baseUrl}/api/am/devportal/v3/applications?limit=100`,
                    auth: { bearer: devToken },
                    failOnStatusCode: false,
                }).then((appsResp) => {
                    const app = (appsResp.body.list || []).find((a) => a.name === appName);
                    if (!app) {
                        deleteApiResources();
                        return;
                    }
                    cy.request({
                        method: 'DELETE',
                        url: `${baseUrl}/api/am/devportal/v3/applications/${app.applicationId}`,
                        auth: { bearer: devToken },
                        failOnStatusCode: false,
                    }).then(() => deleteApiResources());
                });
            });
        });
    });
});
