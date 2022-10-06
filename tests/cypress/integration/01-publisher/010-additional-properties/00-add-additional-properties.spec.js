
describe("Add additional properties", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function () {
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);

    })

    it.only("Add additional properties", () => {
        const prop = 'prop1';
        const propVal = 'prop1-val';

        cy.loginToPublisher(publisher, password);
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('[data-testid="left-menu-itemproperties"]').click();

        // Click the add property button
        cy.get('[data-testid="add-new-property"]').click();

        // Fill the form
        cy.get('#property-name').click().type(prop);
        cy.get('#property-value').click().type(propVal);
        // Add them
        cy.get('[data-testid="properties-add"]').click();

        // Save the api
        cy.get('[data-testid="save-api-properties"]').click();

        // Checking the values exists
        cy.get('[data-testid="save-api-properties"]').then(function () {
            cy.contains(prop).should('exist');
            cy.contains(propVal).should('exist');
        });
    });

    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        //cy.visit('carbon/user/user-mgt.jsp');
        //cy.deleteUser(publisher);
    })
});