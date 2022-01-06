
describe("Add advanced throttling policies", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add Authorization Header for the api", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('[data-testid="left-menu-itemresources"]').click();

        cy.get('[data-testid="api-rate-limiting-api-level"]').click();
        cy.get('#operation_throttling_policy').click();
        cy.get('[data-testid="api-rate-limiting-api-level-10KPerMin"]').then(() => {
            cy.get('[data-testid="api-rate-limiting-api-level-10KPerMin"]').click();
        })
        cy.get('[data-testid="resources-save-operations"]').click();

        cy.get('[data-testid="resources-save-operations"]').then(function () {
            cy.get('#operation_throttling_policy').contains('10KPerMin').should('be.visible');
        });
    });

    after(function () {
        // Test is done. Now delete the api
        cy.deleteApi(apiName, apiVersion);

        // delete publisher
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});