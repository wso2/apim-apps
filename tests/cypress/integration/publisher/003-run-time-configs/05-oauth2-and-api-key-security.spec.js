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
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    beforeEach(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })


    it.only("OAuth2 and api key security spec", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('#itest-api-details-api-config-acc').click();
        cy.get('#left-menu-itemRuntimeConfigurations').click();
        cy.get('#applicationLevel').click();
        // Checking the two options
        cy.get('#api-security-basic-auth-checkbox').click();
        cy.get('#api-security-api-key-checkbox').click();

        cy.get('#save-runtime-configurations').click();
        cy.get('#save-runtime-configurations').then(() => {
            cy.get('#applicationLevel').click();
            cy.get('#api-security-basic-auth-checkbox').should('be.checked');
            cy.get('#api-security-api-key-checkbox').should('be.checked');
        })
    });


    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});