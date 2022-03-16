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

describe("Check endpoint test button", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Check endpoint test button", () => {
        const endpoint200 = 'https://petstore.swagger.io/v2/store/inventory'; // 200 OK
        const endpoint400 = 'https://petstore.swagger.io/v2/store/inventory/7777777'; //404 Not Found
        const endpointUnknown = 'http://bull-8772776363-url.foo123'; // Unknown Host
        const endpointNoProtocol = 'bullproto://'; // unknown protocol: bullproto
        cy.createAPIWithoutEndpoint();

        cy.get('#itest-api-details-api-config-acc').click();
        cy.get('#left-menu-itemendpoints').click();
        cy.get('[data-testid="http/restendpoint-add-btn"]').click();

        // Add the prod and sandbox endpoints
        cy.get('#production-endpoint-checkbox').click();

        // endpoint-test-icon
        cy.get('#production_endpoints').focus().type(endpoint200);
        cy.get('#production_endpoints-endpoint-test-icon-btn').trigger("click");
        cy.get('#production_endpoints-endpoint-test-status', { timeout: 30000 }).should('have.text', '200 OK');

         // endpoint-test-icon
         cy.get('#production_endpoints').focus().clear().type(endpoint400);
         cy.get('#production_endpoints-endpoint-test-icon-btn').trigger("click");
         cy.get('#production_endpoints-endpoint-test-status', { timeout: 30000 }).should('have.text', '404 Not Found');
 
        cy.get('#production_endpoints').focus().clear().type(endpointUnknown);
        cy.get('#production_endpoints-endpoint-test-icon-btn').trigger("click");
        cy.get('#production_endpoints-endpoint-test-status', { timeout: 30000 }).should('have.text', 'Unknown Host');

        cy.get('#production_endpoints').focus().clear().type(endpointNoProtocol);
        cy.get('#production_endpoints-endpoint-test-icon-btn').trigger("click");
        cy.get('#production_endpoints-endpoint-test-status', { timeout: 30000 }).should('have.text', 'unknown protocol: bullproto');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click({force:true});
        cy.get(`#itest-id-deleteconf`).click();

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});