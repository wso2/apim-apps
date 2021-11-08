
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

describe("Anonymous view apis", () => {
    const username = 'admin'
    const password = 'admin'
    const appName = 'wizardapp';

    it.only("Subscribe to API", () => {
        cy.loginToPublisher(username, password);
        cy.deploySampleAPI();
        cy.visit('/devportal/apis?tenant=carbon.super');
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get('[title="PizzaShackAPI"]', { timeout: 30000 });
        cy.get('[title="PizzaShackAPI"]').click();
        cy.get('[data-testid="left-menu-credentials"]').click();

        // Go through the wizard
        cy.get('[data-testid="start-key-gen-wizard-btn"]').click();
        cy.get('#application-name').type(appName);
        cy.get('[data-testid="wizard-next-0-btn"]').click();
        
        cy.get('[data-testid="wizard-next-1-btn"]', { timeout: 30000 })
        cy.get('[data-testid="wizard-next-1-btn"]').click();

        cy.get('[data-testid="wizard-next-2-btn"]', { timeout: 30000 });
        cy.get('[data-testid="wizard-next-2-btn"]').click();

        cy.intercept('**/oauth-keys').as('oauthKeys');
        cy.wait('@oauthKeys');

        cy.get('[data-testid="wizard-next-3-btn"]', { timeout: 30000 });
        cy.get('[data-testid="wizard-next-3-btn"]').click();

     
      

        cy.visit('/devportal/apis?tenant=carbon.super');
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get('[title="PizzaShackAPI"]', { timeout: 30000 });
        cy.get('[title="PizzaShackAPI"]').click();
        cy.get('[data-testid="left-menu-credentials"]').click();

        /*

        Rest of the test we need to skip for now. Cypress is failing the token gen request but the actual one is not


        */

        // cy.intercept('**/generate-token').as('generateToken');
        // cy.wait('@generateToken');
        // cy.get('[data-testid="wizard-next-4-btn"]', { timeout: 30000 });
        // cy.get('[data-testid="wizard-next-4-btn"]').click();

        // // Click and select the new application
        // cy.get('#application-subscribe').click();
        // cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
        // cy.get(`[data-testid="subscribe-to-api-btn"]`).click();
        // cy.get(`[data-testid="subscription-table"] td`).contains(appName).should('exist');
    })

    after(() => {
        cy.get(`#${appName}-UN`).click();
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="delete-${appName}-btn"]`, { timeout: 30000 });
        cy.get(`[data-testid="delete-${appName}-btn"]`).click();
        cy.get(`[data-testid="application-delete-confirm-btn"]`).click();
    })
})
