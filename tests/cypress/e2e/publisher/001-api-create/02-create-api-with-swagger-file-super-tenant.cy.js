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

    const createApiFromSwagger = (usernameLocal, passwordLocal) => {

        cy.loginToPublisher(usernameLocal, passwordLocal);
        // select the option from the menu item
        cy.visit(`/publisher/apis/create/openapi`);
        cy.wait(5000)
        cy.get('#open-api-file-select-radio').click();
        // upload the swagger

        cy.get('#browse-to-upload-btn').then(function () {

            cy.intercept('POST', '**/apis/validate-openapi').as('validateOpenApi');
            cy.intercept('GET', '**/linter-custom-rules?apiType=HTTP').as('lintRules');
            const filepath = `api_artifacts/swagger_2.0.json`

            cy.get('input[type="file"]').attachFile(filepath);

            cy.wait(['@validateOpenApi', '@lintRules'], { timeout: 30000 }).then(() => {
                // go to the next step
                cy.get('#open-api-create-next-btn').click();

                cy.get('#itest-id-apiendpoint-input')
                    .clear()
                    .type('https://petstore.swagger.io/v2');

                cy.intercept('**/apis/**').as('apiGet');
                // finish the wizard
                cy.get('#open-api-create-btn').click();
                cy.wait('@apiGet', { timeout: 30000 }).then((data) => {
                    // validate
                    cy.get('#itest-api-name-version', { timeout: 30000 }).contains('1.0.5');
                    const apiId = data.response.body.id;
                    Utils.deleteAPI(apiId);
                })
            })
        });
    }
    it("Create API from swagger from file - supper admin", () => {
        createApiFromSwagger(publisher, password);
    });

    it("Create API from swagger from file - tenant user", () => {
        createApiFromSwagger(`${tenantUser}@${tenant}`, password);
    });

})