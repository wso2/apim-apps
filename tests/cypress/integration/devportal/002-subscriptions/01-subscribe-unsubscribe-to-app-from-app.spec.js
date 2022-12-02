/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
    const appName = 'subscribeapp' + Math.floor(Date.now() / 1000);
    const appDescription = 'app description';
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;
    const apiVersion = '2.0.0';
    const apiContext = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })

    it.only("Subscribe unsubscribe to app from application view", () => {

        // Cypress.on('uncaught:exception', () => false);
        cy.loginToPublisher(publisher, password);
        cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);
        cy.createApp(appName, appDescription);
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
        cy.get(`#itest-application-list-table td a`).contains(appName).click();

        // Go to application subscription page
        cy.get('#left-menu-subscriptions').click();
        cy.get('#subscribe-api-btn').click();
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

    after(() => {
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
        cy.get(`#delete-${appName}2-btn`, { timeout: 30000 });
        cy.get(`#delete-${appName}2-btn`).click();
        cy.get(`#itest-confirm-application-delete`).click();

        // Delete api
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, apiVersion);

         // delete developer
         cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
         cy.deleteUser(developer);
         cy.deleteUser(publisher);
    })
})