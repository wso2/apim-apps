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
            cy.get('[data-testid="add-new-api-specific-policy"]', {timeout: Cypress.config().largeTimeout}).click();
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
            cy.contains('API Specific Policy Sample').trigger('mouseover');
            cy.get('[aria-label="view-APISpecificPolicySample"]').click({force:true});

            // Download file
            cy.get('[data-testid="download-policy-file"]').click();
            cy.get('[data-testid="done-view-policy-file"]').click();

            cy.logoutFromPublisher();

        });
    });
    afterEach(function () {
        //Delete API
        Utils.deleteAPI(apiTestId);
    })

})
