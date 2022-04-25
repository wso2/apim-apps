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
    const publisher = 'publisher';
    const developer = 'developer';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const productName = 'petstoreProduct';
    const apiName = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;
    const apiVersion = '1.0.6';
    const apiContext = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;
    const appName = 'InvokeApiProduct' + Math.floor(Date.now() / 1000);
    const appDescription = 'Testing app ';


    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it("Invoke API Product using Oauth 2", () => {

        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        
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
            cy.get('#add-all-resources-btn',).click();
            cy.get('#create-api-product-btn').scrollIntoView().click();

            cy.get('#itest-api-name-version', { timeout: 30000 });
            cy.get('#itest-api-name-version').contains(productName);

            //Get the api product id
            cy.location('pathname').then((pathName) => {
                const pathSegments = pathName.split('/');
                const uuidProduct = pathSegments[pathSegments.length - 2];
                // Need to update the underline api and update the api product again.
                // ==================================================================== //
                cy.log(uuid, uuidProduct);
                cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/resources`);

                // Add a new resource to the underline api
                // Typing the resource name
                const target = '/test';
                cy.get('#operation-target', { timeout: 30000 });
                cy.get('#operation-target').type(target);
                cy.get('#add-operation-selection-dropdown').click();

                cy.get('#add-operation-get').click();
                cy.get('body').click();

                cy.get('#add-operation-button').click();
                cy.get('#resources-save-operations').click();

                // Validating if the resource exists after saving
                cy.get(`#get\\${target}`).should('be.visible');

                // Go to api product
                cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/${uuidProduct}/resources/edit`);

                // Add the newly created resource and save
                cy.get('#resource-wrapper', { timeout: 30000 });
                cy.get('#resource-wrapper')
                    .last()
                    .scrollIntoView()
                    .click();
                cy.get('#add-selected-resources').click();
                cy.get('#save-product-resources').click();

                cy.visit(`${Utils.getAppOrigin()}/publisher/api-products/${uuidProduct}/overview`);
                cy.get('#left-menu-itemlifecycle').click();

                // Publishing api product
                cy.get('[data-testid="Publish-btn"]').click();
                cy.wait(2000);
                
                cy.logoutFromPublisher();


                //Log into developer portal
                cy.loginToDevportal(developer, password);
                cy.visit(`${Utils.getAppOrigin()}/devportal/applications/create?tenant=carbon.super`);
                cy.createApp(appName, appDescription);
                
                cy.get('#production-keys-oauth').click();
                cy.get('#generate-keys', {timeout: 30000}).click();
                cy.get('#generate-access-token-oauth2',{timeout: 30000}).click();
                cy.get('#generate-access-token-generate-btn',{timeout: 30000}).click();
                cy.get('#copy-to-clipbord-icon').click();
                cy.get('#generate-access-token-close-btn').click();

                //Subscription of APi Product
                cy.get('#left-menu-subscriptions').click();
                cy.get('#subscribe-api-btn').click();

                cy.get(`#policy-subscribe-btn-${uuidProduct}`).click();
                cy.get('#close-btn').click();
                cy.location('pathname').then((pathName) => {
                    const pathSegments = pathName.split('/');
                    const uuidApp = pathSegments[pathSegments.length - 2];

                    cy.visit(`${Utils.getAppOrigin()}/devportal/apis/${uuidProduct}/overview`);
                    cy.get('#left-menu-test').click();

                    //test
                    
                    cy.get('#gen-test-key').should('not.have.attr', 'disabled', { timeout: 30000 });
                    cy.get('#gen-test-key').click();

                    cy.intercept('**/generate-token').as('genToken');
                    cy.wait('@genToken');

                    // Test the console
                   
                    


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

    after(function () {

        //Delete Users
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
        cy.deleteUser(developer);
    })
})