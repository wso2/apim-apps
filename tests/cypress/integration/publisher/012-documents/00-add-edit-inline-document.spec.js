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

    it.only("Add Authorization Header for the api", () => {
        const documentName = 'api document';
        const documentSummery = 'api document summery';
        cy.createAPIWithoutEndpoint();
        cy.get('[data-testid="left-menu-itemDocumentation"]').click();
        


        cy.get('[data-testid="add-new-document-btn"]').click();
        cy.get('[data-testid="doc-name-textbox"]').type(documentName);
        cy.get('[data-testid="doc-summery-textbox"]').click();
        cy.get('[data-testid="doc-summery-textbox"]').type(documentSummery);
        cy.get('.MuiButton-contained-1659 > .MuiButton-label-1652').click();
        cy.get('a:nth-child(1) .MuiButton-label-1652').click();
        cy.get('.draftjs-editor').click();
        cy.get('.MuiButton-contained-2282 > .MuiButton-label-2275').click();
        cy.get('td:nth-child(1) .MuiButton-label-2765').click();
        cy.get('.MuiButtonBase-root-2658:nth-child(4) > .MuiButton-label-2765').click();

        

    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});