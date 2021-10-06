/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *  
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
describe("Endpoint testing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add REST endpoints for production and sandbox endpoints with failover", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemendpoints"]').click();
        cy.get('[data-testid="http__rest_endpoint-start"]').click();

        // Add the prod and sandbox endpoints
        cy.get('[data-testid="sandbox-endpoint-checkbox"] input').check();
        cy.get('[data-testid="production-endpoint-checkbox"]').click();
        cy.get('#primaryEndpoint').focus().type(endpoint);
        cy.get('#sandboxEndpoint').focus().type(endpoint);

        // failover
        cy.get('[data-testid="loadbalance-failover-config-title"]').click();
        cy.get('[data-testid="loadbalance-failover-config-type"]').click();
        cy.get('[data-testid="loadbalance-failover-config-type-failover"]').click();
        
        // add prod endpoints for failover
        cy.get('[data-testid="production-endpoints"] [data-testid="generic-endpoint-add-text-field"] input').focus().type(endpoint);
        cy.get('[data-testid="production-endpoints"] [data-testid="generic-endpoint-add"]').click();

        // add sandbox endpoints for failover
        cy.get('[data-testid="sandbox-endpoints"] [data-testid="generic-endpoint-add-text-field"] input').focus().type(endpoint);
        cy.get('[data-testid="sandbox-endpoints"] [data-testid="generic-endpoint-add"]').click();
        // Save
        cy.get('[data-testid="endpoint-save-btn"]').click();

        // Check the values
        cy.get('[data-testid="production-endpoints"] [data-testid="generic-endpoint-text-field"] input').should('have.value', endpoint);
        cy.get('[data-testid="sandbox-endpoints"] [data-testid="generic-endpoint-text-field"] input').should('have.value', endpoint);
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});