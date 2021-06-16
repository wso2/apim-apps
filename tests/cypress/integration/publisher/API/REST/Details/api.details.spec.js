import Utils from "@support/utils";

describe("API detail pages smoke test", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        cy.loginToPublisher(username, password);
        cy.deploySampleAPI().as('apiData');
    });

    before(function () {
        cy.viewport(1920, 980)
        // Can't do wrap() in before hence moved it to before all and one `it`
    });
    it("Visit each details page", () => {
        cy.get('@apiData').then(apiData => {
            const { uuid } = apiData;
            // cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/overview`);
            cy.get("#itest-overview-api-flow").should('be.visible');
            // Should have 16 link elements
            cy.get('.leftLInk').its('length').should('eq', 16);

            cy.get('.leftLInk').eq(1).click();
            cy.get("#itest-api-details-design-config-head").should('be.visible');

            cy.get('.leftLInk').eq(2).click();
            cy.get("#itest-api-details-bushiness-info-head").should('be.visible');

            cy.get('.leftLInk').eq(3).click();
            cy.get("#itest-api-details-bushiness-plans-head").should('be.visible');


            cy.get('.leftLInk').eq(4).click();
            cy.get("#itest-api-details-documents-head").should('be.visible');

            cy.get('.leftLInk').eq(5).click();
            cy.get("#itest-api-details-comments-head").should('be.visible');

            cy.get('.leftLInk').eq(6).click();
            cy.get("#itest-api-details-runtime-config-head").should('be.visible');

            cy.get('.leftLInk').eq(7).click();
            cy.get("#itest-api-details-resources-head").should('be.visible');

            cy.get('.leftLInk').eq(8).click();
            cy.get("#itest-api-details-api-definition-head").should('be.visible');

            cy.get('.leftLInk').eq(9).click();
            cy.get("#itest-api-details-endpoints-head").should('be.visible');

            cy.get('.leftLInk').eq(10).click();
            cy.get("#itest-api-details-scopes-onboarding-head").should('be.visible');

            cy.get('.leftLInk').eq(11).click();
            cy.get("#itest-api-details-api-properties-head").should('be.visible');

            cy.get('.leftLInk').eq(12).click();
            cy.get("#itest-api-details-api-monetization-head").should('be.visible');

            cy.get('.leftLInk').eq(13).click();
            cy.get("#itest-api-details-deployments-head").should('be.visible');

            cy.get('.leftLInk').eq(14).click();
            cy.get("#itest-api-details-try-out-head").should('be.visible');

            cy.get('.leftLInk').eq(15).click();
            cy.get("#itest-api-details-lifecycle-head").should('be.visible');
        });


    })


})