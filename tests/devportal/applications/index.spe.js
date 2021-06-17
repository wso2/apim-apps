import Utils from "@support/utils";

describe("Developer portal smoke tests", () => {
    const username = 'admin'
    const password = 'admin'
    const appName = 'sample_app_4'
    const numberOfApps = 1;
    beforeEach(function () {
        // login before each test
        cy.loginToDevportal(username, password)
    })
    it.skip("Create an application", () => {
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications`);
        cy.get('#itest-link-to-applications').click();
        cy.get('#itest-application-create-link').click();
        cy.get('#application-name').type(appName);
        cy.get('#itest-application-create-save').click();
        cy.get('#itest-info-bar-application-name').contains(appName);
    })

    it(`Should create ${numberOfApps} applications`, () => {
        for (let currentApp = 0; currentApp < numberOfApps; currentApp++) {
            const currentAppName = `sample_app_${currentApp + 1}`;
            cy.get('#itest-link-to-applications').click();
            cy.get('#itest-application-create-link').click();
            cy.get('#application-name').type(currentAppName);
            cy.get('#itest-application-create-save').click();
            cy.get('#itest-info-bar-application-name').contains(currentAppName);
        }
    })

    it.skip("Should delete all apps", () => {
        let maxApps = 50;
        while (maxApps > 0) {
            cy.visit(`${Utils.getAppOrigin()}/devportal/applications`);
            cy.get('#itest-application-list-table .itest-application-delete-button').first().click();
            cy.get('#itest-confirm-application-delete').click();
            maxApps -= 1;
        }
    })
})