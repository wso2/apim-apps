import Utils from "@support/utils";

describe("Key generation with PKCE", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
    cy.loginToDevportal(username, password)
    })

    it("Login to devportal", () => {
        cy.loginToDevportal(username, password)
    })

    it("Create application and generate keys with PCKE enabled", () => {
        cy.visit(`/devportal/apis`);
        cy.get('#application-add').click();
        cy.get('#application-name').type('NewAPPPKCE');
        cy.get('#itest-application-create-save').click();
        cy.get('.jss165:nth-child(3) > .MuiTypography-root').click();
        cy.get('#pkceMandatory').click();
        cy.get('.MuiButton-contained > .MuiButton-label').click();
    })

    it("Create application and generate keys with PCKE and pkceSupportPlain enabled", () => {
        cy.visit(`/devportal/apis`);
        cy.get('#application-add').click();
        cy.get('#application-name').type('NewAPPPKCE');
        cy.get('#itest-application-create-save').click();
        cy.get('#oauth2-tokens').click();
        cy.get('#pkceMandatory').click();
        cy.get('#pkceSupportPlain').click();
        cy.get('#bypassClientCredentials').click();
        cy.get('#generate-keys').click();
    })

    it("Create application and generate keys with PCKE and bypassClientCredentials enabled", () => {
        cy.visit(`/devportal/apis`);
        cy.get('#application-add').click();
        cy.get('#application-name').type('NewAPPPKCE');
        cy.get('#itest-application-create-save').click();
        cy.get('#oauth2-tokens').click();
        cy.get('#pkceMandatory').click();
        cy.get('#bypassClientCredentials').click();
        cy.get('#generate-keys').click();
    })

    it("Create application and generate keys with PCKE,  pkceSupportPlain and bypassClientCredentials enabled", () => {
        cy.visit(`/devportal/apis`);
        cy.get('#application-add').click();
        cy.get('#application-name').type('NewAPPPKCE');
        cy.get('#itest-application-create-save').click();
        cy.get('#oauth2-tokens').click();
        cy.get('#pkceMandatory').click();
        cy.get('#pkceSupportPlain').click();
        cy.get('#bypassClientCredentials').click();
        cy.get('#generate-keys').click();
    })
})