/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may turn a copy of the License at
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

import Utils from '@support/utils';

describe('Key Manager Constraints (Admin & DevPortal)', () => {
    const { carbonUsername, carbonPassword } = Utils.getUserInfo();
    const kmName = 'ConstraintsTestKM';
    const appName = Utils.generateName();
    const wellKnownUrl = 'https://localhost:9443/oauth2/token/.well-known/openid-configuration';
    const kmUsername = 'admin';
    const kmPassword = 'admin';
    const scopeManagementEndpoint = 'https://localhost:9443/api/identity/oauth2/v1.0/scopes';
    const maxConstraintValues = {
        appToken: '3600',
        userToken: '7200',
        refreshToken: '86400',
        idToken: '3600',
    };
    const CONSTRAINT_LABELS = {
        appToken: 'Maximum Application Access Token Expiry Time',
        userToken: 'Maximum User Access Token Expiry Time',
        refreshToken: 'Maximum Refresh Token Expiry Time',
        idToken: 'Maximum ID Token Expiry Time',
    };
    const getConstraintWrapper = (label) => {
        return cy.contains('p', label, { timeout: 10000 })
            .scrollIntoView({ offset: { top: -100, left: 0 } })
            .parent() 
            .parent();
    };
    const toggleConstraintOn = (label) => {
        getConstraintWrapper(label)
            .find('input[type="checkbox"]')
            .check({ force: true });
        getConstraintWrapper(label)
            .find('input[type="checkbox"]')
            .should('be.checked');
    };
    const getNumericInput = (label) => {
        return getConstraintWrapper(label).find('input[type="text"]');
    };
    const expandConstraintsSection = () => {
        cy.get('#KeyManagers\\.AddEditKeyManager\\.app\\.config\\.constraints\\.header', {
            timeout: Cypress.config().largeTimeout,
        }).scrollIntoView({ offset: { top: -100, left: 0 } }).click();
    };

    it('1. should create a WSO2 IS Key Manager in Admin portal and set constraints', () => {
        cy.loginToAdmin(carbonUsername, carbonPassword);
        cy.get('[data-testid="Key Managers"]', { timeout: Cypress.config().largeTimeout }).click();
    
        // Click Add Key Manager
        cy.get('[data-testid="add-key-manager-button"]', { timeout: Cypress.config().largeTimeout }).click();

        // Fill Basic Info
        cy.get('input[name="name"]', { timeout: Cypress.config().largeTimeout }).type(kmName);
        cy.get('input[name="displayName"]').type(`${kmName}`);
        cy.get('[data-testid="key-manager-type-select"]').click();
        cy.get('li[data-value="WSO2-IS"]').click();
        cy.get('input[name="wellKnownEndpoint"]').type(wellKnownUrl);
        cy.intercept('**/key-managers/discover').as('importConfig');
        cy.get('#import-button').contains('Import').click();
        cy.wait('@importConfig', { timeout: 3000 }).then(() => {
            cy.get('input[name="Username"]').type(kmUsername);
            cy.get('input[name="Password"]').type(kmPassword);
            cy.get('input[name="scopeManagementEndpoint"]').clear().type(scopeManagementEndpoint);
            cy.get('[data-testid="key-manager-permission-select"]').click();
            cy.get('li[data-value="PUBLIC"]').click();
            cy.get('#KeyManagers\\.AddEditKeyManager\\.app\\.config\\.constraints\\.header')
                .scrollIntoView({ offset: { top: -100, left: 0 } })
                .should('be.visible');
            expandConstraintsSection();

            toggleConstraintOn(CONSTRAINT_LABELS.appToken);
            getNumericInput(CONSTRAINT_LABELS.appToken).clear().type(maxConstraintValues.appToken);

            toggleConstraintOn(CONSTRAINT_LABELS.userToken);
            getNumericInput(CONSTRAINT_LABELS.userToken).clear().type(maxConstraintValues.userToken);

            toggleConstraintOn(CONSTRAINT_LABELS.refreshToken);
            getNumericInput(CONSTRAINT_LABELS.refreshToken).clear().type(maxConstraintValues.refreshToken);

            toggleConstraintOn(CONSTRAINT_LABELS.idToken);
            getNumericInput(CONSTRAINT_LABELS.idToken).clear().type(maxConstraintValues.idToken);

            // Save new KM
            cy.intercept('POST', '**/key-managers').as('createKM');
            cy.get('#keymanager-add')
                .scrollIntoView({ offset: { top: -200, left: 0 } })
                .contains('Add')
                .click({ force: true });
            cy.wait('@createKM', { timeout: 15000 }).its('response.statusCode').should('eq', 201);
        });
    });

    it('2. should enforce the configured constraints in the DevPortal', () => {
        cy.loginToDevportal(carbonUsername, carbonPassword);
        cy.createApp(appName, 'E2E test for constraints');
        
        // Navigate to OAuth keys generation tab
        cy.get('#production-keys-oauth', { timeout: Cypress.config().largeTimeout }).click();
        cy.get(`#${kmName}`, { timeout: Cypress.config().largeTimeout })
            .scrollIntoView({ offset: { top: -100, left: 0 } })
            .should('be.visible')
            .click({ force: true });

        // Function to check a specific DevPortal Max constraint
        const verifyMaxConstraint = (inputId, maxAllowedValue) => {
            const inputSelector = `#${inputId}`; 
            cy.get(inputSelector, { timeout: Cypress.config().largeTimeout })
                .scrollIntoView({ offset: { top: -150, left: 0 } })
                .should('be.visible')
                .clear({ force: true })
                .type('99999999', { force: true }); 
            cy.get(inputSelector).blur();

            // Error helper text
            cy.get(inputSelector)
                .parent()
                .parent()
                .find('p.Mui-error', { timeout: 10000 })
                .scrollIntoView({ offset: { top: -150, left: 0 } })
                .should('be.visible')
                .and('contain.text', maxAllowedValue);

            // Correcting the value
            cy.get(inputSelector)
                .clear({ force: true })
                .type(maxAllowedValue, { force: true });

            cy.get(inputSelector).blur();
            cy.get(inputSelector)
                .parent()
                .parent()
                .find('p.Mui-error')
                .should('not.exist');
        };
        verifyMaxConstraint('application_access_token_expiry_time', maxConstraintValues.appToken);
        verifyMaxConstraint('user_access_token_expiry_time', maxConstraintValues.userToken);
        verifyMaxConstraint('refresh_token_expiry_time', maxConstraintValues.refreshToken);
        verifyMaxConstraint('id_token_expiry_time', maxConstraintValues.idToken);
        cy.deleteApp(appName);
    });

    after(() => {
        cy.visit('/admin/settings/key-managers/');
        cy.get('td > div', { timeout: Cypress.config().largeTimeout })
            .contains(kmName)
            .scrollIntoView({ offset: { top: -100, left: 0 } })
            .should('be.visible');
        cy.contains('tr', kmName).within(() => {
            cy.get('[aria-label="key-manager-delete-icon"]').click({ force: true });
        });
        cy.intercept('DELETE', '**/key-managers/**').as('deleteKM');
        cy.get('[data-testid="form-dialog-base-save-btn"]', { timeout: 10000 })
            .should('be.visible')
            .click({ force: true });
        cy.wait('@deleteKM', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
    });
});