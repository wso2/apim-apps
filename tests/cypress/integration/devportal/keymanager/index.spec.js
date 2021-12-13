import Utils from "@support/utils";

describe("Developer portal smoke tests", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToDevportal(username, password)
    })
    it.only("Create an application", () => {
        cy.intercept("GET", "/api/am/devportal/v2/applications?sortBy=name&sortOrder=asc&limit=10&offset=0",
            {fixture: 'applicationsList.json'}).as('loadApplication');
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications`);
        cy.wait('@loadApplication');
        cy.get('table:nth-of-type(1) a[href]').contains('DefaultApplication').click();
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/productionkeys/oauth`);
        cy.intercept("GET", "/api/am/devportal/v2/key-managers", {fixture:'devportalKeyManagerlisting.json'})
        cy.get('#SampleExternalKM').click();
        cy.get('#exchange-token').click();
        cy.get('#responsive-dialog-title h2').should('contain',
            'Resident Key Manager Consumer Key and Secret Not Available');
        cy.get('#close-btn').click();
        cy.get('#ResidentKeyManager').click();
        cy.wait(10000);
    })
})
