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

describe("Add Edit Delete subscription throttle policies", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add Edit Delete subscription throttle policies", () => {
        const policyName = 'Platinum';
        cy.get('[data-testid="Subscription Policies-child-link"]').click();
        cy.get('.MuiButton-label').contains('Add Policy').click();
        cy.get('input[name="policyName"]').type(policyName);
        cy.get('textarea[name="description"]').type('Allows 10k requests per minute');
        cy.get('input[name="requestCount"]').type('10000');
        cy.get('input[name="unitTime"]').type('1');
        cy.get('button.MuiButton-containedPrimary > span').contains('Save').click();
        cy.get('[data-testid="pagination-next"]').click();
        cy.get(`[data-testid="${policyName}-actions"]`).should('exist');

        // editing
        cy.intercept('**/throttling/policies/subscription/*').as('getPolicy');
        cy.get(`[data-testid="${policyName}-actions"] > a`).click();
        cy.wait('@getPolicy');
        cy.get('input[name="requestCount"]').clear().type('10001');
        cy.intercept('GET', '**/throttling/policies/subscription').as('getPolicies');
        cy.get('button.MuiButton-containedPrimary > span').contains('Save').click();
        cy.wait('@getPolicies');

        // delete
        cy.get('[data-testid="pagination-next"]').click();
        cy.get(`[data-testid="${policyName}-actions"] > span:nth-child(2)`).click();
        cy.get('button > span').contains('Delete').click();
        cy.get('div[role="status"]').should('have.text','Subscription Rate Limiting Policy successfully deleted.');
    });

})