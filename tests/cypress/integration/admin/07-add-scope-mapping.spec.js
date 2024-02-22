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

describe("Add scope mapping", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    it.only("Add scope mapping", () => {
        cy.loginToAdmin(carbonUsername, carbonPassword);
        const roleName = 'creator';

        cy.get('[data-testid="Scope Assignments-child-link"]').click();
        cy.get('[data-testid="add-scope-mapping"]').contains('Add scope mappings').click();
        cy.get('#role-input-field-helper-text').type(roleName);
        cy.get('[data-testid="add-role-wizard-save-button"]').contains('Next').click();  
        cy.get('#role-select-dropdown').click();
        cy.get('[id^=role-select-dropdown-option-]').contains('Internal/creator').click();
        cy.get('[data-testid="add-role-wizard-save-button"]').contains('Save').click();
        cy.get('div').contains(roleName).should('exist');

        // delete
        cy.get(`[data-testid="${roleName}-delete-btn"]`).click();
        cy.get('[aria-labelledby="delete-confirmation"] button.MuiButton-containedPrimary').click();
        cy.get(`[data-testid="${roleName}"]`).should('not.exist');
    });
    it.only("Add multiple scope mapping", () => {
        cy.loginToAdmin(carbonUsername, carbonPassword);
        const roleName = 'customRole';

        cy.get('[data-testid="Scope Assignments-child-link"]').click();
        cy.get('[data-testid="add-scope-mapping"]').contains('Add scope mappings').click();
        cy.get('#role-input-field-helper-text').type(roleName);
        cy.get('[data-testid="add-role-wizard-save-button"]').contains('Next').click();
        cy.get('#role-select-dropdown').click();
        cy.get('[id^=role-select-dropdown-option-]').contains('Internal/creator').click();
        cy.get('#role-select-dropdown').click();
        cy.get('[id^=role-select-dropdown-option-]').contains('Internal/publisher').click();
        cy.get('#role-select-dropdown').click();
        cy.get('[id^=role-select-dropdown-option-]').contains('Internal/subscriber').click();

        cy.get('[data-testid="add-role-wizard-save-button"]').contains('Save').click();
        cy.get('div').contains(roleName).should('exist');
        cy.get('[data-testid="Internal/subscriber,Internal/creator,Internal/publisher"]').should('exist');

        // delete
        cy.get(`[data-testid="${roleName}-delete-btn"]`).click();
        cy.get('[aria-labelledby="delete-confirmation"] button.MuiButton-containedPrimary').click();
        cy.get(`[data-testid="${roleName}"]`).should('not.exist');
    });

})