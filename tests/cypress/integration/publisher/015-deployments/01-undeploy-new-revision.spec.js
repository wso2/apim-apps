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

describe("Undeploy new revision", () => {
    const { publisher, password, } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Create new revision and undeploy", () => {
        Utils.addAPIWithEndpoints({}).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            // Going to deployments page
            cy.get('#left-menu-itemdeployments').click();

            // Deploying
            cy.get('#add-description-btn')
                .scrollIntoView()
                .click();
            cy.get('#add-description').click();
            cy.get('#add-description').type('test');
            cy.get('#deploy-btn').click();
            cy.get('#undeploy-btn').should('exist');
            cy.get('#undeploy-btn').click();
            cy.get('#revision-selector').should('exist');
            Utils.deleteAPI(apiId);
        });
    });
});