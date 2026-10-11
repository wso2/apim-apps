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

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Common Policy", () => {
        cy.visit(`/publisher/policies`);
        cy.get('[data-testid="add-new-common-policy"]').click();
        cy.get('#name').type('Common Policy Sample');
        cy.get('#version').type('1');
        cy.get('input[name="description"]').type('Sample common policy description');
        cy.get('#fault-select-check-box').uncheck()

        // Upload policy file
        cy.get('#upload-policy-file-for-policy').then(function () {
            const filepath = `api_artifacts/samplePolicyTemplate.j2`
            cy.get('input[type="file"]').attachFile(filepath)
        });

        cy.get('#add-policy-attributes-btn').click();
        cy.get('[data-testid="add-policy-attribute-name-btn"]').type('headerName');
        cy.get('[data-testid="add-policy-attribute-display-name-btn"]').type('Header Name');
        cy.get('#attribute-require-btn').click();

        // Save Common policy
        cy.get('[data-testid="policy-create-save-btn"]').click();
        cy.wait(2000);

        // View Common policy
        cy.get('[aria-label="View Common Policy Sample"]').click();

        // Download file
        cy.get('[data-testid="download-policy-file"]').click();
        cy.get('[data-testid="done-view-policy-file"]').click();

        // Delete Common Policy
        cy.get('[aria-label="Delete Common Policy Sample"]').click();
        cy.contains('Yes').click();
        
        cy.logoutFromPublisher();

    });
})
