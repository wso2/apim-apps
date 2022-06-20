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

describe("Add additional properties", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add additional properties", () => {
        const prop = 'prop1';
        const propVal = 'prop1-val';

        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemproperties').click();

            // Click the add property button
            cy.get('#add-new-property').click();

            // Fill the form
            cy.get('#property-name').click().type(prop);
            cy.get('#property-value').click().type(propVal);
            // Add them
            cy.get('#properties-add-btn').click();

            // Save the api
            cy.get('#save-api-properties').click();

            // Checking the values exists
            cy.get('#save-api-properties').then(function () {
                cy.contains(prop).should('exist');
                cy.contains(propVal).should('exist');
            });
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});