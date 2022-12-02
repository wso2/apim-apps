/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';
    const newVersion = '2.0.0';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })
    it.only("Create a new version of API", () => {
        cy.loginToPublisher(publisher, password);

        cy.createAPIByRestAPIDesign(apiName, apiVersion);

        cy.get('#create-new-version-btn').click();
        cy.get('#newVersion').type(newVersion);
        cy.get('#createBtn').click();

        // Validate
        cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
        cy.get('#itest-api-name-version').contains(`${apiName} :${apiVersion}`);
    });

    after(function () {
        // Test is done. Now delete the api
        cy.deleteApi(apiName, apiVersion);
        cy.deleteApi(apiName, newVersion);

        // delete publisher user.
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});
