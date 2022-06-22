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
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it("Add API Categories and assign via publisher portal", () => {
        const category = 'Weather';
        const categoryDescription = 'Weather related apis';

        cy.get('[data-testid="API Categories"]').click();
        cy.get('.MuiButton-label').contains('Add API Category').click();
        cy.get('input[name="name"]').type(category);
        cy.get('textarea[name="description"]').type(categoryDescription);
        cy.get('button.MuiButton-containedPrimary span').contains('Save').click();

        // Go to publisher
        cy.wait(500);
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('#itest-api-details-portal-config-acc').click();
        cy.get('#left-menu-itemDesignConfigurations').click();
        cy.get('#APICategories').click();
        cy.get('span').contains(category).click();
        cy.get('#menu-categories').click('topLeft');
        cy.get('#design-config-save-btn').click();
        
    });

    after(function() {
        cy.get(`#itest-id-deleteapi-icon-button`).click({force:true});
        cy.get(`#itest-id-deleteconf`).click();

        // Delete
        cy.visit(`${Utils.getAppOrigin()}/admin/settings/api-categories`);
        cy.wait(4000);
        cy.get('[data-testid="MuiDataTableBodyCell-4-0"] > div > div > span:nth-child(2)').click();
        cy.get('[data-testid="Delete-btn"]').click();
        cy.get('div[role="status"]').should('have.text','API Category deleted successfully');
    })

})