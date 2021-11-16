
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

describe("Anonymous view apis", () => {
    const appName = 'subscribeapp' + Math.floor(Date.now() / 1000);
    const appDescription = 'app description';
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })

    it.only("Subscribe unsubscribe to app from application view", () => {
        cy.loginToPublisher(publisher, password);
        cy.deploySampleAPI();
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);
        cy.createApp(appName, appDescription);
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="application-listing-table"] td a`).contains(appName).click();

        // Go to application subscription page
        cy.get('[data-testid="left-menu-subscriptions"]').click();
        cy.get('[data-testid="subscribe-api-btn"]').click();
        cy.get('[data-testid="subscribe-to-api-table"] td button span').contains('Subscribe').click();
        cy.get('[data-testid="close-btn"]').click();

        // check if the subscription exists
        cy.get(`[data-testid="subscriptions-table"] td a`).contains('PizzaShackAPI - 1.0.0').should('exist');

        // Unsubscribe
        cy.get('[data-testid="delete-api-subscription-PizzaShackAPI"]').click();
        cy.get('[data-testid="delete-api-subscription-confirm-btn"]').click();

        // Check if unsubscribed successfully
        cy.get('[data-testid="delete-api-subscription-PizzaShackAPI"]').should('not.exist');

        // Editing application
        cy.get('[data-testid="edit-application"]').click();
        cy.get('#application-name').click();
        cy.get('#application-name').type(2);

        cy.get('[data-testid="application-save-btn"]').click();

        // Checking the app name exists in the overview page.
        cy.url().should('contain', '/overview');
        cy.get('[data-testid="application-title"]').contains(appName + '2').should('exist');
    })

    after(() => {
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="delete-${appName}2-btn"]`, { timeout: 30000 });
        cy.get(`[data-testid="delete-${appName}2-btn"]`).click();
        cy.get(`[data-testid="application-delete-confirm-btn"]`).click();

        // Delete api
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi('PizzaShackAPI', '1.0.0');

         // delete developer
         cy.visit('carbon/user/user-mgt.jsp');
         cy.deleteUser(developer);
         cy.deleteUser(publisher);
    })
})
