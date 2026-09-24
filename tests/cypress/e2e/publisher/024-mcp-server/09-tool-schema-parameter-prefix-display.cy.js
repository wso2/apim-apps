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

import Utils from '@support/utils';

const PARAMETER_PREFIXES = ['query_', 'header_', 'path_', 'cookie_', 'formData_'];

const OPENAPI_CASES = [
    {
        title: 'OpenAPI 2.0 query, header, path, and formData parameters',
        fixture: 'mcp_tool_parameter_prefixes_v2.json',
        suffix: 'v2',
        operationTarget: '/items/{itemId}',
        displayedProperties: ['filter', 'traceId', 'itemId', 'label'],
        internalProperties: ['query_filter', 'header_traceId', 'path_itemId', 'formData_label'],
    },
    {
        title: 'OpenAPI 3.0 query, header, path, and cookie parameters',
        fixture: 'mcp_tool_parameter_prefixes_v3.json',
        suffix: 'v3',
        operationTarget: '/records/{recordId}',
        displayedProperties: ['filter', 'traceId', 'recordId', 'sessionId'],
        internalProperties: ['query_filter', 'header_traceId', 'path_recordId', 'cookie_sessionId'],
    },
];

const shellQuote = (value) => `'${value.replace(/'/g, `'\\''`)}'`;

/**
 * Import an API from an OpenAPI fixture and create an MCP server that maps its first operation.
 * The resources intentionally remain in APIM after the test for manual inspection.
 * @param {object} openAPICase - OpenAPI fixture and expected schema properties
 * @returns {Cypress.Chainable<object>} The created API and MCP server details
 */
function createMCPFromOpenAPIFixture(openAPICase) {
    const suffix = `${openAPICase.suffix}_${Utils.getRandomString(7)}`;
    const apiName = `MCPToolPrefixAPI_${suffix}`;
    const apiContext = `/mcp-tool-prefix-api-${suffix.toLowerCase()}`;
    const mcpName = `MCPToolPrefixMCP_${suffix}`;
    const mcpContext = `/mcp-tool-prefix-mcp-${suffix.toLowerCase()}`;
    const fixturePath = `${Cypress.config('projectRoot')}/cypress/fixtures/api_artifacts/${openAPICase.fixture}`;
    const endpointUrl = 'http://localhost:18181';

    return new Cypress.Promise((resolve, reject) => {
        // Follow the existing Utils.getApiToken() pattern used by the Publisher Cypress specs.
        Utils.getApiToken().then((token) => {
            const additionalProperties = {
                name: apiName,
                displayName: apiName,
                version: '1.0.0',
                context: apiContext,
                description: 'Cypress fixture API for MCP tool parameter prefix display coverage.',
                endpointConfig: {
                    endpoint_type: 'http',
                    production_endpoints: { url: endpointUrl },
                    sandbox_endpoints: { url: endpointUrl },
                },
                policies: ['Unlimited'],
            };
            const importAPICommand = [
                'curl -k -sS -f -X POST',
                `-F ${shellQuote(`file=@${fixturePath};type=application/json`)}`,
                `-F ${shellQuote(`additionalProperties=${JSON.stringify(additionalProperties)}`)}`,
                `-H ${shellQuote(`Authorization: Bearer ${token}`)}`,
                shellQuote(`${Cypress.config('baseUrl')}/api/am/publisher/v4/apis/import-openapi`),
            ].join(' ');

            cy.exec(importAPICommand).then(({ stdout }) => {
                const api = JSON.parse(stdout);
                expect(api.id, 'Imported source API id').to.be.a('string');
                expect(api.operations, 'Imported source API operations').to.have.length.greaterThan(0);

                Utils.waitForApiRetrievable(token, api.id).then(() => {
                    const sourceOperation = api.operations.find((operation) => (
                        operation.target === openAPICase.operationTarget
                    ));
                    expect(sourceOperation, 'Source operation from OpenAPI fixture').to.exist;

                    const mcpPayload = {
                        name: mcpName,
                        displayName: mcpName,
                        context: mcpContext,
                        version: '1.0.0',
                        policies: ['Unlimited'],
                        transport: ['http', 'https'],
                        operations: [{
                            feature: 'TOOL',
                            authType: 'Any',
                            apiOperationMapping: {
                                apiId: api.id,
                                apiName: api.name,
                                apiVersion: api.version,
                                apiContext: api.context,
                                backendOperation: {
                                    target: sourceOperation.target,
                                    verb: sourceOperation.verb,
                                },
                            },
                        }],
                    };
                    const createMCPCommand = [
                        'curl -k -sS -f -X POST',
                        `-H ${shellQuote('Content-Type: application/json')}`,
                        `-H ${shellQuote(`Authorization: Bearer ${token}`)}`,
                        `--data-binary ${shellQuote(JSON.stringify(mcpPayload))}`,
                        shellQuote(`${Cypress.config('baseUrl')}/api/am/publisher/v4/mcp-servers/generate-from-api`),
                    ].join(' ');

                    cy.exec(createMCPCommand).then(({ stdout: mcpResponse }) => {
                        const mcp = JSON.parse(mcpResponse);
                        expect(mcp.id, 'Created MCP server id').to.be.a('string');
                        const tool = mcp.operations.find((operation) => operation.apiOperationMapping?.apiId === api.id);
                        expect(tool, 'Generated MCP tool').to.exist;

                        const schema = JSON.parse(tool.schemaDefinition);
                        expect(Object.keys(schema.properties), 'Internal schema property names')
                            .to.include.members(openAPICase.internalProperties);

                        resolve({
                            apiId: api.id,
                            mcpId: mcp.id,
                            toolName: tool.target,
                            internalProperties: openAPICase.internalProperties,
                            displayedProperties: openAPICase.displayedProperties,
                        });
                    });
                });
            });
        }).catch(reject);
    });
}

/**
 * Open the MCP tools page and expand its first tool.
 * @param {string} mcpId - MCP server identifier
 */
function openFirstTool(mcpId) {
    cy.visit(`/publisher/mcp-servers/${mcpId}/overview`, { timeout: 30000 });
    cy.get('#left-menu-tools', { timeout: 30000 }).click({ force: true });
    cy.get('#resources-save-operations', { timeout: 15000 }).should('exist');
    cy.get('.ToolDetails-accordionContainer', { timeout: 30000 }).should('have.length', 1);
    cy.get('.ToolDetails-accordionContainer').first()
        .find('.MuiAccordionSummary-root')
        .then(($summary) => $summary[0].click());
    cy.get('.ToolDetails-accordionContainer').first().should('have.class', 'Mui-expanded');
}

/**
 * Search the whole Monaco model because `.view-lines` only contains the visible editor viewport.
 * @param {string} propertyName - The property name to search for
 * @param {boolean} shouldExist - Whether the property name should be present in the rendered schema
 */
function assertSchemaProperty(propertyName, shouldExist) {
    const findShortcut = Cypress.platform === 'darwin' ? '{cmd}f' : '{ctrl}f';
    cy.get('.monaco-editor textarea').first().type(findShortcut, { force: true });
    cy.get('.monaco-editor .find-widget .find-part .input')
        .clear({ force: true })
        .type(`"${propertyName}"`, { force: true });
    cy.get('.monaco-editor .find-widget .matchesCount').should(($count) => {
        if (shouldExist) {
            expect($count.text(), `visible schema property ${propertyName}`).to.match(/\d+ of \d+/);
        } else {
            expect($count.text(), `hidden internal property ${propertyName}`).to.equal('No results');
        }
    });
}

describe('MCP tool schema parameter prefix display', { retries: 0 }, () => {
    const { publisher, password } = Utils.getUserInfo();

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    OPENAPI_CASES.forEach((openAPICase) => {
        it(`displays unprefixed names for ${openAPICase.title}`, () => {
            createMCPFromOpenAPIFixture(openAPICase).then(({ mcpId, displayedProperties, internalProperties }) => {
                // These generated APIM resources are intentionally retained so the failing UI
                // can be inspected manually after Cypress reports the pre-fix behavior.
                cy.logoutFromPublisher();
                cy.loginToPublisher(publisher, password);
                openFirstTool(mcpId);

                displayedProperties.forEach((propertyName) => assertSchemaProperty(propertyName, true));
                internalProperties.forEach((propertyName) => assertSchemaProperty(propertyName, false));
                cy.get('.monaco-editor textarea').first().type('{esc}', { force: true });
            });
        });
    });

    it('keeps the internally prefixed schema in the MCP PUT payload', () => {
        const openAPICase = OPENAPI_CASES[0];
        createMCPFromOpenAPIFixture(openAPICase).then(({ mcpId, internalProperties }) => {
            cy.logoutFromPublisher();
            cy.loginToPublisher(publisher, password);
            openFirstTool(mcpId);

            cy.get('.ToolDetails-accordionContainer').first()
                .find('textarea')
                .first()
                .clear({ force: true })
                .type('Description edited by the parameter prefix regression test', { force: true });

            cy.intercept('PUT', `**/mcp-servers/${mcpId}`).as('saveMCP');
            cy.get('#resources-save-operations').click();
            cy.wait('@saveMCP', { timeout: 30000 }).then(({ request, response }) => {
                expect(response.statusCode).to.equal(200);
                const tool = request.body.operations.find((operation) => operation.target === 'createPrefixCoverageItemV2');
                expect(tool, 'saved MCP tool').to.exist;

                const sentSchema = JSON.parse(tool.schemaDefinition);
                expect(Object.keys(sentSchema.properties), 'unchanged internal schema properties')
                    .to.include.members(internalProperties);
                expect(sentSchema.required, 'unchanged internal required names')
                    .to.include.members(internalProperties);
                PARAMETER_PREFIXES.forEach((prefix) => {
                    // Prefixes not present in this OpenAPI version are not required in its schema.
                    if (internalProperties.some((propertyName) => propertyName.startsWith(prefix))) {
                        expect(tool.schemaDefinition).to.include(`"${prefix}`);
                    }
                });
            });
        });
    });
});
