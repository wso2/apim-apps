/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

describe("Add Edit Delete api categories", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add Edit Delete api categories", () => {
        const categoryName = 'Finance';
        cy.get('[data-testid="API Categories"]').click();
        cy.get('.MuiButton-label').contains('Add API Category').click();
        cy.get('input[name="name"]').type(categoryName);
        cy.get('textarea[name="description"]').type('finance related apis');
        cy.get('button.MuiButton-containedPrimary > span').contains('Save').click();
        cy.get('[data-testid="MuiDataTableBodyCell-2-0"]').contains('finance related apis').should('exist');

        // editing
        cy.get(`[data-testid="MuiDataTableBodyCell-4-0"] > div > span:first-child`).click();
        cy.get('textarea[name="description"]').clear().type('finance apis');

        cy.intercept('GET', '**/api-categories').as('getCategories');
        cy.get('button.MuiButton-containedPrimary > span').contains('Save').click();
        cy.wait('@getCategories');
        cy.get('[data-testid="MuiDataTableBodyCell-2-0"]').contains('finance apis').should('exist');

        // delete
        cy.get(`[data-testid="MuiDataTableBodyCell-4-0"] > div > span:nth-child(2)`).click();
        cy.get('button > span').contains('Delete').click();
        cy.get('div[role="status"]').should('have.text','API Category deleted successfully');
    });

})