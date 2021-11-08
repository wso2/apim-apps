
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

    it.only("Download swagger", () => {
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemAPIdefinition"]').click();
        cy.get('[data-testid="download-definition-btn"]').trigger('click');

        // Downloading swagger
        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/swagger.yaml`;

        cy.readFile(downloadedFilename, 'binary', { timeout: 35000 })
            .should(buffer => expect(buffer.length).to.be.gt(100));
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});