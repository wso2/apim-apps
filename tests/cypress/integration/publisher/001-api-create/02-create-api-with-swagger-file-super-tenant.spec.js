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
    const tenantUser = `tenant${Math.floor(Date.now() / 1000)}`

    const createApiFromSwagger = (username, password) => {
        cy.loginToPublisher(username, password);
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // select the option from the menu item
        cy.get('#itest-rest-api-create-menu').click();
        cy.get('#itest-id-landing-upload-oas').click();
        cy.get('#open-api-file-select-radio').click();

        // upload the swagger
        cy.get('#browse-to-upload-btn').then(function () {
            const filepath = `api_artifacts/swagger_2.0.json`
            cy.get('input[type="file"]').attachFile(filepath)            
        });

        // go to the next step
        cy.get('#open-api-create-next-btn').click();
        cy.get('#itest-id-apiendpoint-input').click();

        // finish the wizard
        cy.get('#open-api-create-btn').click();

        // validate
        cy.get('#itest-api-name-version', { timeout: 30000 }).contains('1.0.5');
    }
    it("Create API from swagger from file - supper admin", () => {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);

        createApiFromSwagger(publisher, password);
        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click();
        cy.get(`#itest-id-deleteconf`).click();

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
        cy.carbonLogout();
    });

    it("Create API from swagger from file - tenant user", () => {
        const tenant = 'wso2.com';
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewTenantUser(tenantUser);
        createApiFromSwagger(`${tenantUser}@${tenant}`, password);
        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click();
        cy.get(`#itest-id-deleteconf`).click();

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(tenantUser);
    });
    
})