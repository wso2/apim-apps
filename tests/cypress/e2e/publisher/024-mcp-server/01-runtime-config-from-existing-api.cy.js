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
 * Regression test for: "Fix MCP server Runtime page crash when an endpoint is removed"
 * Creation type: generate-from-api (From Existing API)
 *
 * generate-from-api does not auto-create a backend with endpoint URLs, so the
 * endpointConfig passed to the Runtime Configuration Endpoints component is null.
 * showEndpoint() must return null safely (not crash) in this state.
 *
 * If the backend IS auto-created with URLs, the test additionally goes through
 * the full UI delete flow and verifies the sandbox shows "-" after deletion.
 */
describe("MCP Server (from existing API) — runtime configuration endpoint display", () => {
    const { publisher, password } = Utils.getUserInfo();
    let mcpServerId;

    before(() => {
        cy.loginToPublisher(publisher, password);
    });

    it("runtime configuration page renders correctly for MCP server created from existing API", () => {
        Utils.addMCPServerFromExistingAPI({}).then((id) => {
            mcpServerId = id;

            Utils.getApiToken().then((token) => {
                const listCurl = `curl -k -s \
                    -H "Authorization: Bearer ${token}" \
                    "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${id}/backends"`;

                cy.exec(listCurl).then((listResult) => {
                    const backends = JSON.parse(listResult.stdout);
                    const firstBackend = backends.list && backends.list[0];

                    if (!firstBackend) {
                        // generate-from-api did not auto-create a backend.
                        // endpointConfig is null — verify showEndpoint() returns null safely
                        // (the fix guards against crashes when endpointConfig itself is absent).
                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/runtime-configuration`);
                        cy.get('#endpoints').should('exist');
                        return;
                    }

                    // Backend exists — set up both production and sandbox URLs so the
                    // sandbox delete button is enabled, then run the full UI delete flow.
                    const backendId = firstBackend.id;
                    let endpointConfig;
                    try {
                        endpointConfig = typeof firstBackend.endpointConfig === 'string'
                            ? JSON.parse(firstBackend.endpointConfig)
                            : firstBackend.endpointConfig || {};
                    } catch (_) {
                        endpointConfig = {};
                    }

                    const updatedConfig = {
                        ...endpointConfig,
                        production_endpoints: endpointConfig.production_endpoints
                            || { url: 'https://petstore.swagger.io/v2' },
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
                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/endpoints`);

                        cy.contains('h2', 'Sandbox Endpoint')
                            .closest('.MuiPaper-root')
                            .find('button[color="error"]')
                            .should('not.be.disabled')
                            .click();

                        cy.get('[aria-labelledby="delete-confirmation-dialog-title"]').within(() => {
                            cy.contains('button', 'Delete').click();
                        });

                        cy.contains('No sandbox endpoints configured').should('be.visible');

                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/runtime-configuration`);

                        cy.get('#endpoints').should('exist');
                        cy.get('#endpoints').within(() => {
                            cy.contains('Production').should('be.visible');
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
