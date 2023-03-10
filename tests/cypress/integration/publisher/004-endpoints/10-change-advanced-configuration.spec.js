/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

describe("publisher-004-08 : Change advanced configuration", () => {
    const { publisher, password, superTenant, testTenant} = Utils.getUserInfo();
    // Correct input should filter out non-numeric characters
    const userInput = 'abcde..-123+@#$%';
    const correctInput = '123';
    const endpoint = 'https://petstore.swagger.io/v2/store/inventory';

    const changeAdvancedConfiguration = (tenant) => {
        cy.loginToPublisher(publisher, password, tenant);
        Utils.addAPI({}).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();

            // Open the production endpoint
            cy.get('#production-endpoint-checkbox').click();
            cy.get('#production_endpoints').focus().type(endpoint);
            // Open advanced configurations
            cy.get('#production_endpoints-endpoint-configuration-icon-btn').click();

            // Set initial duration
            cy.get('#initial-duration-input').click();
            cy.get('#initial-duration-input').clear();
            cy.get('#initial-duration-input').type(userInput);

            // Set max duration
            cy.get('#max-duration-input').click();
            cy.get('#max-duration-input').clear();
            cy.get('#max-duration-input').type(userInput);

            // Set factor
            cy.get('#factor-input').click();
            cy.get('#factor-input').clear();
            cy.get('#factor-input').type(userInput);

            // Set retries
            cy.get('#retries-input').click();
            cy.get('#retries-input').clear();
            cy.get('#retries-input').type(userInput);

            // Set retry delay
            cy.get('#retry-delay-input').click();
            cy.get('#retry-delay-input').clear();
            cy.get('#retry-delay-input').type(userInput);

            // Set connection timeout
            cy.get('#duration-input').click();
            cy.get('#duration-input').clear();
            cy.get('#duration-input').type(userInput);

            cy.get('#endpoint-configuration-submit-btn').click();

            // Open the sandbox endpoint
            cy.get('#sandbox-endpoint-checkbox').click();
            cy.get('#sandbox_endpoints').focus().type(endpoint);
            // Open advanced configurations
            cy.get('#sandbox_endpoints-endpoint-configuration-icon-btn').click();

            // Set initial duration
            cy.get('#initial-duration-input').click();
            cy.get('#initial-duration-input').clear();
            cy.get('#initial-duration-input').type(userInput);

            // Set max duration
            cy.get('#max-duration-input').click();
            cy.get('#max-duration-input').clear();
            cy.get('#max-duration-input').type(userInput);

            // Set factor
            cy.get('#factor-input').click();
            cy.get('#factor-input').clear();
            cy.get('#factor-input').type(userInput);

            // Set retries
            cy.get('#retries-input').click();
            cy.get('#retries-input').clear();
            cy.get('#retries-input').type(userInput);

            // Set retry delay
            cy.get('#retry-delay-input').click();
            cy.get('#retry-delay-input').clear();
            cy.get('#retry-delay-input').type(userInput);

            // Set connection timeout
            cy.get('#duration-input').click();
            cy.get('#duration-input').clear();
            cy.get('#duration-input').type(userInput);

            cy.get('#endpoint-configuration-submit-btn').click();

            // Check the production endpoint connection timeout value
            cy.get('#production_endpoints-endpoint-configuration-icon-btn').click();
            cy.get('#initial-duration-input').should('have.value', correctInput);
            cy.get('#max-duration-input').should('have.value', correctInput);
            cy.get('#factor-input').should('have.value', correctInput);
            cy.get('#retries-input').should('have.value', correctInput);
            cy.get('#retry-delay-input').should('have.value', correctInput);
            cy.get('#duration-input').should('have.value', correctInput);
            cy.get('#endpoint-configuration-submit-btn').click();

            // Check the sandbox endpoint connection timeout value
            cy.get('#sandbox_endpoints-endpoint-configuration-icon-btn').click();
            cy.get('#initial-duration-input').should('have.value', correctInput);
            cy.get('#max-duration-input').should('have.value', correctInput);
            cy.get('#factor-input').should('have.value', correctInput);
            cy.get('#retries-input').should('have.value', correctInput);
            cy.get('#retry-delay-input').should('have.value', correctInput);
            cy.get('#duration-input').should('have.value', correctInput);
            cy.get('#endpoint-configuration-submit-btn').click();

            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    }

    it.only("Change advanced configuration - super admin", () => {
        changeAdvancedConfiguration(superTenant);
    });
    it.only("Change advanced configuration - tenant user", () => {
        changeAdvancedConfiguration(testTenant);
    });
});
