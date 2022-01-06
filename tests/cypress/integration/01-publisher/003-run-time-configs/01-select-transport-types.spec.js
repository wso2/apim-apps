
describe("Runtime configuration", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })


    it.only("Select transport type", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('[data-testid="left-menu-itemRuntimeConfigurations"]').click();
        cy.get('[data-testid="transport-level-security-head"]').click();
        cy.get('[data-testid="http-transport"]').click();
        cy.get('[data-testid="save-runtime-configurations"]').click();
        cy.get('[data-testid="transport-level-security-head"]').click();
        cy.get('[data-testid="http-transport"] input').should('not.be.checked');
    });

    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        // delete publisher
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});