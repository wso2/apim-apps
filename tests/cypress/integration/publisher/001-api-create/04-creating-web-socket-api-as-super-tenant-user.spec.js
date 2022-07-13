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
    const { publisher, password, tenantUser, tenant, } = Utils.getUserInfo();
    
    const websocketApiCreate = () => {
        const random_number = Math.floor(Date.now() / 1000);
        const randomName = Utils.generateName();
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/streamingapi/ws`);

        // Filling the form
        cy.get('#itest-id-apiname-input').type(randomName);
        cy.get('#itest-id-apicontext-input').click();
        cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
        cy.get('#itest-id-apiversion-input').click();
        cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
        cy.get('#itest-id-apiendpoint-input').click();
        cy.get('#itest-id-apiendpoint-input').type('wss://www.example.com/socketserver');
        // Saving the form


        cy.intercept('**/apis/**').as('apiGet');
        // finish the wizard
        cy.get('[data-testid="itest-create-streaming-api-button"]').click();
        cy.wait('@apiGet', { timeout: 30000 }).then((data) => {
            // validate
            //Checking the version in the overview
            cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
            cy.get('#itest-api-name-version').contains(`v${random_number}`);

            // Test is done. Now delete the api
            const apiId = data.response.body.id;
            Utils.deleteAPI(apiId);
        });


    }
    it("Create websocket API from url", () => {
        cy.loginToPublisher(publisher, password);
        websocketApiCreate();
    });

    it("Create websocket API from url - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        websocketApiCreate();
    });

})