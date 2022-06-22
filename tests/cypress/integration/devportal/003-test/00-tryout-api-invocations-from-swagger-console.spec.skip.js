/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import Utils from "@support/utils";

describe("Tryout API invocations", () => {
    const { publisher, developer, password, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;
    const appName = Utils.generateName();
    it.only("Tryout API invocations from swagger console", () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);

                Cypress.on('uncaught:exception', () => false);

                // Create an app and subscribe
                cy.createApp(appName, 'application description');
                cy.visit(`${Utils.getAppOrigin()}/devportal/apis/${apiId}/credentials?tenant=carbon.super`);

                // Click and select the new application
                cy.get('#application-subscribe', {timeout: 30000});
                cy.get('#application-subscribe').click();
                cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
                cy.get(`#subscribe-to-api-btn`).click();
                cy.get(`#subscription-table td`).contains(appName).should('exist');

                // Generate prod keys
                cy.get(`#${appName}-PK`).click();
                cy.get('#generate-keys').click();
                cy.get('#consumer-key', { timeout: 30000 });
                cy.get('#consumer-key').should('exist');

                // Go to test console
                cy.get('#left-menu-test').click();

                // cy.intercept('**/oauth-keys').as('oauthKeys');
                // cy.wait('@oauthKeys');

                cy.get('#gen-test-key').should('not.have.attr', 'disabled', { timeout: 30000 });
                // Generate token and wait for response
                cy.get('#gen-test-key').click();

                cy.intercept('**/generate-token').as('genToken');
                cy.wait('@genToken');

                // Test the console
                cy.get('#operations-pet-getPetById').click();
                cy.get('#operations-pet-getPetById .try-out__btn').click();
                cy.get('#operations-pet-getPetById [placeholder="petId"]').type('1');
                cy.get('#operations-pet-getPetById button.execute').click();
                cy.get('#operations-pet-getPetById  td.response-col_status').contains('200').should('exist');
            })
        });
    });

    after(() => {
        cy.deleteApp(appName);
        Utils.deleteAPI(testApiId);
    })
});