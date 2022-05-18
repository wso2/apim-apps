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
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;
    const apiVersion = '2.0.0';
    const apiContext = `anonymous${Math.floor(Math.random() * (100000 - 1 + 1) + 1)}`;

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it("Api Specific Policy", () => {
         cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);

         //Get the api id
         cy.location('pathname').then((pathName) => {
            const pathSegments = pathName.split('/');
            const uuid = pathSegments[pathSegments.length - 2];
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/policies`);
            //Create API Specific Policy
            cy.get('[data-testid="add-new-api-specific-policy"]').click();
            cy.get('#name').type('Add Header sample test');
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
            cy.get('[aria-label="view-AddHeadersampletest"]').click();
            //Download file
            cy.get('[data-testid="download-policy-file"]').click();
                const downloadsFolder = Cypress.config('downloadsFolder')
                const downloadedFilename = `${downloadsFolder}/swagger.yaml`;
            
            cy.wait(2000);

            cy.get('[data-testid="done-view-policy-file"]').click();

            //Drag and Drop Policy
            const dataTransfer = new DataTransfer();
            cy.contains('Add Header sample test').trigger('dragstart',{
                dataTransfer
            });
            
            cy.contains('Drag and drop policies here').trigger('drop', {
            // cy.('[data-testid="drop-policy-zone-request"]').trigger('drop', {
                dataTransfer
            });
            cy.get('#headerName').type('Testing');
            cy.get('[data-testid="policy-attached-details-save"]').click();
            cy.get('[data-testid="custom-select-save-button"]').scrollIntoView().click();
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/scopes`);
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/policies`);
            cy.wait(2000);

            //Delete API
            cy.deleteApi(apiName, apiVersion);

         });
    });

    after(function () {
        //Delete User
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
        
    })
})