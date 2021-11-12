
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

    it.only("Add additional properties", () => {
        const prop = 'prop1';
        const propVal = 'prop1-val';

        cy.createAPIByRestAPIDesign();
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
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});