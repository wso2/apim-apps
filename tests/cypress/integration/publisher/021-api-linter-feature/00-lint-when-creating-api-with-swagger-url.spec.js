/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Create api with swagger file super tenant", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    
    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    });

    it("Import API from swagger url", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // select the option from the menu item
        cy.get('#itest-rest-api-create-menu').click();
        cy.get('#itest-id-landing-upload-oas').click();
        cy.get('#open-api-url-select-radio').click();

        // provide the swagger url
        cy.get('[data-testid="swagger-url-endpoint"]').type('https://petstore3.swagger.io/api/v3/openapi.json');
        // go to the next step
        cy.get('#url-validated', { timeout: 30000 });
        
        // check linter results
        cy.get('[data-testid="itest-id-linter-results"]').should('be.visible');
        
    });

    after(function () {
        cy.logoutFromPublisher();
        // delete user
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
})