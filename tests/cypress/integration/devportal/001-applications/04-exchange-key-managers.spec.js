/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Developer portal smoke tests", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToDevportal(username, password)
    })
    it.only("Exchange grant UI Test", () => {
        cy.intercept("GET", "/api/am/devportal/v2/applications?sortBy=name&sortOrder=asc&limit=10&offset=0",
            {fixture: 'applicationsList.json'});
        cy.visit(`${Utils.getAppOrigin()}/devportal`);
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications`);
        cy.intercept('GET', `${Utils.getAppOrigin()}/api/am/devportal/v2/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3`, {fixture:'defaultApplication.json'});
        cy.get('table:nth-of-type(1) a[href]').contains('DefaultApplication').click();
        cy.intercept('GET', '/api/am/devportal/v2/throttling-policies/application/Unlimited', {fixtures:'throttlingPolicy.json'})
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/productionkeys/oauth`);
        cy.intercept("GET", "/api/am/devportal/v2/key-managers", {fixture:'devportalKeyManagerlisting.json'}).as('loadKeyManagers');
        cy.wait('@loadKeyManagers');
        cy.intercept('GET', `${Utils.getAppOrigin()}/api/am/devportal/v2/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/oauth-keys`, {fixture:'oauthKeys.json'});
        cy.get('#SampleExternalKM').click();
        cy.get('#exchange-token').click();
        cy.get('#responsive-dialog-title h2').should('contain','Resident Key Manager Consumer Key and Secret Not Available');
        cy.visit(`${Utils.getAppOrigin()}/devportal/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/productionkeys/oauth`);
        cy.get('#ResidentKeyManager').click();
        cy.intercept('POST',`${Utils.getAppOrigin()}/api/am/devportal/v2/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/generate-keys`, {fixture:'generatedKeys.json'});
        cy.intercept('GET', `${Utils.getAppOrigin()}/api/am/devportal/v2/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/oauth-keys`, {fixture:'updatedOauthkeys.json'});
        cy.get('#generate-keys').click();
        cy.intercept('GET', `${Utils.getAppOrigin()}/api/am/devportal/v2/applications/844ec54e-70d3-4f9b-9b48-25853e857fc3/oauth-keys`, {fixture:'updatedOauthkeys.json'});
        cy.get('#SampleExternalKM').click();
        cy.get('#exchange-token').click();
        cy.get('#curl-to-generate-access-token-btn').should('be.disabled');
        cy.get('#external-idp-token').type('eyJ4NXQiOiJNell4TW1Ga09HWXdNV0kwWldObU5EY3hOR1NNFpUQTNNV0kyTkRBelpHU');
        cy.get('#curl-to-generate-access-token-btn').should('not.be.disabled');
        cy.get('#curl-to-generate-access-token-btn').click();
        cy.get('#responsive-dialog-title h2').should('contain', 'Get CURL to Generate Access Token');
    })
})
