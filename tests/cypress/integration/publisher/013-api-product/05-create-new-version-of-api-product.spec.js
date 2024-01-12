/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

describe("Create new API product version", () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const productName = Utils.generateName();
    const productVersion = '1.0.0';
    const newVersion = '2.0.0';
    let testApiID;

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Create new API product version", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        // create a new api
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
            cy.get('#open-api-create-btn').should('not.have.class', 'Mui-disabled').click({force:true});

            cy.url().should('contains', 'overview').then(url => {
                testApiID = /apis\/(.*?)\/overview/.exec(url)[1];
                cy.log("API ID", testApiID);
                // validate
                cy.get('#itest-api-name-version', {timeout: Cypress.config().largeTimeout});
                cy.get('#itest-api-name-version').contains(version);

                // Go to api product create page
                cy.visit(`/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiversion-input').type(productVersion);
                cy.get('#itest-id-apiname-input').click();
                cy.get('body').click(0,0);

                cy.intercept('**/swagger').as('swaggerGet');

                cy.get('#api-product-next-btn').should('not.have.class', 'Mui-disabled').click({force:true});

                cy.wait('@swaggerGet', { timeout: Cypress.config().largeTimeout }).then(() => {
                    cy.intercept('GET', '**/swagger').as('getSwagger');
                    cy.get(`#checkbox-list-label-${testApiID}`).click();
                    cy.wait('@getSwagger');
                    // wait until the api is saved
                    cy.get('#resource-wrapper').children().should('have.length.gte', 1);

                    // add all resources
                    cy.get('#add-all-resources-btn').click({ force: true });
                    cy.get('#create-api-product-btn').scrollIntoView().dblclick({ force: true });
                    cy.url().should('contains', 'overview').then(urlProduct => {
                        const productID = /api-products\/(.*?)\/overview/.exec(urlProduct)[1];
                        cy.log("API Product ID", productID);
                        cy.get('#itest-api-name-version', { timeout: Cypress.config().largeTimeout });
                        cy.get('#itest-api-name-version').contains(productName);

                        // create new version of the api product
                        cy.log(testApiID, productID);
                        cy.visit(`/publisher/api-products/${productID}/overview`);
                        cy.get('#create-new-version-btn').click();
                        cy.get('#newVersion').click();
                        cy.get('#newVersion').type(newVersion);
                        cy.intercept('**/api-products/**').as('apiGet');
                        cy.get('#createBtn').click();
                        cy.wait('@apiGet', { timeout: 30000 }).then(() => {
                            // validate
                            cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
                            cy.get('#itest-api-name-version').contains(`${productName}`);
                            cy.get('#itest-api-name-version').contains(`${newVersion}`);
                        })
                        // delete api product verions
                        cy.get(`#itest-id-deleteapi-icon-button`).click();
                        cy.get(`#itest-id-deleteconf`).click();

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
