
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    let apiId;
    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add Authorization Header for the api", () => {
        const customAuthHeader = '-custom';
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemRuntimeConfigurations"]').click();
        cy.get('[data-testid="schema-validation-switch"]').click();
        cy.get('[data-testid="schema-validation-yes-btn"]').click();
        cy.get('[data-testid="save-runtime-configurations"]').click();
        cy.get('[data-testid="schema-validation-switch"]').should('have.class', 'Mui-checked');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});