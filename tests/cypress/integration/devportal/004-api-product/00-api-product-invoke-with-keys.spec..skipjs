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

describe("Invoke API Product", () => {
    const { publisher, developer, password, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;
    let testProductId;
    const appName = Utils.generateName();
    const appDescription = 'Testing app ';
    const productName = Utils.generateName();
    it("Invoke API Product using Oauth 2 and API Key", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        cy.loginToPublisher(publisher, password);
        cy.visit(`/publisher/apis`);
        // cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.visit(`/publisher/apis/create/openapi`);
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

            //Get the api id
            cy.location('pathname').then((pathName) => {
                const pathSegments = pathName.split('/');
                const uuid = pathSegments[pathSegments.length - 2];
                testApiId = uuid;


                // Go to api product create page
                cy.visit(`/publisher/api-products/create`);

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#itest-id-apiname-input').click();


                cy.intercept('**/swagger').as('swaggerGet');

                cy.get('#api-product-next-btn').click();
                cy.wait('@swaggerGet', { timeout: 3000 }).then(() => {
                    // add all resources
                    cy.get('#add-all-resources-btn', { timeout: 30000 }).click();


                    cy.get('#create-api-product-btn').scrollIntoView().click({force:true});
                    cy.get('#itest-api-name-version', { timeout: 30000 });
                    cy.get('#itest-api-name-version').contains(productName);

                    //Get the api product id
                    cy.location('pathname').then((pathName) => {
                        const pathSegments = pathName.split('/');
                        const uuidProduct = pathSegments[pathSegments.length - 2];
                        testProductId = uuidProduct;
                        cy.log(uuid, uuidProduct);

                        cy.get('#left-menu-itemdeployments').click();

                        // Deploying
                        cy.get('#deploy-btn', { timeout: 30000 }).should('not.have.class', 'Mui-disabled').click({ force: true });

                        cy.get('#left-menu-itemlifecycle').click();

                        // Publishing api product
                        cy.wait(2000);
                        cy.get('[data-testid="Publish-btn"]').click({force:true});
                        cy.get('[data-testid="itest-api-state"]').contains('PUBLISHED');
                        cy.visit(`/publisher/api-products/${uuidProduct}/runtime-configuration`);
                        cy.get('#applicationLevel', {timeout: Cypress.config().largeTimeout}).children('[role="button"]').click({force:true});
                        cy.wait(2000);
                        cy.get('#api-security-api-key-checkbox').check().should('be.checked');

                        cy.get('#runtime-config-save-button').scrollIntoView().click();

                        cy.logoutFromPublisher();

                        //Log into developer portal
                        cy.loginToDevportal(developer, password);

                        //Test with Oath2 Token
                        cy.visit(`/devportal/applications/create?tenant=carbon.super`);
                        cy.createApp(appName, appDescription);

                        cy.get('#production-keys-oauth').click();
                        cy.get('#generate-keys', { timeout: 30000 }).click();
                        cy.get('#generate-access-token-oauth2', { timeout: 30000 }).click();
                        cy.get('#generate-access-token-generate-btn', { timeout: 30000 }).click();
                        //cy.get('#copy-to-clipbord-icon').click();
                        cy.get('#generate-access-token-close-btn').click();

                        //Subscription of APi Product
                        cy.get('#left-menu-subscriptions').click();
                        cy.contains('Subscribe APIs').click();

                        cy.get('#pagination-rows').click();
                        cy.get('[data-value="100"]').click();

                        cy.get('[aria-labelledby="simple-dialog-title"]').find('input[placeholder="Search APIs"]').click().type(productName + "{enter}");

                        cy.get(`#policy-subscribe-btn-${uuidProduct}`).click({force: true});
                        cy.get('[aria-label="close"]').click();
                        cy.location('pathname').then((pathName) => {
                            const pathSegments = pathName.split('/');
                            const uuidApp = pathSegments[pathSegments.length - 2];

                            cy.visit(`/devportal/apis/${uuidProduct}/test`);

                            //test
                            cy.get('#gen-test-key').should('not.have.attr', 'disabled', { timeout: 30000 });
                            cy.get('#gen-test-key').click();
                            cy.intercept('**/generate-token').as('genToken');
                            cy.wait('@genToken');

                            // Test console with Oath2 token
                            cy.get('#operations-default-get__').find('.opblock-summary-control').click();
                            cy.get('#operations-default-get__').find('.try-out__btn').click();
                            cy.get('#operations-default-get__').find('.execute').click();
                            cy.wait(3000);
                            cy.get('#operations-default-get__').find('.response-col_status').contains('200').should('exist');

                            cy.visit(`/devportal/applications`);
                            cy.get(`#delete-${appName}-btn`, { timeout: 30000 });
                            cy.get(`#delete-${appName}-btn`).click();
                            cy.get(`#itest-confirm-application-delete`).click();

                        });

                        //Test with API Key
                        const appName2 = Utils.generateName();
                        cy.createApp(appName2, appDescription);
                        cy.location('pathname').then((pathName) => {
                            const pathSegments = pathName.split('/');
                            const uuidApp = pathSegments[pathSegments.length - 2];
                            cy.get('#production-keys-apikey').click();
                            // Generate with none option
                            cy.get('#generate-key-btn').click();
                            cy.get('#generate-api-keys-btn', { timeout: 30000 }).click({ force: true });
                            cy.get('#generate-api-keys-close-btn').should('be.visible').click({ force: true });
                            cy.wait(2000);

                            //Subscription of APi Product
                            cy.visit(`/devportal/applications/${uuidApp}/subscriptions`);
                            cy.get('#left-menu-subscriptions').click();
                            cy.contains('Subscribe APIs').click();

                            cy.get('[aria-labelledby="simple-dialog-title"]').find('input[placeholder="Search APIs"]').click().type(productName + "{enter}");
                            
                            cy.get(`#policy-subscribe-btn-${uuidProduct}`).click();
                            cy.get('[aria-label="close"]').click();

                            cy.visit(`/devportal/apis/${uuidProduct}/test`);
                            cy.wait(2000);
                            cy.get('#api-key-select-radio-button').click();

                            //test
                            cy.get('#gen-test-key').should('not.have.attr', 'disabled', { timeout: 30000 });
                            cy.get('#gen-test-key').click();

                            cy.intercept('**/generate-token').as('genToken');
                            //cy.wait('@genToken');

                            // Test console with api key
                            cy.get('#operations-default-get__').find('.opblock-summary-control').click();
                            cy.get('#operations-default-get__').find('.try-out__btn').click();
                            cy.get('#operations-default-get__').find('.execute').click();
                            cy.wait(3000);
                            cy.get('#operations-default-get__').find('.response-col_status').contains('200').should('exist');

                            cy.visit(`/devportal/applications`);
                            cy.get(`#delete-${appName2}-btn`, { timeout: 30000 });
                            cy.get(`#delete-${appName2}-btn`).click();
                            cy.get(`#itest-confirm-application-delete`).click();

                        });

                        cy.logoutFromDevportal();


                        cy.loginToPublisher(publisher, password);

                        // Deleting the api and api product
                        cy.visit(`/publisher/api-products/${uuidProduct}/overview`);
                        cy.get('#itest-id-deleteapi-icon-button').click();
                        cy.get('#itest-id-deleteconf').click();

                        cy.visit(`/publisher/apis/${uuid}/overview`);
                        cy.get('#itest-api-name-version', { timeout: 30000 });
                        cy.get(`#itest-id-deleteapi-icon-button`).click();
                        cy.get(`#itest-id-deleteconf`).click();

                    });
                });
            });
        });

    });
    after(() => {
        Utils.deleteAPIProduct(testProductId);
        Utils.deleteAPI(testApiId);
    })
})