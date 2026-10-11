/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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

describe("Download API Product", () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });
    const { publisher, password, } = Utils.getUserInfo();
    const productVersion = '1.0.0';
    // Per-attempt unique names so a leaked API/Product doesn't poison every retry.
    let apiName;
    let productName;
    let testApiID;

    beforeEach(function () {
        // Stable apipstest/prodpstest prefixes so purgePetstoreArtifacts can
        // find leftovers regardless of the random suffix.
        apiName = `apipstest${Utils.generateRandomNumber()}`;
        productName = `prodpstest${Utils.generateRandomNumber()}`;
        cy.loginToPublisher(publisher, password);
        // Free the petstore scopes before import; beforeEach so it re-runs per retry.
        Utils.purgePetstoreArtifacts();
    })

    it("Download API Product", () => {
        // create a new API
        cy.visit(`/publisher/apis/create/openapi`, { timeout: Cypress.env('largeTimeout') }).wait(5000);
        cy.get('#open-api-file-select-radio').click();
        cy.wait(5000);
        // upload the swagger
        cy.get('#browse-to-upload-btn').wait(5000).then(function () {
            const filepath = `api_artifacts/petstore-v3.json`
            cy.get('input[type="file"]').attachFile(filepath)
        });
        cy.get('#open-api-create-next-btn').click();
        cy.wait(3000);
        cy.get('#itest-id-apiversion-input', { timeout: Cypress.env('largeTimeout') });
        cy.document().then((doc) => {
            cy.get('#itest-id-apiname-input').clear().type(apiName);
            cy.get('#itest-id-apicontext-input').clear().type(apiName);
            cy.get('body').click(0,0);
            const version = doc.querySelector('#itest-id-apiversion-input').value;
            // Assert on the network response so a server error fails fast
            // instead of timing out on URL polling.
            cy.get('#itest-id-apiname-input').should('have.value', apiName);
            cy.get('#itest-id-apicontext-input').should('have.value', apiName);
            cy.intercept('POST', '**/apis/import-openapi').as('importOpenApi');
            cy.get('#open-api-create-btn').should('not.have.class', 'Mui-disabled').should('be.enabled').click();
            cy.wait('@importOpenApi', { timeout: Cypress.env('largeTimeout') }).then((interception) => {
                const sc = interception && interception.response && interception.response.statusCode;
                if (sc !== 201) {
                    // The 400 has no server-side ERROR log; the response body is
                    // the only place the real reason appears.
                    cy.task('log', `[import-openapi] status=${sc} body=${JSON.stringify(interception && interception.response && interception.response.body)}`);
                }
                expect(sc, 'import-openapi response status').to.eq(201);
            });

            cy.url().should('contains', 'overview').then(url => {
                testApiID = /apis\/(.*?)\/overview/.exec(url)[1];
                cy.log("API ID", testApiID);
                // validate
                cy.get('#itest-api-name-version', { timeout: Cypress.env('largeTimeout') });
                cy.get('#itest-api-name-version').contains(version);

                // go to API product create page
                cy.visit(`/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiversion-input').type(productVersion);
                cy.get('body').click(0, 0);

                cy.intercept('**/swagger').as('swaggerGet');
                cy.get('#api-product-next-btn').should('not.have.class', 'Mui-disabled').click({ force: true });
                cy.wait('@swaggerGet', { timeout: Cypress.env('largeTimeout') }).then(() => {
                    cy.intercept('GET', '**/swagger').as('getSwagger');
                    cy.get(`#checkbox-list-label-${testApiID}`).click();
                    cy.wait('@getSwagger');

                    // wait until the API is saved
                    cy.get('#resource-wrapper').children().should('have.length.gte', 1);

                    // add all resources
                    cy.get('#add-all-resources-btn').click();
                    cy.get('#create-api-product-btn').scrollIntoView().click({ force: true });
                    cy.wait(5000);
                    cy.url().should('contains', 'overview').then(urlProduct => {
                        const productID = /api-products\/(.*?)\/overview/.exec(urlProduct)[1];
                        cy.log("API Product ID", productID);
                        cy.get('#itest-api-name-version', { timeout: Cypress.env('largeTimeout') });
                        cy.get('#itest-api-name-version').contains(productName);

                        // download API product
                        const fileName = `${publisher}-${productName}-${productVersion}`;
                        const downloadsFolder = Cypress.config('downloadsFolder')
                        const downloadedFilename = `${downloadsFolder}/${fileName}.zip`;
                        cy.get('#download-api-btn').click();
                        cy.readFile(downloadedFilename, 'binary', { timeout: 15000 })
                            .should(buffer => expect(buffer.length).to.be.gt(100));
                        
                        // delete API product
                        cy.get(`#itest-id-deleteapi-icon-button`).click();
                        cy.get(`#itest-id-deleteconf`).click();
                        cy.wait(5000);
                    });
                });
            });
        });
    });
    afterEach(() => {
        Utils.cleanupProductAndApi(productName, apiName);
        cy.wait(5000);
    })
})
