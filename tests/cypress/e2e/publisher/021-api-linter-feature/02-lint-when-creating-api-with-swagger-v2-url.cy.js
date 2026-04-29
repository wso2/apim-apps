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
import OpenAPIPage from "../../../support/pages/publisher/OpenAPIPage";

describe("publisher-021-02 : Lint when creating API with swagger URL", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });

    before(function () {
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
        OpenAPIPage.waitUntillLoadingComponentsExit()
    });

    it("Lint when creating API with swagger URL", () => {
        cy.visit(`${Utils.getAppOrigin()}/`+OpenAPIPage.getUrl());
        cy.wait(5000)
        // select the option from the menu item
        OpenAPIPage.openAPIURLRadioButton().click

        // provide the swagger url
        OpenAPIPage.openAPIURLTextBox().type('https://petstore.swagger.io/v2/swagger.json')
        cy.get('body').click(0, 0);
        OpenAPIPage.waitUntilGetUrlValidatedDiv(30000)
        
        // check linter results

        OpenAPIPage.linterResultDivBlock().should('be.visible');
        OpenAPIPage.errorsToggleButton().contains("6")
        OpenAPIPage.warningToggleButton().contains("46")
        
        // Verify detail warning messages is display after clik on warning toggle button
        // since tab is not working to leave from the text box click twice
        OpenAPIPage.warningToggleButton().click
        OpenAPIPage.waitUntilGetUrlValidatedDiv(30000)
        OpenAPIPage.warningToggleButton().click
        cy.contains('Operation "description" must be present and non-empty string.')
        
    });

    after(function () {
        cy.logoutFromPublisher();
        // delete user
        //cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        //cy.deleteUser(publisher);
    })
})