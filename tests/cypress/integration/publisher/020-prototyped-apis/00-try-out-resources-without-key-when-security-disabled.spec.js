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

describe("Add Authorization Header for the api", () => {
    const userName = 'admin';
    const password = 'admin';
    const apiName="Prototyped_sample";
    const apiVersion='1.0.0';
    before(function () {
        cy.loginToPublisher(userName, password);
        cy.on('uncaught:exception', (err, runnable) => {
            if (err.message.includes('applicationId is not provided')||err.message.includes('validateDescription is not a function')) {
              return false
            }
          });
    })
    it.only("Add Authorization Header for the api", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
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

        //disable security
        cy.get("#left-menu-itemresources").click();
        cy.get('button[aria-label="disable security for all"]').click();
        cy.get('button[aria-label="select merge strategy"]').click();
        cy.get("#split-button-menu").contains('li','Save and deploy').click();
        cy.get('[data-testid="Defaultgateway-select-btn"]').click();
        cy.get('[data-testid="btn-deploy"]').click();

        cy.get("#left-menu-itemlifecycle").click();
        cy.get('[data-testid="Deploy as a Prototype-btn"]',{timeout:3000}).click();

        cy.logoutFromPublisher();

        //login to dev portal as Developer
        cy.loginToDevportal(userName, password);
        cy.get('table > tbody > tr',{timeout:6000}).get(`[area-label="Go to ${apiName}"]`).contains('.api-thumb-chip-main','PRE-RELEASED').should('exist');
        cy.get('table > tbody > tr',{timeout:6000}).get(`[area-label="Go to ${apiName}"]`).click();
        cy.contains('a',"Try out",{timeout:3000}).click();
        cy.get('.opblock-summary-get > .opblock-summary-control').click();
        cy.get('.try-out__btn').click();
        cy.get('.execute').click();
        cy.contains('.live-responses-table .response > .response-col_status','200').should('exist');
       
        cy.logoutFromDevportal();
        cy.loginToPublisher(userName, password);
    });

    after(function () {
        // Test is done. Now delete the api
        cy.deleteApi(apiName,apiVersion);
    })
});