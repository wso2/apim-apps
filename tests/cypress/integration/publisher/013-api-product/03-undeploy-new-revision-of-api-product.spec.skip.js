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

describe("Mock the api response and test it", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const productName = Utils.generateName();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Mock the api response and test it", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/openapi`, { timeout: 30000 });
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

            // finish the wizard
            cy.get('#open-api-create-btn').click();

            cy.intercept({
                method: "GET",
                url: `**/apis/**`,
                times: 1,
              }).as('apiGet');
            cy.wait('@apiGet', {timeout: 30000}).then((res) => {
                
                //Get the api id
                const uuid = res.response.body.id;

                // validate
                cy.get('#itest-api-name-version', { timeout: 30000 });
                cy.get('#itest-api-name-version').contains(version);
                
                // Go to api product create page
                cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiname-input').click();

                cy.get('#api-product-next-btn').click();

                // Wait until the api is saved
                cy.get('#resource-wrapper', { timeout: 30000 });
                cy.get('#resource-wrapper').click();

                cy.intercept("POST", `**/api-products`).as('apiProductsGet');

                // add all resources
                cy.get('#add-all-resources-btn').click();
                cy.get('#create-api-product-btn').scrollIntoView().dblclick();

                cy.wait('@apiProductsGet', {timeout: 30000}).then((res) => {

                    cy.get('#itest-api-name-version', { timeout: 30000 });
                    cy.get('#itest-api-name-version').contains(productName);

                    // Going to deployments page
                    cy.get('#left-menu-itemdeployments').click();

                    // Deploying
                    cy.get('#deploy-btn').click({"force":true});
                    cy.get('#undeploy-btn').should('exist');
                    cy.get('#undeploy-btn').click();
                    cy.get('#revision-selector').should('exist');

                    //Get the api product id
                    const uuidProduct = res.response.body.id;

                    cy.log(uuid, uuidProduct);

                    // Deleting the api and api product
                    cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/${uuidProduct}/overview`);
                    cy.get('#itest-api-name-version', { timeout: 30000 });
                    cy.get(`#itest-id-deleteapi-icon-button`).click({force: true});
                    cy.get(`#itest-id-deleteconf`).click();

                    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/overview`);
                    cy.get('#itest-api-name-version', { timeout: 30000 });
                    cy.get(`#itest-id-deleteapi-icon-button`).click({force: true});
                    cy.get(`#itest-id-deleteconf`).click();
                })
            });    
        });
    });
})