
describe("creating document", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Creating inline document", () => {
        const documentName = 'api document';
        const documentSummery = 'api document summery';
        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemDocumentation"]').click();

        cy.get('[data-testid="add-new-document-btn"]').click();
        cy.get('[data-testid="doc-name-textbox"]').type(documentName);
        cy.get('[data-testid="doc-summery-textbox"]').click();
        cy.get('[data-testid="doc-summery-textbox"]').type(documentSummery);
        cy.get('[data-testid="add-document-btn"]').click();
        cy.get('[data-testid="add-content-back-to-listing-btn"]').click();

        // Checking it's existence
        cy.get('table a').contains(documentName).should('be.visible');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});