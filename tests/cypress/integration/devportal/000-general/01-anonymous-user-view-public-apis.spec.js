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

import Utils from "@support/utils";

describe("Anonymous view apis", () => {
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiVersion = '2.0.0';
    let randomNumber;
    let apiName;
    let apiContext;

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.reload();
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.reload();
        cy.carbonLogout();
        cy.loginToPublisher(publisher, password);

        randomNumber = Math.floor(Math.random() * (100000 - 1 + 1) + 1);
        apiName = `anonymousApi`;
        apiContext = `anonymous${randomNumber}`;
        cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.logoutFromPublisher();
    })
    it.only("Anonymous view apis", () => {
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
        cy.url().should('contain', '/logout?referrer=/apis?tenant=carbon.super');
        cy.url().should('contain', '/apis?tenant=carbon.super');

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
        });
    })

    it.only("Download swagger", () => {
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
        cy.url().should('contain', '/apis?tenant=carbon.super');

        cy.get(`[title="${apiName}"]`, { timeout: 30000 });
        cy.get(`[title="${apiName}"]`).click();
        cy.get('#left-menu-overview').click();

        // Downloading swagger
        cy.get('#swagger-download-btn').click();

        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/swagger.json`;
        cy.readFile(downloadedFilename);
    })

    it.only("Download client sdks", () => {
        cy.loginToDevportal(developer, password);
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get(`[title="${apiName}"]`, { timeout: 30000 });
        cy.get(`[title="${apiName}"]`).click();
        cy.get('#left-menu-sdk').click();
        // Download all sdks one by one
        cy.get('#download-sdk-btn').each(($btn) => {
            const fileName = apiName + '_' + apiVersion + '_' + 'android';
            cy.wrap($btn).click();
            // Downloading SDK
            const downloadsFolder = Cypress.config('downloadsFolder')
            const downloadedFilename = `${downloadsFolder}/${fileName}.zip`;

            cy.readFile(downloadedFilename, 'binary', { timeout: 15000 })
                .should(buffer => expect(buffer.length).to.be.gt(100));

        })
    })

    it.only("Login to devportal by supper tenant user", () => {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewTenant('wso2.com', 'admin');
        cy.portalLogin('admin@wso2.com', 'admin', 'devportal');
    })

    after(() => {
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, apiVersion);

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(developer);
        cy.deleteUser(publisher);
    })
})