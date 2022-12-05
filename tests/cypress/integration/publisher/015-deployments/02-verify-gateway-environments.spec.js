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

describe("publisher-015-02 : Verify Gateway Environments", () => {
    const { publisher, password, superTenant, testTenant} = Utils.getUserInfo();

    const verifyGatewayEnvironments = (tenant) => {
        cy.loginToPublisher(publisher, password, tenant);
        Utils.addAPIWithEndpoints({}).then((apiId) => {
            cy.intercept('GET', `/api/am/publisher/v3/settings`, {fixture:'multipleEnvironments.json'}).as('settings');
            cy.intercept('GET', `/api/am/publisher/v3/apis/${apiId}/revisions?query=deployed%3Atrue`, 
            {fixture:'multipleDeployments.json'}).as('revisions');

            // Go to overview page
            cy.visit(`/publisher/apis/${apiId}/overview`);

            // Go to deployments page
            cy.get('#left-menu-itemdeployments').click();
            cy.wait(2000);

            // Deploy API
            cy.get('#Default').click({ "force": true });
            cy.get('#add-description-btn').scrollIntoView().click({ "force": true });
            cy.get('#add-description').click({ "force": true });
            cy.get('#add-description').type('test');
            cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').click();
            cy.get('#undeploy-btn').should('not.have.class', 'Mui-disabled').should('exist');
            cy.wait(2000);

            // Verify environments
            cy.get('#gateway-access-url-cell > div').should('have.text', 
            'http://localhost:8280https://localhost:8243https://wso2.comhttp://apim.com:8280').should('exist');

            // Delete API
            Utils.deleteAPI(apiId);
        });
    }

    it.only("Verify Gateway Environments - super admin", () => {
        verifyGatewayEnvironments(superTenant);
    });
    it.only("Verify Gateway Environments - tenant user", () => {
        verifyGatewayEnvironments(testTenant);
    });
});
