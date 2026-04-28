/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com/).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Utils from "@support/utils";
import PublisherComonPage from "../../../support/pages/publisher/PublisherComonPage";

const publisherComonPage = new PublisherComonPage();

/**
 * Verifies that a role created under the "Application" domain in the carbon console
 * (displayed as "Application/testrole") can be used to successfully:
 *   1. Create a global scope – the role must appear as "Application/testrole" in the table.
 *   2. Assign the global scope to an API operation and save (update the API).
 *   3. Create a local scope for the same API.
 */
describe("Application/testrole - global and local scope creation with Application domain role", () => {
    Cypress.on("uncaught:exception", () => false);

    const { carbonUsername, carbonPassword, publisher, password } = Utils.getUserInfo();

    // Carbon console role: domain = "Application", name dynamically generated
    const random_number = Math.floor(Date.now() / 1000);
    const roleDomain = "Application";
    const roleNameInDomain = `testrole${random_number}`;
    const fullRoleName = `${roleDomain}/${roleNameInDomain}`;

    const verb = "post";
    const target = "/test";
    const apiVersion = "1.0.0";
    const globalScopeName = `apptestrole_global_${random_number}`;
    const localScopeName = `apptestrole_local_${random_number}`;
    const scopeDescription = "Test scope for Application/testrole role";

    let apiId;

    before(() => {
        // Create "Application/testrole" role in the carbon console
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewRole(roleNameInDomain, roleDomain);
        cy.carbonLogout();
    });

    after(() => {
        // Clean up the carbon role
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.searchAndDeleteRoleIfExist(fullRoleName);
        cy.carbonLogout();

        // Clean up the API
        if (apiId) {
            Utils.deleteAPI(apiId);
        }
    });

    it(
        "Global and local scope creation with Application/testrole should succeed and the role should be displayed as Application/testrole",
        {
            retries: {
                runMode: 3,
                openMode: 0,
            },
        },
        () => {
            cy.loginToPublisher(carbonUsername, carbonPassword);
            publisherComonPage.waitUntillPublisherLoadingSpinnerExit();

            const apiName = Utils.generateName();
            Utils.addAPI({ name: apiName, version: apiVersion }).then((id) => {
                apiId = id;

                // ── Add a POST /test resource to the API ──────────────────────────
                cy.visit(`/publisher/apis/${apiId}/resources`, {
                    timeout: Cypress.env('largeTimeout'),
                });
                cy.get("#operation-target").type(target);
                cy.get("body").click();
                cy.get("#add-operation-selection-dropdown").click();
                cy.get(`#add-operation-${verb}`).click();
                cy.get("body").click();
                cy.get("#add-operation-button").click();
                cy.get("#resources-save-operations").click();
                cy.get("#resources-save-operations", { timeout: 30000 });
                cy.get(`#${verb}\\${target}`).should("be.visible");

                // ── Step 1: Create a global scope with role Application/testrole ──
                cy.visit(`${Cypress.config().baseUrl}/publisher/scopes`, {
                    timeout: Cypress.env('largeTimeout'),
                });
                publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
                cy.wait(3000);
                cy.get('a[href="/publisher/scopes/create"]').click({ force: true });
                cy.wait(2000);

                cy.get("input#name").click({ force: true });
                cy.get("input#name").type(globalScopeName, { force: true });
                cy.get("#displayName").click();
                cy.get("#displayName").type(globalScopeName);
                cy.get("#description").click();
                cy.get("#description").type(scopeDescription);
                cy.get('input[placeholder="Enter roles and press Enter"]').click();
                cy.get('input[placeholder="Enter roles and press Enter"]').type(
                    `${fullRoleName}{enter}`
                );
                cy.get("[data-testid=create-scope-save-button]").contains("Save").click();

                // Assert: global scope row appears in the table
                cy.get("tbody").find("tr").contains(globalScopeName).should("be.visible");
                // Assert: the role is displayed as "Application/testrole"
                cy.get("tbody").find("tr").contains(fullRoleName).should("be.visible");

                // ── Step 2: Assign the global scope to the API operation and save ─
                cy.visit(`/publisher/apis/${apiId}/resources`, {
                    timeout: Cypress.env('largeTimeout'),
                });

                cy.get(`#${verb}\\${target}`).click();
                cy.get(`#${verb}\\${target}-operation-scope-autocomplete`, { timeout: 3000 });
                cy.get(`#${verb}\\${target}-operation-scope-autocomplete`).click();
                cy.get(`#${verb}\\${target}-operation-scope-${globalScopeName}`).click();

                cy.get("#resources-save-operations").click();

                // Assert: API updated successfully toast appears
                cy.contains("API updated successfully", {
                    timeout: Cypress.env('largeTimeout'),
                }).should("be.visible");

                // Assert: scope is visible on the resource after saving
                cy.get("#resources-save-operations", { timeout: 30000 });
                cy.get(`#${verb}\\${target}-operation-scope-autocomplete`);
                cy.contains('span', globalScopeName).should('exist');

                // ── Step 3: Create a local scope with role Application/testrole ───
                cy.visit(`/publisher/apis/${apiId}/scopes/create`, {
                    timeout: Cypress.env('largeTimeout'),
                });
                publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
                cy.wait(2000);

                cy.createLocalScope(
                    localScopeName,
                    localScopeName,
                    scopeDescription,
                    [fullRoleName]
                );

                // Assert: local scope appears in the table
                cy.get("table")
                    .get("tbody")
                    .find("tr")
                    .contains(localScopeName)
                    .should("be.visible");
            });
        }
    );
});
