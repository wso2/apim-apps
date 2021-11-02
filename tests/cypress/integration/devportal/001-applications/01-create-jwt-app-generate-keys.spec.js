/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
describe("Application tests", () => {
    const appName = 'jwtapplication';
    const appDescription = 'JWT application description';
   
    it.only("Add Applications for JWT token Type", () => {
        cy.loginToDevportal();
        cy.visit('/devportal/applications/create?tenant=carbon.super');

        // Filling the form
        cy.get('#application-name').dblclick();
        cy.get('#application-name').type(appName);
        cy.get('#application-description').click();
        cy.get('#application-description').type('{backspace}');
        cy.get('#application-description').type(appDescription);
        cy.get('[data-testid="application-save-btn"]').click();

        // Checking the app name exists in the overview page.
        cy.url().should('contain', '/overview');
        cy.get('[data-testid="application-title"]').contains(appName).should('exist');
    })

    after(() => {
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="delete-${appName}-btn"]`, {timeout: 30000});
        cy.get(`[data-testid="delete-${appName}-btn"]`).click();
        cy.get(`[data-testid="application-delete-confirm-btn"]`).click();
    })
})