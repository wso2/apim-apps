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
    const regrex = '^([a-zA-Z\\d_][a-zA-Z\\d_\\-\\ ]*)$'

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it("Common Policy", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/policies`);
        cy.get('[data-testid="add-new-common-policy"]').click();
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

        //View Common policy
        cy.get('[aria-label="View Add Header sample test"]').click();
        //Download file
        cy.get('[data-testid="download-policy-file"]').click();
        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/swagger.yaml`;

        cy.get('[data-testid="done-view-policy-file"]').click();

        //Delete Common Policy
        cy.get('[aria-label="Delete Add Header sample test"]').click();
        cy.contains('Yes').click();
        
        cy.logoutFromPublisher();

    });

    after(function () {
        //Delete User
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
})