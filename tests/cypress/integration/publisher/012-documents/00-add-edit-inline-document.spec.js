
describe("creating document", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

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

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});