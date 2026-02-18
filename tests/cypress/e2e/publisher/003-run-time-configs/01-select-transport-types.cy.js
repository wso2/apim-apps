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

describe("Runtime configuration", () => {
    const { publisher, password, } = Utils.getUserInfo();

    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Select transport type", () => {
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/runtime-configuration`);
            cy.get('#transportLevel div:first', {timeout: Cypress.config().largeTimeout}).click({force:true});
            cy.wait(1000);
            cy.get('#http-transport').click({force:true});
            cy.wait(1000);
            cy.get('#runtime-config-save-button').click();
            // following is tested but haven't worked
            //cy.get('div[role="status"]', {timeout: Cypress.config().largeTimeout}).should('have.text', 'API updated successfully');
            cy.contains('API updated successfully', {timeout: Cypress.config().largeTimeout});
            cy.get('#transportLevel').click({force:true});
            cy.get('#http-transport',  {timeout: Cypress.config().largeTimeout}).should('not.be.checked',  {timeout: Cypress.config().largeTimeout});
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });

});