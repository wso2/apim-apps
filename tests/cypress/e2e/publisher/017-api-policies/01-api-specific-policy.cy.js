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

describe("Common Policies", () => {
    const { publisher, password, } = Utils.getUserInfo();
    let apiTestId;

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Api Specific Policy", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        Utils.addAPI({}).then((apiId) => {
            apiTestId = apiId;
            cy.visit(`/publisher/apis/${apiId}/policies`);

            // Create API Specific Policy
            cy.get('[data-testid="add-new-api-specific-policy"]', {timeout: Cypress.env('largeTimeout')}).click();
            cy.get('#name').type('API Specific Policy Sample');
            cy.get('#version').type('1');
            cy.get('input[name="description"]').type('Sample API specific policy description');
            cy.get('#fault-select-check-box').uncheck()

            // Upload policy file
            cy.get('#upload-policy-file-for-policy').then(function () {
                const filepath = `api_artifacts/samplePolicyTemplate.j2`
                cy.get('input[type="file"]').attachFile(filepath)
            });

            cy.get('#add-policy-attributes-btn').click();
            cy.get('[data-testid="add-policy-attribute-name-btn"]').type('sampleAttribute');
            cy.get('[data-testid="add-policy-attribute-display-name-btn"]').type('Sample Attribute');
            cy.get('#attribute-require-btn').click();

            // Save API specific policy
            cy.get('[data-testid="policy-create-save-btn"]').click();
            cy.wait(2000);

            // View API specific policy
            cy.get('#tabPanel-api-policies').click();
            cy.contains('API Specific Policy Sample').trigger('mouseover');
            cy.get('[aria-label="view-APISpecificPolicySample"]').click({force:true});

            // Download file
            cy.get('[data-testid="download-policy-file"]').click();
            cy.get('[aria-label="Close"]').click();

            // Drag and drop the policy to attach it
            const dataTransfer = new DataTransfer();
            cy.contains('API Specific Policy Sample', { timeout: Cypress.env('largeTimeout') }).trigger('dragstart', {
                dataTransfer
            });
            cy.get('#operation-level-tabpanel').contains('Drag and drop policies here').trigger('drop', {
                dataTransfer
            });

            // Verify the policy is attached and configure attributes
            cy.get('#sampleAttribute').type('test value for sample attribute');
            cy.get('[data-testid="policy-attached-details-save"]').click();
            cy.get('[data-testid="custom-select-save-button"]').scrollIntoView().click();

            // Verify attached policy details
            cy.get('[data-testid="drop-policy-zone-request"]')
              .get('[data-testid="attached-policy-card-APISpecificPolicySample"]')
              .click({ force: true });
            cy.get('#sampleAttribute').should('have.value', 'test value for sample attribute');
            cy.get('[data-testid="policy-attached-details-cancel"]').click();

            // delete the policy . get button with aria-label="delete attached policy"
            cy.get('[data-testid="attached-policy-card-APISpecificPolicySample"]')
              .get('[aria-label="delete attached policy"]')
              .click();
            cy.get('[data-testid="custom-select-save-button"]').scrollIntoView().click();

            // Create Version 2 of the same policy
            cy.get('[data-testid="add-new-api-specific-policy"]').click();
            cy.get('#name').type('API Specific Policy Sample');
            cy.get('#version').type('2');
            cy.get('input[name="description"]').type('Enhanced API specific policy description version 2');
            cy.get('#fault-select-check-box').uncheck()

            // Upload policy file for version 2
            cy.get('#upload-policy-file-for-policy').then(function () {
                const filepath = `api_artifacts/samplePolicyTemplate.j2`
                cy.get('input[type="file"]').attachFile(filepath)
            });

            // Add different attributes for version 2
            cy.get('#add-policy-attributes-btn').click();
            cy.get('[data-testid="add-policy-attribute-name-btn"]').type('enhancedAttribute');
            cy.get('[data-testid="add-policy-attribute-display-name-btn"]').type('Enhanced Attribute V2');
            cy.get('#attribute-require-btn').click();

            // Add second attribute for version 2
            cy.get('#add-policy-attributes-btn').click();
            cy.get('[data-testid="add-policy-attribute-name-btn"]').eq(1).type('optionalAttribute');
            cy.get('[data-testid="add-policy-attribute-display-name-btn"]').eq(1).type('Optional Attribute V2');

            // Save API specific policy version 2
            cy.get('[data-testid="policy-create-save-btn"]').click();
            cy.wait(2000);

            // View API specific policy
            cy.get('#tabPanel-api-policies').click();
            cy.contains('API Specific Policy Sample').trigger('mouseover');
            cy.get('[aria-label="view-APISpecificPolicySample"]').click({force:true});

            // Verify version 2 details
            cy.get('[data-testid="description"] input').should('have.value', 'Enhanced API specific policy description version 2');
            cy.get('[aria-label="Close"]').click();

            // Drag and drop version 2 policy
            const dataTransferV2 = new DataTransfer();
            cy.contains('API Specific Policy Sample', { timeout: Cypress.env('largeTimeout') }).trigger('dragstart', {
                dataTransfer: dataTransferV2
            });
            cy.get('#operation-level-tabpanel').contains('Drag and drop policies here').trigger('drop', {
                dataTransfer: dataTransferV2
            });

            // Configure version 2 policy attributes
            cy.contains('Enhanced API specific policy description version 2').should('be.visible');
            cy.get('#enhancedAttribute').type('enhanced test value version 2');
            cy.get('#optionalAttribute').type('optional test value');
            cy.get('[data-testid="policy-attached-details-save"]').click();
            cy.get('[data-testid="custom-select-save-button"]').scrollIntoView().click();

            // Open edit mode for version 2 and verify correct data is displayed
            cy.get('[data-testid="drop-policy-zone-request"]')
              .get('[data-testid="attached-policy-card-APISpecificPolicySample"]')
              .click({ force: true });
            cy.contains('Enhanced API specific policy description version 2').should('be.visible');
            cy.get('#enhancedAttribute').should('have.value', 'enhanced test value version 2');
            cy.get('#optionalAttribute').should('have.value', 'optional test value');
            
            // Verify policy name and version in edit mode
            cy.contains('API Specific Policy Sample : v2').should('be.visible');
            cy.get('[data-testid="policy-attached-details-cancel"]').click();

            cy.logoutFromPublisher();

        });
    });
    afterEach(function () {
        //Delete API
        Utils.deleteAPI(apiTestId);
    })

})
