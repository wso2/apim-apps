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

describe("Add security to the endpoint", () => {
    const { publisher, password, } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add security to the endpoint", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        const usernameLocal = 'admin';
        const passwordLocal = 'admin';
        Utils.addAPI({}).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();

            // Add the prod and sandbox endpoints
            cy.get('#production-endpoint-checkbox').click();
            cy.get('#production_endpoints').focus().type(endpoint);


            cy.get('#production_endpoints-endpoint-security-icon-btn').trigger('click');
            cy.get('#mui-component-select-key').click();
            cy.get('#auth-type-BASIC').click();
            cy.get('#auth-userName').click();
            cy.get('#auth-userName').type(usernameLocal);
            cy.get('#auth-password').click();
            cy.get('#auth-password').type(passwordLocal);

            // Save the security form
            cy.get('#endpoint-security-submit-btn').click();

            // Save the endpoint
            cy.get('#endpoint-save-btn').click();

            // Check the values
            cy.get('#production_endpoints-endpoint-security-icon-btn').trigger('click');
            cy.get('#auth-userName').should('have.value', usernameLocal);
            cy.get('#auth-password').should('have.value', passwordLocal);
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});