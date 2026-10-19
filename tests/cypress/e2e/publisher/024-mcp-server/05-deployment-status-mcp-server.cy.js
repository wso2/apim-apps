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

const largeTimeout = { timeout: Cypress.env("largeTimeout") || 30000 };

// Deploy a revision on the deployments page and verify the "Successfully Deployed"
// chip appears in the Gateways table (Deployment Status column).
// The chip is rendered by envDeploymentStatusComponent() in Environments.jsx
// when settings.isGatewayNotificationEnabled is true (confirmed in local env).
function verifyDeploymentStatusChip(visitPath) {
    cy.visit(visitPath, largeTimeout);
    cy.get('#add-description-btn', largeTimeout).scrollIntoView().click({ force: true });
    cy.get('#add-description', largeTimeout).click({ force: true });
    cy.get('#add-description').type('test');
    cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').click();

    // The Gateways table chip rendered by envDeploymentStatusComponent()
    // shows "Successfully Deployed" once the gateway picks up the revision.
    cy.contains('.MuiChip-label', 'Successfully Deployed', largeTimeout).should('be.visible');
}

describe("publisher-023-04 : Deployment status chip in Gateways table for MCP Server", () => {
    const { publisher, password } = Utils.getUserInfo();

    Cypress.on("uncaught:exception", () => false);

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Shows Successfully Deployed chip in Gateways table after deploying an MCP Server revision", () => {
        Utils.addMCPServerFromEndpointConfig({}).then((mcpId) => {
            expect(mcpId, 'MCP server created').to.be.a('string');
            verifyDeploymentStatusChip(`/publisher/mcp-servers/${mcpId}/deployments`);
            Utils.deleteMCPServer(mcpId);
        });
    });
});
