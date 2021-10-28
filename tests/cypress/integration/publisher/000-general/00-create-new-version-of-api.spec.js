
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Create a new version of API", () => {
        const version = '2.0.0';
        cy.createAPIByRestAPIDesign();

        cy.get('[data-testid="create-new-version-btn"]').click();
        cy.get('[data-testid="new-version-textbox"] input').type(version);
        cy.get('[data-testid="new-version-save-btn"]').click();

        // // Validate

    cy.get('[data-testid="api-name-version-title"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="api-name-version-title"]').contains(`${version}`);
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});