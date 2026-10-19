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

describe("publisher-023-03 : MCP Server tools management (edit and add tools)", () => {
    const { publisher, password } = Utils.getUserInfo();
    let mcpId;
    let sourceApiId;

    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    function setupMcpWithTools(suffix) {
        const srcName = `TestSrc${suffix}`;
        const srcContext = `/testsrc${suffix}`;
        const mcpName = `TestMcp${suffix}`;
        const mcpContext = `/testmcp${suffix}`;

        const srcPayload = JSON.stringify({
            name: srcName,
            version: '1.0.0',
            context: srcContext,
            policies: ['Unlimited'],
            endpointConfig: {
                endpoint_type: 'http',
                sandbox_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
                production_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
            },
            operations: [
                { target: '/pet', verb: 'GET', authType: 'Application & Application User', throttlingPolicy: 'Unlimited' },
                { target: '/pet', verb: 'POST', authType: 'Application & Application User', throttlingPolicy: 'Unlimited' },
            ],
        });

        return Utils.addAPI({ payload: srcPayload }).then((createdSrcId) => {
            expect(createdSrcId, 'Source API created').to.be.a('string');

            const mcpPayload = JSON.stringify({
                name: mcpName,
                version: '1.0.0',
                context: mcpContext,
                policies: ['Unlimited'],
                endpointConfig: {
                    endpoint_type: 'http',
                    sandbox_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
                    production_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
                },
                transport: ['http', 'https'],
                visibility: 'PUBLIC',
                operations: [
                    {
                        feature: 'TOOL',
                        apiOperationMapping: {
                            apiId: createdSrcId,
                            apiName: srcName,
                            apiVersion: '1.0.0',
                            apiContext: srcContext,
                            backendOperation: { target: '/pet', verb: 'GET' },
                        },
                    },
                    {
                        feature: 'TOOL',
                        apiOperationMapping: {
                            apiId: createdSrcId,
                            apiName: srcName,
                            apiVersion: '1.0.0',
                            apiContext: srcContext,
                            backendOperation: { target: '/pet', verb: 'POST' },
                        },
                    },
                ],
            });

            return Utils.addMCPServerFromEndpointConfig({ payload: mcpPayload }).then((createdMcpId) => {
                expect(createdMcpId, 'MCP created').to.be.a('string');
                return cy.wrap({ sourceApiId: createdSrcId, mcpId: createdMcpId });
            });
        });
    }

    it.only("Can expand a tool accordion and edit its name and description, then save", () => {
        const suffix = Utils.getRandomString(5);
        const updatedToolName = `renamedtool_${suffix}`;
        const updatedDescription = `Updated description ${suffix}`;

        setupMcpWithTools(suffix).then(({ sourceApiId: srcId, mcpId: id }) => {
            sourceApiId = srcId;
            mcpId = id;

            // In combined runs the publisher session can become invalid during the curl
            // setup phase (SSO token expiry / redirect state), causing a 401 on the
            // subsequent cy.visit. Explicitly log out and back in to get a fresh session
            // before navigating to the MCP overview.
            cy.logoutFromPublisher();
            cy.loginToPublisher(publisher, password);
            cy.visit(`/publisher/mcp-servers/${mcpId}/overview`, { timeout: 30000 });

            // The left-menu item has visibility:hidden during the sidebar animation —
            // use { force: true } so the click fires even while the animation is in progress.
            cy.get('#left-menu-tools', { timeout: 30000 }).click({ force: true });

            // Wait for the Save button which confirms the tools page has loaded
            cy.get('#resources-save-operations', { timeout: 15000 }).should('exist');

            // Wait for at least one tool accordion to appear
            cy.get('.MuiAccordionSummary-root', { timeout: 30000 }).should('have.length.greaterThan', 0);

            // The sidebar navigation also uses MUI Accordion components, so plain
            // .MuiAccordionSummary-root would match sidebar items first. Scope to the
            // ToolDetails custom class which is applied only to tool accordions.
            cy.get('.ToolDetails-accordionContainer', { timeout: 30000 }).should('have.length.greaterThan', 0);

            // Expand the first tool accordion using native DOM click. Cypress's synthetic
            // click({ force: true }) does not reliably trigger MUI's controlled Accordion
            // onChange callback; calling .click() directly on the raw DOM element does.
            cy.get('.ToolDetails-accordionContainer').first()
                .find('.MuiAccordionSummary-root').then(($el) => $el[0].click());

            // Wait for the tool accordion to gain Mui-expanded class.
            cy.get('.ToolDetails-accordionContainer').first()
                .should('have.class', 'Mui-expanded', { timeout: 10000 });

            // Interact with the expanded accordion's Name and Description fields.
            cy.get('.ToolDetails-accordionContainer').first()
                .find('.MuiAccordionDetails-root').within(() => {
                    cy.get('input').first()
                        .clear({ force: true })
                        .type(updatedToolName, { force: true });

                    cy.get('textarea').first()
                        .clear({ force: true })
                        .type(updatedDescription, { force: true });
                });

            cy.intercept('PUT', `**/mcp-servers/${mcpId}`).as('saveMcp');
            cy.get('#resources-save-operations').click();
            cy.wait('@saveMcp', { timeout: 30000 }).then((interception) => {
                expect(interception.response.statusCode).to.equal(200);
                // The Name/Description fields edited above bind to a tool's target/description
                // (see ToolDetailsSection.jsx) - confirm the saved payload actually carries the
                // edited values, not just that the save call succeeded.
                const savedTool = interception.request.body.operations
                    .find((op) => op.target === updatedToolName);
                expect(savedTool, 'renamed tool present in saved payload').to.exist;
                expect(savedTool.description).to.equal(updatedDescription);
            });
        });
    });

    it.only("Tools page shows all tools for an MCP server created from an existing API", () => {
        const suffix = Utils.getRandomString(5);

        setupMcpWithTools(suffix).then(({ sourceApiId: srcId, mcpId: id }) => {
            sourceApiId = srcId;
            mcpId = id;

            // In combined runs the publisher session can become invalid during the curl
            // setup phase (SSO token expiry / redirect state), causing a 401 on the
            // subsequent cy.visit. Explicitly log out and back in to get a fresh session
            // before navigating to the MCP overview.
            cy.logoutFromPublisher();
            cy.loginToPublisher(publisher, password);
            cy.visit(`/publisher/mcp-servers/${mcpId}/overview`, { timeout: 30000 });
            cy.get('#left-menu-tools', { timeout: 30000 }).click({ force: true });

            cy.get('#resources-save-operations', { timeout: 15000 }).should('exist');

            // Both operations should appear as tool accordions.
            // Scope to .ToolDetails-accordionContainer to avoid matching sidebar accordions.
            cy.get('.ToolDetails-accordionContainer', { timeout: 30000 }).should('have.length', 2);
        });
    });

    it.only("Can add a new tool from an unused underlying API operation via AddTool", () => {
        // Use an underlying API with 3 operations but only map 2 as MCP tools, leaving
        // GET /pet/findByStatus available in the AddTool operation selector.
        const suffix = Utils.getRandomString(5);
        const srcName = `TestSrc${suffix}`;
        const srcContext = `/testsrc${suffix}`;
        const mcpName = `TestMcp${suffix}`;
        const mcpContext = `/testmcp${suffix}`;

        const srcPayload = JSON.stringify({
            name: srcName,
            version: '1.0.0',
            context: srcContext,
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

        Utils.addAPI({ payload: srcPayload }).then((createdSrcId) => {
            expect(createdSrcId, 'Source API created').to.be.a('string');
            sourceApiId = createdSrcId;

            const mcpPayload = JSON.stringify({
                name: mcpName,
                version: '1.0.0',
                context: mcpContext,
                policies: ['Unlimited'],
                endpointConfig: {
                    endpoint_type: 'http',
                    sandbox_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
                    production_endpoints: { url: 'https://petstore3.swagger.io/api/v3' },
                },
                transport: ['http', 'https'],
                visibility: 'PUBLIC',
                // Only 2 of the 3 underlying operations are mapped — the 3rd is left for AddTool.
                operations: [
                    {
                        feature: 'TOOL',
                        apiOperationMapping: {
                            apiId: createdSrcId,
                            apiName: srcName,
                            apiVersion: '1.0.0',
                            apiContext: srcContext,
                            backendOperation: { target: '/pet', verb: 'GET' },
                        },
                    },
                    {
                        feature: 'TOOL',
                        apiOperationMapping: {
                            apiId: createdSrcId,
                            apiName: srcName,
                            apiVersion: '1.0.0',
                            apiContext: srcContext,
                            backendOperation: { target: '/pet', verb: 'POST' },
                        },
                    },
                ],
            });

            Utils.addMCPServerFromEndpointConfig({ payload: mcpPayload }).then((createdMcpId) => {
                expect(createdMcpId, 'MCP created').to.be.a('string');
                mcpId = createdMcpId;

                cy.logoutFromPublisher();
                cy.loginToPublisher(publisher, password);
                cy.visit(`/publisher/mcp-servers/${mcpId}/overview`, { timeout: 30000 });
                cy.get('#left-menu-tools', { timeout: 30000 }).click({ force: true });
                cy.get('#resources-save-operations', { timeout: 15000 }).should('exist');

                // Confirm 2 tools are currently shown.
                cy.get('.ToolDetails-accordionContainer', { timeout: 30000 }).should('have.length', 2);

                // Select GET /pet/findByStatus from the AddTool operation autocomplete.
                // The OperationSelector renders with id="operation-autocomplete"; getOptionLabel
                // formats options as "VERB target", so we type the distinctive path segment.
                cy.get('#operation-autocomplete', { timeout: 15000 }).click().type('findByStatus');
                cy.get('.MuiAutocomplete-popper li', { timeout: 10000 })
                    .contains('/pet/findByStatus')
                    .click();

                // Auto-fill populates the name field; fill in a description and add the tool.
                cy.get('#tool-description').clear().type('Find pets by their status');
                cy.get('#add-tool-button').click();

                // The tool accordion list should grow to 3.
                cy.get('.ToolDetails-accordionContainer', { timeout: 15000 }).should('have.length', 3);

                // Save and confirm the newly added tool's mapping is actually in the payload,
                // not just that the save call succeeded.
                cy.intercept('PUT', `**/mcp-servers/${mcpId}`).as('saveMcp');
                cy.get('#resources-save-operations').click();
                cy.wait('@saveMcp', { timeout: 30000 }).then((interception) => {
                    expect(interception.response.statusCode).to.equal(200);
                    const addedTool = interception.request.body.operations.find(
                        (op) => op.apiOperationMapping?.backendOperation?.target === '/pet/findByStatus',
                    );
                    expect(addedTool, '/pet/findByStatus tool present in saved payload').to.exist;
                });
            });
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
