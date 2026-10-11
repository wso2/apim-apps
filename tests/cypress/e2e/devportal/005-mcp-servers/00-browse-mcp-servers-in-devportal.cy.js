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
 * Creates, deploys, and publishes an MCP server using Utils methods.
 * Returns { mcpId, name }.
 */
function createPublishedMcpServer() {
    const name = `TestMCP${Utils.getRandomString(4)}`;
    return Utils.addMCPServerFromEndpointConfig({ name }).then((mcpId) => {
        expect(mcpId, 'MCP server created').to.be.a('string');
        return Utils.addMCPRevision(mcpId).then((revisionId) => {
            return Utils.deployMCPRevision(mcpId, revisionId).then(() => {
                return Utils.publishMCPServer(mcpId).then(() => ({ mcpId, name }));
            });
        });
    });
}

describe("devportal-005-00 : Browse published MCP Servers in DevPortal", () => {
    const { publisher, developer, password } = Utils.getUserInfo();
    let mcpId;

    // Login as publisher before each test to establish a session for MCP creation.
    // The test itself switches to the developer role via logout+login.
    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Published MCP Server appears in DevPortal listing and can be navigated to", () => {
        createPublishedMcpServer().then(({ mcpId: id, name }) => {
            mcpId = id;

            // Switch to DevPortal as developer
            cy.logoutFromPublisher();
            cy.loginToDevportal(developer, password);

            cy.visit('/devportal/mcp-servers?tenant=carbon.super', largeTimeout);
            cy.get('#commonListing', largeTimeout).should('be.visible');

            // The published MCP server should appear in the listing
            cy.contains(name, largeTimeout).should('be.visible');

            // Clicking the card should navigate to the MCP server overview in DevPortal
            cy.contains(name, largeTimeout).click();
            cy.url({ timeout: 15000 }).should('match', /\/devportal\/mcp-servers\/[^/]+\/overview/);
        });
    });

    afterEach(() => {
        if (mcpId) {
            // The test switched to the developer/DevPortal session. logoutFromPublisher()
            // only ends the publisher app's own session, not the underlying SSO session, so
            // re-visiting /publisher auto-authenticates as whoever is still logged in
            // (developer) instead of showing a fresh login form - cy.loginToPublisher would
            // silently fail here. Delete via admin Basic Auth instead, sidestepping the
            // cookie/session dance entirely.
            const { carbonUsername, carbonPassword } = Utils.getUserInfo();
            cy.request({
                method: 'DELETE',
                url: `${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${mcpId}`,
                auth: { username: carbonUsername, password: carbonPassword },
                failOnStatusCode: false,
            });
            mcpId = null;
        }
    });
});
