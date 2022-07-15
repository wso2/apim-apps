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
/*
TODO
The product is broken. we need to fix the product. This test case is ignored from cypress.json
*/
import Utils from "@support/utils";

describe("Upload thumbnail", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToPublisher(publisher, password);
    })
    it.only("Upload thumbnail", () => {
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);

            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemDesignConfigurations').click();
            cy.get('#edit-api-thumbnail-btn').click();
            cy.get('#edit-api-thumbnail-upload').click();

            // upload the image
            const filepath = 'api_artifacts/api-pic.jpg';
            cy.get('input[type="file"]').attachFile(filepath);
            cy.get('#edit-api-thumbnail-upload-btn').click();

            // Save
            cy.get('#design-config-save-btn').click({ force: true });

            // Validate
            cy.get('[alt="API Thumbnail"]', { timeout: 30000 })
                .should('be.visible')
                .and(($img) => {
                    // "naturalWidth" and "naturalHeight" are set when the image loads
                    expect($img[0].naturalWidth).to.be.greaterThan(0)
                })
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});