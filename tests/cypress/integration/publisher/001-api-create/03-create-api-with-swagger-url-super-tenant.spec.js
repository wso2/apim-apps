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

describe("Create api with swagger file super tenant", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const tenantUser = `tenant${Math.floor(Date.now() / 1000)}`;
    const tenant = 'wso2.com';
    

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.addNewTenantUser(tenantUser);
        cy.reload();
        cy.carbonLogout();
    })
    const openApi2Create = () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // select the option from the menu item
        cy.get('#itest-rest-api-create-menu').click();
        cy.get('#itest-id-landing-upload-oas').click();
        cy.get('#open-api-url-select-radio').click();

        // provide the swagger url
        cy.get('[data-testid="swagger-url-endpoint"]').type('https://petstore.swagger.io/v2/swagger.json');
        // go to the next step
        cy.get('#url-validated', { timeout: 30000 });
        cy.get('#open-api-create-next-btn').click();
        cy.get('#itest-id-apiversion-input', { timeout: 30000 });
        cy.document().then((doc) => {
            const version = doc.querySelector('#itest-id-apiversion-input').value;
            cy.get('#itest-id-apiversion-input').click();
            cy.get('#itest-id-apiendpoint-input').clear();
            cy.get('#itest-id-apiendpoint-input').type('https://petstore.swagger.io');

            // finish the wizard
            cy.get('#open-api-create-btn').click();

            // validate
            cy.get('#itest-api-name-version', { timeout: 30000 }).contains(version);

            // Test is done. Now delete the api
            cy.get(`#itest-id-deleteapi-icon-button`).click();
            cy.get(`#itest-id-deleteconf`).click();
            cy.logoutFromPublisher();
        });
    }

    const openApi3Create = () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // select the option from the menu item
        cy.get('#itest-rest-api-create-menu').click();
        cy.get('#itest-id-landing-upload-oas').click();
        cy.get('#open-api-url-select-radio').click();

        // upload the swagger
        cy.get('[data-testid="swagger-url-endpoint"]').type('https://petstore3.swagger.io/api/v3/openapi.json');
        // go to the next step
        cy.get('#url-validated', { timeout: 30000 });
        cy.get('#open-api-create-next-btn').click();

        cy.get('#itest-id-apiversion-input', { timeout: 30000 });
        cy.document().then((doc) => {
            cy.get('#itest-id-apicontext-input').type('petstore3');
            cy.get('#itest-id-apiversion-input').click();
            const version = doc.querySelector('#itest-id-apiversion-input').value;
            cy.get('#itest-id-apiendpoint-input').clear();
            cy.get('#itest-id-apiendpoint-input').type('https://petstore3.swagger.io/api/v3');

            // finish the wizard
            cy.get('#open-api-create-btn').click();

            // validate
            cy.get('#itest-api-name-version', { timeout: 30000 });
            cy.get('#itest-api-name-version').contains(version);

            // Test is done. Now delete the api
            cy.get(`#itest-id-deleteapi-icon-button`).click();
            cy.get(`#itest-id-deleteconf`).click();
            cy.logoutFromPublisher();
        });
    }
    it("Create API from swagger from file openapi 2", () => {
        cy.loginToPublisher(publisher, password);
        openApi2Create();
    });

    it("Create API from swagger from file openapi 3", () => {
        cy.loginToPublisher(publisher, password);
        openApi3Create();
    });

    it("Create API from swagger from file openapi 2 - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        openApi2Create();
    });

    it("Create API from swagger from file openapi 3 - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        openApi3Create();
    });

    after(function () {
        // delete tenant user
        cy.carbonLogin(`admin@${tenant}`, 'admin');
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(tenantUser);
        cy.carbonLogout();

        // delete other user
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
})