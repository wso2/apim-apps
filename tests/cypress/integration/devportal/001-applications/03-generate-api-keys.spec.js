/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

describe("Application tests", () => {
    const appName = 'keygenapplication' + Math.floor(Date.now() / 1000);
    const appDescription = 'Key gen application description';
    const developer = 'developer';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
    })

    const checkIfKeyExists = () => {
        // Check if the key exists
        cy.get('#access-token', { timeout: 30000 });
        cy.get('#access-token').should('not.be.empty');
        cy.get('#generate-api-keys-close-btn').click();
    }
    it.only("Generate API Keys", () => {
        cy.loginToDevportal(developer, password);
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications/create?tenant=carbon.super`);

        // Filling the form
        cy.get('#application-name')
            .dblclick()
            .type(appName);
        cy.get('#application-description')
            .click()
            .type('{backspace}')
            .type(appDescription);
        cy.get('#itest-application-create-save').click();

        // Checking the app name exists in the overview page.
        cy.url().should('contain', '/overview');
        cy.get('#itest-info-bar-application-name').contains(appName).should('exist');

        // Generating keys production
        cy.get('#production-keys-apikey').click();
        // Generate with none option
        cy.get('#generate-key-btn').then(() => {
            cy.get('#generate-key-btn').click();
            cy.get('#generate-api-keys-btn').click();
        })

        checkIfKeyExists();

        // Generate with ip option
        cy.get('#api-key-restriction-ip').click();
        cy.get('#ip-address-txt').type('192.168.1.2');
        cy.get('#ip-address-add-btn').click();
        cy.get('#generate-key-btn').click();
        cy.get('#generate-api-keys-btn').click();

        checkIfKeyExists();

        cy.get('#api-key-restriction-referer').click();
        cy.get('#referer-txt').type('www.example.com/path');
        cy.get('#referer-add-btn').click();
        cy.get('#generate-key-btn').click();
        cy.get('#generate-api-keys-btn').click();

        checkIfKeyExists();
    })

    after(() => {
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications?tenant=carbon.super`);
        cy.get(`#delete-${appName}-btn`, { timeout: 30000 });
        cy.get(`#delete-${appName}-btn`).click();
        cy.get(`#itest-confirm-application-delete`).click();

        // delete developer
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(developer);
    })
})

