/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
describe("Application tests", () => {
    const appName = 'keygenapplication' + Math.floor(Date.now() / 1000);
    const appDescription = 'Key gen application description';
    const developer = 'developer';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
    })

    const checkIfKeyExists = () => {
        // Check if the key exists
        cy.get('#access-token', { timeout: 30000 });
        cy.get('#access-token').should('not.be.empty');
        cy.get('[data-testid="generate-api-keys-close-btn"]').click();
    }
    it.only("Generate API Keys", () => {
        cy.loginToDevportal(developer, password);
        cy.visit('/devportal/applications/create?tenant=carbon.super');

        // Filling the form
        cy.get('#application-name').dblclick();
        cy.get('#application-name').type(appName);
        cy.get('#application-description').click();
        cy.get('#application-description').type('{backspace}');
        cy.get('#application-description').type(appDescription);
        cy.get('[data-testid="application-save-btn"]').click();

        // Checking the app name exists in the overview page.
        cy.url().should('contain', '/overview');
        cy.get('[data-testid="application-title"]').contains(appName).should('exist');

        // Generating keys production
        cy.get('[data-testid="left-menu-productionkeys/apikey"]').click();
        // Generate with none option
        cy.get('[data-testid="generate-key-btn"]').click();
        cy.get('[data-testid="generate-api-keys-btn"]').click();

        checkIfKeyExists();

        // Generate with ip option
        cy.get('[data-testid="api-key-restriction-ip"]').click();
        cy.get('[data-testid="ip-address-txt"] input').type('192.168.1.2');
        cy.get('[data-testid="ip-address-add-btn"]').click();
        cy.get('[data-testid="generate-key-btn"]').click();
        cy.get('[data-testid="generate-api-keys-btn"]').click();

        checkIfKeyExists();

        cy.get('[data-testid="api-key-restriction-referer"]').click();
        cy.get('[data-testid="referer-txt"] input').type('www.example.com/path');
        cy.get('[data-testid="referer-add-btn"]').click();
        cy.get('[data-testid="generate-key-btn"]').click();
        cy.get('[data-testid="generate-api-keys-btn"]').click();

        checkIfKeyExists();
    })

    after(() => {
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="delete-${appName}-btn"]`, { timeout: 30000 });
        cy.get(`[data-testid="delete-${appName}-btn"]`).click();
        cy.get(`[data-testid="application-delete-confirm-btn"]`).click();

        // delete developer
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(developer);
    })
})
