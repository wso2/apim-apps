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
    const { publisher, developer, password, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;
    const appName = Utils.generateName();
    const appDescription = 'app description';

    it.only("Subscribe unsubscribe to app from application view", () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                cy.createApp(appName, appDescription);
                cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
                cy.get(`#itest-application-list-table td a`).contains(appName).click();

                // Go to application subscription page
                cy.get('#left-menu-subscriptions').click();
                cy.intercept('**/apis**').as('apiGetFirst');
                cy.get('#subscribe-api-btn').click();
                cy.wait('@apiGetFirst', { timeout: 30000 }).then(() => {
                    cy.get('input[placeholder="Search APIs"]').type(apiName);
                    cy.intercept('**/apis**').as('apiGet');
                    cy.get('button[aria-label="search"]').click();
                    cy.wait('@apiGet', { timeout: 30000 }).then(() => {
                        cy.get('#subscribe-to-api-table td button span').contains('Subscribe').click();
                        cy.get('#close-btn').click();

                        // check if the subscription exists
                        cy.get(`#subscriptions-table td a`).contains(`${apiName} - ${apiVersion}`).should('exist');

                        // Unsubscribe
                        cy.get(`#delete-api-subscription-${apiName}`).click();
                        cy.get('#delete-api-subscription-confirm-btn').click();

                        // Check if unsubscribed successfully
                        cy.get(`#delete-api-subscription-${apiName}`).should('not.exist');

                        // Editing application
                        cy.get('#edit-application').click();
                        cy.get('#application-name').click();
                        cy.get('#application-name').type(2);

                        cy.get('#itest-application-create-save').click();

                        // Checking the app name exists in the overview page.
                        cy.url().should('contain', '/overview');
                        cy.get('#itest-info-bar-application-name').contains(appName + '2').should('exist');
                    })
                })

            });
        })

    })

    after(() => {
        cy.deleteApp(appName);
        Utils.deleteAPI(testApiId);
    })
})