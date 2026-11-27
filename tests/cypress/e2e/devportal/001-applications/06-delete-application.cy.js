/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

describe("Delete application confirmation dialog - subscription warning", () => {
    const { publisher, developer, password } = Utils.getUserInfo();

    const apiVersion = '1.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    const appName = Utils.generateName();
    let testApiId;

    it.only("Shows generic message for unsubscribed app and subscription warning for subscribed app", () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                cy.createApp(appName, 'Test app for delete confirmation');

                // --- Case 1: app with no subscriptions shows generic message ---
                cy.intercept('**/applications**').as('appList');
                cy.visit(`/devportal/applications?tenant=carbon.super`);
                cy.wait('@appList', { timeout: Cypress.env('largeTimeout') });
                cy.get(`#delete-${appName}-btn`, { timeout: 30000 }).click({ force: true });
                cy.get('[role="alertdialog"]').should('be.visible');
                cy.get('[role="alertdialog"]').contains('The application will be removed').should('exist');
                cy.get('[role="alertdialog"]').contains('active subscription').should('not.exist');
                cy.get('[role="alertdialog"]').contains('Cancel').click();
                cy.get('[role="alertdialog"]').should('not.exist');

                // --- Subscribe app to the published API ---
                cy.get(`#itest-application-list-table td a`, { timeout: Cypress.env('largeTimeout') })
                    .contains(appName).click();
                cy.get('#left-menu-subscriptions').click();
                cy.intercept('**/apis**').as('apiGet');
                cy.get('[data-testid="api-subscriptions-section"]').within(() => {
                    cy.get('button').contains('Subscribe').click();
                });
                cy.wait('@apiGet', { timeout: Cypress.env('largeTimeout') }).then(() => {
                    cy.wait(2000);
                    cy.get('[aria-labelledby="simple-dialog-title"]')
                        .find('input[placeholder="Search APIs"]').click().type(apiName + '{enter}');
                    cy.contains('1-1 of 1');
                    cy.get(`#policy-subscribe-btn-${apiId}`).contains('Subscribe').click();
                    cy.get('button[aria-label="close"]').click();
                    cy.contains(`${apiName} - ${apiVersion}`).should('exist');

                    // --- Case 2: app with 1 subscription shows warning with count ---
                    cy.intercept('**/applications**').as('appList2');
                    cy.visit(`/devportal/applications?tenant=carbon.super`);
                    cy.wait('@appList2', { timeout: Cypress.env('largeTimeout') });
                    cy.get(`#delete-${appName}-btn`, { timeout: 30000 }).click({ force: true });
                    cy.get('[role="alertdialog"]').should('be.visible');
                    cy.get('[role="alertdialog"]').contains('1 active subscription(s)').should('exist');
                    cy.get('[role="alertdialog"]').contains('The application will be removed').should('not.exist');

                    // Cancel closes the dialog cleanly (no flash of old message)
                    cy.get('[role="alertdialog"]').contains('Cancel').click();
                    cy.get('[role="alertdialog"]').should('not.exist');
                });
            });
        });
    });

    after(() => {
        cy.deleteApp(appName);
        Utils.deleteAPI(testApiId);
    });
});
