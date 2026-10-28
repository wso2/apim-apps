/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

describe("Delete subscription of an API that is no longer visible to the subscriber", () => {
    const { publisher, developer, password } = Utils.getUserInfo();
    const apiVersion = '1.0.0';
    const appDescription = 'app description';
    // The developer user has Internal/subscriber but not Internal/publisher. The API is first restricted
    // to both roles, and removing Internal/subscriber afterwards hides the API from the developer.
    const developerRole = 'Internal/subscriber';
    const otherRole = 'Internal/publisher';
    let apiName;
    let apiContext;
    let appName;
    let testApiId;

    beforeEach(() => {
        // Use fresh names on every attempt, so a retry does not collide with an API or
        // application that a failed attempt could not clean up
        apiName = Utils.generateName();
        apiContext = apiName;
        appName = Utils.generateName();
        testApiId = undefined;
    });

    // Wait until the Developer Portal shows the signed in user. Leaving the page earlier makes the next page
    // sign in again and reload, which can wipe out what the test types into it.
    const loginAsDeveloper = () => {
        cy.loginToDevportal(developer, password);
        cy.get('#userToggleButton', { timeout: Cypress.env('largeTimeout') }).should('be.visible');
    };

    // Match the whole label, so a role does not match an invalid chip that contains its name
    const roleChip = (role) => cy.contains('div[data-testid="visibility-select-role"] .MuiChip-root',
        new RegExp(`^${role}$`));

    // The role input can keep the text of the previously added role, so clear it before typing the next one
    const addVisibleRole = (role) => {
        cy.get('[data-testid="visibility-select-role"] input').clear().type(`${role}{enter}`);
        roleChip(role).should('exist');
    };

    // Changes the Developer Portal visibility roles of the API on its Design Configurations page and saves them
    const updateVisibleRoles = (apiId, changeRoles) => {
        cy.visit(`/publisher/apis/${apiId}/overview`);
        cy.get('#itest-api-details-portal-config-acc', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get('#left-menu-itemDesignConfigurations').click();
        changeRoles();
        cy.intercept('PUT', `**/apis/${apiId}`).as('apiUpdate');
        cy.get('#design-config-save-btn').scrollIntoView().click();
        cy.wait('@apiUpdate', { timeout: Cypress.env('largeTimeout') })
            .its('response.statusCode').should('eq', 200);
    };

    it("Subscriber can delete the subscription after losing visibility of the API", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                // Restrict the Developer Portal visibility to a role the developer has and one it does not have
                updateVisibleRoles(apiId, () => {
                    cy.get('#storeVisibility-selector').scrollIntoView().click();
                    cy.get('#visibility-restricted-by-roles').scrollIntoView().click();
                    // Add the roles one at a time, since each role is validated before it is added
                    addVisibleRole(developerRole);
                    addVisibleRole(otherRole);
                });
                cy.logoutFromPublisher();

                // Subscribe to the API while it is still visible to the developer through Internal/subscriber
                loginAsDeveloper();
                cy.createApp(appName, appDescription);
                cy.visit(`/devportal/applications?tenant=carbon.super`);
                cy.get(`#itest-application-list-table td a`, { timeout: Cypress.env('largeTimeout') })
                    .contains(appName).click();
                cy.get('#left-menu-subscriptions').click();
                cy.intercept('**/apis**').as('apiGet');
                cy.get('[data-testid="api-subscriptions-section"]').within(() => {
                    cy.get('button').contains('Subscribe').click();
                });
                cy.wait('@apiGet', { timeout: Cypress.env('largeTimeout') }).then(() => {
                    cy.wait(2000);
                    cy.get('[aria-labelledby="simple-dialog-title"]').find('input[placeholder="Search APIs"]')
                        .click().type(apiName + "{enter}");
                    cy.contains('1-1 of 1');
                    cy.get(`#policy-subscribe-btn-${apiId}`).contains('Subscribe').click();
                    cy.get('button[aria-label="close"]').click();
                    cy.contains('tr', `${apiName} - ${apiVersion}`).contains('PUBLISHED').should('exist');
                });
                cy.logoutFromDevportal();

                // Remove the developer's role from the allowed roles, so the developer loses visibility of the API
                cy.loginToPublisher(publisher, password);
                updateVisibleRoles(apiId, () => {
                    roleChip(developerRole).find('svg[class*=MuiChip-deleteIcon]').click();
                    roleChip(developerRole).should('not.exist');
                    roleChip(otherRole).should('exist');
                });
                cy.logoutFromPublisher();

                // The subscription is still listed, but the API details are no longer available
                loginAsDeveloper();
                // The subscription listing has no API id for this row, so the UI must not request
                // the API with an unresolved path parameter.
                cy.intercept('GET', /\/api\/am\/devportal\/v3\/apis\/(%7BapiId%7D|\{apiId\}|undefined|null)(\?|$)/)
                    .as('unresolvedApiGet');
                cy.visit(`/devportal/applications?tenant=carbon.super`);
                cy.get(`#itest-application-list-table td a`, { timeout: Cypress.env('largeTimeout') })
                    .contains(appName).click();
                cy.get('#left-menu-subscriptions').click();

                cy.contains('tr', `${apiName} - ${apiVersion}`, { timeout: Cypress.env('largeTimeout') })
                    .as('subscriptionRow');
                cy.get('@subscriptionRow').contains('Not accessible').should('exist');
                cy.get('@subscriptionRow').contains('button', 'Edit').should('be.disabled');
                cy.get('@subscriptionRow').contains('button', 'Delete').should('not.be.disabled');

                cy.get('@subscriptionRow').contains('Not accessible').trigger('mouseover');
                cy.get('[role="tooltip"]', { timeout: 10000 })
                    .should('be.visible')
                    .and('contain', 'You no longer have access to view this API');
                cy.get('@subscriptionRow').contains('Not accessible').trigger('mouseout');

                // Delete the subscription
                cy.get('@subscriptionRow').contains('button', 'Delete').click();
                cy.get('#delete-api-subscription-confirm-btn').click();
                cy.contains('Subscription deleted successfully!').should('exist');
                cy.contains('tr', `${apiName} - ${apiVersion}`).should('not.exist');

                cy.get('@unresolvedApiGet.all').should('have.length', 0);
                cy.logoutFromDevportal();
            });
        });
    });

    afterEach(() => {
        // Start from a clean session, since a failed attempt can leave either portal logged in
        cy.clearCookies();
        cy.clearLocalStorage();
        // Delete the application first, since the API cannot be deleted while it has subscriptions
        loginAsDeveloper();
        cy.visit(`/devportal/applications?tenant=carbon.super`);
        // Wait for the listing to load, which shows either the applications or an empty state, before
        // checking whether the application exists
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should(($body) => {
            expect($body.find('#itest-application-list-table td a').length > 0
                || $body.text().includes('No Applications Available')).to.be.true;
        });
        cy.get('body').then(($body) => {
            if ($body.find(`#delete-${appName}-btn`).length > 0) {
                cy.get(`#delete-${appName}-btn`).click();
                cy.get(`#itest-confirm-application-delete`).click();
                cy.get(`#delete-${appName}-btn`).should('not.exist');
            }
        });
        cy.logoutFromDevportal();
        if (testApiId) {
            const id = testApiId;
            testApiId = undefined;
            // Drop the Developer Portal token cookies, so the API is deleted with the publisher's token
            cy.clearCookies();
            cy.loginToPublisher(publisher, password);
            Utils.deleteAPI(id);
            cy.logoutFromPublisher();
        }
    });
});
