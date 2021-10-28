
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add Authorization Header for the api", () => {
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemenvironments"]').click();
        cy.get('[data-testid="environments-checkbox-Production and Sandbox"]').click();
        cy.get('[data-testid="save-environments-btn"]').click();
        cy.get('[data-testid="save-environments-btn"]').then(function () {
            cy.get('[data-testid="environments-checkbox-Production and Sandbox"] input').should('not.be.checked');
        });

        cy.get('[data-testid="environments-checkbox-Production and Sandbox"]').click();
        cy.get('[data-testid="save-environments-btn"]').click();
        cy.get('[data-testid="save-environments-btn"]').then(function () {
            cy.get('[data-testid="environments-checkbox-Production and Sandbox"] input').should('be.checked');
        });
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});