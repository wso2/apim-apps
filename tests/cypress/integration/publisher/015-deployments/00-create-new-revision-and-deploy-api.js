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

describe("Create new revision and deploy", () => {
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

    it.only("Create new revision and deploy", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);

        // Going to deployments page
        cy.get('#left-menu-itemdeployments').click();

        // Deploying
        cy.get('#add-description-btn')
            .scrollIntoView().click({"force":true});
        cy.get('#add-description').click({"force":true});
        cy.get('#add-description').type('test');
        cy.get('#deploy-btn').click();
        cy.get('#undeploy-btn').should('exist');

        // Going to lifecycle page
        cy.get('#left-menu-itemlifecycle').click();

        // Publishing
        cy.wait(2000);
        cy.get('[data-testid="Publish-btn"]').click();

        cy.get('button[data-testid="Demote to Created-btn"]').should('exist');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click();
        cy.get(`#itest-id-deleteconf`).click();

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});
