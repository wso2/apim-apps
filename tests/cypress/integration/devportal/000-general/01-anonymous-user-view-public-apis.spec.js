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

    it.only("Anonymous view apis", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        cy.loginToPublisher(publisher, password);

        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then((serverResponse) => {
                console.log(serverResponse);
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                cy.visit(`/devportal/apis?tenant=carbon.super`);

                // After publishing the api appears in devportal with a delay.
                // We need to keep refresing and look for the api in the listing page
                // following waitUntilApiExists function does that recursively.
                let remainingAttempts = 15;
                let attemptCount = 0;
                for (; attemptCount < remainingAttempts; attemptCount++) {
                    let $apis = Cypress.$(`[title="${apiName}"]`, { timeout: Cypress.config().largeTimeout });
                    if ($apis.length) {
                        // At least one with api name was found.
                        // Return a jQuery object.
                        cy.log('apis: ' + $apis.text());
                        break;
                    }
                    cy.reload();
                }
                if (attemptCount == (remainingAttempts - 1)) {
                    throw Error('Table was not found.');
                }
            });
        });
    })

    it.only("Download swagger", () => {
        cy.visit(`/devportal/apis?tenant=carbon.super`);
        cy.url().should('contain', '/apis?tenant=carbon.super');

        cy.get(`[title="${apiName}"]`, { timeout: 30000 });
        cy.get(`[title="${apiName}"]`).click();
        // intercepting overview page network calls
        cy.intercept('GET', '**/apis/**/comments?limit=5&offset=0').as('getComments');
        cy.intercept('GET', '**/apis/**/documents').as('getDocuments');
        cy.intercept('GET', '**/throttling-policies/subscription').as('getSubscriptionPolicies');
        cy.intercept('GET', '**/apis/**/thumbnail').as('getThumbnail');

        cy.get('#left-menu-overview').click();

        cy.wait(['@getComments', '@getDocuments', '@getSubscriptionPolicies', '@getThumbnail'], { timeout: 30000 })
            .then(() => {
                // Downloading swagger
                cy.get('#swagger-download-btn').click();
                Cypress.on('uncaught:exception', (err, runnable) => {
                    // returning false here prevents Cypress from
                    // failing the test
                    return false
                });
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
        cy.visit(`/devportal/apis?tenant=carbon.super`);
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