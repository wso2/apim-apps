/// <reference types="cypress"/>
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
import tenantConfigExternalJson from "../../../fixtures/api_artifacts/tenant-conf-external.json";
import testData from "../../../fixtures/scriptData/e2e/ExternalDevPortalsTestData.json";

const testUsers = require('../../../fixtures/testUsers.json')

describe("Enable External Dev Portal", () => {
    const {testTenant} = Utils.getUserInfo();
    const externalPortalEnableConfigJson = JSON.parse(JSON.stringify(tenantConfigExternalJson));

    it.only("Add New Tenant" , () => {
        cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.wait(5000);
        cy.addNewTenant(testData.tenantDomain, testData.tenantAdminPassword);
        cy.wait(2000);
        cy.contains('OK').should('exist').click();
        cy.carbonLogout();
        cy.carbonLogin(`${testData.tenantAdminUsername}@${testData.tenantDomain}`, testData.tenantAdminPassword);
        cy.carbonLogout();
    })

    it.only("Configure Sample API for External Dev Portal" , () => {
        cy.loginToPublisher(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.visit(`/publisher/apis`);
        cy.contains('WSO2 API-M v4.2.0');
        cy.wait(5000);
        cy.get("body").then($body => {
            if ($body.find("#itest-apis-welcome-msg").length > 0) {
                cy.log("Init page");
                cy.get('#itest-rest-api-create-menu').click();
            } else {
                cy.log("API availble");
                cy.get('#itest-create-api-menu-button').click();
            }
        });
        cy.wait(5000);
        cy.get('#itest-id-deploy-sample').click();
        cy.get('#itest-api-name-version').should('be.visible');
        cy.wait(5000);
        cy.url().should('contains', '/overview');
        cy.get("#itest-api-name-version").contains('PizzaShackAPI');
        cy.get('#left-menu-itemstores').should('not.exist');
    })

    it.only("Update Advanced Configuration" , () => {
        cy.updateTenantConfig(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password, testTenant, externalPortalEnableConfigJson);
    })

    it.only("Configure Sample API for External Dev Portal" , () => {
        cy.loginToPublisher(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.visit(`/publisher/apis`);
        cy.contains('PizzaShackAPI').should('exist').click();
        cy.get('#left-menu-itemstores').should('exist').click();;
        cy.get('[data-testid="portal-checkbox-DeveloperPortal1"]').should('exist').click();
        cy.get('#stores-save-btn').should('exist').click();
    })

    it.only("View External Dev Portal" , () => {
        cy.loginToDevportal(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.wait(3000);
        cy.logoutFromDevportal();
        cy.wait(3000);
        cy.contains(testData.tenantDomain).click();
        cy.wait(3000);
        cy.contains('PizzaShackAPI').should('exist').click();
        cy.wait(3000);
        cy.contains('Visit Original').should('exist').click();
    })

    after("end of the script", () =>{
        cy.log("End of the script")
    })

});