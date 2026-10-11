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

// Fake backend used by every intercept below - the real MCP server created via
// Utils.addMCPServerFromEndpointConfig() has no real backend of this shape, but the endpoints page
// never talks to the real backend list once mockBackendsList() is registered.
const FAKE_BACKEND_ID = 'test-backend-id-01';

// Minimal valid MCP tools definition returned by a successful re-sync.
const MOCK_DEFINITION = JSON.stringify({
    tools: [
        {
            name: 'mock-tool',
            description: 'A mock MCP tool for testing',
            inputSchema: { type: 'object', properties: {} },
        },
    ],
});

/**
 * Intercepts GET /mcp-servers/{id} and overrides subtypeConfiguration.subtype in the
 * response body. Register this BEFORE visiting the page.
 * @param {string} mcpServerId
 * @param {'SERVER_PROXY'|'DIRECT_BACKEND'|'EXISTING_API'} subtype
 * @param {string} [alias]
 */
function mockServerSubtype(mcpServerId, subtype, alias = 'getMCPServer') {
    cy.intercept('GET', `**/mcp-servers/${mcpServerId}`, (req) => {
        req.continue((res) => {
            if (res.body && typeof res.body === 'object') {
                res.body.subtypeConfiguration = { subtype, configuration: null };
            }
        });
    }).as(alias);
}

/**
 * Intercepts GET /mcp-servers/{id}/backends and returns a single fake backend entry.
 * Register this BEFORE visiting the endpoints page so that the page renders endpoint cards.
 * @param {string} mcpServerId
 * @param {string} [alias]
 */
function mockBackendsList(mcpServerId, alias = 'getBackends', endpointSecurity) {
    cy.intercept(
        { method: 'GET', pathname: `/api/am/publisher/v4/mcp-servers/${mcpServerId}/backends` },
        (req) => {
            req.continue((res) => {
                res.body = [
                    {
                        id: FAKE_BACKEND_ID,
                        name: 'Default Backend',
                        endpointConfig: JSON.stringify({
                            endpoint_type: 'http',
                            production_endpoints: { url: 'https://localhost:3100' },
                            sandbox_endpoints: { url: 'https://localhost:3100' },
                            ...(endpointSecurity ? { endpoint_security: endpointSecurity } : {}),
                        }),
                        definition: '{"tools":[]}',
                    },
                ];
            });
        },
    ).as(alias);
}

/** Stubs POST mcp-servers/validate-mcp-server with a 200 + content. */
function mockResyncSuccess(alias = 'validateMCP') {
    cy.intercept('POST', '**/mcp-servers/validate-mcp-server', {
        statusCode: 200,
        body: { content: MOCK_DEFINITION },
    }).as(alias);
}

/** Stubs POST mcp-servers/validate-mcp-server with an error status. */
function mockResyncError(statusCode = 500, alias = 'validateMCPError') {
    cy.intercept('POST', '**/mcp-servers/validate-mcp-server', {
        statusCode,
        body: { message: 'Internal server error' },
    }).as(alias);
}

/** Stubs POST mcp-servers/validate-mcp-server with 200 but null content. */
function mockResyncEmptyContent(alias = 'validateMCPEmpty') {
    cy.intercept('POST', '**/mcp-servers/validate-mcp-server', {
        statusCode: 200,
        body: { content: null },
    }).as(alias);
}

/** Stubs POST mcp-servers/validate-mcp-server with a configurable delay. */
function mockResyncWithDelay(delayMs = 2000, alias = 'validateMCPSlow') {
    cy.intercept('POST', '**/mcp-servers/validate-mcp-server', (req) => {
        req.reply({
            statusCode: 200,
            body: { content: MOCK_DEFINITION },
            delay: delayMs,
        });
    }).as(alias);
}

/**
 * Visits the MCP server Endpoints page and waits for the loader to clear.
 * @param {string} mcpServerId
 */
function visitEndpointsPage(mcpServerId) {
    cy.visit(`/publisher/mcp-servers/${mcpServerId}/endpoints`, largeTimeout);
    cy.get('#apim-loader > span', largeTimeout).should('not.exist');
}

/** Opens the backend-definition drawer for the first endpoint card. */
function openDefinitionDrawer() {
    cy.get('[data-testid="endpoint-definition-view-btn"]', largeTimeout).first().click();
    cy.get('[role="presentation"]', largeTimeout).should('be.visible');
}

/** Mocks a SERVER_PROXY server + its backends list, visits the endpoints page and opens the drawer. */
function openProxyServerDefinitionDrawer(mcpServerId, endpointSecurity) {
    mockServerSubtype(mcpServerId, 'SERVER_PROXY');
    mockBackendsList(mcpServerId, 'getBackends', endpointSecurity);
    visitEndpointsPage(mcpServerId);
    openDefinitionDrawer();
}

