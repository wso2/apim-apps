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

describe("devportal-005-01 : Subscribe to an MCP Server from the DevPortal", () => {
    const { publisher, developer, password } = Utils.getUserInfo();
    const appName = Utils.generateName();
    const appDescription = 'Test app for MCP Server subscription';
    let mcpId;

    Cypress.on('uncaught:exception', () => false);

    // Login as publisher to establish a session for MCP creation.
    // The test itself switches to developer to perform the subscription.
    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Subscribe to a published MCP Server and verify subscription appears in the list", () => {
        createPublishedMcpServer().then(({ mcpId: id }) => {
            mcpId = id;

            cy.logoutFromPublisher();
            cy.loginToDevportal(developer, password);

            // Create an application in the DevPortal
            cy.createApp(appName, appDescription);

            // Navigate to the MCP Server overview in the DevPortal
            cy.visit(`/devportal/mcp-servers/${mcpId}/overview?tenant=carbon.super`, largeTimeout);
            cy.get('#left-menu-credentials', largeTimeout).click();

            // Subscribe using the newly created application
            cy.get('#application-subscribe', largeTimeout).click();
            cy.get('.MuiAutocomplete-popper li', largeTimeout).contains(appName).click();
            cy.get('#subscribe-to-api-btn').click();

            // Subscription should appear in the subscriptions table
            cy.get('#subscription-table td', largeTimeout).contains(appName).should('exist');
        });
    });

    afterEach(() => {
        // Delete app first to remove subscriptions, then the published MCP can be deleted directly.
        cy.deleteApp(appName);
        if (mcpId) {
            Utils.deleteMCPServer(mcpId);
            mcpId = null;
        }
    });
});
