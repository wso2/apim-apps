/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import PublisherComonPage from "../../pages/publisher/PublisherComonPage";

class PublisherMenu {

    // navigate by URL need to provide api id

    static goToBasicInfoByURL(apiID){
        cy.intercept('GET', `**/apis/${apiID}/documents?limit=1000`).as('documents');
        cy.visit(`/publisher/apis/${apiID}/configuration`);
        cy.wait('@documents',{timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('equal', 200)
        PublisherComonPage.waitUntillLoadingComponentsExit();
    }
    static goToDeploymentsByURL(apiID){
        cy.intercept('GET', `**/apis/${apiID}/deployments`).as('deployments');
        cy.visit(`/publisher/apis/${apiID}/deployments`);
        cy.wait('@deployments',{timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('equal', 200)
        PublisherComonPage.waitUntillLoadingComponentsExit();
    }
    static goTolifecycleByURL(apiID){
        cy.intercept('GET', `**/apis/${apiID}/revisions?query=deployed**`).as('revisions');
        cy.visit(`/publisher/apis/${apiID}/lifecycle`);
        cy.wait('@revisions',{timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('equal', 200)
        PublisherComonPage.waitUntillLoadingComponentsExit();
    }
    static goToAPIDefinitionByUI(apiID){
        cy.get('#itest-api-details-api-config-acc').click();
        cy.intercept('GET', '**/swagger').as('swagger');
        cy.get('#left-menu-itemAPIdefinition').click();
        cy.wait('@swagger',{timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('equal', 200)
        PublisherComonPage.waitUntillLoadingComponentsExit();
    }
}

export default PublisherMenu;   