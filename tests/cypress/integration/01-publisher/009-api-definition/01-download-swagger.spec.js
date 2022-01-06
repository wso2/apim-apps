
const YAML = require('yamljs')

describe("Download swagger", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Download swagger", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('[data-testid="left-menu-itemAPIdefinition"]').click();
        cy.get('.lines-content.monaco-editor-background div.view-lines div.view-line', {timeout: 30000});
        cy.get('[data-testid="download-definition-btn"] > span > svg', {timeout: 30000});
        cy.get('[data-testid="download-definition-btn"] > span > svg').click();

        // Downloading swagger
        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/swagger.yaml`;
        cy.readFile(downloadedFilename).then((str) => {
            // TODO. The content is there when we test the same from the UI
            // But somehow the content coming as null here. Need to validate the content here.
            const english = YAML.parse(str)
          })
    });

    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});