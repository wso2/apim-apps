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
    const productVersion = '1.0.0';
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

                // Go to api product create page
                cy.visit(`/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiversion-input').type(productVersion);
                cy.get('#itest-id-apiname-input').click();

                cy.intercept('**/swagger').as('swaggerGet');

                cy.get('#api-product-next-btn').click();
                cy.wait('@swaggerGet', { timeout: Cypress.config().largeTimeout }).then(() => {

                    cy.intercept('GET', '**/swagger').as('getSwagger');
                    cy.get(`#checkbox-list-label-${testApiID}`).click();
                    cy.wait('@getSwagger');

                    cy.get('#resource-wrapper').children().should('have.length.gte', 1);
                    // add all resources
                    cy.get('#add-all-resources-btn', { timeout: Cypress.config().largeTimeout }).click();
                    cy.get('span').contains('Define API Product').click();
                    cy.get('#create-api-product-btn').scrollIntoView().dblclick({ force: true });

                    cy.get('#itest-api-name-version', { timeout: Cypress.config().largeTimeout });
                    cy.get('#itest-api-name-version').contains(productName);

                    // Going to deployments page
                    cy.get('#left-menu-itemdeployments').click();

                    // Deploying
                    cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').click({ "force": true });
                    cy.get('#undeploy-btn').should('not.have.class', 'Mui-disabled').should('exist');

                    // Going to lifecycle page
                    cy.get('#left-menu-itemlifecycle').click();

                    // Publishing
                    cy.wait(2000);
                    cy.get('[data-testid="Publish-btn"]').click();

                    cy.get('button[data-testid="Demote to Created-btn"]').should('exist');

                    cy.get(`#itest-id-deleteapi-icon-button`).click();
                    cy.get(`#itest-id-deleteconf`).click();
                })

            });
        });
    });
    afterEach(() => {
        Utils.deleteAPI(testApiID);
    })
})