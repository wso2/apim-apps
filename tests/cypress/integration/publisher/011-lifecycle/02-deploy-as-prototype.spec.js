/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

describe("Deploy as prototype", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Deploy as prototype", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        cy.createAPIWithoutEndpoint();
        cy.get('#itest-api-details-api-config-acc').click();
        cy.get('#left-menu-itemendpoints').click();
        cy.wait(500);
        cy.get('[data-testid="http/restendpoint-add-btn"]').click();
        cy.get('[data-testid="prototype_endpoint-start"]').click();

        cy.get('[data-testid="primaryEndpoint-endpoint-text-field"]').then(() => {
            cy.get('[data-testid="primaryEndpoint-endpoint-text-field"] input').focus().type(endpoint);   
        });

        // Save
        cy.get('[data-testid="endpoint-save-btn"]').then(() => {
            cy.get('[data-testid="endpoint-save-btn"]').click();   
        });

        cy.get('[data-testid="left-menu-itemlifecycle"]').click();
        cy.wait(2000);
        cy.get('button[data-testid="Deploy as a Prototype"]').then(() => {
            cy.get('button[data-testid="Deploy as a Prototype"]').click();
        });
        cy.get('button[data-testid="Demote to Created"]').should('exist');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
});
