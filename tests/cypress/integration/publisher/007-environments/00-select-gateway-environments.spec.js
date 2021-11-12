
describe("do nothing", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    });

    it.only("Add Authorization Header for the api", () => {
        cy.createAPIByRestAPIDesign();
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
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});