/**
 * Fills in the endpoint security dialog for a given auth type. Assumes the security
 * dialog is already open (endpoint-security-icon-btn clicked).
 * @param {'APIKEY_HEADER'|'OAUTH'} authType
 */
function fillAuthFields(authType) {
    switch (authType) {
        case 'APIKEY_HEADER':
            cy.get('#auth-type-select').parent().click();
            cy.get('#auth-type-apikey').click();
            cy.get('#auth-apiKeyIdentifierType').parent().click();
            cy.contains('[role="option"]', 'Header').click();
            cy.get('#auth-apiKeyIdentifier').clear().type('X-API-Key');
            cy.get('#auth-apiKeyValue').clear().type('my-secret-api-key');
            break;
        case 'OAUTH':
            cy.get('#auth-type-select').parent().click();
            cy.get('#auth-type-OAUTH').click();
            // The token URL / client credentials fields only render once a grant type
            // that needs them (Client Credentials) is selected.
            cy.get('#grant-type-select').parent().click();
            cy.contains('[role="option"]', 'Client Credentials').click();
            cy.get('#auth-tokenUrl').clear().type('https://oauth.example.com/token');
            cy.get('#auth-clientId').clear().type('my-client-id');
            cy.get('#auth-clientSecret').clear().type('my-client-secret');
            break;
        default:
            throw new Error(`Unknown authType: ${authType}`);
    }
}

/**
 * Navigates to the endpoint edit page and configures the given authentication method
 * on the endpoint's security settings, then saves. The single-backend GET and the
 * backend PUT are both intercepted, so this works against FAKE_BACKEND_ID without
 * requiring a real backend to exist.
 * @param {string} mcpServerId
 * @param {'APIKEY_HEADER'|'OAUTH'} authType
 */
function configureEndpointAuth(mcpServerId, authType) {
    cy.intercept(
        { method: 'GET', pathname: `/api/am/publisher/v4/mcp-servers/${mcpServerId}/backends/${FAKE_BACKEND_ID}` },
        {
            statusCode: 200,
            body: {
                id: FAKE_BACKEND_ID,
                name: 'Default Backend',
                endpointConfig: JSON.stringify({
                    endpoint_type: 'http',
                    production_endpoints: { url: 'https://localhost:3100' },
                    sandbox_endpoints: { url: 'https://localhost:3100' },
                    endpoint_security: {},
                }),
                definition: '{"tools":[]}',
            },
        },
    ).as('getSingleBackend');
    // Capture what was actually submitted so the caller can (a) reflect it in a later
    // mockBackendsList() mock and (b) assert the auth it configured was really saved,
    // instead of just that the PUT returned 200.
    let savedEndpointSecurity;
    cy.intercept('PUT', `**/mcp-servers/${mcpServerId}/backends/**`, (req) => {
        const sentConfig = typeof req.body.endpointConfig === 'string'
            ? JSON.parse(req.body.endpointConfig)
            : req.body.endpointConfig;
        savedEndpointSecurity = sentConfig?.endpoint_security;
        req.reply({ statusCode: 200, body: {} });
    }).as('saveEndpointSecurity');

    cy.visit(`/publisher/mcp-servers/${mcpServerId}/endpoints/${FAKE_BACKEND_ID}/PRODUCTION`, largeTimeout);
    cy.get('#apim-loader > span', largeTimeout).should('not.exist');
    cy.wait('@getSingleBackend');

    cy.get('#endpoint-security-icon-btn', { timeout: 15000 }).click();
    fillAuthFields(authType);
    cy.get('#endpoint-security-submit-btn').click();

    cy.get('#endpoint-save-btn').click();
    return cy.wait('@saveEndpointSecurity').then(() => {
        expect(savedEndpointSecurity, 'endpoint_security saved by the PUT').to.exist;
        return savedEndpointSecurity;
    });
}

