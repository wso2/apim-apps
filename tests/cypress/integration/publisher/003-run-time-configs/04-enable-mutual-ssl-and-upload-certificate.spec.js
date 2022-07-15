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

describe("Runtime configuration", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Enable mutual ssl and upload cert", () => {
        const random_number = Math.floor(Date.now() / 1000);
        const alias = `alias${random_number}`;
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemRuntimeConfigurations').click();
            cy.get('h4').contains('Transport Level Security').click();
            cy.get('#mutual-ssl-checkbox').click();

            // uploading the cert
            cy.get('#certs-add-btn').click();
            cy.get('#mui-component-select-policies').click();
            cy.get('#Bronze').click();
            cy.get('#certificateAlias').click().type(alias);

            // upload the cert
            const filepath = 'api_artifacts/sample.crt.pem';
            cy.get('input[type="file"]').attachFile(filepath);

            // Click away
            cy.get('#upload-cert-save-btn').click();
            cy.get('#upload-cert-save-btn').then(() => {
                cy.get('#save-runtime-configurations').click();
            })
            cy.get('#save-runtime-configurations').get(() => {
                cy.get('h4').contains('Transport Level Security').click();
                cy.get('#mutual-ssl-checkbox').should('be.checked');
                cy.get('#endpoint-cert-list').contains(alias).should('be.visible');
                // Test is done. Now delete the api
                Utils.deleteAPI(apiId);
            })
        });
    });
});