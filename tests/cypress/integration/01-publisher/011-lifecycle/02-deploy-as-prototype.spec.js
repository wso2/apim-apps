
describe("Deploy as prototype", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);

    })

    it.only("Deploy as prototype", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        cy.loginToPublisher(publisher, password);
        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemendpoints"]').click();
        cy.get('[data-testid="Prototype Endpoint"]').click();
        cy.get('[data-testid="prototype_endpoint-start"]').click();

        cy.get('[data-testid="primaryEndpoint-endpoint-text-field"]').then(() => {
            cy.get('[data-testid="primaryEndpoint-endpoint-text-field"] input').focus().type(endpoint);   
        });

        // Save
        cy.get('[data-testid="endpoint-save-btn"]').then(() => {
            cy.get('[data-testid="endpoint-save-btn"]').click();   
        });

        cy.get('[data-testid="left-menu-itemlifecycle"]').click();
        cy.wait(2000);
        cy.get('button[data-testid="Deploy as a Prototype"]').then(() => {
            cy.get('button[data-testid="Deploy as a Prototype"]').click();
        });
        cy.get('button[data-testid="Demote to Created"]').should('exist');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        //cy.visit('carbon/user/user-mgt.jsp');
        //cy.deleteUser(publisher);
    })
});