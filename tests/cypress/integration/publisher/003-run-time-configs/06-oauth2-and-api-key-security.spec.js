
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add Authorization Header for the api", () => {
        const customAuthHeader = '-custom';
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemRuntimeConfigurations"]').click();
        cy.get('[data-testid="application-level-security-head"]').click();
        // Checking the two options
        cy.get('[data-testid="api-security-basic-auth-checkbox"]').click();
        cy.get('[data-testid="api-security-api-key-checkbox"]').click();

        cy.get('[data-testid="save-runtime-configurations"]').click();
        cy.get('[data-testid="save-runtime-configurations"]').then(() => {
            cy.get('[data-testid="application-level-security-head"]').click();
            cy.get('[data-testid="api-security-basic-auth-checkbox"] input').should('be.checked');
            cy.get('[data-testid="api-security-api-key-checkbox"] input').should('be.checked');
        })
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});