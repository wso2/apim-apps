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

describe("Save and publish API", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Save and publish API", () => {
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemsubscriptions').click();
            cy.get('[data-testid="policy-checkbox-silver"]').click();
            cy.get('#subscriptions-save-btn').click();

            // Going to deployments page
            cy.get('#left-menu-itemdeployments').click();

            // Deploying
            cy.wait(2000);
            cy.get('#add-description-btn').click();
            cy.get('#add-description').click();
            cy.get('#add-description').type('test');
            cy.get('#deploy-btn').click();
            cy.get('#undeploy-btn').should('exist');

            // Going to lifecycle page
            cy.get('#left-menu-itemlifecycle').click();


            // Publishing
            cy.wait(2000);
            cy.get('[data-testid="Publish-btn"]').click();

            // Validate
            cy.get('button[data-testid="Demote to Created-btn"]').should('exist');

            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});