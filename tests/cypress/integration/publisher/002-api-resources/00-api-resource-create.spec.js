import { after } from "mocha"

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
    const target = '/test';

    let apiId;
    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    })

    // it.only("Add new resource", () => {
    //     cy.createAPIByRestAPIDesign();
    //     // Typing the resource name
    //     const target = '/test';
    //     cy.get('[data-testid="left-menu-itemresources"]').click();
    //     cy.get('#operation-target').type(target);
    //     cy.get('body').click();
    //     cy.get('[data-testid="add-operation-selection-dropdown"]').click();

    //     // Checking all the operations
    //     cy.get('[data-testid="add-operation-get"]').click();
    //     cy.get('[data-testid="add-operation-post"]').click();
    //     cy.get('[data-testid="add-operation-put"]').click();
    //     cy.get('[data-testid="add-operation-patch"]').click();
    //     cy.get('[data-testid="add-operation-delete"]').click();
    //     cy.get('[data-testid="add-operation-head"]').click();

    //     cy.get('body').click();
    //     cy.get('[data-testid="add-operation-button"]').click();
    //     cy.get('[data-testid="resources-save-operations"]').click();

    //     // Validating if the resource exists after saving
    //     cy.get(`[data-testid="operation-${target}-get"]`).should('be.visible');
    //     cy.get(`[data-testid="operation-${target}-post"]`).should('be.visible');
    //     cy.get(`[data-testid="operation-${target}-put"]`).should('be.visible');
    //     cy.get(`[data-testid="operation-${target}-patch"]`).should('be.visible');
    //     cy.get(`[data-testid="operation-${target}-delete"]`).should('be.visible');
    //     cy.get(`[data-testid="operation-${target}-head"]`).should('be.visible');
    // });

    const addApiAndResource = (verb) => {
        cy.createAPIByRestAPIDesign();
        // Typing the resource name
        cy.get('[data-testid="left-menu-itemresources"]').click();
        cy.get('#operation-target').type(target);
        cy.get('body').click();
        cy.get('[data-testid="add-operation-selection-dropdown"]').click();

        // Checking all the operations
        cy.get(`[data-testid="add-operation-${verb}"]`).click();

        cy.get('body').click();
        cy.get('[data-testid="add-operation-button"]').click();
        cy.get('[data-testid="resources-save-operations"]').click();

        // Validating if the resource exists after saving
        cy.get(`[data-testid="operation-${target}-${verb}"]`).should('be.visible');
    }
    // it.only("Add/ delete Query/ path parameters for resources", () => {
    //     const verb = 'get';
    //     const paramType = 'query';
    //     const paramName = 'count';
    //     const paramDataType = 'string';

    //     addApiAndResource(verb);

    //     cy.get(`[data-testid="operation-${target}-${verb}"]`).click();
    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-param-type"]`).click();
    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-${paramType}"]`).click();

    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-param-name"]`).click();
    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-param-name"] input`).type(paramName);

    //     // Clicking the parameter data type drop down
    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-param-data-type"]`).click();
    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-${paramDataType}"]`).click();
    //     cy.get(`[data-testid="add-parameter-${target}-${verb}-add-btn"]`).click();

    //     // Save the resources
    //     cy.get('[data-testid="resources-save-operations"]').click();

    //     // Validating if the param exists after saving
    //     cy.get(`[data-testid="param-list-${paramType}-${paramName}-${paramDataType}"]`).should('be.visible');


    // });

    // it.only("Add advance throttling policies per resource", () => {
    //     const verb = 'get';
    //     const rateLimitName = '50KPerMin';
    //     addApiAndResource(verb);

    //     // Click the operation level radio button on the top
    //     cy.get('[data-testid="api-rate-limiting-operation-level"]').click();

    //     // expand the section
    //     cy.get(`[data-testid="operation-${target}-${verb}"]`).click();

    //     cy.get(`[data-testid="${target}-${verb}-operation-rate-limiting-policy"]`).click();
    //     cy.get(`[data-testid="${target}-${verb}-operation-rate-limiting-policy-${rateLimitName}"]`).click();

    //     // Save the resources
    //     cy.get('[data-testid="resources-save-operations"]').click();

    //     cy.get(`[data-testid="${target}-${verb}-operation-rate-limiting-policy"] .selected`)
    //         .contains(rateLimitName)
    //         .should('be.visible');


    // });

    it.only("Add and assign scopes for API resources", () => {
        const random_number = Math.floor(Date.now() / 1000);
        const verb = 'post';
        const scopeName = 'test' + random_number;
        const scopeDescription = 'test scope description';
        const role = 'internal/publisher';
        addApiAndResource(verb);

        // Go to local scope page
        cy.get('[data-testid="left-menu-itemLocalScopes"]').click();

        // Create a local scope
        cy.get('[data-testid="create-scope-start-btn"]').click();
        cy.get('[data-testid="scope-name"]').click();
        cy.get('[data-testid="scope-name"]').type(scopeName);

        cy.get('[data-testid="scope-description"]').click();
        cy.get('[data-testid="scope-description"]').type(scopeDescription);

        cy.get('[data-testid="scope-roles-input"]').click();
        cy.get('[data-testid="scope-roles-input"]').type(`${role}{enter}`);

        cy.get('[data-testid="scope-save-btn"]').click();
        cy.contains('[data-testid="scope-list-table"]', scopeName).should('be.visible');

        // Go to resources page
        cy.get('[data-testid="left-menu-itemresources"]').click();

        // Open the operation sub section
        cy.get(`[data-testid="operation-${target}-${verb}"]`).click();
        cy.get(`[data-testid="${target}-${verb}-operation-scope-select"]`).click();
        cy.get(`[data-testid="${target}-${verb}-operation-scope-${scopeName}"]`).click();
        cy.get(`[data-testid="${target}-${verb}-operation-scope-${scopeName}"]`).type('{esc}');
        // // Save the resources
        cy.get('[data-testid="resources-save-operations"]').click();

        cy.get(`[data-testid="${target}-${verb}-operation-scope-select"] .selected`)
            .contains(scopeName)
            .should('be.visible');

    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
})