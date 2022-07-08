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
/*
TODO
The product is broken. we need to fix the product. This test case is ignored from cypress.json
*/
import Utils from "@support/utils";

describe("Mock the api response and test it", () => {
    const { publisher, password, } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    /* 
        TODO
    */
    it("Mock the api response and test it", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/openapi`);
        cy.get('#open-api-file-select-radio').click();

        // upload the swagger
        cy.get('#browse-to-upload-btn').then(function () {
            const filepath = `api_artifacts/petstore-v3.json`
            cy.get('input[type="file"]').attachFile(filepath)
        });

        cy.get('#open-api-create-next-btn').click();

        cy.get('#itest-id-apiversion-input', { timeout: 30000 });
        cy.document().then((doc) => {
            cy.get('#itest-id-apicontext-input').clear();
            cy.get('#itest-id-apicontext-input').type('petstore3');
            cy.get('#itest-id-apiversion-input').click();
            const version = doc.querySelector('#itest-id-apiversion-input').value;


            cy.intercept('**/apis/**').as('apiGet');
            // finish the wizard
            cy.get('#open-api-create-btn').click();
            cy.wait('@apiGet', { timeout: 30000 }).then((data) => {
                // validate
                cy.get('#itest-api-name-version', { timeout: 30000 });
                cy.get('#itest-api-name-version').contains(version);

                // Go to endpoints page
                cy.get('#itest-api-details-api-config-acc').click();
                cy.get('#left-menu-itemendpoints').click();

                // Change the endpoint type to Prototype Implementation
                cy.get('#INLINE').click();

                // Confirm it
                cy.get('#change-endpoint-type-btn').click();
                cy.get('#endpoint-save-btn').click();
                cy.get('#endpoint-save-btn').then(() => {
                    cy.get('#itest-api-details-portal-config-acc').click();
                    cy.get('#left-menu-itemsubscriptions').click();

                    cy.get('span').contains('Silver : Allows 2000 requests per minute').click();
                    cy.get('#subscriptions-save-btn').click();

                    // Going to deployments page
                    cy.get('#itest-api-details-portal-config-acc').click();
                    cy.get('#left-menu-itemdeployments').click();

                    // Deploying
                    cy.wait(1000);
                    cy.get('#deploy-btn').click();
                    cy.get('#undeploy-btn').should('exist');

                    cy.get('#itest-api-details-portal-config-acc').click();
                    cy.get('#left-menu-itemTestConsole').click();

                    cy.get('#operations-pet-getPetById').click();
                    cy.get('#operations-pet-getPetById .try-out__btn').click();
                    cy.get('#operations-pet-getPetById [placeholder="petId - ID of pet to return"]').type('1');
                    cy.get('#operations-pet-getPetById button.execute').click();
                    cy.get('#operations-pet-getPetById  td.response-col_status').contains('200').should('exist');

                    // Delete api
                    const apiId = data.response.body.id;
                    Utils.deleteAPI(apiId);
                })
            })
        });
    });
})