
describe("Select gateway environments", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    });

    it.only("Select gateway environments", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('[data-testid="left-menu-itemenvironments"]').click();
        cy.get('[data-testid="environments-checkbox-Production and Sandbox"]').click();
        cy.get('[data-testid="save-environments-btn"]').click();
        cy.get('[data-testid="save-environments-btn"]').then(function () {
            cy.get('[data-testid="environments-checkbox-Production and Sandbox"] input').should('not.be.checked');
        });

        cy.get('[data-testid="environments-checkbox-Production and Sandbox"]').click();
        cy.get('[data-testid="save-environments-btn"]').click();
        cy.get('[data-testid="save-environments-btn"]').then(function () {
            cy.get('[data-testid="environments-checkbox-Production and Sandbox"] input').should('be.checked');
        });
    });

    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});