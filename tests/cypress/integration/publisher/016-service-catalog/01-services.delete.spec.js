import Utils from "@support/utils";

const CARBON_ORIGIN = Utils.getAppOrigin();
describe("Service catalog delete flow", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToPublisher(username, password)
    })

    it("Delete all APIs", () => {
        cy.visit(`${CARBON_ORIGIN}/publisher/service-catalog`);
        cy.get('#itest-services-listing-total')
            .then(
                (countElement) => {
                    let totalServices = parseInt(countElement.text());
                    debugger;
                    while (totalServices  > 0) {
                        cy.get('#itest-service-card-delete').click();
                        cy.get('#itest-service-card-delete-confirm').click();
                        totalServices -= 1;
                    }
                    cy.get('#itest-service-catalog-onboarding').should('be.visible')
                }
            )
    });
})