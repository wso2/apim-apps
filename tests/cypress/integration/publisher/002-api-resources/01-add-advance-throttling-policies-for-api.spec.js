
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add Authorization Header for the api", () => {
        cy.createAPIByRestAPIDesign();
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
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});