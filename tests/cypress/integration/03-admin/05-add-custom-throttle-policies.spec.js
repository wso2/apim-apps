
/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Add custom throttle policies", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add custom throttle policies", () => {
        const policyName = '5reqPerMin';
        const secondDesc = 'For an Admin users allow 5 requests per minute';
        cy.get('[data-testid="Custom Policies-child-link"]').click();
        cy.get('.MuiButton-label').contains('Define Policy').click();
        cy.get('input[name="policyName"]').type(policyName);
        cy.get('input[name="description"]').type('Allow 5 requests per minute for an Admin user');
        cy.get('input[name="keyTemplate"]').type('$userId');
        cy.get('button.MuiButton-containedPrimary > span').contains('Add').click();
        cy.get('[data-testid="MuiDataTableBodyCell-0-0"] a').contains(policyName).should('exist');

        // editing
        cy.get('[data-testid="MuiDataTableBodyCell-0-0"] a').contains(policyName).click();
        cy.get('input[name="description"]').invoke('val').should('not.be.empty')
        cy.get('input[name="description"]').clear().type(secondDesc);

        cy.intercept('GET', '**/throttling/policies/custom').as('getCustomPolicies');
        cy.get('button.MuiButton-containedPrimary > span').contains('Add').click();
        cy.wait('@getCustomPolicies');
        cy.get('[data-testid="MuiDataTableBodyCell-1-0"]').contains(secondDesc).should('exist');

        // delete
        cy.get(`[data-testid="MuiDataTableBodyCell-4-0"] > div > span:nth-child(2)`).click();
        cy.get('button > span').contains('Delete').click();
        // cy.get('#client-snackbar').contains('API Category deleted successfully').should('exist');
    });

})
