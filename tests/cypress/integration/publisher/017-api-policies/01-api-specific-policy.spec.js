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
            //Create API Specific Policy
            cy.get('[data-testid="add-new-api-specific-policy"]', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#name').type('Add Header sample test');
            cy.get('#version').type('1');
            cy.get('input[name="description"]').type('Sample add header policy description');
            cy.get('#fault-select-check-box').uncheck()

            //upload the policy file
            cy.get('#upload-policy-file-for-policy').then(function () {
                const filepath = `api_artifacts/sampleAddHeader.j2`
                cy.get('input[type="file"]').attachFile(filepath)
            });

            cy.get('#add-policy-attributes-btn').click();
            cy.get('[data-testid="add-policy-attribute-name-btn"]').type('headerName');
            cy.get('[data-testid="add-policy-attribute-display-name-btn"]').type('Header Name');
            cy.get('#attribute-require-btn').click();
            //save common policy
            cy.get('[data-testid="policy-create-save-btn"]').click();
            cy.wait(2000);

            //View API Specific Policy
            cy.contains('Add Header sample test').trigger('mouseover');
            cy.get('[aria-label="view-AddHeadersampletest"]').click({force:true});
            //Download file
            cy.get('[data-testid="download-policy-file"]').click();
            cy.wait(2000);
            cy.get('[data-testid="done-view-policy-file"]').click();

            //Drag and Drop Policy
            const dataTransfer = new DataTransfer();
            cy.contains('Add Header sample test').trigger('dragstart', {
                dataTransfer
            });

            cy.contains('Drag and drop policies here').trigger('drop', {
                // cy.('[data-testid="drop-policy-zone-request"]').trigger('drop', {
                dataTransfer
            });
            cy.get('#headerName').type('Testing');
            cy.get('[data-testid="policy-attached-details-save"]').click();
            cy.get('[data-testid="custom-select-save-button"]').scrollIntoView().click();
            cy.visit(`/publisher/apis/${apiId}/scopes`);
            cy.visit(`/publisher/apis/${apiId}/policies`);
            cy.wait(2000);

        });
    });
    afterEach(function () {
        //Delete API
        Utils.deleteAPI(apiTestId);
    })

})