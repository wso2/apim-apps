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
    const productVersion = '1.0.0';
    // Generated per attempt (not a describe-scope const) so a leaked API/Product
    // doesn't make every retry collide and fail import-openapi.
    let productName;
    let apiName;
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

    it("Mock the api response and test it", () => {
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        });
        cy.visit(`/publisher/apis/create/openapi`, {timeout: Cypress.env('largeTimeout')}).wait(5000);
        cy.get('#open-api-file-select-radio').click();
        cy.wait(5000);
        // upload the swagger
        cy.get('#browse-to-upload-btn').wait(5000).then(function () {
            const filepath = `api_artifacts/petstore-v3.json`
            cy.get('input[type="file"]').attachFile(filepath)
        });

        cy.get('#open-api-create-next-btn').click();
        cy.wait(3000);
        cy.get('#itest-id-apiversion-input', {timeout: Cypress.env('largeTimeout')});
        cy.document().then((doc) => {
            // Override the auto-filled petstore title with a unique name so a
            // leaked API from a prior run can't collide and disable Create.
            cy.get('#itest-id-apiname-input').clear();
            cy.get('#itest-id-apiname-input').type(apiName);
            cy.get('#itest-id-apicontext-input').clear();
            cy.get('#itest-id-apicontext-input').type(apiName);
            cy.get('#itest-id-apiversion-input').click();
            const version = doc.querySelector('#itest-id-apiversion-input').value;
            // Assert on the network response so a server error fails fast
            // instead of timing out on URL polling.
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
                cy.get('#itest-api-name-version', {timeout: Cypress.env('largeTimeout')});
                cy.get('#itest-api-name-version').contains(version);
                
                // Go to api product create page
                cy.visit(`/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiversion-input').type(productVersion);
                cy.get('#itest-id-apiname-input').click();

                cy.intercept('**/swagger').as('swaggerGet');

                cy.get('#api-product-next-btn').click();
                cy.wait('@swaggerGet', { timeout: Cypress.env('largeTimeout') }).then(() => {
                    cy.intercept('GET', '**/swagger').as('getSwagger');
                    cy.get(`#checkbox-list-label-${testApiID}`).click();
                    cy.wait('@getSwagger');
                    // Wait until the api is saved
                    cy.get('#resource-wrapper').children().should('have.length.gte', 1);

                    // add all resources
                    cy.get('#add-all-resources-btn').click();
                    cy.get('#create-api-product-btn').scrollIntoView().click({ force: true });
                    cy.wait(5000)
                    cy.url().should('contains', 'overview').then(urlProduct => {
                        const productID = /api-products\/(.*?)\/overview/.exec(urlProduct)[1];
                        cy.log("API Product ID", productID);

                        cy.get('#itest-api-name-version', { timeout: Cypress.env('largeTimeout') });
                        cy.get('#itest-api-name-version').contains(productName);

                        // Going to deployments page
                        cy.get('#left-menu-itemdeployments').click();

                        // Deploying
                        cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').click({ "force": true });
                        cy.contains('div[role="button"]', 'Successfully Deployed').should('exist');
                        cy.get('#undeploy-btn').should('not.have.class', 'Mui-disabled').should('exist');
                        cy.get('#undeploy-btn').should('not.have.class', 'Mui-disabled').click();
                        cy.get('#revision-selector').should('exist');

                        cy.log(testApiID, productID);

                        // Deleting the api and api product
                        cy.visit(`/publisher/api-products/${productID}/overview`);
                        cy.get('#itest-api-name-version', { timeout: Cypress.env('largeTimeout') });
                        cy.get(`#itest-id-deleteapi-icon-button`).click({ force: true });
                        cy.get(`#itest-id-deleteconf`).click();
                    })
                });
            });    
        });
    });
    afterEach(() => {
        Utils.cleanupProductAndApi(productName, apiName);
    })
})
