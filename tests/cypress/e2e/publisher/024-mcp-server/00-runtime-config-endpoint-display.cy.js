/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com).
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
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Utils from "@support/utils";

/*
 * Regression tests for: "Fix MCP server Runtime page crash when an endpoint is removed"
 *
 * Manual reproduction flow:
 *   1. Create an MCP server (which sets up a production endpoint)
 *   2. Add a sandbox endpoint so both types exist (required to enable the delete button)
 *   3. Go to Endpoints → click the sandbox endpoint's delete button → confirm
 *   4. Go to Runtime → page previously crashed; after the fix it renders correctly
 *
 * Before the fix, accessing production_endpoints.url or sandbox_endpoints.url
 * directly on the fetched endpointConfig threw when either key was null,
 * crashing the React component.  The fix uses optional chaining (?.) so a
 * missing endpoint is treated as undefined (falsy) and the panel shows "-".
 */
describe("MCP Server — runtime configuration endpoint display", () => {
    const { publisher, password } = Utils.getUserInfo();
    let mcpServerId;

    before(() => {
        cy.loginToPublisher(publisher, password);
    });

    it("runtime configuration page renders correctly after sandbox endpoint is removed via UI", () => {
        // Step 1 — create the MCP server. The spec includes a servers entry so APIM
        // auto-creates a backend with production_endpoints.url set.
        Utils.addMCPServer({}).then((id) => {
            mcpServerId = id;

            // Step 2 — add sandbox URL to the backend so the delete button is enabled.
            // shouldDisableDelete() in EndpointCard only enables delete when BOTH
            // production AND sandbox URLs are present on the same backend.
            Utils.getApiToken().then((token) => {
                const listCurl = `curl -k -s \
                    -H "Authorization: Bearer ${token}" \
                    "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${id}/backends"`;

                cy.exec(listCurl).then((listResult) => {
                    const backends = JSON.parse(listResult.stdout);
                    const firstBackend = backends.list && backends.list[0];

                    if (!firstBackend) {
                        throw new Error(
                            'addMCPServer did not create a backend — ' +
                            'ensure the spec includes a servers entry so APIM auto-creates one.'
                        );
                    }

                    const backendId = firstBackend.id;
                    let endpointConfig;
                    try {
                        endpointConfig = typeof firstBackend.endpointConfig === 'string'
                            ? JSON.parse(firstBackend.endpointConfig)
                            : firstBackend.endpointConfig;
                    } catch (_) {
                        endpointConfig = {};
                    }

                    // Add a sandbox URL alongside the existing production URL.
                    const updatedConfig = {
                        ...endpointConfig,
                        sandbox_endpoints: { url: 'https://sandbox.petstore.swagger.io/v2' },
                    };
                    const updatedBackend = JSON.stringify({
                        ...firstBackend,
                        endpointConfig: updatedConfig,
                    });

                    const putCurl = `curl -k -s -X PUT \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}" \
                        -d '${updatedBackend.replace(/'/g, "'\\''")}' \
                        "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${id}/backends/${backendId}"`;

                    cy.exec(putCurl).then(() => {
                        // Step 3 — navigate to the Endpoints page and delete the sandbox
                        // endpoint through the UI (the same user action that triggers the bug).
                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/endpoints`);

                        // The sandbox card's delete button (color="error") is enabled only
                        // when both production AND sandbox URLs exist — which we just set up.
                        cy.contains('h2', 'Sandbox Endpoint')
                            .closest('.MuiPaper-root')
                            .find('button[color="error"]')
                            .should('not.be.disabled')
                            .click();

                        // Confirm the deletion in the dialog.
                        cy.get('[aria-labelledby="delete-confirmation-dialog-title"]').within(() => {
                            cy.contains('button', 'Delete').click();
                        });

                        // Wait for the sandbox card to disappear (page re-fetches after delete).
                        cy.contains('No sandbox endpoints configured').should('be.visible');

                        // Step 4 — navigate to Runtime Configuration (the crash scenario).
                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/runtime-configuration`);

                        // The Endpoints accordion must render — a JS crash would leave it absent.
                        cy.get('#endpoints').should('exist');

                        // Production section must be visible and show its URL.
                        cy.get('#endpoints').within(() => {
                            cy.contains('Production').should('be.visible');
                            cy.contains('https://petstore.swagger.io/v2').should('be.visible');

                            // Sandbox section must show "-" (not crash) because it was deleted.
                            cy.contains('Sandbox').should('be.visible');
                            cy.contains('-').should('be.visible');
                        });
                    });
                });
            });
        });
    });

    after(() => {
        Utils.deleteMCPServer(mcpServerId);
    });
});
