import Utils from "@support/utils";

describe("API Delete flow", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToPublisher(username, password)
    })

    it("Delete all APIs", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        cy.intercept('DELETE', '/api/am/publisher/v3/apis/*').as('deleteAPI');
        cy.get('#itest-apis-listing-total')
            .then(
                (countElement) => {
                    let totalAPIs = parseInt(countElement.text());
                    while (totalAPIs > 0) {
                        cy.get('#itest-id-deleteapi-icon-button').click();
                        cy.get('#itest-id-deleteconf').click();
                        // Assert status from cy.intercept() before proceeding
                        cy.wait('@deleteAPI').its('response.statusCode').should('eq', 200)
                        totalAPIs -= 1;
                    }
                    cy.get('#itest-apis-welcome-msg').should('be.visible')
                }
            )
    });
})
 // cy.intercept('/api/am/publisher/v3/apis', (req) => {
        //     req.reply((res) => {
        //         const { total: totalAPIs } = res.body.pagination;
        //     })
        // })