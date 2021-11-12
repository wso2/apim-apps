
describe("do nothing", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add business information", () => {
        const ownerName = 'Raccoon Panda';
        const ownerEmail = 'raccoon@wso2.com';
        const techOwnerName = 'Big Cat';
        const techOwnerEmail = 'bigcat@wso2.com';

        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itembusinessinfo"]').click();
        cy.get('[data-testid="business-owner-name"]').click().type(ownerName);
        cy.get('[data-testid="business-owner-email"]').click().type(ownerEmail);
        cy.get('[data-testid="technical-owner-name"]').click().type(techOwnerName);
        cy.get('[data-testid="technical-owner-email"]').click().type(techOwnerEmail);

        cy.get('[data-testid="business-info-save"]').click();

        cy.get('[data-testid="business-info-save"]').then(function () {
            cy.get('[data-testid="business-owner-name"] input').should('have.value', ownerName);
            cy.get('[data-testid="business-owner-email"] input').should('have.value', ownerEmail);
            cy.get('[data-testid="technical-owner-name"] input').should('have.value', techOwnerName);
            cy.get('[data-testid="technical-owner-email"] input').should('have.value', techOwnerEmail);
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