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

describe("Subscribe unsubscribe to application from api details page", () => {
    const { publisher, developer, password, tenantUser, tenant, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;
    const appName = Utils.generateName();
    const appDescription = 'app description';

    it.only("Subscribe and unsubscribe to API from api details page", () => {

        cy.loginToPublisher(publisher, password);

        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                cy.createApp(appName, appDescription);
                cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
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
                    cy.get(`[title="${apiName}"]`, { timeout: 30000 });
                    cy.get(`[title="${apiName}"]`).click();
                    cy.get('#left-menu-credentials').click();
            
                    // Click and select the new application
                    cy.get('#application-subscribe').click();
                    cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
                    cy.get(`#subscribe-to-api-btn`).click();
                    cy.get(`#subscription-table td`).contains(appName).should('exist');
                });
            });
        });
    })

    after(() => {
        cy.deleteApp(appName);
        Utils.deleteAPI(testApiId);
    })
})