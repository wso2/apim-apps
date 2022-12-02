/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

import Utils from "@support/utils";

describe("Create GraphQl API from file", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    beforeEach(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it("Create GraphQl API from file", () => {
        const random_number = Math.floor(Date.now() / 1000);
        const randomName = `sample_api_${random_number}`;
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // select the option from the menu item
        cy.get('#itest-graphql-api-create-menu').click();
        cy.get('#itest-id-create-graphql-api').click();

        // upload the graphql file
        cy.get('[data-testid="browse-to-upload-btn"]').then(function () {
            const filepath = 'api_artifacts/schema_graphql.graphql'
            cy.get('input[type="file"]').attachFile(filepath)
        });

        // Wait to upload and go to next page
        cy.get('[data-testid="uploaded-list-graphql"]', {timeout: 6000}).should('be.visible');
        cy.get('[data-testid="create-graphql-next-btn"]').click();

        // Filling the form
        cy.get('#itest-id-apiname-input').type(randomName);
        cy.get('#itest-id-apicontext-input').click();
        cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
        cy.get('#itest-id-apiversion-input').click();
        cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
        cy.get('#itest-id-apiendpoint-input').click();
        cy.get('#itest-id-apiendpoint-input').type('https://graphql.api.wso2.com');
        // Saving the form
        cy.get('[data-testid="itest-create-graphql-api-button"]').click();

        //Checking the version in the overview
        cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
        cy.get('#itest-api-name-version').contains(`v${random_number}`);
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click();
        cy.get(`#itest-id-deleteconf`).click();

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
})
