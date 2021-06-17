import Utils from "@support/utils";

describe("API Create flow", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToPublisher(username, password)
    })
    it("Deploy sample API", () => {
        cy.viewport(1920, 980)
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-deploy-sample-api').click();
        
    })
})