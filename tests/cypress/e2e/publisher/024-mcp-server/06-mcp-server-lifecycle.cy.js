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
 * Creates an MCP server, creates a revision, deploys it, then returns the mcpId.
 * Deployment is a prerequisite for the Publish button to become active.
 */
function createDeployedMcpServer() {
    return Utils.addMCPServerFromEndpointConfig({}).then((mcpId) => {
        expect(mcpId, 'MCP server created').to.be.a('string');
        return Utils.addMCPRevision(mcpId).then((revisionId) => {
            return Utils.deployMCPRevision(mcpId, revisionId).then(() => mcpId);
        });
    });
}

describe("publisher-023-05 : MCP Server lifecycle transitions", () => {
    const { publisher, password } = Utils.getUserInfo();
    let testMcpId;

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Can publish a deployed MCP Server and see state change to Published", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        createDeployedMcpServer().then((id) => {
            testMcpId = id;
            cy.visit(`/publisher/mcp-servers/${testMcpId}/lifecycle`, largeTimeout);

            cy.get('[data-testid="Publish-btn"]', largeTimeout)
                .should('not.have.class', 'Mui-disabled')
                .click();

            cy.get('button[data-testid="Demote to Created-btn"]', largeTimeout).should('be.visible');
        });
    });

    it.only("Can publish then deprecate an MCP Server via the lifecycle UI", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        createDeployedMcpServer().then((id) => {
            testMcpId = id;
            cy.visit(`/publisher/mcp-servers/${testMcpId}/lifecycle`, largeTimeout);

            // First publish via the UI
            cy.get('[data-testid="Publish-btn"]', largeTimeout)
                .should('not.have.class', 'Mui-disabled')
                .click();

            // Confirm we are in Published state
            cy.get('button[data-testid="Demote to Created-btn"]', largeTimeout).should('be.visible');

            // Now deprecate — requires confirmation dialog
            cy.get('[data-testid="Deprecate-btn"]', largeTimeout)
                .should('not.have.class', 'Mui-disabled')
                .click();
            cy.get('#itest-id-conf', largeTimeout).contains('DEPRECATE').click();

            // After deprecating, Retire button confirms Deprecated state
            cy.get('button[data-testid="Retire-btn"]', largeTimeout).should('be.visible');
        });
    });

    afterEach(() => {
        if (testMcpId) {
            Utils.deleteMCPServer(testMcpId);
            testMcpId = null;
        }
    });
});
