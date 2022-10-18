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

describe("Tryout API invocations", () => {
    const apiName = 'changeTierApi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.5';
    const appName = 'testapp' + Math.floor(Date.now() / 1000);
    const appDescription = 'change tier app description';
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })
    it.only("Tryout API invocations from swagger console", () => {
        cy.loginToPublisher(publisher, password);
        cy.createAndPublishApi(apiName, apiVersion);
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);


        // Create an app and subscribe
        cy.createApp(appName, appDescription);
        cy.visit('/devportal/apis?tenant=carbon.super');
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get(`[title="${apiName}"]`, { timeout: 30000 });
        cy.get(`[title="${apiName}"]`).click();
        cy.get('[data-testid="left-menu-credentials"]').click();

        // Click and select the new application
        cy.get('#application-subscribe').click();
        cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
        cy.get(`[data-testid="subscribe-to-api-btn"]`).click();
        cy.get(`[data-testid="subscription-table"] td`).contains(appName).should('exist');

        // Generate prod keys
        cy.get(`#${appName}-PK`).click();
        cy.get('input#client_credentials').check();
        cy.get('input#password').check();
        cy.get('[data-testid="generate-application-keys"]').click();
        cy.get('#consumer-key', { timeout: 30000 });
        cy.get('#consumer-key').should('exist');

        // Go to test console
        cy.get('[data-testid="left-menu-test"]').click();

        cy.intercept('**/oauth-keys').as('oauthKeys');
        cy.wait('@oauthKeys');

        cy.get('[data-testid="gen-test-key"]').should('not.have.attr', 'disabled', { timeout: 30000 });
        // Generate token and wait for response
        cy.get('[data-testid="gen-test-key"]').click();

        cy.intercept('**/generate-token').as('genToken');
        cy.wait('@genToken');

        // Test the console
        cy.get('#operations-pet-getPetById').click();
        cy.get('#operations-pet-getPetById .try-out__btn').click();
        cy.get('#operations-pet-getPetById [placeholder="petId"]').type('1');
        cy.get('#operations-pet-getPetById button.execute').click();
        cy.get('#operations-pet-getPetById  td.response-col_status').contains('200').should('exist');
    });

    after(function () {
        // Test is done. Now delete the app
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="delete-${appName}-btn"]`, { timeout: 30000 });
        cy.get(`[data-testid="delete-${appName}-btn"]`).click();
        cy.get(`[data-testid="application-delete-confirm-btn"]`).click();

        // Delete the api
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, apiVersion);
        
        // delete users
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(developer);
        cy.deleteUser(publisher);
    })
});