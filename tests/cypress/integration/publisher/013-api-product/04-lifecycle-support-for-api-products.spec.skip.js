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

describe("Life cycle support for API Products", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const productName = Utils.generateName();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Life cycle support for API Products", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/openapi`, { timeout: 30000 });
        cy.get('#open-api-file-select-radio').click();


        // upload the swagger
        cy.get('#browse-to-upload-btn').then(function () {
            const filepath = `api_artifacts/pizzashack.json`
            cy.get('input[type="file"]').attachFile(filepath)
        });
        cy.get('#open-api-create-next-btn').click();
        cy.get('#itest-id-apiversion-input', { timeout: 30000 });

        cy.document().then((doc) => {
            cy.get('#itest-id-apicontext-input').clear();
            cy.get('#itest-id-apicontext-input').type('Pizzashack');
            cy.get('#itest-id-apiversion-input').click();
            const version = doc.querySelector('#itest-id-apiversion-input').value;

            // finish the wizard
            cy.get('#open-api-create-btn').click();

            // validate
            cy.get('#itest-api-name-version', { timeout: 30000 });
            cy.get('#itest-api-name-version').contains(version);

            // Get the api id
            cy.location('pathname').then((pathName) => {
                const pathSegments = pathName.split('/');
                const uuid = pathSegments[pathSegments.length - 2];

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

                // add all resources
                cy.get('#add-all-resources-btn').click();
                cy.get('#create-api-product-btn').scrollIntoView().click();
                cy.get('#itest-api-name-version', { timeout: 30000 });
                cy.get('#itest-api-name-version').contains(productName);

                //Get the api product id
                cy.location('pathname').then((pathName) => {
                    const pathSegments = pathName.split('/');
                    const uuidProduct = pathSegments[pathSegments.length - 2];
                    
                    cy.log(uuid, uuidProduct);
                    
                    cy.get('#left-menu-itemdeployments').click();

                    // Deploying
                    cy.get('#deploy-btn',{ timeout: 30000 }).click({force:true});

                    cy.get('#left-menu-itemlifecycle').click();
                    
                    // Publishing api product
                    cy.wait(2000);
                    cy.get('[data-testid="Publish-btn"]').click();
                    // Validate
                    cy.get('button[data-testid="Demote to Created-btn"]').should('exist');

                    //Demote to create
                    cy.get('[data-testid="Demote to Created-btn"]').click();

                    //publish as a prototype
                    cy.get('[data-testid="Deploy as a Prototype-btn"]').click();

                    // Deleting the api and api product
                    cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/${uuidProduct}/overview`);
                    cy.get('#itest-id-deleteapi-icon-button').click();
                    cy.get('#itest-id-deleteconf').click();

                    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/overview`);
                    cy.get('#itest-api-name-version', { timeout: 30000 });
                    cy.get(`#itest-id-deleteapi-icon-button`).click();
                    cy.get(`#itest-id-deleteconf`).click();
                    
                    cy.logoutFromPublisher();
                });   
            });
        });
    });
})