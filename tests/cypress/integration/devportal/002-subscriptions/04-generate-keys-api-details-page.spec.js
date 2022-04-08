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

describe("Generate keys from api details page", () => {
    const appName = 'subscribeapp' + Math.floor(Date.now() / 1000);
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;
    const apiVersion = '2.0.0';
    const apiContext = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })
    it.only("Generate keys from api details page", () => {

        Cypress.on('uncaught:exception', () => false);

        cy.loginToPublisher(publisher, password);
        cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);

        // Create an app and subscribe
        cy.createApp(appName, 'application description');
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get(`[title="${apiName}"]`, { timeout: 30000 });
        cy.get(`[title="${apiName}"]`).click();
        cy.get('#left-menu-credentials').click();

        // Click and select the new application
        cy.get('#application-subscribe').click();
        cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
        cy.get(`#subscribe-to-api-btn`).click();
        cy.get(`#subscription-table td`).contains(appName).should('exist');

        // Generate prod keys
        cy.get(`#${appName}-PK`).click();
        cy.get('#generate-keys').click();
        cy.get('#consumer-key', {timeout: 30000});
        cy.get('#consumer-key').should('exist');

        
    })

    after(() => {
        cy.get(`#${appName}-UN`).click();
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
        cy.get(`#delete-${appName}-btn`, {timeout: 30000});
        cy.get(`#delete-${appName}-btn`).click();
        cy.get(`#itest-confirm-application-delete`).click();

        // Delete api
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, apiVersion);

         // delete users
         cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
         cy.deleteUser(developer);
         cy.deleteUser(publisher);
    })
})