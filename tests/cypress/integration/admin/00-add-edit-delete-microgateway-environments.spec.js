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

describe("Add Edit Delete Microgateway Environments", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add Edit Delete Microgateway Environments", () => {
        cy.get('[data-testid="Gateways"]').click();
        cy.get('.MuiButton-label').contains('Add Gateway Environment').click();
        cy.get('input[name="name"]').type('MARKETING_STORE');
        cy.get('input[name="displayName"]').type('MARKETING_STORE');
        cy
            .get('[data-testid="vhost"]')
            .find('input[name="0"]').type('localhost');
        // Wait until the label is saved
        cy.intercept('GET', '**/environments').as('environmentsGet');
        cy.get('button > span').contains('Save').click();
        cy.wait('@environmentsGet');
        cy.get('table tr td').contains('MARKETING_STORE').should('exist');

        // editing
        cy.get('[data-testid="MuiDataTableBodyCell-5-1"] div > div > button:first-child').click();
        cy.get('textarea[name="description"]').type('marketing store');
        // Wait until the label is saved
        cy.intercept('GET', '**/environments').as('environmentsGet');
        cy.get('button > span').contains('Save').click();
        cy.wait('@environmentsGet');
        cy.get('table tr td').contains('marketing store').should('exist');

        // deleting
        cy.get('[data-testid="MuiDataTableBodyCell-5-1"] div > div > button:nth-child(2)').click();
        cy.get('button > span').contains('Delete').click();
        cy.get('div[role="status"]').should('have.text','Gateway Environment deleted successfully');
    });

})
