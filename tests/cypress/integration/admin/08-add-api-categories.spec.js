/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

describe("Add API Categories and assign via publisher portal", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    let testApiId;

    beforeEach(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it("Add API Categories and assign via publisher portal", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        const category = Utils.generateName();
        const categoryDescription = 'Weather related apis';

        cy.get('[data-testid="API Categories"]', { timeout: Cypress.config().largeTimeout }).click();
        cy.get('[data-testid="form-dialog-base-trigger-btn"]').contains('Add API Category').click();
        cy.get('input[name="name"]').type(category);
        cy.get('textarea[name="description"]').type(categoryDescription);
        cy.get('[data-testid="form-dialog-base-save-btn"]').contains('Save').click();

        // Go to publisher
        cy.wait(500);
        cy.visit(`/publisher/apis`).wait(2000);
        Utils.addAPI({}).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/configuration`);
            cy.get('#APICategories-autocomplete', { timeout: Cypress.config().largeTimeout }).click();
            cy.get('li').contains(category).click();
            cy.get('#design-config-save-btn').click();
        })
    });

    afterEach(function () {
        if (testApiId) {
            Utils.deleteAPI(testApiId).then(() => {
                // Delete
                cy.visit(`/admin/settings/api-categories`);
                cy.get('[data-testid="MuiDataTableBodyCell-4-0"] > div > div > span:nth-child(2)', { timeout: Cypress.config().largeTimeout }).click();
                cy.get('[data-testid="form-dialog-base-save-btn"]').contains("Delete").click();
                //cy.get('div[role="status"]', {timeout: Cypress.config().largeTimeout}).should('have.text', 'API Category deleted successfully');
            });
        }
    })

})