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

describe("Login logout from publisher as supper tenant", () => {
    const { password, carbonUsername, carbonPassword, tenantUser, tenant, } = Utils.getUserInfo();

    it.only("Login and logout from publisher", () => {
        cy.loginToPublisher(carbonUsername, carbonPassword);
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`).then(() => {
            cy.get('#profile-menu-btn').click();
            cy.get('#itest-logout').click();
            cy.get('#usernameUserInput').should('exist');
        })
    })

    it.only("Login and logout from publisher - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`).then(() => {
            cy.get('#profile-menu-btn').click();
            cy.get('#itest-logout').click();
            cy.get('#usernameUserInput').should('exist');
        })
    })
})