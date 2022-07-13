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

import Utils from "@support/utils";

describe("Anonymous view apis", () => {
    const { publisher, developer, password, tenantUser, tenant, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;

    it.only("Anonymous view apis", () => {
        cy.loginToPublisher(publisher, password);

        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then((serverResponse) => {
                console.log(serverResponse);
                cy.logoutFromPublisher();
                cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);

                // After publishing the api appears in devportal with a delay.
                // We need to keep refresing and look for the api in the listing page
                // following waitUntilApiExists function does that recursively.
                let remainingAttempts = 15;

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
                        return cy.wait(8000).then(() => {
                            return waitUntilApiExists();
                        });
                    }
                    throw Error('Table was not found.');
                }

                waitUntilApiExists().then($apis => {
                    cy.log('apis: ' + $apis.text());
                });

            });
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
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        });
        /*
        TODO
        Need to fix this part

        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/swagger.json`;
        cy.readFile(downloadedFilename);
        */
    })

    it.only("Download client sdks", () => {
        cy.loginToDevportal(developer, password);
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get(`[title="${apiName}"]`, { timeout: 30000 });
        cy.get(`[title="${apiName}"]`).click();
        cy.get('#left-menu-sdk').click();
        // Download all sdks one by one
        /*
        TODO
        Need to fix this part
        cy.get('#download-sdk-btn').each(($btn) => {
            const fileName = apiName + '_' + apiVersion + '_' + 'android';
            cy.wrap($btn).click();
            // Downloading SDK
            const downloadsFolder = Cypress.config('downloadsFolder')
            const downloadedFilename = `${downloadsFolder}/${fileName}.zip`;

            cy.readFile(downloadedFilename, 'binary', { timeout: 15000 })
                .should(buffer => expect(buffer.length).to.be.gt(100));

        })
        */
    })

    it.only("Login to devportal by supper tenant user", () => {
        cy.loginToDevportal(`${tenantUser}@${tenant}`, password);
    })

    after(() => {
        Utils.deleteAPI(testApiId);
    })
})