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
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });
    const { publisher, password, } = Utils.getUserInfo();
    const productName = Utils.generateName();
    const apiName = Utils.generateName();
    let testApiID;
    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Mock the api response and test it", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        cy.visit(`/publisher/apis/create/openapi`, {timeout: Cypress.config().largeTimeout});
        cy.get('#open-api-file-select-radio').click();

        // upload the swagger
        cy.get('#browse-to-upload-btn').then(function () {
            const filepath = `api_artifacts/petstore-v3.json`
            cy.get('input[type="file"]').attachFile(filepath)
        });

        cy.get('#open-api-create-next-btn').click();

        cy.get('#itest-id-apiversion-input', {timeout: Cypress.config().largeTimeout});
        cy.document().then((doc) => {
            cy.get('#itest-id-apiname-input').clear().type(apiName);
            cy.get('#itest-id-apicontext-input').clear();
            cy.get('#itest-id-apicontext-input').type(apiName);
            cy.get('#itest-id-apiversion-input').click();
            const version = doc.querySelector('#itest-id-apiversion-input').value;
            // finish the wizard
            cy.get('#open-api-create-btn').should('not.have.class', 'Mui-disabled').click({force:true});

            cy.url().should('contains', 'overview').then(url => {
                testApiID = /apis\/(.*?)\/overview/.exec(url)[1];
                cy.log("API ID", testApiID);
                // validate
                cy.get('#itest-api-name-version', {timeout: Cypress.config().largeTimeout});
                cy.get('#itest-api-name-version').contains(version);

                //Get the api id;

                // Go to api product create page
                cy.visit(`/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiname-input').click();
                cy.get('body').click(0,0);

                cy.intercept('**/swagger').as('swaggerGet');

                cy.get('#api-product-next-btn').should('not.have.class', 'Mui-disabled').click({force:true});

                cy.wait('@swaggerGet', { timeout: Cypress.config().largeTimeout }).then(() => {
                    cy.intercept('GET', '**/swagger').as('getSwagger');
                    cy.get(`#checkbox-list-label-${testApiID}`).click();
                    cy.wait('@getSwagger');
                    // Wait until the api is saved
                    cy.get('#resource-wrapper').children().should('have.length.gte', 1);

                    // add all resources
                    cy.get('#add-all-resources-btn').click({ force: true });
                    cy.get('#create-api-product-btn').scrollIntoView().dblclick({ force: true });
                    cy.url().should('contains', 'overview').then(urlProduct => {
                        const productID = /api-products\/(.*?)\/overview/.exec(urlProduct)[1];
                        cy.log("API Product ID", productID);
                        cy.get('#itest-api-name-version', { timeout: Cypress.config().largeTimeout });
                        cy.get('#itest-api-name-version').contains(productName);

                        // Need to update the underline api and update the api product again.
                        // ==================================================================== //
                        cy.log(testApiID, productID);
                        cy.visit(`/publisher/apis/${testApiID}/resources`);

                        // Add a new resource to the underline api
                        // Typing the resource name
                        const target = '/test';
                        cy.get('#operation-target', { timeout: Cypress.config().largeTimeout });
                        cy.get('#operation-target').type(target);
                        cy.get('#add-operation-selection-dropdown').click();

                        cy.get('#add-operation-get').click();
                        cy.get('body').click();

                        cy.get('#add-operation-button').click();
                        cy.get('#resources-save-operations').click();

                        // Validating if the resource exists after saving
                        cy.get(`#get\\${target}`).should('be.visible');

                        // Go to api product
                        cy.visit(`/publisher/api-products/${productID}/resources/edit`);

                        // Add the newly created resource and save
                        cy.get('#resource-wrapper', { timeout: Cypress.config().largeTimeout });
                        cy.get('#resource-wrapper')
                            .last()
                            .scrollIntoView()
                            .click();
                        cy.get('#add-selected-resources').click();
                        cy.get('#save-product-resources').click();

                        // Deleting the api and api product
                        cy.visit(`/publisher/api-products/${productID}/overview`);
                        cy.get('#itest-api-name-version', { timeout: Cypress.config().largeTimeout });
                        cy.get(`#itest-id-deleteapi-icon-button`).click();
                        cy.get(`#itest-id-deleteconf`).click();

                    });
                });
            });
        });
    });
    afterEach(() => {
        Utils.deleteAPI(testApiID);
    })
})