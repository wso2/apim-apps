
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

        // Redeploy
        cy.get('button[data-testid="Redeploy"]').then(() => {
            cy.get('button[data-testid="Redeploy"]').click();
        });
        cy.get('button[data-testid="Demote to Created"]').should('exist');


        // Demote to created
        cy.get('button[data-testid="Demote to Created"]').click();
        cy.get('button[data-testid="Publish"]').then(() => {
            cy.get('button[data-testid="Publish"]').click();
        });
        cy.get('button[data-testid="Demote to Created"]').should('exist');


        // Block
        cy.get('button[data-testid="Block"]').then(() => {
            cy.get('button[data-testid="Block"]').click();
        });
        cy.get('button[data-testid="Re-Publish"]').should('exist');

        // Re-Publish
        cy.get('button[data-testid="Re-Publish"]').then(() => {
            cy.get('button[data-testid="Re-Publish"]').click();
        });
        cy.get('button[data-testid="Deprecate"]').should('exist');

        // Deprecate
        cy.get('button[data-testid="Deprecate"]').then(() => {
            cy.get('button[data-testid="Deprecate"]').click();
        });
        cy.get('button[data-testid="Retire"]').should('exist');


        cy.get('button[data-testid="Retire"]').then(() => {
            cy.get('button[data-testid="Retire"]').click();
        });
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});