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
    const apiName="Prototyped_sample3";
    const applicationName="Prototype client app";
    const apiVersion='1.0.0';
    const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
    let testApiId;

    before(function () {
    })
    it.only("try out resources enabling the security without credentials", () => {
        cy.loginToPublisher(userName, password);
        testAPISecurityEnabled();
        let retryCount = 5;
        function testAPISecurityEnabled() {
            Utils.addAPI({name: apiName, version: apiVersion}).then((apiId) => {
                if (apiId !== undefined) {
                    testApiId = apiId;
                    cy.visit(`/publisher/apis/${apiId}/overview`);
                    cy.get('#itest-api-details-api-config-acc', {timeout: Cypress.config().largeTimeout}).click();
                    cy.get('#left-menu-itemendpoints').click();
                    cy.get('[data-testid="http/restendpoint-add-btn"]').click({force:true});
        
                    // Add the prod and sandbox endpoints
                    cy.get('#itest-api-details-endpoints-head', {timeout: Cypress.config().largeTimeout}).contains('Endpoints');
                    cy.get('#production-endpoint-checkbox', {timeout: Cypress.config().largeTimeout}).click();
                    cy.get('#production_endpoints').focus().type(endpoint);
                    cy.get('#sandbox-endpoint-checkbox').click();
                    cy.get('#sandbox_endpoints').focus().type(endpoint);
        
                    // Save
                    cy.get('body').click();
                    cy.get('#endpoint-save-btn').scrollIntoView();
                    cy.get('#endpoint-save-btn').click();
        
                    // Check the values
                    cy.get('#production_endpoints').should('have.value', endpoint);
                    cy.get('#sandbox_endpoints').should('have.value', endpoint);
        
                    //by default security enabled for resources
                    cy.get("#left-menu-itemresources").click();
                    cy.get('button[aria-label="disable security for all"]',{timeout: Cypress.config().largeTimeout}).should('exist');
                    
                    //deploy API
                    cy.get("#left-menu-itemdeployments").click();
                    cy.wait(2000);
                    cy.get("#deploy-btn",{timeout: Cypress.config().largeTimeout}).should('not.have.class', 'Mui-disabled').click({force:true});
        
                    cy.get("#left-menu-itemlifecycle").click();
                    cy.wait(2000);
                    cy.get('[data-testid="Deploy as a Prototype-btn"]',{timeout: Cypress.config().largeTimeout}).click();
        
                    cy.logoutFromPublisher();
        
                    //login to dev portal as Developer
                    cy.loginToDevportal(userName, password);
                    
                    cy.createApplication(applicationName,"50PerMin","Sample Description");
                    cy.get('[data-testid="itest-link-to-apis"]',{timeout: Cypress.config().largeTimeout}).click();
        
                    cy.get('input[placeholder="Search APIs"]').click().type(apiName + "{enter}");
                    cy.get('table > tbody > tr',{timeout: Cypress.config().largeTimeout}).get(`[area-label="Go to ${apiName}"]`).contains('.api-thumb-chip-main','PRE-RELEASED').should('exist');
                    cy.get('table > tbody > tr',{timeout: Cypress.config().largeTimeout}).get(`[area-label="Go to ${apiName}"]`).click();
        
                    // Go to application subscription page
                    cy.get("#left-menu-credentials").click();
                    cy.get('button[aria-label="Open"]').click();
                    cy.get('ul').contains('li',applicationName).click();
                    cy.get("#subscribe-to-api-btn").click();
        
                    cy.get("#left-menu-test",{timeout: Cypress.config().largeTimeout}).click();
                    
                    cy.intercept('**/applications/').then((res) => {
                        // Check if the application exists
                        cy.get("#selected-application", {timeout: Cypress.config().largeTimeout}).should('exist');
                    });
        
                    //it takes some time to generate the key
                    cy.intercept('**/generate-token').as('getToken');
        
                    cy.get('#gen-test-key',{timeout: Cypress.config().largeTimeout}).click();
        
                    cy.wait('@getToken', {timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('eq', 200);
        
                    cy.get('.opblock-summary-get > .opblock-summary-control',{timeout: Cypress.config().largeTimeout}).click();
                    cy.get('.try-out__btn').click();
                    cy.get('.execute').click();
                    cy.contains('.live-responses-table .response > .response-col_status','200', {timeout: Cypress.config().largeTimeout}).should('exist');
                } else if (retryCount>0) {
                    retryCount--;
                    testAPISecurityEnabled();
                }
                
            });
        }
        
    });

    after(function () {
        // Test is done.  delete the application
        cy.deleteApplication(applicationName);
        cy.logoutFromDevportal();

        // delete the api
        cy.loginToPublisher(userName, password);
        Utils.deleteAPI(testApiId);
    })
});