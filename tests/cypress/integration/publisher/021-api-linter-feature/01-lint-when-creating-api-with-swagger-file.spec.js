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

describe("publisher-021-01 : Lint when creating API with swagger file", () => {
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

    it("Lint when creating API with swagger file", () => {
        cy.visit(`${Utils.getAppOrigin()}/` + OpenAPIPage.getUrl());
        cy.wait(5000)
        OpenAPIPage.waitUntillLoadingComponentsExit()
        // select the option from the menu item
        cy.wait(3000)
        OpenAPIPage.openFileSelectRadioButton().click()
        cy.wait(3000)
        // upload the swagger
        cy.intercept('GET', '**/linter-custom-rules?apiType=HTTP').as('linter-custom-rules');
        OpenAPIPage.browseToUploadButton().wait(3000).then(function () {
            const filepath = `api_artifacts/petstore_open_api_3.json`
            OpenAPIPage.fileUploadInput().wait(3000).attachFile(filepath)
        });
        cy.wait('@linter-custom-rules', { timeout: 25000 }).its('response.statusCode').should('equal', 200)

        // check linter results
        OpenAPIPage.linterResultDivBlock().should('be.visible');
        OpenAPIPage.errorsToggleButton().contains("0")
        OpenAPIPage.warningToggleButton().contains("16")

    });

    after(function () {
        cy.logoutFromPublisher();
        // delete user
        //cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        //cy.deleteUser(publisher);
    })
})