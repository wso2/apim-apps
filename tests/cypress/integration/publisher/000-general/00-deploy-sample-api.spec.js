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

describe("Deploy sample api", () => {
    const { publisher, password} = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Deploy sample api", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
        cy.intercept(
            {
                method: 'GET',
                path: '**/apis?limit=10&offset=0',
            },
            {
                body: { "count": 0, "list": [], "pagination": { "offset": 0, "limit": 10, "total": 0, "next": "", "previous": "" } },
            },
        ).as('apiGet');
        cy.wait("@apiGet", { timeout: 180000 }).then((interceptions) => {
            console.log(interceptions);
            cy.get('#itest-rest-api-create-menu').click();
            cy.get('#itest-id-deploy-sample').click();
            cy.get('#itest-api-name-version', { timeout: 50000 }).should('be.visible');
            cy.url().should('contains', '/overview');
            cy.get("#itest-api-name-version").contains('PizzaShackAPI');
            cy.get('#itest-id-deleteapi-icon-button', {timeout: 30000}).click();
            cy.get('#itest-id-deleteconf', {timeout: 30000}).click();
        });
    });
});