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

describe("Deploy as prototype", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Deploy as prototype", () => {
        const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`); 
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.wait(500);
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();
            cy.get('[data-testid="prototype_endpoint-start"]').click();

            cy.get('[data-testid="primaryEndpoint-endpoint-text-field"]').then(() => {
                cy.get('[data-testid="primaryEndpoint-endpoint-text-field"] input').focus().type(endpoint);
            });

            // Save
            cy.get('[data-testid="endpoint-save-btn"]').then(() => {
                cy.get('[data-testid="endpoint-save-btn"]').click();
            });

            cy.get('[data-testid="left-menu-itemlifecycle"]').click();
            cy.wait(2000);
            cy.get('button[data-testid="Deploy as a Prototype"]').then(() => {
                cy.get('button[data-testid="Deploy as a Prototype"]').click();
            });
            cy.get('button[data-testid="Demote to Created"]').should('exist');
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});