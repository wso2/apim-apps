import Utils from "@support/utils";

describe("Basic login to carbon console", () => {
    const username = 'admin'
    const password = 'admin'
    const users = {
        "david": ["Internal/subscriber"],
        "paul": ["Internal/publisher"],
        "carl": ["Internal/creator"],
        "adam": ["admin"],
        "devdas": ["Internal/devops"]
    }
    it("How show no apis message", () => {
        cy.visit(`${Utils.getAppOrigin()}/devportal`);
        cy.url().should('contains', `${Utils.getAppOrigin()}/devportal/apis`);
        cy.get("#itest-no-apis").should('be.visible') ;
    })
})