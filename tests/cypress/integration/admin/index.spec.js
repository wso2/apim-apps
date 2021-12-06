import Utils from "@support/utils";

describe("Basic login to carbon console", () => {
    beforeEach(function () {
        const username = 'admin'
        const password = 'admin'
        // login before each test
        cy.loginToDevportal(username, password)
    })

    it.skip("Get endpoint details from wellknownUrl", () => {
        cy.visit(`${Utils.getAppOrigin()}/admin/dashboard`);
        cy.visit(`${Utils.getAppOrigin()}/admin/settings/key-managers`);
        cy.get('.Navigator-itemActiveItem-33 .MuiTypography-root').click();
        cy.visit(`${Utils.getAppOrigin()}/admin/settings/key-managers/create`);
        cy.get('#name').type('SampleExternalKM');
        cy.get('#display-name').click();
        cy.get('#display-name').type('Sample External KM');
        cy.get('#description').click();
        cy.get('#description').type('This is a sample external key manager');
        cy.get('#keyManager-type').click();
        cy.get('#checkbox-allow-exchange-token').check();
        cy.get('#token-audience').click();
        cy.get('#token-audience').type('https://default.com');
        cy.get('#wellKnownUrl').click();
        cy.get('#wellKnownUrl').type('https://localhost:9444/.well-known-url');
        cy.intercept('POST','https://localhost:9443/api/am/admin/v2/key-managers/discover', {fixture: 'welknownURLData.json'});
        cy.get('#import-button').click();
        cy.get('#issuer').should('have.value','https://localhost:9090/oauth2/default');
        cy.get('#clientRegistrationEndpoint').should('have.value','https://localhost:9090/oauth2/v1/clients');
        cy.get('#introspectionEndpoint').should('have.value','https://localhost:9090/oauth2/default/v1/introspect');
        cy.get('#tokenEndpoint').should('have.value','https://localhost:9090/oauth2/default/v1/token');
        cy.get('#revokeEndpoint').should('have.value','https://localhost:9090/oauth2/default/v1/revoke');
        cy.get('#authorizeEndpoint').should('have.value','https://localhost:9090/oauth2/default/v1/authorize');
        cy.get('#client_id').click();
        cy.get('#client_id').type('sampleClientId');
        cy.get('.MuiInputBase-inputAdornedEnd').click();
        cy.get('.MuiInputBase-inputAdornedEnd').type('sampleClientSecret');
        cy.get('#audience').click();
        cy.get('#audience').type('sampleAudience');
        cy.intercept('POST','https://localhost:9443/api/am/admin/v2/key-managers', {fixture: 'addKeyManager.json'});
        cy.get('#keymanager-add').click();
        cy.visit(`${Utils.getAppOrigin()}/admin/settings/key-managers`);
        cy.intercept('GET','https://localhost:9443/api/am/admin/v2/key-managers', {fixture: 'listKeyManager.json'});
    })
})