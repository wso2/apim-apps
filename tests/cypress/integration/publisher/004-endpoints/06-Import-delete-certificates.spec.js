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
        const random_number = Math.floor(Date.now() / 1000);
        const testAlias = `endpointCert`;
        const endpoint = `https://petstore.swagger.io/v2/store/inventory/${random_number}`;

        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemendpoints"]').click();
        cy.get('[data-testid="http__rest_endpoint-start"]').click();

        // Add the prod and sandbox endpoints
        cy.get('[data-testid="production-endpoint-checkbox"]').click();
        cy.get('#primaryEndpoint').focus().type(endpoint);

        //Expanding the general config section
        cy.get('[data-testid="general-configuration-certs"]').trigger('click');
        cy.get('[data-testid="general-configuration-certs-add-btn"]').click();

        cy.get('[data-testid="certificate-endpoint-select"]').click();
        cy.get(`[data-value="${endpoint}"]`).click();

        cy.get('#certificateAlias').click();
        cy.get('#certificateAlias').type(testAlias);

        // upload the cert
        const filepath = 'api_artifacts/sample.crt.pem';
        cy.get('input[type="file"]').attachFile(filepath);
        
        // Click away
        cy.get('#certificateAlias').click();

        // Save the cert
        cy.get('[data-testid="upload-cert-save-btn"]').type(filepath);
        cy.wait(1000);

        // Save the endpoint
        cy.get('[data-testid="endpoint-save-btn"]').click();
        cy.get('[data-testid="endpoint-save-btn"]').then(function (el) {
            // Check the values
            cy.get('[data-testid="general-configuration-certs"]').trigger('click');
            cy.get('[data-testid="endpoint-cert-list"]').contains(testAlias).should('be.visible');         
        });
        cy.get('[data-testid="delete-cert-btn"]').trigger('click');
        cy.get('[data-testid="delete-cert-confirm-btn"]').click();
        cy.get('[data-testid="endpoint-cert-list"]').contains(testAlias).should('not.exist');         
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});