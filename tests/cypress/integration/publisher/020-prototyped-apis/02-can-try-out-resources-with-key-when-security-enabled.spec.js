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

describe("prototype apis with security enabled", () => {
    const userName = 'admin';
    const password = 'admin';
    const apiName="Prototyped_sample";
    const applicationName="Prototype client app";
    const apiVersion='1.0.0';
    const endpoint = 'https://petstore.swagger.io/v2/store/inventory';

    before(function () {
        cy.loginToPublisher(userName, password);
        cy.on('uncaught:exception', (err, runnable) => {
            if (err.message.includes('applicationId is not provided')||err.message.includes('validateDescription is not a function')) {
              return false
            }
          });
    })
    it.only("try out resources enabling the security without credentials", () => {
        cy.createAPIWithoutEndpoint(apiName,apiVersion);
        cy.get('#itest-api-details-api-config-acc').click();
        cy.get('#left-menu-itemendpoints').click();
        cy.get('[data-testid="http/restendpoint-add-btn"]').click();

        // Add the prod and sandbox endpoints
        cy.get('#production-endpoint-checkbox').click();
        cy.get('#sandbox-endpoint-checkbox').click();
        cy.get('#production_endpoints').focus().type(endpoint);
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
        cy.get('button[aria-label="disable security for all"]',{timeout:3000}).should('exist');
        
        //deploy API
        cy.get("#left-menu-itemdeployments").click();
        cy.get("#deploy-btn",{timeout:3000}).click();

        cy.get("#left-menu-itemlifecycle").click();
        cy.get('[data-testid="Deploy as a Prototype-btn"]',{timeout:3000}).click();

        cy.logoutFromPublisher();

        //login to dev portal as Developer
        cy.loginToDevportal(userName, password);
        
        cy.createApplication(applicationName,"50PerMin","Sample Description");
        cy.get('[data-testid="itest-link-to-apis"]',{timeout:3000}).click();

        cy.get('table > tbody > tr',{timeout:6000}).get(`[area-label="Go to ${apiName}"]`).contains('.api-thumb-chip-main','PRE-RELEASED').should('exist');
        cy.get('table > tbody > tr',{timeout:6000}).get(`[area-label="Go to ${apiName}"]`).click();

        // Go to application subscription page
        cy.get("#left-menu-credentials").click();
        cy.get('button[aria-label="Open"]').click();
        cy.get('ul').contains('li',applicationName).click();
        cy.get("#subscribe-to-api-btn").click();

        cy.get("#left-menu-test",{timeout:3000}).click();
        
        cy.intercept('**/applications/').then((res) => {
            // Check if the application exists
            cy.get("#selected-application").should('exist');
        });

        //it takes some time to generate the key
        cy.intercept('**/generate-token').as('getToken');

        cy.get('#gen-test-key',{timeout:3000}).click();

        cy.wait('@getToken').its('response.statusCode').should('eq', 200);

        cy.get('.opblock-summary-get > .opblock-summary-control').click();
        cy.get('.try-out__btn').click();
        cy.get('.execute').click();
        cy.contains('.live-responses-table .response > .response-col_status','200').should('exist');
    
    });

    after(function () {
        // Test is done.  delete the application
        cy.deleteApplication(applicationName);
        cy.logoutFromDevportal();

        // delete the api
        cy.loginToPublisher(userName, password);
        cy.deleteApi(apiName,apiVersion);
    })
});