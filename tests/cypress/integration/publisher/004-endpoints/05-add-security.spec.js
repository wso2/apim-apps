
describe("Add security to the endpoint", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add security to the endpoint", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        const usernameLocal = 'admin';
        const passwordLocal = 'admin';
        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemendpoints"]').click();
        cy.get('[data-testid="http__rest_endpoint-start"]').click();

        // Add the prod and sandbox endpoints
        cy.get('[data-testid="production-endpoint-checkbox"]').click();
        cy.get('#primaryEndpoint').focus().type(endpoint);


        cy.get('[data-testid="primaryEndpoint-endpoint-security-icon-btn"] .material-icons').trigger('click');
        // cy.get('body').click();
        cy.get('[data-testid="auth-type-select"]').click();
        cy.get('[data-testid="auth-type-BASIC"]').click();
        cy.get('#auth-userName').click();
        cy.get('#auth-userName').type(usernameLocal);
        cy.get('#auth-password').click();
        cy.get('#auth-password').type(passwordLocal);

        // Save the security form
        cy.get('[data-testid="endpoint-security-submit-btn"]').click();

        // Save the endpoint
        cy.get('[data-testid="endpoint-save-btn"]').click();

        // Check the values
        cy.get('[data-testid="primaryEndpoint-endpoint-security-icon-btn"] .material-icons').trigger('click');
        cy.get('#auth-userName').should('have.value', usernameLocal);
        cy.get('#auth-password').should('have.value', passwordLocal);


    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});
