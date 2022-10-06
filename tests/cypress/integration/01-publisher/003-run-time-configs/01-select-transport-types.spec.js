
describe("Runtime configuration", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function(){
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })


    it.only("Select transport type", () => {
        cy.loginToPublisher(publisher, password);
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.wait(2000);
        cy.get('[data-testid="left-menu-itemRuntimeConfigurations"]').click();
        cy.wait(2000);
        cy.get('[data-testid="transport-level-security-head"]').click();
        cy.wait(2000);
        cy.get('[data-testid="http-transport"]').click();
        cy.wait(2000);
        cy.get('[data-testid="save-runtime-configurations"]').click();
        cy.wait(2000);
        cy.get('[data-testid="transport-level-security-head"]').click();
        cy.wait(2000);
        cy.get('[data-testid="http-transport"] input').should('not.be.checked');
    });

    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        // delete publisher
        //cy.visit('carbon/user/user-mgt.jsp');
        //cy.deleteUser(publisher);
    })
});