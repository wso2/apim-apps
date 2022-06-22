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

describe("Endpoint testing", () => {
    const { publisher, password, } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Add REST endpoints for production and sandbox endpoints with failover", () => {
        const random_number = Math.floor(Date.now() / 1000);
        const testAlias = `endpointCert`;
        const endpoint = `https://petstore.swagger.io/v2/store/inventory/${random_number}`;

        Utils.addAPI({}).then((apiId) => {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();

            // Add the prod and sandbox endpoints
            cy.get('#production-endpoint-checkbox').click();
            cy.get('#production_endpoints').focus().type(endpoint);

            //Expanding the general config section
            cy.get('#http-panel1bh-header').trigger('click');
            cy.get('#certs-add-btn').click();

            cy.get('#endpoint-certificate').click();
            cy.get(`[data-value="${endpoint}"]`).click();

            cy.get('#certificateAlias').click();
            cy.get('#certificateAlias').type(testAlias);

            // upload the cert
            cy.get('[data-testid="cert-upload-btn"]').click();
            const filepath = 'api_artifacts/sample.crt.pem';
            cy.get('input[type="file"]').attachFile(filepath);

            // Click away
            cy.get('#certificateAlias').click();

            // Save the cert
            cy.get('#upload-cert-save-btn').type(filepath);
            cy.wait(1000);

            // Save the endpoint
            cy.get('#endpoint-save-btn').click();
            cy.get('#endpoint-save-btn').then(function (el) {
                // Check the values
                cy.get('#http-panel1bh-header').trigger('click');
                cy.get('#endpoint-cert-list').contains(testAlias).should('be.visible');
            });

            cy.get('#http-panel1bh-header').click({ force: true });
            cy.get('#delete-cert-btn').click({ force: true });
            cy.get('#delete-cert-confirm-btn').click();
            cy.get('#endpoint-cert-list').contains(testAlias).should('not.exist');

            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});