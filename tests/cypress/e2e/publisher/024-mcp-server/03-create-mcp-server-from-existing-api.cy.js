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

describe("publisher-023-01 : Create MCP Server from an existing API", () => {
    const { publisher, password } = Utils.getUserInfo();
    const mcpName = Utils.generateName();
    const mcpContext = `/${mcpName.toLowerCase().replace(/-/g, '')}`;
    const mcpVersion = '1.0.0';
    const sourceApiName = Utils.generateName();
    let sourceApiId;
    let createdMcpId;

    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Creates MCP Server by selecting an existing API and its operations", () => {
        const apiPayload = JSON.stringify({
            name: sourceApiName,
            version: '1.0.0',
            context: `/${sourceApiName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            policies: ['Unlimited'],
            endpointConfig: {
                endpoint_type: 'http',
                sandbox_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
                production_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
            },
            operations: [
                { target: '/pet', verb: 'GET', authType: 'Application & Application User', throttlingPolicy: 'Unlimited' },
                { target: '/pet', verb: 'POST', authType: 'Application & Application User', throttlingPolicy: 'Unlimited' },
                { target: '/pet/findByStatus', verb: 'GET', authType: 'Application & Application User', throttlingPolicy: 'Unlimited' },
            ],
        });

        Utils.addAPI({ payload: apiPayload }).then((apiId) => {
                sourceApiId = apiId;
                expect(sourceApiId, 'Source API created').to.be.a('string');

                // Navigate directly to the existing API wizard with the source API pre-selected.
                // The wizard reads ?apiId from the URL and auto-fetches the API's operations,
                // so we skip the fragile autocomplete search-and-click interaction.
                cy.visit(`/publisher/mcp-servers/create/mcp-from-existing-api?apiId=${sourceApiId}`, { timeout: 30000 });

                // Wait for operations to load into the left transfer list.
                // ExistingAPIToolSelection fetches operations asynchronously via API.get() —
                // wait for at least one listitem before interacting with the checkbox.
                cy.get('[role="listitem"]', { timeout: 30000 }).should('have.length.greaterThan', 0);

                // Select all available operations and move them to the right list
                cy.get('input[aria-label="all items selected"]').first().click();
                cy.get('button[aria-label="move selected right"]', { timeout: 10000 })
                    .should('not.be.disabled')
                    .click();

                // Next button becomes enabled when operations are selected
                cy.get('#open-api-create-next-btn', { timeout: 15000 })
                    .should('not.have.class', 'Mui-disabled')
                    .click();

                // Step 2: Fill MCP Server details.
                // mcpServerInputs starts with empty name/context/version in this wizard,
                // so we must type all fields AND blur the last one to complete form validation.
                // Note: when isMCPServer=true, context field uses id='context' (no InputProps.id).
                cy.get('#itest-id-apiname-input', { timeout: 15000 }).clear().type(mcpName);
                cy.get('#context').clear().type(mcpContext);
                cy.get('#itest-id-apiversion-input').clear().type(mcpVersion).blur();

                cy.intercept('POST', '**/mcp-servers/generate-from-api').as('createMcp');
                cy.get('#open-api-create-next-btn').should('not.have.class', 'Mui-disabled').click();
                cy.wait('@createMcp', { timeout: 30000 });

                // Should redirect to overview page
                cy.url({ timeout: 15000 }).should('match', /\/publisher\/mcp-servers\/[^/]+\/overview/);
                cy.get('#itest-api-name-version', { timeout: 15000 }).should('contain', mcpName);

                cy.url().then((url) => {
                    const match = url.match(/mcp-servers\/([^/]+)\/overview/);
                    if (match) {
                        createdMcpId = match[1];
                    }
                });
            });
    });

    afterEach(() => {
        if (createdMcpId) {
            Utils.deleteMCPServer(createdMcpId);
            createdMcpId = null;
        }
        if (sourceApiId) {
            Utils.deleteAPI(sourceApiId);
            sourceApiId = null;
        }
    });
});
