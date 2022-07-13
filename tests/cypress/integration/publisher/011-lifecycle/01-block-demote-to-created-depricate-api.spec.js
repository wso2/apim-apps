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

    before(function () {
        cy.loginToPublisher(publisher, password);
    })
    it.only("Block demote retire api", () => {
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
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
            cy.get('#deploy-btn').scrollIntoView().click();

            // Going to lifecycle page
            cy.get('#left-menu-itemlifecycle').click();

            // Publishing
            cy.wait(3000);
            cy.get('[data-testid="Publish-btn"]').click();

            cy.wait(2000);
            cy.get('button[data-testid="Demote to Created-btn"]').should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Demote to created
            cy.get('button[data-testid="Demote to Created-btn"]').click();
            cy.wait(2000);
            cy.get('[data-testid="Publish-btn"]').then(() => {
                cy.get('[data-testid="Publish-btn"]').click();
            });
            cy.get('button[data-testid="Demote to Created-btn"]').should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Block
            cy.get('[data-testid="Block-btn"]').then(() => {
                cy.get('[data-testid="Block-btn"]').click();
            });
            cy.wait(2000);
            cy.get('button[data-testid="Re-Publish-btn"]').should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Re-Publish
            cy.get('button[data-testid="Re-Publish-btn"]').then(() => {
                cy.get('button[data-testid="Re-Publish-btn"]').click();
            });
            cy.get('button[data-testid="Deprecate-btn"]').should('exist');
            cy.get('#left-menu-itemlifecycle').click();
            cy.wait(2000);

            // Deprecate
            cy.get('button[data-testid="Deprecate-btn"]').then(() => {
                cy.get('button[data-testid="Deprecate-btn"]').click();
            });
            cy.get('button[data-testid="Retire-btn"]').should('exist');
            cy.wait(2000);


            cy.get('button[data-testid="Retire-btn"]').then(() => {
                cy.get('button[data-testid="Retire-btn"]').click();
            });
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});