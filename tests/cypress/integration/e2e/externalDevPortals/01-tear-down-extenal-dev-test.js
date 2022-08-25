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

import tenantConfigJson from "../../../fixtures/api_artifacts/tenant-conf.json";

const testUsers = require('../../../fixtures/testUsers.json')

import Utils from "@support/utils";


describe("Tear Down Test", () => {
    const {testTenant} = Utils.getUserInfo();
    const externalPortalDisableConfigJson = JSON.parse(JSON.stringify(tenantConfigJson));

    it.only("Delete Sample API" , () => {
        cy.loginToPublisher(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.visit(`/publisher/apis`);
        cy.contains('PizzaShackAPI').should('exist').click();
        cy.get('#left-menu-itemstores').should('exist').click();
        cy.get('[data-testid="portal-checkbox-DeveloperPortal1"]').should('exist').click();
        cy.get('#stores-save-btn').should('exist').click();
        cy.wait(5000);
        cy.get('#itest-id-deleteapi-icon-button').should('exist').click();
        cy.get('#itest-id-deleteconf').should('exist').click();
        cy.wait(5000);
    })

    it.only("Reset Advanced Configuration" , () => {
        cy.updateTenantConfig(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password, testTenant, externalPortalDisableConfigJson);
    })

});