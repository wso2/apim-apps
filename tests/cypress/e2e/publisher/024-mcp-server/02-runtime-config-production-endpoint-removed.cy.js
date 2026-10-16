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
 *
 * This covers the mirror case of 00-runtime-config-endpoint-display.cy.js.
 * That spec deletes the SANDBOX endpoint and verifies the Runtime page doesn't
 * crash when production_endpoints.url exists but sandbox_endpoints.url is null.
 *
 * This spec deletes the PRODUCTION endpoint instead, verifying the Runtime page
 * doesn't crash when sandbox_endpoints.url exists but production_endpoints.url
 * is null — the other half of the optional-chaining fix mentioned in the bug.
 */
describe("MCP Server — runtime configuration endpoint display (production removed)", () => {
    const { publisher, password } = Utils.getUserInfo();
    let mcpServerId;

    before(() => {
        cy.loginToPublisher(publisher, password);
    });

    it("runtime configuration page renders correctly after production endpoint is removed via UI", () => {
        Utils.addMCPServer({}).then((id) => {
            mcpServerId = id;

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
                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/endpoints`);

                        cy.contains('h2', 'Production Endpoint')
                            .closest('.MuiPaper-root')
                            .find('button[color="error"]')
                            .should('not.be.disabled')
                            .click();

                        cy.get('[aria-labelledby="delete-confirmation-dialog-title"]').within(() => {
                            cy.contains('button', 'Delete').click();
                        });

                        cy.contains('No production endpoints configured').should('be.visible');

                        cy.visit(`${Utils.getAppOrigin()}/publisher/mcp-servers/${id}/runtime-configuration`);

                        cy.get('#endpoints').should('exist');

                        cy.get('#endpoints').within(() => {
                            cy.contains('Sandbox').should('be.visible');
                            cy.contains('https://sandbox.petstore.swagger.io/v2').should('be.visible');

                            cy.contains('Production').should('be.visible');
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
