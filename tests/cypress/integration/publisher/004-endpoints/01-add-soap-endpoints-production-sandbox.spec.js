
describe("do nothing", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add Authorization Header for the api", () => {
        const endpoint = 'https://graphical.weather.gov/xml/SOAP_server/ndfdXMLserver.php?wsdl';
        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemendpoints"]').click();
        cy.get('[data-testid="http__soap_endpoint-start"]').click();

        // Add the prod and sandbox endpoints
        cy.get('[data-testid="sandbox-endpoint-checkbox"] input').check();
        cy.get('[data-testid="production-endpoint-checkbox"]').click();
        cy.get('#primaryEndpoint').focus().type(endpoint);
        cy.get('#sandboxEndpoint').focus().type(endpoint);

        // Save
        cy.get('[data-testid="endpoint-save-btn"]').click();

        // Check the values
        cy.get('#primaryEndpoint').should('have.value', endpoint);
        cy.get('#sandboxEndpoint').should('have.value', endpoint);

    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});