
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add Authorization Header for the api", () => {
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemsubscriptions"]').click();
        cy.get('[data-testid="policy-checkbox-unlimited"]').click();
        cy.get('[data-testid="policy-checkbox-silver"]').click();
        cy.get('[data-testid="subscriptions-save-btn"]').click();

        // Going to lifecycle page
        cy.get('[data-testid="left-menu-itemlifecycle"]').click();

        // Publishing
        cy.get('button[data-testid="Publish"]').click();

        // Validate
        cy.get('button[data-testid="Demote to Created"]').should('exist');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});