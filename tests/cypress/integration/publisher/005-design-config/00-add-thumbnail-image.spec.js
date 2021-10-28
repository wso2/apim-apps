
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Add Authorization Header for the api", () => {
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemDesignConfigurations"]').click();
        cy.get('[data-testid="edit-api-thumbnail-btn"]').click();
        cy.get('[data-testid="edit-api-thumbnail-upload"]').click();

        // upload the image
        const filepath = 'api_artifacts/api-pic.jpg';
        cy.get('input[type="file"]').attachFile(filepath);

        // Save
        cy.get('[data-testid="edit-api-thumbnail-save-btn"]').click();

        // Validate
        cy.get('[alt="API Thumbnail"]')
            .should('be.visible')
            .and(($img) => {
                // "naturalWidth" and "naturalHeight" are set when the image loads
                expect($img[0].naturalWidth).to.be.greaterThan(0)
            })
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});