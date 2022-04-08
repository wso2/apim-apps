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

import Utils from "@support/utils";

describe("Change subscription tier of an application", () => {
    const appName = 'subscribeapp' + Math.floor(Date.now() / 1000);
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;
    const apiVersion = '2.0.0';
    const apiContext = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })
    it.only("Change subscription tier", () => {

        Cypress.on('uncaught:exception', () => false);

        cy.loginToPublisher(publisher, password);
        cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.get('#itest-api-details-portal-config-acc').click();
        cy.get('#left-menu-itemsubscriptions').click();
        cy.get('[data-testid="policy-checkbox-silver"]').click();
        cy.get('#subscriptions-save-btn').click();
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);

        // After publishing the api appears in devportal with a delay.
        // We need to keep refresing and look for the api in the listing page
        // following waitUntilApiExists function does that recursively.
        let remainingAttempts = 30;

        function waitUntilApiExists() {
            let $apis = Cypress.$(`[title="${apiName}"]`);
            if ($apis.length) {
                // At least one with api name was found.
                // Return a jQuery object.
                return $apis;
            }

            if (--remainingAttempts) {
                cy.log('Table not found yet. Remaining attempts: ' + remainingAttempts);

                // Requesting the page to reload (F5)
                cy.reload();

                // Wait a second for the server to respond and the DOM to be present.
                return cy.wait(4000).then(() => {
                    return waitUntilApiExists();
                });
            }
            throw Error('Table was not found.');
        }

        waitUntilApiExists().then($apis => {
            cy.log('apis: ' + $apis.text());
            // Create an app and subscribe
            cy.createApp(appName, 'application description');
            cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
            cy.get(`#itest-application-list-table td a`).contains(appName).click();

            // Go to application subscription page
            cy.get('#left-menu-subscriptions').click();
            cy.get('#subscribe-api-btn').click();
            cy.get(`#policy-select`).click();
            cy.get(`#policy-select-Unlimited`).click();
            cy.get(`#policy-subscribe-btn`).click();
            cy.get('#close-btn').click();

            // Check the subscriptions existence
            cy.get(`#subscriptions-table td a`).contains(`${apiName} - ${apiVersion}`).should('exist');

            // Edit the subscription
            cy.get(`#edit-api-subscription-${apiName}`).click();
            cy.get('#outlined-select-currency').click();
            cy.get(`data-value="Unlimited"`).click();
            cy.get('button span').contains('Update').click();

            // Checking the update is success.
            cy.wait(4000);
            cy.get(`#subscriptions-table td`).contains('Silver').should('exist');
        });
    });

    after(function () {
        // Test is done. Now delete the api
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
        cy.get(`#delete-${appName}-btn`, { timeout: 30000 });
        cy.get(`#delete-${appName}-btn`).click();
        cy.get(`#itest-confirm-application-delete`).click();
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, apiVersion);
        // delete users
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(developer);
        cy.deleteUser(publisher);
    })
});
