import Utils from "@support/utils";

describe("Deploy sample api", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Deploy sample api", () => {
        cy.deploySampleAPI();
    });

    after(function () {
        // Test is done. Now delete the api
        cy.deleteApi('PizzaShackAPI', '1.0.0');

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});