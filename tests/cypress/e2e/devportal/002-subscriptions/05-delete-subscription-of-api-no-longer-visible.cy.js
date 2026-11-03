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
import UsersAndRoles from "../../../support/functions/carbon/UsersAndRoles";

describe("Delete subscription of an API that is no longer visible to the subscriber", () => {
    const { publisher, password, carbonUsername, carbonPassword } = Utils.getUserInfo();
    // A dedicated user with only Internal/subscriber, since the shared test users can hold more roles than
    // requested, and any role in the allowed list or admin rights would keep the API visible to them
    const subscriber = 'visibilityTestSubscriber';
    const apiVersion = '1.0.0';
    const appDescription = 'app description';
    // The API is first restricted to Internal/subscriber and Internal/publisher, and removing
    // Internal/subscriber afterwards hides the API from the subscriber.
    const subscriberRole = 'Internal/subscriber';
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

    before(() => {
        cy.carbonLogin(carbonUsername, carbonPassword);
        // Clean up a user left behind by an earlier failed run
        cy.searchAndDeleteUserIfExist(subscriber);
        UsersAndRoles.addNewUserAndUpdateRoles(subscriber, [subscriberRole], password);
    });

    after(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.searchAndDeleteUserIfExist(subscriber);
    });

    // Wait until the Developer Portal shows the signed in user. Leaving the page earlier makes the next page
    // sign in again and reload, which can wipe out what the test types into it. The user menu is only rendered
    // for a signed in user and can be clipped in a narrow window, so check that it exists rather than is visible.
    const loginAsSubscriber = () => {
        cy.loginToDevportal(subscriber, password);
        cy.get('#userToggleButton', { timeout: Cypress.env('largeTimeout') }).should('exist');
    };

    // Sign out by leaving the Developer Portal and clearing the session, instead of using its logout page. After
    // a logout, the Developer Portal checks the session in the background and redirects, and those redirects can
    // take over the next page the test visits, such as the publisher login page.
    const signOutSubscriber = () => {
        cy.visit('/carbon/admin/login.jsp');
        cy.clearCookies();
        cy.clearLocalStorage();
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
                // Restrict the Developer Portal visibility to a role the subscriber has and one it does not have
                updateVisibleRoles(apiId, () => {
                    cy.get('#storeVisibility-selector').scrollIntoView().click();
                    cy.get('#visibility-restricted-by-roles').scrollIntoView().click();
                    // Add the roles one at a time, since each role is validated before it is added
                    addVisibleRole(subscriberRole);
                    addVisibleRole(otherRole);
                });
                cy.logoutFromPublisher();

                // Subscribe to the API while it is still visible to the subscriber through Internal/subscriber
                loginAsSubscriber();
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
                signOutSubscriber();

                // Remove the subscriber's role from the allowed roles, so the subscriber loses visibility of the API
                cy.loginToPublisher(publisher, password);
                updateVisibleRoles(apiId, () => {
                    roleChip(subscriberRole).find('svg[class*=MuiChip-deleteIcon]').click();
                    roleChip(subscriberRole).should('not.exist');
                    roleChip(otherRole).should('exist');
                });
                cy.logoutFromPublisher();

                // The subscription is still listed, but the API details are no longer available
                loginAsSubscriber();
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
                // The API name is plain text instead of a link, with a chip next to it
                cy.get('@subscriptionRow').find('td').eq(0).as('apiCell');
                cy.get('@apiCell').find('a').should('not.exist');
                cy.get('@apiCell').contains('.MuiChip-root', 'Not accessible').as('notAccessibleChip');
                // The lifecycle state is not returned for the API, so it is shown as unavailable
                cy.get('@subscriptionRow').find('td').eq(1).should('have.text', 'Unavailable');
                cy.get('@subscriptionRow').contains('button', 'Edit').should('be.disabled');
                cy.get('@subscriptionRow').contains('button', 'Delete').should('not.be.disabled');

                // The reason is shown when hovering the chip
                cy.get('@notAccessibleChip').trigger('mouseover');
                cy.get('[role="tooltip"]', { timeout: 10000 })
                    .should('be.visible')
                    .and('contain', 'You no longer have access to view this API');
                cy.get('@notAccessibleChip').trigger('mouseout');

                // Delete the subscription
                cy.get('@subscriptionRow').contains('button', 'Delete').click();
                cy.get('#delete-api-subscription-confirm-btn').click();
                cy.contains('Subscription deleted successfully!').should('exist');
                cy.contains('tr', `${apiName} - ${apiVersion}`).should('not.exist');

                cy.get('@unresolvedApiGet.all').should('have.length', 0);
                signOutSubscriber();
            });
        });
    });

    afterEach(() => {
        // Start from a clean session, since a failed attempt can leave either portal logged in
        cy.clearCookies();
        cy.clearLocalStorage();
        // Delete the application first, since the API cannot be deleted while it has subscriptions
        loginAsSubscriber();
        cy.visit(`/devportal/applications?tenant=carbon.super`);
        // The listing is paginated, so search for the application by name instead of checking only the
        // first page. This also covers an application whose creation was not confirmed before a failure.
        cy.intercept('GET', new RegExp(`/applications\\?.*query=${appName}`)).as('appSearch');
        cy.get('#search-label', { timeout: Cypress.env('largeTimeout') }).type(`${appName}{enter}`);
        cy.wait('@appSearch', { timeout: Cypress.env('largeTimeout') });
        // Wait for the search results to render, which show either only matching applications or a
        // no results message, before checking whether the application exists
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should(($body) => {
            // Check only the name column, since other columns hold links such as the edit button, and the
            // name is plain text instead of a link while an application is not approved yet
            const names = $body.find('#itest-application-list-table tbody tr td:first-child').toArray();
            expect((names.length > 0 && names.every((name) => name.textContent.includes(appName)))
                || $body.text().includes('No Matching Applications')).to.be.true;
        });
        cy.get('body').then(($body) => {
            if ($body.find(`#delete-${appName}-btn`).length > 0) {
                cy.get(`#delete-${appName}-btn`).click();
                cy.get(`#itest-confirm-application-delete`).click();
                cy.get(`#delete-${appName}-btn`).should('not.exist');
            }
        });
        // This also drops the Developer Portal token cookies, so the API is deleted with the publisher's token
        signOutSubscriber();
        if (testApiId) {
            const id = testApiId;
            testApiId = undefined;
            cy.loginToPublisher(publisher, password);
            Utils.deleteAPI(id);
            cy.logoutFromPublisher();
        }
    });
});
