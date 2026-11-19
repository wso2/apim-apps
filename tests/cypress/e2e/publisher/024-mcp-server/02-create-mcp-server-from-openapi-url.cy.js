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

describe("publisher-023-00 : Create MCP Server from OpenAPI URL", () => {
    const { publisher, password } = Utils.getUserInfo();
    const mcpName = Utils.generateName();
    const mcpContext = `/${mcpName.toLowerCase().replace(/-/g, '')}`;
    const mcpVersion = '1.0.0';
    const openApiUrl = 'https://petstore3.swagger.io/api/v3/openapi.json';
    const endpoint = 'https://petstore3.swagger.io/api/v3';
    let createdMcpId;

    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Creates MCP Server from OpenAPI URL via the creation wizard", () => {
        // Navigate directly to the OpenAPI import wizard (bypasses the landing page card click)
        cy.visit('/publisher/mcp-servers/create/import-api-definition', { timeout: 30000 });

        // Step 1: Provide OpenAPI URL
        // Validation fires on blur (onBlur event), not on keystroke.
        // Find the actual <input> inside the TextField wrapper and type + blur it directly.
        cy.get('[data-testid="swagger-url-endpoint"]', { timeout: 30000 }).should('be.visible');
        cy.get('[data-testid="swagger-url-endpoint"] input').clear().type(openApiUrl).blur();

        // Wait for the URL validation indicator (CheckIcon) to appear — confirms validation succeeded
        cy.get('#url-validated', { timeout: 30000 });

        // Next button becomes enabled after successful validation (allow up to 30s for React update)
        cy.get('#open-api-create-next-btn', { timeout: 30000 })
            .should('not.have.class', 'Mui-disabled')
            .click();

        // Step 2: Tool selection — select all available operations, then proceed
        // useToolSelection starts with selectedOperations=[], so Next button is disabled until
        // operations are moved to the selected (right) list.
        cy.get('input[aria-label="all items selected"]', { timeout: 30000 })
            .first()
            .should('not.be.disabled')
            .click({ force: true });
        cy.get('button[aria-label="move selected right"]', { timeout: 10000 })
            .should('not.be.disabled')
            .click();
        cy.get('#open-api-create-next-btn', { timeout: 15000 })
            .should('not.have.class', 'Mui-disabled')
            .click();

        // Step 3: Fill MCP Server details
        // Note: when isMCPServer=true, DefaultAPIForm renders the context field with id='context'
        // (no InputProps.id override), so the inner input's id is 'context', not 'itest-id-apicontext-input'.
        cy.get('#itest-id-apiname-input', { timeout: 15000 }).clear().type(mcpName);
        cy.get('#context').clear().type(mcpContext);
        cy.get('#itest-id-apiversion-input').clear().type(mcpVersion);
        cy.get('#itest-id-apiendpoint-input').clear().type(endpoint).blur();

        cy.intercept('POST', '**/mcp-servers/generate-from-openapi*').as('createMcp');
        cy.get('#open-api-create-btn').should('not.have.class', 'Mui-disabled').click();
        cy.wait('@createMcp', { timeout: 30000 });

        // Should redirect to overview page
        cy.url({ timeout: 15000 }).should('match', /\/publisher\/mcp-servers\/[^/]+\/overview/);
        cy.get('#itest-api-name-version', { timeout: 15000 }).should('contain', mcpName);

        // Capture the MCP server ID for cleanup
        cy.url().then((url) => {
            const match = url.match(/mcp-servers\/([^/]+)\/overview/);
            if (match) {
                createdMcpId = match[1];
            }
        });
    });

    afterEach(() => {
        if (createdMcpId) {
            Utils.deleteMCPServer(createdMcpId);
            createdMcpId = null;
        }
    });
});
