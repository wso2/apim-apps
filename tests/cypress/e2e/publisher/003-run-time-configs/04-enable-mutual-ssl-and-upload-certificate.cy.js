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
        const alias1 = `alias1${random_number}`;
        const alias2 = `alias2${random_number}`;
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemRuntimeConfigurations').click();
            cy.contains('h4', 'Transport Level Security').click();
            cy.get('#mutual-ssl-checkbox').click();

            // uploading the production cert
            cy.get('#certs-add-btn').click()
            //without clicking on production key type radio button, the default should be production
            cy.get('#itest-id-apipolicies-input').parent().click()
            cy.get('#Bronze').click();
            cy.get('#certificateAlias').click().type(alias1);

            // upload the cert
            const filepath = 'api_artifacts/sample.crt.pem';
            cy.get('input[type="file"]').attachFile(filepath);
            cy.wait(5000)
            // Click away
            cy.get('#upload-cert-save-btn').click();

            Cypress.on('uncaught:exception', (err, runnable) => {
                return false;
            });
            
            // uploading the sandbox cert
            cy.get('#certs-add-btn').click()
            cy.get('[data-testid="radio-group-key-type"]').get('[data-testid="radio-sandbox"]').click();
            cy.get('#itest-id-apipolicies-input').parent().click()
            cy.get('#Gold').click();
            cy.get('#certificateAlias').click().type(alias2);

            // upload the cert
            cy.get('input[type="file"]').attachFile(filepath);
            cy.wait(5000)
            // Click away
            cy.get('#upload-cert-save-btn').click();

            Cypress.on('uncaught:exception', (err, runnable) => {
                return false;
            });

            cy.get('[data-testid="list-production-certs"]').get(`#production-cert-list-item-${alias1}`).contains(alias1).scrollIntoView().should('be.visible');
            cy.get('[data-testid="list-sandbox-certs"]').get(`#sandbox-cert-list-item-${alias2}`).contains(alias2).scrollIntoView().should('be.visible');

        
            cy.get('#save-runtime-configurations').click();

            cy.get('#save-runtime-configurations').get(() => {
                cy.contains('h4', 'Transport Level Security').click();
                cy.get('#mutual-ssl-checkbox').should('be.checked');
                cy.get('[data-testid="list-production-certs"]').contains(alias1).should('be.visible');
                cy.get('[data-testid="list-sandbox-certs"]').contains(alias2).should('be.visible');
                // Test is done. Now delete the api
                Utils.deleteAPI(apiId);
            })
        });
    });
});