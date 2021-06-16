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
        cy.get('#itest-rest-api-create-menu').click()
        cy.get('#itest-id-deploy-sample').click()
        cy.get('#itest-api-name-version', { timeout: 10000 }).should('be.visible');
        cy.url().should('contains', '/overview');
        cy.get("#itest-api-name-version").contains('PizzaShackAPI');
    })

    it("Create an API", () => {
        cy.createAnAPI();
    })


    it("Create 2~4 APIs", () => {
        let i = Utils.getRandomRange(2, 4);
        while (i > 0) {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
            cy.get('#itest-create-api-menu-button').click()
            cy.get('#itest-id-landing-rest-create-default').click()
            const random_number = Math.round(Math.random() * 1000);
            const randomName = Utils.generateName();
            const apiName = `${randomName}_api_${random_number}`
            cy.get('#itest-id-apiname-input').type(apiName);
            cy.get('#itest-id-apicontext-input').click();
            cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
            cy.get('#itest-id-apiversion-input').click();
            cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
            cy.get('#itest-id-apiendpoint-input').click();
            cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
            cy.get('#itest-create-default-api-button').click();
            cy.get("#itest-api-name-version").contains(apiName);
            i -= 1;
        }
    });
})