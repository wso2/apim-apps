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

let genApiId;
const genApiName = Utils.generateName();
const documentName = Utils.generateName();
const documentSummary = 'api document summery';

// Documents added out of alphabetical order intentionally to verify sort fix
const howToDocs = ['C HowTo', 'A HowTo', 'B HowTo'];
const samplesDocs = ['C Sample', 'A Sample', 'B Sample'];

describe("publisher-012-01 :View generated document for rest apis", () => {
    const { publisher, password, } = Utils.getUserInfo();
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });
    before(function() {
        cy.loginToPublisher(publisher, password);
    })
    it.only("Creating inline document", () => {
        Utils.addAPIWithEndpoints({ name: genApiName }).then((apiId) => {
            genApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemdocuments').click();

            //Checking if the generated document is rendered
            cy.get('[data-testid="view-generated-document-btn"]').should('be.visible');
            cy.get('[data-testid="view-generated-document-btn"]').click();
            cy.get('h1').contains(genApiName).should('be.visible');
            cy.get('[aria-label="Close"]').click();

            cy.get('[data-testid="add-document-btn"]').click();
            cy.get('#doc-name').type(documentName);
            cy.get('#doc-summary').click();
            cy.get('#doc-summary').type(documentSummary);
            cy.get('#add-document-btn').scrollIntoView();
            cy.get('#add-document-btn').click();
            cy.get('#add-content-back-to-listing-btn').click();

            // Checking it's existence
            cy.get('table a').contains(documentName).should('be.visible');

            // Add HOWTO documents out of alphabetical order to verify sort fix
            howToDocs.forEach((name) => {
                cy.get('[data-testid="add-document-btn"]').click();
                cy.get('#doc-name').type(name);
                cy.get('#doc-summary').click();
                cy.get('#doc-summary').type('summary');
                cy.get('#add-document-btn').scrollIntoView();
                cy.get('#add-document-btn').click();
                cy.get('#add-content-back-to-listing-btn').click();
                cy.get('table a').contains(name).should('be.visible');
            });

            // Add SAMPLES documents out of alphabetical order to verify sort fix
            samplesDocs.forEach((name) => {
                cy.get('[data-testid="add-document-btn"]').click();
                cy.get('#doc-name').type(name);
                cy.get('#doc-summary').click();
                cy.get('#doc-summary').type('summary');
                cy.get('input[value="SAMPLES"]').click();
                cy.get('#add-document-btn').scrollIntoView();
                cy.get('#add-document-btn').click();
                cy.get('#add-content-back-to-listing-btn').click();
                cy.get('table a').contains(name).should('be.visible');
            });

            Utils.publishAPI(apiId);
        });
    });
    it.only("Viewing generated document in devportal and verifying alphabetical sort", () => {
        cy.intercept('GET', '**/apis/**/swagger**').as('getSwagger');
        cy.visit(`/devportal/apis/${genApiId}/documents/default?tenant=carbon.super`);
        cy.wait('@getSwagger').its('response.statusCode').should('eq', 200);
        cy.get('#apim_elements').should('be.visible');
        cy.get('#document-autocomplete').should('have.value', 'Default');
        cy.get('h1[class*="sl-text-"]').contains(genApiName).should('be.visible');

        // Open the Select Documents dropdown and verify docs are sorted alphabetically within each type group
        cy.get('#document-autocomplete').click();
        cy.get('[id^="document-autocomplete-option-"]').then(($options) => {
            const names = [...$options].map((el) => el.textContent.trim());

            const alphabeticalSort = (a, b) => {
                const caseInsensitiveDiff = a.toLowerCase().localeCompare(b.toLowerCase());
                if (caseInsensitiveDiff !== 0) return caseInsensitiveDiff;
                return b.localeCompare(a);
            };

            // Verify HOWTO docs are in alphabetical order
            const presentHowToDocs = names.filter((n) => howToDocs.includes(n));
            expect(presentHowToDocs).to.deep.equal([...presentHowToDocs].sort(alphabeticalSort));

            // Verify SAMPLES docs are in alphabetical order
            const presentSamplesDocs = names.filter((n) => samplesDocs.includes(n));
            expect(presentSamplesDocs).to.deep.equal([...presentSamplesDocs].sort(alphabeticalSort));

            // Verify HOWTO group appears before SAMPLES group
            const firstHowToIndex = names.findIndex((n) => howToDocs.includes(n));
            const firstSamplesIndex = names.findIndex((n) => samplesDocs.includes(n));
            expect(firstHowToIndex).to.be.lessThan(firstSamplesIndex);
        });

        // Test is done. Now delete the api
        cy.loginToPublisher(publisher, password);
        Utils.deleteAPI(genApiId);
    });
});
