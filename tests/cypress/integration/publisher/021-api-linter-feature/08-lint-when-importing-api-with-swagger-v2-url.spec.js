/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import APIDefinitionPage from "../../../support/pages/publisher/APIDefinitionPage";
import PublisherMenu from "../../../support/functions/publisher/PublisherMenu";
describe("publisher-021-08 : Lint when importing API with swagger v2 URL", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });
    before(function () {
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
        APIDefinitionPage.waitUntillLoadingComponentsExit()
    })

    it.only("Lint when importing API with swagger v2 URL", () => {
        cy.createAPIByRestAPIDesignAndSearch(apiName, apiVersion);
        cy.wait(3000)
        PublisherMenu.goToAPIDefinitionByUI()

        APIDefinitionPage.importDefinitionButton().click()
        cy.wait(2000)
        // select the option from the menu item
        APIDefinitionPage.openAPIURLRadioButton().click()
        cy.wait(2000)
        // // provide the swagger url
        APIDefinitionPage.openAPIURLTextBox().type('https://petstore.swagger.io/v2/swagger.json')
        cy.get('body').click(0, 0);
        APIDefinitionPage.waitUntilGetUrlValidatedDiv(30000)
        APIDefinitionPage.linterResultDivBlock().should('be.visible');
       // TODO : click on errors, warnings toggle buttons and verify it loads, currently there is an issue on this

    });

    after(function () {
        
        // Test is done. Now delete the api
        cy.searchAndDeleteApi(apiName, apiVersion);
        cy.logoutFromPublisher();

        //cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        //cy.deleteUser(publisher);
    })
});