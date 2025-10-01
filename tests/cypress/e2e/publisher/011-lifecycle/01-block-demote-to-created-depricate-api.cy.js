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

describe("Lifecycle changes", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';
    let testApiId;

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })
    it.only("Block demote retire api", {
        retries: {
          runMode: 3,
          openMode: 0,
        },
      }, () => {
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion }).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#left-menu-itemsubscriptions').click();
            cy.get('[data-testid="policy-checkbox-silver"]').click();
            cy.get('#subscriptions-save-btn').click();

            // // Going to lifecycle page
            // cy.get('[data-testid="left-menu-itemlifecycle"]').click();
            // // This wait is ant pattern. But there is no other way unless the React components are rewrite.
            // cy.wait(2000);
            //
            // // Publishing
            // cy.get('button[data-testid="Publish"]').click();
            // cy.get('button[data-testid="Redeploy"]').should('exist');
            // // Even though this step is redundant we need to do this. The component is behaving
            // // It removes the buttons after some time of initial rendering.
            // cy.get('[data-testid="left-menu-itemlifecycle"]').click();
            // cy.wait(2000);
            //
            // // Redeploy
            // cy.get('button[data-testid="Redeploy"]').then(() => {
            //     cy.get('button[data-testid="Redeploy"]').click();
            // });

            // Going to deployments page
            cy.get('#left-menu-itemdeployments').click();

            // Deploying
            cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').scrollIntoView().click({force:true});
            cy.contains('div[role="button"]', 'Successfully Deployed').should('exist');
            cy.contains("Create revisions and deploy in Gateway Environments", {timeout: Cypress.config().largeTimeout})
            // Going to lifecycle page
            cy.get('#left-menu-itemlifecycle').click();

            // Publishing
            cy.wait(3000);
            cy.get('[data-testid="Publish-btn"]', {timeout: Cypress.config().largeTimeout}).click();

            cy.wait(2000);
            cy.contains("LC has changed from CREATED to PUBLISHED", {timeout: Cypress.config().largeTimeout})
            cy.get('button[data-testid="Demote to Created-btn"]').should('exist');
            cy.contains("CREATED", {timeout: Cypress.config().largeTimeout})
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Demote to created
            cy.get('button[data-testid="Demote to Created-btn"]').click();
            cy.wait(2000);
            cy.get('[data-testid="Publish-btn"]', {timeout: Cypress.config().largeTimeout}).click();
            //cy.get('button[data-testid="Demote to Created-btn"]').should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Block
            cy.get('[data-testid="Block-btn"]', {timeout: Cypress.config().largeTimeout}).click();
            cy.wait(2000);
            cy.get('button[data-testid="Re-Publish-btn"]').should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Re-Publish

            cy.get('button[data-testid="Re-Publish-btn"]', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('button[data-testid="Deprecate-btn"]', {timeout: Cypress.config().largeTimeout}).should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Deprecate

            cy.get('button[data-testid="Deprecate-btn"]', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#itest-id-conf', {timeout: Cypress.config().largeTimeout}).contains('DEPRECATE').click();

            cy.get('button[data-testid="Retire-btn"]').should('exist');
            cy.wait(2000);
            cy.get('button[data-testid="Retire-btn"]', {timeout: Cypress.config().largeTimeout}).click(); 
            cy.get('#itest-id-conf', {timeout: Cypress.config().largeTimeout}).contains('RETIRE').click();
        });
    });
    afterEach(() => {
        // Test is done. Now delete the api
        Utils.deleteAPI(testApiId);
    })
});