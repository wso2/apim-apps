/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
    const publisher = 'publisher';
    const developer = 'developer';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const productName = 'pizzaShackProduct';
    const appName = 'InvokeApiProduct' + Math.floor(Date.now() / 1000);
    const appDescription = 'Testing app ';


    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it("Invoke API Product using Oauth 2 and API Key", () => {

        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        // cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.get('#itest-rest-api-create-menu').click();
        cy.get('#itest-id-landing-upload-oas').click();
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
                    cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/${uuidProduct}/runtime-configuration`);
                    cy.get('#applicationLevel').click();
                    cy.wait(2000);
                    cy.get('#api-security-api-key-checkbox').check().should('be.checked');

                    cy.get('#runtime-config-save-button').scrollIntoView().click();

                    cy.logoutFromPublisher();

                    //Log into developer portal
                    cy.loginToDevportal(developer, password);

                    //Test with Oath2 Token
                    cy.visit(`${Utils.getAppOrigin()}/devportal/applications/create?tenant=carbon.super`);
                    cy.createApp(appName, appDescription);
                    
                    cy.get('#production-keys-oauth').click();
                    cy.get('#generate-keys', {timeout: 30000}).click();
                    cy.get('#generate-access-token-oauth2',{timeout: 30000}).click();
                    cy.get('#generate-access-token-generate-btn',{timeout: 30000}).click();
                    //cy.get('#copy-to-clipbord-icon').click();
                    cy.get('#generate-access-token-close-btn').click();

                    //Subscription of APi Product
                    cy.get('#left-menu-subscriptions').click();
                    cy.get('#subscribe-api-btn').click();

                    cy.get(`#policy-subscribe-btn-${uuidProduct}`).click();
                    cy.get('#close-btn').click();
                    cy.location('pathname').then((pathName) => {
                        const pathSegments = pathName.split('/');
                        const uuidApp = pathSegments[pathSegments.length - 2];

                        cy.visit(`${Utils.getAppOrigin()}/devportal/apis/${uuidProduct}/test`);

                        //test
                        cy.get('#gen-test-key').should('not.have.attr', 'disabled', { timeout: 30000 });
                        cy.get('#gen-test-key').click();
                        cy.intercept('**/generate-token').as('genToken');
                        cy.wait('@genToken');

                        // Test console with Oath2 token
                        cy.get('#operations-default-get_menu').click();
                        cy.get('#operations-default-get_menu .try-out__btn').click();
                        cy.get('#operations-default-get_menu button.execute').click();
                        cy.wait(3000);
                        cy.get('#operations-default-get_menu  td.response-col_status').contains('200').should('exist');

                        cy.visit(`${Utils.getAppOrigin()}/devportal/applications`);
                        cy.get(`#delete-${appName}-btn`, { timeout: 30000 });
                        cy.get(`#delete-${appName}-btn`).click();
                        cy.get(`#itest-confirm-application-delete`).click();
                        
                    });

                    //Test with API Key
                    cy.createApp(appName, appDescription);
                    cy.location('pathname').then((pathName) => {
                        const pathSegments = pathName.split('/');
                        const uuidApp = pathSegments[pathSegments.length - 2];
                        cy.get('#production-keys-apikey').click();
                        // Generate with none option
                        cy.get('#generate-key-btn').click();
                        cy.get('#generate-api-keys-btn',{timeout: 30000}).click({force:true});
                        cy.get('#generate-api-keys-close-btn').should('be.visible').click({force:true});
                        cy.wait(2000);
                                
                        //Subscription of APi Product
                        cy.visit(`${Utils.getAppOrigin()}/devportal/applications/${uuidApp}/subscriptions`);
                        cy.get('#left-menu-subscriptions').click();
                        cy.get('#subscribe-api-btn').click();

                        cy.get(`#policy-subscribe-btn-${uuidProduct}`).click();
                        cy.get('#close-btn').click();
                   
                        cy.visit(`${Utils.getAppOrigin()}/devportal/apis/${uuidProduct}/test`);
                        cy.wait(2000);
                        cy.get('#api-key-select-radio-button').click();

                        //test
                        cy.get('#gen-test-key').should('not.have.attr', 'disabled', { timeout: 30000 });
                        cy.get('#gen-test-key').click();

                        cy.intercept('**/generate-token').as('genToken');
                        //cy.wait('@genToken');

                        // Test console with api key
                        cy.get('#operations-default-get_menu').click();
                        cy.get('#operations-default-get_menu .try-out__btn').click();
                        cy.get('#operations-default-get_menu button.execute').click();
                        cy.wait(3000);
                        cy.get('#operations-default-get_menu  td.response-col_status').contains('200').should('exist');

                        cy.visit(`${Utils.getAppOrigin()}/devportal/applications`);
                        cy.get(`#delete-${appName}-btn`, { timeout: 30000 });
                        cy.get(`#delete-${appName}-btn`).click();
                        cy.get(`#itest-confirm-application-delete`).click();
                        
                    });

                    cy.logoutFromDevportal();


                    cy.loginToPublisher(publisher, password);

                    // Deleting the api and api product
                    cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/${uuidProduct}/overview`);
                    cy.get('#itest-id-deleteapi-icon-button').click();
                    cy.get('#itest-id-deleteconf').click();

                    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/overview`);
                    cy.get('#itest-api-name-version', { timeout: 30000 });
                    cy.get(`#itest-id-deleteapi-icon-button`).click();
                    cy.get(`#itest-id-deleteconf`).click();

                });
            
            });
        });
 
    });

    after(function () {

        //Delete Users
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
        cy.deleteUser(developer);
    })
})