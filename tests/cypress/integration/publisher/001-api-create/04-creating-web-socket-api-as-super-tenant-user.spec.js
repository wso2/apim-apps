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

describe("Create websocket api - super tenant", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const tenantUser = `tenant${Math.floor(Date.now() / 1000)}`

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.reload();
        cy.carbonLogout();
    })

    const websocketApiCreate = () => {
        const random_number = Math.floor(Date.now() / 1000);
        const randomName = `sample_api_${random_number}`;
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // select the option from the menu item
        cy.get('#itest-streaming-api-create-menu').click();
        cy.get('#itest-id-create-streaming-api-ws').click();

        // Filling the form
        cy.get('#itest-id-apiname-input').type(randomName);
        cy.get('#itest-id-apicontext-input').click();
        cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
        cy.get('#itest-id-apiversion-input').click();
        cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
        cy.get('#itest-id-apiendpoint-input').click();
        cy.get('#itest-id-apiendpoint-input').type('wss://www.example.com/socketserver');
        // Saving the form
        cy.get('[data-testid="itest-create-streaming-api-button"]').click();

        //Checking the version in the overview
        cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
        cy.get('#itest-api-name-version').contains(`v${random_number}`);

        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click({force: true});
        cy.get(`#itest-id-deleteconf`).click();
    }
    it("Create websocket API from url", () => {
        cy.loginToPublisher(publisher, password);
        websocketApiCreate();
    });

    it("Create websocket API from url - tenant user", () => {
        const tenant = 'wso2.com';
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewTenantUser(tenantUser);
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        websocketApiCreate();
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(tenantUser);
        cy.carbonLogout();
    });

    after(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
})