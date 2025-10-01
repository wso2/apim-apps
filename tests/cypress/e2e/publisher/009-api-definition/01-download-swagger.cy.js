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
const YAML = require('yamljs')

describe("Download swagger", () => {
    const { publisher, password, } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Download swagger", () => {
        Utils.addAPI({}).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemAPIdefinition').click();
            cy.get('.lines-content.monaco-editor-background div.view-lines div.view-line', {timeout: Cypress.config().largeTimeout});
            cy.wait(2000);
            cy.get('#download-definition-btn').click();

            // Downloading swagger
            const downloadsFolder = Cypress.config('downloadsFolder')
            /*
            TODO
            swagger.yaml does not get saved with the correct extension.
            */
            const downloadedFilename = `${downloadsFolder}/swagger.yaml`;
            cy.readFile(downloadedFilename).then((str) => {
                // TODO. The content is there when we test the same from the UI
                // But somehow the content coming as null here. Need to validate the content here.
                cy.log(str);
                cy.log(downloadedFilename);
                const english = YAML.parse(str)
                cy.log(english);
            })
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});