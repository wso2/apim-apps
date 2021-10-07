/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *  
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });

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
    })
});