// Endpoint backend definition Re-sync is only exposed for third-party MCP servers,
// i.e. servers created by proxying an existing external MCP endpoint
// (subtypeConfiguration.subtype === 'SERVER_PROXY'). This spec covers that whole
// feature end to end, grouped into focused sub-tests instead of one spec file per
// scenario.
describe("publisher-023-07 : MCP endpoint backend definition Re-sync (third-party / SERVER_PROXY servers)", { testIsolation: false }, () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });

    const { publisher, password } = Utils.getUserInfo();
    let mcpId;

    // A single login and a single MCP server are shared across every test in this file
    // rather than repeated per test: every scenario below mocks the server's subtype,
    // backends list, and resync responses, so the real server's own content is never
    // read or asserted on - it only needs to exist so the SPA routes resolve. Recreating
    // it per test bought no extra isolation, just ~14x the create/delete round trips (each
    // delete also carries a hardcoded 5s wait in Utils.deleteMCPServer). testIsolation is
    // disabled above so the cookies this login sets aren't cleared between tests - a
    // per-test beforeEach login would otherwise time out on test 1 (the before() login is
    // still live then) and skip the rest of the file when that hook throws.
    before(() => {
        cy.loginToPublisher(publisher, password);
        Utils.addMCPServerFromEndpointConfig({}).then((id) => { mcpId = id; });
    });

    after(() => {
        if (mcpId) {
            Utils.deleteMCPServer(mcpId);
        }
    });

    it.only("shows Re-sync only for a third-party (SERVER_PROXY) server, never for DIRECT_BACKEND or EXISTING_API", () => {
        mockServerSubtype(mcpId, 'SERVER_PROXY', 'getServerProxy');
        mockBackendsList(mcpId);
        visitEndpointsPage(mcpId);
        cy.wait('@getServerProxy');
        openDefinitionDrawer();
        cy.get('[data-testid="endpoint-definition-resync-btn"]').should('exist').and('be.visible');

        ['DIRECT_BACKEND', 'EXISTING_API'].forEach((subtype) => {
            mockServerSubtype(mcpId, subtype, 'getServerOther');
            mockBackendsList(mcpId);
            visitEndpointsPage(mcpId);
            cy.wait('@getServerOther');
            openDefinitionDrawer();
            cy.get('[data-testid="endpoint-definition-resync-btn"]').should('not.exist');
        });
    });

    it.only("disables Re-sync while viewing a revision, keeps it enabled for the live endpoint", () => {
        cy.intercept('GET', `**/mcp-servers/${mcpId}`, (req) => {
            req.continue((res) => {
                if (res.body && typeof res.body === 'object') {
                    res.body.subtypeConfiguration = { subtype: 'SERVER_PROXY', configuration: null };
                    res.body.isRevision = true;
                }
            });
        }).as('getServerRevision');
        mockBackendsList(mcpId);
        visitEndpointsPage(mcpId);
        cy.wait('@getServerRevision');
        openDefinitionDrawer();
        cy.get('[data-testid="endpoint-definition-resync-btn"]').should('be.disabled');

        mockServerSubtype(mcpId, 'SERVER_PROXY', 'getServerLive');
        mockBackendsList(mcpId);
        visitEndpointsPage(mcpId);
        cy.wait('@getServerLive');
        openDefinitionDrawer();
        cy.get('[data-testid="endpoint-definition-resync-btn"]').should('not.be.disabled');
    });

    it.only("delegates credential resolution to the backend and populates the editor with the fetched definition", () => {
        openProxyServerDefinitionDrawer(mcpId);
        mockResyncSuccess('validateMCP');

        // Nothing synced yet - Update stays disabled until a re-sync succeeds.
        cy.get('[data-testid="endpoint-definition-update-btn"]').should('be.disabled');

        cy.get('[data-testid="endpoint-definition-resync-btn"]').click();

        // handleResync() always sends mcpServerId + endpointType and never inline
        // securityInfo - the backend resolves stored credentials on its own.
        cy.wait('@validateMCP').then((interception) => {
            expect(interception.request.body).to.have.property('mcpServerId', mcpId);
            expect(interception.request.body).to.have.property('endpointType', 'PRODUCTION');
            expect(interception.request.body).not.to.have.property('securityInfo');
        });

        cy.contains('Definition fetched from backend', largeTimeout).should('be.visible');
        cy.get('[role="presentation"] .view-lines', largeTimeout).should('contain.text', 'mock-tool');
        cy.get('[data-testid="endpoint-definition-update-btn"]', largeTimeout).should('not.be.disabled');
    });

    it.only("disables the Re-sync button while the request is in-flight and re-enables it once it settles", () => {
        openProxyServerDefinitionDrawer(mcpId);

        mockResyncWithDelay(3000, 'validateMCPSlow');
        cy.get('[data-testid="endpoint-definition-resync-btn"]').click();
        cy.get('[data-testid="endpoint-definition-resync-btn"]').should('be.disabled');

        cy.wait('@validateMCPSlow', { timeout: 10000 });
        cy.get('[data-testid="endpoint-definition-resync-btn"]', largeTimeout).should('not.be.disabled');
    });

    [
        { label: 'a 500 Internal Server Error', setup: () => mockResyncError(500, 'validateMCPErr') },
        { label: 'a 401 Unauthorized', setup: () => mockResyncError(401, 'validateMCPErr') },
        { label: '200 with null content', setup: () => mockResyncEmptyContent('validateMCPErr') },
    ].forEach(({ label, setup }) => {
        it.only(`shows an error alert and keeps Update disabled when the backend returns ${label}`, () => {
            openProxyServerDefinitionDrawer(mcpId);

            setup();
            cy.get('[data-testid="endpoint-definition-resync-btn"]').click();
            cy.wait('@validateMCPErr');

            cy.contains('Could not re-sync backend definition.', largeTimeout).should('be.visible');
            cy.get('[data-testid="endpoint-definition-update-btn"]').should('be.disabled');
            cy.get('[data-testid="endpoint-definition-resync-btn"]', largeTimeout).should('not.be.disabled');
        });
    });

    it.only("reviews the fetched definition, persists it via Update, and reflects it after the endpoints refetch", () => {
        // Tracks whether Update has persisted the resynced definition yet, so the
        // mocked GET backends response reflects it on the following re-fetch.
        let backendUpdated = false;

        mockServerSubtype(mcpId, 'SERVER_PROXY');
        cy.intercept(
            { method: 'GET', pathname: `/api/am/publisher/v4/mcp-servers/${mcpId}/backends` },
            (req) => {
                req.continue((res) => {
                    res.body = [{
                        id: FAKE_BACKEND_ID,
                        name: 'Default Backend',
                        endpointConfig: JSON.stringify({
                            endpoint_type: 'http',
                            production_endpoints: { url: 'https://localhost:3100' },
                            sandbox_endpoints: { url: 'https://localhost:3100' },
                        }),
                        definition: backendUpdated ? MOCK_DEFINITION : '{"tools":[]}',
                    }];
                });
            },
        ).as('getBackends');
        mockResyncSuccess('validateMCP');
        cy.intercept('PUT', `**/mcp-servers/${mcpId}/backends/**`, (req) => {
            backendUpdated = true;
            req.reply({ statusCode: 200, body: {} });
        }).as('putBackend');

        visitEndpointsPage(mcpId);
        cy.wait('@getBackends');
        openDefinitionDrawer();

        // Step 1: starting state - nothing synced yet.
        cy.get('[data-testid="endpoint-definition-update-btn"]').should('be.disabled');
        cy.get('[role="presentation"] .view-lines', largeTimeout).should('not.contain.text', 'mock-tool');

        // Step 2: Re-sync fetches the fresh definition from the backend.
        cy.get('[data-testid="endpoint-definition-resync-btn"]').click();
        cy.wait('@validateMCP');
        cy.contains('Definition fetched from backend', largeTimeout).should('be.visible');
        cy.get('[role="presentation"] .view-lines', largeTimeout).should('contain.text', 'mock-tool');

        // Step 3: Update persists the reviewed definition to the backend.
        cy.get('[data-testid="endpoint-definition-update-btn"]').should('not.be.disabled').click();
        cy.wait('@putBackend').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            const sentDefinition = JSON.parse(interception.request.body.definition);
            expect(sentDefinition).to.deep.equal(JSON.parse(MOCK_DEFINITION));
        });
        cy.contains('Backend API definition updated successfully', largeTimeout).should('be.visible');

        // Step 4: onDefinitionUpdate() triggers a fresh fetch of the endpoints list.
        cy.wait('@getBackends');

        // Step 5: reopening the drawer shows the persisted definition straight away -
        // proving the update round-tripped correctly, with no further Re-sync needed.
        openDefinitionDrawer();
        cy.get('[role="presentation"] .view-lines', largeTimeout).should('contain.text', 'mock-tool');
    });

    // handleResync() never inspects the endpoint's configured auth type - it always
    // delegates credential resolution to the backend by ID. These sub-tests configure
    // API Key (Header) and OAuth 2.0 (Client Credentials) - the two auth methods third-party
    // MCP servers actually use in practice - through the endpoint security UI and confirm
    // that Re-sync's request body stays identical (mcpServerId + endpointType, no inline
    // securityInfo) regardless of what security is set on the endpoint.
    const AUTH_MATRIX = [
        { authType: 'APIKEY_HEADER', label: 'API Key (Header) auth' },
        { authType: 'OAUTH', label: 'OAuth 2.0 (Client Credentials) auth' },
    ];

    AUTH_MATRIX.forEach(({ authType, label }) => {
        it.only(`still delegates credentials to the backend store (no inline securityInfo) with ${label}`, () => {
            configureEndpointAuth(mcpId, authType).then((savedEndpointSecurity) => {
                openProxyServerDefinitionDrawer(mcpId, savedEndpointSecurity);

                mockResyncSuccess('validateMCP');
                cy.get('[data-testid="endpoint-definition-resync-btn"]').click();
                cy.wait('@validateMCP').then((interception) => {
                    expect(interception.request.body).to.have.property('mcpServerId', mcpId);
                    expect(interception.request.body).to.have.property('endpointType', 'PRODUCTION');
                    expect(interception.request.body).not.to.have.property('securityInfo');
                });

                cy.contains('Definition fetched from backend', largeTimeout).should('be.visible');
            });
        });
    });
});
