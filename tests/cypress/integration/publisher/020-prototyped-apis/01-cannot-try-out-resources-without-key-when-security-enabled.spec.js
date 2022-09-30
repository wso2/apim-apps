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

describe("prototype apis with security enabled", () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });
    const userName = 'admin';
    const password = 'admin';
    const apiName="Prototyped_sample2";
    const apiVersion='1.0.0';
    let testApiId;
    beforeEach(function () {
        cy.loginToPublisher(userName, password);
    })
    it.only("try out resources enabling the security without credentials", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        Utils.addAPI({name: apiName, version: apiVersion}).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click({force:true});

            // Add the prod and sandbox endpoints
            cy.get('#production-endpoint-checkbox', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#production_endpoints', {timeout: Cypress.config().largeTimeout}).focus().type(endpoint);
            cy.get('#sandbox-endpoint-checkbox').click();
            cy.get('#sandbox_endpoints', {timeout: Cypress.config().largeTimeout}).focus().type(endpoint);

            // Save
            cy.get('body').click();
            cy.get('#endpoint-save-btn').scrollIntoView();
            cy.get('#endpoint-save-btn').click();

            // Check the values
            cy.get('#production_endpoints').should('have.value', endpoint);
            cy.get('#sandbox_endpoints').should('have.value', endpoint);

            //by default security enabled for resources
            cy.get("#left-menu-itemresources").click();
            cy.get('button[aria-label="disable security for all"]').should('exist');
            
            //deploy API
            cy.get("#left-menu-itemdeployments").click();
            cy.wait(5000);
            cy.get("#deploy-btn",{timeout: Cypress.config().largeTimeout}).should('not.have.class', 'Mui-disabled').click({force:true});

            cy.get("#left-menu-itemlifecycle").click();
            cy.wait(5000);
            cy.get('[data-testid="Deploy as a Prototype-btn"]', {timeout: Cypress.config().largeTimeout}).click();

            cy.logoutFromPublisher();

            //login to dev portal as Developer
            cy.loginToDevportal(userName, password);
            cy.get('input[placeholder="Search APIs"]').click().type(apiName + "{enter}");
            cy.get('table > tbody > tr',{timeout: Cypress.config().largeTimeout}).get(`[area-label="Go to ${apiName}"]`).contains('.api-thumb-chip-main','PRE-RELEASED').should('exist');
            cy.get('table > tbody > tr',{timeout: Cypress.config().largeTimeout}).get(`[area-label="Go to ${apiName}"]`).click();
            cy.contains('a',"Try out",{timeout: Cypress.config().largeTimeout}).click();
            cy.get('.opblock-summary-get > .opblock-summary-control', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('.try-out__btn').click();
            cy.intercept('GET','**/Prototyped_sample2/1.0.0').as("getExecute");
            cy.get('.execute').click({force:true});
            //cy.contains('.live-responses-table .response > .response-col_status','401',  {timeout: Cypress.config().largeTimeout}).should('exist');
            cy.wait(5000)
            cy.wait('@getExecute').then(() => {
                cy.get('.live-responses-table .response > td.response-col_status').then(element => {
                    cy.log(element.text());
               })
                //cy.contains('.live-responses-table .response > .response-col_status','401',  {timeout: Cypress.config().largeTimeout}).should('exist');
                cy.get('.live-responses-table .response > td.response-col_status',{timeout: Cypress.config().largeTimeout}).should("contain.text",'401')
                cy.logoutFromDevportal();
            });
        });
    });

    afterEach(function () {
        // Test is done. Now delete the api
        cy.loginToPublisher(userName, password);
        cy.log("API id ", testApiId);
        Utils.deleteAPI(testApiId);
    })
});