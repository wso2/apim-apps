import Utils from "@support/utils";

describe("ApplicationCreate flow", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
    cy.loginToDevportal(username, password)
    })

    it("Login to devportal", () => {
        cy.loginToDevportal(username, password)
    })

    it("Create application", () => {
        cy.visit(`/devportal/apis`);
        cy.get('#application-add').click();
        cy.get('#application-name').type('NewApplicationForUITesting');
        cy.get('#application-description').click();
        cy.get('#application-description').type('Desciption');
        cy.get('#itest-application-create-save').click();    
    })
})