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

describe("Set publisher access control and visibility by roles", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Set role based API Store visibility and access control for the api", () => {
        const role = 'internal/everyone';
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
        cy.get('#itest-api-details-portal-config-acc').click();
        cy.get('#left-menu-itemDesignConfigurations').click();

        // Select the restricted by role option for access control
        cy.get('#accessControl-selector').click();
        cy.get('#access-control-restricted-by-roles').click();

        // fill the chip input and press enter
        cy.get('[data-testid="access-control-select-role"]').type(`${role}{enter}`);

        // Select the restricted by role option for devportal visibility
        cy.get('#storeVisibility-selector').click();
        cy.get('#visibility-restricted-by-roles').click();

        // fill the chip input and press enter
        cy.get('[data-testid="visibility-select-role"]').type(`${role}{enter}`);

        cy.get('#design-config-save-btn').click();
        cy.get('#design-config-save-btn').then(function () {
            cy.get('div[data-testid="access-control-select-role"] span').contains(role).should('exist');
            cy.get('div[data-testid="visibility-select-role"] span').contains(role).should('exist');
        });
    });

    after(function () {
          // Test is done. Now delete the api
          cy.deleteApi(apiName, apiVersion);

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});

