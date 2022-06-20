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

    const { publisher, password, tenantUser, tenant, } = Utils.getUserInfo();

    const openApiCreate = (url) => {
        // select the option from the menu item
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/openapi`);

        // upload the swagger
        cy.get('[data-testid="swagger-url-endpoint"]').type(url);
        // go to the next step
        cy.get('#url-validated', { timeout: 30000 });
        cy.get('#open-api-create-next-btn').click();

        cy.get('#itest-id-apiversion-input', { timeout: 30000 });
        cy.document().then((doc) => {
            cy.get('#itest-id-apicontext-input').type('petstore3');
            cy.get('#itest-id-apiversion-input').click();
            const version = doc.querySelector('#itest-id-apiversion-input').value;
            cy.get('#itest-id-apiendpoint-input').clear();
            cy.get('#itest-id-apiendpoint-input').type(url);

            cy.intercept('**/apis/**').as('apiGet');

            // finish the wizard
            cy.get('#open-api-create-btn').click();

            cy.wait('@apiGet', { timeout: 30000 }).then((data) => {
                // validate
                cy.get('#itest-api-name-version', { timeout: 30000 });
                cy.get('#itest-api-name-version').contains(version);

                // Test is done. Now delete the api
                const apiId = data.response.body.id;
                Utils.deleteAPI(apiId);
            });
        });
    }
    it("Create API from swagger from file openapi 2", () => {
        cy.loginToPublisher(publisher, password);
        openApiCreate('https://petstore.swagger.io/v2/swagger.json');
    });

    it("Create API from swagger from file openapi 3", () => {
        cy.loginToPublisher(publisher, password);
        openApiCreate('https://petstore3.swagger.io/api/v3/openapi.json');
    });

    it("Create API from swagger from file openapi 2 - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        openApiCreate('https://petstore.swagger.io/v2/swagger.json');
    });

    it("Create API from swagger from file openapi 3 - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        openApiCreate('https://petstore3.swagger.io/api/v3/openapi.json');
    });

})