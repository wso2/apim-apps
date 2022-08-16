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

describe("Create a new version of API", () => {
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';
    const newVersion = '2.0.0';
    const { publisher, password} = Utils.getUserInfo();
    let testApiId;

    it.only("Create a new version of API", () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPI({name: apiName, version: apiVersion}).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#create-new-version-btn').click();
            cy.get('#newVersion').type(newVersion);
            cy.intercept('**/apis/**').as('apiGet');
            cy.get('#createBtn').click();
            cy.wait('@apiGet', { timeout: 30000 }).then(() => {
                // Validate
                cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
                cy.get('#itest-api-name-version').contains(`${apiName} :${newVersion}`);
            })
        });
    });

    after(function () {
        // Test is done. Now delete the api
        if (testApiId) {
            Utils.deleteAPI(testApiId);
        }
    })
});