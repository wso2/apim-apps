
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

describe("Add scope mapping", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add scope mapping", () => {
        const roleName = 'creator';

        cy.get('[data-testid="Scope Assignments-child-link"]').click();
        cy.get('.MuiButton-label').contains('Add scope mappings').click();
        cy.get('#role-input-field-helper-text').type(roleName);
        cy.get('button.MuiButton-containedPrimary span').contains('Next').click();  
        cy.get('#role-select-dropdown').click();
        cy.get('#role-select-dropdown-popup li').contains('Internal/creator').click();
        cy.get('button.MuiButton-containedPrimary span').contains('Save').click();
        cy.get('button[title="Next page"]').click();
        cy.get('div').contains('Internal/creator').should('exist');

        // delete
        cy.get(`[data-testid="${roleName}-delete"]`).click();
        cy.get('[aria-labelledby="delete-confirmation"] button.MuiButton-containedPrimary').click();
        cy.get('div').contains('Internal/creator').should('not.exist');
    });

})
