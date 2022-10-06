
describe("Endpoint testing", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })

    it.only("Add REST endpoints for production and sandbox endpoints with failover", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        cy.loginToPublisher(publisher, password);
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

        //cy.visit('carbon/user/user-mgt.jsp');
        //cy.deleteUser(publisher);
    })
});