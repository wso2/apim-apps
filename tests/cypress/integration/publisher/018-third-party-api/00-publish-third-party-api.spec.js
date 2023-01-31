/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import PublisherComonPage from "../../../support/pages/publisher/PublisherComonPage";
import DevportalComonPage from "../../../support/pages/devportal/DevportalComonPage";
const publisherComonPage = new PublisherComonPage();
const devportalComonPage = new PublisherComonPage();

let apiId ;
let apiName;

describe("Publish thirdparty api", () => {
    const { publisher, developer, password, } = Utils.getUserInfo();
    it.only("Publish thirdparty api", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        cy.loginToPublisher(publisher, password);
        publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
            // cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/asyncapi`);
            // publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
            // cy.get('#outlined-full-width', {timeout: Cypress.config().largeTimeout}).invoke('val',
            //'https://raw.githubusercontent.com/asyncapi/spec/v2.0.0/examples/2.0.0/streetlights.ym');
            // cy.get('#outlined-full-width').type('l');
            // cy.get('#outlined-full-width').click(0,0);
            // cy.get('#outlined-full-width').should('have.value',
            //'https://raw.githubusercontent.com/asyncapi/spec/v2.0.0/examples/2.0.0/streetlights.yml');
            // cy.get('button span').contains('Next').should('not.be.disabled');
            // cy.get('button span').contains('Next').click();
            // cy.get('#mui-component-select-protocol').click();
            // cy.get('#other').should('exist');
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/create/rest`);
            publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
            apiName = Utils.generateName().replace('-', '_');
            cy.get('#itest-id-apiname-input', {timeout: Cypress.config().largeTimeout}).type(apiName);
            cy.get('#itest-id-apicontext-input').type('/' + apiName);
            cy.get('#itest-id-apiversion-input').type('1.0.0');
            cy.get('#itest-id-apiendpoint-input').type(`${Utils.getAppOrigin()}/am/sample/${apiName}/v1/api`);
            cy.get('#itest-id-apiversion-input').click()
            cy.get('body').click(0,0);
            cy.get('#itest-create-default-api-button').click();
            //Mark as third party api
            cy.get('#itest-api-details-portal-config-acc', {timeout: Cypress.config().largeTimeout}).click();
            cy.url().then(url => {
                apiId = /apis\/(.*?)\/overview/.exec(url)[1];
                cy.get('#left-menu-itemDesignConfigurations').click();
                cy.wait(5000);
                cy.get('[name="advertised"]:first').click();
                cy.get('[name="apiExternalProductionEndpoint"]')
                    .type(`${Utils.getAppOrigin()}/am/sample/${apiName}/v1/externalapi`, {force:true, timeout:30000});
                cy.get('[name="apiExternalSandboxEndpoint"]')
                    .type(`${Utils.getAppOrigin()}/am/sample/${apiName}/v1/externalapi`, {force:true});
                cy.get('[name="originalDevPortalUrl"]')
                    .type('http://www.mocky.io/v2/5ec501532f00009700dc2dc1', {force:true});
                cy.get('#design-config-save-btn').click({force:true});
                cy.get('#itest-api-details-portal-config-acc').click();
        
                //publish
                cy.get('#left-menu-itemlifecycle').click();
                cy.wait(1000);
                cy.get('[data-testid="Publish-btn"]', {timeout: Cypress.config().largeTimeout}).should('exist');
                cy.get('[data-testid="Deploy as a Prototype-btn"]').should('exist');
                cy.wait(1000);
                cy.get('[data-testid="Publish-btn"]', {timeout: Cypress.config().largeTimeout}).click();
        
                //check if the api is third-party and published
                cy.get('[data-testid="itest-api-state"]').contains('PUBLISHED').should('exist');
                cy.get('[data-testid="itest-third-party-api-label"]').contains('Third Party').should('exist');
        
                //Check if the subscriptions,runtime config, resources, scopes, monetization,
                //and test console sections are present
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#left-menu-itemsubscriptions').should('exist');
                cy.get('#left-menu-itemsubscriptions').click();
                cy.get('[name="Unlimited"]').click();
                cy.get('#subscriptions-save-btn').click();
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#itest-api-details-api-config-acc').click();
                cy.get('#left-menu-itemRuntimeConfigurations').should('exist');
                cy.get('#left-menu-itemresources').should('exist');
                cy.get('#left-menu-itemLocalScopes').should('exist');
                cy.get('#left-menu-itemMonetization').should('exist');
                cy.get('#itest-api-details-api-config-acc').click();
                cy.get('#left-menu-itemTestConsole').should('exist');
        
                //Check if the api is not deployable
                cy.get('#left-menu-itemdeployments').click();
                cy.get('[data-testid="third-party-api-deployment-dialog"]')
                    .contains('This API is marked as a third party API.'+
                    ' The requests are not proxied through the gateway. Hence, deployments are not required.')
                    .should('exist');
                cy.get('#deploy-btn').should('be.disabled');
        
                //Check if prompts when switching to a regular api
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#left-menu-itemDesignConfigurations').click();
                cy.get('[name="advertised"]:last').click();
                cy.get('[data-testid="itest-update-api-confirmation"]', {timeout: Cypress.config().largeTimeout}).
                    should('exist');
        
                cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
                cy.wait(10000)
                publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
                cy.get("#searchQuery").type(apiName).type('{enter}')
                cy.wait(10000)
                cy.get(`div[data-testid="card-action-${apiName}1.0.0"]`, {timeout: Cypress.config().largeTimeout})
                    .click();
                cy.wait(3000)
                cy.get(`div[data-testid="card-action-${apiName}1.0.0"]>div>span`,
                    {timeout: Cypress.config().largeTimeout})
                    .contains('PUBLISHED').should('exist');

                cy.get(`a[aria-label="${apiName} Thumbnail"]`, {timeout: Cypress.config().largeTimeout})
                    .should('exist', {timeout: Cypress.config().largeTimeout});
                    
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                devportalComonPage.waitUntillPublisherLoadingSpinnerExit();
                cy.viewThirdPartyApi(apiName);
                cy.logoutFromDevportal();
            });
    });
    afterEach(function () {
        cy.log("deleting api ", apiId);
        cy.loginToPublisher(publisher, password);
        publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
        Utils.deleteAPI(apiId);
        cy.logoutFromPublisher();
    })
});
